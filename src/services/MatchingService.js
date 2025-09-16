import { auth, firestore, functions } from '../firebase';
import { withFirestoreRetry } from '../utils/firestoreRetry';

export const MatchingService = {
  // Get recommended users based on skills and interests
  getRecommendedUsers: async (filters = {}) => {
    return withFirestoreRetry(async () => {
      try {
        const generateMatches = functions().httpsCallable('generateMatches');
        const result = await generateMatches(filters);
        return result.data.matches;
      } catch (err) {
        // Fallback to Firestore query if CF is not deployed or returns NOT_FOUND
        const userId = auth().currentUser?.uid;
        if (!userId) throw err;
        const meDoc = await firestore().collection('users').doc(userId).get();
        const me = meDoc.data() || {};
        // Start with a broad query, prefer same college when available
        let baseQ = firestore().collection('users');
        if (me.college) {
          baseQ = baseQ.where('college', '==', me.college);
        }
        let snap = await baseQ.limit(50).get();

        // If nothing found (e.g., no peers in same college), try without college filter
        if (snap.empty && me.college) {
          snap = await firestore().collection('users').limit(50).get();
        }

        // Map and filter out self; optionally sort by simple overlap heuristic
        const candidates = snap.docs
          .filter((d) => d.id !== userId)
          .map((d) => {
            const data = d.data() || {};
            const skills = Array.isArray(data.skills) ? data.skills : [];
            const mySkills = Array.isArray(me.skills) ? me.skills : [];
            const overlap = mySkills.filter((s) => skills.includes(s)).length;
            return {
              id: d.id,
              userId: d.id,
              displayName: data.displayName,
              photoURL: data.photoURL,
              branch: data.branch,
              year: data.year,
              skills,
              bio: data.bio || '',
              score: overlap,
            };
          })
          .sort((a, b) => (b.score || 0) - (a.score || 0));

        // Filter out users who have already been matched or rejected
        const filteredCandidates = await MatchingService.filterProcessedUsers(candidates, userId);
        return filteredCandidates.slice(0, 25);
      }
    }, 3, 'getRecommendedUsers');
  },

  // Helper function to filter out users who have already been processed
  filterProcessedUsers: async (candidates, userId) => {
    try {
      // Get all existing matches
      const matchesQuery1 = await firestore()
        .collection('matches')
        .where('user1Id', '==', userId)
        .get();
      
      const matchesQuery2 = await firestore()
        .collection('matches')
        .where('user2Id', '==', userId)
        .get();

      // Get all rejections
      const rejectionsQuery1 = await firestore()
        .collection('rejections')
        .where('user1Id', '==', userId)
        .get();
      
      const rejectionsQuery2 = await firestore()
        .collection('rejections')
        .where('user2Id', '==', userId)
        .get();

      // Collect all processed user IDs
      const processedUserIds = new Set();
      
      matchesQuery1.docs.forEach(doc => {
        const data = doc.data();
        processedUserIds.add(data.user2Id);
      });
      
      matchesQuery2.docs.forEach(doc => {
        const data = doc.data();
        processedUserIds.add(data.user1Id);
      });
      
      rejectionsQuery1.docs.forEach(doc => {
        const data = doc.data();
        processedUserIds.add(data.user2Id);
      });
      
      rejectionsQuery2.docs.forEach(doc => {
        const data = doc.data();
        processedUserIds.add(data.user1Id);
      });

      // Filter out processed users
      return candidates.filter(candidate => !processedUserIds.has(candidate.id));
    } catch (error) {
      console.error('Error filtering processed users:', error);
      return candidates; // Return all candidates if filtering fails
    }
  },
  
  // Swipe right (interested) on a user
  swipeRight: async (targetUserId) => {
    return withFirestoreRetry(async () => {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      try {
        // Check for existing match - need to use separate queries since Firestore doesn't allow multiple 'in' filters
        // Query 1: Check if current user is user1 and target is user2
        const matchQuery1 = await firestore()
          .collection('matches')
          .where('user1Id', '==', userId)
          .where('user2Id', '==', targetUserId)
          .limit(1)
          .get();

        // Query 2: Check if current user is user2 and target is user1
        const matchQuery2 = await firestore()
          .collection('matches')
          .where('user1Id', '==', targetUserId)
          .where('user2Id', '==', userId)
          .limit(1)
          .get();

        let existingMatch = null;
        let existingMatchRef = null;

        if (!matchQuery1.empty) {
          existingMatch = matchQuery1.docs[0].data();
          existingMatchRef = matchQuery1.docs[0].ref;
        } else if (!matchQuery2.empty) {
          existingMatch = matchQuery2.docs[0].data();
          existingMatchRef = matchQuery2.docs[0].ref;
        }

        if (existingMatch && existingMatchRef) {
          // If this user is user2 and user1 already liked, complete the match
          if (existingMatch.user2Id === userId && existingMatch.user1Liked === true) {
            await existingMatchRef.update({
              user2Liked: true,
              updatedAt: firestore.FieldValue.serverTimestamp(),
            });
            return { status: 'matched', matchId: existingMatchRef.id, isNewMatch: true };
          }
          
          // If this user is user1 and user2 already liked, complete the match
          if (existingMatch.user1Id === userId && existingMatch.user2Liked === true) {
            await existingMatchRef.update({
              user1Liked: true,
              updatedAt: firestore.FieldValue.serverTimestamp(),
            });
            return { status: 'matched', matchId: existingMatchRef.id, isNewMatch: true };
          }
          
          // Match already exists but not mutual yet
          return { status: 'pending', matchId: existingMatchRef.id };
        }

        // No existing match, create a new one
        // Determine who should be user1 and user2 (smaller ID first for consistency)
        const isCurrentUserFirst = userId < targetUserId;
        const user1Id = isCurrentUserFirst ? userId : targetUserId;
        const user2Id = isCurrentUserFirst ? targetUserId : userId;
        const user1Liked = isCurrentUserFirst ? true : false;
        const user2Liked = isCurrentUserFirst ? false : true;

        const newMatch = await firestore().collection('matches').add({
          user1Id,
          user2Id,
          user1Liked,
          user2Liked,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

        return { status: 'pending', matchId: newMatch.id };

      } catch (error) {
        console.error('Error in swipeRight:', error);
        throw error;
      }
    }, 3, 'swipeRight');
  },
  
  // Swipe left (pass) on a user  
  swipeLeft: async (targetUserId) => {
    return withFirestoreRetry(async () => {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');
      
      // Check if there's already a match between these users - use separate queries
      const matchQuery1 = await firestore()
        .collection('matches')
        .where('user1Id', '==', userId)
        .where('user2Id', '==', targetUserId)
        .limit(1)
        .get();

      const matchQuery2 = await firestore()
        .collection('matches')
        .where('user1Id', '==', targetUserId)
        .where('user2Id', '==', userId)
        .limit(1)
        .get();

      let existingMatchDoc = null;
      if (!matchQuery1.empty) {
        existingMatchDoc = matchQuery1.docs[0];
      } else if (!matchQuery2.empty) {
        existingMatchDoc = matchQuery2.docs[0];
      }

      if (existingMatchDoc) {
        // If match exists, delete it to prevent future matching
        await existingMatchDoc.ref.delete();
      }
      
      // Create a rejected record to prevent future matching
      const user1Id = userId < targetUserId ? userId : targetUserId;
      const user2Id = userId < targetUserId ? targetUserId : userId;
      
      await firestore().collection('rejections').add({
        user1Id,
        user2Id,
        rejectedBy: userId,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      
      return { status: 'rejected' };
    }, 3, 'swipeLeft');
  },
  
  // Super match with a user (higher priority)
  superMatch: async (targetUserId) => {
    return withFirestoreRetry(async () => {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      try {
        // Check for existing match - use separate queries to avoid multiple 'in' filters
        const matchQuery1 = await firestore()
          .collection('matches')
          .where('user1Id', '==', userId)
          .where('user2Id', '==', targetUserId)
          .limit(1)
          .get();

        const matchQuery2 = await firestore()
          .collection('matches')
          .where('user1Id', '==', targetUserId)
          .where('user2Id', '==', userId)
          .limit(1)
          .get();

        let existingMatch = null;
        let existingMatchRef = null;

        if (!matchQuery1.empty) {
          existingMatch = matchQuery1.docs[0].data();
          existingMatchRef = matchQuery1.docs[0].ref;
        } else if (!matchQuery2.empty) {
          existingMatch = matchQuery2.docs[0].data();
          existingMatchRef = matchQuery2.docs[0].ref;
        }

        if (existingMatch && existingMatchRef) {
          // If this user is user2 and user1 already liked, complete the match
          if (existingMatch.user2Id === userId && existingMatch.user1Liked === true) {
            await existingMatchRef.update({
              user2Liked: true,
              isSuper: true,
              updatedAt: firestore.FieldValue.serverTimestamp(),
            });
            return { status: 'matched', matchId: existingMatchRef.id, isNewMatch: true, isSuper: true };
          }
          
          // If this user is user1 and user2 already liked, complete the match
          if (existingMatch.user1Id === userId && existingMatch.user2Liked === true) {
            await existingMatchRef.update({
              user1Liked: true,
              isSuper: true,
              updatedAt: firestore.FieldValue.serverTimestamp(),
            });
            return { status: 'matched', matchId: existingMatchRef.id, isNewMatch: true, isSuper: true };
          }
          
          // Update existing match to super
          const updateField = existingMatch.user1Id === userId ? 'user1Liked' : 'user2Liked';
          await existingMatchRef.update({
            [updateField]: true,
            isSuper: true,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          });
          
          return { status: 'pending', matchId: existingMatchRef.id, isSuper: true };
        }

        // No existing match, create a new super match
        const user1Id = userId < targetUserId ? userId : targetUserId;
        const user2Id = userId < targetUserId ? targetUserId : userId;
        const user1Liked = userId < targetUserId ? true : false;
        const user2Liked = userId < targetUserId ? false : true;

        const newMatch = await firestore().collection('matches').add({
          user1Id,
          user2Id,
          user1Liked,
          user2Liked,
          isSuper: true,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

        return { status: 'pending', matchId: newMatch.id, isSuper: true };

      } catch (error) {
        console.error('Error in superMatch:', error);
        throw error;
      }
    }, 3, 'superMatch');
  },
  
  // Get all matches for the current user
  getMatches: async () => {
    return withFirestoreRetry(async () => {
      const userId = auth().currentUser.uid;
      
      // Get accepted matches
      const matchesSnapshot = await firestore()
        .collection('matches')
        .where('users', 'array-contains', userId)
        .where('status', '==', 'accepted')
        .orderBy('lastInteraction', 'desc')
        .get();
      
      const matches = [];
      
      for (const doc of matchesSnapshot.docs) {
        const matchData = doc.data();
        
        // Get the other user's ID
        const otherUserId = matchData.users.find(id => id !== userId);
        
        // Get the other user's profile
        const otherUserDoc = await firestore().collection('users').doc(otherUserId).get();
        const otherUserData = otherUserDoc.data();
        
        matches.push({
          matchId: doc.id,
          userId: otherUserId,
          displayName: otherUserData.displayName,
          photoURL: otherUserData.photoURL,
          branch: otherUserData.branch,
          year: otherUserData.year,
          lastInteraction: matchData.lastInteraction.toDate(),
          createdAt: matchData.createdAt.toDate()
        });
      }
      
      return matches;
    }, 3, 'getMatches');
  },
  
  // Respond to a pending match
  respondToMatch: async (matchId, response) => {
    return withFirestoreRetry(async () => {
      await firestore().collection('matches').doc(matchId).update({
        status: response, // 'accepted' or 'rejected'
        lastInteraction: firestore.FieldValue.serverTimestamp()
      });
      
      if (response === 'accepted') {
        // Get match data
        const matchDoc = await firestore().collection('matches').doc(matchId).get();
        const matchData = matchDoc.data();
        
        // Create a chat for the matched users
        const chatRef = firestore().collection('chats').doc();
        await chatRef.set({
          participants: matchData.users,
          lastMessage: {
            text: 'You are now connected!',
            sentBy: 'system',
            sentAt: firestore.FieldValue.serverTimestamp()
          },
          isGroupChat: false,
          createdAt: firestore.FieldValue.serverTimestamp()
        });
        
        return { status: 'matched', chatId: chatRef.id };
      }
      
      return { status: response };
    }, 3, 'respondToMatch');
  },
  
  // Get pending matches that need a response
  getPendingMatches: async () => {
    return withFirestoreRetry(async () => {
      const userId = auth().currentUser.uid;
      
      // Get pending matches where the current user is not the initiator
      const pendingMatchesSnapshot = await firestore()
        .collection('matches')
        .where('users', 'array-contains', userId)
        .where('status', '==', 'pending')
        .where('initiatedBy', '!=', userId)
        .get();
      
      const pendingMatches = [];
      
      for (const doc of pendingMatchesSnapshot.docs) {
        const matchData = doc.data();
        
        // Get the initiator's ID
        const initiatorId = matchData.initiatedBy;
        
        // Get the initiator's profile
        const initiatorDoc = await firestore().collection('users').doc(initiatorId).get();
        const initiatorData = initiatorDoc.data();
        
        pendingMatches.push({
          matchId: doc.id,
          userId: initiatorId,
          displayName: initiatorData.displayName,
          photoURL: initiatorData.photoURL,
          branch: initiatorData.branch,
          year: initiatorData.year,
          createdAt: matchData.createdAt.toDate()
        });
      }
      
      return pendingMatches;
    }, 3, 'getPendingMatches');
  },
  
  // Get match compatibility score between two users
  getCompatibilityScore: async (targetUserId) => {
    return withFirestoreRetry(async () => {
      const getCompatibility = functions().httpsCallable('getCompatibilityScore');
      const result = await getCompatibility({ targetUserId });
      return result.data.compatibilityScore;
    }, 3, 'getCompatibilityScore');
  },
  
  // Filter potential matches by criteria
  filterMatches: async (filters) => {
    return withFirestoreRetry(async () => {
      const filterMatches = functions().httpsCallable('filterMatches');
      const result = await filterMatches(filters);
      return result.data.matches;
    }, 3, 'filterMatches');
  }
};
