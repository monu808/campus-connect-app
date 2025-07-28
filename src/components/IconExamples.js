import React from 'react';
import { View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ChatIcons, NavigationIcons, MatchingIcons, GamificationIcons, NotificationIcons, FormIcons } from '../Icons';

/**
 * This component provides examples of how to use both direct vector icons
 * and custom icon components in your features.
 * 
 * Usage example:
 * 
 * import IconExamples from '../components/IconExamples';
 * 
 * // In your component:
 * <IconExamples />
 */

const IconExamples = () => {
  return (
    <View style={styles.container}>
      {/* Example 1: Direct Vector Icons Usage */}
      <View style={styles.row}>
        <MaterialCommunityIcons name="account" size={24} color="#212529" />
        <Ionicons name="heart-outline" size={24} color="#dc3545" />
        <FontAwesome name="user" size={24} color="#0d6efd" />
        <MaterialIcons name="search" size={24} color="#28a745" />
      </View>
      
      {/* Example 2: Icons.js Custom Components */}
      <View style={styles.row}>
        <ChatIcons.ChatBubble size={24} color="#0d6efd" />
        <NavigationIcons.Calendar size={24} color="#28a745" />
        <MatchingIcons.Like size={24} color="#dc3545" />
        <GamificationIcons.Trophy size={24} color="#ffc107" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
});

export default IconExamples;
