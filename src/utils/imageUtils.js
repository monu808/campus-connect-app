// Utility functions for handling image sources properly

/**
 * Safely process an image source to ensure it's in the correct format for React Native Image components
 * @param {any} source - The image source (string URL, local require, or object with uri)
 * @param {any} defaultSource - Default image to use if source is invalid
 * @returns {object|number} Properly formatted image source
 */
export const getValidImageSource = (source, defaultSource) => {
  try {
    // For debugging
    console.log("Image source type:", typeof source, source && typeof source === 'object' ? JSON.stringify(source) : source);
    
    // If the source is already a number (from require()), it's valid
    if (typeof source === 'number') {
      return source;
    }
    
    // If it's an object with a uri property that is a string, it's valid
    if (source && typeof source === 'object' && source.uri && typeof source.uri === 'string') {
      return { uri: source.uri };
    }
    
    // If it's a string, convert to object with uri property
    if (typeof source === 'string' && source.trim() !== '') {
      return { uri: source };
    }
    
    // Handle case where we have a local resource ID from require()
    if (source && source.toString && !isNaN(Number(source.toString()))) {
      return Number(source.toString());
    }
    
    // If we get here, the source is invalid, use default
    console.log("Using default image source");
    return defaultSource || null;
  } catch (error) {
    console.error("Error in getValidImageSource:", error);
    return defaultSource || null;
  }
};

/**
 * Process a user profile photo to ensure it's in the correct format for storing and displaying
 * @param {any} photoURL - The photo URL from user data
 * @param {any} defaultImage - Default image to use if photoURL is invalid
 * @returns {object} Properly formatted image source
 */
export const processProfilePhoto = (photoURL, defaultImage) => {
  // Simply delegate to the more comprehensive getValidImageSource function
  return getValidImageSource(photoURL, defaultImage);
};

/**
 * Extract a clean URL string from an image source for storing in Firestore
 * @param {any} source - The image source object or string
 * @returns {string|null} A clean URL string or null if invalid
 */
export const getStorableImageUrl = (source) => {
  try {
    if (!source) {
      return null;
    }
    
    // If it's already a string URL, return it
    if (typeof source === 'string') {
      return source;
    }
    
    // If it's an object with a uri property
    if (typeof source === 'object' && source.uri && typeof source.uri === 'string') {
      return source.uri;
    }
    
    // If it's a number (local resource), don't store it
    if (typeof source === 'number' || 
        (source && source.toString && !isNaN(Number(source.toString())))) {
      return null;
    }
    
    console.warn('Unrecognized image source type for storage:', typeof source);
    return null;
  } catch (error) {
    console.error('Error in getStorableImageUrl:', error);
    return null;
  }
};
