# Implementing Vector Icons Throughout Campus Connect App

This guide shows how to properly implement vector icons across the entire application using `react-native-vector-icons`.

## Key Components

1. **Icons.js** - This file defines custom icon components using various icon families
2. **IconsUsageExample.js** - Demonstrates how to use the icons in different contexts
3. **App.js** - Imports and registers the icon fonts

## Usage Patterns

### Correct usage in components:

```javascript
import { ChatIcons } from '../Icons';

function MyComponent() {
  return (
    <View>
      <ChatIcons.ChatBubble size={24} color="#0d6efd" />
    </View>
  );
}
```

### Direct usage from react-native-vector-icons:

```javascript
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

function MyIconComponent() {
  return (
    <View>
      <MaterialCommunityIcons name="account" size={24} color="#000" />
      <Ionicons name="heart-outline" size={24} color="#f00" />
      <FontAwesome name="user" size={24} color="#00f" />
    </View>
  );
}
```

### Common Icon Mapping

| Feature | Icon Component | Examples |
|---------|---------------|----------|
| Navigation | `NavigationIcons` | Back, Add, Calendar, Search |
| Chat | `ChatIcons` | ChatBubble, Group, SentTick |
| Matching | `MatchingIcons` | Profile, Like, Reject, SuperMatch |
| Gamification | `GamificationIcons` | Trophy, Medal, Badge, XP |
| Notifications | `NotificationIcons` | Notification, Message, GroupInvite, Event |
| Forms | `FormIcons` | Name, Branch, Year, Skills |

## Troubleshooting

If icons don't appear:
1. Make sure icon fonts are loaded at app startup
2. Check the icon name is correct for the icon family
3. Ensure the font files are in `android/app/src/main/assets/fonts/` and `src/assets/fonts/`

## Resources

- [react-native-vector-icons documentation](https://github.com/oblador/react-native-vector-icons)
- [Icon search tool](https://oblador.github.io/react-native-vector-icons/)
