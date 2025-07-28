import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { GamificationIcons, ProfileIcons } from '../../PngIcons';
import { GamificationService } from '../../services/GamificationService';
import { AuthService } from '../../services/AuthService';
import Card from '../../components/Card';
import ErrorBoundary from '../../components/ErrorBoundary';

const GamificationScreenContent = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({
    name: '',
    level: 1,
    xp: 0,
    nextLevelXp: 100,
    badges: [],
    unlockedBadges: []
  });

  const [leaderboard, setLeaderboard] = useState([
    { id: 1, name: 'John Doe', xp: 796, photoURL: require('../../assets/profile-placeholder.png') },
    { id: 2, name: 'Sarah Smith', xp: 720, photoURL: require('../../assets/profile-placeholder.png') },
    { id: 3, name: 'Michael Johnson', xp: 685, photoURL: require('../../assets/profile-placeholder.png') },
    { id: 4, name: 'Emily Davis', xp: 650, photoURL: require('../../assets/profile-placeholder.png') },
    { id: 5, name: 'David Wilson', xp: 620, photoURL: require('../../assets/profile-placeholder.png') },
  ]);

  const [challenges, setChallenges] = useState([
    { id: 1, title: 'Join 3 Groups', xp: 50, progress: 2, total: 3 },
    { id: 2, title: 'Make 5 New Connections', xp: 75, progress: 3, total: 5 },
    { id: 3, title: 'Attend an Event', xp: 100, progress: 0, total: 1 },
    { id: 4, title: 'Complete Your Profile', xp: 25, progress: 1, total: 1, completed: true },
  ]);

  const [activeTab, setActiveTab] = useState('badges');

  const loadUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Initialize user data first
      const currentUser = AuthService.getCurrentUser();
      await GamificationService.initializeUserData(currentUser.uid);

      // Fetch user data in parallel for better performance
      const [userBadges, userXP, leaderboardData, challengesData] = await Promise.all([
        GamificationService.getBadges(),
        GamificationService.getUserXP(),
        GamificationService.getLeaderboard(),
        GamificationService.getChallenges()
      ]);

      // Update all state at once to prevent multiple re-renders
      setUser(prevUser => ({
        ...prevUser,
        badges: userBadges || [],
        xp: userXP || 0,
        level: Math.floor((userXP || 0) / 100) + 1,
        nextLevelXp: (Math.floor((userXP || 0) / 100) + 1) * 100
      }));
      
      setLeaderboard(leaderboardData?.leaderboard || []);
      setChallenges(challengesData);
    } catch (error) {
      console.error('Error loading user data:', error);
      setError(error.message || 'Failed to load gamification data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  // Add refresh functionality
  const handleRefresh = () => {
    setRefreshing(true);
    loadUserData().then(() => setRefreshing(false));
  };

  // Add onRefresh handler
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadUserData().finally(() => setRefreshing(false));
  }, []);

  // Helper function to get the appropriate badge icon component
  const getBadgeIcon = (badge, size) => {
    switch (badge.type) {
      case 'achievement':
        return <GamificationIcons.TrophyAward size={size} />;
      case 'community':
        return <GamificationIcons.AccountGroup size={size} />;
      case 'match':
        return <GamificationIcons.AccountMultiple size={size} />;
      case 'event':
        return <GamificationIcons.Medal size={size} />;
      case 'progress':
        return <GamificationIcons.XP size={size} />;
      default:
        return <GamificationIcons.Badge size={size} />;
    }
  };

  const renderBadgeItem = ({ item }) => {
    const isUnlocked = user.unlockedBadges.includes(item.id);
    
    return (
      <TouchableOpacity 
        style={[styles.badgeItem, !isUnlocked && styles.lockedBadge]}
        onPress={() => handleBadgePress(item)}
      >
        <View style={[styles.badgeIcon, { backgroundColor: isUnlocked ? item.color + '20' : '#e9ecef' }]}>
          {getBadgeIcon(item, 30)}
        </View>
        <Text style={[styles.badgeName, !isUnlocked && styles.lockedText]}>
          {item.name}
        </Text>
        {!isUnlocked && (
          <View style={styles.lockIconContainer}>
            <ProfileIcons.Logout size={16} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderLeaderboardItem = ({ item, index }) => (
    <View style={styles.leaderboardItem}>
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>{index + 1}</Text>
      </View>
      <View style={styles.leaderboardUser}>
        <Text style={styles.leaderboardName}>{item.name}</Text>
      </View>
      <Text style={styles.leaderboardXP}>{item.xp} XP</Text>
    </View>
  );

  const renderChallengeItem = ({ item }) => (
    <View style={styles.challengeItem}>
      <View style={styles.challengeHeader}>
        <Text style={styles.challengeTitle}>{item.title}</Text>
        <Text style={styles.challengeXP}>+{item.xp} XP</Text>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(item.progress / item.total) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {item.progress}/{item.total}
        </Text>
      </View>
      {item.completed && (
        <View style={styles.completedBadge}>
          <MaterialCommunityIcons name="check" size={12} color="white" />
          <Text style={styles.completedText}>Completed</Text>
        </View>
      )}
    </View>
  );

  const handleBadgePress = (badge) => {
    // Navigate to badge details
    // navigation.navigate('BadgeDetailsScreen', { badge });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading gamification data...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Update FlatList with RefreshControl
  const renderContent = () => (
    <FlatList
      data={activeTab === 'badges' ? user.badges : []}
      renderItem={renderBadgeItem}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
      ListEmptyComponent={() => (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {error ? 'Error loading data' : 'No badges available'}
          </Text>
        </View>
      )}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Achievements</Text>
      </View>
      
      <View style={styles.levelContainer}>
        <View style={styles.levelInfo}>
          <Text style={styles.levelText}>Level {user.level}</Text>
          <Text style={styles.xpText}>{user.xp} / {user.nextLevelXp} XP</Text>
        </View>
        <View style={styles.xpBarContainer}>
          <View 
            style={[
              styles.xpBar, 
              { width: `${(user.xp / user.nextLevelXp) * 100}%` }
            ]} 
          />
        </View>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'badges' && styles.activeTab]}
          onPress={() => handleTabChange('badges')}
        >
          <Text style={[styles.tabText, activeTab === 'badges' && styles.activeTabText]}>
            Badges
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'leaderboard' && styles.activeTab]}
          onPress={() => handleTabChange('leaderboard')}
        >
          <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.activeTabText]}>
            Leaderboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'challenges' && styles.activeTab]}
          onPress={() => handleTabChange('challenges')}
        >
          <Text style={[styles.tabText, activeTab === 'challenges' && styles.activeTabText]}>
            Challenges
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'badges' && (
        <FlatList
          data={user.badges}
          renderItem={renderBadgeItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          contentContainerStyle={styles.badgesContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        />
      )}
      
      {activeTab === 'leaderboard' && (
        <FlatList
          data={leaderboard}
          renderItem={renderLeaderboardItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.leaderboardContainer}
        />
      )}
      
      {activeTab === 'challenges' && (
        <FlatList
          data={challenges}
          renderItem={renderChallengeItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.challengesContainer}
        />
      )}
    </View>
  );
};

