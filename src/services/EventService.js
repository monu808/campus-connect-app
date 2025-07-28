import { firestore, getFirestoreService, forceEnableNetwork } from '../firebase';
import { AuthService } from './AuthService';
import { withFirestoreRetry } from '../utils/firestoreRetry';

// Helper function for handling network errors
const handleNetworkError = async (error) => {
  if (error.code === 'firestore/unavailable') {
    console.log('Network appears unavailable, attempting to re-enable...');
    try {
      await forceEnableNetwork();
      return true; // Signal retry
    } catch (retryError) {
      console.error('Failed to re-enable network:', retryError);
      throw error; // Re-throw original error if network enable fails
    }
  }
  return false; // Don't retry for other errors
};

// Helper function to handle Firestore errors
const handleFirestoreError = (error) => {
  console.error('Firestore error:', error);
  
  if (error.code === 'firestore/unavailable') {
    return { type: 'network', retryable: true };
  }
  if (error.code === 'firestore/permission-denied') {
    return { type: 'permission', retryable: false };
  }
  if (error.code === 'firestore/not-found') {
    return { type: 'not-found', retryable: false };
  }
  return { type: 'unknown', retryable: true };
};

export const EventService = {
  // Create test events (temporary function for development)
  createTestEvents: async () => {
    try {
      console.log('Starting createTestEvents...');
      
      // Check if user is authenticated
      const currentUser = AuthService.getCurrentUser();
      console.log('Current user:', currentUser ? { uid: currentUser.uid } : 'No user');
      
      if (!currentUser) {
        throw new Error('User must be authenticated to create test events');
      }
      
      // Try to ensure network is available
      try {
        const firestoreService = await getFirestoreService();
        await firestoreService.collection('events').limit(1).get();
      } catch (error) {
        if (await handleNetworkError(error)) {
          // If network was re-enabled, try getting Firestore service again
          await getFirestoreService();
        } else {
          throw error;
        }
      }

      // Check Firestore connection
      console.log('Getting Firestore service...');
      const firestoreService = await getFirestoreService();
      if (!firestoreService) {
        throw new Error('Failed to get Firestore service');
      }
      console.log('Firestore service obtained successfully');

      const events = [];
      const baseDate = new Date(2025, 5, 2);
      
      // Log test event creation
      console.log('Creating test events with base date:', baseDate);
      
      const testEvents = [
        {
          title: 'Campus Tech Meetup',
          description: 'Join us for an exciting tech meetup where students can share their projects and network with peers',
          location: 'Engineering Building Room 101',
          startTime: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000), // June 5
          endTime: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
          tags: ['Tech', 'Networking'],
          isPublic: true,
          maxParticipants: 50
        },
        {
          title: 'Career Development Workshop',
          description: 'Learn essential skills for your career journey including resume writing and interview preparation',
          location: 'Business School Auditorium',
          startTime: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000), // June 9
          endTime: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
          tags: ['Career', 'Workshop'],
          isPublic: true,
          maxParticipants: 100
        },
        {
          title: 'AI Research Symposium',
          description: 'Research presentations and discussions on the latest developments in Artificial Intelligence',
          location: 'Virtual Event',
          startTime: new Date(baseDate.getTime() + 10 * 24 * 60 * 60 * 1000), // June 12
          endTime: new Date(baseDate.getTime() + 10 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
          tags: ['AI', 'Research', 'Academic'],
          isPublic: true,
          maxParticipants: 200
        },
        {
          title: 'Sports Tournament',
          description: 'Inter-department sports tournament featuring basketball, volleyball, and badminton',
          location: 'University Sports Complex',
          startTime: new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000), // June 16
          endTime: new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
          tags: ['Sports', 'Competition'],
          isPublic: true,
          maxParticipants: 150
        },
        {
          title: 'Cultural Night 2025',
          description: 'Annual cultural celebration featuring performances, food, and cultural exhibitions',
          location: 'Main Campus Amphitheater',
          startTime: new Date(baseDate.getTime() + 21 * 24 * 60 * 60 * 1000), // June 23
          endTime: new Date(baseDate.getTime() + 21 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
          tags: ['Cultural', 'Entertainment'],
          isPublic: true,
          maxParticipants: 500
        },
        {
          title: 'Hackathon 2025',
          description: '24-hour coding challenge to build innovative solutions for campus problems',
          location: 'Computer Science Building',
          startTime: new Date(baseDate.getTime() + 25 * 24 * 60 * 60 * 1000), // June 27
          endTime: new Date(baseDate.getTime() + 26 * 24 * 60 * 60 * 1000),
          tags: ['Tech', 'Hackathon', 'Competition'],
          isPublic: true,
          maxParticipants: 100
        },
        {
          title: 'Study Group - Machine Learning',
          description: 'Weekly study group for machine learning concepts and practice',
          location: 'Library Study Room 3',
          startTime: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000), // June 7
          endTime: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
          tags: ['Academic', 'Study Group', 'AI'],
          isPublic: false,
          maxParticipants: 10
        },
        {
          title: 'Photography Workshop',
          description: 'Learn photography basics and techniques with professional equipment',
          location: 'Arts Center Studio',
          startTime: new Date(baseDate.getTime() + 18 * 24 * 60 * 60 * 1000), // June 20
          endTime: new Date(baseDate.getTime() + 18 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
          tags: ['Arts', 'Workshop', 'Photography'],
          isPublic: true,
          maxParticipants: 20
        }
      ];

      // Create all events
      for (const eventData of testEvents) {
        try {
          const result = await EventService.createEvent(eventData);
          events.push(result);
          console.log('Created event:', { title: eventData.title, id: result.eventId });
        } catch (error) {
          console.error('Error creating event:', eventData.title, error);
        }
      }

      return events;
    } catch (error) {
      console.error('Error in createTestEvents:', error);
      throw error;
    }
  },

  // Function to clean up test events
  deleteTestEvents: async () => {
    try {
      console.log('Deleting test events...');
      const testEventTitles = [
        'Campus Tech Meetup',
        'Career Development Workshop',
        'AI Research Symposium',
        'Sports Tournament',
        'Cultural Night 2025',
        'Hackathon 2025',
        'Study Group - Machine Learning',
        'Photography Workshop'
      ];

      const firestoreService = await getFirestoreService();
      const eventsRef = firestoreService.collection('events');
      
      // Get all test events
      const snapshot = await eventsRef
        .where('title', 'in', testEventTitles)
        .get();

      if (snapshot.empty) {
        console.log('No test events found to delete');
        return { deletedCount: 0 };
      }

      // Delete events in a batch
      const batch = firestoreService.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`Deleted ${snapshot.docs.length} test events`);
      
      return { deletedCount: snapshot.docs.length };
    } catch (error) {
      console.error('Error in deleteTestEvents:', error);
      throw error;
    }
  },

  // Get event by ID
  getEventById: async (eventId, forceServerRefresh = false) => {
    return withFirestoreRetry(async () => {
      console.log('Getting event by ID:', eventId);
      const firestoreService = await getFirestoreService();
      
      try {
        // Handle network issues with retries
        const eventDoc = await firestoreService.collection('events').doc(eventId).get({
          source: forceServerRefresh ? 'server' : 'default'
        });
        
        if (!eventDoc.exists) {
          console.error('Event not found:', eventId);
          throw new Error(`Event with ID ${eventId} not found`);
        }
        
        const eventData = eventDoc.data();
        
        // Convert timestamps to dates
        const event = {
          id: eventDoc.id,
          ...eventData,
          startTime: eventData.startTime?.toDate() || new Date(),
          endTime: eventData.endTime?.toDate() || new Date(),
          createdAt: eventData.createdAt?.toDate() || new Date()
        };
        
        return event;
      } catch (error) {
        console.error('Error getting event by ID:', error);
        throw error;
      }
    }, 3, 'getEventById');
  },
  
  // Create a new event
  createEvent: async (eventData) => {
    const maxRetries = 3;
    let lastError = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`Creating new event (attempt ${attempt + 1}/${maxRetries})...`, { eventTitle: eventData.title });
        
        // Check user authentication
        const userId = AuthService.getCurrentUser()?.uid;
        if (!userId) {
          console.error('Authentication error: No user ID available');
          throw new Error('User not authenticated');
        }
        console.log('User authenticated:', { userId });
        
        // Get Firestore instance with verification
        console.log('Getting Firestore service...');
        const firestoreService = await getFirestoreService();
        if (!firestoreService) {
          throw new Error('Failed to get Firestore service');
        }
        
        // Convert JavaScript Date objects to Firestore Timestamps
        const eventToSave = {
          ...eventData,
          organizer: userId,
          attendees: [{ userId, status: 'yes' }],
          createdAt: firestore.FieldValue.serverTimestamp()
        };
        
        // Log the data we're about to save
        console.log('Saving event data:', { 
          title: eventToSave.title,
          organizer: eventToSave.organizer,
          attendees: eventToSave.attendees
        });
        
        // Create event document with timeout
        const eventRef = firestoreService.collection('events').doc();
        const savePromise = eventRef.set(eventToSave);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Event creation timed out after 30 seconds')), 30000)
        );
        
        await Promise.race([savePromise, timeoutPromise]);
        
        // Verify the save was successful
        const savedDoc = await eventRef.get();
        if (!savedDoc.exists) {
          throw new Error('Event document was not saved properly');
        }
        
        console.log('Event created and verified with ID:', eventRef.id);
        return { eventId: eventRef.id };
        
      } catch (error) {
        lastError = error;
        const { retryable } = handleFirestoreError(error);
        
        if (!retryable || attempt === maxRetries - 1) {
          throw error;
        }
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.log(`Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  },

  // Get all events with optional filters
  getEvents: async (filters = {}) => {
    return withFirestoreRetry(async (forceServerRefresh = false) => {
      console.log('Getting events with filters:', filters);
      const firestoreService = await getFirestoreService();
      
      try {
        // Create query
        let query = firestoreService.collection('events');
        
        // Apply tag filters
        if (filters.tags && filters.tags.length > 0) {
          query = query.where('tags', 'array-contains-any', filters.tags);
        }
        
        // Apply date filters using server timestamp for consistency
        const serverNow = firestore.Timestamp.now();
        
        if (filters.timeframe === 'upcoming') {
          query = query.where('startTime', '>=', serverNow)
            .orderBy('startTime', 'asc');
        } else if (filters.timeframe === 'past') {
          query = query.where('startTime', '<', serverNow)
            .orderBy('startTime', 'desc');
        } else {
          query = query.orderBy('startTime', 'asc');
        }
        
        // Limit results
        query = query.limit(50);
        
        // Execute query with proper options
        const getOptions = (filters.timestamp || forceServerRefresh) 
          ? { source: 'server' } 
          : undefined;
        
        const eventsSnapshot = await query.get(getOptions);
        console.log(`Query returned ${eventsSnapshot.docs.length} events`);

        // Map results
        const events = eventsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            startTime: data.startTime?.toDate() || new Date(),
            endTime: data.endTime?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date()
          };
        });
        
        return events;
        
      } catch (error) {
        console.error('Error in getEvents:', error);
        throw error;
      }
    }, 3, 'getEvents');
  }
};

export default EventService;
