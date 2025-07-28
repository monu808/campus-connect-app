import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

// Create a directory for assets if it doesn't exist
const Logo = () => {
  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/logo.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
  },
});

export default Logo;
