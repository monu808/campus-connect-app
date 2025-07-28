import { auth, firestore, functions } from '../firebase';
import { withFirestoreRetry } from '../utils/firestoreRetry';

export const MatchingService = {
  // Get recommended users based on skills and interests
  getRecommendedUsers: async (filters = {}) => {
    return withFirestoreRetry(async () => {
      const generateMatches = functions().httpsCallable('generateMatches');
      const result = await generateMatches(filters);
      return result.data.matches;
    }, 3, 'getRecommendedUsers');
  },
  
  // Swipe right (interested) on a user
  swipeRight: async (targetUserId) => {
    return withFirestoreRetry(async () => {
      const createMatch = functions().httpsCallable('createMatch');
      const result = await createMatch({ targetUserId });
      return result.data;
    }, 3, 'swipeRight');
  },
  
  // Swipe left (pass) on a user
  swipeLeft: async (targetUserId) => {
    return withFirestoreRetry(async () => {
      const userId = auth().currentUser.uid;
      
      // Create a rejected match record
      await firestore().collection('matches').add({
        users: [userId, targetUserId],
        status: 'rejected',
        initiatedBy: userId,
        createdAt: firestore.FieldValue.serverTimestamp(),
        lastInteraction: firestore.FieldValue.serverTimestamp()
      });
      
      return { status: 'rejected' };
    }, 3, 'swipeLeft');
  },
  
  // Super match with a user (higher priority)
  superMatch: async (targetUserId) => {
    return withFirestoreRetry(async () => {
      const createSuperMatch = functions().httpsCallable('createSuperMatch');
      const result = await createSuperMatch({ targetUserId });
      return result.data;
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

export default MatchingService;
