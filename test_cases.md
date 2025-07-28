# Campus Connect App - Test Cases

This document outlines test cases for validating the core matching and gamification features of the Campus Connect app.

## Matching Feature Test Cases

### 1. Profile Recommendation Algorithm

**Test Case ID:** MATCH-001  
**Description:** Verify that the matching algorithm recommends relevant profiles based on skills and interests.  
**Preconditions:** User is logged in with a complete profile.  
**Test Steps:**
1. Navigate to the Matching screen
2. Observe the recommended profiles
3. Check if profiles have complementary skills or shared interests
4. Verify compatibility score calculation

**Expected Results:**
- Recommended profiles should have complementary skills or shared interests
- Compatibility score should be calculated correctly
- Profiles from the same college should be prioritized

### 2. Swipe Functionality

**Test Case ID:** MATCH-002  
**Description:** Verify that the swipe right/left functionality works correctly.  
**Preconditions:** User is logged in and on the Matching screen.  
**Test Steps:**
1. Swipe right on a profile
2. Swipe left on a profile
3. Use the button controls to swipe right/left
4. Use the "Super Match" button

**Expected Results:**
- Swipe right should register interest and potentially create a match
- Swipe left should pass on the profile
- Button controls should perform the same actions as swiping
- "Super Match" should prioritize the match

### 3. Match Creation

**Test Case ID:** MATCH-003  
**Description:** Verify that a match is created when both users swipe right on each other.  
**Preconditions:** Two test users are set up.  
**Test Steps:**
1. As User A, swipe right on User B
2. As User B, swipe right on User A
3. Observe the match notification

**Expected Results:**
- Match should be created in the database
- Match notification should appear for both users
- Chat should be automatically created for the matched users

### 4. Match Modal

**Test Case ID:** MATCH-004  
**Description:** Verify that the match modal displays correctly with appropriate options.  
**Preconditions:** A match has just been created.  
**Test Steps:**
1. Observe the match modal
2. Check user information displayed
3. Test "Message Now" button
4. Test "Continue Swiping" button

**Expected Results:**
- Match modal should display both users' information
- "Message Now" should navigate to the chat screen
- "Continue Swiping" should dismiss the modal and return to matching
- For Super Matches, confetti animation should appear

### 5. XP Award for Matching

**Test Case ID:** MATCH-005  
**Description:** Verify that users receive XP for matching activities.  
**Preconditions:** User is logged in with a profile.  
**Test Steps:**
1. Swipe right on a profile
2. Create a match
3. Check XP before and after

**Expected Results:**
- User should receive 5 XP for swiping right
- User should receive 10 XP for creating a match
- XP should be correctly updated in the database

## Gamification Feature Test Cases

### 1. XP System

**Test Case ID:** GAME-001  
**Description:** Verify that the XP system correctly tracks and displays user progress.  
**Preconditions:** User is logged in.  
**Test Steps:**
1. Perform various actions that award XP
2. Navigate to the Gamification screen
3. Check XP display and level progress

**Expected Results:**
- XP should increase after performing actions
- Level should be calculated correctly (Level = XP/100 + 1)
- Progress bar should show correct percentage to next level

### 2. Badge System

**Test Case ID:** GAME-002  
**Description:** Verify that badges are awarded correctly for achievements.  
**Preconditions:** User is logged in.  
**Test Steps:**
1. Complete actions to earn badges (e.g., first login, first match)
2. Navigate to the Gamification screen
3. Check badges display
4. Tap on a badge to view details

**Expected Results:**
- Badges should be awarded for completed achievements
- Locked badges should appear grayed out
- Badge details screen should show correct information
- Badge notification should appear when earned

### 3. Leaderboard Functionality

**Test Case ID:** GAME-003  
**Description:** Verify that the leaderboard displays correctly with different filters.  
**Preconditions:** Multiple users with varying XP levels.  
**Test Steps:**
1. Navigate to the Leaderboard screen
2. Test different timeframe filters (Weekly, Monthly, All Time)
3. Test different scope filters (College, Friends)
4. Check user's own rank display

**Expected Results:**
- Leaderboard should display users in correct XP order
- Filters should change the displayed rankings
- User's own rank should be highlighted and shown at the top
- Top 3 users should have medal indicators

### 4. Challenges System

**Test Case ID:** GAME-004  
**Description:** Verify that challenges are displayed and tracked correctly.  
**Preconditions:** User is logged in.  
**Test Steps:**
1. Navigate to the Gamification screen
2. View active challenges
3. Complete a challenge
4. Check for reward notification

**Expected Results:**
- Challenges should display with correct progress
- Completing a challenge should award XP and possibly badges
- Progress bars should update correctly
- Reward notification should appear when challenge completed

### 5. Level Up Notification

**Test Case ID:** GAME-005  
**Description:** Verify that level up notifications appear correctly.  
**Preconditions:** User is close to leveling up.  
**Test Steps:**
1. Perform actions to gain enough XP to level up
2. Observe level up notification
3. Check for level badge award

