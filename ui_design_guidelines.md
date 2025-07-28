# Campus Connect UI Design Guidelines

## Brand Identity

### Color Palette
- **Primary Color**: #0d6efd (Blue)
- **Secondary Color**: #ffffff (White)
- **Accent Colors**:
  - #6c757d (Gray - for secondary text)
  - #28a745 (Green - for success states)
  - #dc3545 (Red - for error states)
  - #ffc107 (Yellow - for warning/badges)

### Typography
- **Primary Font**: Roboto
- **Headings**: Roboto Bold
- **Body Text**: Roboto Regular
- **Font Sizes**:
  - Heading 1: 24sp
  - Heading 2: 20sp
  - Heading 3: 18sp
  - Body: 16sp
  - Caption: 14sp
  - Small: 12sp

### Iconography
- **Style**: Outlined with rounded corners
- **Primary Icons**: Material Design icon set
- **Custom Icons**: For badges and gamification elements

### Spacing and Layout
- **Base Unit**: 8dp
- **Margins**: 16dp (standard), 24dp (large)
- **Padding**: 16dp (standard), 8dp (compact)
- **Card Elevation**: 2dp (standard), 4dp (raised)
- **Border Radius**: 8dp (standard), 16dp (large), 24dp (extra large)

## UI Components

### Buttons
- **Primary Button**: #0d6efd background, white text, 8dp radius
- **Secondary Button**: White background, #0d6efd border and text, 8dp radius
- **Tertiary Button**: Transparent background, #0d6efd text, no border
- **Button Height**: 48dp (standard), 40dp (compact)
- **Button Width**: Match content or fill width minus margins

### Cards
- **Standard Card**: White background, 2dp elevation, 8dp radius
- **Profile Card**: White background, 4dp elevation, 16dp radius, with image header
- **Group Card**: White background, 2dp elevation, 8dp radius, with color accent based on group type

### Input Fields
- **Text Input**: White background, light gray border, 8dp radius
- **Focus State**: #0d6efd border
- **Error State**: #dc3545 border with error message
- **Input Height**: 48dp

### Navigation
- **Bottom Navigation**: White background, 5 items maximum, active item in #0d6efd
- **Tab Navigation**: White background, #0d6efd indicator, black text
- **Drawer Navigation**: White background, items with 16dp padding

### Lists
- **Standard List**: White background, 1dp divider, 16dp padding
- **Avatar List**: With circular avatar, 56dp height
- **Two-line List**: With primary and secondary text, 72dp height

## Screen Designs

### Onboarding Flow

The onboarding experience is designed to be engaging, informative, and quick to complete. It introduces users to the app's core value proposition and collects essential information to create a meaningful profile.

#### Splash Screen
- VIT Bhopal and Campus Connect logos
- Blue gradient background
- Subtle animation transitioning to welcome screen

#### Welcome Screens (Carousel)
1. **Welcome to Campus Connect**: Introduction to the app's purpose
2. **Find Your Perfect Match**: Showcase the matching system
3. **Join Academic Groups**: Highlight group functionality
4. **Discover Opportunities**: Preview the discovery feed
5. **Level Up Your College Life**: Introduce gamification elements

#### Authentication
- Google Sign-in button prominently displayed
- College email domain verification
- Privacy policy and terms of service links

#### Profile Setup
1. **Basic Information**:
   - Name (pre-filled from Google)
   - Profile photo upload/selection
   - Branch/Department selection
   - Year of study selection

2. **Skills & Interests**:
   - Multi-select skill tags with search functionality
   - Interest categories with expandable options
   - Academic goals selection

3. **Social Connections**:
   - GitHub username (optional)
   - LinkedIn profile (optional)
   - Other social handles (optional)

4. **Bio Creation**:
   - Text input for personal bio
   - Character count and suggestions

5. **Profile Preview**:
   - Complete profile view
   - Edit options for each section
   - Completion percentage indicator

### Core Screens

#### Home/Discovery Feed
- Personalized recommendations at the top
- Trending groups and projects section
- Upcoming events card carousel
- New users to connect with
- Pull-to-refresh functionality
- Floating action button for creating new content

#### Matching System
- Tinder-like card stack interface
- Profile cards with:
  - Profile photo
  - Name and basic info
  - Top skills and interests
  - Brief bio excerpt
- Swipe right (interested) and left (pass) functionality
- "Super Match" button for high-priority connections
- Filters button for refining matches

#### Profile Details View
- Full-width profile header with photo
- Skills and interests visualization
- Academic information section
- Bio and social links
- Recent activity
- Mutual connections
- Contact/Match button

#### Matches & Chats
- Two tabs: Matches and Active Chats
- Matches tab shows new and pending matches
- Chats tab shows conversations ordered by recency
- Unread indicators and last message preview
- Online status indicators
- Quick action buttons for video call or voice call

#### Groups
- Discover and My Groups tabs
- Group cards with:
  - Group name and type
  - Member count and preview
  - Brief description
  - Tags/topics
- Create Group floating action button
- Filter and search functionality

#### Group Details
- Group header with cover image
- Description and purpose
- Member list with roles
- Activity feed
- Events section
- Join/Leave button
- Chat access button

#### Gamification Dashboard
- XP level and progress bar
- Badges collection with unlock criteria
- Leaderboard tabs (Weekly, Monthly, All-time)
- Recent achievements
- Challenges and missions
- Rewards and perks

#### Notifications Center
- All notifications in reverse chronological order
- Categorized tabs (Matches, Groups, Events, System)
- Read/Unread status indicators
- Action buttons where applicable
- Clear all and settings options

#### Settings
- Profile edit access
- Notification preferences
- Privacy controls
- App appearance settings
- Help and support
- About and version info

## Interaction Patterns

### Gestures
- **Swipe Right/Left**: For matching system
- **Swipe Down**: Refresh content
- **Swipe Up**: Load more content
- **Double Tap**: Like/Favorite
- **Long Press**: Show additional options
- **Pinch**: Zoom in/out on images

### Animations
- **Card Transitions**: Smooth animations for swipe actions
- **Screen Transitions**: Slide and fade animations between screens
- **Button Feedback**: Subtle scale and color changes
- **Loading States**: Branded loading animations
- **Success States**: Confetti or celebration animations for achievements

### Feedback
- **Haptic Feedback**: For important actions and confirmations
- **Toast Messages**: For non-critical notifications
- **Alert Dialogs**: For important decisions and confirmations
- **Progress Indicators**: For long-running operations
- **Empty States**: Informative and actionable empty state designs

## Accessibility Considerations
- Minimum touch target size of 48x48dp
- Color contrast ratios meeting WCAG AA standards
- Support for dynamic text sizes
- Alternative text for images
- Screen reader compatibility
- Keyboard navigation support for web components

## Responsive Design
- Support for various screen sizes (from 4" to 6.7")
- Landscape mode support for key screens
- Tablet optimization for larger screens
- Adaptive layouts based on screen dimensions

## Implementation Guidelines
- Use React Native Paper for consistent Material Design components
- Implement custom theme provider for app-wide styling
- Create reusable component library for common UI elements
- Use React Native Reanimated for complex animations
- Implement responsive sizing using percentage-based dimensions
- Create dark mode theme variants for future implementation
