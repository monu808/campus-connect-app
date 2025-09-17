import { firestore, functions, getFirestoreService } from '../firebase';
import { AuthService } from './AuthService';
import { withFirestoreRetry } from '../utils/firestoreRetry';
import { 
  CAMPUS_BADGES, 
  LEVEL_REQUIREMENTS, 
  LEVEL_TITLES,
  calculateLevel,
  getXPForNextLevel,
  getLevelProgress 
} from '../config/achievements';

// Badge reveal popup callbacks
let badgeRevealCallbacks = [];

export const GamificationService = {
  // Badge reveal popup management
  registerBadgeRevealCallback: (callback) => {
    badgeRevealCallbacks.push(callback);
    return () => {
      badgeRevealCallbacks = badgeRevealCallbacks.filter(cb => cb !== callback);
    };
  },

  triggerBadgeReveal: (badge) => {
    badgeRevealCallbacks.forEach(callback => {
      try {
        callback(badge);
      } catch (error) {
        console.error('Error in badge reveal callback:', error);
      }
    });
  },

  // Initialize user gamification data
  initializeUserData: async (userId) => {
    return withFirestoreRetry(async () => {
      const firestoreService = await getFirestoreService();
      const userRef = firestoreService.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists || !userDoc.data().gamification) {
        await userRef.set({
          gamification: {
            xpPoints: 0,
            badges: [],
            level: 1,
            streaks: {
              login: { current: 0, best: 0, lastLogin: null },
              events: { current: 0, best: 0, lastEvent: null },
              study: { current: 0, best: 0, lastStudy: null }
            },
            stats: {
              groupsJoined: 0,
              groupsCreated: 0,
              eventsAttended: 0,
              eventsOrganized: 0,
              connectionsTotal: 0,
              totalActivities: 0,
              profileCompletion: 0
            },
            challenges: {
              daily: [],
              weekly: [],
              completed: []
            },
            createdAt: firestore.FieldValue.serverTimestamp(),
            updatedAt: firestore.FieldValue.serverTimestamp()
          }
        }, { merge: true });
      }
    }, 3, 'initializeUserData');
  },

  // Get user gamification data
  getUserData: async (userId = null) => {
    return withFirestoreRetry(async () => {
      const uid = userId || AuthService.getCurrentUser().uid;
      await GamificationService.initializeUserData(uid);
      
      const firestoreService = await getFirestoreService();
      const userDoc = await firestoreService.collection('users').doc(uid).get();
      const userData = userDoc.data();
      
      if (!userData || !userData.gamification) {
        return {
          xpPoints: 0,
          level: 1,
          levelTitle: LEVEL_TITLES[1],
          badges: [],
          streaks: { login: { current: 0, best: 0 } },
          stats: {},
          nextLevelXP: getXPForNextLevel(0),
          levelProgress: getLevelProgress(0)
        };
      }

      const gamification = userData.gamification;
      const currentLevel = calculateLevel(gamification.xpPoints);
      
      return {
        ...gamification,
        level: currentLevel,
        levelTitle: LEVEL_TITLES[currentLevel] || `Level ${currentLevel}`,
        nextLevelXP: getXPForNextLevel(gamification.xpPoints),
        levelProgress: getLevelProgress(gamification.xpPoints)
      };
    }, 3, 'getUserData');
  },

  // Award XP and check for achievements
  awardXP: async (amount, reason, activity = null) => {
    return withFirestoreRetry(async () => {
      const userId = AuthService.getCurrentUser().uid;
      await GamificationService.initializeUserData(userId);
      
      const firestoreService = await getFirestoreService();
      const userRef = firestoreService.collection('users').doc(userId);
      
      // Get current data
      const userDoc = await userRef.get();
      const userData = userDoc.data();
      const currentXP = userData.gamification?.xpPoints || 0;
      const oldLevel = calculateLevel(currentXP);
      const newXP = currentXP + amount;
      const newLevel = calculateLevel(newXP);
      
      // Update XP
      await userRef.update({
        'gamification.xpPoints': newXP,
        'gamification.updatedAt': firestore.FieldValue.serverTimestamp()
      });
      
      // Update activity stats if provided
      if (activity) {
        await GamificationService.updateStats(activity);
      }
      
      // Create XP notification
      await userRef.collection('notifications').add({
        type: 'xp_earned',
        title: 'XP Earned!',
        body: `You earned ${amount} XP for: ${reason}`,
        data: { xp: amount, reason },
        isRead: false,
        createdAt: firestore.FieldValue.serverTimestamp()
      });
      
      // Check for level up
      if (newLevel > oldLevel) {
        await GamificationService.handleLevelUp(newLevel, oldLevel);
      }
      
      // Check for badge achievements
      await GamificationService.checkAchievements(userId);
      
      return { 
        success: true, 
        newXP, 
        newLevel, 
        leveledUp: newLevel > oldLevel,
        levelTitle: LEVEL_TITLES[newLevel] 
      };
    }, 3, 'awardXP');
  },

  // Update user activity statistics
  updateStats: async (activity) => {
    return withFirestoreRetry(async () => {
      const userId = AuthService.getCurrentUser().uid;
      const firestoreService = await getFirestoreService();
      const userRef = firestoreService.collection('users').doc(userId);
      
      const updateData = {};
      
      switch (activity.type) {
        case 'join_group':
          updateData['gamification.stats.groupsJoined'] = firestore.FieldValue.increment(1);
          updateData['gamification.stats.totalActivities'] = firestore.FieldValue.increment(1);
          break;
        case 'create_group':
          updateData['gamification.stats.groupsCreated'] = firestore.FieldValue.increment(1);
          updateData['gamification.stats.totalActivities'] = firestore.FieldValue.increment(1);
          break;
        case 'attend_event':
          updateData['gamification.stats.eventsAttended'] = firestore.FieldValue.increment(1);
          updateData['gamification.stats.totalActivities'] = firestore.FieldValue.increment(1);
          break;
        case 'organize_event':
          updateData['gamification.stats.eventsOrganized'] = firestore.FieldValue.increment(1);
          updateData['gamification.stats.totalActivities'] = firestore.FieldValue.increment(1);
          break;
        case 'make_connection':
          updateData['gamification.stats.connectionsTotal'] = firestore.FieldValue.increment(1);
          updateData['gamification.stats.totalActivities'] = firestore.FieldValue.increment(1);
          break;
        case 'profile_update':
          updateData['gamification.stats.profileCompletion'] = activity.completionPercentage || 0;
          break;
      }
      
      if (Object.keys(updateData).length > 0) {
        updateData['gamification.updatedAt'] = firestore.FieldValue.serverTimestamp();
        await userRef.update(updateData);
      }
    }, 3, 'updateStats');
  },

  // Handle level up rewards and notifications
  handleLevelUp: async (newLevel, oldLevel) => {
    return withFirestoreRetry(async () => {
      const userId = AuthService.getCurrentUser().uid;
      const firestoreService = await getFirestoreService();
      const userRef = firestoreService.collection('users').doc(userId);
      
      // Award level milestone badge if exists
      const levelBadge = Object.values(CAMPUS_BADGES).find(
        badge => badge.criteria.type === 'reach_level' && badge.criteria.level === newLevel
      );
      
      if (levelBadge) {
        await GamificationService.awardBadge(levelBadge.id);
      }
      
      // Create level up notification
      await userRef.collection('notifications').add({
        type: 'level_up',
        title: 'Level Up!',
        body: `Congratulations! You've reached level ${newLevel}: ${LEVEL_TITLES[newLevel]}`,
        data: { newLevel, oldLevel, levelTitle: LEVEL_TITLES[newLevel] },
        isRead: false,
        createdAt: firestore.FieldValue.serverTimestamp()
      });
      
    }, 3, 'handleLevelUp');
  },

  // Award badge to user
  awardBadge: async (badgeId) => {
    return withFirestoreRetry(async () => {
      const userId = AuthService.getCurrentUser().uid;
      const firestoreService = await getFirestoreService();
      const userRef = firestoreService.collection('users').doc(userId);
      
      // Check if user already has this badge
      const userDoc = await userRef.get();
      const userData = userDoc.data();
      const badges = userData.gamification?.badges || [];
      
      if (badges.some(badge => badge.id === badgeId)) {
        return { success: false, message: 'Badge already earned' };
      }
      
      const badgeData = CAMPUS_BADGES[badgeId.toUpperCase()];
      if (!badgeData) {
        return { success: false, message: 'Invalid badge ID' };
      }
      
      // Award the badge
      const newBadge = {
        id: badgeId,
        name: badgeData.name,
        description: badgeData.description,
        category: badgeData.category,
        rarity: badgeData.rarity,
        earnedAt: new Date(),
        xpReward: badgeData.xpReward
      };
      
      await userRef.update({
        'gamification.badges': firestore.FieldValue.arrayUnion(newBadge),
        'gamification.updatedAt': firestore.FieldValue.serverTimestamp()
      });
      
      // Award XP for the badge (but don't create activity to avoid recursion)
      if (badgeData.xpReward > 0) {
        await userRef.update({
          'gamification.xpPoints': firestore.FieldValue.increment(badgeData.xpReward)
        });
      }
      
      // Create badge notification
      await userRef.collection('notifications').add({
        type: 'badge_earned',
        title: 'Badge Earned!',
        body: `You've earned the "${badgeData.name}" badge!`,
        data: { 
          badge: newBadge,
          xpReward: badgeData.xpReward 
        },
        isRead: false,
        createdAt: firestore.FieldValue.serverTimestamp()
      });

      // Trigger badge reveal popup
      GamificationService.triggerBadgeReveal(newBadge);
      
      return { success: true, badge: newBadge };
    }, 3, 'awardBadge');
  },

  // Check all achievements for a user
  checkAchievements: async (userId) => {
    return withFirestoreRetry(async () => {
      const userData = await GamificationService.getUserData(userId);
      const stats = userData.stats || {};
      const badges = userData.badges || [];
      const earnedBadgeIds = badges.map(badge => badge.id);
      
      const newBadges = [];
      
      // Check each badge criteria
      for (const [badgeKey, badge] of Object.entries(CAMPUS_BADGES)) {
        const badgeId = badge.id;
        
        // Skip if already earned
        if (earnedBadgeIds.includes(badgeId)) continue;
        
        let criteriaMap = false;
        
        switch (badge.criteria.type) {
          case 'join_group':
            criteriaMap = stats.groupsJoined >= badge.criteria.count;
            break;
          case 'create_group':
            criteriaMap = stats.groupsCreated >= badge.criteria.count;
            break;
          case 'attend_event':
            criteriaMap = stats.eventsAttended >= badge.criteria.count;
            break;
          case 'organize_event':
            criteriaMap = stats.eventsOrganized >= badge.criteria.count;
            break;
          case 'make_connection':
            criteriaMap = stats.connectionsTotal >= badge.criteria.count;
            break;
          case 'total_activities':
            criteriaMap = stats.totalActivities >= badge.criteria.count;
            break;
          case 'profile_completion':
            criteriaMap = stats.profileCompletion >= badge.criteria.percentage;
            break;
          case 'reach_level':
            criteriaMap = userData.level >= badge.criteria.level;
            break;
        }
        
        if (criteriaMap) {
          const result = await GamificationService.awardBadge(badgeId);
          if (result.success) {
            newBadges.push(result.badge);
          }
        }
      }
      
      return { newBadges };
    }, 3, 'checkAchievements');
  },

  // Get leaderboard
  getLeaderboard: async (category = 'xp', limit = 50) => {
    return withFirestoreRetry(async () => {
      const firestoreService = await getFirestoreService();
      
      let orderField = 'gamification.xpPoints';
      
      switch (category) {
        case 'level':
          orderField = 'gamification.level';
          break;
        case 'events':
          orderField = 'gamification.stats.eventsAttended';
          break;
        case 'groups':
          orderField = 'gamification.stats.groupsJoined';
          break;
        case 'connections':
          orderField = 'gamification.stats.connectionsTotal';
          break;
      }
      
      const querySnapshot = await firestoreService
        .collection('users')
        .orderBy(orderField, 'desc')
        .limit(limit)
        .get();
      
      const leaderboard = [];
      querySnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        const gamification = data.gamification || {};
        
        leaderboard.push({
          userId: doc.id,
          rank: index + 1,
          displayName: data.displayName || 'Anonymous',
          photoURL: data.photoURL || null,
          xp: gamification.xpPoints || 0,
          level: calculateLevel(gamification.xpPoints || 0),
          levelTitle: LEVEL_TITLES[calculateLevel(gamification.xpPoints || 0)],
          stats: gamification.stats || {},
          badgeCount: (gamification.badges || []).length
        });
      });
      
      return leaderboard;
    }, 3, 'getLeaderboard');
  },

  // Get daily/weekly challenges based on user activity
  getDailyChallenges: async () => {
    return withFirestoreRetry(async () => {
      const userId = AuthService.getCurrentUser().uid;
      const userData = await GamificationService.getUserData(userId);
      
      // Generate daily challenges based on user's current progress
      const challenges = [
        {
          id: 'daily_join_group',
          title: 'Join a Study Group',
          description: 'Join or participate in a study group today',
          xpReward: 50,
          progress: 0,
          target: 1,
          type: 'join_group'
        },
        {
          id: 'daily_attend_event',
          title: 'Attend Campus Event',
          description: 'Participate in a campus event or activity',
          xpReward: 75,
          progress: 0,
          target: 1,
          type: 'attend_event'
        },
        {
          id: 'daily_make_connection',
          title: 'Make New Connection',
          description: 'Connect with a fellow student',
          xpReward: 25,
          progress: 0,
          target: 1,
          type: 'make_connection'
        }
      ];
      
      return challenges;
    }, 3, 'getDailyChallenges');
  },

  // Update user streaks
  updateStreak: async (type, date = new Date()) => {
    return withFirestoreRetry(async () => {
      const userId = AuthService.getCurrentUser().uid;
      const firestoreService = await getFirestoreService();
      const userRef = firestoreService.collection('users').doc(userId);
      
      const userData = await GamificationService.getUserData(userId);
      const streaks = userData.streaks || {};
      const currentStreak = streaks[type] || { current: 0, best: 0, lastDate: null };
      
      const today = date.toDateString();
      const lastDate = currentStreak.lastDate ? new Date(currentStreak.lastDate).toDateString() : null;
      
      let newCurrent = currentStreak.current;
      
      if (lastDate === today) {
        // Same day, no change
        return { streak: newCurrent };
      } else if (lastDate === new Date(Date.now() - 86400000).toDateString()) {
        // Consecutive day
        newCurrent += 1;
      } else {
        // Streak broken, start new
        newCurrent = 1;
      }
      
      const newBest = Math.max(currentStreak.best, newCurrent);
      
      await userRef.update({
        [`gamification.streaks.${type}`]: {
          current: newCurrent,
          best: newBest,
          lastDate: date
        },
        'gamification.updatedAt': firestore.FieldValue.serverTimestamp()
      });
      
      // Award XP for streak milestones
      if (newCurrent % 7 === 0) { // Weekly streak
        await GamificationService.awardXP(
          100, 
          `${newCurrent} day ${type} streak!`,
          null
        );
      }
      
      return { streak: newCurrent, best: newBest };
    }, 3, 'updateStreak');
  },

  // Complete a daily challenge
  completeChallenge: async (challengeId) => {
    return withFirestoreRetry(async () => {
      const userId = AuthService.getCurrentUser().uid;
      const firestoreService = await getFirestoreService();
      const userRef = firestoreService.collection('users').doc(userId);
      
      // Get current challenges
      const challenges = await GamificationService.getDailyChallenges();
      const challenge = challenges.find(c => c.id === challengeId);
      
      if (!challenge) {
        return { success: false, message: 'Challenge not found' };
      }
      
      // Award XP for completing the challenge
      await GamificationService.awardXP(
        challenge.xpReward,
        `Completed challenge: ${challenge.title}`,
        { type: challenge.type }
      );
      
      // Mark challenge as completed for today
      const today = new Date().toDateString();
      await userRef.update({
        [`gamification.challenges.completed`]: firestore.FieldValue.arrayUnion({
          challengeId,
          completedAt: today,
          xpAwarded: challenge.xpReward
        }),
        'gamification.updatedAt': firestore.FieldValue.serverTimestamp()
      });
      
      return { success: true, xpAwarded: challenge.xpReward };
    }, 3, 'completeChallenge');
  }
};

export default GamificationService;