import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const OnboardingScreen = () => {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    navigation.navigate('SignIn');
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>Campus Connect</Text>
        <Text style={styles.tagline}>Connect, Collaborate, Succeed</Text>
      </View>

      <View style={styles.featuresContainer}>
        <FeatureItem 
          icon="account-search" 
          title="Find Collaborators" 
          description="Match with students who share your academic interests"
        />
        <FeatureItem 
          icon="account-group" 
          title="Join Groups" 
          description="Create or join study groups and project teams"
        />
        <FeatureItem 
          icon="trophy" 
          title="Earn Achievements" 
          description="Get rewarded for your academic collaborations"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const FeatureItem = ({ icon, title, description }) => (
  <View style={styles.featureItem}>
    <MaterialCommunityIcons name={icon} size={32} color="#4A90E2" />
    <View style={styles.featureTextContainer}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0d6efd',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 18,
    color: '#6c757d',
    textAlign: 'center',
  },
  featuresContainer: {
    marginVertical: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  featureTextContainer: {
    marginLeft: 20,
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 16,
    color: '#6c757d',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  featureTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  button: {
    backgroundColor: '#0d6efd',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;
