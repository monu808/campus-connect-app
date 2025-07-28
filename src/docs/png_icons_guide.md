# PNG Icons Guide

This document explains the new PNG-based icon implementation in the Campus Connect app.

## Overview

After experiencing issues with vector icons not displaying properly (showing blue boxes with an 'X'), we've implemented a PNG-based icon system as an alternative. This approach has several benefits:

- No font loading required
- Consistent rendering across platforms
- No issues with font icon rendering bugs
- Support for complex multi-color icons (if needed in the future)

## Directory Structure

The PNG icons are organized in a directory structure by category:

```text
src/assets/png-icons/
  ├── chat/          - Icons related to chat functionality
  ├── navigation/    - Navigation and common UI icons
  ├── matching/      - Icons for the matching feature
  ├── gamification/  - Icons for badges, achievements, etc.
  ├── notification/  - Notification-related icons
  ├── form/          - Icons used in forms and inputs
  ├── social/        - Social media icons
  └── profile/       - Profile-related icons
```

## Usage

### 1. Import Icons

Import the icon categories you need:

```javascript
import { NavigationIcons, ChatIcons, GamificationIcons } from '../PngIcons';
```

### 2. Use Icons in Components

```javascript
// Basic usage
<ChatIcons.ChatBubble />

// With custom size
<NavigationIcons.Back size={32} />

// PNG icons will display with their original colors
<GamificationIcons.Trophy />

// You can still customize the size
<MatchingIcons.Like size={48} />
```

### 3. Available Icon Categories

- **ChatIcons** - Chat-related icons (chat bubbles, groups, etc.)
- **NavigationIcons** - General navigation icons (back, search, etc.)
- **MatchingIcons** - Matching-related icons (profile, like, reject)
- **GamificationIcons** - Badges, trophies, and other gamification elements
- **NotificationIcons** - Various notification icons
- **FormIcons** - Icons related to form elements and user input
- **SocialIcons** - Social media platform icons
- **ProfileIcons** - User profile related icons

## Implementation Details

Each icon is implemented as a React component that renders an Image with the appropriate source and styling. The implementation allows for customizing the size while preserving the original colors of the PNG images.

Example implementation in `PngIcons.js`:

```javascript
import React from 'react';
import { Image } from 'react-native';

export const NavigationIcons = {
  Back: (props) => <Image 
    source={require('./assets/png-icons/navigation/back.png')} 
    style={{ 
      width: props.size || 24, 
      height: props.size || 24
    }} 
  />,
  // other icons...
};
```

## Adding New Icons

To add a new icon:

1. Add the PNG file to the appropriate category folder
2. Update the corresponding section in `PngIcons.js` with a new component
3. Use the icon in your components

## Testing Icons

Two global methods are available for testing icons:

- `global.showPngIconsDemo()` - Shows a demo of all available PNG icons
- `global.showPngIconsGuide()` - Shows installation and usage instructions

## Migration from Vector Icons

When migrating from vector icons to PNG icons:

1. Replace imports:
   ```javascript
   // Before
   import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
   
   // After
   import { NavigationIcons, ChatIcons } from '../PngIcons';
   ```

2. Replace icon usage:
   ```javascript
   // Before
   <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
   
   // After
   <NavigationIcons.ArrowLeft size={24} color="white" />
   ```

3. Make sure to handle any icon-specific logic (like checking if an icon exists)