// Wrapper component with ErrorBoundary
const GamificationScreen = () => {
  return (
    <ErrorBoundary>
      <GamificationScreenContent />
    </ErrorBoundary>
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  levelContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d6efd',
  },
  xpText: {
    fontSize: 14,
    color: '#6c757d',
  },
  xpBarContainer: {
    height: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 5,
  },
  xpBar: {
    height: '100%',
    backgroundColor: '#0d6efd',
    borderRadius: 5,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0d6efd',
  },
  tabText: {
    fontSize: 16,
    color: '#6c757d',
  },
  activeTabText: {
    color: '#0d6efd',
    fontWeight: '500',
  },
  badgesContainer: {
    padding: 16,
  },
  badgeItem: {
    width: '33%',
    alignItems: 'center',
    marginBottom: 20,
    padding: 5,
  },
  badgeIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    color: '#212529',
    textAlign: 'center',
  },
  lockedBadge: {
    opacity: 0.7,
  },
  lockedText: {
    color: '#adb5bd',
  },
  lockIconContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardContainer: {
    padding: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rankContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0d6efd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rankText: {
    color: 'white',
    fontWeight: 'bold',
  },
  leaderboardUser: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
  },
  leaderboardXP: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0d6efd',
  },
  challengesContainer: {
    padding: 16,
  },
  challengeItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
  },
  challengeXP: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0d6efd',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0d6efd',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6c757d',
    width: 30,
    textAlign: 'right',
  },
  completedBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#28a745',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 3,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default GamificationScreen;
