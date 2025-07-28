# Firebase Setup and Configuration

This document outlines the setup and configuration of Firebase services for the Campus Connect app, including authentication, database structure, storage rules, and cloud functions.

## Firebase Project Setup

### Project Creation
1. Create a new Firebase project named "Campus Connect"
2. Configure it for both Android and iOS platforms
3. Set the default GCP resource location to a region close to the target audience (e.g., asia-south1 for India)

### Firebase Services Activation
The following Firebase services need to be activated for the Campus Connect app:
- Authentication
- Firestore Database
- Storage
- Cloud Functions
- Cloud Messaging
- Analytics

## Authentication Configuration

### Sign-in Methods
- Google Sign-in (primary method)
- Email/Password (backup method)

### Security Rules
```javascript
// Allow read access to user data only to the authenticated user
// Allow write access only to the user's own document
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Domain Restriction
- Restrict sign-up to verified college email domains (e.g., @vitbhopal.ac.in)
- Implement email verification for non-Google sign-ins

### User Claims
- Set custom claims for user roles (student, admin)
- Set custom claims for college/campus identification

## Firestore Database Structure

### Collections and Documents
Following the data model defined in the architecture document:

#### Users Collection
```javascript
// users/{userId}
{
  uid: "string", // Firebase Auth UID
  email: "string", // College email
  displayName: "string", // Full name
  photoURL: "string", // Profile photo URL
  college: "string", // e.g., "VIT Bhopal"
  branch: "string", // e.g., "Computer Science"
  year: number, // Year of study (1-5)
  skills: ["string"], // Array of skills
  interests: ["string"], // Array of interests
  bio: "string", // User bio
  socialLinks: {
    github: "string",
    linkedin: "string"
  },
  xpPoints: number, // Gamification points
  badges: ["string"], // Earned badges
  createdAt: timestamp,
  lastActive: timestamp
}
```

#### Matches Collection
```javascript
// matches/{matchId}
{
  users: ["string"], // Array of userIds
  status: "string", // "pending", "accepted", "rejected"
  initiatedBy: "string", // userId who initiated
  createdAt: timestamp,
  lastInteraction: timestamp
}
```

#### Groups Collection
```javascript
// groups/{groupId}
{
  name: "string", // Group name
  description: "string", // Group description
  type: "string", // "study", "project", "hackathon"
  tags: ["string"], // Topics/tags
  members: [
    {
      userId: "string",
      role: "string" // "admin", "member"
    }
  ],
  isPublic: boolean,
  createdAt: timestamp,
  createdBy: "string" // userId
}
```

#### Chats Collection
```javascript
// chats/{chatId}
{
  participants: ["string"], // userIds
  lastMessage: {
    text: "string",
    sentBy: "string", // userId
    sentAt: timestamp
  },
  isGroupChat: boolean,
  groupId: "string" // if isGroupChat is true
}
```

#### Messages Subcollection
```javascript
// chats/{chatId}/messages/{messageId}
{
  text: "string",
  sentBy: "string", // userId
  sentAt: timestamp,
  readBy: ["string"], // userIds
  status: "string" // "sent", "delivered", "read"
}
```

#### Events Collection
```javascript
// events/{eventId}
{
  title: "string",
  description: "string",
  startTime: timestamp,
  endTime: timestamp,
  location: "string",
  organizer: "string", // userId or groupId
  attendees: [
    {
      userId: "string",
      status: "string" // "yes", "maybe", "no"
    }
  ],
  tags: ["string"],
  isPublic: boolean
}
```

#### Notifications Subcollection
```javascript
// users/{userId}/notifications/{notificationId}
{
  type: "string", // "match", "message", "group", "event", "achievement"
  title: "string",
  body: "string",
  data: {}, // Relevant data based on type
  isRead: boolean,
  createdAt: timestamp
}
```

### Indexes
Create composite indexes for:
- matches: users + createdAt
- groups: tags + createdAt
- events: startTime + tags
- users: college + skills

## Security Rules

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      
      // User notifications
      match /notifications/{notificationId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Matches
    match /matches/{matchId} {
      allow read: if request.auth != null && 
                   request.auth.uid in resource.data.users;
      allow create: if request.auth != null && 
                     request.auth.uid == request.resource.data.initiatedBy &&
                     request.auth.uid in request.resource.data.users;
      allow update: if request.auth != null && 
                     request.auth.uid in resource.data.users;
    }
    
    // Groups
    match /groups/{groupId} {
      // Public groups can be read by any authenticated user
      allow read: if request.auth != null && 
                   (resource.data.isPublic == true || 
                    exists(/databases/$(database)/documents/groups/$(groupId)/members/$(request.auth.uid)));
      
      // Only group admins can update group details
      allow update: if request.auth != null && 
                     exists(/databases/$(database)/documents/groups/$(groupId)/members/$(request.auth.uid)) &&
                     get(/databases/$(database)/documents/groups/$(groupId)/members/$(request.auth.uid)).data.role == "admin";
      
      // Any authenticated user can create a group
      allow create: if request.auth != null && 
                     request.resource.data.createdBy == request.auth.uid;
    }
    
    // Chats
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
                           request.auth.uid in resource.data.participants;
      
      // Messages in chats
      match /messages/{messageId} {
        allow read: if request.auth != null && 
                     request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
        allow create: if request.auth != null && 
                       request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants &&
                       request.resource.data.sentBy == request.auth.uid;
      }
    }
    
    // Events
    match /events/{eventId} {
      allow read: if request.auth != null && 
                   (resource.data.isPublic == true || 
                    request.auth.uid in resource.data.attendees[].userId);
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                     request.auth.uid == resource.data.organizer;
    }
  }
}
```

