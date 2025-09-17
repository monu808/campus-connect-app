import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { GroupService } from '../../services/GroupService';
import { uploadImage } from '../../utils/imageStorageUtils';

const EditGroupScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId, group } = route.params;

  const [groupData, setGroupData] = useState({
    name: group?.name || '',
    description: group?.description || '',
    photoURL: group?.photoURL || '',
  });
  
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleSave = async () => {
    if (!groupData.name.trim()) {
      Alert.alert('Error', 'Group name is required');
      return;
    }

    try {
      setLoading(true);
      await GroupService.updateGroup(groupId, {
        name: groupData.name.trim(),
        description: groupData.description.trim(),
        photoURL: groupData.photoURL,
      });
      
      Alert.alert('Success', 'Group updated successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error updating group:', error);
      Alert.alert('Error', 'Failed to update group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPhoto = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel || response.error) {
        return;
      }

      if (response.assets && response.assets[0]) {
        try {
          setUploadingPhoto(true);
          const asset = response.assets[0];
          
          // Upload image to Firebase Storage
          const imageUrl = await uploadImage(asset.uri, `group-images/${groupId}`);
          
          // Update local state
          setGroupData(prev => ({ ...prev, photoURL: imageUrl }));
          
        } catch (error) {
          console.error('Error uploading photo:', error);
          Alert.alert('Error', 'Failed to upload photo. Please try again.');
        } finally {
          setUploadingPhoto(false);
        }
      }
    });
  };

  const handleRemovePhoto = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove the group photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setGroupData(prev => ({ ...prev, photoURL: '' })),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Group</Text>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Group Photo Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Group Photo</Text>
          <View style={styles.photoSection}>
            <View style={styles.photoContainer}>
              {groupData.photoURL ? (
                <Image source={{ uri: groupData.photoURL }} style={styles.groupPhoto} />
              ) : (
                <View style={[styles.groupPhoto, styles.photoPlaceholder]}>
                  <MaterialCommunityIcons name="account-group" size={40} color="#6c757d" />
                </View>
              )}
            </View>
            
            <View style={styles.photoButtons}>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={handleUploadPhoto}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? (
                  <ActivityIndicator size="small" color="#0d6efd" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="camera" size={20} color="#0d6efd" />
                    <Text style={styles.photoButtonText}>
                      {groupData.photoURL ? 'Change Photo' : 'Add Photo'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              
              {groupData.photoURL && (
                <TouchableOpacity
                  style={[styles.photoButton, styles.removeButton]}
                  onPress={handleRemovePhoto}
                >
                  <MaterialCommunityIcons name="delete" size={20} color="#dc3545" />
                  <Text style={[styles.photoButtonText, styles.removeButtonText]}>
                    Remove Photo
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Group Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Group Name *</Text>
          <TextInput
            style={styles.input}
            value={groupData.name}
            onChangeText={(text) => setGroupData(prev => ({ ...prev, name: text }))}
            placeholder="Enter group name"
            placeholderTextColor="#999"
          />
        </View>

        {/* Group Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={groupData.description}
            onChangeText={(text) => setGroupData(prev => ({ ...prev, description: text }))}
            placeholder="Describe your group"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
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
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  photoSection: {
    alignItems: 'center',
  },
  photoContainer: {
    marginBottom: 16,
  },
  groupPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f8f9fa',
  },
  photoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7f1ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0d6efd',
  },
  removeButton: {
    backgroundColor: '#ffebee',
  },
  removeButtonText: {
    color: '#dc3545',
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
});

export default EditGroupScreen;