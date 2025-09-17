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
  Modal,
  Alert,
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
  const [showMenu, setShowMenu] = useState(false);

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
      Alert.alert('Success', 'You have successfully joined the group!');
    } catch (error) {
      console.error('Error joining group:', error);
      Alert.alert('Error', 'Failed to join group. Please try again.');
    }
  };

  const handleLeaveGroup = async () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive',
          onPress: async () => {
            try {
              await GroupService.leaveGroup(groupId);
              navigation.goBack(); // Go back after leaving
            } catch (error) {
              console.error('Error leaving group:', error);
              Alert.alert('Error', 'Failed to leave group. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleEditGroup = () => {
    // Pass only serializable data to avoid navigation warnings
    const serializableGroup = {
      id: group.id,
      name: group.name,
      description: group.description,
      photoURL: group.photoURL,
      type: group.type,
      isPrivate: group.isPrivate
    };
    navigation.navigate('EditGroup', { groupId, group: serializableGroup });
  };

  const handleStartChat = async () => {
    try {
      console.log('Starting group chat for groupId:', groupId);
      const { chatId } = await GroupService.getGroupChat(groupId);
      console.log('Got chatId:', chatId);
      navigation.navigate('ChatScreen', { 
        chatId, 
        isGroupChat: true, 
        groupName: group?.name || 'Group Chat',
        groupId 
      });
    } catch (error) {
      console.error('Error starting chat:', error);
      // TODO: Show error message to user
      alert('Failed to start chat. Please try again.');
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
          
          <View style={{ flexDirection: 'row' }}>
            {isAdmin && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEditGroup}
              >
                <MaterialCommunityIcons name="pencil" size={24} color="white" />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.editButton, { marginLeft: isAdmin ? 8 : 0 }]}
              onPress={() => setShowMenu(true)}
            >
              <MaterialCommunityIcons name="dots-vertical" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.groupInfo}>
          <View style={styles.groupPhotoContainer}>
            {group.photoURL ? (
              <Image source={{ uri: group.photoURL }} style={styles.groupPhoto} />
            ) : (
              <View style={[styles.groupPhoto, styles.groupPhotoPlaceholder]}>
                <MaterialCommunityIcons name="account-group" size={32} color="#6c757d" />
              </View>
            )}
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
      <ScrollView 
        style={styles.tabContent} 
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
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
      </ScrollView>
    );
  };

  const renderMembersTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Members ({members.length})</Text>
      
      <FlatList
        data={members}
        keyExtractor={(item) => `${item.userId}-${item.role}`}
        style={styles.membersList}
        contentContainerStyle={{ paddingBottom: 20 }}
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
          contentContainerStyle={{ paddingBottom: 20 }}
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
    <View style={styles.container} key={`group-${groupId}-v2`}>
      {renderHeader()}
      {renderTabs()}
      
      <View style={styles.content}>
        {activeTab === 'about' && renderAboutTab()}
        {activeTab === 'members' && renderMembersTab()}
        {activeTab === 'events' && renderEventsTab()}
      </View>
      
      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            {isMember ? (
              <>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenu(false);
                    handleStartChat();
                  }}
                >
                  <MaterialCommunityIcons name="chat" size={20} color="#0d6efd" />
                  <Text style={styles.menuItemText}>Group Chat</Text>
                </TouchableOpacity>
                
                <View style={styles.menuDivider} />
                
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenu(false);
                    handleLeaveGroup();
                  }}
                >
                  <MaterialCommunityIcons name="exit-to-app" size={20} color="#dc3545" />
                  <Text style={[styles.menuItemText, { color: '#dc3545' }]}>Leave Group</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  handleJoinGroup();
                }}
              >
                <MaterialCommunityIcons name="account-plus" size={20} color="#28a745" />
                <Text style={[styles.menuItemText, { color: '#28a745' }]}>Join Group</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
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
  groupPhotoContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  groupPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'white',
  },
  groupPhotoPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
  // Menu Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 120, // Position below header
    paddingRight: 20,
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 8,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#212529',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginHorizontal: 16,
  },
});

export default GroupDetailsScreen;
