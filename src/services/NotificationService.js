import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { withFirestoreRetry } from '../utils/firestoreRetry';

class NotificationServiceClass {
  constructor() {
    this.tokenRefreshListener = null;
    this.initialized = false;
  }

  async init() {
    try {
      // Request permission for iOS devices
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        
        if (!enabled) {
          console.log('Notification permissions denied');
          return;
        }
      }
      
      // Get FCM token
      const token = await messaging().getToken();
      if (token) {
        this.updateUserToken(token);
      }
      
      // Listen for token refresh
      this.tokenRefreshListener = messaging().onTokenRefresh(token => {
        this.updateUserToken(token);
      });
      
      // Set up notification handlers
      this.setupNotificationHandlers();
      
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }
  
  updateUserToken(token) {
    // In a real app, this would update the user's token in Firestore
    console.log('FCM Token:', token);
    
    // Get current user
    const currentUser = auth().currentUser;
    if (currentUser) {
      // Update token in Firestore with retry logic
      withFirestoreRetry(async () => {
        await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .update({
            fcmToken: token,
            tokenUpdatedAt: firestore.FieldValue.serverTimestamp(),
          });
      }, 3, 'updateUserToken')
        .catch(error => {
          console.error('Error updating FCM token:', error);
        });
    }
  }
  
  setupNotificationHandlers() {
    // Handle notifications when app is in foreground
    this.foregroundSubscription = messaging().onMessage(async remoteMessage => {
      console.log('Notification received in foreground:', remoteMessage);
      // Here you would show an in-app notification
    });
    
    // Handle notification opened when app is in background
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened from background state:', remoteMessage);
      // Navigate to appropriate screen based on notification type
      this.handleNotificationNavigation(remoteMessage);
    });
    
    // Check if app was opened from a notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('App opened from quit state by notification:', remoteMessage);
          // Navigate to appropriate screen based on notification type
          this.handleNotificationNavigation(remoteMessage);
        }
      });
  }
  
  handleNotificationNavigation(remoteMessage) {
    // This would be implemented to navigate to the appropriate screen
    // based on the notification type
    if (remoteMessage.data) {
      const { type, id } = remoteMessage.data;
      
      switch (type) {
        case 'match':
          // Navigate to match screen
          break;
        case 'message':
          // Navigate to chat screen
          break;
        case 'group_invite':
          // Navigate to group details
          break;
        case 'event':
          // Navigate to event details
          break;
        case 'achievement':
          // Navigate to achievements
          break;
        default:
          // Navigate to notifications list
          break;
      }
    }
  }
  
  cleanup() {
    // Remove listeners when they're no longer needed
    if (this.foregroundSubscription) {
      this.foregroundSubscription();
    }
    if (this.tokenRefreshListener) {
      this.tokenRefreshListener();
    }
  }
  
  // Send a local notification
  async sendLocalNotification(title, body, data = {}) {
    await messaging().sendMessage({
      notification: {
        title,
        body,
      },
      data,
    });
  }
  
  // Get notifications for the current user
  async getNotifications() {
    return withFirestoreRetry(async () => {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        return [];
      }

      const notificationsSnapshot = await firestore()
        .collection('notifications')
        .where('userId', '==', currentUser.uid)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      const notifications = notificationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));

      return notifications;
    }, 3, 'getNotifications')
      .catch(error => {
        console.error('Error fetching notifications:', error);
        // Return mock data if Firestore is unavailable
        return this.getMockNotifications();
      });
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    return withFirestoreRetry(async () => {
      await firestore()
        .collection('notifications')
        .doc(notificationId)
        .update({
          read: true,
          readAt: firestore.FieldValue.serverTimestamp(),
        });
    }, 3, 'markAsRead')
      .catch(error => {
        console.error('Error marking notification as read:', error);
      });
  }

  // Get mock notifications for offline mode
  getMockNotifications() {
    const mockNotifications = [
      {
        id: '1',
        type: 'match',
        title: 'New Match!',
        message: 'You have a new study buddy match',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        data: { matchId: 'match1' }
      },
      {
        id: '2',
        type: 'group_invite',
        title: 'Group Invitation',
        message: 'You have been invited to join "CS Study Group"',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        data: { groupId: 'group1' }
      },
      {
        id: '3',
        type: 'event',
        title: 'Upcoming Event',
        message: 'Don\'t forget about the study session tomorrow',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        data: { eventId: 'event1' }
      },
      {
        id: '4',
        type: 'achievement',
        title: 'Achievement Unlocked!',
        message: 'You earned the "Study Streak" badge',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        data: { badgeId: 'badge1' }
      }
    ];

    return mockNotifications;
  }
}

// Create a singleton instance
const NotificationService = new NotificationServiceClass();

export default NotificationService;
