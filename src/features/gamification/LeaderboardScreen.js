import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import GamificationService from '../../services/GamificationService';

const LeaderboardScreen = () => {
  const navigation = useNavigation();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('xp'); // xp, level, events, groups, connections

  useEffect(() => {
    fetchLeaderboard();
  }, [activeCategory]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const result = await GamificationService.getLeaderboard(activeCategory, 50);
      setLeaderboard(result);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Leaderboard</Text>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <View style={styles.categoryTabs}>
        <TouchableOpacity 
          style={[
            styles.categoryTab,
            activeCategory === 'xp' && styles.activeCategoryTab
          ]}
          onPress={() => setActiveCategory('xp')}
        >
          <Text 
            style={[
              styles.categoryTabText,
              activeCategory === 'xp' && styles.activeCategoryTabText
            ]}
          >
            XP Points
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.categoryTab,
            activeCategory === 'level' && styles.activeCategoryTab
          ]}
          onPress={() => setActiveCategory('level')}
        >
          <Text 
            style={[
              styles.categoryTabText,
              activeCategory === 'level' && styles.activeCategoryTabText
            ]}
          >
            Level
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.categoryTab,
            activeCategory === 'events' && styles.activeCategoryTab
          ]}
          onPress={() => setActiveCategory('events')}
        >
          <Text 
            style={[
              styles.categoryTabText,
              activeCategory === 'events' && styles.activeCategoryTabText
            ]}
          >
            Events
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.categoryTab,
            activeCategory === 'groups' && styles.activeCategoryTab
          ]}
          onPress={() => setActiveCategory('groups')}
        >
          <Text 
            style={[
              styles.categoryTabText,
              activeCategory === 'groups' && styles.activeCategoryTabText
            ]}
          >
            Groups
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderUserRank = () => (
    <View style={styles.userRankContainer}>
      <Text style={styles.userRankText}>Your Rank: #{userRank}</Text>
    </View>
  );

  const renderLeaderboardItem = ({ item, index }) => (
    <TouchableOpacity 
      style={[
        styles.leaderboardItem,
        index < 3 && styles.topThreeItem
      ]}
      onPress={() => navigation.navigate('UserProfileScreen', { userId: item.userId })}
    >
      <View style={styles.rankContainer}>
        {index < 3 ? (
          <View style={[styles.medalContainer, getMedalStyle(index)]}>
            <Text style={styles.medalText}>{item.rank}</Text>
          </View>
        ) : (
          <Text style={styles.rankText}>#{item.rank}</Text>
        )}
      </View>
      
      <View style={styles.userInfoContainer}>
        <Text style={styles.userName}>{item.displayName}</Text>
        <Text style={styles.userLevel}>{item.levelTitle}</Text>
      </View>
      
      <View style={styles.xpContainer}>
        <Text style={styles.leaderboardXP}>
          {activeCategory === 'xp' ? `${item.xp} XP` : 
           activeCategory === 'level' ? `Level ${item.level}` :
           activeCategory === 'events' ? `${item.stats.eventsAttended || 0} Events` :
           activeCategory === 'groups' ? `${item.stats.groupsJoined || 0} Groups` :
           `${item.stats.connectionsTotal || 0} Connections`}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const getMedalStyle = (index) => {
    switch (index) {
      case 0:
        return styles.goldMedal;
      case 1:
        return styles.silverMedal;
      case 2:
        return styles.bronzeMedal;
      default:
        return {};
    }
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderTabs()}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0d6efd" />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      ) : (
        <FlatList
          data={leaderboard}
          keyExtractor={(item) => item.userId}
          renderItem={renderLeaderboardItem}
          contentContainerStyle={styles.leaderboardList}
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
  },
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryTabs: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    padding: 5,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeCategoryTab: {
    backgroundColor: '#0d6efd',
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6c757d',
  },
  activeCategoryTabText: {
    color: 'white',
  },
  userRankContainer: {
    alignItems: 'center',
    marginBottom: 15,
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
  leaderboardList: {
    paddingHorizontal: 20,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  topThreeItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  currentUserItem: {
    backgroundColor: '#e7f1ff',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  medalContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goldMedal: {
    backgroundColor: '#ffc107',
  },
  silverMedal: {
    backgroundColor: '#adb5bd',
  },
  bronzeMedal: {
    backgroundColor: '#cd7f32',
  },
  medalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6c757d',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userInfoContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
  },
  userBranch: {
    fontSize: 12,
    color: '#6c757d',
  },
  xpContainer: {
    paddingHorizontal: 10,
  },
  leaderboardXP: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0d6efd',
  },
});

export default LeaderboardScreen;
