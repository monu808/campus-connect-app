# Vector Icon Implementation Guide for Campus Connect

## Overview

All Campus Connect app features now use vector icons from `react-native-vector-icons` instead of PNG images. This provides:

- Better scaling at all screen sizes
- Smaller app size
- Consistent styling
- Easy color and size changes

## How to Use Icons in Components

### Option 1: Use Custom Icon Components (Recommended)

```jsx
import { ChatIcons, NavigationIcons } from '../Icons';

function MyComponent() {
  return (
    <View>
      <ChatIcons.ChatBubble size={24} color="#0d6efd" />
      <NavigationIcons.Back size={24} color="#0d6efd" />
    </View>
  );
}
```

### Option 2: Direct Vector Icon Import

```jsx
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

function MyComponent() {
  return (
    <View>
      <MaterialCommunityIcons name="account" size={24} color="#0d6efd" />
    </View>
  );
}
```

## Icon Categories

1. **ChatIcons** - For messaging features
2. **NavigationIcons** - For navigation elements
3. **MatchingIcons** - For the matching/connection feature
4. **GamificationIcons** - For achievements, badges, etc.
5. **NotificationIcons** - For alerts and notifications
6. **FormIcons** - For form fields and inputs

## Demo Screens

To see examples:

1. Run the app
2. Open the developer menu
3. Run one of these commands:
   ```js
   global.showVectorIcons(); // To see all MaterialCommunityIcons
   global.showIconsUsage(); // To see Icons.js usage examples
   ```

## Troubleshooting

If icons appear as empty boxes:

1. Ensure font loading is working:
   ```jsx
   // Add this to component that uses icons
   useEffect(() => {
     MaterialCommunityIcons.loadFont();
     Ionicons.loadFont();
     FontAwesome.loadFont();
   }, []);
   ```

2. Verify the icon libraries are linked correctly in Android and iOS

For help with specific icons, reference the [vector icons directory](https://oblador.github.io/react-native-vector-icons/).
