import React from 'react';
import { Image } from 'react-native';

// Helper to build image style consistently, honoring size, color (tint), and custom style
const buildStyle = (props) => ({
  width: props.size || 24,
  height: props.size || 24,
  tintColor: props.color ?? undefined,
  ...(props.style || {}),
});

// Chat Icons
export const ChatIcons = {
  ChatBubble: (props) => (
    <Image source={require('./assets/png-icons/chat/chat-bubble.png')} style={buildStyle(props)} />
  ),
  Group: (props) => (
    <Image source={require('./assets/png-icons/chat/group.png')} style={buildStyle(props)} />
  ),
  SentTick: (props) => (
    <Image source={require('./assets/png-icons/chat/sent-tick.png')} style={buildStyle(props)} />
  ),
};

// Navigation Icons
export const NavigationIcons = {
  Back: (props) => (
    <Image source={require('./assets/png-icons/navigation/back.png')} style={buildStyle(props)} />
  ),
  Add: (props) => (
    <Image source={require('./assets/png-icons/navigation/add.png')} style={buildStyle(props)} />
  ),
  Calendar: (props) => (
    <Image source={require('./assets/png-icons/navigation/calendar.png')} style={buildStyle(props)} />
  ),
  Search: (props) => (
    <Image source={require('./assets/png-icons/navigation/search.png')} style={buildStyle(props)} />
  ),
  ArrowLeft: (props) => (
    <Image source={require('./assets/png-icons/navigation/arrow-left.png')} style={buildStyle(props)} />
  ),
  Plus: (props) => (
    <Image source={require('./assets/png-icons/navigation/plus.png')} style={buildStyle(props)} />
  ),
  Close: (props) => (
    <Image source={require('./assets/png-icons/navigation/close.png')} style={buildStyle(props)} />
  ),
};

// Matching Icons
export const MatchingIcons = {
  Profile: (props) => (
    <Image source={require('./assets/png-icons/matching/profile.png')} style={buildStyle(props)} />
  ),
  Like: (props) => (
    <Image source={require('./assets/png-icons/matching/like.png')} style={buildStyle(props)} />
  ),
  Reject: (props) => (
    <Image source={require('./assets/png-icons/matching/reject.png')} style={buildStyle(props)} />
  ),
  SuperMatch: (props) => (
    <Image source={require('./assets/png-icons/matching/super-match.png')} style={buildStyle(props)} />
  ),
};

// Gamification Icons
export const GamificationIcons = {
  Trophy: (props) => (
    <Image source={require('./assets/png-icons/gamification/trophy.png')} style={buildStyle(props)} />
  ),
  Medal: (props) => (
    <Image source={require('./assets/png-icons/gamification/medal.png')} style={buildStyle(props)} />
  ),
  Badge: (props) => (
    <Image source={require('./assets/png-icons/gamification/badge.png')} style={buildStyle(props)} />
  ),
  XP: (props) => (
    <Image source={require('./assets/png-icons/gamification/xp.png')} style={buildStyle(props)} />
  ),
  AccountMultiple: (props) => (
    <Image source={require('./assets/png-icons/gamification/account-multiple.png')} style={buildStyle(props)} />
  ),
  AccountGroup: (props) => (
    <Image source={require('./assets/png-icons/gamification/account-group.png')} style={buildStyle(props)} />
  ),
  TrophyAward: (props) => (
    <Image source={require('./assets/png-icons/gamification/trophy-award.png')} style={buildStyle(props)} />
  ),
};

// Notification Icons
export const NotificationIcons = {
  Notification: (props) => (
    <Image source={require('./assets/png-icons/notification/notification.png')} style={buildStyle(props)} />
  ),
  Message: (props) => (
    <Image source={require('./assets/png-icons/notification/message.png')} style={buildStyle(props)} />
  ),
  GroupInvite: (props) => (
    <Image source={require('./assets/png-icons/notification/group-invite.png')} style={buildStyle(props)} />
  ),
  Event: (props) => (
    <Image source={require('./assets/png-icons/notification/event.png')} style={buildStyle(props)} />
  ),
  Achievement: (props) => (
    <Image source={require('./assets/png-icons/notification/achievement.png')} style={buildStyle(props)} />
  ),
};

// Form Icons
export const FormIcons = {
  Name: (props) => (
    <Image source={require('./assets/png-icons/form/name.png')} style={buildStyle(props)} />
  ),
  Branch: (props) => (
    <Image source={require('./assets/png-icons/form/branch.png')} style={buildStyle(props)} />
  ),
  Year: (props) => (
    <Image source={require('./assets/png-icons/form/year.png')} style={buildStyle(props)} />
  ),
  Skills: (props) => (
    <Image source={require('./assets/png-icons/form/skills.png')} style={buildStyle(props)} />
  ),
  Camera: (props) => (
    <Image source={require('./assets/png-icons/form/camera.png')} style={buildStyle(props)} />
  ),
};

// Social Icons
export const SocialIcons = {
  Github: (props) => (
    <Image source={require('./assets/png-icons/social/github.png')} style={buildStyle(props)} />
  ),
  LinkedIn: (props) => (
    <Image source={require('./assets/png-icons/social/linkedin.png')} style={buildStyle(props)} />
  ),
  Twitter: (props) => (
    <Image source={require('./assets/png-icons/social/twitter.png')} style={buildStyle(props)} />
  ),
};

// Profile Icons
export const ProfileIcons = {
  Edit: (props) => (
    <Image source={require('./assets/png-icons/profile/edit.png')} style={buildStyle(props)} />
  ),
  Logout: (props) => (
    <Image source={require('./assets/png-icons/profile/logout.png')} style={buildStyle(props)} />
  ),
  CheckCircle: (props) => (
    <Image source={require('./assets/png-icons/profile/check-circle.png')} style={buildStyle(props)} />
  ),
};
