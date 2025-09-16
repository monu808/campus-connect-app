import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

class FriendsService {
  constructor() {
    this.db = firestore();
    this.auth = auth();
  }

  /**
   * Get all friends (matched users) for the current user
   */
  async getFriends() {
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const userId = currentUser.uid;
      
      // Query matches where current user is either user1 or user2 and both have liked each other
      const matchesSnapshot = await this.db
        .collection('matches')
        .where('user1Id', '==', userId)
        .where('user1Liked', '==', true)
        .where('user2Liked', '==', true)
        .get();

      const matchesSnapshot2 = await this.db
        .collection('matches')
        .where('user2Id', '==', userId)
        .where('user1Liked', '==', true)
        .where('user2Liked', '==', true)
        .get();

      // Combine both queries and get unique friend IDs
      const friendIds = new Set();
      const matchData = {};

      matchesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        friendIds.add(data.user2Id);
        matchData[data.user2Id] = {
          matchId: doc.id,
          matchedAt: data.createdAt
        };
      });

      matchesSnapshot2.docs.forEach(doc => {
        const data = doc.data();
        friendIds.add(data.user1Id);
        matchData[data.user1Id] = {
          matchId: doc.id,
          matchedAt: data.createdAt
        };
      });

      // If no friends found, return empty array
      if (friendIds.size === 0) {
        return [];
      }

      // Get user details for all friends
      const friends = [];
      const friendIdsArray = Array.from(friendIds);
      
      // Firestore 'in' queries are limited to 10 items, so we need to batch
      const batches = [];
      for (let i = 0; i < friendIdsArray.length; i += 10) {
        batches.push(friendIdsArray.slice(i, i + 10));
      }

      for (const batch of batches) {
        const usersSnapshot = await this.db
          .collection('users')
          .where(firestore.FieldPath.documentId(), 'in', batch)
          .get();

        usersSnapshot.docs.forEach(doc => {
          const userData = doc.data();
          friends.push({
            userId: doc.id,
            displayName: userData.displayName || userData.name || 'Unknown User',
            photoURL: userData.photoURL || null,
            branch: userData.branch || 'Unknown',
            year: userData.year || 'Unknown',
            skills: userData.skills || [],
            bio: userData.bio || '',
            college: userData.college || '',
            matchedAt: matchData[doc.id]?.matchedAt || null,
            matchId: matchData[doc.id]?.matchId || null
          });
        });
      }

      // Sort by most recent matches first
      friends.sort((a, b) => {
        if (!a.matchedAt && !b.matchedAt) return 0;
        if (!a.matchedAt) return 1;
        if (!b.matchedAt) return -1;
        
        const timeA = a.matchedAt.toDate ? a.matchedAt.toDate() : new Date(a.matchedAt);
        const timeB = b.matchedAt.toDate ? b.matchedAt.toDate() : new Date(b.matchedAt);
        
        return timeB - timeA;
      });

      return friends;
    } catch (error) {
      console.error('Error getting friends:', error);
      throw error;
    }
  }

  /**
   * Get a specific friend by user ID
   */
  async getFriend(friendId) {
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const friends = await this.getFriends();
      return friends.find(friend => friend.userId === friendId) || null;
    } catch (error) {
      console.error('Error getting friend:', error);
      throw error;
    }
  }

  /**
   * Check if two users are friends (matched)
   */
  async areFriends(userId1, userId2) {
    try {
      const matchSnapshot = await this.db
        .collection('matches')
        .where('user1Id', 'in', [userId1, userId2])
        .where('user2Id', 'in', [userId1, userId2])
        .where('user1Liked', '==', true)
        .where('user2Liked', '==', true)
        .limit(1)
        .get();

      return !matchSnapshot.empty;
    } catch (error) {
      console.error('Error checking friendship:', error);
      return false;
    }
  }

  /**
   * Get friend count for current user
   */
  async getFriendCount() {
    try {
      const friends = await this.getFriends();
      return friends.length;
    } catch (error) {
      console.error('Error getting friend count:', error);
      return 0;
    }
  }

  /**
   * Remove/Unfriend a user (remove the match)
   */
  async removeFriend(friendId) {
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const userId = currentUser.uid;

      // Find the match document
      const matchSnapshot = await this.db
        .collection('matches')
        .where('user1Id', 'in', [userId, friendId])
        .where('user2Id', 'in', [userId, friendId])
        .limit(1)
        .get();

      if (!matchSnapshot.empty) {
        const matchDoc = matchSnapshot.docs[0];
        await matchDoc.ref.delete();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  }

  /**
   * Search friends by name or skills
   */
  async searchFriends(query) {
    try {
      const friends = await this.getFriends();
      
      if (!query || query.trim() === '') {
        return friends;
      }

      const searchTerm = query.toLowerCase().trim();
      
      return friends.filter(friend => {
        const name = (friend.displayName || '').toLowerCase();
        const skills = (friend.skills || []).map(skill => skill.toLowerCase());
        const branch = (friend.branch || '').toLowerCase();
        const college = (friend.college || '').toLowerCase();
        
        return name.includes(searchTerm) ||
               skills.some(skill => skill.includes(searchTerm)) ||
               branch.includes(searchTerm) ||
               college.includes(searchTerm);
      });
    } catch (error) {
      console.error('Error searching friends:', error);
      throw error;
    }
  }
}

// Export singleton instance
const friendsServiceInstance = new FriendsService();
export { friendsServiceInstance as FriendsService };
export default friendsServiceInstance;
