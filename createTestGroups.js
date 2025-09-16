/**
 * Test utility to create sample groups for testing
 * Run this to populate the database with test groups
 */

import { GroupService } from './src/services/GroupService.js';
import { AuthService } from './src/services/AuthService.js';

const createTestGroups = async () => {
  try {
    console.log('Creating test groups...');
    
    // Make sure user is authenticated (this would be the current user)
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      console.error('No authenticated user found. Please login first.');
      return;
    }
    
    console.log('Current user:', currentUser.uid);
    
    const testGroups = [
      {
        name: 'React Native Developers',
        description: 'A group for React Native enthusiasts to share knowledge and collaborate on mobile app projects.',
        type: 'study',
        tags: ['React Native', 'Mobile Development', 'JavaScript'],
        isPrivate: false
      },
      {
        name: 'AI/ML Study Group',
        description: 'Join us to explore artificial intelligence and machine learning concepts together.',
        type: 'study',
        tags: ['AI', 'Machine Learning', 'Python', 'Data Science'],
        isPrivate: false
      },
      {
        name: 'Campus Hackathon Team',
        description: 'Building the next big thing for our upcoming hackathon competition.',
        type: 'project',
        tags: ['Hackathon', 'Innovation', 'Teamwork'],
        isPrivate: false
      },
      {
        name: 'Web Development Bootcamp',
        description: 'Learning full-stack web development together - from frontend to backend.',
        type: 'study',
        tags: ['Web Development', 'JavaScript', 'Node.js', 'React'],
        isPrivate: false
      }
    ];
    
    const createdGroups = [];
    
    for (const groupData of testGroups) {
      try {
        console.log(`Creating group: ${groupData.name}`);
        const result = await GroupService.createGroup(groupData);
        console.log(`✅ Created group: ${groupData.name} with ID: ${result.groupId}`);
        createdGroups.push({ ...groupData, id: result.groupId });
      } catch (error) {
        console.error(`❌ Failed to create group ${groupData.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Successfully created ${createdGroups.length} test groups!`);
    console.log('Groups created:', createdGroups.map(g => g.name));
    
    return createdGroups;
    
  } catch (error) {
    console.error('❌ Error creating test groups:', error);
  }
};

// Export for use in other files
export { createTestGroups };

// If running this file directly
if (typeof window === 'undefined') {
  createTestGroups()
    .then(() => {
      console.log('Test groups creation completed');
    })
    .catch((error) => {
      console.error('Test groups creation failed:', error);
    });
}