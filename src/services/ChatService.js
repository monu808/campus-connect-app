import { firestore } from '../firebase';
import { AuthService } from './AuthService';
import { withFirestoreRetry } from '../utils/firestoreRetry';

export const ChatService = {
  // Create or get existing direct chat between current user and another user
  createDirectChat: async (otherUserId) => {
    return withFirestoreRetry(async () => {
      const currentUserId = AuthService.getCurrentUser()?.uid;
      if (!currentUserId) throw new Error('User not authenticated');

      if (currentUserId === otherUserId) {
        throw new Error('Cannot create chat with yourself');
      }

      // Create a consistent chat ID by sorting user IDs
      const participants = [currentUserId, otherUserId].sort();
      const chatId = `direct_${participants[0]}_${participants[1]}`;

      // Check if chat already exists
      const existingChatDoc = await firestore().collection('chats').doc(chatId).get();
      
      if (existingChatDoc.exists) {
        return { id: existingChatDoc.id, ...existingChatDoc.data() };
      }

      // Get user data for chat creation
      const [currentUserDoc, otherUserDoc] = await Promise.all([
        firestore().collection('users').doc(currentUserId).get(),
        firestore().collection('users').doc(otherUserId).get()
      ]);

      const currentUserData = currentUserDoc.data() || {};
      const otherUserData = otherUserDoc.data() || {};

      // Create new chat
      const chatData = {
        id: chatId,
        participants: participants,
        participantData: {
          [currentUserId]: {
            displayName: currentUserData.displayName || currentUserData.fullName || 'Unknown User',
            photoURL: currentUserData.photoURL || null
          },
          [otherUserId]: {
            displayName: otherUserData.displayName || otherUserData.fullName || 'Unknown User',
            photoURL: otherUserData.photoURL || null
          }
        },
        isGroupChat: false,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
        lastMessage: null,
        unreadCounts: {
          [currentUserId]: 0,
          [otherUserId]: 0
        }
      };

      await firestore().collection('chats').doc(chatId).set(chatData);

      return { id: chatId, ...chatData };
    }, 3, 'createDirectChat');
  },

  // Get chats for the current user
  getUserChats: async () => {
    return withFirestoreRetry(async () => {
      const userId = AuthService.getCurrentUser()?.uid;
      if (!userId) throw new Error('User not authenticated');

      // Query chats where participants array contains userId
      // Avoid composite index requirement by removing orderBy; sort client-side instead
      const chatsSnap = await firestore()
        .collection('chats')
        .where('participants', 'array-contains', userId)
        .limit(100)
        .get();

      const items = chatsSnap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || data.title || 'Chat',
          lastMessage: data.lastMessage?.text || '',
          timestamp: data.lastMessage?.sentAt?.toDate?.() || data.createdAt?.toDate?.() || new Date(),
          isGroup: !!data.isGroupChat,
          unreadCount: data.unreadCounts?.[userId] || 0,
        };
      });

      // Sort by timestamp desc
      items.sort((a, b) => (b.timestamp?.getTime?.() || 0) - (a.timestamp?.getTime?.() || 0));
      return items;
    }, 3, 'getUserChats');
  },

  // Send a message to a chat
  sendMessage: async (chatId, messageText) => {
    return withFirestoreRetry(async () => {
      const currentUserId = AuthService.getCurrentUser()?.uid;
      if (!currentUserId) throw new Error('User not authenticated');

      const messageData = {
        text: messageText,
        senderId: currentUserId,
        sentAt: firestore.FieldValue.serverTimestamp(),
        readBy: [currentUserId] // Mark as read by sender
      };

      // Add message to messages subcollection
      const messageRef = await firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .add(messageData);

      // Update chat's last message and unread counts
      const chatRef = firestore().collection('chats').doc(chatId);
      const chatDoc = await chatRef.get();
      
      if (chatDoc.exists) {
        const chatData = chatDoc.data();
        const participants = chatData.participants || [];
        
        // Reset sender's unread count and increment others'
        const unreadCounts = chatData.unreadCounts || {};
        participants.forEach(participantId => {
          if (participantId === currentUserId) {
            unreadCounts[participantId] = 0;
          } else {
            unreadCounts[participantId] = (unreadCounts[participantId] || 0) + 1;
          }
        });

        await chatRef.update({
          lastMessage: {
            text: messageText,
            senderId: currentUserId,
            sentAt: firestore.FieldValue.serverTimestamp()
          },
          updatedAt: firestore.FieldValue.serverTimestamp(),
          unreadCounts: unreadCounts
        });
      }

      return { id: messageRef.id, ...messageData };
    }, 3, 'sendMessage');
  },

  // Get messages for a chat
  getMessages: async (chatId, limit = 50) => {
    return withFirestoreRetry(async () => {
      const messagesSnap = await firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .orderBy('sentAt', 'desc')
        .limit(limit)
        .get();

      const messages = messagesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        sentAt: doc.data().sentAt?.toDate?.() || new Date()
      }));

      return messages.reverse(); // Return in chronological order
    }, 3, 'getMessages');
  },

  // Mark messages as read
  markMessagesAsRead: async (chatId) => {
    return withFirestoreRetry(async () => {
      const currentUserId = AuthService.getCurrentUser()?.uid;
      if (!currentUserId) throw new Error('User not authenticated');

      // Reset unread count for current user
      await firestore()
        .collection('chats')
        .doc(chatId)
        .update({
          [`unreadCounts.${currentUserId}`]: 0
        });
    }, 3, 'markMessagesAsRead');
  },
};

export default ChatService;