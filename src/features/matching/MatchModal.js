import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MatchingIcons, ChatIcons, FormIcons } from '../../PngIcons';

const MatchModal = ({ route, navigation }) => {
  // In a real app, this would come from route.params
  const profile = {
    id: '2',
    name: 'Alex Johnson',
    branch: 'Computer Science',
    year: '2nd Year',
    skills: ['Python', 'React Native', 'UI/UX Design'],
    bio: 'Frontend developer with a passion for creating beautiful user interfaces. Looking for hackathon partners.',
    photoURL: require('../../assets/profile-placeholder.png'),
    compatibility: 85,
  };
  
  const isSuper = false; // In a real app, this would come from route.params
  
  const handleMessage = () => {
    // Navigate to chat with this match
    // navigation.navigate('ChatScreen', { matchId: profile.id, name: profile.name });
    navigation.goBack();
  };
  
  const handleKeepSwiping = () => {
    // Go back to matching screen
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>
            {isSuper ? 'Super Match!' : 'It\'s a Match!'}
          </Text>
          <Text style={styles.subtitle}>
            You and {profile.name} have matched!
          </Text>
        </View>
        
        <View style={styles.profilesContainer}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={require('../../assets/profile-placeholder.png')} 
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>You</Text>
          </View>
          
          <View style={styles.heartIcon}>
            <MatchingIcons.Like size={40} />
          </View>
          
          <View style={styles.profileImageContainer}>
            <Image 
              source={profile.photoURL} 
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>{profile.name}</Text>
          </View>
        </View>
        
        <View style={styles.compatibilityContainer}>
          <Text style={styles.compatibilityTitle}>Compatibility</Text>
          <View style={styles.compatibilityBar}>
            <View 
              style={[
                styles.compatibilityFill, 
                { width: `${profile.compatibility}%` }
              ]} 
            />
          </View>
          <Text style={styles.compatibilityText}>{profile.compatibility}%</Text>
        </View>
        
        <View style={styles.matchDetails}>
          <Text style={styles.matchDetailsTitle}>Why you matched:</Text>
          <View style={styles.matchReason}>
            <FormIcons.Branch size={20} />
            <Text style={styles.matchReasonText}>Same field of study</Text>
          </View>
          <View style={styles.matchReason}>
            <FormIcons.Skills size={20} />
            <Text style={styles.matchReasonText}>Similar technical skills</Text>
          </View>
          <View style={styles.matchReason}>
            <FormIcons.Year size={20} />
            <Text style={styles.matchReasonText}>Complementary project interests</Text>
          </View>
        </View>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.messageButton]}
            onPress={handleMessage}
          >
            <ChatIcons.ChatBubble size={20} />
            <Text style={styles.messageButtonText}>Send Message</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.swipeButton]}
            onPress={handleKeepSwiping}
          >
            <Text style={styles.swipeButtonText}>Keep Swiping</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '90%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d6efd',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  profilesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageContainer: {
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 5,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
  },
  heartIcon: {
    marginHorizontal: 10,
  },
  compatibilityContainer: {
    marginBottom: 20,
  },
  compatibilityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 5,
    textAlign: 'center',
  },
  compatibilityBar: {
    height: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 5,
    marginBottom: 5,
  },
  compatibilityFill: {
    height: '100%',
    backgroundColor: '#0d6efd',
    borderRadius: 5,
  },
  compatibilityText: {
    fontSize: 14,
    color: '#0d6efd',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  matchDetails: {
    marginBottom: 20,
  },
  matchDetailsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 10,
  },
  matchReason: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchReasonText: {
    fontSize: 14,
    color: '#212529',
    marginLeft: 10,
  },
  buttonsContainer: {
    marginTop: 10,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 10,
  },
  messageButton: {
    backgroundColor: '#0d6efd',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  messageButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  swipeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0d6efd',
  },
  swipeButtonText: {
    color: '#0d6efd',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default MatchModal;
