// Test component to verify icon fixes
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const IconFixTest = () => {
  const iconNames = [
    'account-search',
    'account-group',
    'calendar',
    'chat',
    'account',
    'plus',
    'arrow-left',
    'pencil',
    'close',
    'heart',
    'star',
    'send',
    'bell',
    'github',
    'linkedin',
    'logout',
    'camera',
    'information-outline',
    'school',
    'code-tags',
    'lightbulb-on',
    // 'delete-outline',
    // 'bell-off-outline',
    // 'calendar-blank',
    // 'chevron-right'
  ];

  // Map of icon image sources
  const iconImages = {
    logout: require('./assets/icons/logout.png'),
    camera: require('./assets/icons/camera.png'),
    'information-outline': require('./assets/icons/information-outline.png'),
    school: require('./assets/icons/school.png'),
    'code-tags': require('./assets/icons/code-tags.png'),
    'lightbulb-on': require('./assets/icons/lightbulb-on.png'),
    // Remove references to non-existent images
    // 'delete-outline': require('./assets/icons/delete-outline.png'),
    // 'bell-off-outline': require('./assets/icons/bell-off-outline.png'),
    // 'calendar-blank': require('./assets/icons/calendar-blank.png'),
    // 'chevron-right': require('./assets/icons/chevron-right.png'),
  };

  useEffect(() => {
    MaterialCommunityIcons.loadFont().catch(error => {
      console.warn('Error loading MaterialCommunityIcons font in IconFixTest:', error);
    });
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Icon Fix Verification</Text>
      <Text style={styles.subtitle}>This screen shows all icons to verify they're working</Text>
      
      <View style={styles.iconsGrid}>
        {iconNames.map(iconName => {
          const imageSource = iconImages[iconName];
          return (
            <View style={styles.iconContainer} key={iconName}>
              {imageSource ? (
                <Image source={imageSource} style={styles.iconImage} />
              ) : (
                <MaterialCommunityIcons name={iconName} size={32} color="#0d6efd" />
              )}
              <Text style={styles.iconLabel}>{iconName}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d6efd',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 32,
    textAlign: 'center',
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: '30%',
    height: 100,
    padding: 8,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconLabel: {
    fontSize: 12,
    color: '#212529',
    textAlign: 'center',
    marginTop: 8,
  },
  iconImage: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
});

export default IconFixTest;
