import React from 'react';
import { Image } from 'react-native';

// Chat Icons
export const ChatIcons = {
  ChatBubble: (props) => <Image source={require('./assets/png-icons/chat/chat-bubble.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
  Group: (props) => <Image source={require('./assets/png-icons/chat/group.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
  SentTick: (props) => <Image source={require('./assets/png-icons/chat/sent-tick.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
};

// Navigation Icons
export const NavigationIcons = {
  Back: (props) => <Image source={require('./assets/png-icons/navigation/back.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
  Add: (props) => <Image source={require('./assets/png-icons/navigation/add.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
  Calendar: (props) => <Image source={require('./assets/png-icons/navigation/calendar.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
  Search: (props) => <Image source={require('./assets/png-icons/navigation/search.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
  ArrowLeft: (props) => <Image source={require('./assets/png-icons/navigation/arrow-left.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
  Plus: (props) => <Image source={require('./assets/png-icons/navigation/plus.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
  Close: (props) => <Image source={require('./assets/png-icons/navigation/close.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
};

// Matching Icons
export const MatchingIcons = {
  Profile: (props) => <Image source={require('./assets/png-icons/matching/profile.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
  Like: (props) => <Image source={require('./assets/png-icons/matching/like.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
  Reject: (props) => <Image source={require('./assets/png-icons/matching/reject.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
  SuperMatch: (props) => <Image source={require('./assets/png-icons/matching/super-match.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
};

// Gamification Icons
export const GamificationIcons = {
  Trophy: (props) => <Image source={require('./assets/png-icons/gamification/trophy.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
  Medal: (props) => <Image source={require('./assets/png-icons/gamification/medal.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
  Badge: (props) => <Image source={require('./assets/png-icons/gamification/badge.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
  XP: (props) => <Image source={require('./assets/png-icons/gamification/xp.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
  AccountMultiple: (props) => <Image source={require('./assets/png-icons/gamification/account-multiple.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
  AccountGroup: (props) => <Image source={require('./assets/png-icons/gamification/account-group.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
  TrophyAward: (props) => <Image source={require('./assets/png-icons/gamification/trophy-award.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
};

// Notification Icons
export const NotificationIcons = {
  Notification: (props) => <Image source={require('./assets/png-icons/notification/notification.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
  Message: (props) => <Image source={require('./assets/png-icons/notification/message.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
  GroupInvite: (props) => <Image source={require('./assets/png-icons/notification/group-invite.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
  Event: (props) => <Image source={require('./assets/png-icons/notification/event.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
  Achievement: (props) => <Image source={require('./assets/png-icons/notification/achievement.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
};

// Form Icons
export const FormIcons = {
  Name: (props) => <Image source={require('./assets/png-icons/form/name.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
  Branch: (props) => <Image source={require('./assets/png-icons/form/branch.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
  Year: (props) => <Image source={require('./assets/png-icons/form/year.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
  Skills: (props) => <Image source={require('./assets/png-icons/form/skills.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
  Camera: (props) => <Image source={require('./assets/png-icons/form/camera.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
};

// Social Icons
export const SocialIcons = {
  Github: (props) => <Image source={require('./assets/png-icons/social/github.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
  LinkedIn: (props) => <Image source={require('./assets/png-icons/social/linkedin.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
  Twitter: (props) => <Image source={require('./assets/png-icons/social/twitter.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
};

// Profile Icons
export const ProfileIcons = {
  Edit: (props) => <Image source={require('./assets/png-icons/profile/edit.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
  Logout: (props) => <Image source={require('./assets/png-icons/profile/logout.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
  CheckCircle: (props) => <Image source={require('./assets/png-icons/profile/check-circle.png')} style={{ width: props.size || 24, height: props.size || 24 }} />,
};