### Storage Security Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile images
    match /users/{userId}/profile.jpg {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Group images
    match /groups/{groupId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                    exists(/databases/$(database)/documents/groups/$(groupId)/members/$(request.auth.uid)) &&
                    get(/databases/$(database)/documents/groups/$(groupId)/members/$(request.auth.uid)).data.role == "admin";
    }
    
    // Event images
    match /events/{eventId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                    get(/databases/$(database)/documents/events/$(eventId)).data.organizer == request.auth.uid;
    }
    
    // Chat media
    match /chats/{chatId}/{fileName} {
      allow read: if request.auth != null && 
                   request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
      allow write: if request.auth != null && 
                    request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
    }
  }
}
```

## Cloud Functions

### Authentication Triggers
```javascript
// Create user profile on sign-up
exports.createUserProfile = functions.auth.user().onCreate((user) => {
  return admin.firestore().collection('users').doc(user.uid).set({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    college: '', // To be filled by user
    branch: '', // To be filled by user
    year: 0, // To be filled by user
    skills: [],
    interests: [],
    bio: '',
    socialLinks: {
      github: '',
      linkedin: ''
    },
    xpPoints: 0,
    badges: ['First Login'],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastActive: admin.firestore.FieldValue.serverTimestamp()
  });
});

// Verify college email domain
exports.verifyCollegeEmail = functions.auth.user().beforeCreate((user) => {
  const email = user.email || '';
  const allowedDomains = ['vitbhopal.ac.in']; // Add more college domains as needed
  
  // Check if email domain is allowed
  const domain = email.split('@')[1];
  if (!allowedDomains.includes(domain)) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Sign-up is restricted to verified college email domains.'
    );
  }
  
  return user;
});
```

### Matching System Functions
```javascript
// Generate potential matches for a user
exports.generateMatches = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to generate matches.'
    );
  }
  
  const userId = context.auth.uid;
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  const userData = userDoc.data();
  
  // Get user's college, skills, and interests
  const { college, skills, interests } = userData;
  
  // Query for potential matches based on complementary skills and shared interests
  const potentialMatches = await admin.firestore()
    .collection('users')
    .where('college', '==', college)
    .where('uid', '!=', userId)
    .limit(20)
    .get();
  
  // Calculate compatibility scores
  const matches = [];
  potentialMatches.forEach(doc => {
    const matchData = doc.data();
    
    // Calculate skill compatibility (complementary skills)
    const skillCompatibility = calculateSkillCompatibility(skills, matchData.skills);
    
    // Calculate interest overlap
    const interestOverlap = calculateInterestOverlap(interests, matchData.interests);
    
    // Overall compatibility score
    const compatibilityScore = (skillCompatibility * 0.6) + (interestOverlap * 0.4);
    
    // Add to matches if score is above threshold
    if (compatibilityScore > 0.3) {
      matches.push({
        userId: doc.id,
        displayName: matchData.displayName,
        photoURL: matchData.photoURL,
        branch: matchData.branch,
        year: matchData.year,
        skills: matchData.skills,
        interests: matchData.interests,
        bio: matchData.bio,
        compatibilityScore
      });
    }
  });
  
  // Sort by compatibility score
  matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  
  return { matches };
});

