import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';

/**
 * Utility functions for handling image uploads to Firebase Storage
 */

/**
 * Upload an image to Firebase Storage and return the download URL
 * @param {string} imageUri - Local file URI of the image
 * @param {string} folder - Storage folder (e.g., 'profile-photos', 'event-images')
 * @param {string} filename - Optional custom filename
 * @returns {Promise<string>} - Download URL of the uploaded image
 */
export const uploadImage = async (imageUri, folder = 'images', filename = null) => {
  try {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Generate filename if not provided
    if (!filename) {
      const timestamp = Date.now();
      const extension = imageUri.split('.').pop() || 'jpg';
      filename = `${currentUser.uid}_${timestamp}.${extension}`;
    }

    // Create storage reference
    const storageRef = storage().ref(`${folder}/${filename}`);
    
    // Upload the image
    console.log('Uploading image to Firebase Storage...');
    const uploadTask = storageRef.putFile(imageUri);
    
    // Wait for upload to complete
    await uploadTask;
    
    // Get download URL
    const downloadURL = await storageRef.getDownloadURL();
    console.log('Image uploaded successfully:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Upload profile photo and return download URL
 * @param {string} imageUri - Local file URI of the profile photo
 * @returns {Promise<string>} - Download URL of the uploaded profile photo
 */
export const uploadProfilePhoto = async (imageUri) => {
  try {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Use user ID in filename for easy identification
    const filename = `profile_${currentUser.uid}.jpg`;
    
    return await uploadImage(imageUri, 'profile-photos', filename);
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    throw error;
  }
};

/**
 * Delete an image from Firebase Storage using its download URL
 * @param {string} downloadURL - Firebase Storage download URL
 * @returns {Promise<void>}
 */
export const deleteImage = async (downloadURL) => {
  try {
    // Extract the file path from the download URL
    const storageRef = storage().refFromURL(downloadURL);
    await storageRef.delete();
    console.log('Image deleted successfully');
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

/**
 * Check if a URI is a local file URI that needs to be uploaded
 * @param {string} uri - Image URI to check
 * @returns {boolean} - True if it's a local file URI
 */
export const isLocalFileUri = (uri) => {
  if (!uri || typeof uri !== 'string') return false;
  
  return uri.startsWith('file://') || 
         uri.startsWith('content://') || 
         uri.startsWith('ph://') ||
         uri.includes('/cache/') ||
         uri.includes('/temp/');
};

/**
 * Get proper image source for React Native Image component
 * @param {string|object} photoURL - Photo URL or source object
 * @param {object} defaultImage - Default image require() object
 * @returns {object} - Proper source object for Image component
 */
export const getImageSource = (photoURL, defaultImage) => {
  // If it's already a require() object, use it
  if (photoURL && typeof photoURL === 'object' && !photoURL.uri) {
    return photoURL;
  }
  
  // If it's a string URI
  if (typeof photoURL === 'string' && photoURL.trim() !== '') {
    // Check if it's a local file URI (should be uploaded first)
    if (isLocalFileUri(photoURL)) {
      console.warn('Local file URI detected, should be uploaded to Firebase Storage:', photoURL);
      return defaultImage;
    }
    
    // Use as remote URI
    return { uri: photoURL };
  }
  
  // If it's already a source object with URI
  if (photoURL && photoURL.uri && typeof photoURL.uri === 'string') {
    if (isLocalFileUri(photoURL.uri)) {
      console.warn('Local file URI detected in source object:', photoURL.uri);
      return defaultImage;
    }
    return photoURL;
  }
  
  // Fallback to default
  return defaultImage;
};

/**
 * Upload image if it's a local file URI, otherwise return the URL as-is
 * @param {string} imageUri - Image URI to process
 * @param {string} folder - Storage folder for upload
 * @returns {Promise<string>} - Firebase Storage URL or original URL
 */
export const processImageUri = async (imageUri, folder = 'images') => {
  if (!imageUri || typeof imageUri !== 'string') {
    return null;
  }
  
  // If it's a local file URI, upload it
  if (isLocalFileUri(imageUri)) {
    try {
      return await uploadImage(imageUri, folder);
    } catch (error) {
      console.error('Failed to upload image, using original URI:', error);
      return imageUri;
    }
  }
  
  // If it's already a remote URL, return as-is
  return imageUri;
};

export default {
  uploadImage,
  uploadProfilePhoto,
  deleteImage,
  isLocalFileUri,
  getImageSource,
  processImageUri
};
