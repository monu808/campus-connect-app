import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export const ChatIcons = {
  ChatBubble: (props) => <FontAwesome name="commenting-o" size={props.size || 24} color={props.color} style={props.style} />,
  Group: (props) => <FontAwesome name="users" size={props.size || 24} color={props.color} style={props.style} />,
  SentTick: (props) => <FontAwesome name="check" size={props.size || 24} color={props.color} style={props.style} />,
};

export const NavigationIcons = {
  Back: (props) => <MaterialIcons name="arrow-back" size={props.size || 24} color={props.color} style={props.style} />,
  Add: (props) => <MaterialIcons name="add" size={props.size || 24} color={props.color} style={props.style} />,
  Calendar: (props) => <MaterialIcons name="calendar-today" size={props.size || 24} color={props.color} style={props.style} />,
  Search: (props) => <MaterialIcons name="search" size={props.size || 24} color={props.color} style={props.style} />,
  ArrowLeft: (props) => <Ionicons name="arrow-back" size={props.size || 24} color={props.color} style={props.style} />,
  Plus: (props) => <Ionicons name="add" size={props.size || 24} color={props.color} style={props.style} />,
  Close: (props) => <Ionicons name="close" size={props.size || 24} color={props.color} style={props.style} />,
};

export const MatchingIcons = {
  Profile: (props) => <Ionicons name="person-circle-outline" size={props.size || 24} color={props.color} style={props.style} />,
  Like: (props) => <Ionicons name="heart-outline" size={props.size || 24} color={props.color} style={props.style} />,
  Reject: (props) => <Ionicons name="close-circle-outline" size={props.size || 24} color={props.color} style={props.style} />,
  SuperMatch: (props) => <Ionicons name="star" size={props.size || 24} color={props.color} style={props.style} />,
};

export const GamificationIcons = {
  Trophy: (props) => <Ionicons name="trophy-outline" size={props.size || 24} color={props.color} style={props.style} />,
  Medal: (props) => <Ionicons name="medal-outline" size={props.size || 24} color={props.color} style={props.style} />,
  Badge: (props) => <Ionicons name="ribbon-outline" size={props.size || 24} color={props.color} style={props.style} />,
  XP: (props) => <Ionicons name="barbell-outline" size={props.size || 24} color={props.color} style={props.style} />,
  AccountMultiple: (props) => <Ionicons name="people-outline" size={props.size || 24} color={props.color} style={props.style} />,
  AccountGroup: (props) => <Ionicons name="people-circle-outline" size={props.size || 24} color={props.color} style={props.style} />,
  TrophyAward: (props) => <Ionicons name="trophy" size={props.size || 24} color={props.color} style={props.style} />,
};

export const NotificationIcons = {
  Notification: (props) => <Ionicons name="notifications-outline" size={props.size || 24} color={props.color} style={props.style} />,
  Message: (props) => <Ionicons name="chatbubble-ellipses-outline" size={props.size || 24} color={props.color} style={props.style} />,
  GroupInvite: (props) => <Ionicons name="people-outline" size={props.size || 24} color={props.color} style={props.style} />,
  Event: (props) => <Ionicons name="calendar-outline" size={props.size || 24} color={props.color} style={props.style} />,
  Achievement: (props) => <Ionicons name="ribbon-outline" size={props.size || 24} color={props.color} style={props.style} />,
};

export const FormIcons = {
  Name: (props) => <Ionicons name="person-outline" size={props.size || 24} color={props.color} style={props.style} />,
  Branch: (props) => <Ionicons name="business-outline" size={props.size || 24} color={props.color} style={props.style} />,
  Year: (props) => <Ionicons name="school-outline" size={props.size || 24} color={props.color} style={props.style} />,
  Skills: (props) => <Ionicons name="construct-outline" size={props.size || 24} color={props.color} style={props.style} />,
  Camera: (props) => <Ionicons name="camera-outline" size={props.size || 24} color={props.color} style={props.style} />,
};

// Social Icons
export const SocialIcons = {
  Github: (props) => <Ionicons name="logo-github" size={props.size || 24} color={props.color} style={props.style} />,
  LinkedIn: (props) => <Ionicons name="logo-linkedin" size={props.size || 24} color={props.color} style={props.style} />,
  Twitter: (props) => <Ionicons name="logo-twitter" size={props.size || 24} color={props.color} style={props.style} />,
};

// Profile Icons
export const ProfileIcons = {
  Edit: (props) => <Ionicons name="create-outline" size={props.size || 24} color={props.color} style={props.style} />,
  Logout: (props) => <Ionicons name="log-out-outline" size={props.size || 24} color={props.color} style={props.style} />,
  CheckCircle: (props) => <Ionicons name="checkmark-circle-outline" size={props.size || 24} color={props.color} style={props.style} />,
};
