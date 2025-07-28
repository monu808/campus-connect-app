import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ChatIcons, NavigationIcons, MatchingIcons, GamificationIcons, NotificationIcons, FormIcons } from './Icons';

const IconDemo = () => (
  <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.header}>Campus Connect Icon Demo</Text>
    <View style={styles.row}><Text style={styles.label}>ChatIcons:</Text>
      <ChatIcons.ChatBubble size={32} color="#0d6efd" />
      <ChatIcons.Group size={32} color="#28a745" />
      <ChatIcons.SentTick size={32} color="#ffc107" />
    </View>
    <View style={styles.row}><Text style={styles.label}>NavigationIcons:</Text>
      <NavigationIcons.Back size={32} color="#0d6efd" />
      <NavigationIcons.Add size={32} color="#28a745" />
      <NavigationIcons.Calendar size={32} color="#ffc107" />
      <NavigationIcons.Search size={32} color="#dc3545" />
    </View>
    <View style={styles.row}><Text style={styles.label}>MatchingIcons:</Text>
      <MatchingIcons.Profile size={32} color="#0d6efd" />
      <MatchingIcons.Like size={32} color="#dc3545" />
      <MatchingIcons.Reject size={32} color="#6c757d" />
      <MatchingIcons.SuperMatch size={32} color="#ffc107" />
    </View>
    <View style={styles.row}><Text style={styles.label}>GamificationIcons:</Text>
      <GamificationIcons.Trophy size={32} color="#ffc107" />
      <GamificationIcons.Medal size={32} color="#6f42c1" />
      <GamificationIcons.Badge size={32} color="#0d6efd" />
      <GamificationIcons.XP size={32} color="#28a745" />
    </View>
    <View style={styles.row}><Text style={styles.label}>NotificationIcons:</Text>
      <NotificationIcons.Notification size={32} color="#0d6efd" />
      <NotificationIcons.Message size={32} color="#28a745" />
      <NotificationIcons.GroupInvite size={32} color="#ffc107" />
      <NotificationIcons.Event size={32} color="#dc3545" />
      <NotificationIcons.Achievement size={32} color="#6f42c1" />
    </View>
    <View style={styles.row}><Text style={styles.label}>FormIcons:</Text>
      <FormIcons.Name size={32} color="#0d6efd" />
      <FormIcons.Branch size={32} color="#28a745" />
      <FormIcons.Year size={32} color="#ffc107" />
      <FormIcons.Skills size={32} color="#dc3545" />
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'flex-start',
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    flexWrap: 'wrap',
  },
  label: {
    width: 140,
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
  },
});

export default IconDemo;
