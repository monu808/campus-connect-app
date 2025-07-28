import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export const ChatIcons = {
  ChatBubble: (props) => <FontAwesome name="commenting-o" {...props} />,
  Group: (props) => <FontAwesome name="users" {...props} />,
  SentTick: (props) => <FontAwesome name="check" {...props} />,
};

export const NavigationIcons = {
  Back: (props) => <MaterialIcons name="arrow-back" {...props} />,
  Add: (props) => <MaterialIcons name="add" {...props} />,
  Calendar: (props) => <MaterialIcons name="calendar-today" {...props} />,
  Search: (props) => <MaterialIcons name="search" {...props} />,
};

export const MatchingIcons = {
  Profile: (props) => <Ionicons name="person-circle-outline" {...props} />,
  Like: (props) => <Ionicons name="heart-outline" {...props} />,
  Reject: (props) => <Ionicons name="close-circle-outline" {...props} />,
  SuperMatch: (props) => <Ionicons name="star" {...props} />,
};

export const GamificationIcons = {
  Trophy: (props) => <Ionicons name="trophy-outline" {...props} />,
  Medal: (props) => <Ionicons name="medal-outline" {...props} />,
  Badge: (props) => <Ionicons name="ribbon-outline" {...props} />,
  XP: (props) => <Ionicons name="barbell-outline" {...props} />,
};

export const NotificationIcons = {
  Notification: (props) => <Ionicons name="notifications-outline" {...props} />,
  Message: (props) => <Ionicons name="chatbubble-ellipses-outline" {...props} />,
  GroupInvite: (props) => <Ionicons name="people-outline" {...props} />,
  Event: (props) => <Ionicons name="calendar-outline" {...props} />,
  Achievement: (props) => <Ionicons name="ribbon-outline" {...props} />,
};

export const FormIcons = {
  Name: (props) => <Ionicons name="person-outline" {...props} />,
  Branch: (props) => <Ionicons name="business-outline" {...props} />,
  Year: (props) => <Ionicons name="school-outline" {...props} />,
  Skills: (props) => <Ionicons name="construct-outline" {...props} />,
};
