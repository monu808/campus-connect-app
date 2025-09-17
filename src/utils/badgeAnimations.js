import { Animated, Platform, AccessibilityInfo } from 'react-native';



/**
 * Animation configurations for different types of badge reveals
 */
export const ANIMATION_CONFIGS = {
  // Standard badge reveal animation
  standard: {
    duration: 700,
    springTension: 50,
    springFriction: 7,
    scaleMax: 1.2,
    rotationDegrees: 360,
  },
  
  // Fast animation for reduced motion users
  reduced: {
    duration: 300,
    springTension: 100,
    springFriction: 8,
    scaleMax: 1.0,
    rotationDegrees: 0,
  },
  
  // Epic animation for legendary badges
  epic: {
    duration: 1000,
    springTension: 40,
    springFriction: 6,
    scaleMax: 1.3,
    rotationDegrees: 720,
  },
};

/**
 * Particle animation configurations based on badge rarity
 */
export const PARTICLE_CONFIGS = {
  common: {
    count: 8,
    maxDistance: 80,
    colors: ['#4CAF50', '#66BB6A', '#81C784'],
  },
  uncommon: {
    count: 10,
    maxDistance: 100,
    colors: ['#2196F3', '#42A5F5', '#64B5F6'],
  },
  rare: {
    count: 12,
    maxDistance: 120,
    colors: ['#9C27B0', '#BA68C8', '#CE93D8'],
  },
  epic: {
    count: 15,
    maxDistance: 140,
    colors: ['#FF9800', '#FFB74D', '#FFCC02'],
  },
  legendary: {
    count: 20,
    maxDistance: 160,
    colors: ['#F44336', '#EF5350', '#FF6B6B', '#FFD700'],
  },
};

/**
 * Creates a spring animation with the given configuration
 */
export const createSpringAnimation = (
  animatedValue,
  toValue,
  config = ANIMATION_CONFIGS.standard
) => {
  return Animated.spring(animatedValue, {
    toValue,
    tension: config.springTension,
    friction: config.springFriction,
    useNativeDriver: true,
  });
};

/**
 * Creates a timing animation with easing
 */
export const createTimingAnimation = (
  animatedValue,
  toValue,
  duration = 300,
  delay = 0
) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    delay,
    useNativeDriver: true,
  });
};

/**
 * Creates particle burst animation based on badge rarity
 */
export const createParticleBurstAnimation = (
  particleAnimations,
  rarity = 'common',
  isReducedMotion = false
) => {
  if (isReducedMotion) {
    return Animated.timing(new Animated.Value(0), {
      toValue: 1,
      duration: 0,
      useNativeDriver: true,
    });
  }

  const config = PARTICLE_CONFIGS[rarity] || PARTICLE_CONFIGS.common;
  const angleStep = 360 / config.count;

  const animations = particleAnimations.slice(0, config.count).map((particle, index) => {
    const angle = (index * angleStep) * (Math.PI / 180);
    const distance = config.maxDistance + Math.random() * 40;
    const translateX = Math.cos(angle) * distance;
    const translateY = Math.sin(angle) * distance;

    return Animated.sequence([
      Animated.delay(index * 30), // Stagger the particles
      Animated.parallel([
        createTimingAnimation(particle.scale, 1, 200),
        createTimingAnimation(particle.opacity, 1, 150),
        createTimingAnimation(particle.translateX, translateX, 600),
        createTimingAnimation(particle.translateY, translateY, 600),
      ]),
      Animated.timing(particle.opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);
  });

  return Animated.parallel(animations);
};

/**
 * Creates the main badge entrance animation
 */
export const createBadgeEntranceAnimation = (
  animations,
  config = ANIMATION_CONFIGS.standard,
  isReducedMotion = false
) => {
  const {
    backdropOpacity,
    badgeScale,
    badgeRotation,
    contentTranslateY,
    contentOpacity,
  } = animations;

  if (isReducedMotion) {
    return Animated.parallel([
      createTimingAnimation(backdropOpacity, 1, 200),
      createTimingAnimation(badgeScale, 1, 300),
      createTimingAnimation(contentOpacity, 1, 300),
    ]);
  }

  return Animated.sequence([
    // Backdrop fade in
    createTimingAnimation(backdropOpacity, 1, 200),
    
    // Badge entrance with spring and rotation
    Animated.parallel([
      createSpringAnimation(badgeScale, 1, config),
      Animated.timing(badgeRotation, {
        toValue: 1,
        duration: config.duration,
        useNativeDriver: true,
      }),
    ]),
    
    // Content slide up and fade in
    Animated.parallel([
      createTimingAnimation(contentTranslateY, 0, 400),
      createTimingAnimation(contentOpacity, 1, 400),
    ]),
  ]);
};

/**
 * Creates exit animation for the popup
 */
export const createExitAnimation = (animations) => {
  const { backdropOpacity, badgeScale, contentOpacity } = animations;
  
  return Animated.parallel([
    createTimingAnimation(backdropOpacity, 0, 200),
    createTimingAnimation(badgeScale, 0, 200),
    createTimingAnimation(contentOpacity, 0, 200),
  ]);
};

/**
 * Checks if reduced motion is enabled
 */
export const checkReducedMotion = async () => {
  try {
    if (Platform.OS === 'ios') {
      return await AccessibilityInfo.isReducedMotionEnabled();
    }
    return false;
  } catch (error) {
    console.warn('Could not check reduced motion setting:', error);
    return false;
  }
};

/**
 * Gets animation configuration based on badge rarity and motion preferences
 */
export const getAnimationConfig = (rarity = 'common', isReducedMotion = false) => {
  if (isReducedMotion) {
    return ANIMATION_CONFIGS.reduced;
  }

  switch (rarity) {
    case 'legendary':
      return ANIMATION_CONFIGS.epic;
    case 'epic':
      return ANIMATION_CONFIGS.epic;
    default:
      return ANIMATION_CONFIGS.standard;
  }
};

/**
 * Creates interpolated rotation value from 0-360 degrees
 */
export const createRotationInterpolation = (animatedValue) => {
  return animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
};

/**
 * Creates scale interpolation with bounce effect
 */
export const createScaleInterpolation = (animatedValue, maxScale = 1.2) => {
  return animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, maxScale, 1],
  });
};