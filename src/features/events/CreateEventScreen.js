import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavigationIcons } from '../../PngIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { EventService } from '../../services/EventService';

const CreateEventScreen = () => {  const navigation = useNavigation();
  const route = useRoute();
  const { groupId, onCreateSuccess } = route.params || {};

  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    location: '',
    date: new Date(),
    time: new Date(),
    maxParticipants: '',
    isPublic: true,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateEvent = async () => {
    if (!eventData.title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    if (!eventData.description.trim()) {
      Alert.alert('Error', 'Please enter an event description');
      return;
    }

    try {
      setLoading(true);
      
      // Combine date and time for start time
      const startTime = new Date(eventData.date);
      startTime.setHours(eventData.time.getHours());
      startTime.setMinutes(eventData.time.getMinutes());
      
      console.log('Event date:', eventData.date);
      console.log('Event time:', eventData.time);
      console.log('Combined startTime:', startTime);
      
      // Create end time (default to 2 hours after start)
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 2);
      console.log('Calculated endTime:', endTime);

      // Make sure current date is before event date
      const now = new Date();
      if (startTime < now) {
        console.warn('Event start time is in the past, adjusting to future');
        startTime.setDate(now.getDate());
        startTime.setHours(now.getHours() + 1);
        
        // Update end time as well
        endTime.setDate(startTime.getDate());
        endTime.setHours(startTime.getHours() + 2);
      }
      
      console.log('Final startTime:', startTime);
      console.log('Final endTime:', endTime);

      const newEvent = {
        title: eventData.title,
        description: eventData.description,
        location: eventData.location || '',
        startTime: startTime,
        endTime: endTime,
        groupId: groupId || null,
        maxParticipants: parseInt(eventData.maxParticipants) || null,
        tags: ['General'],  // Default tag
        isPublic: eventData.isPublic
      };
      
      // Set a timeout to prevent infinite loading
      const createEventPromise = EventService.createEvent(newEvent);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Event creation timed out after 12 seconds')), 12000);
      });
      
      try {
        // Race between the actual operation and the timeout
        const { eventId } = await Promise.race([createEventPromise, timeoutPromise]);
        console.log('Event created with ID:', eventId);
        
        Alert.alert(
          'Success',
          'Event created successfully!',
          [
            {
              text: 'View Event',
              onPress: () => {
                navigation.navigate('EventDetailsScreen', { eventId });
              },
            },
            {
              text: 'Back to Events',
              onPress: () => {
                if (groupId) {
                  // If creating from a group, call the success callback if provided
                  if (onCreateSuccess) {
                    onCreateSuccess();
                  }
                  navigation.goBack();
                } else {
                  // If creating from the events screen, navigate to the events screen with upcoming tab
                  navigation.navigate('EventsScreen', { activeTab: 'upcoming', refresh: true });
                }
              },
            },
          ],
          { cancelable: false }
        );
      } catch (timeoutError) {
        console.error('Event creation timed out:', timeoutError);
        Alert.alert(
          'Creation Taking Too Long', 
          'The event may still be created in the background. Please check the Events tab in a moment.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('EventsScreen', { activeTab: 'upcoming', refresh: true });
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event: ' + (error.message || 'Please try again'));
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEventData(prev => ({ ...prev, date: selectedDate }));
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setEventData(prev => ({ ...prev, time: selectedTime }));
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
        <Text style={styles.headerTitle}>Create Event</Text>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleCreateEvent}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Creating...' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>Event Title *</Text>
          <TextInput
            style={styles.input}
            value={eventData.title}
            onChangeText={(text) => setEventData(prev => ({ ...prev, title: text }))}
            placeholder="Enter event title"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={eventData.description}
            onChangeText={(text) => setEventData(prev => ({ ...prev, description: text }))}
            placeholder="Describe your event"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={eventData.location}
            onChangeText={(text) => setEventData(prev => ({ ...prev, location: text }))}
            placeholder="Event location"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {eventData.date.toLocaleDateString()}
              </Text>
              <NavigationIcons.Calendar size={20} />
            </TouchableOpacity>
          </View>

          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>Time</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {eventData.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <NavigationIcons.Calendar size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Max Participants (Optional)</Text>
          <TextInput
            style={styles.input}
            value={eventData.maxParticipants}
            onChangeText={(text) => setEventData(prev => ({ ...prev, maxParticipants: text }))}
            placeholder="Leave empty for unlimited"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={eventData.date}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={eventData.time}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0d6efd',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  saveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    flex: 0.48,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  textArea: {
    height: 100,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
});

export default CreateEventScreen;
