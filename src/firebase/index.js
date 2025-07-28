// Import Firebase services
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import functions from '@react-native-firebase/functions';
import messaging from '@react-native-firebase/messaging';

// Initialize variables at the top level
let firebaseApp = null;
let initializationPromise = null;

console.log('Firebase module loading...');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyByzb--VK6jbhOSjJVx0QcUhe4LtlnOoEw",
  authDomain: "anonymous-feedback-platform.firebaseapp.com",
  databaseURL: "https://anonymous-feedback-platform-default-rtdb.firebaseio.com",
  projectId: "anonymous-feedback-platform", 
  storageBucket: "anonymous-feedback-platform.firebasestorage.app",
  messagingSenderId: "646189071770",
  appId: "1:646189071770:android:0c6faab70216cd50a8ce23"
};

// Enable offline persistence
const enableOfflinePersistence = async () => {
  try {
    await firestore().settings({
      cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
      persistence: true
    });
    console.log('Offline persistence enabled');
    return true;
  } catch (error) {
    console.error('Error enabling offline persistence:', error);
    return false;
  }
};

// Verify write access to Firestore
const verifyFirestoreAccess = async () => {
  try {
    console.log('Verifying Firestore write access...');
    const testDocRef = firestore().collection('_test_write_').doc();
    await testDocRef.set({ timestamp: firestore.FieldValue.serverTimestamp() });
    await testDocRef.delete();
    console.log('Firestore write access verified');
    return true;
  } catch (error) {
    console.error('Firestore write access verification failed:', error);
    return false;
  }
};

// Initialize Firebase with retries
const initializeFirebase = async () => {
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      console.log(`Starting Firebase initialization (attempt ${retryCount + 1}/${maxRetries})...`);
      
      // Check for existing initialized app
      if (firebase.apps.length > 0) {
        console.log('Found existing Firebase app');
        firebaseApp = firebase.app();
      } else {
        console.log('No existing app found, initializing manually...');
        firebaseApp = firebase.initializeApp(firebaseConfig);
      }

      // Enable offline persistence
      await enableOfflinePersistence();
      
      // Verify write access
      const hasWriteAccess = await verifyFirestoreAccess();
      if (!hasWriteAccess) {
        throw new Error('Failed to verify Firestore write access');
      }
      
      console.log('Firebase initialized successfully!', {
        name: firebaseApp.name,
        projectId: firebaseApp.options.projectId
      });
      
      return firebaseApp;
      
    } catch (error) {
      retryCount++;
      console.error(`Firebase initialization error (attempt ${retryCount}):`, error);
      
      if (retryCount < maxRetries) {
        const delay = retryCount * 2000;
        console.log(`Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
};

// Initialize Firebase function and export it
export const getFirebaseApp = async () => {
  if (!initializationPromise) {
    console.log('Creating new initialization promise');
    initializationPromise = initializeFirebase()
      .catch(error => {
        console.error('Failed to initialize Firebase:', error);
        throw error;
      });
  }
  
  try {
    const app = await initializationPromise;
    if (!app) {
      console.error('Firebase initialization returned null');
      throw new Error('Firebase initialization failed');
    }
    return app;
  } catch (error) {
    console.error('Error in getFirebaseApp:', error);
    throw error;
  }
};

// Check if Firebase is ready
export const isFirebaseReady = () => {
  return firebaseApp !== null;
};

// Get Auth Service
export const getAuthService = async () => {
  try {
    await getFirebaseApp();
    return auth();
  } catch (error) {
    console.error('Error getting Auth service:', error);
    throw error;
  }
};

// Get Firestore service
export const getFirestoreService = async () => {
  try {
    await getFirebaseApp();
    return firestore();
  } catch (error) {
    console.error('Error getting Firestore service:', error);
    throw error;
  }
};

// Force enable network
export const forceEnableNetwork = async () => {
  try {
    await getFirebaseApp(); // Ensure Firebase is initialized
    await firestore().enableNetwork();
    console.log('Network forcibly enabled');
    return true;
  } catch (error) {
    console.error('Error enabling network:', error);
    throw error;
  }
};

// Export Firebase services
export {
  firebase,
  auth,
  firestore,
  storage,
  functions,
  messaging,
  initializationPromise
};
