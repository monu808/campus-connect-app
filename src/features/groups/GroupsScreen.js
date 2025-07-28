import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Card from '../../components/Card';

const GroupsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setError(null);
      if (!refreshing) setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setGroups([
        {
          id: '1',
          name: 'Biology Study Group',
          description: 'Weekly review sessions for biology',
          memberCount: 12,
          type: 'Study Group',
        },
        {
          id: '2',
          name: 'Computer Science Project',
          description: 'Collaborative web development project',
          memberCount: 3,
          type: 'Project Team',
        },
        {
          id: '3',
          name: 'Startup Pitch Competition',
          description: 'Prepare and present startup ideas',
          memberCount: 13,
          type: 'Hackathon',
        },
      ]);
    } catch (err) {
      setError('Failed to load groups. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchGroups();
  };

  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="account-group" size={80} color="#0d6efd" />
        <Text style={styles.emptyStateTitle}>No Groups Found</Text>
        <Text style={styles.emptyStateText}>
          Join or create a group to get started!
        </Text>
        <TouchableOpacity 
          style={styles.emptyStateButton}
          onPress={() => {/* Navigate to create group */}}
        >
          <Text style={styles.emptyStateButtonText}>Create Group</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#0d6efd" />
        <Text style={styles.loadingText}>Loading groups...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <MaterialCommunityIcons name="alert-circle" size={80} color="#dc3545" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchGroups}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={groups}
        renderItem={({ item }) => (
          <Card onPress={() => navigation.navigate('GroupDetailsScreen', { groupId: item.id })}>
            <View style={styles.groupItem}>
              <Text style={styles.groupName}>{item.name}</Text>
              <Text style={styles.groupDescription}>{item.description}</Text>
              <View style={styles.groupFooter}>
                <View style={styles.memberCount}>
                  <MaterialCommunityIcons name="account-group" size={16} color="#6c757d" />
                  <Text style={styles.memberCountText}>{item.memberCount} members</Text>
                </View>
                <Text style={[styles.groupType, getGroupTypeStyle(item.type)]}>{item.type}</Text>
              </View>
            </View>
          </Card>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => {/* Navigate to create group */}}
      >
        <MaterialCommunityIcons name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const getGroupTypeStyle = (type) => {
  switch (type) {
    case 'Study Group':
      return styles.studyGroup;
    case 'Project Team':
      return styles.projectTeam;
    case 'Hackathon':
      return styles.hackathon;
    default:
      return {};
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContent: {
    padding: 16,
  },
  groupItem: {
    padding: 16,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  groupDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCountText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6c757d',
  },
  groupType: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    fontSize: 12,
    color: 'white',
  },
  studyGroup: {
    backgroundColor: '#28a745',
  },
  projectTeam: {
    backgroundColor: '#0d6efd',
  },
  hackathon: {
    backgroundColor: '#6610f2',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0d6efd',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  retryButton: {
    backgroundColor: '#0d6efd',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GroupsScreen;
