import React, { useState, useEffect, useRef } from 'react';
import { StatusBar, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// Import PngIcons instead of vector icons
import { ChatIcons, NavigationIcons, MatchingIcons, GamificationIcons } from './PngIcons';
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Onboarding Screens
import OnboardingScreen from './screens/OnboardingScreen';
import SignInScreen from './screens/SignInScreen';
import ProfileSetupScreen from './screens/ProfileSetupScreen';

// Main Feature Screens
import MatchingScreen from './features/matching/MatchingScreen';
import MatchModal from './features/matching/MatchModal';
import GroupsScreen from './features/groups/GroupsScreen';
import GroupDetailsScreen from './features/groups/GroupDetailsScreen';
import ChatScreen from './features/groups/ChatScreen';
import EventsScreen from './features/events/EventsScreen';
import EventDetailsScreen from './features/events/EventDetailsScreen';
import CreateEventScreen from './features/events/CreateEventScreen';
import GamificationScreen from './features/gamification/GamificationScreen';
import BadgeDetailsScreen from './features/gamification/BadgeDetailsScreen';
import LeaderboardScreen from './features/gamification/LeaderboardScreen';
import LeaderboardTabScreen from './features/gamification/LeaderboardTabScreen';
import NotificationsScreen from './features/notifications/NotificationsScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import IconDemo from './IconDemo';
import IconFixTest from './IconFix';
import IconDemoWithVectors from './IconDemoWithVectors';
import IconsUsageExample from './IconsUsageExample';
import PngIconsInstallGuide from './PngIconsInstallGuide';
import PngIconsDemoPlaceholder from './PngIconsDemoPlaceholder';

// Services
import NotificationService from './services/NotificationService'; // Import singleton instance

const Stack = createStackNavigator();
const MainStack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          // Use our PngIcons components with original colors
          if (route.name === 'Matching') {
            return <MatchingIcons.Profile size={size} />;
          } else if (route.name === 'Groups') {
            return <ChatIcons.Group size={size} />;
          } else if (route.name === 'Events') {
            return <NavigationIcons.Calendar size={size} />;
          } else if (route.name === 'Chat') {
            return <ChatIcons.ChatBubble size={size} />;
          } else if (route.name === 'Profile') {
            return <MatchingIcons.Profile size={size} />;
          }
        },
        tabBarActiveTintColor: '#0d6efd',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Matching" component={MatchingStackNavigator} />
      <Tab.Screen name="Groups" component={GroupsStackNavigator} />
      <Tab.Screen name="Events" component={EventsStackNavigator} />
      <Tab.Screen name="Chat" component={ChatStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
};

// Matching Stack Navigator
const MatchingStackNavigator = () => {
  const MatchStack = createStackNavigator();
  
  return (
    <MatchStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0d6efd',
        },
        headerTintColor: '#fff',
      }}
    >
      <MatchStack.Screen name="MatchingScreen" component={MatchingScreen} options={{ title: 'Find Collaborators' }} />
      <MatchStack.Screen name="MatchModal" component={MatchModal} options={{ title: 'New Match', presentation: 'modal' }} />
    </MatchStack.Navigator>
  );
};

// Groups Stack Navigator
const GroupsStackNavigator = () => {
  const GroupsStack = createStackNavigator();
  
  return (
    <GroupsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0d6efd',
        },
        headerTintColor: '#fff',
      }}
    >
      <GroupsStack.Screen name="GroupsScreen" component={GroupsScreen} options={{ title: 'Groups' }} />
      <GroupsStack.Screen name="GroupDetailsScreen" component={GroupDetailsScreen} options={{ title: 'Group Details' }} />
      <GroupsStack.Screen name="ChatScreen" component={ChatScreen} options={({ route }) => ({ title: route.params.groupName || 'Chat' })} />
      <GroupsStack.Screen name="CreateEvent" component={CreateEventScreen} options={{ headerShown: false }} />
      <GroupsStack.Screen name="EventDetailsScreen" component={EventDetailsScreen} options={{ title: 'Event Details' }} />
    </GroupsStack.Navigator>
  );
};

