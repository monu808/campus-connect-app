# Onboarding Flow Wireframe Description

The onboarding flow for Campus Connect is designed to be engaging, informative, and efficient, guiding new users through the process of creating their academic profile while introducing the app's core features.

## Splash Screen

The splash screen features a gradient background transitioning from dark blue (#0d6efd) at the top to a lighter blue at the bottom. The Campus Connect logo appears centered on the screen with a subtle pulsing animation. Below the logo, a tagline reads "Connect. Collaborate. Succeed." The VIT Bhopal logo appears at the bottom of the screen, establishing the app's initial campus focus.

## Welcome Carousel

### Screen 1: Welcome
A full-screen image shows diverse students collaborating in a modern campus setting. The heading "Welcome to Campus Connect" appears in bold Roboto font, with a subheading "Find your perfect academic match at VIT Bhopal." A progress indicator at the bottom shows 1/5, and a "Next" button appears in the primary blue color.

### Screen 2: Matching
This screen showcases the Tinder-like card interface with a student profile card being swiped right. The heading reads "Find Your Perfect Match" with subtext "Swipe right on students with complementary skills and interests for your next project or study group." Progress indicator shows 2/5.

### Screen 3: Groups
A visual representation of academic groups with students collaborating. The heading states "Join Academic Groups" with subtext "Create or join study groups, project teams, and hackathon squads based on your interests." Progress indicator shows 3/5.

### Screen 4: Discovery
This screen displays a feed-like interface with recommended connections, events, and groups. The heading reads "Discover Opportunities" with subtext "Stay updated with trending projects, upcoming events, and potential collaborators." Progress indicator shows 4/5.

### Screen 5: Gamification
The final welcome screen shows leaderboards, badges, and XP progress bars. The heading states "Level Up Your College Life" with subtext "Earn XP, unlock badges, and climb leaderboards as you build your academic network." Progress indicator shows 5/5, and a "Get Started" button appears prominently.

## Authentication

The authentication screen features a clean white background with the Campus Connect logo at the top. A prominent "Continue with Google" button appears in the center, styled with the Google logo and colors. Below this, text explains "We'll verify your college email domain" with a small info icon that, when tapped, explains the verification process. At the bottom, links to "Privacy Policy" and "Terms of Service" appear in smaller text.

## Profile Setup Flow

### Basic Information
This screen has a header "Tell us about yourself" with a circular profile photo placeholder with an upload icon. Below are form fields for:
- Name (pre-filled from Google account)
- Department/Branch (dropdown)
- Year of Study (segmented control)
A progress bar at the top shows "Step 1 of 5" and a "Continue" button appears at the bottom.

### Skills & Interests
The screen header reads "What are you good at?" with subtext "Select skills and interests to help us find your perfect matches." Below are two sections:
1. Skills: Multi-select chips with popular options like "Python," "UI Design," "Public Speaking," etc., with a search field at the top
2. Interests: Categorized sections (Academic, Technical, Creative) with expandable options
A "Continue" button appears at the bottom, and progress shows "Step 2 of 5."

### Social Connections
This screen has the header "Connect your profiles" with subtext "Optional: Link your professional and coding profiles to showcase your work." Form fields include:
- GitHub username (with GitHub icon)
- LinkedIn profile (with LinkedIn icon)
- Other social handles (expandable section)
Progress shows "Step 3 of 5" with "Skip" and "Continue" buttons.

### Bio Creation
The screen header reads "Write your bio" with subtext "Tell potential collaborators about yourself, your projects, and what you're looking for." A multi-line text input appears with placeholder text "I'm a second-year Computer Science student passionate about AI and mobile development..." A character counter shows "0/150 characters" and suggests topics to mention. Progress shows "Step 4 of 5."

### Profile Preview
The final setup screen shows a complete profile preview with all entered information organized in a card layout similar to how others will see it. A header reads "Your Profile" with subtext "This is how others will see you." Edit buttons appear next to each section. At the bottom, a completion indicator shows "Profile Strength: 85%" with suggestions for improvement. A prominent "Finish Setup" button appears at the bottom, and progress shows "Step 5 of 5."

## Home Screen / Discovery Feed

The home screen features a clean white background with the Campus Connect logo in the navigation bar. Below is a search bar with the placeholder "Search for students, groups, or skills." The main content is divided into sections:

### Recommended For You
A horizontal scrollable card carousel showing 3-4 student profiles that match the user's interests and skills. Each card displays a profile photo, name, top skills, and a "Connect" button.

### Trending Groups
Cards showing popular academic groups with group name, member count, brief description, and tags. Each card has a "Join" or "View" button.

### Upcoming Events
A timeline-style list of academic events, hackathons, and workshops with date, title, organizer, and an RSVP button.

### New on Campus
Profiles of recently joined students with matching interests, displayed in a horizontal scrollable format.

A floating action button (FAB) in the primary blue color appears in the bottom right, which expands to show options for "Create Group," "Add Event," or "Start Project."

## Matching System

The matching screen resembles dating apps with a card stack interface. Each profile card contains:

### Profile Card
- Large profile photo at the top (approximately 60% of card height)
- Name and academic year/branch below the photo
- Skills displayed as colored chips
- Brief bio excerpt (2-3 lines)
- Compatibility percentage based on shared interests and complementary skills
- Mutual connections or groups (if any)

### Interaction Elements
- Swipe right gesture area (green indicator appears when dragging right)
- Swipe left gesture area (red indicator appears when dragging left)
- Button bar at the bottom with:
  - "Pass" button (X icon)
  - "Super Match" button (star icon) - limited usage
  - "Connect" button (checkmark icon)
- Filter button in the top right that opens a modal with options for:
  - Year of study
  - Department/Branch
  - Skills needed
  - Project types
  - Activity level

## Groups Interface

The groups screen is divided into two tabs: "Discover" and "My Groups."

### Discover Tab
- Search bar at the top with filters for group type, size, and activity level
- Group cards arranged in a grid or list view (toggleable)
- Each group card shows:
  - Group name and type icon (study, project, hackathon)
  - Member count with small profile pictures
  - Brief description (2 lines)
  - Tags/topics as chips
  - Join button

### My Groups Tab
- Active groups the user has joined
- Groups organized by type or recency
- Each group entry shows:
  - Group name and photo
  - Last activity timestamp
  - Unread message count (if any)
  - Next meeting or deadline (if applicable)
- Create Group FAB in primary blue

### Group Detail View
- Cover image at the top with group name overlay
- Description and purpose section
- Member list with roles (admin, member)
- Activity feed showing recent posts and updates
- Events section with upcoming meetings
- Resources section with shared files
- Join/Leave button
- Chat access button

## Gamification Dashboard

The gamification screen has a playful design with the user's current level prominently displayed at the top.

### XP Progress
- Current level with user avatar
- XP progress bar showing progress to next level
- Recent XP earned with source activities

### Badges Collection
- Grid of badges, both earned (colored) and locked (grayscale)
- Each badge shows name, icon, and unlock criteria
- "New" indicator on recently earned badges
- Tapping a badge shows achievement details and date earned

### Leaderboards
- Tabs for different timeframes (Weekly, Monthly, All-time)
- Tabs for different scopes (College-wide, Groups, Friends)
- Top 10 users with rank, profile picture, name, and XP
- User's current position highlighted
- Share button to post achievements

### Challenges
- Current active challenges with progress indicators
- Reward information for each challenge
- Time remaining for time-limited challenges

The entire gamification interface uses the primary blue color scheme with accent colors for different achievement categories and celebratory animations when viewing newly earned rewards.
