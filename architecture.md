# Campus Connect App Architecture

## Overview
Campus Connect is a mobile application designed to connect college students for academic and project collaboration. The app uses a swipe-based matching system similar to Tinder/Bumble but oriented toward skills, projects, and learning. Initially focused on VIT Bhopal, the architecture is designed to be scalable to other campuses.

## Tech Stack

### Frontend
- **Framework**: React Native
- **State Management**: Redux + Redux Toolkit
- **Navigation**: React Navigation
- **UI Components**: React Native Paper (Material Design)
- **Animations**: React Native Reanimated (for swipe animations)
- **Forms**: Formik with Yup validation

### Backend
- **Platform**: Firebase
- **Authentication**: Firebase Authentication (Google Sign-in)
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage (for profile images and media)
- **Cloud Functions**: Firebase Functions (for notifications, matching algorithms)
- **Notifications**: Firebase Cloud Messaging (FCM)

## System Architecture

### 1. Core Modules

#### Authentication Module
- Google Sign-in integration
- User session management
- Profile creation and verification
- College email domain verification

#### User Profile Module
- Profile creation and editing
- Skills and interests tagging system
- Academic information management
- Social media integration

#### Matching System Module
- Swipe-based interface
- Algorithm for matching based on:
  - Skills compatibility
  - Project interests
  - Academic goals
  - Course overlap
- Match notification system

#### Group Module
- Group creation and management
- Group discovery
- Member management
- Group chat integration

#### Discovery Feed Module
- Personalized recommendations
- Trending projects and groups
- Upcoming events
- New user highlights

#### Gamification Module
- XP system and point tracking
- Badge and achievement system
- Leaderboards (weekly, monthly)
- Progress tracking

#### Notification Module
- Push notification system
- In-app notification center
- Notification preferences

### 2. Data Model

#### User Collection
```
users/{userId}
  - uid: string
  - email: string
  - displayName: string
  - photoURL: string
  - college: string
  - branch: string
  - year: number
  - skills: array<string>
  - interests: array<string>
  - bio: string
  - socialLinks: {
      github: string,
      linkedin: string
    }
  - xpPoints: number
  - badges: array<string>
  - createdAt: timestamp
  - lastActive: timestamp
```

#### Matches Collection
```
matches/{matchId}
  - users: array<string> (userIds)
  - status: string (pending, accepted, rejected)
  - initiatedBy: string (userId)
  - createdAt: timestamp
  - lastInteraction: timestamp
```

#### Groups Collection
```
groups/{groupId}
  - name: string
  - description: string
  - type: string (study, project, hackathon)
  - tags: array<string>
  - members: array<{
      userId: string,
      role: string (admin, member)
    }>
  - isPublic: boolean
  - createdAt: timestamp
  - createdBy: string (userId)
```

#### Chats Collection
```
chats/{chatId}
  - participants: array<string> (userIds)
  - lastMessage: {
      text: string,
      sentBy: string (userId),
      sentAt: timestamp
    }
  - isGroupChat: boolean
  - groupId: string (if isGroupChat is true)
```

#### Messages Collection
```
chats/{chatId}/messages/{messageId}
  - text: string
  - sentBy: string (userId)
  - sentAt: timestamp
  - readBy: array<string> (userIds)
  - status: string (sent, delivered, read)
```

#### Events Collection
```
events/{eventId}
  - title: string
  - description: string
  - startTime: timestamp
  - endTime: timestamp
  - location: string
  - organizer: string (userId or groupId)
  - attendees: array<{
      userId: string,
      status: string (yes, maybe, no)
    }>
  - tags: array<string>
  - isPublic: boolean
```

#### Notifications Collection
```
users/{userId}/notifications/{notificationId}
  - type: string (match, message, group, event, achievement)
  - title: string
  - body: string
  - data: object (relevant data based on type)
  - isRead: boolean
  - createdAt: timestamp
```

### 3. API Structure

#### Authentication API
- signInWithGoogle()
- signOut()
- getCurrentUser()
- updateUserProfile()

#### Profile API
- getUserProfile(userId)
- updateUserProfile(userData)
- uploadProfileImage(file)
- updateSkillsAndInterests(skills, interests)

#### Matching API
- getRecommendedUsers(filters)
- swipeRight(userId)
- swipeLeft(userId)
- getMatches()
- respondToMatch(matchId, response)

#### Group API
- createGroup(groupData)
- getGroups(filters)
- joinGroup(groupId)
- leaveGroup(groupId)
- updateGroup(groupId, groupData)
- getGroupMembers(groupId)

#### Chat API
- getChats()
- getChatMessages(chatId)
- sendMessage(chatId, message)
- markMessageAsRead(chatId, messageId)

#### Discovery API
- getDiscoveryFeed()
- getTrendingGroups()
- getUpcomingEvents()
- getRecommendedUsers()

#### Gamification API
- getUserXP(userId)
- awardXP(userId, amount, reason)
- getBadges(userId)
- awardBadge(userId, badgeId)
- getLeaderboard(timeframe, scope)

#### Notification API
- registerDeviceToken(token)
- getNotifications()
- markNotificationAsRead(notificationId)
- updateNotificationPreferences(preferences)

### 4. Security Rules

#### Firestore Security Rules
- Users can only read/write their own profile data
- Group members can read group data
- Group admins can update group data
- Match data is only visible to matched users
- Chat messages are only visible to chat participants

#### Storage Security Rules
- Profile images can only be uploaded by the user
- Group images can only be uploaded by group admins
- Public event images are readable by all users

### 5. Scalability Considerations

#### Multi-Campus Support
- College-specific collections and queries
- Campus-specific discovery feeds
- Cross-campus matching options (configurable)

#### Performance Optimization
- Pagination for feeds and chat history
- Caching strategies for frequently accessed data
- Optimized queries with composite indexes
- Offline support for core functionality

#### Data Partitioning
- User data partitioned by college
- Events and groups partitioned by location/campus
- Shared resources for cross-campus features

## Development Roadmap

### Phase 1: Core Infrastructure
- Set up React Native project with TypeScript
- Configure Firebase services
- Implement authentication flow
- Create basic navigation structure

### Phase 2: Priority Features
- Implement user profiles
- Build matching system
- Develop group functionality
- Create discovery feed
- Implement basic gamification

### Phase 3: Enhancement
- Add real-time chat
- Implement push notifications
- Enhance gamification features
- Add event calendar
- Optimize performance

### Phase 4: Testing & Deployment
- Comprehensive testing
- Beta testing with VIT Bhopal students
- Performance optimization
- App store submission preparation

## Monitoring and Analytics
- Firebase Analytics integration
- User engagement tracking
- Feature usage metrics
- Error reporting and crash analytics
- Performance monitoring

## Future Expansion Possibilities
- Web admin dashboard
- AI-powered matching algorithms
- Integration with academic calendars
- Virtual study rooms
- Project showcase portfolios
- Mentor-mentee matching