// Events Stack Navigator
const EventsStackNavigator = () => {
  const EventsStack = createStackNavigator();
  
  return (
    <EventsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0d6efd',
        },
        headerTintColor: '#fff',
      }}
    >
      <EventsStack.Screen name="EventsScreen" component={EventsScreen} options={{ title: 'Events' }} />
      <EventsStack.Screen name="EventDetailsScreen" component={EventDetailsScreen} options={{ title: 'Event Details' }} />
      <EventsStack.Screen name="CreateEvent" component={CreateEventScreen} options={{ headerShown: false }} />
    </EventsStack.Navigator>
  );
};

// Chat Stack Navigator
const ChatStackNavigator = () => {
  const ChatStack = createStackNavigator();
  
  return (
    <ChatStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0d6efd',
        },
        headerTintColor: '#fff',
      }}
    >
      <ChatStack.Screen name="ChatList" component={ChatListScreen} options={{ title: 'Conversations' }} />
      <ChatStack.Screen name="ChatScreen" component={ChatScreen} options={({ route }) => ({ title: route.params.chatName || 'Chat' })} />
      <ChatStack.Screen name="EventDetailsScreen" component={EventDetailsScreen} options={{ title: 'Event Details' }} />
    </ChatStack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStackNavigator = () => {
  const ProfileStack = createStackNavigator();
  
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0d6efd',
        },
        headerTintColor: '#fff',
      }}
    >
      <ProfileStack.Screen name="ProfileScreen" component={ProfileScreen} options={{ title: 'My Profile' }} />
      <ProfileStack.Screen name="EditProfileScreen" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <ProfileStack.Screen name="GamificationScreen" component={GamificationScreen} options={{ title: 'Achievements' }} />
      <ProfileStack.Screen name="BadgeDetailsScreen" component={BadgeDetailsScreen} options={{ title: 'Badge Details' }} />
      <ProfileStack.Screen name="LeaderboardScreen" component={LeaderboardScreen} options={{ title: 'Leaderboard' }} />
      <ProfileStack.Screen name="NotificationsScreen" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <ProfileStack.Screen name="EventDetailsScreen" component={EventDetailsScreen} options={{ title: 'Event Details' }} />
    </ProfileStack.Navigator>
  );
};

import ChatListScreen from './features/chat/ChatListScreen';

