import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { GroupService } from '../../services/GroupService';
import { FriendsService } from '../../services/FriendsService';

const CreateGroupScreen = () => {
  const navigation = useNavigation();
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      const friendsList = await FriendsService.getFriends();
      setFriends(friendsList);
    } catch (error) {
      console.error('Error loading friends:', error);
      Alert.alert('Error', 'Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const toggleFriendSelection = (friend) => {
    setSelectedFriends(prev => {
      const isSelected = prev.some(f => f.userId === friend.userId);
      if (isSelected) {
        return prev.filter(f => f.userId !== friend.userId);
      } else {
        return [...prev, friend];
      }
    });
  };

  const createGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (selectedFriends.length === 0) {
      Alert.alert('Error', 'Please select at least one friend to add to the group');
      return;
    }

    setCreating(true);

    try {
      const groupData = {
        name: groupName.trim(),
        description: groupDescription.trim(),
        type: 'general',
        isPrivate: false,
      };

      const selectedFriendIds = selectedFriends.map(friend => friend.userId);
      const result = await GroupService.createGroup(groupData, selectedFriendIds);

      Alert.alert(
        'Success',
        'Group created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
              navigation.navigate('GroupDetails', { groupId: result.groupId });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', error.message || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const renderFriendItem = ({ item: friend }) => {
    const isSelected = selectedFriends.some(f => f.userId === friend.userId);
    
    return (
      <TouchableOpacity
        style={[styles.friendItem, isSelected && styles.friendItemSelected]}
        onPress={() => toggleFriendSelection(friend)}
        activeOpacity={0.7}
      >
        <Image
          source={friend.photoURL ? { uri: friend.photoURL } : require('../../assets/profile-placeholder.png')}
          style={styles.friendAvatar}
          defaultSource={require('../../assets/profile-placeholder.png')}
        />
        
        <View style={styles.friendInfo}>
          <Text style={styles.friendName} numberOfLines={1}>
            {friend.displayName}
          </Text>
          <Text style={styles.friendDetails} numberOfLines={1}>
            {friend.branch} • {friend.year}
          </Text>
        </View>
        
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Icon name="check" size={16} color="#FFFFFF" />}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSelectedFriend = (friend) => (
    <View key={friend.userId} style={styles.selectedFriendChip}>
      <Image
        source={friend.photoURL ? { uri: friend.photoURL } : require('../../assets/profile-placeholder.png')}
        style={styles.chipAvatar}
        defaultSource={require('../../assets/profile-placeholder.png')}
      />
      <Text style={styles.chipName} numberOfLines={1}>
        {friend.displayName}
      </Text>
      <TouchableOpacity
        onPress={() => toggleFriendSelection(friend)}
        style={styles.chipRemove}
      >
        <Icon name="x" size={14} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="users" size={48} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>No Friends Available</Text>
      <Text style={styles.emptySubtitle}>
        You need to match with people first to add them to groups
      </Text>
      <TouchableOpacity
        style={styles.matchButton}
        onPress={() => navigation.navigate('Matching')}
      >
        <Text style={styles.matchButtonText}>Start Matching</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Group</Text>
        <TouchableOpacity
          onPress={createGroup}
          disabled={creating || !groupName.trim() || selectedFriends.length === 0}
          style={[
            styles.createButton,
            (creating || !groupName.trim() || selectedFriends.length === 0) && styles.createButtonDisabled
          ]}
        >
          <Text style={[
            styles.createButtonText,
            (creating || !groupName.trim() || selectedFriends.length === 0) && styles.createButtonTextDisabled
          ]}>
            {creating ? 'Creating...' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Group Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Group Name *</Text>
            <TextInput
              style={styles.textInput}
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Enter group name"
              placeholderTextColor="#9CA3AF"
              maxLength={50}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description (optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textInputMultiline]}
              value={groupDescription}
              onChangeText={setGroupDescription}
              placeholder="Describe your group..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              maxLength={200}
            />
          </View>
        </View>

        {/* Selected Friends */}
        {selectedFriends.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Selected Members ({selectedFriends.length})
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.selectedFriendsContainer}
            >
              {selectedFriends.map(renderSelectedFriend)}
            </ScrollView>
          </View>
        )}

        {/* Add Friends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Friends</Text>
          <Text style={styles.sectionSubtitle}>
            You can only add people you've matched with
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading friends...</Text>
            </View>
          ) : friends.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={friends}
              keyExtractor={(item) => item.userId}
              renderItem={renderFriendItem}
              scrollEnabled={false}
              style={styles.friendsList}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
  },
  createButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  createButtonTextDisabled: {
    color: '#9CA3AF',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  textInputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  selectedFriendsContainer: {
    flexDirection: 'row',
  },
  selectedFriendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4FF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  chipAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  chipName: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    maxWidth: 80,
  },
  chipRemove: {
    marginLeft: 8,
    padding: 2,
  },
  friendsList: {
    maxHeight: 400,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  friendItemSelected: {
    backgroundColor: '#EBF4FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  friendDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  matchButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  matchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateGroupScreen;