import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GroupService } from '../../services/GroupService';
import { EventService } from '../../services/EventService';
import { AuthService } from '../../services/AuthService';

const GroupDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId } = route.params;
  
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [activeTab, setActiveTab] = useState('about'); // about, members, events

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);
  
  // Refresh group details when the screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Group details screen focused, refreshing data');
      fetchGroupDetails();
    });
    
    return unsubscribe;
  }, [navigation]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching group details for groupId:', groupId);
      
      // Fetch group details
      const groupData = await GroupService.getGroupById(groupId);
      console.log('Group data received:', groupData);
      setGroup(groupData);
      
      // Fetch group members
      const membersData = await GroupService.getGroupMembers(groupId);
      console.log('Members data received:', membersData);
      setMembers(membersData);
      
      // Fetch group events
      const eventsData = await EventService.getGroupEvents(groupId);
      console.log('Events data received:', eventsData);
      setEvents(eventsData);
      
      // Check if current user is admin or member
      const userId = AuthService.getCurrentUser().uid;
      const userMember = membersData.find(member => member.userId === userId);
      
      if (userMember) {
        setIsMember(true);
        setIsAdmin(userMember.role === 'admin');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching group details:', error);
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    try {
      await GroupService.joinGroup(groupId);
      fetchGroupDetails(); // Refresh data
    } catch (error) {
      console.error('Error joining group:', error);
      // Show error message
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await GroupService.leaveGroup(groupId);
      fetchGroupDetails(); // Refresh data
    } catch (error) {
      console.error('Error leaving group:', error);
      // Show error message
    }
  };

  const handleEditGroup = () => {
    navigation.navigate('EditGroup', { groupId, group });
  };

  const handleStartChat = async () => {
    try {
      const { chatId } = await GroupService.getGroupChat(groupId);
      navigation.navigate('Chat', { chatId, isGroupChat: true, group });
    } catch (error) {
      console.error('Error starting chat:', error);
      // Show error message
    }
  };

  const handleCreateEvent = () => {
    navigation.navigate('CreateEvent', { 
      groupId,
      onCreateSuccess: () => fetchGroupDetails()
    });
  };

  const renderHeader = () => {
    if (!group) return null;
    
    const groupTypeIcon = {
      study: 'book-open-variant',
      project: 'laptop',
      hackathon: 'code-tags'
    };
    
    return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          
          {isAdmin && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditGroup}
            >
              <MaterialCommunityIcons name="pencil" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.groupInfo}>
          <View style={[styles.groupTypeIndicator, getGroupTypeStyle(group.type)]}>
            <MaterialCommunityIcons name={groupTypeIcon[group.type] || 'account-group'} size={24} color="white" />
          </View>
          
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.groupType}>
            {group.type.charAt(0).toUpperCase() + group.type.slice(1)} Group
          </Text>
          
          <View style={styles.memberCount}>
            <MaterialCommunityIcons name="account-group" size={16} color="white" />
            <Text style={styles.memberCountText}>{members.length} members</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity 
        style={[
          styles.tab,
          activeTab === 'about' && styles.activeTab
        ]}
        onPress={() => setActiveTab('about')}
      >
        <Text 
          style={[
            styles.tabText,
            activeTab === 'about' && styles.activeTabText
          ]}
        >
          About
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.tab,
          activeTab === 'members' && styles.activeTab
        ]}
        onPress={() => setActiveTab('members')}
      >
        <Text 
          style={[
            styles.tabText,
            activeTab === 'members' && styles.activeTabText
          ]}
        >
          Members
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.tab,
          activeTab === 'events' && styles.activeTab
        ]}
        onPress={() => setActiveTab('events')}
      >
        <Text 
          style={[
            styles.tabText,
            activeTab === 'events' && styles.activeTabText
          ]}
        >
          Events
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderAboutTab = () => {
    if (!group) return null;
    
    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{group.description}</Text>
        
        <Text style={styles.sectionTitle}>Tags</Text>
        <View style={styles.tagsContainer}>
          {group.tags && group.tags.map((tag, index) => (
            <View key={index} style={styles.tagChip}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        
        <Text style={styles.sectionTitle}>Created</Text>
        <Text style={styles.createdText}>
          {group.createdAt.toDateString()}
        </Text>
      </View>
    );
  };

  const renderMembersTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Members ({members.length})</Text>
      
      <FlatList
        data={members}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.memberItem}
            onPress={() => navigation.navigate('UserProfile', { userId: item.userId })}
          >
            <Image 
              source={{ uri: item.photoURL || 'https://via.placeholder.com/50' }} 
              style={styles.memberAvatar} 
            />
            
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{item.displayName}</Text>
              <Text style={styles.memberDetails}>
                {item.branch}, Year {item.year}
              </Text>
            </View>
            
            {item.role === 'admin' && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        style={styles.membersList}
      />
    </View>
  );

  const renderEventsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.eventsHeader}>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        
        {isAdmin && (
          <TouchableOpacity
            style={styles.createEventButton}
            onPress={handleCreateEvent}
          >
            <MaterialCommunityIcons name="plus" size={16} color="#0d6efd" />
            <Text style={styles.createEventButtonText}>Create</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {events.length === 0 ? (
        <View style={styles.emptyEvents}>
          <MaterialCommunityIcons name="calendar-blank" size={60} color="#0d6efd" />
          <Text style={styles.emptyEventsTitle}>No upcoming events</Text>
          <Text style={styles.emptyEventsText}>
            {isAdmin 
              ? 'Create an event for this group' 
              : 'Check back later for upcoming events'}
          </Text>
          
          {isAdmin && (
            <TouchableOpacity
              style={styles.createEventButtonLarge}
              onPress={handleCreateEvent}
            >
              <Text style={styles.createEventButtonLargeText}>Create Event</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.eventItem}
              onPress={() => navigation.navigate('EventDetailsScreen', { eventId: item.id })}
            >
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
                <Text style={styles.eventLocation} numberOfLines={1}>
                  {item.location}
                </Text>
              </View>
              
              <MaterialCommunityIcons name="chevron-right" size={24} color="#6c757d" />
            </TouchableOpacity>
          )}
          style={styles.eventsList}
        />
      )}
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtonsContainer}>
      {isMember ? (
        <>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={handleStartChat}
          >
            <MaterialCommunityIcons name="chat" size={20} color="white" />
            <Text style={styles.chatButtonText}>Group Chat</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.leaveButton}
            onPress={handleLeaveGroup}
          >
            <Text style={styles.leaveButtonText}>Leave Group</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          style={styles.joinButton}
          onPress={handleJoinGroup}
        >
          <Text style={styles.joinButtonText}>Join Group</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const getGroupTypeStyle = (type) => {
    switch (type) {
      case 'study':
        return { backgroundColor: '#28a745' };
      case 'project':
        return { backgroundColor: '#0d6efd' };
      case 'hackathon':
        return { backgroundColor: '#6610f2' };
      default:
        return { backgroundColor: '#6c757d' };
    }
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
      {renderTabs()}
      
      <ScrollView style={styles.content}>
        {activeTab === 'about' && renderAboutTab()}
        {activeTab === 'members' && renderMembersTab()}
        {activeTab === 'events' && renderEventsTab()}
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
  groupInfo: {
    alignItems: 'center',
  },
  groupTypeIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  groupType: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCountText: {
    fontSize: 14,
    color: 'white',
    marginLeft: 5,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
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
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
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
  createdText: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 20,
  },
  membersList: {
    marginTop: 10,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
  },
  memberDetails: {
    fontSize: 14,
    color: '#6c757d',
  },
  adminBadge: {
    backgroundColor: '#0d6efd',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  createEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7f1ff',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  createEventButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0d6efd',
    marginLeft: 5,
  },
  eventsList: {
    marginTop: 10,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 5,
  },
  eventTime: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 3,
  },
  eventLocation: {
    fontSize: 14,
    color: '#6c757d',
  },
  emptyEvents: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 20,
  },
  emptyEventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginTop: 15,
    marginBottom: 5,
  },
  emptyEventsText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  createEventButtonLarge: {
    backgroundColor: '#0d6efd',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  createEventButtonLargeText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  actionButtonsContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  joinButton: {
    backgroundColor: '#0d6efd',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  chatButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d6efd',
    borderRadius: 25,
    paddingVertical: 12,
    marginBottom: 10,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 10,
  },
  leaveButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#dc3545',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc3545',
  },
});

export default GroupDetailsScreen;
