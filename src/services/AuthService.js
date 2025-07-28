import auth from '@react-native-firebase/auth';
import { getAuthService } from '../firebase';

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

  static async signOut() {
    try {
      await auth().signOut();
    } catch (error) {
      throw error;
    }
  }
}
