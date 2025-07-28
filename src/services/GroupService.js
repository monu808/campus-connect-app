import { firestore, storage, getFirestoreService } from '../firebase';
import { AuthService } from './AuthService';
import { withFirestoreRetry } from '../utils/firestoreRetry';

export const GroupService = {
  // Create a new group
  createGroup: async (groupData) => {
    return withFirestoreRetry(async () => {
      const userId = AuthService.getCurrentUser()?.uid;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Get Firestore instance
      const firestoreService = await getFirestoreService();
      
      // Create group document
      const groupRef = firestoreService.collection('groups').doc();
      await groupRef.set({
        ...groupData,
        members: [
          {
            userId,
            role: 'admin'
          }
        ],
        createdBy: userId,
        createdAt: firestore.FieldValue.serverTimestamp()
      });
      
      // Award XP for creating a group
      // This would typically be handled by a Cloud Function
      
      return { groupId: groupRef.id };
    }, 3, 'createGroup');
  },
  
  // Get all groups with optional filters
  getGroups: async (filters = {}) => {
    return withFirestoreRetry(async () => {
      let query = firestore().collection('groups');
      
      // Apply filters
      if (filters.type) {
        query = query.where('type', '==', filters.type);
      }
      
      if (filters.tags && filters.tags.length > 0) {
        query = query.where('tags', 'array-contains-any', filters.tags);
      }
      
      // Get groups
      const groupsSnapshot = await query
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();
      
      const groups = groupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      }));
      
      return groups;
    }, 3, 'getGroups');
  },
  
  // Get user's groups
  getUserGroups: async () => {
    return withFirestoreRetry(async () => {
      const userId = AuthService.getCurrentUser().uid;
      
      // Get groups where user is a member
      const groupsSnapshot = await firestore()
        .collection('groups')
        .where('members', 'array-contains', { userId, role: 'admin' })
        .orderBy('createdAt', 'desc')
        .get();
      
      const groups = groupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      }));
      
      return groups;
    }, 3, 'getUserGroups');
  },
  
  // Get a specific group by ID
  getGroupById: async (groupId) => {
    return withFirestoreRetry(async () => {
      // Get Firestore instance
      const firestoreService = await getFirestoreService();
      
      // For demo/development, add mock data if no groupId is provided
      if (!groupId) {
        console.warn('GroupID is undefined/null, returning mock data');
        return {
          id: 'mock-group-1',
          name: 'Mock Study Group',
          description: 'This is a mock group for development',
          type: 'Study Group',
          members: [{ userId: 'current-user', role: 'admin' }],
          createdAt: new Date()
        };
      }
      
      const groupDoc = await firestoreService.collection('groups').doc(groupId).get();
      
      if (!groupDoc.exists) {
        throw new Error('Group not found');
      }
      
      const groupData = groupDoc.data();
      
      return {
        id: groupDoc.id,
        ...groupData,
        createdAt: groupData.createdAt?.toDate() || new Date()
      };
    }, 3, 'getGroupById');
  },
  
  // Join a group
  joinGroup: async (groupId) => {
    return withFirestoreRetry(async () => {
      const userId = AuthService.getCurrentUser().uid;
      
      // Add user to group members
      await firestore().collection('groups').doc(groupId).update({
        members: firestore.FieldValue.arrayUnion({
          userId,
          role: 'member'
        })
      });
      
      // Award XP for joining a group
      // This would typically be handled by a Cloud Function
      
      return { success: true };
    }, 3, 'joinGroup');
  },
  
  // Leave a group
  leaveGroup: async (groupId) => {
    return withFirestoreRetry(async () => {
      const userId = AuthService.getCurrentUser().uid;
      
      // Get group data
      const groupDoc = await firestore().collection('groups').doc(groupId).get();
      const groupData = groupDoc.data();
      
      // Find user's member object
      const memberIndex = groupData.members.findIndex(member => member.userId === userId);
      
      if (memberIndex !== -1) {
        // Remove user from members array
        const updatedMembers = [...groupData.members];
        updatedMembers.splice(memberIndex, 1);
        
        await firestore().collection('groups').doc(groupId).update({
          members: updatedMembers
        });
      }
      
      return { success: true };
    }, 3, 'leaveGroup');
  },
  
  // Update a group
  updateGroup: async (groupId, groupData) => {
    return withFirestoreRetry(async () => {
      await firestore().collection('groups').doc(groupId).update(groupData);
      return { success: true };
    }, 3, 'updateGroup');
  },
  
  // Get group members
  getGroupMembers: async (groupId) => {
    return withFirestoreRetry(async () => {
      // Get Firestore instance
      const firestoreService = await getFirestoreService();
      
      // For demo/development, add mock data if no groupId is provided
      if (!groupId) {
        console.warn('GroupID is undefined/null, returning mock members');
        return [
          {
            userId: 'user1',
            role: 'admin',
            displayName: 'John Doe',
            photoURL: null,
            branch: 'Computer Science',
            year: '3rd Year'
          },
          {
            userId: 'user2',
            role: 'member',
            displayName: 'Jane Smith',
            photoURL: null,
            branch: 'Data Science',
            year: '2nd Year'
          }
        ];
      }
      
      // Get group data
      const groupDoc = await firestoreService.collection('groups').doc(groupId).get();
      if (!groupDoc.exists) {
        throw new Error('Group not found');
      }
      
      const groupData = groupDoc.data();
      if (!groupData || !Array.isArray(groupData.members)) {
        return [];
      }
      
      // Get member profiles
      const members = [];
      
      for (const member of groupData.members) {
        try {
          const userDoc = await firestoreService.collection('users').doc(member.userId).get();
          const userData = userDoc.data();
          
          if (userData) {
            members.push({
              userId: member.userId,
              role: member.role,
              displayName: userData.displayName || 'Unknown User',
              photoURL: userData.photoURL || null,
              branch: userData.branch || 'Not specified',
              year: userData.year || 'Not specified'
            });
          }
        } catch (userError) {
          console.warn(`Error fetching user ${member.userId}:`, userError);
          // Add basic member info even if we can't get full profile
          members.push({
            userId: member.userId,
            role: member.role,
            displayName: 'Unknown User',
            photoURL: null,
            branch: 'Not available',
            year: 'Not available'
          });
        }
      }
      
      return members;
    }, 3, 'getGroupMembers');
  },
  
  // Upload group image
  uploadGroupImage: async (groupId, uri) => {
    return withFirestoreRetry(async () => {
      const reference = storage().ref(`groups/${groupId}/cover.jpg`);
      
      // Upload image
      await reference.putFile(uri);
      
      // Get download URL
      const url = await reference.getDownloadURL();
      
      // Update group with new photo URL
      await firestore().collection('groups').doc(groupId).update({
        coverURL: url
      });
      
      return url;
    }, 3, 'uploadGroupImage');
  },
  
  // Create a group chat
  createGroupChat: async (groupId) => {
    return withFirestoreRetry(async () => {
      // Get group data
      const groupDoc = await firestore().collection('groups').doc(groupId).get();
      const groupData = groupDoc.data();
      
      // Create chat document
      const chatRef = firestore().collection('chats').doc();
      await chatRef.set({
        participants: groupData.members.map(member => member.userId),
        lastMessage: {
          text: 'Group chat created',
          sentBy: 'system',
          sentAt: firestore.FieldValue.serverTimestamp()
        },
        isGroupChat: true,
        groupId,
        createdAt: firestore.FieldValue.serverTimestamp()
      });
      
      // Update group with chat ID
      await firestore().collection('groups').doc(groupId).update({
        chatId: chatRef.id
      });
      
      return { chatId: chatRef.id };
    }, 3, 'createGroupChat');
  },
  
  // Get group chat
  getGroupChat: async (groupId) => {
    return withFirestoreRetry(async () => {
      // Get group data
      const groupDoc = await firestore().collection('groups').doc(groupId).get();
      const groupData = groupDoc.data();
      
      if (!groupData.chatId) {
        // Create a new chat if one doesn't exist
        return await GroupService.createGroupChat(groupId);
      }
      
      return { chatId: groupData.chatId };
    }, 3, 'getGroupChat');
  },
  
  // Search for groups
  searchGroups: async (query) => {
    return withFirestoreRetry(async () => {
      // This is a simple implementation that doesn't use full-text search
      // For production, consider using Algolia or a similar service
      
      const groupsSnapshot = await firestore()
        .collection('groups')
        .orderBy('name')
        .startAt(query)
        .endAt(query + '\uf8ff')
        .limit(20)
        .get();
      
      const groups = groupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      }));
      
      return groups;
    }, 3, 'searchGroups');
  }
};

export default GroupService;
