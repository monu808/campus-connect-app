import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GamificationService } from '../../services/GamificationService';
import { AuthService } from '../../services/AuthService';

const LeaderboardTabScreen = () => {
  const navigation = useNavigation();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTimeframe, setActiveTimeframe] = useState('weekly'); // weekly, monthly, alltime
  const [activeScope, setActiveScope] = useState('college'); // college, friends

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTimeframe, activeScope]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const result = await GamificationService.getLeaderboard(activeTimeframe, activeScope);
      setLeaderboard(result.leaderboard);
      setUserRank(result.userRank);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
  };

  const renderTimeframeTabs = () => (
    <View style={styles.timeframeTabs}>
      <TouchableOpacity 
        style={[
          styles.timeframeTab,
          activeTimeframe === 'weekly' && styles.activeTimeframeTab
        ]}
        onPress={() => setActiveTimeframe('weekly')}
      >
        <Text 
          style={[
            styles.timeframeTabText,
            activeTimeframe === 'weekly' && styles.activeTimeframeTabText
          ]}
        >
          Weekly
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.timeframeTab,
          activeTimeframe === 'monthly' && styles.activeTimeframeTab
        ]}
        onPress={() => setActiveTimeframe('monthly')}
      >
        <Text 
          style={[
            styles.timeframeTabText,
            activeTimeframe === 'monthly' && styles.activeTimeframeTabText
          ]}
        >
          Monthly
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.timeframeTab,
          activeTimeframe === 'alltime' && styles.activeTimeframeTab
        ]}
        onPress={() => setActiveTimeframe('alltime')}
      >
        <Text 
          style={[
            styles.timeframeTabText,
            activeTimeframe === 'alltime' && styles.activeTimeframeTabText
          ]}
        >
          All Time
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderScopeTabs = () => (
    <View style={styles.scopeTabs}>
      <TouchableOpacity 
        style={[
          styles.scopeTab,
          activeScope === 'college' && styles.activeScopeTab
        ]}
        onPress={() => setActiveScope('college')}
      >
        <Text 
          style={[
            styles.scopeTabText,
            activeScope === 'college' && styles.activeScopeTabText
          ]}
        >
          College
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.scopeTab,
          activeScope === 'friends' && styles.activeScopeTab
        ]}
        onPress={() => setActiveScope('friends')}
      >
        <Text 
          style={[
            styles.scopeTabText,
            activeScope === 'friends' && styles.activeScopeTabText
          ]}
        >
          Friends
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderUserRank = () => {
    if (userRank === 0) return null;
    
    return (
      <View style={styles.userRankContainer}>
        <Text style={styles.userRankText}>Your Rank: #{userRank}</Text>
      </View>
    );
  };

  const renderTopThree = () => {
    if (leaderboard.length === 0) return null;
    
    const topThree = leaderboard.slice(0, Math.min(3, leaderboard.length));
    const currentUserId = AuthService.getCurrentUser().uid;
    
    return (
      <View style={styles.topThreeContainer}>
        {topThree.map((user, index) => {
          const isCurrentUser = user.userId === currentUserId;
          const medalColors = ['#ffc107', '#adb5bd', '#cd7f32'];
          
          return (
            <TouchableOpacity
              key={user.userId}
              style={[
                styles.topUserContainer,
                index === 1 && { marginTop: 20 },
                index === 2 && { marginTop: 20 },
                isCurrentUser && styles.currentUserHighlight
              ]}
              onPress={() => navigation.navigate('UserProfile', { userId: user.userId })}
            >
              <View style={styles.rankContainer}>
                <View style={[styles.medalContainer, { backgroundColor: medalColors[index] }]}>
                  <Text style={styles.medalText}>{index + 1}</Text>
                </View>
              </View>
              
              <Image 
                source={{ uri: user.photoURL || 'https://via.placeholder.com/60' }} 
                style={styles.topUserAvatar} 
              />
              
              <Text style={styles.topUserName}>
                {user.displayName}
                {isCurrentUser && ' (You)'}
              </Text>
              
              <Text style={styles.topUserXP}>{user.xpPoints} XP</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderLeaderboardList = () => {
    if (leaderboard.length <= 3) return null;
    
    const restOfLeaderboard = leaderboard.slice(3);
    const currentUserId = AuthService.getCurrentUser().uid;
    
    return (
      <View style={styles.leaderboardListContainer}>
        <Text style={styles.leaderboardListTitle}>Leaderboard</Text>
        
        {restOfLeaderboard.map((user, index) => {
          const isCurrentUser = user.userId === currentUserId;
          const actualRank = index + 4; // +4 because we're starting after top 3
          
          return (
            <TouchableOpacity
              key={user.userId}
              style={[
                styles.leaderboardItem,
                isCurrentUser && styles.currentUserItem
              ]}
              onPress={() => navigation.navigate('UserProfile', { userId: user.userId })}
            >
              <Text style={styles.leaderboardRank}>#{actualRank}</Text>
              
              <Image 
                source={{ uri: user.photoURL || 'https://via.placeholder.com/40' }} 
                style={styles.leaderboardAvatar} 
              />
              
              <View style={styles.leaderboardUserInfo}>
                <Text style={styles.leaderboardUserName}>
                  {user.displayName}
                  {isCurrentUser && ' (You)'}
                </Text>
                <Text style={styles.leaderboardUserDetails}>{user.branch}</Text>
              </View>
              
              <Text style={styles.leaderboardXP}>{user.xpPoints} XP</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading || leaderboard.length > 0) return null;
    
    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="trophy-outline" size={80} color="#0d6efd" />
        <Text style={styles.emptyStateTitle}>No data available</Text>
        <Text style={styles.emptyStateText}>
          {activeScope === 'friends' 
            ? "You don't have any friends yet or they haven't earned XP" 
            : "No leaderboard data available for this timeframe"}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
      </View>
      
      <View style={styles.tabsContainer}>
        {renderTimeframeTabs()}
        {renderScopeTabs()}
      </View>
      
      {renderUserRank()}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0d6efd" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#0d6efd']}
            />
          }
        >
          {renderTopThree()}
          {renderLeaderboardList()}
          {renderEmptyState()}
        </ScrollView>
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  tabsContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  timeframeTabs: {
    flexDirection: 'row',
    backgroundColor: '#f1f3f5',
    borderRadius: 25,
    padding: 5,
    marginBottom: 10,
  },
  timeframeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTimeframeTab: {
    backgroundColor: '#0d6efd',
  },
  timeframeTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  activeTimeframeTabText: {
    color: 'white',
  },
  scopeTabs: {
    flexDirection: 'row',
    backgroundColor: '#f1f3f5',
    borderRadius: 25,
    padding: 5,
  },
  scopeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeScopeTab: {
    backgroundColor: '#0d6efd',
  },
  scopeTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  activeScopeTabText: {
    color: 'white',
  },
  userRankContainer: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    alignItems: 'center',
  },
  userRankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  topThreeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  topUserContainer: {
    alignItems: 'center',
    flex: 1,
  },
  rankContainer: {
    marginBottom: 10,
  },
  medalContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  topUserAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#0d6efd',
  },
  topUserName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 5,
  },
  topUserXP: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0d6efd',
  },
  currentUserHighlight: {
    backgroundColor: '#e7f1ff',
    borderRadius: 10,
    padding: 10,
  },
  leaderboardListContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  leaderboardListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 15,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  currentUserItem: {
    backgroundColor: '#e7f1ff',
    borderRadius: 10,
    marginVertical: 5,
  },
  leaderboardRank: {
    width: 40,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6c757d',
  },
  leaderboardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  leaderboardUserInfo: {
    flex: 1,
  },
  leaderboardUserName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
  },
  leaderboardUserDetails: {
    fontSize: 12,
    color: '#6c757d',
  },
  leaderboardXP: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0d6efd',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 20,
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

export default LeaderboardTabScreen;