// Helper function to calculate skill compatibility
function calculateSkillCompatibility(userSkills, matchSkills) {
  // Implementation details
}

// Helper function to calculate interest overlap
function calculateInterestOverlap(userInterests, matchInterests) {
  // Implementation details
}

// Create a match when a user swipes right
exports.createMatch = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to create a match.'
    );
  }
  
  const { targetUserId } = data;
  const userId = context.auth.uid;
  
  // Check if a reverse match already exists
  const reverseMatchQuery = await admin.firestore()
    .collection('matches')
    .where('users', '==', [targetUserId, userId])
    .where('status', '==', 'pending')
    .get();
  
  if (!reverseMatchQuery.empty) {
    // Match exists, update to accepted
    const matchDoc = reverseMatchQuery.docs[0];
    await matchDoc.ref.update({
      status: 'accepted',
      lastInteraction: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Create a chat for the matched users
    const chatRef = admin.firestore().collection('chats').doc();
    await chatRef.set({
      participants: [userId, targetUserId],
      lastMessage: {
        text: 'You are now connected!',
        sentBy: 'system',
        sentAt: admin.firestore.FieldValue.serverTimestamp()
      },
      isGroupChat: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Send notifications to both users
    await sendMatchNotification(userId, targetUserId);
    await sendMatchNotification(targetUserId, userId);
    
    // Award XP to both users
    await awardXP(userId, 10, 'New match');
    await awardXP(targetUserId, 10, 'New match');
    
    return { status: 'matched', chatId: chatRef.id };
  } else {
    // Create a new pending match
    const matchRef = admin.firestore().collection('matches').doc();
    await matchRef.set({
      users: [userId, targetUserId],
      status: 'pending',
      initiatedBy: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastInteraction: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Award XP for initiating a match
    await awardXP(userId, 5, 'Initiated match');
    
    return { status: 'pending', matchId: matchRef.id };
  }
});
```

### Gamification Functions
```javascript
// Award XP to a user
async function awardXP(userId, amount, reason) {
  const userRef = admin.firestore().collection('users').doc(userId);
  
  // Update XP in a transaction
  return admin.firestore().runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists) {
      throw new Error('User does not exist');
    }
    
    const userData = userDoc.data();
    const currentXP = userData.xpPoints || 0;
    const newXP = currentXP + amount;
    
    // Update user's XP
    transaction.update(userRef, { xpPoints: newXP });
    
    // Check for level-up badges
    const currentLevel = Math.floor(currentXP / 100);
    const newLevel = Math.floor(newXP / 100);
    
    if (newLevel > currentLevel) {
      // User leveled up, award badge
      const badges = userData.badges || [];
      badges.push(`Level ${newLevel}`);
      
      transaction.update(userRef, { badges });
      
      // Create level-up notification
      const notificationRef = userRef.collection('notifications').doc();
      transaction.set(notificationRef, {
        type: 'achievement',
        title: 'Level Up!',
        body: `Congratulations! You've reached Level ${newLevel}.`,
        data: { level: newLevel },
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    // Create XP notification
    const notificationRef = userRef.collection('notifications').doc();
    transaction.set(notificationRef, {
      type: 'achievement',
      title: 'XP Earned',
      body: `You earned ${amount} XP for: ${reason}`,
      data: { xp: amount, reason },
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { newXP, newLevel };
  });
}

// Get leaderboard
exports.getLeaderboard = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to view leaderboard.'
    );
  }
  
  const { timeframe, college } = data;
  const userId = context.auth.uid;
  
  // Get user's college if not specified
  let userCollege = college;
  if (!userCollege) {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    userCollege = userDoc.data().college;
  }
  
  // Query for top users in the college
  let usersQuery = admin.firestore()
    .collection('users')
    .where('college', '==', userCollege)
    .orderBy('xpPoints', 'desc')
    .limit(20);
  
  // Apply timeframe filter if specified
  if (timeframe) {
    // Implementation for timeframe filtering
  }
  
  const usersSnapshot = await usersQuery.get();
  
  // Format leaderboard data
  const leaderboard = [];
  let userRank = -1;
  let userFound = false;
  
  usersSnapshot.forEach((doc, index) => {
    const userData = doc.data();
    const entry = {
      userId: doc.id,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      xpPoints: userData.xpPoints || 0,
      rank: index + 1
    };
    
    leaderboard.push(entry);
    
    if (doc.id === userId) {
      userRank = index + 1;
      userFound = true;
    }
  });
  
  // If user not in top 20, get their rank separately
  if (!userFound) {
    // Implementation to find user's rank
  }
  
  return { leaderboard, userRank };
});
```

### Notification Functions
```javascript
// Send match notification
async function sendMatchNotification(userId, matchedUserId) {
  // Get matched user's data
  const matchedUserDoc = await admin.firestore().collection('users').doc(matchedUserId).get();
  const matchedUserData = matchedUserDoc.data();
  
  // Create notification
  const notificationRef = admin.firestore()
    .collection('users')
    .doc(userId)
    .collection('notifications')
    .doc();
  
  await notificationRef.set({
    type: 'match',
    title: 'New Match!',
    body: `You matched with ${matchedUserData.displayName}. Start a conversation now!`,
    data: { matchedUserId },
    isRead: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  // Get user's FCM token
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  const fcmToken = userDoc.data().fcmToken;
  
  if (fcmToken) {
    // Send push notification
    await admin.messaging().send({
      token: fcmToken,
      notification: {
        title: 'New Match!',
        body: `You matched with ${matchedUserData.displayName}. Start a conversation now!`
      },
      data: {
        type: 'match',
        matchedUserId
      }
    });
  }
}

// Register FCM token
exports.registerFCMToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to register FCM token.'
    );
  }
  
  const { token } = data;
  const userId = context.auth.uid;
  
  await admin.firestore().collection('users').doc(userId).update({
    fcmToken: token
  });
  
  return { success: true };
});
```

## Firebase SDK Integration

### React Native Firebase Setup

#### Installation
```bash
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/storage @react-native-firebase/functions @react-native-firebase/messaging
```

#### iOS Configuration
Update `ios/Podfile` and `ios/[AppName]/AppDelegate.m` with Firebase configuration.

#### Android Configuration
Update `android/app/build.gradle` and `android/build.gradle` with Firebase configuration.

### Firebase Configuration File
Create a `firebase.js` file in the project:

```javascript
import { initializeApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import functions from '@react-native-firebase/functions';
import messaging from '@react-native-firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export { app, auth, firestore, storage, functions, messaging };
```

## API Services Implementation

### Authentication Service
```javascript
import { auth, firestore } from '../firebase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const AuthService = {
  // Initialize Google Sign-In
  initGoogleSignIn: () => {
    GoogleSignin.configure({
      webClientId: 'YOUR_WEB_CLIENT_ID',
      offlineAccess: true
    });
  },
  
  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      // Get Google ID token
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      
      // Create Firebase credential
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      
      // Sign in with credential
      return auth().signInWithCredential(googleCredential);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  },
  
  // Sign out
  signOut: async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      return auth().signOut();
    } catch (error) {
      console.error('Sign Out Error:', error);
      throw error;
    }
  },
  
  // Get current user
  getCurrentUser: () => {
    return auth().currentUser;
  },
  
  // Get user profile
  getUserProfile: async (userId) => {
    try {
      const userDoc = await firestore().collection('users').doc(userId).get();
      return userDoc.exists ? userDoc.data() : null;
    } catch (error) {
      console.error('Get User Profile Error:', error);
      throw error;
    }
  },
  
  // Update user profile
  updateUserProfile: async (userData) => {
    try {
      const userId = auth().currentUser.uid;
      await firestore().collection('users').doc(userId).update(userData);
      return true;
    } catch (error) {
      console.error('Update User Profile Error:', error);
      throw error;
    }
  }
};
```

### Profile Service
```javascript
import { firestore, storage } from '../firebase';
import { AuthService } from './AuthService';

