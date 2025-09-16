import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Card from '../../components/Card';
import { FriendsService } from '../../services/FriendsService';

const FriendsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [friends, setFriends] = useState([]);
  const [error, setError] = useState(null);

  // Fetch friends when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchFriends();
    }, [])
  );

  const fetchFriends = async () => {
    try {
      setError(null);
      if (!refreshing) setLoading(true);
      
      const friendsList = await FriendsService.getFriends();
      setFriends(friendsList || []);
    } catch (err) {
      console.error('Error fetching friends:', err);
      setError('Failed to load matches. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFriends();
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

  const getImageSource = (photoURL) => {
    if (photoURL && typeof photoURL === 'string' && photoURL.trim() !== '') {
      return { uri: photoURL };
    }
    return require('../../assets/profile-placeholder.png');
  };

  const renderFriendItem = ({ item: friend }) => (
    <Card style={styles.friendCard}>
      <View style={styles.friendItem}>
        <Image
          source={getImageSource(friend.photoURL)}
          style={styles.friendAvatar}
          defaultSource={require('../../assets/profile-placeholder.png')}
        />
        
        <View style={styles.friendInfo}>
          <Text style={styles.friendName} numberOfLines={1}>
            {friend.displayName}
          </Text>
          <Text style={styles.friendDetails} numberOfLines={1}>
            {friend.branch} • {friend.year}
          </Text>
          {friend.skills && friend.skills.length > 0 && (
            <Text style={styles.friendSkills} numberOfLines={1}>
              {friend.skills.slice(0, 3).join(', ')}
              {friend.skills.length > 3 && '...'}
            </Text>
          )}
          <Text style={styles.matchDate}>
            Matched {formatMatchDate(friend.matchedAt)}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => startChat(friend)}
          activeOpacity={0.7}
        >
          <Icon name="message-circle" size={20} color="#3B82F6" />
          <Text style={styles.chatButtonText}>Chat</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const formatMatchDate = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const matchDate = date.toDate ? date.toDate() : new Date(date);
    const diffTime = Math.abs(now - matchDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'today';
    if (diffDays === 2) return 'yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    if (diffDays <= 30) return `${Math.floor((diffDays - 1) / 7)} weeks ago`;
    return `${Math.floor((diffDays - 1) / 30)} months ago`;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="heart" size={80} color="#E5E7EB" />
      <Text style={styles.emptyTitle}>No Matches Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start swiping to find people you'd like to collaborate with!
      </Text>
      <TouchableOpacity
        style={styles.startMatchingButton}
        onPress={() => navigation.navigate('Matching', { screen: 'MatchingScreen' })}
      >
        <Text style={styles.startMatchingText}>Start Matching</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading your matches...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Icon name="alert-circle" size={80} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchFriends}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={friends}
        renderItem={renderFriendItem}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={renderEmptyState}
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
    padding: 20,
  },
  listContainer: {
    padding: 16,
  },
  friendCard: {
    marginBottom: 12,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  friendAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  friendDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  friendSkills: {
    fontSize: 12,
    color: '#3B82F6',
    marginBottom: 4,
  },
  matchDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chatButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
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
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FriendsScreen;
