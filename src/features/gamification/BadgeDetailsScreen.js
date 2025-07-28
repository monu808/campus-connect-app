import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { NavigationIcons, GamificationIcons } from '../../PngIcons';
import { useNavigation } from '@react-navigation/native';
import { GamificationService } from '../../services/GamificationService';

const BadgeDetailsScreen = ({ route }) => {
  const { badge } = route.params;
  const navigation = useNavigation();
  
  const getBadgeIcon = () => {
    // Map badge types to PNG icon components
    switch (badge.type) {
      case 'achievement':
        return <GamificationIcons.TrophyAward size={80} />;
      case 'community':
        return <GamificationIcons.AccountGroup size={80} />;
      case 'match':
        return <GamificationIcons.AccountMultiple size={80} />;
      case 'event':
        return <GamificationIcons.Medal size={80} />;
      default:
        return <GamificationIcons.Badge size={80} />;
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <NavigationIcons.ArrowLeft size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Badge Details</Text>
      </View>
      
      <View style={styles.badgeContainer}>
        <View style={styles.badgeIconContainer}>
          {getBadgeIcon()}
        </View>
        
        <Text style={styles.badgeName}>{badge.name}</Text>
        <Text style={styles.badgeDescription}>{badge.description}</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>How to earn this badge</Text>
        <Text style={styles.infoText}>{badge.description}</Text>
        
        <Text style={styles.infoTitle}>Badge Benefits</Text>
        <Text style={styles.infoText}>
          Earning this badge will boost your profile visibility and help you connect with more students.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#0d6efd',
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  badgeContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e7f1ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  badgeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 10,
  },
  badgeDescription: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 20,
  },
});

export default BadgeDetailsScreen;
