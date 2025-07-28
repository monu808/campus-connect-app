import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Pre-load all icon fonts to ensure they're available
MaterialCommunityIcons.loadFont();
Ionicons.loadFont();
FontAwesome.loadFont();
MaterialIcons.loadFont();

const IconDemoWithVectors = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Icon Demo With Vector Icons</Text>
      <Text style={styles.subtitle}>This demo shows all icons using vector icons directly</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MaterialCommunityIcons</Text>
        <View style={styles.iconsGrid}>
          <IconItem name="account-search" IconComponent={MaterialCommunityIcons} />
          <IconItem name="account-group" IconComponent={MaterialCommunityIcons} />
          <IconItem name="calendar" IconComponent={MaterialCommunityIcons} />
          <IconItem name="chat" IconComponent={MaterialCommunityIcons} />
          <IconItem name="account" IconComponent={MaterialCommunityIcons} />
          <IconItem name="plus" IconComponent={MaterialCommunityIcons} />
          <IconItem name="arrow-left" IconComponent={MaterialCommunityIcons} />
          <IconItem name="pencil" IconComponent={MaterialCommunityIcons} />
          <IconItem name="close" IconComponent={MaterialCommunityIcons} />
          <IconItem name="heart" IconComponent={MaterialCommunityIcons} />
          <IconItem name="star" IconComponent={MaterialCommunityIcons} />
          <IconItem name="send" IconComponent={MaterialCommunityIcons} />
          <IconItem name="bell" IconComponent={MaterialCommunityIcons} />
          <IconItem name="github" IconComponent={MaterialCommunityIcons} />
          <IconItem name="linkedin" IconComponent={MaterialCommunityIcons} />
          <IconItem name="logout" IconComponent={MaterialCommunityIcons} />
          <IconItem name="camera" IconComponent={MaterialCommunityIcons} />
          <IconItem name="information-outline" IconComponent={MaterialCommunityIcons} />
          <IconItem name="school" IconComponent={MaterialCommunityIcons} />
          <IconItem name="code-tags" IconComponent={MaterialCommunityIcons} />
          <IconItem name="lightbulb-on" IconComponent={MaterialCommunityIcons} />
          <IconItem name="delete-outline" IconComponent={MaterialCommunityIcons} />
          <IconItem name="bell-off-outline" IconComponent={MaterialCommunityIcons} />
          <IconItem name="calendar-blank" IconComponent={MaterialCommunityIcons} />
          <IconItem name="chevron-right" IconComponent={MaterialCommunityIcons} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>From Your Icons.js File</Text>
        <View style={styles.iconsGrid}>
          {/* ChatIcons */}
          <View style={styles.iconContainer}>
            <FontAwesome name="commenting-o" size={30} color="#0d6efd" />
            <Text style={styles.iconLabel}>ChatBubble</Text>
          </View>
          <View style={styles.iconContainer}>
            <FontAwesome name="users" size={30} color="#0d6efd" />
            <Text style={styles.iconLabel}>Group</Text>
          </View>
          <View style={styles.iconContainer}>
            <FontAwesome name="check" size={30} color="#0d6efd" />
            <Text style={styles.iconLabel}>SentTick</Text>
          </View>
          
          {/* NavigationIcons */}
          <View style={styles.iconContainer}>
            <MaterialIcons name="arrow-back" size={30} color="#28a745" />
            <Text style={styles.iconLabel}>Back</Text>
          </View>
          <View style={styles.iconContainer}>
            <MaterialIcons name="add" size={30} color="#28a745" />
            <Text style={styles.iconLabel}>Add</Text>
          </View>
          <View style={styles.iconContainer}>
            <MaterialIcons name="calendar-today" size={30} color="#28a745" />
            <Text style={styles.iconLabel}>Calendar</Text>
          </View>
          <View style={styles.iconContainer}>
            <MaterialIcons name="search" size={30} color="#28a745" />
            <Text style={styles.iconLabel}>Search</Text>
          </View>
          
          {/* MatchingIcons */}
          <View style={styles.iconContainer}>
            <Ionicons name="person-circle-outline" size={30} color="#dc3545" />
            <Text style={styles.iconLabel}>Profile</Text>
          </View>
          <View style={styles.iconContainer}>
            <Ionicons name="heart-outline" size={30} color="#dc3545" />
            <Text style={styles.iconLabel}>Like</Text>
          </View>
          <View style={styles.iconContainer}>
            <Ionicons name="close-circle-outline" size={30} color="#dc3545" />
            <Text style={styles.iconLabel}>Reject</Text>
          </View>
          <View style={styles.iconContainer}>
            <Ionicons name="star" size={30} color="#dc3545" />
            <Text style={styles.iconLabel}>SuperMatch</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// Helper component for consistent icon display
const IconItem = ({ name, IconComponent }) => {
  return (
    <View style={styles.iconContainer}>
      <IconComponent name={name} size={30} color="#0d6efd" />
      <Text style={styles.iconLabel}>{name}</Text>
    </View>
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
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#343a40',
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: '30%',
    height: 90,
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
    fontSize: 10,
    color: '#212529',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default IconDemoWithVectors;
