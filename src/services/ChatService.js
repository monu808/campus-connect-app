import { firestore } from '../firebase';
import { AuthService } from './AuthService';
import { withFirestoreRetry } from '../utils/firestoreRetry';

export const ChatService = {
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
};

export default ChatService;