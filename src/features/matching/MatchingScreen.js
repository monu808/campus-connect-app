import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Animated, ActivityIndicator, Alert } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { MatchingIcons } from '../../PngIcons';
import { useNavigation } from '@react-navigation/native';
import MatchingService from '../../services/MatchingService';

const MatchingScreen = () => {
  const navigation = useNavigation();
  // Get screen dimensions for swipe calculations
  const { width } = Dimensions.get('window');
  
  // Helper function to get proper image source
  const getImageSource = (photoURL) => {
    if (!photoURL) {
      return require('../../assets/profile-placeholder.png');
    }
    
    if (typeof photoURL === 'string') {
      return { uri: photoURL };
    }
    
    if (typeof photoURL === 'object' && photoURL.uri) {
      return photoURL;
    }
    
    // If it's already a require() result (number), return as is
    if (typeof photoURL === 'number') {
      return photoURL;
    }
    
    // Fallback to placeholder
    return require('../../assets/profile-placeholder.png');
  };
  
  // Animation values
  const position = useRef(new Animated.ValueXY()).current;
  const rotation = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp'
  });
  
  // Opacity for like/dislike labels
  const likeOpacity = position.x.interpolate({
    inputRange: [0, width / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });
  
  const dislikeOpacity = position.x.interpolate({
    inputRange: [-width / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  
  useEffect(() => {
  const loadProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const recs = await MatchingService.getRecommendedUsers();
      // Normalize fields expected by UI
      const normalized = (recs || []).map((u) => ({
        id: u.userId || u.id,
        name: u.displayName || 'Unknown',
        branch: u.branch || '—',
        year: u.year || '—',
        skills: u.skills || [],
        bio: u.bio || '',
        photoURL: u.photoURL,
        compatibility: u.compatibility || u.score || undefined,
      }));
      setProfiles(normalized);
      setCurrentProfile(normalized[0] || null);
    } catch (err) {
      console.error('Failed to load profiles', err);
      setError('Failed to load profiles. Please try again.');
    } finally {
      setLoading(false);
    }
  };    loadProfiles();
  }, []);

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 4,
      useNativeDriver: true
    }).start();
  };

  const handleSwipeLeft = async () => {
    // Animate the card off screen to the left
    Animated.timing(position, {
      toValue: { x: -width - 100, y: 0 },
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      // Reset position for next card
      position.setValue({ x: 0, y: 0 });
      
      // Update profiles state
      if (profiles.length > 0) {
        const newProfiles = [...profiles];
        const swiped = newProfiles.shift();
        // Persist swipe left
        if (swiped?.id) {
          MatchingService.swipeLeft(swiped.id).catch(() => {});
        }
        setProfiles(newProfiles);
        
        if (newProfiles.length > 0) {
          setCurrentProfile(newProfiles[0]);
        } else {
          // No more profiles
          setCurrentProfile(null);
        }
      }
    });
  };

  const handleSwipeRight = async () => {
    // Animate the card off screen to the right
    Animated.timing(position, {
      toValue: { x: width + 100, y: 0 },
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      // Reset position for next card
      position.setValue({ x: 0, y: 0 });
      
      // Update profiles state
      if (profiles.length > 0) {
        const newProfiles = [...profiles];
        const matchedProfile = newProfiles.shift();
        if (matchedProfile?.id) {
          MatchingService.swipeRight(matchedProfile.id)
            .then((result) => {
              if (result?.status === 'matched') {
                // Show match modal
                navigation.navigate('MatchModal', { profile: matchedProfile, isSuper: false });
              }
            })
            .catch(() => {});
        }
        setProfiles(newProfiles);
        
        // Show match modal
        // navigation.navigate('MatchModal', { profile: matchedProfile });
        
        if (newProfiles.length > 0) {
          setCurrentProfile(newProfiles[0]);
        } else {
          // No more profiles
          setCurrentProfile(null);
        }
      }
    });
  };

  const handleSuperMatch = () => {
    // Animate the card up and then right
    Animated.sequence([
      Animated.timing(position, {
        toValue: { x: 0, y: -50 },
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(position, {
        toValue: { x: width + 100, y: -50 },
        duration: 300,
        useNativeDriver: true
      })
    ]).start(() => {
      // Reset position for next card
      position.setValue({ x: 0, y: 0 });
      
      // Super match functionality
      if (profiles.length > 0) {
        const newProfiles = [...profiles];
        const matchedProfile = newProfiles.shift();
        if (matchedProfile?.id) {
          MatchingService.superMatch(matchedProfile.id)
            .then((result) => {
              navigation.navigate('MatchModal', { profile: matchedProfile, isSuper: true });
            })
            .catch(() => {
              navigation.navigate('MatchModal', { profile: matchedProfile, isSuper: true });
            });
        }
        setProfiles(newProfiles);
        
        // Show match modal with super match
        // navigation.navigate('MatchModal', { profile: matchedProfile, isSuper: true });
        
        if (newProfiles.length > 0) {
          setCurrentProfile(newProfiles[0]);
        } else {
          // No more profiles
          setCurrentProfile(null);
        }
      }
    });
  };

  // Gesture handler state and events
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: position.x, translationY: position.y } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;
      
      // Determine if the user swiped far enough to count as a swipe
      if (translationX > 120) {
        handleSwipeRight();
      } else if (translationX < -120) {
        handleSwipeLeft();
      } else {
        resetPosition();
      }
    }
  };
  
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#0d6efd" />
        <Text style={styles.loadingText}>Finding potential matches...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <MatchingIcons.Profile size={80} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadProfiles()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentProfile) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <MatchingIcons.Profile size={80} />
        <Text style={styles.emptyText}>No more profiles to show</Text>
        <Text style={styles.emptySubtext}>Check back later for new potential matches</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Swipable profile card */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { translateX: position.x },
                { translateY: position.y },
                { rotate: rotation }
              ]
            }
          ]}
        >
          {/* Like overlay */}
          <Animated.View style={[
            styles.overlayLabel,
            styles.likeLabel,
            { opacity: likeOpacity }
          ]}>
            <Text style={styles.overlayText}>LIKE</Text>
          </Animated.View>
          
          {/* Dislike overlay */}
          <Animated.View style={[
            styles.overlayLabel,
            styles.dislikeLabel,
            { opacity: dislikeOpacity }
          ]}>
            <Text style={styles.overlayText}>NOPE</Text>
          </Animated.View>
        
          <View style={styles.cardContent}>
            <View style={styles.profileImageContainer}>
              <Image 
                source={getImageSource(currentProfile.photoURL)} 
                style={styles.profileImage}
              />
            </View>
            
            <Text style={styles.name}>{currentProfile.name}</Text>
            <Text style={styles.details}>{currentProfile.branch} • {currentProfile.year} year</Text>
            
            <View style={styles.skillsSection}>
              <Text style={styles.sectionTitle}>Key Skills</Text>
              <Text style={styles.skillsList}>{currentProfile.skills.join(', ')}</Text>
            </View>
            
            {currentProfile.bio && (
              <Text style={styles.bio}>{currentProfile.bio}</Text>
            )}
          </View>
        </Animated.View>
      </PanGestureHandler>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.rejectButton]}
          onPress={handleSwipeLeft}
        >
          <MatchingIcons.Reject size={28} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.superButton}
          onPress={handleSuperMatch}
        >
          <MatchingIcons.SuperMatch size={24} />
          <Text style={styles.superButtonText}>Super</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.matchButton]}
          onPress={handleSwipeRight}
        >
          <MatchingIcons.Like size={28} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
    zIndex: 1,
    overflow: 'hidden',
    flex: 1,
    maxHeight: '80%',
  },
  cardContent: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overlayLabel: {
    position: 'absolute',
    top: 60,
    padding: 16,
    borderWidth: 4,
    borderRadius: 12,
    zIndex: 2,
  },
  likeLabel: {
    right: 30,
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    transform: [{ rotate: '20deg' }],
  },
  dislikeLabel: {
    left: 30,
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    transform: [{ rotate: '-20deg' }],
  },
  overlayText: {
    fontSize: 24,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: 'white',
    letterSpacing: 1,
  },
  profileImageContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 24,
    borderWidth: 4,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  details: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: '500',
  },
  skillsSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3b82f6',
    marginBottom: 12,
    textAlign: 'center',
  },
  skillsList: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  bio: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
    backgroundColor: 'white',
    gap: 20,
  },
  actionButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  rejectButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  matchButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  superButton: {
    backgroundColor: '#3b82f6',
    width: 120,
    height: 68,
    borderRadius: 34,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  superButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  retryButton: {
    backgroundColor: '#0d6efd',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default MatchingScreen;
