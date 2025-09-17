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
  Animated,
  Dimensions,
  Share,
} from 'react-native';
import { NavigationIcons, GamificationIcons } from '../../Icons';
import { useNavigation } from '@react-navigation/native';
import GamificationService from '../../services/GamificationService';
import Card from '../../components/Card';
import BadgeRevealPopup from '../../components/BadgeRevealPopup';

const { width } = Dimensions.get('window');

const GamificationScreen = () => {
  const navigation = useNavigation();
  const [userGamificationData, setUserGamificationData] = useState(null);
  const [dailyChallenges, setDailyChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  
  // Badge reveal popup state
  const [badgeRevealVisible, setBadgeRevealVisible] = useState(false);
  const [revealedBadge, setRevealedBadge] = useState(null);

  useEffect(() => {
    loadGamificationData();
    
    // Register badge reveal callback
    const unregister = GamificationService.registerBadgeRevealCallback(handleBadgeReveal);
    
    return () => {
      unregister();
    };
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
      
      // Deduplicate badges to prevent duplicate key errors
      if (userData.badges) {
        userData.badges = userData.badges.filter((badge, index, array) => 
          array.findIndex(b => b.id === badge.id) === index
        );
      }
      
      setUserGamificationData(userData);
      setDailyChallenges(challenges);
      setLeaderboard(leaderboardData);
      
      // Animate content entrance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error('Error loading gamification data:', error);
      Alert.alert('Error', 'Failed to load gamification data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBadgeReveal = (badge) => {
    setRevealedBadge(badge);
    setBadgeRevealVisible(true);
  };

  const handleCloseBadgeReveal = () => {
    setBadgeRevealVisible(false);
    setRevealedBadge(null);
    // Refresh data to show new badge
    loadGamificationData();
  };

  const handleShareBadge = async (badge) => {
    try {
      const message = `🎉 I just earned the "${badge.name}" badge in Campus Connect! 🏆\n\n${badge.description}\n\nJoin me on Campus Connect to start your achievement journey!`;
      
      await Share.share({
        message,
        title: `New Badge Earned: ${badge.name}`,
      });
    } catch (error) {
      console.error('Error sharing badge:', error);
    }
  };

  // Test function to demonstrate badge reveal (remove in production)
  const handleTestBadgeReveal = () => {
    const testBadge = {
      id: 'first_connection',
      name: 'Social Butterfly',
      description: 'Made your first connection on campus',
      category: 'social',
      rarity: 'epic',
      earnedAt: new Date(),
      xpReward: 100
    };
    handleBadgeReveal(testBadge);
  };

  const handleCompleteChallenge = async (challengeId) => {
    try {
      const result = await GamificationService.completeChallenge(challengeId);
      if (result.success) {
        Alert.alert(
          'Challenge Completed!', 
          `You earned ${result.xpAwarded} XP!`,
          [{ text: 'OK', onPress: () => loadGamificationData() }]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to complete challenge');
      }
    } catch (error) {
      console.error('Error completing challenge:', error);
      Alert.alert('Error', 'Failed to complete challenge. Please try again.');
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

  const getLevelCardColor = (level) => {
    const colors = [
      '#6A4C93', // Purple-blue (Level 1-2)
      '#8E4EC6', // Purple (Level 3-4)
      '#A663CC', // Light purple (Level 5-6)
      '#4E79A7', // Blue (Level 7-8)
      '#52A9BD', // Light blue (Level 9-10)
      '#59CD90', // Green (Level 11-12)
      '#F9D71C', // Yellow (Level 13-14)
      '#F2994A', // Orange (Level 15-16)
      '#F2711C', // Dark orange (Level 17-18)
      '#E74C3C', // Red-gold (Level 19-20)
    ];
    
    const colorIndex = Math.min(Math.floor((level - 1) / 2), colors.length - 1);
    return colors[colorIndex];
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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <NavigationIcons.Back size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Campus Achievements</Text>
          <Text style={styles.headerSubtitle}>Track your campus journey</Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadGamificationData}
        >
          <GamificationIcons.Star size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.refreshButton, { marginLeft: 8, backgroundColor: 'rgba(255,255,255,0.5)' }]}
          onPress={handleTestBadgeReveal}
          activeOpacity={0.7}
        >
          <GamificationIcons.TrophyAward size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView 
        style={[styles.scrollView, {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced User Progress Card */}
        <View style={[styles.progressCard, { backgroundColor: getLevelCardColor(userGamificationData?.level || 1) }]}>
          <View style={styles.progressContent}>
            <View style={styles.progressHeader}>
              <View style={styles.levelBadge}>
                <GamificationIcons.TrophyAward size={24} color="#FFFFFF" />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.levelTitle}>
                  {userGamificationData?.levelTitle || 'Freshman Explorer'}
                </Text>
                <Text style={styles.levelText}>
                  Level {userGamificationData?.level || 1}
                </Text>
              </View>
            </View>
            
            <View style={styles.xpSection}>
              <Text style={styles.xpText}>
                {userGamificationData?.xpPoints || 0} XP
              </Text>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <Animated.View 
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
          </View>
        </View>

        {/* Enhanced Stats Overview */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#4CAF50' }]}>
                <GamificationIcons.AccountMultiple size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.statNumber}>{userGamificationData?.groupsJoined || 0}</Text>
              <Text style={styles.statLabel}>Groups Joined</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#2196F3' }]}>
                <GamificationIcons.School size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.statNumber}>{userGamificationData?.eventsAttended || 0}</Text>
              <Text style={styles.statLabel}>Events Attended</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#FF9800' }]}>
                <GamificationIcons.Medal size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.statNumber}>{userGamificationData?.badges?.length || 0}</Text>
              <Text style={styles.statLabel}>Badges Earned</Text>
            </View>
          </View>
        </View>

        {/* Enhanced Badges Section */}
        <View style={styles.badgesCard}>
          <Text style={styles.sectionTitle}>Your Badges</Text>
          {userGamificationData?.badges && userGamificationData.badges.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.badgesScrollContainer}
            >
              {userGamificationData.badges.map((badge, index) => (
                <View key={`badge-${badge.id || badge.name || index}-${index}`} style={styles.badgeItem}>
                  <View style={[styles.badgeIcon, { backgroundColor: getRarityColor(badge.rarity) }]}>
                    <GamificationIcons.TrophyAward size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.badgeName} numberOfLines={2}>{badge.name}</Text>
                  <Text style={styles.badgeCategory}>{badge.category}</Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyBadgesContainer}>
              <GamificationIcons.TrophyAward size={48} color="#E0E0E0" />
              <Text style={styles.emptyText}>No badges earned yet</Text>
              <Text style={styles.emptySubtext}>Complete activities to earn your first badge!</Text>
            </View>
          )}
        </View>

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

        {/* Enhanced Daily Challenges Section */}
        <View style={styles.challengesCard}>
          <Text style={styles.sectionTitle}>Daily Challenges</Text>
          {dailyChallenges && dailyChallenges.length > 0 ? (
            <View style={styles.challengesContainer}>
              {dailyChallenges.map((challenge, index) => (
                <View key={challenge.id} style={styles.challengeItem}>
                  <View style={styles.challengeHeader}>
                    <View style={[styles.challengeIcon, { backgroundColor: '#2196F3' }]}>
                      <GamificationIcons.Target size={20} color="#FFFFFF" />
                    </View>
                    <View style={styles.challengeInfo}>
                      <Text style={styles.challengeTitle}>{challenge.title}</Text>
                      <Text style={styles.challengeDescription}>{challenge.description}</Text>
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
                    <View style={styles.challengeActions}>
                      <Text style={styles.xpReward}>+{challenge.xpReward} XP</Text>
                      <TouchableOpacity 
                        style={[
                          styles.completeButton,
                          challenge.progress >= challenge.target ? styles.completedButton : styles.activeButton
                        ]}
                        onPress={() => handleCompleteChallenge(challenge.id)}
                        disabled={challenge.progress >= challenge.target}
                      >
                        <Text style={[
                          styles.completeButtonText,
                          challenge.progress >= challenge.target ? styles.completedButtonText : styles.activeButtonText
                        ]}>
                          {challenge.progress >= challenge.target ? 'Completed' : 'Complete'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyChallengesContainer}>
              <GamificationIcons.Target size={48} color="#E0E0E0" />
              <Text style={styles.emptyText}>No challenges available today</Text>
              <Text style={styles.emptySubtext}>Check back tomorrow for new challenges!</Text>
            </View>
          )}
        </View>

        {/* Enhanced Leaderboard Preview Section */}
        <View style={styles.leaderboardCard}>
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
                  <View style={[
                    styles.rankBadge, 
                    { backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32' }
                  ]}>
                    <Text style={[styles.rankText, { color: index < 2 ? '#000' : '#FFF' }]}>
                      #{user.rank}
                    </Text>
                  </View>
                  <View style={styles.userInfoLeaderboard}>
                    <Text style={styles.userName} numberOfLines={1}>{user.displayName}</Text>
                    <Text style={styles.userLevel}>{user.levelTitle}</Text>
                  </View>
                  <Text style={styles.userXP}>{user.xp} XP</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyLeaderboardContainer}>
              <GamificationIcons.TrophyAward size={48} color="#E0E0E0" />
              <Text style={styles.emptyText}>No leaderboard data yet</Text>
              <Text style={styles.emptySubtext}>Be the first to earn XP!</Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* Badge Reveal Popup */}
      <BadgeRevealPopup
        visible={badgeRevealVisible}
        badge={revealedBadge}
        onClose={handleCloseBadgeReveal}
        onShare={handleShareBadge}
        enableSounds={true}
      />
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
    backgroundColor: '#667eea',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
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
    marginBottom: 12,
    borderRadius: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  progressContent: {
    padding: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  levelBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  levelText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  xpSection: {
    alignItems: 'center',
  },
  xpText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  badgesCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  badgesScrollContainer: {
    paddingHorizontal: 4,
  },
  badgeItem: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 90,
  },
  badgeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeCategory: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  emptyBadgesContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  challengesCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  challengesContainer: {
    gap: 12,
  },
  challengeItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  challengeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  challengeProgress: {
    marginBottom: 8,
  },
  progressBarChallenge: {
    width: '100%',
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFillChallenge: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  challengeProgressText: {
    fontSize: 12,
    color: '#666',
  },
  challengeActions: {
    alignItems: 'flex-end',
  },
  xpReward: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 8,
  },
  completeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#4CAF50',
  },
  completedButton: {
    backgroundColor: '#E0E0E0',
  },
  completeButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeButtonText: {
    color: '#FFFFFF',
  },
  completedButtonText: {
    color: '#999',
  },
  emptyChallengesContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  leaderboardCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 8,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  viewAllText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  leaderboardContainer: {
    gap: 8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  userInfoLeaderboard: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  userLevel: {
    fontSize: 12,
    color: '#666',
  },
  userXP: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  emptyLeaderboardContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
});

export default GamificationScreen;
