import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationIcons, NotificationIcons, MatchingIcons, ChatIcons } from '../../PngIcons';
import NotificationService from '../../services/NotificationService';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const fetchedNotifications = await NotificationService.getNotifications();
      setNotifications(fetchedNotifications);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await NotificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationPress = (notification) => {
    // Mark as read
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'match':
        navigation.navigate('MatchModal', { 
          matchedUser: notification.data.matchedUser,
          chatId: notification.data.chatId
        });
        break;
      case 'chat':
        navigation.navigate('Chat', { 
          chatId: notification.data.chatId,
          isGroupChat: notification.data.isGroupChat
        });
        break;
      case 'group':
        navigation.navigate('GroupDetails', { 
          groupId: notification.data.groupId 
        });
        break;
      case 'event':
        navigation.navigate('EventDetailsScreen', { 
          eventId: notification.data.eventId 
        });
        break;
      case 'achievement':
        navigation.navigate('Gamification');
        break;
      default:
        // Default navigation
        break;
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <NavigationIcons.ArrowLeft size={24} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Notifications</Text>
      
      {notifications.some(notification => !notification.isRead) && (
        <TouchableOpacity
          style={styles.markAllButton}
          onPress={handleMarkAllAsRead}
        >
          <Text style={styles.markAllButtonText}>Mark all as read</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderNotificationItem = ({ item }) => {
    const getNotificationIcon = () => {
      switch (item.type) {
        case 'match':
          return <MatchingIcons.Like size={24} />;
        case 'chat':
          return <ChatIcons.ChatBubble size={24} />;
        case 'group':
          return <ChatIcons.Group size={24} />;
        case 'event':
          return <NotificationIcons.Event size={24} />;
        case 'achievement':
          return <NotificationIcons.Achievement size={24} />;
        default:
          return <NotificationIcons.Notification size={24} />;
      }
    };
    
    const getIconColor = () => {
      switch (item.type) {
        case 'match':
          return '#dc3545';
        case 'chat':
          return '#0d6efd';
        case 'group':
          return '#6610f2';
        case 'event':
          return '#fd7e14';
        case 'achievement':
          return '#ffc107';
        default:
          return '#6c757d';
      }
    };
    
    return (
      <TouchableOpacity 
        style={[
          styles.notificationItem,
          !item.isRead && styles.unreadNotification
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={[
          styles.iconContainer,
          { backgroundColor: `${getIconColor()}20` }
        ]}>
          {getNotificationIcon()}
        </View>
        
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationBody}>{item.body}</Text>
          <Text style={styles.notificationTime}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteNotification(item.id)}
        >
          <NavigationIcons.Close size={20} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyState}>
        <NotificationIcons.Notification size={80} />
        <Text style={styles.emptyStateTitle}>No notifications</Text>
        <Text style={styles.emptyStateText}>
          You don't have any notifications yet. We'll notify you when something important happens.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0d6efd" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.notificationsList}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#0d6efd']}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#0d6efd',
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  markAllButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  markAllButtonText: {
    fontSize: 12,
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationsList: {
    padding: 15,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: '#e7f1ff',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 5,
  },
  notificationBody: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: '#adb5bd',
  },
  deleteButton: {
    padding: 5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
});

export default NotificationsScreen;
