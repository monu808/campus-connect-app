import auth from '@react-native-firebase/auth';
import { getAuthService, getFirestoreService } from '../firebase';

export class AuthService {
  static getCurrentUser() {
    try {
      return auth().currentUser;
    } catch (error) {
      console.warn('Error getting current user:', error);
      return null;
    }
  }

  static async signIn(email, password) {
    try {
      const authService = await getAuthService();
      const result = await authService.signInWithEmailAndPassword(email, password);
      return result.user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  static async signUp(email, password) {
    try {
      const result = await auth().createUserWithEmailAndPassword(email, password);
      return result.user;
    } catch (error) {
      throw error;
    }
  }

  static async createUserDocument(uid, userData) {
    try {
      const firestore = await getFirestoreService();
      const userDoc = {
        ...userData,
        uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        profileComplete: false,
      };
      
      await firestore.collection('users').doc(uid).set(userDoc);
      console.log('User document created successfully');
      return userDoc;
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  }

  static async getUserDocument(uid) {
    try {
      const firestore = await getFirestoreService();
      const doc = await firestore.collection('users').doc(uid).get();
      
      if (doc.exists) {
        return doc.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting user document:', error);
      throw error;
    }
  }

  static async updateUserDocument(uid, updates) {
    try {
      const firestore = await getFirestoreService();
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };
      
      await firestore.collection('users').doc(uid).update(updateData);
      console.log('User document updated successfully');
      return updateData;
    } catch (error) {
      console.error('Error updating user document:', error);
      throw error;
    }
  }

  static async signOut() {
    try {
      await auth().signOut();
    } catch (error) {
      throw error;
    }
  }

  static async resetPassword(email) {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }
}
