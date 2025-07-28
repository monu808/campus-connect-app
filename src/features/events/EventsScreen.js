import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { EventService } from '../../services/EventService';
import { AuthService } from '../../services/AuthService';
import DateTimePicker from '@react-native-community/datetimepicker';

const EventsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(
    route.params?.activeTab || 'upcoming'
  ); // upcoming, past, my
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, [activeTab, selectedDate]);
  
  // Update useEffect to respond to route.params.refresh
  useEffect(() => {
    if (route.params?.refresh) {
      console.log('Refresh parameter detected, fetching events');
      fetchEvents();
    }
  }, [route.params?.refresh]);
  
  // Refresh events when the screen comes into focus (e.g., after creating a new event)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Events screen focused, refreshing events');
      fetchEvents();
    });
    
    return unsubscribe;
  }, [navigation]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log('Fetching events with activeTab:', activeTab);
      
      let filters = {
        timeframe: activeTab,
      };
      
      if (selectedTags.length > 0) {
        filters.tags = selectedTags;
        console.log('Including tag filters:', selectedTags);
      }
      
      let fetchedEvents = [];
      
      if (activeTab === 'my') {
        console.log('Fetching user events');
        try {
          fetchedEvents = await EventService.getUserEvents();
          console.log(`Got ${fetchedEvents.length} user events`);
        } catch (error) {
          console.error('Error fetching user events:', error);
          fetchedEvents = [];
        }
        
        // If no events are found, add a mock event for testing
        if (fetchedEvents.length === 0) {
          console.log('No events found, adding a mock event for testing');
          fetchedEvents = [{
            id: 'mock-event-1',
            title: 'Sample Event',
            description: 'This is a sample event to show the events UI is working',
            location: 'Main Auditorium',
            startTime: new Date(Date.now() + 86400000), // Tomorrow
            endTime: new Date(Date.now() + 86400000 + 7200000), // Tomorrow + 2 hours
            createdAt: new Date(),
            organizer: AuthService.getCurrentUser().uid,
            attendees: [{ userId: AuthService.getCurrentUser().uid, status: 'yes' }],
            tags: ['Sample']
          }];
        }
        setEvents(fetchedEvents);
      } else {
        console.log('Fetching filtered events with:', filters);
        let fetchedEvents = [];
        try {
          // Force cache refresh by adding a timestamp to the request
          filters.timestamp = Date.now();
          fetchedEvents = await EventService.getEvents(filters);
          console.log(`Got ${fetchedEvents.length} filtered events`);
          
          // Log first event for debugging
          if (fetchedEvents.length > 0) {
            const firstEvent = fetchedEvents[0];
            console.log('First event:', JSON.stringify({
              id: firstEvent.id,
              title: firstEvent.title,
              startTime: firstEvent.startTime
            }));
          }
        } catch (error) {
          console.error('Error fetching events:', error);
        }
        
        if (fetchedEvents.length === 0) {
          console.log('No events found with current filters');
          
          // Temporary workaround: If no events found and we're in upcoming tab, add mock events
          if (activeTab === 'upcoming') {
            console.log('Adding mock events for testing');
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            tomorrow.setHours(14, 0, 0, 0); // 2 PM tomorrow
            
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);
            nextWeek.setHours(10, 0, 0, 0); // 10 AM next week
            
            const userId = AuthService.getCurrentUser().uid;
            
            const mockEvents = [
              {
                id: 'mock1',
                title: 'Campus Hackathon',
                description: 'Join us for a 24-hour coding challenge!',
                location: 'Engineering Building',
                startTime: tomorrow,
                endTime: new Date(tomorrow.getTime() + 86400000), // 24 hours later
                createdAt: today,
                organizer: userId,
                attendees: [{ userId, status: 'yes' }],
                tags: ['Hackathon', 'Coding', 'Competition']
              },
              {
                id: 'mock2',
                title: 'Study Group - Finals Prep',
                description: 'Get ready for finals with our study group',
                location: 'Library, Room 204',
                startTime: nextWeek,
                endTime: new Date(nextWeek.getTime() + 10800000), // 3 hours later
                createdAt: today,
                organizer: AuthService.getCurrentUser()?.uid,
                attendees: [],
                tags: ['Study', 'Finals', 'Group']
              }
            ];
            
            console.log('Added mock events:', mockEvents.length);
            setEvents(mockEvents);
          } else {
            setEvents(fetchedEvents);
          }
        } else {
          console.log('First event:', JSON.stringify({
            id: fetchedEvents[0].id,
            title: fetchedEvents[0].title,
            startTime: fetchedEvents[0].startTime
          }));
          setEvents(fetchedEvents);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchEvents();
      return;
    }
    
    try {
      setLoading(true);
      const searchResults = await EventService.searchEvents(searchQuery);
      
      // Filter based on active tab
      let filteredResults = searchResults;
      const now = new Date();
      
      if (activeTab === 'upcoming') {
        filteredResults = searchResults.filter(event => event.startTime >= now);
      } else if (activeTab === 'past') {
        filteredResults = searchResults.filter(event => event.startTime < now);
      } else if (activeTab === 'my') {
        const userId = AuthService.getCurrentUser().uid;
        filteredResults = searchResults.filter(event => 
          event.organizer === userId || 
          event.attendees.some(attendee => attendee.userId === userId)
        );
      }
      
      setEvents(filteredResults);
      setLoading(false);
    } catch (error) {
      console.error('Error searching events:', error);
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    navigation.navigate('CreateEvent');
  };
  
  // For testing purposes - create a mock event directly
  const createMockEvent = async () => {
    try {
      console.log('Creating mock event for testing');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 0, 0, 0); // 2 PM tomorrow
      
      const mockEvent = {
        title: 'Test Event ' + new Date().toISOString().substring(0, 10),
        description: 'This is a test event created for debugging purposes',
        location: 'Test Location',
        startTime: tomorrow,
        endTime: new Date(tomorrow.getTime() + 7200000), // 2 hours later
        tags: ['Test', 'Debug'],
        isPublic: true
      };
      
      const { eventId } = await EventService.createEvent(mockEvent);
      console.log('Created mock event with ID:', eventId);
      
      // Refresh events list
      Alert.alert('Mock Event Created', 'A test event has been created for tomorrow at 2 PM');
      fetchEvents();
    } catch (error) {
      console.error('Error creating mock event:', error);
      Alert.alert('Error', 'Failed to create mock event: ' + error.message);
    }
  };

  const handleEventPress = (event) => {
    navigation.navigate('EventDetailsScreen', { eventId: event.id });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Events</Text>
      <View style={styles.headerButtons}>
        <TouchableOpacity 
          style={[styles.iconButton, { marginRight: 10 }]}
          onPress={handleRefresh}
          disabled={loading}
        >
          <MaterialCommunityIcons name="refresh" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateEvent}
        >
          <MaterialCommunityIcons name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity 
        style={[
          styles.tab,
          activeTab === 'upcoming' && styles.activeTab
        ]}
        onPress={() => setActiveTab('upcoming')}
      >
        <Text 
          style={[
            styles.tabText,
            activeTab === 'upcoming' && styles.activeTabText
          ]}
        >
          Upcoming
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.tab,
          activeTab === 'past' && styles.activeTab
        ]}
        onPress={() => setActiveTab('past')}
      >
        <Text 
          style={[
            styles.tabText,
            activeTab === 'past' && styles.activeTabText
          ]}
        >
          Past
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.tab,
          activeTab === 'my' && styles.activeTab
        ]}
        onPress={() => setActiveTab('my')}
      >
        <Text 
          style={[
            styles.tabText,
            activeTab === 'my' && styles.activeTabText
          ]}
        >
          My Events
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <MaterialCommunityIcons name="magnify" size={20} color="#6c757d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              fetchEvents();
            }}
          >
            <MaterialCommunityIcons name="close" size={20} color="#6c757d" />
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilters(true)}
      >
        <MaterialCommunityIcons name="filter-variant" size={24} color="#0d6efd" />
      </TouchableOpacity>
    </View>
  );

  const renderDateSelector = () => (
    <View style={styles.dateSelectorContainer}>
      <TouchableOpacity
        style={styles.dateSelector}
        onPress={() => setShowDatePicker(true)}
      >
        <MaterialCommunityIcons name="calendar" size={20} color="#0d6efd" style={styles.dateIcon} />
        <Text style={styles.dateText}>
          {selectedDate.toLocaleDateString(undefined, { 
            month: 'long', 
            year: 'numeric' 
          })}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={20} color="#0d6efd" />
      </TouchableOpacity>
      
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (date) setSelectedDate(date);
          }}
        />
      )}
    </View>
  );

  const renderEventItem = ({ item }) => {
    const isUserEvent = item.organizer === AuthService.getCurrentUser().uid;
    
    return (
      <TouchableOpacity 
        style={styles.eventCard}
        onPress={() => handleEventPress(item)}
      >
        <View style={styles.eventHeader}>
          <View style={styles.eventDate}>
            <Text style={styles.eventMonth}>
              {item.startTime.toLocaleString('default', { month: 'short' })}
            </Text>
            <Text style={styles.eventDay}>
              {item.startTime.getDate()}
            </Text>
          </View>
          
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventTime}>
              {item.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {' - '}
              {item.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          
          {isUserEvent && (
            <View style={styles.organizerBadge}>
              <Text style={styles.organizerBadgeText}>Organizer</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.eventLocation}>
          <MaterialCommunityIcons name="map-marker" size={16} color="#6c757d" />
          {' '}
          {item.location}
        </Text>
        
        <View style={styles.eventFooter}>
          <View style={styles.tagsContainer}>
            {item.tags && item.tags.slice(0, 2).map((tag, index) => (
              <View key={index} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {item.tags && item.tags.length > 2 && (
              <View style={styles.tagChip}>
                <Text style={styles.tagText}>+{item.tags.length - 2}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.attendeesInfo}>
            <MaterialCommunityIcons name="account-group" size={16} color="#6c757d" />
            <Text style={styles.attendeesCount}>
              {item.attendees ? item.attendees.length : 0}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFiltersModal = () => {
    const availableTags = [
      'Hackathon', 'Workshop', 'Study Group', 'Project', 'Competition',
      'Seminar', 'Conference', 'Meetup', 'Tech Talk', 'Career Fair'
    ];
    
    return (
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Events</Text>
              <TouchableOpacity
                onPress={() => setShowFilters(false)}
              >
                <MaterialCommunityIcons name="close" size={24} color="#212529" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.filterSectionTitle}>Event Type</Text>
              <View style={styles.tagsGrid}>
                {availableTags.map((tag, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.filterTagChip,
                      selectedTags.includes(tag) && styles.selectedFilterTagChip
                    ]}
                    onPress={() => {
                      if (selectedTags.includes(tag)) {
                        setSelectedTags(selectedTags.filter(t => t !== tag));
                      } else {
                        setSelectedTags([...selectedTags, tag]);
                      }
                    }}
                  >
                    <Text 
                      style={[
                        styles.filterTagText,
                        selectedTags.includes(tag) && styles.selectedFilterTagText
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setSelectedTags([]);
                }}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => {
                  setShowFilters(false);
                  fetchEvents();
                }}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderEmptyState = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons 
          name="calendar-blank" 
          size={80} 
          color="#0d6efd" 
        />
        <Text style={styles.emptyStateTitle}>
          {activeTab === 'my' 
            ? "You don't have any events" 
            : "No events found"}
        </Text>
        <Text style={styles.emptyStateText}>
          {activeTab === 'my' 
            ? "Create an event or RSVP to events to see them here" 
            : "Try changing your filters or search query"}
        </Text>
        
        <TouchableOpacity 
          style={styles.emptyStateButton}
          onPress={handleCreateEvent}
        >
          <Text style={styles.emptyStateButtonText}>Create Event</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.emptyStateButton, { marginTop: 10, backgroundColor: '#6c757d' }]}
          onPress={createMockEvent}
        >
          <Text style={styles.emptyStateButtonText}>Create Test Event</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Button for handling refresh to force fetch events from server
  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Get newest events
      console.log('Manually refreshing events');
      const recentEvents = await EventService.getRecentlyCreatedEvents();
      console.log(`Found ${recentEvents.length} recent events`);
      
      if (recentEvents.length > 0) {
        // Filter based on active tab
        const now = new Date();
        let filteredEvents = [];
        
        if (activeTab === 'upcoming') {
          filteredEvents = recentEvents.filter(event => event.startTime >= now);
        } else if (activeTab === 'past') {
          filteredEvents = recentEvents.filter(event => event.startTime < now);
        } else {
          filteredEvents = recentEvents;
        }
        
        // Only update if we found events matching the current filter
        if (filteredEvents.length > 0) {
          console.log(`Showing ${filteredEvents.length} recent events that match current filter`);
          setEvents(filteredEvents);
        } else {
          console.log('No recent events match current filter, running regular fetch');
          fetchEvents();
        }
      } else {
        // If no recent events, do regular fetch
        fetchEvents();
      }
    } catch (error) {
      console.error('Error refreshing events:', error);
      fetchEvents();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderTabs()}
      {renderSearchBar()}
      {renderDateSelector()}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0d6efd" />
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.eventsList}
          ListEmptyComponent={renderEmptyState}
        />
      )}
      
      <TouchableOpacity 
        style={styles.fab}
        onPress={handleCreateEvent}
      >
        <MaterialCommunityIcons name="plus" size={24} color="white" />
      </TouchableOpacity>
      
      {renderFiltersModal()}
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0d6efd',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6c757d',
  },
  activeTabText: {
    color: '#0d6efd',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#212529',
  },
  filterButton: {
    marginLeft: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e7f1ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateSelectorContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateIcon: {
    marginRight: 10,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0d6efd',
    marginRight: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventsList: {
    padding: 15,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  eventDate: {
    width: 50,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#e7f1ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  eventMonth: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0d6efd',
    textTransform: 'uppercase',
  },
  eventDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0d6efd',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 5,
  },
  eventTime: {
    fontSize: 14,
    color: '#6c757d',
  },
  organizerBadge: {
    backgroundColor: '#0d6efd',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  organizerBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  eventLocation: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 10,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    backgroundColor: '#f1f3f5',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
  },
  tagText: {
    fontSize: 12,
    color: '#6c757d',
  },
  attendeesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeesCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
    marginLeft: 5,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0d6efd',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  modalBody: {
    padding: 20,
    maxHeight: '70%',
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 15,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterTagChip: {
    backgroundColor: '#f1f3f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    margin: 5,
  },
  selectedFilterTagChip: {
    backgroundColor: '#0d6efd',
  },
  filterTagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  selectedFilterTagText: {
    color: 'white',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6c757d',
  },
  applyButton: {
    backgroundColor: '#0d6efd',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#0d6efd',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default EventsScreen;
