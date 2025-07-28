# Campus Connect App

Campus Connect App is a cross-platform mobile application designed to foster academic collaboration, group activities, and gamification among students. Built with React Native and Firebase, it provides a seamless experience for discovering peers, forming groups, and engaging in campus-wide activities.

## Features

- **Matching System:** Tinder-like interface for academic collaboration and networking.
- **Group Functionality:** Create, join, and manage student groups for projects and activities.
- **Discovery Feed:** Explore events, groups, and opportunities on campus.
- **Gamification:** Leaderboards, achievements, and rewards to boost engagement.
- **Push Notifications:** Real-time updates using Firebase Cloud Messaging (FCM).
- **Authentication:** Secure login and registration via Firebase Auth.

## Technology Stack

- **Frontend:** React Native (Android & iOS)
- **Backend:** Firebase (Firestore, Auth, Functions, Storage)
- **Notifications:** Firebase Cloud Messaging (FCM)

## UI/UX

- Modern, clean design with a blue (#0d6efd) and white color scheme.
- Wireframes and onboarding flow included in the `wireframes/` and `src/docs/` directories.

## Setup & Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/monu808/campus-connect-app.git
   cd campus-connect-app
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Configure Firebase:**
   - Add your Firebase project credentials to `android/app/google-services.json` and update `firebase.json` as needed.
4. **Run the app:**
   ```sh
   npx react-native run-android
   # or
   npx react-native run-ios
   ```

## Project Structure

- `src/` - Main source code (components, screens, services, utils)
- `android/` - Android-specific files
- `firebase/` - Firebase setup and documentation
- `wireframes/` - UI/UX wireframes and mockups
- `docs/` - Technical and design documentation

## Development Timeline

- Target deployment: **Before May 30th, 2025**
- Includes beta testing plan and full deployment

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and new features.

## License

This project is licensed under the MIT License.
