// PNG Icons Demo Screen 
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { 
  ChatIcons, 
  NavigationIcons, 
  MatchingIcons,
  GamificationIcons, 
  NotificationIcons, 
  FormIcons,
  SocialIcons,
  ProfileIcons
} from './PngIcons';

const IconGroup = ({ title, icons }) => (
  <View style={styles.groupContainer}>
    <Text style={styles.groupTitle}>{title}</Text>
    <View style={styles.iconRow}>
      {Object.entries(icons).map(([name, IconComponent], index) => (
        <View key={index} style={styles.iconContainer}>
          <IconComponent size={24} color="#0d6efd" />
          <Text style={styles.iconName}>{name}</Text>
        </View>
      ))}
    </View>
  </View>
);

const PngIconsDemo = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PNG Icons Demo</Text>
        <Text style={styles.headerSubtitle}>All available PNG icons in the app</Text>
      </View>
      
      <IconGroup title="Chat Icons" icons={ChatIcons} />
      <IconGroup title="Navigation Icons" icons={NavigationIcons} />
      <IconGroup title="Matching Icons" icons={MatchingIcons} />
      <IconGroup title="Gamification Icons" icons={GamificationIcons} />
      <IconGroup title="Notification Icons" icons={NotificationIcons} />
      <IconGroup title="Form Icons" icons={FormIcons} />
      <IconGroup title="Social Icons" icons={SocialIcons} />
      <IconGroup title="Profile Icons" icons={ProfileIcons} />
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          PNG icons are more reliable across different platforms and don't require font loading.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d6efd',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  groupContainer: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  iconContainer: {
    width: '25%',
    alignItems: 'center',
    padding: 8,
    marginBottom: 12,
  },
  iconName: {
    fontSize: 12,
    color: '#495057',
    marginTop: 4,
    textAlign: 'center',
  },
  footer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#e7f1ff',
    borderRadius: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#0d6efd',
    textAlign: 'center',
  },
});

export default PngIconsDemo;
