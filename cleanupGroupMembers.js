/**
 * Cleanup script for duplicate group members
 * Run this script to fix duplicate membership issues in groups
 */

import { GroupService } from './src/services/GroupService.js';

const cleanupSpecificGroup = async () => {
  try {
    // Clean up the specific group mentioned in the logs
    const groupId = 'BC8NPq1wgk1zOdtYREf4';
    
    console.log(`Starting cleanup for group: ${groupId}`);
    const result = await GroupService.cleanupDuplicateMembers(groupId);
    
    if (result.cleaned) {
      console.log(`✅ Successfully cleaned up group ${groupId}`);
      console.log(`   Members reduced from ${result.oldCount} to ${result.newCount}`);
    } else {
      console.log(`✅ Group ${groupId} already clean - no duplicates found`);
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
  }
};

// Run cleanup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupSpecificGroup()
    .then(() => {
      console.log('Cleanup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Cleanup failed:', error);
      process.exit(1);
    });
}

export { cleanupSpecificGroup };