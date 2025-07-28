import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FormIcons, NavigationIcons, ProfileIcons } from '../PngIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    branch: '',
    year: '',
    skills: [],
    interests: [],
    bio: '',
    photoURL: null,
    github: '',
    linkedin: '',
  });
  const [currentSkill, setCurrentSkill] = useState('');
  const [currentInterest, setCurrentInterest] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const user = auth().currentUser;
      
      if (!user) {
        Alert.alert('Error', 'User not found. Please sign in again.');
        return;
      }
      
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();        // Create a properly formatted photo URL
        const photoSource = userData.photoURL && typeof userData.photoURL === 'string' 
          ? { uri: userData.photoURL }
          : require('../assets/profile-placeholder.png');
          
        console.log('Edit profile - photo source:', photoSource);
        
        setProfile({
          fullName: userData.fullName || '',
          branch: userData.branch || '',
          year: userData.year || '',
          skills: userData.skills || [],
          interests: userData.interests || [],
          bio: userData.bio || '',
          photoURL: photoSource,
          github: userData.github || '',
          linkedin: userData.linkedin || '',
        });
      } else {
        console.log('No user data found in Firestore');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      const user = auth().currentUser;
      if (!user) {
        Alert.alert('Error', 'User not found. Please sign in again.');
        return;
      }
      
      // Prepare data for saving
      const profileData = {
        ...profile,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };
      
      // Remove local image object and replace with URL string if needed
      if (profileData.photoURL && profileData.photoURL.uri) {
        profileData.photoURL = profileData.photoURL.uri;
      }
      
      // Save to Firestore
      await firestore().collection('users').doc(user.uid).update(profileData);
      
      Alert.alert(
        'Success', 
        'Profile updated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (currentSkill.trim() !== '' && !profile.skills.includes(currentSkill.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, currentSkill.trim()],
      });
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter(s => s !== skill),
    });
  };

  const handleAddInterest = () => {
    if (currentInterest.trim() !== '' && !profile.interests.includes(currentInterest.trim())) {
      setProfile({
        ...profile,
        interests: [...profile.interests, currentInterest.trim()],
      });
      setCurrentInterest('');
    }
  };

  const handleRemoveInterest = (interest) => {
    setProfile({
      ...profile,
      interests: profile.interests.filter(i => i !== interest),
    });
  };

  const handleChoosePhoto = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const source = { uri: response.assets[0].uri };
        setProfile({
          ...profile,
          photoURL: source,
        });
      }
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Edit Profile</Text>
        
        <TouchableOpacity style={styles.photoContainer} onPress={handleChoosePhoto}>
          {profile.photoURL ? (
            <Image source={profile.photoURL} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <FormIcons.Camera size={40} color="#0d6efd" />
              <Text style={styles.photoText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={profile.fullName}
            onChangeText={(text) => setProfile({ ...profile, fullName: text })}
            placeholder="Enter your full name"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Branch</Text>
          <TextInput
            style={styles.input}
            value={profile.branch}
            onChangeText={(text) => setProfile({ ...profile, branch: text })}
            placeholder="e.g., Computer Science, Mechanical"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Year</Text>
          <TextInput
            style={styles.input}
            value={profile.year}
            onChangeText={(text) => setProfile({ ...profile, year: text })}
            placeholder="e.g., 1st, 2nd, 3rd, 4th"
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={profile.bio}
            onChangeText={(text) => setProfile({ ...profile, bio: text })}
            placeholder="Tell others about yourself..."
            multiline
            numberOfLines={4}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Skills</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={currentSkill}
              onChangeText={setCurrentSkill}
              placeholder="e.g., Python, Data Analysis"
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddSkill}>
              <NavigationIcons.Plus size={20} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.tagsContainer}>
            {profile.skills.map((skill, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{skill}</Text>
                <TouchableOpacity onPress={() => handleRemoveSkill(skill)}>
                  <NavigationIcons.Close size={16} color="#0d6efd" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Interests</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={currentInterest}
              onChangeText={setCurrentInterest}
              placeholder="e.g., Hackathons, Research"
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddInterest}>
              <NavigationIcons.Plus size={20} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.tagsContainer}>
            {profile.interests.map((interest, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{interest}</Text>
                <TouchableOpacity onPress={() => handleRemoveInterest(interest)}>
                  <NavigationIcons.Close size={16} color="#0d6efd" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>GitHub (optional)</Text>
          <TextInput
            style={styles.input}
            value={profile.github}
            onChangeText={(text) => setProfile({ ...profile, github: text })}
            placeholder="Your GitHub username"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>LinkedIn (optional)</Text>
          <TextInput
            style={styles.input}
            value={profile.linkedin}
            onChangeText={(text) => setProfile({ ...profile, linkedin: text })}
            placeholder="Your LinkedIn username"
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSaveProfile}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 20,
    textAlign: 'center',
  },
  photoContainer: {
    alignSelf: 'center',
    marginBottom: 30,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderStyle: 'dashed',
  },
  photoText: {
    fontSize: 14,
    color: '#0d6efd',
    marginTop: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#0d6efd',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7f1ff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#0d6efd',
    marginRight: 5,
  },
  saveButton: {
    backgroundColor: '#0d6efd',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  saveButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;
