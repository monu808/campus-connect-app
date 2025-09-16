/**
 * Campus Connect Achievement System
 * Defines all available badges, achievements, and their unlock criteria
 */

import { GamificationIcons } from '../Icons';

export const BADGE_CATEGORIES = {
  ACADEMIC: 'academic',
  SOCIAL: 'social',
  LEADERSHIP: 'leadership',
  PARTICIPATION: 'participation',
  MILESTONE: 'milestone',
  SPECIAL: 'special'
};

export const CAMPUS_BADGES = {
  // Academic Achievements
  FIRST_STUDY_GROUP: {
    id: 'first_study_group',
    name: 'Study Buddy',
    description: 'Join your first study group',
    category: BADGE_CATEGORIES.ACADEMIC,
    icon: GamificationIcons.AccountGroup,
    xpReward: 25,
    criteria: {
      type: 'join_group',
      count: 1,
      groupType: 'study'
    },
    rarity: 'common'
  },
  
  ACADEMIC_COLLABORATOR: {
    id: 'academic_collaborator',
    name: 'Academic Collaborator',
    description: 'Join 5 study groups',
    category: BADGE_CATEGORIES.ACADEMIC,
    icon: GamificationIcons.School,
    xpReward: 100,
    criteria: {
      type: 'join_group',
      count: 5,
      groupType: 'study'
    },
    rarity: 'uncommon'
  },
  
  KNOWLEDGE_SEEKER: {
    id: 'knowledge_seeker',
    name: 'Knowledge Seeker',
    description: 'Attend 10 academic events',
    category: BADGE_CATEGORIES.ACADEMIC,
    icon: GamificationIcons.Brain,
    xpReward: 150,
    criteria: {
      type: 'attend_event',
      count: 10,
      eventCategory: 'academic'
    },
    rarity: 'rare'
  },

  // Social Achievements
  FIRST_CONNECTION: {
    id: 'first_connection',
    name: 'Social Starter',
    description: 'Make your first connection',
    category: BADGE_CATEGORIES.SOCIAL,
    icon: GamificationIcons.AccountPlus,
    xpReward: 15,
    criteria: {
      type: 'make_connection',
      count: 1
    },
    rarity: 'common'
  },
  
  NETWORK_BUILDER: {
    id: 'network_builder',
    name: 'Network Builder',
    description: 'Connect with 25 classmates',
    category: BADGE_CATEGORIES.SOCIAL,
    icon: GamificationIcons.AccountMultiple,
    xpReward: 125,
    criteria: {
      type: 'make_connection',
      count: 25
    },
    rarity: 'uncommon'
  },
  
  SOCIAL_BUTTERFLY: {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Connect with 100 people',
    category: BADGE_CATEGORIES.SOCIAL,
    icon: GamificationIcons.Heart,
    xpReward: 300,
    criteria: {
      type: 'make_connection',
      count: 100
    },
    rarity: 'legendary'
  },

  // Leadership Achievements
  FIRST_GROUP_CREATED: {
    id: 'first_group_created',
    name: 'Group Founder',
    description: 'Create your first group',
    category: BADGE_CATEGORIES.LEADERSHIP,
    icon: GamificationIcons.Crown,
    xpReward: 50,
    criteria: {
      type: 'create_group',
      count: 1
    },
    rarity: 'common'
  },
  
  EVENT_ORGANIZER: {
    id: 'event_organizer',
    name: 'Event Organizer',
    description: 'Organize 5 campus events',
    category: BADGE_CATEGORIES.LEADERSHIP,
    icon: GamificationIcons.Calendar,
    xpReward: 200,
    criteria: {
      type: 'organize_event',
      count: 5
    },
    rarity: 'rare'
  },
  
  COMMUNITY_LEADER: {
    id: 'community_leader',
    name: 'Community Leader',
    description: 'Lead 3 active groups with 10+ members',
    category: BADGE_CATEGORIES.LEADERSHIP,
    icon: GamificationIcons.TrophyAward,
    xpReward: 400,
    criteria: {
      type: 'lead_active_groups',
      count: 3,
      minMembers: 10
    },
    rarity: 'legendary'
  },

  // Participation Achievements
  REGULAR_ATTENDEE: {
    id: 'regular_attendee',
    name: 'Regular Attendee',
    description: 'Attend 20 campus events',
    category: BADGE_CATEGORIES.PARTICIPATION,
    icon: GamificationIcons.CheckCircle,
    xpReward: 150,
    criteria: {
      type: 'attend_event',
      count: 20
    },
    rarity: 'uncommon'
  },
  
  CAMPUS_ENTHUSIAST: {
    id: 'campus_enthusiast',
    name: 'Campus Enthusiast',
    description: 'Participate in 50 activities',
    category: BADGE_CATEGORIES.PARTICIPATION,
    icon: GamificationIcons.Fire,
    xpReward: 250,
    criteria: {
      type: 'total_activities',
      count: 50
    },
    rarity: 'rare'
  },

  // Milestone Achievements
  PROFILE_COMPLETE: {
    id: 'profile_complete',
    name: 'Profile Master',
    description: 'Complete your profile 100%',
    category: BADGE_CATEGORIES.MILESTONE,
    icon: GamificationIcons.Account,
    xpReward: 100,
    criteria: {
      type: 'profile_completion',
      percentage: 100
    },
    rarity: 'common'
  },
  
  LEVEL_MILESTONE_5: {
    id: 'level_milestone_5',
    name: 'Rising Star',
    description: 'Reach level 5',
    category: BADGE_CATEGORIES.MILESTONE,
    icon: GamificationIcons.Star,
    xpReward: 200,
    criteria: {
      type: 'reach_level',
      level: 5
    },
    rarity: 'uncommon'
  },
  
  LEVEL_MILESTONE_10: {
    id: 'level_milestone_10',
    name: 'Campus Veteran',
    description: 'Reach level 10',
    category: BADGE_CATEGORIES.MILESTONE,
    icon: GamificationIcons.Diamond,
    xpReward: 500,
    criteria: {
      type: 'reach_level',
      level: 10
    },
    rarity: 'epic'
  },

  // Special Achievements
  EARLY_ADOPTER: {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'One of the first 100 users',
    category: BADGE_CATEGORIES.SPECIAL,
    icon: GamificationIcons.Rocket,
    xpReward: 300,
    criteria: {
      type: 'early_user',
      rank: 100
    },
    rarity: 'legendary'
  },
  
  STREAK_MASTER: {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Maintain a 30-day login streak',
    category: BADGE_CATEGORIES.SPECIAL,
    icon: GamificationIcons.Lightning,
    xpReward: 350,
    criteria: {
      type: 'login_streak',
      days: 30
    },
    rarity: 'epic'
  },
  
  MENTOR: {
    id: 'mentor',
    name: 'Campus Mentor',
    description: 'Help 10 new students get started',
    category: BADGE_CATEGORIES.SPECIAL,
    icon: GamificationIcons.Graduation,
    xpReward: 400,
    criteria: {
      type: 'mentor_students',
      count: 10
    },
    rarity: 'legendary'
  }
};

