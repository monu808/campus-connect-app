import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  ChatIcons,
  NavigationIcons,
  MatchingIcons,
  GamificationIcons,
  NotificationIcons,
  FormIcons
} from './Icons';

const IconsUsageExample = ({ navigation }) => {
  // This will force icon font loading when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      // You can put any specific font loading code here if needed
      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Icons.js Usage Examples</Text>
      <Text style={styles.description}>
        Below are examples of how to use the custom icon components from Icons.js
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chat Icons</Text>
        <View style={styles.row}>
          <IconContainer label="ChatBubble">
            <ChatIcons.ChatBubble size={24} color="#0d6efd" />
          </IconContainer>
          <IconContainer label="Group">
            <ChatIcons.Group size={24} color="#0d6efd" />
          </IconContainer>
          <IconContainer label="SentTick">
            <ChatIcons.SentTick size={24} color="#0d6efd" />
          </IconContainer>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Navigation Icons</Text>
        <View style={styles.row}>
          <IconContainer label="Back">
            <NavigationIcons.Back size={24} color="#28a745" />
          </IconContainer>
          <IconContainer label="Add">
            <NavigationIcons.Add size={24} color="#28a745" />
          </IconContainer>
          <IconContainer label="Calendar">
            <NavigationIcons.Calendar size={24} color="#28a745" />
          </IconContainer>
          <IconContainer label="Search">
            <NavigationIcons.Search size={24} color="#28a745" />
          </IconContainer>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Matching Icons</Text>
        <View style={styles.row}>
          <IconContainer label="Profile">
            <MatchingIcons.Profile size={24} color="#dc3545" />
          </IconContainer>
          <IconContainer label="Like">
            <MatchingIcons.Like size={24} color="#dc3545" />
          </IconContainer>
          <IconContainer label="Reject">
            <MatchingIcons.Reject size={24} color="#dc3545" />
          </IconContainer>
          <IconContainer label="SuperMatch">
            <MatchingIcons.SuperMatch size={24} color="#dc3545" />
          </IconContainer>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gamification Icons</Text>
        <View style={styles.row}>
          <IconContainer label="Trophy">
            <GamificationIcons.Trophy size={24} color="#ffc107" />
          </IconContainer>
          <IconContainer label="Medal">
            <GamificationIcons.Medal size={24} color="#ffc107" />
          </IconContainer>
          <IconContainer label="Badge">
            <GamificationIcons.Badge size={24} color="#ffc107" />
          </IconContainer>
          <IconContainer label="XP">
            <GamificationIcons.XP size={24} color="#ffc107" />
          </IconContainer>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Icons</Text>
        <View style={styles.row}>
          <IconContainer label="Notification">
            <NotificationIcons.Notification size={24} color="#6610f2" />
          </IconContainer>
          <IconContainer label="Message">
            <NotificationIcons.Message size={24} color="#6610f2" />
          </IconContainer>
          <IconContainer label="GroupInvite">
            <NotificationIcons.GroupInvite size={24} color="#6610f2" />
          </IconContainer>
          <IconContainer label="Event">
            <NotificationIcons.Event size={24} color="#6610f2" />
          </IconContainer>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Form Icons</Text>
        <View style={styles.row}>
          <IconContainer label="Name">
            <FormIcons.Name size={24} color="#343a40" />
          </IconContainer>
          <IconContainer label="Branch">
            <FormIcons.Branch size={24} color="#343a40" />
          </IconContainer>
          <IconContainer label="Year">
            <FormIcons.Year size={24} color="#343a40" />
          </IconContainer>
          <IconContainer label="Skills">
            <FormIcons.Skills size={24} color="#343a40" />
          </IconContainer>
        </View>
      </View>

      <View style={styles.codeExample}>
        <Text style={styles.codeTitle}>Example Code:</Text>
        <Text style={styles.code}>
{`import { ChatIcons } from './Icons';

// In your component
<ChatIcons.ChatBubble size={24} color="#0d6efd" />
`}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Go Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Helper component for displaying icons with labels
const IconContainer = ({ children, label }) => (
  <View style={styles.iconContainer}>
    <View style={styles.iconWrapper}>{children}</View>
    <Text style={styles.iconLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d6efd',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#343a40',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  iconContainer: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconLabel: {
    fontSize: 12,
    color: '#212529',
    textAlign: 'center',
    marginTop: 4,
  },
  codeExample: {
    backgroundColor: '#272822',
    padding: 16,
    borderRadius: 8,
    marginVertical: 24,
  },
  codeTitle: {
    color: '#f8f9fa',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  code: {
    color: '#a6e22e',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#0d6efd',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default IconsUsageExample;
