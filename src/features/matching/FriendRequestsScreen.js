import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getImageSource } from '../../utils/imageStorageUtils';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const FriendRequestsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('received'); // received, sent, friends
  const [requests, setRequests] = useState({
    received: [],
    sent: [],
    friends: [],
  });

  useFocusEffect(
    React.useCallback(() => {
      fetchRequests();
    }, [])
  );

  const fetchRequests = async () => {
    try {
      if (!refreshing) setLoading(true);
      
      const userId = auth().currentUser?.uid;
      if (!userId) return;

      // Fetch received requests (where current user is target and sender liked)
      // Check both user1Id and user2Id since user ordering depends on ID comparison
      const receivedSnapshot1 = await firestore()
        .collection('matches')
        .where('user2Id', '==', userId)
        .where('user1Liked', '==', true)
        .where('user2Liked', '==', false)
        .get();

      const receivedSnapshot2 = await firestore()
        .collection('matches')
        .where('user1Id', '==', userId)
        .where('user2Liked', '==', true)
        .where('user1Liked', '==', false)
        .get();

      // Fetch sent requests (where current user liked but target hasn't)
      const sentSnapshot1 = await firestore()
        .collection('matches')
        .where('user1Id', '==', userId)
        .where('user1Liked', '==', true)
        .where('user2Liked', '==', false)
        .get();

      const sentSnapshot2 = await firestore()
        .collection('matches')
        .where('user2Id', '==', userId)
        .where('user2Liked', '==', true)
        .where('user1Liked', '==', false)
        .get();

      console.log('Sent requests query results:', sentSnapshot1.docs.length + sentSnapshot2.docs.length);
      [...sentSnapshot1.docs, ...sentSnapshot2.docs].forEach(doc => {
        console.log('Sent request doc:', doc.id, doc.data());
      });

      // Fetch accepted friends (mutual likes)
      const friendsSnapshot1 = await firestore()
        .collection('matches')
        .where('user1Id', '==', userId)
        .where('user1Liked', '==', true)
        .where('user2Liked', '==', true)
        .get();

      const friendsSnapshot2 = await firestore()
        .collection('matches')
        .where('user2Id', '==', userId)
        .where('user1Liked', '==', true)
        .where('user2Liked', '==', true)
        .get();

      // Process received requests (combine both query results)
      const allReceivedDocs = [...receivedSnapshot1.docs, ...receivedSnapshot2.docs];
      const receivedRequests = await Promise.all(
        allReceivedDocs.map(async (doc) => {
          const data = doc.data();
          // Determine who sent the request
          const senderUserId = data.user1Id === userId ? data.user2Id : data.user1Id;
          console.log('Processing received request from user:', senderUserId);
          const userDoc = await firestore().collection('users').doc(senderUserId).get();
          console.log('Sender user document exists:', userDoc.exists);
          const userData = userDoc.data() || {};
          console.log('Sender user data retrieved - displayName:', userData.displayName || 'No displayName');
          console.log('Sender user data retrieved - fullName:', userData.fullName || 'No fullName');
          console.log('Sender user data retrieved - name:', userData.name || 'No name');
          console.log('Sender user data retrieved - firstName:', userData.firstName || 'No firstName');
          console.log('Sender user data retrieved - all fields:', Object.keys(userData));
          console.log('Resolved display name:', userData.displayName || userData.fullName || 'Unknown User');
          return {
            id: doc.id,
            userId: senderUserId,
            displayName: userData.displayName || userData.fullName || 'Unknown User',
            photoURL: userData.photoURL,
            branch: userData.branch || '',
            year: userData.year || '',
            skills: userData.skills || [],
            bio: userData.bio || '',
            createdAt: data.createdAt,
          };
        })
      );

      // Process sent requests (combine both query results)
      const allSentDocs = [...sentSnapshot1.docs, ...sentSnapshot2.docs];
      const sentRequests = await Promise.all(
        allSentDocs.map(async (doc) => {
          const data = doc.data();
          // Determine who received the request
          const targetUserId = data.user1Id === userId ? data.user2Id : data.user1Id;
          console.log('Processing sent request to user:', targetUserId);
          const userDoc = await firestore().collection('users').doc(targetUserId).get();
          console.log('Target user document exists:', userDoc.exists);
          const userData = userDoc.data() || {};
          console.log('Target user data retrieved - displayName:', userData.displayName || 'No displayName');
          console.log('Target user data retrieved - fullName:', userData.fullName || 'No fullName');
          console.log('Target user data retrieved - name:', userData.name || 'No name');
          console.log('Target user data retrieved - firstName:', userData.firstName || 'No firstName');
          console.log('Target user data retrieved - all fields:', Object.keys(userData));
          console.log('Resolved display name:', userData.displayName || userData.fullName || 'Unknown User');
          return {
            id: doc.id,
            userId: targetUserId,
            displayName: userData.displayName || userData.fullName || 'Unknown User',
            photoURL: userData.photoURL,
            branch: userData.branch || '',
            year: userData.year || '',
            skills: userData.skills || [],
            bio: userData.bio || '',
            createdAt: data.createdAt,
          };
        })
      );

      // Process friends (combine both queries)
      const allFriendsData = [...friendsSnapshot1.docs, ...friendsSnapshot2.docs];
      const friends = await Promise.all(
        allFriendsData.map(async (doc) => {
          const data = doc.data();
          const friendUserId = data.user1Id === userId ? data.user2Id : data.user1Id;
          const userDoc = await firestore().collection('users').doc(friendUserId).get();
          const userData = userDoc.data() || {};
          return {
            id: doc.id,
            userId: friendUserId,
            displayName: userData.displayName || userData.fullName || 'Unknown User',
            photoURL: userData.photoURL,
            branch: userData.branch || '',
            year: userData.year || '',
            skills: userData.skills || [],
            bio: userData.bio || '',
            createdAt: data.createdAt,
          };
        })
      );

      setRequests({
        received: receivedRequests,
        sent: sentRequests,
        friends: friends,
      });

    } catch (error) {
      console.error('Error fetching friend requests:', error);
      Alert.alert('Error', 'Failed to load friend requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAcceptRequest = async (requestId, senderId) => {
    try {
      const currentUserId = auth().currentUser?.uid;
      if (!currentUserId) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // Get the match document to determine user positions
      const matchDoc = await firestore().collection('matches').doc(requestId).get();
      if (!matchDoc.exists) {
        Alert.alert('Error', 'Friend request not found');
        return;
      }

      const matchData = matchDoc.data();
      let updateField = {};

      // Determine which field to update based on current user position
      if (matchData.user1Id === currentUserId) {
        updateField = { user1Liked: true };
      } else if (matchData.user2Id === currentUserId) {
        updateField = { user2Liked: true };
      } else {
        Alert.alert('Error', 'Invalid friend request');
        return;
      }

      console.log('Accepting request - updating:', updateField);

      // Update the match document
      await firestore().collection('matches').doc(requestId).update({
        ...updateField,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('Success', 'Friend request accepted!');
      fetchRequests(); // Refresh the lists
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert('Error', 'Failed to accept friend request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      // Delete the match document
      await firestore().collection('matches').doc(requestId).delete();

      Alert.alert('Success', 'Friend request rejected');
      fetchRequests(); // Refresh the lists
    } catch (error) {
      console.error('Error rejecting request:', error);
      Alert.alert('Error', 'Failed to reject friend request');
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      // Delete the sent request
      await firestore().collection('matches').doc(requestId).delete();

      Alert.alert('Success', 'Friend request cancelled');
      fetchRequests(); // Refresh the lists
    } catch (error) {
      console.error('Error cancelling request:', error);
      Alert.alert('Error', 'Failed to cancel friend request');
    }
  };

  const startChat = async (friend) => {
    try {
      // Import ChatService dynamically to avoid circular imports
      const { ChatService } = await import('../../services/ChatService');
      
      // Create or get existing chat
      const chat = await ChatService.createDirectChat(friend.userId);
      
      // Navigate to chat screen
      navigation.navigate('Chat', { 
        screen: 'ChatScreen',
        params: {
          chatId: chat.id,
          chatName: friend.displayName,
          chatType: 'direct'
        }
      });
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Error', 'Failed to start chat. Please try again.');
    }
  };

  const renderRequestItem = ({ item }) => {
    console.log('Rendering card for user:', item.displayName, 'Branch:', item.branch, 'Year:', item.year);
    const imageSource = getImageSource(item.photoURL, require('../../assets/profile-placeholder.png'));
    
    const handleProfilePress = () => {
      navigation.navigate('UserProfileScreen', {
        userId: item.userId,
        userName: item.displayName
      });
    };
    
    return (
      <View style={[styles.requestCard, styles.cardContainer]}>
        <View style={styles.requestItem}>
          <TouchableOpacity style={styles.userInfoContainer} onPress={handleProfilePress} activeOpacity={0.7}>
            <Image source={imageSource} style={styles.avatar} />
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.displayName}</Text>
              <Text style={styles.userDetails}>
                {item.branch}{item.year ? ` • ${item.year}` : ''}
              </Text>
              {item.skills && item.skills.length > 0 && (
                <Text style={styles.userSkills} numberOfLines={1}>
                  {item.skills.slice(0, 3).join(', ')}
                  {item.skills.length > 3 && '...'}
                </Text>
              )}
            </View>
          </TouchableOpacity>
          
          <View style={styles.actionButtons}>
            {activeTab === 'received' && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => handleAcceptRequest(item.id, item.userId)}
                >
                  <Icon name="check" size={18} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleRejectRequest(item.id)}
                >
                  <Icon name="x" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </>
            )}
            
            {activeTab === 'sent' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => handleCancelRequest(item.id)}
              >
                <Icon name="x" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            
            {activeTab === 'friends' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.chatButton]}
                onPress={() => startChat(item)}
              >
                <Icon name="message-circle" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    let message = '';
    switch (activeTab) {
      case 'received':
        message = 'No pending friend requests';
        break;
      case 'sent':
        message = 'No sent friend requests';
        break;
      case 'friends':
        message = 'No friends yet. Start swiping to make connections!';
        break;
    }

    return (
      <View style={styles.emptyContainer}>
        <Icon name="users" size={80} color="#E5E7EB" />
        <Text style={styles.emptyText}>{message}</Text>
        {activeTab === 'friends' && (
          <TouchableOpacity
            style={styles.startMatchingButton}
            onPress={() => navigation.navigate('Matching', { screen: 'MatchingScreen' })}
          >
            <Text style={styles.startMatchingText}>Start Matching</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const getTabCount = (tab) => {
    return requests[tab]?.length || 0;
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.activeTab]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>
            Received ({getTabCount('received')})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>
            Sent ({getTabCount('sent')})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            Friends ({getTabCount('friends')})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={requests[activeTab]}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          fetchRequests();
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  requestCard: {
    marginBottom: 12,
  },
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  userDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  userSkills: {
    fontSize: 12,
    color: '#3B82F6',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  cancelButton: {
    backgroundColor: '#6B7280',
  },
  chatButton: {
    backgroundColor: '#3B82F6',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  startMatchingButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  startMatchingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});

export default FriendRequestsScreen;