export const RARITY_COLORS = {
  common: '#6c757d',
  uncommon: '#28a745',
  rare: '#007bff',
  epic: '#6f42c1',
  legendary: '#fd7e14'
};

export const RARITY_NAMES = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary'
};

// XP Requirements for each level
export const LEVEL_REQUIREMENTS = {
  1: 0,
  2: 100,
  3: 250,
  4: 450,
  5: 700,
  6: 1000,
  7: 1350,
  8: 1750,
  9: 2200,
  10: 2700,
  11: 3250,
  12: 3850,
  13: 4500,
  14: 5200,
  15: 5950,
  16: 6750,
  17: 7600,
  18: 8500,
  19: 9450,
  20: 10500
};

// Campus-specific level titles
export const LEVEL_TITLES = {
  1: 'Campus Newcomer',
  2: 'Freshman Explorer',
  3: 'Active Student',
  4: 'Engaged Learner',
  5: 'Rising Star',
  6: 'Sophomore Socializer',
  7: 'Community Member',
  8: 'Campus Contributor',
  9: 'Junior Leader',
  10: 'Experienced Student',
  11: 'Campus Ambassador',
  12: 'Senior Mentor',
  13: 'Community Leader',
  14: 'Campus Champion',
  15: 'Student Leader',
  16: 'Campus Influencer',
  17: 'Student Ambassador',
  18: 'Campus Legend',
  19: 'Elite Student',
  20: 'Campus Hero'
};

// Calculate user level based on XP
export const calculateLevel = (xp) => {
  let level = 1;
  for (let i = 2; i <= 20; i++) {
    if (xp >= LEVEL_REQUIREMENTS[i]) {
      level = i;
    } else {
      break;
    }
  }
  return level;
};

// Calculate XP needed for next level
export const getXPForNextLevel = (currentXP) => {
  const currentLevel = calculateLevel(currentXP);
  if (currentLevel >= 20) return 0; // Max level reached
  
  return LEVEL_REQUIREMENTS[currentLevel + 1] - currentXP;
};

// Get progress percentage to next level
export const getLevelProgress = (currentXP) => {
  const currentLevel = calculateLevel(currentXP);
  if (currentLevel >= 20) return 100;
  
  const currentLevelXP = LEVEL_REQUIREMENTS[currentLevel];
  const nextLevelXP = LEVEL_REQUIREMENTS[currentLevel + 1];
  const progressXP = currentXP - currentLevelXP;
  const totalXPNeeded = nextLevelXP - currentLevelXP;
  
  return Math.round((progressXP / totalXPNeeded) * 100);
};