export const ProfileService = {
  // Get user profile
  getUserProfile: async (userId) => {
    try {
      const userDoc = await firestore().collection('users').doc(userId).get();
      return userDoc.exists ? userDoc.data() : null;
    } catch (error) {
      console.error('Get User Profile Error:', error);
      throw error;
    }
  },
  
  // Update user profile
  updateUserProfile: async (userData) => {
    try {
      const userId = AuthService.getCurrentUser().uid;
      await firestore().collection('users').doc(userId).update({
        ...userData,
        lastActive: firestore.FieldValue.serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Update User Profile Error:', error);
      throw error;
    }
  },
  
  // Upload profile image
  uploadProfileImage: async (uri) => {
    try {
      const userId = AuthService.getCurrentUser().uid;
      const reference = storage().ref(`users/${userId}/profile.jpg`);
      
      // Upload image
      await reference.putFile(uri);
      
      // Get download URL
      const url = await reference.getDownloadURL();
      
      // Update user profile with new photo URL
      await firestore().collection('users').doc(userId).update({
        photoURL: url
      });
      
      return url;
    } catch (error) {
      console.error('Upload Profile Image Error:', error);
      throw error;
    }
  },
  
  // Update skills and interests
  updateSkillsAndInterests: async (skills, interests) => {
    try {
      const userId = AuthService.getCurrentUser().uid;
      await firestore().collection('users').doc(userId).update({
        skills,
        interests,
        lastActive: firestore.FieldValue.serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Update Skills and Interests Error:', error);
      throw error;
    }
  }
};
```

### Matching Service
```javascript
import { firestore, functions } from '../firebase';
import { AuthService } from './AuthService';

export const MatchingService = {
  // Get recommended users
  getRecommendedUsers: async (filters = {}) => {
    try {
      const generateMatches = functions().httpsCallable('generateMatches');
      const result = await generateMatches(filters);
      return result.data.matches;
    } catch (error) {
      console.error('Get Recommended Users Error:', error);
      throw error;
    }
  },
  
  // Swipe right (interested)
  swipeRight: async (targetUserId) => {
    try {
      const createMatch = functions().httpsCallable('createMatch');
      const result = await createMatch({ targetUserId });
      return result.data;
    } catch (error) {
      console.error('Swipe Right Error:', error);
      throw error;
    }
  },
  
  // Swipe left (pass)
  swipeLeft: async (targetUserId) => {
    try {
      const userId = AuthService.getCurrentUser().uid;
      
      // Create a rejected match record
      await firestore().collection('matches').add({
        users: [userId, targetUserId],
        status: 'rejected',
        initiatedBy: userId,
        createdAt: firestore.FieldValue.serverTimestamp(),
        lastInteraction: firestore.FieldValue.serverTimestamp()
      });
      
      return { status: 'rejected' };
    } catch (error) {
      console.error('Swipe Left Error:', error);
      throw error;
    }
  },
  
  // Get matches
  getMatches: async () => {
    try {
      const userId = AuthService.getCurrentUser().uid;
      
      // Get accepted matches
      const matchesSnapshot = await firestore()
        .collection('matches')
        .where('users', 'array-contains', userId)
        .where('status', '==', 'accepted')
        .orderBy('lastInteraction', 'desc')
        .get();
      
      const matches = [];
      
      for (const doc of matchesSnapshot.docs) {
        const matchData = doc.data();
        
        // Get the other user's ID
        const otherUserId = matchData.users.find(id => id !== userId);
        
        // Get the other user's profile
        const otherUserDoc = await firestore().collection('users').doc(otherUserId).get();
        const otherUserData = otherUserDoc.data();
        
        matches.push({
          matchId: doc.id,
          userId: otherUserId,
          displayName: otherUserData.displayName,
          photoURL: otherUserData.photoURL,
          lastInteraction: matchData.lastInteraction.toDate(),
          createdAt: matchData.createdAt.toDate()
        });
      }
      
      return matches;
    } catch (error) {
      console.error('Get Matches Error:', error);
      throw error;
    }
  },
  
  // Respond to match
  respondToMatch: async (matchId, response) => {
    try {
      await firestore().collection('matches').doc(matchId).update({
        status: response, // 'accepted' or 'rejected'
        lastInteraction: firestore.FieldValue.serverTimestamp()
      });
      
      if (response === 'accepted') {
        // Get match data
        const matchDoc = await firestore().collection('matches').doc(matchId).get();
        const matchData = matchDoc.data();
        
        // Create a chat for the matched users
        const chatRef = firestore().collection('chats').doc();
        await chatRef.set({
          participants: matchData.users,
          lastMessage: {
            text: 'You are now connected!',
            sentBy: 'system',
            sentAt: firestore.FieldValue.serverTimestamp()
          },
          isGroupChat: false,
          createdAt: firestore.FieldValue.serverTimestamp()
        });
        
        return { status: 'matched', chatId: chatRef.id };
      }
      
      return { status: response };
    } catch (error) {
      console.error('Respond to Match Error:', error);
      throw error;
    }
  }
};
```

### Group Service
```javascript
import { firestore, storage } from '../firebase';
import { AuthService } from './AuthService';

export const GroupService = {
  // Create group
  createGroup: async (groupData) => {
    try {
      const userId = AuthService.getCurrentUser().uid;
      
      // Create group document
      const groupRef = firestore().collection('groups').doc();
      await groupRef.set({
        ...groupData,
        members: [
          {
            userId,
            role: 'admin'
          }
        ],
        createdBy: userId,
        createdAt: firestore.FieldValue.serverTimestamp()
      });
      
      // Award XP for creating a group
      // This would typically be handled by a Cloud Function
      
      return { groupId: groupRef.id };
    } catch (error) {
      console.error('Create Group Error:', error);
      throw error;
    }
  },
  
  // Get groups
  getGroups: async (filters = {}) => {
    try {
      let query = firestore().collection('groups');
      
      // Apply filters
      if (filters.type) {
        query = query.where('type', '==', filters.type);
      }
      
      if (filters.tags && filters.tags.length > 0) {
        query = query.where('tags', 'array-contains-any', filters.tags);
      }
      
      // Get groups
      const groupsSnapshot = await query
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();
      
      const groups = groupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      }));
      
      return groups;
    } catch (error) {
      console.error('Get Groups Error:', error);
      throw error;
    }
  },
  
  // Get user's groups
  getUserGroups: async () => {
    try {
      const userId = AuthService.getCurrentUser().uid;
      
      // Get groups where user is a member
      const groupsSnapshot = await firestore()
        .collection('groups')
        .where('members', 'array-contains', { userId, role: 'admin' })
        .orderBy('createdAt', 'desc')
        .get();
      
      const groups = groupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      }));
      
      return groups;
    } catch (error) {
      console.error('Get User Groups Error:', error);
      throw error;
    }
  },
  
  // Join group
  joinGroup: async (groupId) => {
    try {
      const userId = AuthService.getCurrentUser().uid;
      
      // Add user to group members
      await firestore().collection('groups').doc(groupId).update({
        members: firestore.FieldValue.arrayUnion({
          userId,
          role: 'member'
        })
      });
      
      // Award XP for joining a group
      // This would typically be handled by a Cloud Function
      
      return { success: true };
    } catch (error) {
      console.error('Join Group Error:', error);
      throw error;
    }
  },
  
  // Leave group
  leaveGroup: async (groupId) => {
    try {
      const userId = AuthService.getCurrentUser().uid;
      
      // Get group data
      const groupDoc = await firestore().collection('groups').doc(groupId).get();
      const groupData = groupDoc.data();
      
      // Find user's member object
      const memberIndex = groupData.members.findIndex(member => member.userId === userId);
      
      if (memberIndex !== -1) {
        // Remove user from members array
        const updatedMembers = [...groupData.members];
        updatedMembers.splice(memberIndex, 1);
        
        await firestore().collection('groups').doc(groupId).update({
          members: updatedMembers
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Leave Group Error:', error);
      throw error;
    }
  },
  
  // Update group
  updateGroup: async (groupId, groupData) => {
    try {
      await firestore().collection('groups').doc(groupId).update(groupData);
      return { success: true };
    } catch (error) {
      console.error('Update Group Error:', error);
      throw error;
    }
  },
  
  // Get group members
  getGroupMembers: async (groupId) => {
    try {
      // Get group data
      const groupDoc = await firestore().collection('groups').doc(groupId).get();
      const groupData = groupDoc.data();
      
      // Get member profiles
      const members = [];
      
      for (const member of groupData.members) {
        const userDoc = await firestore().collection('users').doc(member.userId).get();
        const userData = userDoc.data();
        
        members.push({
          userId: member.userId,
          role: member.role,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          branch: userData.branch,
          year: userData.year
        });
      }
      
      return members;
    } catch (error) {
      console.error('Get Group Members Error:', error);
      throw error;
    }
  }
};
```

### Discovery Service
```javascript
import { firestore } from '../firebase';
import { AuthService } from './AuthService';

export const DiscoveryService = {
  // Get discovery feed
  getDiscoveryFeed: async () => {
    try {
      const userId = AuthService.getCurrentUser().uid;
      const userDoc = await firestore().collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      // Get user's college
      const { college, interests } = userData;
      
      // Get recommended users
      const usersSnapshot = await firestore()
        .collection('users')
        .where('college', '==', college)
        .where('uid', '!=', userId)
        .limit(5)
        .get();
      
      const recommendedUsers = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        displayName: doc.data().displayName,
        photoURL: doc.data().photoURL,
        branch: doc.data().branch,
        year: doc.data().year,
        skills: doc.data().skills
      }));
      
      // Get trending groups
      const groupsSnapshot = await firestore()
        .collection('groups')
        .where('college', '==', college)
        .orderBy('members', 'desc')
        .limit(5)
        .get();
      
      const trendingGroups = groupsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        description: doc.data().description,
        type: doc.data().type,
        tags: doc.data().tags,
        memberCount: doc.data().members.length
      }));
      
      // Get upcoming events
      const now = new Date();
      const eventsSnapshot = await firestore()
        .collection('events')
        .where('college', '==', college)
        .where('startTime', '>', now)
        .orderBy('startTime', 'asc')
        .limit(5)
        .get();
      
      const upcomingEvents = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        description: doc.data().description,
        startTime: doc.data().startTime.toDate(),
        endTime: doc.data().endTime.toDate(),
        location: doc.data().location,
        organizer: doc.data().organizer,
        tags: doc.data().tags
      }));
      
      return {
        recommendedUsers,
        trendingGroups,
        upcomingEvents
      };
    } catch (error) {
      console.error('Get Discovery Feed Error:', error);
      throw error;
    }
  },
  
  // Get trending groups
  getTrendingGroups: async () => {
    try {
      const userId = AuthService.getCurrentUser().uid;
      const userDoc = await firestore().collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      // Get user's college
      const { college } = userData;
      
      // Get trending groups
      const groupsSnapshot = await firestore()
        .collection('groups')
        .where('college', '==', college)
        .orderBy('members', 'desc')
        .limit(10)
        .get();
      
      const trendingGroups = groupsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        description: doc.data().description,
        type: doc.data().type,
        tags: doc.data().tags,
        memberCount: doc.data().members.length
      }));
      
      return trendingGroups;
    } catch (error) {
      console.error('Get Trending Groups Error:', error);
      throw error;
    }
  },
  
  // Get upcoming events
  getUpcomingEvents: async () => {
    try {
      const userId = AuthService.getCurrentUser().uid;
      const userDoc = await firestore().collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      // Get user's college
      const { college } = userData;
      
      // Get upcoming events
      const now = new Date();
      const eventsSnapshot = await firestore()
        .collection('events')
        .where('college', '==', college)
        .where('startTime', '>', now)
        .orderBy('startTime', 'asc')
        .limit(10)
        .get();
      
      const upcomingEvents = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        description: doc.data().description,
        startTime: doc.data().startTime.toDate(),
        endTime: doc.data().endTime.toDate(),
        location: doc.data().location,
        organizer: doc.data().organizer,
        tags: doc.data().tags
      }));
      
      return upcomingEvents;
    } catch (error) {
      console.error('Get Upcoming Events Error:', error);
      throw error;
    }
  },
  
  // Get recommended users
  getRecommendedUsers: async () => {
    try {
      const userId = AuthService.getCurrentUser().uid;
      const userDoc = await firestore().collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      // Get user's college and interests
      const { college, interests } = userData;
      
      // Get recommended users
      const usersSnapshot = await firestore()
        .collection('users')
        .where('college', '==', college)
        .where('uid', '!=', userId)
        .limit(10)
        .get();
      
      const recommendedUsers = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        displayName: doc.data().displayName,
        photoURL: doc.data().photoURL,
        branch: doc.data().branch,
        year: doc.data().year,
        skills: doc.data().skills
      }));
      
      return recommendedUsers;
    } catch (error) {
      console.error('Get Recommended Users Error:', error);
      throw error;
    }
  }
};
```

### Gamification Service
```javascript
import { firestore, functions } from '../firebase';
import { AuthService } from './AuthService';