// Main App Component
const App = () => {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [error, setError] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const navigationRef = useRef();

  // Global function to force profile completion (for offline mode)
  const forceProfileCompletion = () => {
    console.log('Forcing profile completion');
    setProfileComplete(true);
  };

  // Make the force function available globally
  global.forceProfileCompletion = forceProfileCompletion;
  
  // Function to test icon fixes
  const navigateToIconTest = () => {
    if (navigationRef.current) {
      navigationRef.current.navigate('IconFixTest');
    }
  };
  
  // Make icon test function available globally
  global.testIcons = navigateToIconTest;
  
  // Function to show vector icons demo
  const navigateToVectorIcons = () => {
    if (navigationRef.current) {
      navigationRef.current.navigate('IconDemoWithVectors');
    }
  };
  
  // Make vector icons demo function available globally
  global.showVectorIcons = navigateToVectorIcons;

  // Function to show Icons.js usage example
  const navigateToIconsUsage = () => {
    if (navigationRef.current) {
      navigationRef.current.navigate('IconsUsageExample');
    }
  };
  
  // Make Icons.js usage example function available globally
  global.showIconsUsage = navigateToIconsUsage;

  // Function to show PNG Icons Installation Guide
  const navigateToPngIconsGuide = () => {
    if (navigationRef.current) {
      navigationRef.current.navigate('PngIconsInstallGuide');
    }
  };
  
  // Make PNG Icons Guide function available globally
  global.showPngIconsGuide = navigateToPngIconsGuide;
  
  // Function to show PNG Icons Demo
  const navigateToPngIconsDemo = () => {
    if (navigationRef.current) {
      navigationRef.current.navigate('PngIconsDemoPlaceholder');
    }
  };
  
  // Make PNG Icons Demo function available globally
  global.showPngIconsDemo = navigateToPngIconsDemo;

  // Check if user profile is complete
  const checkProfileComplete = async (user) => {
    if (!user) {
      setProfileComplete(false);
      return;
    }

    try {
      // Import Firestore service
      const { getFirestoreService } = await import('./firebase');
      const firestoreService = await getFirestoreService();
      
      console.log('Checking profile completion for user:', user.uid);
      
      const userDoc = await firestoreService.collection('users').doc(user.uid).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        const isComplete = userData?.profileComplete === true;
        console.log('Profile complete:', isComplete);
        setProfileComplete(isComplete);
      } else {
        console.log('User document does not exist, profile incomplete');
        setProfileComplete(false);
      }
      
    } catch (error) {
      console.error('Error checking profile completion:', error);
      
      // Handle different types of errors gracefully
      if (error.code === 'firestore/unavailable') {
        console.log('Database unavailable - allowing app to continue');
        setProfileComplete(false); // Default to profile setup needed
      } else if (error.code === 'firestore/permission-denied') {
        setError('Access denied. Please check your authentication.');
      } else if (error.code === 'firestore/timeout') {
        console.log('Connection timeout - using offline mode');
        setProfileComplete(false);
      } else {
        setError('Failed to connect to the server. Please check your connection.');
      }
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Starting app initialization...');
        
        // Import and initialize Firebase with error handling
        try {
          // Import Firebase module
          const firebaseModule = await import('./firebase');
          
          // Verify that Firebase module was imported correctly
          if (!firebaseModule) {
            throw new Error('Failed to import Firebase module');
          }
          
          // Destructure Firebase functions with checks
          const { getFirebaseApp, isFirebaseReady, getAuthService } = firebaseModule;
          
          if (!getFirebaseApp || typeof getFirebaseApp !== 'function') {
            throw new Error('Firebase module imported but getFirebaseApp is not a function');
          }
          
          // Wait for Firebase to be ready
          console.log('Waiting for Firebase initialization...');
          const firebaseApp = await getFirebaseApp();
          
          if (!firebaseApp) {
            throw new Error('Firebase initialization returned null');
          }
          
          console.log('Firebase app initialized:', firebaseApp.name || 'Firebase app');
          
          // Log successful initialization
          console.log('Firebase initialized successfully');
        } catch (firebaseError) {
          console.error('Firebase initialization failed:', firebaseError);
          setError(`Failed to connect to Firebase: ${firebaseError.message}. Please check your connection and try again.`);
          setLoading(false);
          return;
        }
        
        // Initialize services that depend on Firebase
        try {
          // Initialize notification service
          if (NotificationService && typeof NotificationService.init === 'function') {
            await NotificationService.init();
            console.log('Notification service initialized');
          } else {
            console.warn('NotificationService.init is not available');
          }
        } catch (notificationError) {
          console.warn('Notification service initialization warning:', notificationError.message);
          // Don't fail the app if notifications fail
        }
        
        // Set up auth listener after Firebase is ready
        try {
          const firebaseModule = await import('./firebase');
          const getAuthService = firebaseModule.getAuthService;
          
          if (!getAuthService || typeof getAuthService !== 'function') {
            throw new Error('getAuthService is not a function');
          }
          
          const authService = await getAuthService();
          const unsubscribe = authService.onAuthStateChanged(async (user) => {
            console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
            setUser(user);
            
            if (user) {
              try {
                await checkProfileComplete(user);
              } catch (error) {
                console.error('Error checking profile:', error);
                setError('Failed to check profile completion. Please try again.');
              }
            }
            
            setLoading(false);
          });
        } catch (authError) {
          console.error('Failed to setup auth listener:', authError);
          setError(`Authentication error: ${authError.message}`);
          setLoading(false);
          return;
        }
        
        // Mark app as initialized
        setInitialized(true);
        setLoading(false);
        
        return () => unsubscribe();
        
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setError(`Failed to initialize app: ${error.message}`);
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (!initialized || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d6efd" />
        <Text style={styles.loadingText}>Connecting to server...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubText}>Check your internet connection and try again.</Text>
        <TouchableOpacity 
          onPress={async () => {
            setError(null);
            setLoading(true);
            try {
              const { getFirestoreService } = await import('./firebase');
              const firestoreInstance = await getFirestoreService();
              await firestoreInstance.enableNetwork();
              await checkProfileComplete(user);
            } catch (retryError) {
              console.error('Retry failed:', retryError);
              setError('Could not connect to the server. Please check your internet connection.');
            } finally {
              setLoading(false);
            }
          }}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>Retry Connection</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0d6efd" />
      <NavigationContainer ref={navigationRef}>
        <MainStack.Navigator 
          screenOptions={{ 
            headerShown: false,
            animationEnabled: true,
            gestureEnabled: true,
            cardStyle: { backgroundColor: 'white' },
          }}
        >
          {!user ? (
            // Onboarding Flow
            <>
              <MainStack.Screen 
                name="Onboarding" 
                component={OnboardingScreen}
              />
              <MainStack.Screen 
                name="SignIn" 
                component={SignInScreen}
              />
            </>
          ) : !profileComplete ? (
            // Profile Setup Flow
            <MainStack.Screen 
              name="ProfileSetup" 
              component={ProfileSetupScreen}
              options={{ gestureEnabled: false }}
            />
          ) : (
            // Main App Flow
            <>
              <MainStack.Screen 
                name="Main" 
                component={MainTabNavigator}
                options={{ gestureEnabled: false }}
              />
              <MainStack.Screen 
                name="IconFixTest" 
                component={IconFixTest}
                options={{ 
                  headerShown: true,
                  title: 'Icon Fix Test',
                  headerStyle: {
                    backgroundColor: '#0d6efd',
                  },
                  headerTintColor: '#fff',
                }}
              />
              <MainStack.Screen 
                name="IconDemo" 
                component={IconDemo}
                options={{ 
                  headerShown: true,
                  title: 'Icon Demo',
                  headerStyle: {
                    backgroundColor: '#0d6efd',
                  },
                  headerTintColor: '#fff',
                }}
              />
              <MainStack.Screen 
                name="IconDemoWithVectors" 
                component={IconDemoWithVectors}
                options={{ 
                  headerShown: true,
                  title: 'Vector Icons Demo',
                  headerStyle: {
                    backgroundColor: '#0d6efd',
                  },
                  headerTintColor: '#fff',
                }}
              />
              <MainStack.Screen 
                name="IconsUsageExample" 
                component={IconsUsageExample}
                options={{ 
                  headerShown: true,
                  title: 'Icons.js Usage',
                  headerStyle: {
                    backgroundColor: '#0d6efd',
                  },
                  headerTintColor: '#fff',
                }}
              />
              <MainStack.Screen 
                name="PngIconsInstallGuide" 
                component={PngIconsInstallGuide}
                options={{ 
                  headerShown: true,
                  title: 'PNG Icons Installation',
                  headerStyle: {
                    backgroundColor: '#0d6efd',
                  },
                  headerTintColor: '#fff',
                }}
              />
              <MainStack.Screen 
                name="PngIconsDemoPlaceholder" 
                component={PngIconsDemoPlaceholder}
                options={{ 
                  headerShown: true,
                  title: 'PNG Icons Demo',
                  headerStyle: {
                    backgroundColor: '#0d6efd',
                  },
                  headerTintColor: '#fff',
                }}
              />
            </>
          )}
        </MainStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = {
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubText: {
    color: '#6c757d',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#0d6efd',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
};

export default App;
