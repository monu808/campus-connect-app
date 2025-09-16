import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { NavigationIcons, GamificationIcons } from '../../Icons';
import { useNavigation } from '@react-navigation/native';
import GamificationService from '../../services/GamificationService';
import Card from '../../components/Card';

const GamificationScreen = () => {
  const navigation = useNavigation();
  const [userGamificationData, setUserGamificationData] = useState(null);
  const [dailyChallenges, setDailyChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    try {
      setLoading(true);
      
      // Load all gamification data in parallel
      const [userData, challenges, leaderboardData] = await Promise.all([
        GamificationService.getUserData(),
        GamificationService.getDailyChallenges(),
        GamificationService.getLeaderboard('xp', 5) // Top 5 for preview
      ]);
      
      setUserGamificationData(userData);
      setDailyChallenges(challenges);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading gamification data:', error);
      Alert.alert('Error', 'Failed to load gamification data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#4CAF50';
      case 'uncommon': return '#2196F3';
      case 'rare': return '#9C27B0';
      case 'epic': return '#FF9800';
      case 'legendary': return '#F44336';
      default: return '#757575';
    }
  };
        if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0d6efd" />
          <Text style={styles.loadingText}>Loading your achievements...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Campus Achievements</Text>
        <Text style={styles.headerSubtitle}>Track your campus journey</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* User Progress Card */}
        <Card style={styles.progressCard}>
          <View style={styles.progressContent}>
            <View style={styles.userInfo}>
              <Text style={styles.levelTitle}>
                {userGamificationData?.levelTitle || 'Freshman Explorer'}
              </Text>
              <Text style={styles.levelText}>
                Level {userGamificationData?.level || 1}
              </Text>
              <Text style={styles.xpText}>
                {userGamificationData?.xpPoints || 0} XP
              </Text>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(userGamificationData?.levelProgress || 0)}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {userGamificationData?.nextLevelXP || 100} XP to next level
              </Text>
            </View>
          </View>
        </Card>

        {/* Badges Section */}
        <Card style={styles.badgesCard}>
          <Text style={styles.sectionTitle}>Your Badges</Text>
          {userGamificationData?.badges && userGamificationData.badges.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.badgesContainer}>
                {userGamificationData.badges.map((badge, index) => (
                  <View key={index} style={styles.badgeItem}>
                    <View style={[styles.badgeIcon, { backgroundColor: getRarityColor(badge.rarity) }]}>
                      <GamificationIcons.TrophyAward size={24} />
                    </View>
                    <Text style={styles.badgeName}>{badge.name}</Text>
                    <Text style={styles.badgeCategory}>{badge.category}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>
              No badges earned yet. Complete activities to earn your first badge!
            </Text>
          )}
        </Card>

        {/* Quick Stats */}
        <Card style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {userGamificationData?.stats?.groupsJoined || 0}
              </Text>
              <Text style={styles.statLabel}>Groups Joined</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {userGamificationData?.stats?.eventsAttended || 0}
              </Text>
              <Text style={styles.statLabel}>Events Attended</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {userGamificationData?.stats?.connectionsTotal || 0}
              </Text>
              <Text style={styles.statLabel}>Connections</Text>
            </View>
          </View>
        </Card>

        {/* Daily Challenges Section */}
        <Card style={styles.challengesCard}>
          <Text style={styles.sectionTitle}>Daily Challenges</Text>
          {dailyChallenges && dailyChallenges.length > 0 ? (
            <View style={styles.challengesContainer}>
              {dailyChallenges.map((challenge, index) => (
                <View key={challenge.id} style={styles.challengeItem}>
                  <View style={styles.challengeHeader}>
                    <View style={styles.challengeIcon}>
                      <GamificationIcons.Target size={20} />
                    </View>
                    <View style={styles.challengeInfo}>
                      <Text style={styles.challengeTitle}>{challenge.title}</Text>
                      <Text style={styles.challengeDescription}>{challenge.description}</Text>
                    </View>
                    <View style={styles.challengeReward}>
                      <Text style={styles.xpReward}>+{challenge.xpReward} XP</Text>
                    </View>
                  </View>
                  <View style={styles.challengeProgress}>
                    <View style={styles.progressBarChallenge}>
                      <View 
                        style={[
                          styles.progressFillChallenge, 
                          { width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.challengeProgressText}>
                      {challenge.progress}/{challenge.target}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>
              No challenges available today. Check back tomorrow!
            </Text>
          )}
        </Card>

        {/* Leaderboard Preview Section */}
        <Card style={styles.leaderboardCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Leaderboard</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('LeaderboardScreen')}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {leaderboard && leaderboard.length > 0 ? (
            <View style={styles.leaderboardContainer}>
              {leaderboard.slice(0, 3).map((user, index) => (
                <View key={user.userId} style={styles.leaderboardItem}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{user.rank}</Text>
                  </View>
                  <View style={styles.userInfoLeaderboard}>
                    <Text style={styles.userName}>{user.displayName}</Text>
                    <Text style={styles.userLevel}>{user.levelTitle}</Text>
                  </View>
                  <Text style={styles.userXP}>{user.xp} XP</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>
              Leaderboard loading... Be the first to earn XP!
            </Text>
          )}
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  header: {
    padding: 20,
    backgroundColor: '#0d6efd',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 4,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  progressCard: {
    margin: 16,
    backgroundColor: '#667eea',
  },
  progressContent: {
    padding: 20,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  levelText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 4,
  },
  xpText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  progressBarContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  badgesCard: {
    margin: 16,
    marginTop: 0,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  badgesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  badgeItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  badgeCategory: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  statsCard: {
    margin: 16,
    marginTop: 0,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d6efd',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  challengesCard: {
    margin: 16,
    marginTop: 0,
  },
  challengesContainer: {
    gap: 12,
  },
  challengeItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0d6efd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  challengeDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  challengeReward: {
    alignItems: 'center',
  },
  xpReward: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0d6efd',
  },
  challengeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarChallenge: {
    flex: 1,
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    marginRight: 8,
  },
  progressFillChallenge: {
    height: '100%',
    backgroundColor: '#28a745',
    borderRadius: 2,
  },
  challengeProgressText: {
    fontSize: 12,
    color: '#666',
    minWidth: 30,
  },
  leaderboardCard: {
    margin: 16,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#0d6efd',
    borderRadius: 4,
  },
  viewAllText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  leaderboardContainer: {
    gap: 8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffc107',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  userInfoLeaderboard: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  userLevel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  userXP: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0d6efd',
  },
});

export default GamificationScreen;
