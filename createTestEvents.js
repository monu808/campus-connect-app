import { EventService } from './src/services/EventService';

async function createTestEvents() {
  try {
    // Create first event
    const event1 = await EventService.createEvent({
      title: 'Campus Tech Meetup',
      description: 'Join us for an exciting tech meetup where students can share their projects and network with peers',
      location: 'Engineering Building Room 101',
      startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours duration
      tags: ['Tech', 'Networking'],
      isPublic: true,
      maxParticipants: 50
    });
    console.log('Created first event:', event1);

    // Create second event
    const event2 = await EventService.createEvent({
      title: 'Career Development Workshop',
      description: 'Learn essential skills for your career journey including resume writing and interview preparation',
      location: 'Business School Auditorium',
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours duration
      tags: ['Career', 'Workshop'],
      isPublic: true,
      maxParticipants: 100
    });
    console.log('Created second event:', event2);

  } catch (error) {
    console.error('Error creating test events:', error);
  }
}

createTestEvents();
