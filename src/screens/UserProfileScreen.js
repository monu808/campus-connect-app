import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NotificationIcons, GamificationIcons, SocialIcons, ProfileIcons, FormIcons } from '../Icons';
import firestore from '@react-native-firebase/firestore';
import { getImageSource } from '../utils/imageStorageUtils';

const UserProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, userName } = route.params || {};
  
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
    badges: []
  });
  
  useEffect(() => {
    if (userId) {
      fetchUserData();
    } else {
      Alert.alert('Error', 'User ID is required');
      navigation.goBack();
    }
  }, [userId]);
  
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      const userDoc = await firestore().collection('users').doc(userId).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        console.log('Fetched user profile data for:', userData.fullName || userData.displayName);
        
        // Use the proper image source utility
        const defaultImage = require('../assets/profile-placeholder.png');
        const photoSource = getImageSource(userData.photoURL, defaultImage);
        
        // Prepare user data for display
        setUser({
          fullName: userData.fullName || userData.displayName || 'Anonymous User',
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
          badges: userData.badges || []
        });
      } else {
        Alert.alert('Error', 'User profile not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d6efd" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            source={user.photoURL}
            style={styles.profileImage}
          />
          <View style={styles.headerText}>
            <Text style={styles.profileName}>{user.fullName}</Text>
            <Text style={styles.profileDetails}>
              {user.branch} {user.year && `• ${user.year}`}
            </Text>
          </View>
        </View>
      </View>

      {/* Bio Section */}
      {user.bio && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ProfileIcons.Profile size={20} color="#0d6efd" />
            <Text style={styles.sectionTitle}>About</Text>
          </View>
          <Text style={styles.bioText}>{user.bio}</Text>
        </View>
      )}

      {/* Skills Section */}
      {user.skills && user.skills.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FormIcons.Skill size={20} color="#0d6efd" />
            <Text style={styles.sectionTitle}>Skills</Text>
          </View>
          <View style={styles.skillsContainer}>
            {user.skills.map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Interests Section */}
      {user.interests && user.interests.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ProfileIcons.Heart size={20} color="#0d6efd" />
            <Text style={styles.sectionTitle}>Interests</Text>
          </View>
          <View style={styles.skillsContainer}>
            {user.interests.map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Social Links */}
      {(user.github || user.linkedin) && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SocialIcons.Link size={20} color="#0d6efd" />
            <Text style={styles.sectionTitle}>Social Links</Text>
          </View>
          <View style={styles.socialLinksContainer}>
            {user.github && (
              <TouchableOpacity style={styles.socialLink}>
                <SocialIcons.Github size={24} color="#333" />
                <Text style={styles.socialLinkText}>GitHub</Text>
              </TouchableOpacity>
            )}
            {user.linkedin && (
              <TouchableOpacity style={styles.socialLink}>
                <SocialIcons.Linkedin size={24} color="#0077B5" />
                <Text style={styles.socialLinkText}>LinkedIn</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Gamification Section (if data exists) */}
      {(user.xp > 0 || user.badges.length > 0) && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <GamificationIcons.TrophyAward size={20} color="#0d6efd" />
            <Text style={styles.sectionTitle}>Achievements</Text>
          </View>
          
          {user.xp > 0 && (
            <View style={styles.gamificationItem}>
              <View style={styles.levelContainer}>
                <Text style={styles.levelText}>Level {user.level}</Text>
                <Text style={styles.xpText}>{user.xp} XP</Text>
              </View>
            </View>
          )}

          {user.badges && user.badges.length > 0 && (
            <View style={styles.badgesContainer}>
              {user.badges.slice(0, 6).map((badge, index) => (
                <View key={index} style={styles.badge}>
                  <GamificationIcons.TrophyAward size={24} color="#f39c12" />
                  <Text style={styles.badgeText}>{badge.name || badge}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  header: {
    backgroundColor: '#0d6efd',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
    borderWidth: 3,
    borderColor: '#fff',
  },
  headerText: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  profileDetails: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginLeft: 10,
  },
  bioText: {
    fontSize: 16,
    color: '#6c757d',
    lineHeight: 24,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '500',
  },
  interestTag: {
    backgroundColor: '#f3e5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    color: '#7b1fa2',
    fontSize: 14,
    fontWeight: '500',
  },
  socialLinksContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  socialLinkText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    marginLeft: 8,
  },
  gamificationItem: {
    marginBottom: 15,
  },
  levelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  levelText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
  },
  xpText: {
    fontSize: 16,
    color: '#6c757d',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
    minWidth: 80,
  },
  badgeText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '500',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default UserProfileScreen;