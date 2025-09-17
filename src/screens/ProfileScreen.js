import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Animated } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NotificationIcons, GamificationIcons, SocialIcons, ProfileIcons, FormIcons } from '../Icons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { EventService } from '../services/EventService';
import { AuthService } from '../services/AuthService';
import GamificationService from '../services/GamificationService';
import { getImageSource } from '../utils/imageStorageUtils';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [badgeAnimation] = useState(new Animated.Value(1));
  const [user, setUser] = useState({
    fullName: '',
    branch: '',
    year: '',
    photoURL: require('../assets/profile-placeholder.png'),
    skills: [],
    interests: [],
    bio: '',
    github: '',
    linkedin: '',
    level: 1,
    xp: 0,
    badges: [] // Remove placeholder badges - they'll be loaded from gamification service
  });
  
  // Fetch user data when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
      return () => {}; // cleanup if needed
    }, [])
  );
  
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        console.error('No user logged in');
        setLoading(false);
        return;
      }
      
      // Fetch user profile and gamification data in parallel
      const [userDoc, gamificationData] = await Promise.all([
        firestore().collection('users').doc(currentUser.uid).get(),
        GamificationService.getUserData().catch(error => {
          console.warn('Error fetching gamification data:', error);
          return { xpPoints: 0, level: 1, levelTitle: 'Freshman Explorer', badges: [] };
        })
      ]);
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        console.log('User data retrieved:', userData.fullName);
        
        // Log the photo URL for debugging
        console.log('Profile photo URL:', userData.photoURL);
        
        // Use the proper image source utility
        const defaultImage = require('../assets/profile-placeholder.png');
        const photoSource = getImageSource(userData.photoURL, defaultImage);
        
        // Prepare user data for display with gamification data
        setUser({
          fullName: userData.fullName || 'Anonymous User',
          branch: userData.branch || '',
          year: userData.year || '',
          photoURL: photoSource,
          skills: userData.skills || [],
          interests: userData.interests || [],
          bio: userData.bio || 'No bio added yet.',
          github: userData.github || '',
          linkedin: userData.linkedin || '',
          level: gamificationData.level || 1,
          levelTitle: gamificationData.levelTitle || 'Freshman Explorer',
          xp: gamificationData.xpPoints || 0,
          nextLevelXP: gamificationData.nextLevelXP || 100,
          badges: gamificationData.badges ? 
            // Deduplicate badges by ID to prevent duplicate key errors
            gamificationData.badges.filter((badge, index, array) => 
              array.findIndex(b => b.id === badge.id) === index
            ) : []
        });
      } else {
        console.warn('No user document found in Firestore');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    // Navigate to profile edit screen
    navigation.navigate('EditProfileScreen');
  };

  const handleViewAchievements = () => {
    navigation.navigate('GamificationScreen');
  };

  const getBadgeColor = (rarity) => {
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
      '#667eea', // Level 1-2: Purple Blue
      '#764ba2', // Level 3-4: Deep Purple
      '#f093fb', // Level 5-6: Pink Purple
      '#f5576c', // Level 7-8: Pink Red
      '#4facfe', // Level 9-10: Light Blue
      '#00f2fe', // Level 11-12: Cyan
      '#43e97b', // Level 13-14: Green
      '#38f9d7', // Level 15-16: Turquoise
      '#ffecd2', // Level 17-18: Orange Yellow
      '#fcb69f', // Level 19-20: Gold Orange
    ];
    const colorIndex = Math.min(Math.floor((level - 1) / 2), colors.length - 1);
    return colors[colorIndex];
  };

  const handleBadgePress = (badge) => {
    const badgeId = badge.id || badge.name;
    if (selectedBadge === badgeId) {
      // Animate back to normal
      Animated.spring(badgeAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
      setSelectedBadge(null);
    } else {
      // Animate pop out
      setSelectedBadge(badgeId);
      Animated.spring(badgeAnimation, {
        toValue: 1.2,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  };

  const handleViewNotifications = () => {
    navigation.navigate('NotificationsScreen');
  };

  const handleSignOut = async () => {
    try {
      await auth().signOut();
      // The auth state listener in App.js will automatically detect this change
      // and navigate to the onboarding screen
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={fetchUserData}
          >
            <FormIcons.Refresh size={20} color="#0d6efd" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={handleViewNotifications}
          >
            <NotificationIcons.Notification size={24} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0d6efd" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : (
          <View style={styles.profileHeader}>
            <Image 
              source={user.photoURL}
              style={styles.profilePhoto}
              defaultSource={require('../assets/profile-placeholder.png')}
              onError={() => {
                console.warn('Error loading profile image, falling back to default');
                setUser(prevUser => ({
                  ...prevUser,
                  photoURL: require('../assets/profile-placeholder.png')
                }));
              }}
            />
            <Text style={styles.profileName}>{user.fullName}</Text>
            <Text style={styles.profileDetails}>{user.branch}{user.year ? `, ${user.year}` : ''}</Text>
            
            <View style={styles.levelContainer}>
              <Text style={styles.levelText}>Level {user.level}</Text>
              <Text style={styles.levelTitle}>{user.levelTitle}</Text>
              <View style={styles.xpBarContainer}>
                <View style={[styles.xpBar, { width: `${((user.xp || 0) % (user.nextLevelXP || 100)) / (user.nextLevelXP || 100) * 100}%` }]} />
              </View>
              <Text style={styles.xpText}>{user.xp || 0} XP</Text>
              <Text style={styles.nextLevelText}>
                {user.nextLevelXP ? `${user.nextLevelXP - (user.xp || 0)} XP to next level` : ''}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>About</Text>
          </View>
          <Text style={styles.bioText}>{user.bio}</Text>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Skills</Text>
          </View>
          <View style={styles.tagsContainer}>
            {user.skills.map((skill, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Interests</Text>
          </View>
          <View style={styles.tagsContainer}>
            {user.interests.map((interest, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Campus Progress</Text>
            <TouchableOpacity onPress={() => navigation.navigate('LeaderboardScreen')}>
              <Text style={styles.viewAllText}>Leaderboard</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressStats}>
              <View style={styles.statItem}>
                <GamificationIcons.Star size={20} color="#0d6efd" />
                <Text style={styles.statNumber}>{user.xp || 0}</Text>
                <Text style={styles.statLabel}>XP Points</Text>
              </View>
              <View style={styles.statItem}>
                <GamificationIcons.TrophyAward size={20} color="#0d6efd" />
                <Text style={styles.statNumber}>{user.level || 1}</Text>
                <Text style={styles.statLabel}>Level</Text>
              </View>
              <View style={styles.statItem}>
                <GamificationIcons.Medal size={20} color="#0d6efd" />
                <Text style={styles.statNumber}>{user.badges?.length || 0}</Text>
                <Text style={styles.statLabel}>Badges</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.challengesButton}
              onPress={() => navigation.navigate('GamificationScreen')}
            >
              <GamificationIcons.Target size={20} color="#0d6efd" />
              <Text style={styles.challengesButtonText}>View Challenges & Stats</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievement Badges</Text>
            <TouchableOpacity onPress={handleViewAchievements}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesScrollView}>
            <View style={styles.badgesContainer}>
              {user.badges && user.badges.length > 0 ? (
                user.badges.map((badge, index) => (
                  <TouchableOpacity 
                    key={`badge-${badge.id || badge.name || index}-${index}`}
                    onPress={() => handleBadgePress(badge)}
                    activeOpacity={0.7}
                  >
                    <Animated.View 
                      style={[
                        styles.badgeItem,
                        selectedBadge === badge.id || selectedBadge === badge.name ? {
                          transform: [{ scale: badgeAnimation }],
                          elevation: 5,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.25,
                          shadowRadius: 3.84,
                        } : {}
                      ]}
                    >
                      <View style={[styles.badgeIcon, { backgroundColor: getBadgeColor(badge.rarity) }]}>
                        <GamificationIcons.TrophyAward size={24} color="#FFFFFF" />
                      </View>
                      <Text style={styles.badgeName}>{badge.name}</Text>
                      <Text style={styles.badgeCategory}>{badge.category}</Text>
                    </Animated.View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noBadgesContainer}>
                  <GamificationIcons.TrophyAward size={32} color="#CCC" />
                  <Text style={styles.noBadgesText}>No badges earned yet</Text>
                  <Text style={styles.noBadgesSubtext}>Complete activities to earn your first badge!</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Social Profiles</Text>
          </View>
          <View style={styles.socialContainer}>
            {user.github && (
              <TouchableOpacity style={styles.socialItem}>
                <SocialIcons.Github size={24} />
                <Text style={styles.socialText}>GitHub: {user.github}</Text>
              </TouchableOpacity>
            )}
            {user.linkedin && (
              <TouchableOpacity style={styles.socialItem}>
                <SocialIcons.LinkedIn size={24} />
                <Text style={styles.socialText}>LinkedIn: {user.linkedin}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <ProfileIcons.Logout size={20} color="#dc3545" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        {/* Footer content can go here */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    padding: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  header: {
    backgroundColor: '#0d6efd',
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#dc3545',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 8,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 5,
  },
  profileDetails: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 15,
  },
  levelContainer: {
    width: '100%',
    marginBottom: 20,
  },
  levelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0d6efd',
    marginBottom: 2,
  },
  levelTitle: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  xpBarContainer: {
    height: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 5,
    marginBottom: 5,
  },
  xpBar: {
    height: '100%',
    backgroundColor: '#0d6efd',
    borderRadius: 5,
  },
  xpText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'right',
  },
  nextLevelText: {
    fontSize: 10,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 2,
  },
  editButton: {
    backgroundColor: '#0d6efd',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  viewAllText: {
    fontSize: 14,
    color: '#0d6efd',
  },
  bioText: {
    fontSize: 16,
    color: '#212529',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e7f1ff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#0d6efd',
  },
  badgesScrollView: {
    paddingVertical: 8,
  },
  badgesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  badgeItem: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 80,
  },
  badgeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e7f1ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  badgeName: {
    fontSize: 11,
    color: '#212529',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  badgeCategory: {
    fontSize: 9,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 2,
  },
  noBadgesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    flex: 1,
  },
  noBadgesText: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 8,
    fontWeight: 'bold',
  },
  noBadgesSubtext: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
    textAlign: 'center',
  },
  progressContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginTop: 8,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flexDirection: 'row',
    flexDirection: 'column',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d6efd',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  challengesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#0d6efd',
  },
  challengesButtonText: {
    fontSize: 14,
    color: '#0d6efd',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  socialContainer: {
    marginTop: 5,
  },
  socialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  socialText: {
    fontSize: 16,
    color: '#212529',
    marginLeft: 10,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 15,
    marginTop: 10,
    marginBottom: 30,
  },
  signOutText: {
    fontSize: 16,
    color: '#dc3545',
    marginLeft: 10,
  },
});

export default ProfileScreen;
