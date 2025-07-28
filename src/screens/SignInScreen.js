import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const SignInScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Create a test user with email/password for development
      const userCredential = await auth().createUserWithEmailAndPassword(
        'test@example.com',
        'password123'
      );
      
    } catch (error) {
      // If user already exists, try to sign in instead
      if (error.code === 'auth/email-already-in-use') {
        try {
          await auth().signInWithEmailAndPassword('test@example.com', 'password123');
        } catch (signInError) {
          setError('Sign in failed. Please try again.');
          console.error('Sign in error:', signInError);
        }
      } else {
        setError('Sign in failed. Please try again.');
        console.error('Sign in error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#0d6efd" />
      </TouchableOpacity>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>Please sign in to continue</Text>
        
        <TouchableOpacity 
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          <Image 
            source={require('../assets/google-logo.png')} 
            style={styles.googleLogo}
            resizeMode="contain"
          />
          <Text style={styles.googleButtonText}>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </Text>
        </TouchableOpacity>
        
        {error && <Text style={styles.errorText}>{error}</Text>}
        
        <Text style={styles.termsText}>
          By signing in, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  backButton: {
    marginTop: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 40,
    textAlign: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    marginBottom: 20,
  },
  googleLogo: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '500',
  },
  errorText: {
    color: '#dc3545',
    marginBottom: 20,
  },
  termsText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default SignInScreen;
