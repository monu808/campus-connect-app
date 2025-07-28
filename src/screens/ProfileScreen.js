import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NotificationIcons, GamificationIcons, SocialIcons, ProfileIcons, FormIcons } from '../PngIcons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { EventService } from '../services/EventService';
import { AuthService } from '../services/AuthService';
import { getValidImageSource } from '../utils/imageUtils';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
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
    badges: [
      { id: 1, name: 'First Match', iconComponent: GamificationIcons.AccountMultiple },
      { id: 2, name: 'Team Player', iconComponent: GamificationIcons.AccountGroup },
      { id: 3, name: 'Hackathon Hero', iconComponent: GamificationIcons.TrophyAward },
    ]
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
      
      const userDoc = await firestore().collection('users').doc(currentUser.uid).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        console.log('User data retrieved:', userData.fullName);
        
        // Log the photo URL for debugging
        console.log('Profile photo URL:', userData.photoURL);
        
        // Handle photo URL in the simplest possible way
        const defaultImage = require('../assets/profile-placeholder.png');
        let photoSource;
        
        // If photoURL is a string, use it as URI
        if (typeof userData.photoURL === 'string' && userData.photoURL.trim() !== '') {
          console.log('Using string URL:', userData.photoURL);
          photoSource = { uri: userData.photoURL };
        } else {
          console.log('Using default image');
          photoSource = defaultImage;
        }
        
        // Prepare user data for display
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
          level: userData.level || 1,
          xp: userData.xp || 0,
          badges: [
            { id: 1, name: 'First Match', iconComponent: GamificationIcons.AccountMultiple },
            { id: 2, name: 'Team Player', iconComponent: GamificationIcons.AccountGroup },
            { id: 3, name: 'Hackathon Hero', iconComponent: GamificationIcons.TrophyAward },
          ]
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

  const handleCreateTestEvents = async () => {
    try {
      const result = await EventService.createTestEvents();
      console.log('Created test events:', result);
      Alert.alert('Success', 'Test events created successfully!');
    } catch (error) {
      console.error('Error creating test events:', error);
      Alert.alert('Error', 'Failed to create test events. See console for details.');
    }
  };

  const handleDeleteTestEvents = async () => {
    try {
      const result = await EventService.deleteTestEvents();
      console.log('Deleted test events:', result);
      Alert.alert('Success', `Deleted ${result.deletedCount} test events!`);
    } catch (error) {
      console.error('Error deleting test events:', error);
      Alert.alert('Error', 'Failed to delete test events. See console for details.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={handleViewNotifications}
        >
          <NotificationIcons.Notification size={24} />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
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
              <View style={styles.xpBarContainer}>
                <View style={[styles.xpBar, { width: `${(user.xp % 100) / 100 * 100}%` }]} />
              </View>
              <Text style={styles.xpText}>{user.xp} XP</Text>
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
            <Text style={styles.sectionTitle}>Achievements</Text>
            <TouchableOpacity onPress={handleViewAchievements}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.badgesContainer}>
            {user.badges.map((badge) => (
              <View key={badge.id} style={styles.badgeItem}>
                <View style={styles.badgeIcon}>
                  <badge.iconComponent size={30} />
                </View>
                <Text style={styles.badgeName}>{badge.name}</Text>
              </View>
            ))}
          </View>
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
        
        <TouchableOpacity 
          style={[styles.signOutButton, {backgroundColor: '#0d6efd', marginTop: 10}]} 
          onPress={() => global.testIcons && global.testIcons()}>
          <ProfileIcons.CheckCircle size={20} color="white" />
          <Text style={[styles.signOutText, {color: 'white'}]}>Test Icons</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.signOutButton, {backgroundColor: '#28a745', marginTop: 10}]} 
          onPress={() => global.showPngIconsDemo && global.showPngIconsDemo()}>
          <GamificationIcons.Badge size={20} color="white" />
          <Text style={[styles.signOutText, {color: 'white'}]}>Show PNG Icons Demo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.signOutButton, {backgroundColor: '#17a2b8', marginTop: 10}]} 
          onPress={() => global.showPngIconsGuide && global.showPngIconsGuide()}>
          <FormIcons.Skills size={20} color="white" />
          <Text style={[styles.signOutText, {color: 'white'}]}>PNG Icons Guide</Text>
        </TouchableOpacity>

        {/* Developer Controls - Only visible in dev mode */}
        {__DEV__ && (
          <View style={styles.devControls}>
            <TouchableOpacity 
              style={[styles.devButton, styles.createButton]} 
              onPress={handleCreateTestEvents}
            >
              <Text style={styles.devButtonText}>Create Test Events</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.devButton, styles.deleteButton]} 
              onPress={handleDeleteTestEvents}
            >
              <Text style={styles.devButtonText}>Delete Test Events</Text>
            </TouchableOpacity>
          </View>
        )}
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
    marginBottom: 5,
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
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  badgeItem: {
    alignItems: 'center',
  },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e7f1ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  badgeName: {
    fontSize: 12,
    color: '#212529',
    textAlign: 'center',
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
  devControls: {
    padding: 16,
    gap: 10,
    marginTop: 16,
  },
  devButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  devButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