export const GamificationService = {
  // Get user XP
  getUserXP: async (userId) => {
    try {
      const userDoc = await firestore().collection('users').doc(userId).get();
      return userDoc.data().xpPoints || 0;
    } catch (error) {
      console.error('Get User XP Error:', error);
      throw error;
    }
  },
  
  // Award XP
  awardXP: async (userId, amount, reason) => {
    try {
      // This would typically be handled by a Cloud Function
      // For client-side, we'll update directly
      await firestore().collection('users').doc(userId).update({
        xpPoints: firestore.FieldValue.increment(amount)
      });
      
      // Create XP notification
      await firestore()
        .collection('users')
        .doc(userId)
        .collection('notifications')
        .add({
          type: 'achievement',
          title: 'XP Earned',
          body: `You earned ${amount} XP for: ${reason}`,
          data: { xp: amount, reason },
          isRead: false,
          createdAt: firestore.FieldValue.serverTimestamp()
        });
      
      return { success: true };
    } catch (error) {
      console.error('Award XP Error:', error);
      throw error;
    }
  },
  
  // Get badges
  getBadges: async (userId) => {
    try {
      const userDoc = await firestore().collection('users').doc(userId).get();
      return userDoc.data().badges || [];
    } catch (error) {
      console.error('Get Badges Error:', error);
      throw error;
    }
  },
  
  // Award badge
  awardBadge: async (userId, badgeId) => {
    try {
      // This would typically be handled by a Cloud Function
      // For client-side, we'll update directly
      await firestore().collection('users').doc(userId).update({
        badges: firestore.FieldValue.arrayUnion(badgeId)
      });
      
      // Create badge notification
      await firestore()
        .collection('users')
        .doc(userId)
        .collection('notifications')
        .add({
          type: 'achievement',
          title: 'New Badge!',
          body: `You earned the ${badgeId} badge!`,
          data: { badge: badgeId },
          isRead: false,
          createdAt: firestore.FieldValue.serverTimestamp()
        });
      
      return { success: true };
    } catch (error) {
      console.error('Award Badge Error:', error);
      throw error;
    }
  },
  
  // Get leaderboard
  getLeaderboard: async (timeframe, scope) => {
    try {
      const getLeaderboard = functions().httpsCallable('getLeaderboard');
      const result = await getLeaderboard({ timeframe, scope });
      return result.data;
    } catch (error) {
      console.error('Get Leaderboard Error:', error);
      throw error;
    }
  }
};
```

### Notification Service
```javascript
import { firestore, messaging } from '../firebase';
import { AuthService } from './AuthService';

