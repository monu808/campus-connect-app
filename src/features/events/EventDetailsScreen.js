import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { EventService } from '../../services/EventService';
import { AuthService } from '../../services/AuthService';

const EventDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId } = route.params;
  
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [userRsvpStatus, setUserRsvpStatus] = useState(null);
  const [showEditMode, setShowEditMode] = useState(false);
  
  // Edit mode states
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editStartTime, setEditStartTime] = useState(new Date());
  const [editEndTime, setEditEndTime] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [editTags, setEditTags] = useState([]);
  
  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);
  
  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch event details
      console.log('Fetching event details for ID:', eventId);
      const eventData = await EventService.getEventById(eventId);
      console.log('Event data received:', JSON.stringify({
        id: eventData.id,
        title: eventData.title,
        hasStartTime: !!eventData.startTime,
        hasEndTime: !!eventData.endTime
      }));
      
      setEvent(eventData);
      
      // Set edit mode initial values
      setEditTitle(eventData.title || '');
      setEditDescription(eventData.description || '');
      setEditLocation(eventData.location || '');
      
      if (eventData.startTime) {
        setEditStartTime(eventData.startTime);
      }
      
      if (eventData.endTime) {
        setEditEndTime(eventData.endTime);
      }
      
      setEditTags(eventData.tags || []);
      
      // Fetch attendees
      try {
        console.log('Fetching attendees for event:', eventId);
        const attendeesData = await EventService.getEventAttendees(eventId);
        console.log('Found', attendeesData.length, 'attendees');
        setAttendees(attendeesData);
        
        // Check user's RSVP status
        const userId = AuthService.getCurrentUser().uid;
        setIsOrganizer(eventData.organizer === userId);
        
        const userAttendee = attendeesData.find(attendee => attendee.userId === userId);
        if (userAttendee) {
          setUserRsvpStatus(userAttendee.status);
        }
      } catch (attendeesError) {
        console.error('Error fetching attendees:', attendeesError);
        // Continue even if attendees fetch fails
        setAttendees([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching event details:', error);
      Alert.alert(
        'Error',
        'Could not load event details. Please try again later.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      setLoading(false);
    }
  };
  
  const handleRSVP = async (status) => {
    try {
      await EventService.rsvpToEvent(eventId, status);
      setUserRsvpStatus(status);
      fetchEventDetails(); // Refresh data
    } catch (error) {
      console.error('Error RSVPing to event:', error);
      // Show error message
    }
  };
  
  const handleEditEvent = () => {
    setShowEditMode(true);
  };
  
  const handleSaveEvent = async () => {
    try {
      const updatedEvent = {
        title: editTitle,
        description: editDescription,
        location: editLocation,
        startTime: editStartTime,
        endTime: editEndTime,
        tags: editTags,
      };
      
      await EventService.updateEvent(eventId, updatedEvent);
      setShowEditMode(false);
      fetchEventDetails(); // Refresh data
    } catch (error) {
      console.error('Error updating event:', error);
      // Show error message
    }
  };
  
  const handleDeleteEvent = async () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await EventService.deleteEvent(eventId);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting event:', error);
              // Show error message
            }
          },
        },
      ]
    );
  };
  
  // Create a safe image component wrapper to handle errors
  const SafeImage = ({ source, style, fallbackColor = '#e1e1e1' }) => {
    const [hasError, setHasError] = useState(false);
    
    // Check if source is valid
    const isValidSource = source && 
      ((typeof source === 'object' && source.uri) || 
       (typeof source !== 'object'));
    
    if (!isValidSource || hasError) {
      return <View style={[style, { backgroundColor: fallbackColor }]} />;
    }
    
    return (
      <Image 
        source={source} 
        style={style}
        onError={() => setHasError(true)}
      />
    );
  };
  
  const renderHeader = () => {
    if (!event) return null;
    
    return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          
          {isOrganizer && !showEditMode && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditEvent}
            >
              <MaterialCommunityIcons name="pencil" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>
        
        {!showEditMode ? (
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventDateTime}>
              {event.startTime.toLocaleDateString()} • {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {' - '}
              {event.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={styles.eventLocation}>
              <MaterialCommunityIcons name="map-marker" size={16} color="white" />
              {' '}
              {event.location}
            </Text>
          </View>
        ) : (
          <View style={styles.editTitleContainer}>
            <TextInput
              style={styles.editTitleInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Event Title"
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
            />
          </View>
        )}
      </View>
    );
  };
  
  const renderEventDetails = () => {
    if (!event || showEditMode) return null;
    
    return (
      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{event.description}</Text>
        
        <Text style={styles.sectionTitle}>Tags</Text>
        <View style={styles.tagsContainer}>
          {event.tags && event.tags.map((tag, index) => (
            <View key={index} style={styles.tagChip}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        
        <Text style={styles.sectionTitle}>Organizer</Text>
        <View style={styles.organizerContainer}>
          {attendees.map(attendee => {
            if (attendee.userId === event.organizer) {
              return (
                <TouchableOpacity 
                  key={attendee.userId}
                  style={styles.organizerInfo}
                  onPress={() => navigation.navigate('UserProfile', { userId: attendee.userId })}
                >
                  {/* Added error boundary around Image */}
                  <SafeImage 
                    source={{ uri: attendee.photoURL || 'https://via.placeholder.com/50' }} 
                    style={styles.organizerAvatar}
                  />
                  <View>
                    <Text style={styles.organizerName}>{attendee.displayName}</Text>
                    <Text style={styles.organizerDetails}>
                      {attendee.branch}, Year {attendee.year}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }
            return null;
          })}
        </View>
      </View>
    );
  };
  
  const renderAttendees = () => {
    if (!event || showEditMode) return null;
    
    const yesAttendees = attendees.filter(attendee => attendee.status === 'yes');
    const maybeAttendees = attendees.filter(attendee => attendee.status === 'maybe');
    const noAttendees = attendees.filter(attendee => attendee.status === 'no');
    
    return (
      <View style={styles.attendeesContainer}>
        <Text style={styles.sectionTitle}>Attendees ({yesAttendees.length})</Text>
        
        {yesAttendees.length > 0 ? (
          <View style={styles.attendeesList}>
            {yesAttendees.map(attendee => (
              <TouchableOpacity 
                key={attendee.userId}
                style={styles.attendeeItem}
                onPress={() => navigation.navigate('UserProfile', { userId: attendee.userId })}
              >
                <SafeImage 
                  source={{ uri: attendee.photoURL || 'https://via.placeholder.com/40' }} 
                  style={styles.attendeeAvatar}
                />
                <View style={styles.attendeeInfo}>
                  <Text style={styles.attendeeName}>{attendee.displayName}</Text>
                  <Text style={styles.attendeeDetails}>
                    {attendee.branch}, Year {attendee.year}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.noAttendeesText}>No confirmed attendees yet</Text>
        )}
        
        {maybeAttendees.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Maybe ({maybeAttendees.length})</Text>
            <View style={styles.attendeesList}>
              {maybeAttendees.map(attendee => (
                <TouchableOpacity 
                  key={attendee.userId}
                  style={styles.attendeeItem}
                  onPress={() => navigation.navigate('UserProfile', { userId: attendee.userId })}
                >
                  <SafeImage 
                    source={{ uri: attendee.photoURL || 'https://via.placeholder.com/40' }} 
                    style={styles.attendeeAvatar}
                  />
                  <View style={styles.attendeeInfo}>
                    <Text style={styles.attendeeName}>{attendee.displayName}</Text>
                    <Text style={styles.attendeeDetails}>
                      {attendee.branch}, Year {attendee.year}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>
    );
  };
  
  const renderEditForm = () => {
    if (!showEditMode) return null;
    
    return (
      <View style={styles.editFormContainer}>
        <Text style={styles.editSectionTitle}>Event Details</Text>
        
        <Text style={styles.editLabel}>Start Time</Text>
        <TouchableOpacity
          style={styles.dateTimeSelector}
          onPress={() => setShowStartDatePicker(true)}
        >
          <MaterialCommunityIcons name="clock-outline" size={20} color="#0d6efd" style={styles.dateTimeIcon} />
          <Text style={styles.dateTimeText}>
            {editStartTime.toLocaleDateString()} {editStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
        
        {showStartDatePicker && (
          <DateTimePicker
            value={editStartTime}
            mode="datetime"
            display="default"
            onChange={(event, date) => {
              setShowStartDatePicker(Platform.OS === 'ios');
              if (date) setEditStartTime(date);
            }}
          />
        )}
        
        <Text style={styles.editLabel}>End Time</Text>
        <TouchableOpacity
          style={styles.dateTimeSelector}
          onPress={() => setShowEndDatePicker(true)}
        >
          <MaterialCommunityIcons name="clock-outline" size={20} color="#0d6efd" style={styles.dateTimeIcon} />
          <Text style={styles.dateTimeText}>
            {editEndTime.toLocaleDateString()} {editEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
        
        {showEndDatePicker && (
          <DateTimePicker
            value={editEndTime}
            mode="datetime"
            display="default"
            onChange={(event, date) => {
              setShowEndDatePicker(Platform.OS === 'ios');
              if (date) setEditEndTime(date);
            }}
          />
        )}
        
        <Text style={styles.editLabel}>Location</Text>
        <TextInput
          style={styles.editInput}
          value={editLocation}
          onChangeText={setEditLocation}
          placeholder="Event Location"
        />
        
        <Text style={styles.editLabel}>Description</Text>
        <TextInput
          style={[styles.editInput, styles.editTextArea]}
          value={editDescription}
          onChangeText={setEditDescription}
          placeholder="Event Description"
          multiline
          numberOfLines={4}
        />
        
        <Text style={styles.editLabel}>Tags</Text>
        <View style={styles.editTagsContainer}>
          {editTags.map((tag, index) => (
            <View key={index} style={styles.editTagChip}>
              <Text style={styles.editTagText}>{tag}</Text>
              <TouchableOpacity
                onPress={() => {
                  const newTags = [...editTags];
                  newTags.splice(index, 1);
                  setEditTags(newTags);
                }}
              >
                <MaterialCommunityIcons name="close" size={16} color="#0d6efd" />
              </TouchableOpacity>
            </View>
          ))}
          
          <TextInput
            style={styles.tagInput}
            placeholder="Add tag..."
            onSubmitEditing={(e) => {
              const newTag = e.nativeEvent.text.trim();
              if (newTag && !editTags.includes(newTag)) {
                setEditTags([...editTags, newTag]);
              }
              e.target.clear();
            }}
          />
        </View>
      </View>
    );
  };
  
  const renderActionButtons = () => {
    if (showEditMode) {
      return (
        <View style={styles.editActionButtonsContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowEditMode(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveEvent}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteEvent}
          >
            <Text style={styles.deleteButtonText}>Delete Event</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (isOrganizer) {
      return (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.editEventButton}
            onPress={handleEditEvent}
          >
            <Text style={styles.editEventButtonText}>Edit Event</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.rsvpContainer}>
        <Text style={styles.rsvpTitle}>Will you attend?</Text>
        
        <View style={styles.rsvpButtons}>
          <TouchableOpacity
            style={[
              styles.rsvpButton,
              userRsvpStatus === 'yes' && styles.activeRsvpButton
            ]}
            onPress={() => handleRSVP('yes')}
          >
            <MaterialCommunityIcons 
              name="check" 
              size={20} 
              color={userRsvpStatus === 'yes' ? 'white' : '#28a745'} 
            />
            <Text 
              style={[
                styles.rsvpButtonText,
                userRsvpStatus === 'yes' && styles.activeRsvpButtonText
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.rsvpButton,
              userRsvpStatus === 'maybe' && styles.activeRsvpButton,
              { backgroundColor: userRsvpStatus === 'maybe' ? '#ffc107' : '#fff9db' }
            ]}
            onPress={() => handleRSVP('maybe')}
          >
            <MaterialCommunityIcons 
              name="help" 
              size={20} 
              color={userRsvpStatus === 'maybe' ? 'white' : '#ffc107'} 
            />
            <Text 
              style={[
                styles.rsvpButtonText,
                userRsvpStatus === 'maybe' && styles.activeRsvpButtonText,
                { color: userRsvpStatus === 'maybe' ? 'white' : '#ffc107' }
              ]}
            >
              Maybe
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.rsvpButton,
              userRsvpStatus === 'no' && styles.activeRsvpButton,
              { backgroundColor: userRsvpStatus === 'no' ? '#dc3545' : '#f8d7da' }
            ]}
            onPress={() => handleRSVP('no')}
          >
            <MaterialCommunityIcons 
              name="close" 
              size={20} 
              color={userRsvpStatus === 'no' ? 'white' : '#dc3545'} 
            />
            <Text 
              style={[
                styles.rsvpButtonText,
                userRsvpStatus === 'no' && styles.activeRsvpButtonText,
                { color: userRsvpStatus === 'no' ? 'white' : '#dc3545' }
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d6efd" />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.content}>
        {renderEventDetails()}
        {renderEditForm()}
        {renderAttendees()}
      </ScrollView>
      
      {renderActionButtons()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#0d6efd',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventInfo: {
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  eventDateTime: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  eventLocation: {
    fontSize: 16,
    color: 'white',
  },
  editTitleContainer: {
    width: '100%',
  },
  editTitleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.5)',
    paddingVertical: 5,
  },
  content: {
    flex: 1,
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#212529',
    marginBottom: 20,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  tagChip: {
    backgroundColor: '#e7f1ff',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  tagText: {
    fontSize: 14,
    color: '#0d6efd',
  },
  organizerContainer: {
    marginBottom: 20,
  },
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
  },
  organizerDetails: {
    fontSize: 14,
    color: '#6c757d',
  },
  attendeesContainer: {
    padding: 20,
    backgroundColor: 'white',
  },
  attendeesList: {
    marginTop: 10,
  },
  attendeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  attendeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  attendeeInfo: {
    flex: 1,
  },
  attendeeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
  },
  attendeeDetails: {
    fontSize: 14,
    color: '#6c757d',
  },
  noAttendeesText: {
    fontSize: 16,
    color: '#6c757d',
    fontStyle: 'italic',
    marginTop: 10,
  },
  editFormContainer: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  editSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 15,
  },
  editLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 5,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 15,
  },
  editTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateTimeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 15,
  },
  dateTimeIcon: {
    marginRight: 10,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#212529',
  },
  editTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  editTagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7f1ff',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  editTagText: {
    fontSize: 14,
    color: '#0d6efd',
    marginRight: 5,
  },
  tagInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 14,
    marginBottom: 5,
    minWidth: 100,
  },
  actionButtonsContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  editActionButtonsContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  editEventButton: {
    backgroundColor: '#0d6efd',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editEventButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#6c757d',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
  saveButton: {
    backgroundColor: '#0d6efd',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  deleteButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#dc3545',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc3545',
  },
  rsvpContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  rsvpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 15,
    textAlign: 'center',
  },
  rsvpButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rsvpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e7f5ea',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flex: 1,
    marginHorizontal: 5,
  },
  activeRsvpButton: {
    backgroundColor: '#28a745',
  },
  rsvpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28a745',
    marginLeft: 5,
  },
  activeRsvpButtonText: {
    color: 'white',
  },
});

export default EventDetailsScreen;