**Expected Results:**
- Level up notification should appear
- User's level should increase
- Level badge should be awarded
- XP progress should reset for the new level

## Integration Test Cases

### 1. Firebase Integration

**Test Case ID:** INT-001  
**Description:** Verify that all Firebase services are correctly integrated.  
**Preconditions:** App is configured with Firebase.  
**Test Steps:**
1. Test Authentication (login/logout)
2. Test Firestore operations (read/write)
3. Test Cloud Functions calls
4. Test real-time updates

**Expected Results:**
- All Firebase operations should complete successfully
- Data should be correctly stored and retrieved
- Cloud Functions should execute as expected
- Real-time updates should propagate to the UI

### 2. Cross-Feature Integration

**Test Case ID:** INT-002  
**Description:** Verify that matching and gamification features work together correctly.  
**Preconditions:** User is logged in.  
**Test Steps:**
1. Create a match
2. Check for XP award
3. Check for badge award (if applicable)
4. Verify leaderboard update

**Expected Results:**
- Match creation should award XP
- First match should award the "First Match" badge
- Leaderboard should update with new XP
- All related notifications should appear

## Performance Test Cases

### 1. Matching Screen Performance

**Test Case ID:** PERF-001  
**Description:** Verify that the matching screen performs well with animations.  
**Preconditions:** User is logged in.  
**Test Steps:**
1. Load the matching screen
2. Perform rapid swipes
3. Test on low-end devices

**Expected Results:**
- Animations should be smooth
- No visible lag during rapid swipes
- Memory usage should remain stable

### 2. Gamification Screen Performance

**Test Case ID:** PERF-002  
**Description:** Verify that the gamification screen loads and performs well.  
**Preconditions:** User is logged in.  
**Test Steps:**
1. Load the gamification screen
2. Navigate between tabs
3. Scroll through leaderboard
4. Test on low-end devices

**Expected Results:**
- Screen should load within 2 seconds
- Tab switching should be instantaneous
- Scrolling should be smooth
- Memory usage should remain stable

## Security Test Cases

### 1. Firebase Security Rules

**Test Case ID:** SEC-001  
**Description:** Verify that Firebase security rules prevent unauthorized access.  
**Preconditions:** Multiple test users are set up.  
**Test Steps:**
1. Attempt to read another user's private data
2. Attempt to modify another user's data
3. Attempt to create matches for other users

**Expected Results:**
- All unauthorized operations should be rejected
- Security rules should enforce proper access control
- Error messages should be logged

### 2. XP and Badge Security

**Test Case ID:** SEC-002  
**Description:** Verify that XP and badges cannot be manipulated by users.  
**Preconditions:** Test user is set up.  
**Test Steps:**
1. Attempt to directly modify XP value in database
2. Attempt to add badges directly to user profile
3. Test for client-side validation bypasses

**Expected Results:**
- Direct modifications should be prevented by security rules
- Only server-side functions should be able to award XP and badges
- Client-side validation should not be the only security measure

## Usability Test Cases

### 1. Matching UI Usability

**Test Case ID:** USA-001  
**Description:** Verify that the matching UI is intuitive and user-friendly.  
**Preconditions:** User is logged in.  
**Test Steps:**
1. Ask test users to navigate to matching screen
2. Observe how they interact with the swipe interface
3. Collect feedback on profile card readability
4. Test accessibility features

**Expected Results:**
- Users should intuitively understand the swipe interface
- Profile cards should be easy to read and understand
- Compatibility information should be clear
- Accessibility features should work correctly

### 2. Gamification UI Usability

**Test Case ID:** USA-002  
**Description:** Verify that the gamification UI is engaging and clear.  
**Preconditions:** User is logged in.  
**Test Steps:**
1. Ask test users to navigate to gamification screen
2. Observe how they interact with badges and leaderboard
3. Collect feedback on challenge clarity
4. Test accessibility features

**Expected Results:**
- Users should understand their progress and level
- Badge system should be engaging and clear
- Challenges should have clear objectives and rewards
- Accessibility features should work correctly

## Beta Testing Plan

### 1. Test Group Selection

- Select 20-30 VIT Bhopal students across different years and departments
- Ensure diversity in technical proficiency
- Include both Android and iOS users

### 2. Test Duration

- 1-week initial beta test
- Focus on core features: matching and gamification
- Collect daily usage metrics

### 3. Feedback Collection

- In-app feedback form
- User interviews with 5-10 selected beta testers
- Bug reporting mechanism
- Feature suggestion collection

### 4. Success Metrics

- Daily active users (target: 70% of beta testers)
- Feature usage (target: 5+ matches per user)
- Crash-free sessions (target: 95%+)
- User satisfaction rating (target: 4/5 or higher)

### 5. Post-Beta Actions

- Prioritize bug fixes based on severity and frequency
- Implement high-impact feature suggestions
- Prepare for wider release to entire campus
