import { firestore, functions } from '../firebase';
import { AuthService } from './AuthService';
import { withFirestoreRetry } from '../utils/firestoreRetry';

export const GamificationService = {
  // Initialize user gamification data
  initializeUserData: async (userId) => {
    const userRef = firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists || !userDoc.data().xpPoints) {
      await userRef.set({
        xpPoints: 0,
        badges: [],
        level: 1,
        createdAt: firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }
  },

  // Get user XP
  getUserXP: async (userId = null) => {
    return withFirestoreRetry(async () => {
      // If userId is not provided, use current user
      const uid = userId || AuthService.getCurrentUser().uid;
      
      // Initialize user data if needed
      await GamificationService.initializeUserData(uid);
      
      const userDoc = await firestore().collection('users').doc(uid).get();
      return userDoc.data()?.xpPoints || 0;
    }, 3, 'getUserXP');
  },

  // Award XP to current user
  awardXP: async (amount, reason) => {
    return withFirestoreRetry(async () => {
      const userId = AuthService.getCurrentUser().uid;
      
      // Initialize user data if needed
      await GamificationService.initializeUserData(userId);
      
      // Update XP in Firestore
      await firestore().collection('users').doc(userId).update({
        xpPoints: firestore.FieldValue.increment(amount)
      });
      
      // Create XP notification
      await firestore()
        .collection('users')
        .doc(userId)
        .collection('notifications')
        .add({
          type: 'achievement',
          title: 'XP Earned',
          body: `You earned ${amount} XP for: ${reason}`,
          data: { xp: amount, reason },
          isRead: false,
          createdAt: firestore.FieldValue.serverTimestamp()
        });
      
      // Check for level up
      const userDoc = await firestore().collection('users').doc(userId).get();
      const userData = userDoc.data();
      const oldLevel = Math.floor((userData.xpPoints - amount) / 100) + 1;
      const newLevel = Math.floor(userData.xpPoints / 100) + 1;
      
      if (newLevel > oldLevel) {
        // User leveled up, award badge
        await GamificationService.awardBadge(`level_${newLevel}`, `Reached Level ${newLevel}`);
      }
      
      return { success: true, newXP: userData.xpPoints };
    }, 3, 'awardXP');
  },
  
  // Get user badges
  getBadges: async (userId = null) => {
    return withFirestoreRetry(async () => {
      // If userId is not provided, use current user
      const uid = userId || AuthService.getCurrentUser().uid;
      
      // Initialize user data if needed
      await GamificationService.initializeUserData(uid);
      
      const userDoc = await firestore().collection('users').doc(uid).get();
      return userDoc.data()?.badges || [];
    }, 3, 'getBadges');
  },
  
  // Award badge to current user
  awardBadge: async (badgeId, badgeName) => {
    return withFirestoreRetry(async () => {
      const userId = AuthService.getCurrentUser().uid;
      
      // Check if user already has this badge
      const userDoc = await firestore().collection('users').doc(userId).get();
      const userData = userDoc.data();
      const badges = userData.badges || [];
      
      if (badges.includes(badgeId)) {
        return { success: true, alreadyAwarded: true };
      }
      
      // Add badge to user's collection
      await firestore().collection('users').doc(userId).update({
        badges: firestore.FieldValue.arrayUnion(badgeId)
      });
      
      // Create badge notification
      await firestore()
        .collection('users')
        .doc(userId)
        .collection('notifications')
        .add({
          type: 'achievement',
          title: 'New Badge!',
          body: `You earned the ${badgeName} badge!`,
          data: { badge: badgeId },
          isRead: false,
          createdAt: firestore.FieldValue.serverTimestamp()
        });
      
      return { success: true, alreadyAwarded: false };
    }, 3, 'awardBadge');
  },
  
  // Get leaderboard
  getLeaderboard: async (timeframe = 'weekly', scope = 'college') => {
    return withFirestoreRetry(async () => {
      const userId = AuthService.getCurrentUser().uid;
      
      // Initialize user data if needed
      await GamificationService.initializeUserData(userId);
      
      try {
        // Query for users based on scope
        let usersQuery = firestore().collection('users');
        
        if (scope === 'friends') {
          // Get user's friends
          const friendsDoc = await firestore()
            .collection('users')
            .doc(userId)
            .collection('friends')
            .get();
          
          const friendIds = friendsDoc.docs.map(doc => doc.id);
          if (friendIds.length === 0) {
            return { leaderboard: [], userRank: 0 };
          }
          
          usersQuery = usersQuery.where(firestore.FieldPath.documentId(), 'in', friendIds);
        }
        
        // Add timeframe filter if needed
        if (timeframe === 'weekly' || timeframe === 'monthly') {
          const startDate = new Date();
          if (timeframe === 'weekly') {
            startDate.setDate(startDate.getDate() - 7);
          } else {
            startDate.setMonth(startDate.getMonth() - 1);
          }
          
          usersQuery = usersQuery.where('createdAt', '>=', startDate);
        }
        
        // Get all users ordered by XP
        const snapshot = await usersQuery
          .orderBy('xpPoints', 'desc')
          .limit(100)
          .get();
        
        if (snapshot.empty) {
          return { leaderboard: [], userRank: 0 };
        }
        
        const leaderboard = [];
        let userRank = 0;
        let foundUser = false;
        
        snapshot.forEach((doc, index) => {
          const userData = doc.data();
          const entry = {
            userId: doc.id,
            displayName: userData.displayName || 'Anonymous',
            photoURL: userData.photoURL,
            xpPoints: userData.xpPoints || 0,
            branch: userData.branch,
          };
          
          leaderboard.push(entry);
          
          if (doc.id === userId) {
            userRank = index + 1;
            foundUser = true;
          }
        });
        
        // If user not in top 100, find their rank
        if (!foundUser) {
          const higherRankSnapshot = await usersQuery
            .where('xpPoints', '>', userDoc.data().xpPoints)
            .get();
          
          userRank = higherRankSnapshot.size + 1;
        }
        
        return { leaderboard, userRank };
      } catch (error) {
        console.error('getLeaderboard Error:', error);
        throw error;
      }
    }, 3, 'getLeaderboard');
  },
  
  // Get user challenges
  getChallenges: async () => {
    return withFirestoreRetry(async () => {
      const userId = AuthService.getCurrentUser().uid;
      
      // Get user data for progress tracking
      const userDoc = await firestore().collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      // Get all available challenges
      const challengesSnapshot = await firestore()
        .collection('challenges')
        .where('isActive', '==', true)
        .get();
      
      const challenges = [];
      
      for (const doc of challengesSnapshot.docs) {
        const challengeData = doc.data();
        
        // Calculate progress based on challenge type
        let progress = 0;
        
        switch (challengeData.type) {
          case 'matches':
            // Count user's matches
            const matchesSnapshot = await firestore()
              .collection('matches')
              .where('users', 'array-contains', userId)
              .where('status', '==', 'accepted')
              .get();
            progress = matchesSnapshot.size;
            break;
            
          case 'groups':
            // Count user's groups
            const groupsSnapshot = await firestore()
              .collection('groups')
              .where('members', 'array-contains', { userId, role: 'member' })
              .get();
            progress = groupsSnapshot.size;
            break;
            
          case 'profile':
            // Calculate profile completion percentage
            const profileFields = ['displayName', 'photoURL', 'branch', 'year', 'bio', 'skills', 'interests'];
            const completedFields = profileFields.filter(field => {
              const value = userData[field];
              return value && (Array.isArray(value) ? value.length > 0 : true);
            });
            progress = completedFields.length;
            break;
            
          default:
            progress = 0;
        }
        
        challenges.push({
          id: doc.id,
          title: challengeData.title,
          description: challengeData.description,
          reward: `${challengeData.xpReward} XP`,
          progress,
          total: challengeData.target
        });
      }
      
      return challenges;
    }, 5, 'getChallenges');
  },
  
  // Complete a challenge
  completeChallenge: async (challengeId) => {
    return withFirestoreRetry(async () => {
      const userId = AuthService.getCurrentUser().uid;
      
      // Get challenge data
      const challengeDoc = await firestore().collection('challenges').doc(challengeId).get();
      const challengeData = challengeDoc.data();
      
      // Award XP
      await GamificationService.awardXP(
        challengeData.xpReward,
        `Completed challenge: ${challengeData.title}`
      );
      
      // Award badge if applicable
      if (challengeData.badgeReward) {
        await GamificationService.awardBadge(
          challengeData.badgeReward,
          challengeData.badgeName
        );
      }
      
      // Record challenge completion
      await firestore()
        .collection('users')
        .doc(userId)
        .collection('completedChallenges')
        .doc(challengeId)
        .set({
          completedAt: firestore.FieldValue.serverTimestamp(),
          xpAwarded: challengeData.xpReward,
          badgeAwarded: challengeData.badgeReward || null
        });
      
      return { success: true };
    }, 3, 'completeChallenge');
  },
  
  // Check for completed challenges
  checkChallengeCompletion: async () => {
    return withFirestoreRetry(async () => {
      const userId = AuthService.getCurrentUser().uid;
      
      // Get user challenges
      const challenges = await GamificationService.getChallenges();
      
      // Check for completed challenges
      const completedChallenges = [];
      
      for (const challenge of challenges) {
        if (challenge.progress >= challenge.total) {
          // Check if already completed
          const completedDoc = await firestore()
            .collection('users')
            .doc(userId)
            .collection('completedChallenges')
            .doc(challenge.id)
            .get();
          
          if (!completedDoc.exists) {
            // Complete the challenge
            await GamificationService.completeChallenge(challenge.id);
            completedChallenges.push(challenge);
          }
        }
      }
      
      return completedChallenges;
    }, 5, 'checkChallengeCompletion');
  }
};

export default GamificationService;