export const NotificationService = {
  // Register device token
  registerDeviceToken: async (token) => {
    try {
      const userId = AuthService.getCurrentUser().uid;
      
      await firestore().collection('users').doc(userId).update({
        fcmToken: token
      });
      
      return { success: true };
    } catch (error) {
      console.error('Register Device Token Error:', error);
      throw error;
    }
  },
  
  // Get notifications
  getNotifications: async () => {
    try {
      const userId = AuthService.getCurrentUser().uid;
      
      const notificationsSnapshot = await firestore()
        .collection('users')
        .doc(userId)
        .collection('notifications')
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();
      
      const notifications = notificationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      }));
      
      return notifications;
    } catch (error) {
      console.error('Get Notifications Error:', error);
      throw error;
    }
  },
  
  // Mark notification as read
  markNotificationAsRead: async (notificationId) => {
    try {
      const userId = AuthService.getCurrentUser().uid;
      
      await firestore()
        .collection('users')
        .doc(userId)
        .collection('notifications')
        .doc(notificationId)
        .update({
          isRead: true
        });
      
      return { success: true };
    } catch (error) {
      console.error('Mark Notification as Read Error:', error);
      throw error;
    }
  },
  
  // Update notification preferences
  updateNotificationPreferences: async (preferences) => {
    try {
      const userId = AuthService.getCurrentUser().uid;
      
      await firestore().collection('users').doc(userId).update({
        notificationPreferences: preferences
      });
      
      return { success: true };
    } catch (error) {
      console.error('Update Notification Preferences Error:', error);
      throw error;
    }
  },
  
  // Request notification permissions
  requestPermissions: async () => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
      if (enabled) {
        // Get FCM token
        const token = await messaging().getToken();
        
        // Register token
        await NotificationService.registerDeviceToken(token);
        
        return { enabled: true, token };
      }
      
      return { enabled: false };
    } catch (error) {
      console.error('Request Permissions Error:', error);
      throw error;
    }
  }
};
```

## Deployment and Testing

### Local Testing
1. Use Firebase Local Emulator Suite for testing
2. Set up test users and data
3. Verify security rules with the Rules Playground

### Beta Testing
1. Configure Firebase App Distribution
2. Set up test groups for VIT Bhopal students
3. Collect feedback through in-app reporting

### Production Deployment
1. Configure Firebase production environment
2. Set up monitoring and analytics
3. Implement gradual rollout strategy

## Scalability Considerations

### Multi-Campus Support
1. Add campus field to all collections
2. Implement campus-specific queries
3. Create admin tools for adding new campuses

### Performance Optimization
1. Implement query caching
2. Use pagination for large data sets
3. Optimize security rules for read/write operations

### Cost Management
1. Monitor Firebase usage
2. Implement quotas for high-cost operations
3. Use Firestore data bundles for static data
