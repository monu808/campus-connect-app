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
import { GamificationService } from '../../services/GamificationService';

const LeaderboardScreen = () => {
  const navigation = useNavigation();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('weekly'); // weekly, monthly, alltime
  const [activeScope, setActiveScope] = useState('college'); // college, friends

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab, activeScope]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const result = await GamificationService.getLeaderboard(activeTab, activeScope);
      setLeaderboard(result.leaderboard);
      setUserRank(result.userRank);
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
      <View style={styles.timeframeTabs}>
        <TouchableOpacity 
          style={[
            styles.timeframeTab,
            activeTab === 'weekly' && styles.activeTimeframeTab
          ]}
          onPress={() => setActiveTab('weekly')}
        >
          <Text 
            style={[
              styles.timeframeTabText,
              activeTab === 'weekly' && styles.activeTimeframeTabText
            ]}
          >
            Weekly
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.timeframeTab,
            activeTab === 'monthly' && styles.activeTimeframeTab
          ]}
          onPress={() => setActiveTab('monthly')}
        >
          <Text 
            style={[
              styles.timeframeTabText,
              activeTab === 'monthly' && styles.activeTimeframeTabText
            ]}
          >
            Monthly
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.timeframeTab,
            activeTab === 'alltime' && styles.activeTimeframeTab
          ]}
          onPress={() => setActiveTab('alltime')}
        >
          <Text 
            style={[
              styles.timeframeTabText,
              activeTab === 'alltime' && styles.activeTimeframeTabText
            ]}
          >
            All Time
          </Text>
        </TouchableOpacity>
      </View>
      
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
        index < 3 && styles.topThreeItem,
        item.isCurrentUser && styles.currentUserItem
      ]}
      onPress={() => navigation.navigate('UserProfile', { userId: item.userId })}
    >
      <View style={styles.rankContainer}>
        {index < 3 ? (
          <View style={[styles.medalContainer, getMedalStyle(index)]}>
            <Text style={styles.medalText}>{index + 1}</Text>
          </View>
        ) : (
          <Text style={styles.rankText}>#{index + 1}</Text>
        )}
      </View>
      
      <Image 
        source={{ uri: item.photoURL || 'https://via.placeholder.com/40' }} 
        style={styles.userAvatar} 
      />
      
      <View style={styles.userInfoContainer}>
        <Text style={styles.userName}>{item.displayName}</Text>
        <Text style={styles.userBranch}>{item.branch}</Text>
      </View>
      
      <View style={styles.xpContainer}>
        <Text style={styles.leaderboardXP}>{item.xpPoints} XP</Text>
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
      {renderUserRank()}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0d6efd" />
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
    padding: 20,
  },
  timeframeTabs: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
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
    backgroundColor: '#f8f9fa',
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
