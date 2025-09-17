import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  StyleSheet,
  StatusBar,
  BackHandler,
  AccessibilityInfo,
  Platform,
} from 'react-native';
import { GamificationIcons } from '../Icons';
import { useSoundManager } from '../utils/SoundManager';
import { 
  checkReducedMotion,
  createBadgeEntranceAnimation,
  createParticleBurstAnimation,
  createExitAnimation,
  getAnimationConfig,
  createRotationInterpolation,
  PARTICLE_CONFIGS,
} from '../utils/badgeAnimations';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const BadgeRevealPopup = ({
  visible,
  badge,
  onClose,
  onShare,
  enableSounds = true,
  animationDuration = 700,
  reducedMotion = false,
}) => {
  const soundManager = useSoundManager();
  // Animation values
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;
  const badgeRotation = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(50)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const particleAnimations = useRef(
    Array.from({ length: 12 }, () => ({
      scale: new Animated.Value(0),
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  // Component state
  const [isReducedMotion, setIsReducedMotion] = useState(reducedMotion);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const initializeMotionSettings = async () => {
      const reducedMotionEnabled = await checkReducedMotion();
      setIsReducedMotion(reducedMotionEnabled);
    };
    
    initializeMotionSettings();
  }, []);

  useEffect(() => {
    if (visible && badge) {
      setIsVisible(true);
      handleEnterAnimation();
      
      // Play sound effects
      if (enableSounds) {
        soundManager.playBadgeRevealSound(badge.rarity);
      }
    } else if (!visible) {
      handleExitAnimation();
    }
  }, [visible, badge]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible) {
        handleClose();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [visible]);

  const getRarityColor = (rarity) => {
    const colors = {
      common: '#4CAF50',
      uncommon: '#2196F3',
      rare: '#9C27B0',
      epic: '#FF9800',
      legendary: '#F44336',
    };
    return colors[rarity] || '#757575';
  };

  const getRarityGradient = (rarity) => {
    const gradients = {
      common: ['#4CAF50', '#66BB6A'],
      uncommon: ['#2196F3', '#42A5F5'],
      rare: ['#9C27B0', '#BA68C8'],
      epic: ['#FF9800', '#FFB74D'],
      legendary: ['#F44336', '#EF5350'],
    };
    return gradients[rarity] || ['#757575', '#9E9E9E'];
  };

  const handleEnterAnimation = () => {
    // Reset all animations
    backdropOpacity.setValue(0);
    badgeScale.setValue(0);
    badgeRotation.setValue(0);
    contentTranslateY.setValue(50);
    contentOpacity.setValue(0);
    
    // Reset particles
    const particleCount = PARTICLE_CONFIGS[badge?.rarity]?.count || 8;
    particleAnimations.forEach((particle, index) => {
      if (index < particleCount) {
        particle.scale.setValue(0);
        particle.translateY.setValue(0);
        particle.translateX.setValue(0);
        particle.opacity.setValue(0);
      }
    });

    // Get animation config based on badge rarity
    const config = getAnimationConfig(badge?.rarity, isReducedMotion);
    
    // Create main animation
    const mainAnimation = createBadgeEntranceAnimation({
      backdropOpacity,
      badgeScale,
      badgeRotation,
      contentTranslateY,
      contentOpacity,
    }, config, isReducedMotion);

    // Create particle animation
    const particleAnimation = createParticleBurstAnimation(
      particleAnimations,
      badge?.rarity,
      isReducedMotion
    );
    
    // Run animations
    Animated.parallel([mainAnimation, particleAnimation]).start();
  };

  const handleExitAnimation = () => {
    const exitAnimation = createExitAnimation({
      backdropOpacity,
      badgeScale,
      contentOpacity,
    });

    exitAnimation.start(() => {
      setIsVisible(false);
    });
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleShare = () => {
    if (onShare && badge) {
      onShare(badge);
    }
  };

  if (!isVisible || !badge) {
    return null;
  }

  const rotateValue = createRotationInterpolation(badgeRotation);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslated={false}
      onRequestClose={handleClose}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.8)" barStyle="light-content" />
      
      {/* Backdrop */}
      <Animated.View 
        style={[
          styles.backdrop,
          { opacity: backdropOpacity }
        ]}
      >
        <View
          style={[StyleSheet.absoluteFill, styles.blurBackdrop]}
        />
        <TouchableOpacity 
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleClose}
          accessible={true}
          accessibilityLabel="Close badge reveal popup"
          accessibilityRole="button"
        />
      </Animated.View>

      {/* Main Content */}
      <View style={styles.container}>
        {/* Particles */}
        {!isReducedMotion && badge && (
          <View style={styles.particleContainer}>
            {particleAnimations.slice(0, PARTICLE_CONFIGS[badge.rarity]?.count || 8).map((particle, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.particle,
                  {
                    backgroundColor: getRarityColor(badge.rarity),
                    transform: [
                      { scale: particle.scale },
                      { translateX: particle.translateX },
                      { translateY: particle.translateY },
                    ],
                    opacity: particle.opacity,
                  },
                ]}
              />
            ))}
          </View>
        )}

        {/* Badge Display */}
        <View style={styles.contentContainer}>
          <Animated.View
            style={[
              styles.badgeContainer,
              {
                transform: [
                  { scale: badgeScale },
                  { rotate: isReducedMotion ? '0deg' : rotateValue },
                ],
              },
            ]}
          >
            <View 
              style={[
                styles.badgeIcon,
                { 
                  backgroundColor: getRarityColor(badge.rarity),
                  shadowColor: getRarityColor(badge.rarity),
                }
              ]}
            >
              <GamificationIcons.TrophyAward size={60} color="#FFFFFF" />
            </View>
            
            {/* Rarity Ring */}
            <View 
              style={[
                styles.rarityRing,
                { borderColor: getRarityColor(badge.rarity) }
              ]} 
            />
          </Animated.View>

          {/* Badge Information */}
          <Animated.View
            style={[
              styles.badgeInfo,
              {
                opacity: contentOpacity,
                transform: [{ translateY: contentTranslateY }],
              },
            ]}
          >
            <Text style={styles.congratsText}>🎉 Congratulations! 🎉</Text>
            <Text style={styles.badgeTitle}>{badge.name}</Text>
            <Text 
              style={[
                styles.badgeRarity,
                { color: getRarityColor(badge.rarity) }
              ]}
            >
              {badge.rarity?.toUpperCase()} BADGE
            </Text>
            <Text style={styles.badgeDescription}>
              {badge.description}
            </Text>
            
            {badge.xpReward && (
              <View style={styles.xpRewardContainer}>
                <GamificationIcons.Star size={20} color="#FFD700" />
                <Text style={styles.xpRewardText}>
                  +{badge.xpReward} XP Earned!
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View
            style={[
              styles.buttonContainer,
              { opacity: contentOpacity }
            ]}
          >
            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton]}
              onPress={handleShare}
              accessible={true}
              accessibilityLabel={`Share ${badge.name} badge`}
              accessibilityRole="button"
            >
              <GamificationIcons.Star size={20} color="#FFFFFF" />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.closeButton]}
              onPress={handleClose}
              accessible={true}
              accessibilityLabel="Continue"
              accessibilityRole="button"
            >
              <Text style={styles.closeButtonText}>Continue</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  blurBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  backdropTouchable: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  particleContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    maxWidth: screenWidth * 0.9,
  },
  badgeContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  badgeIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  rarityRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    top: -10,
    left: -10,
  },
  badgeInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  congratsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  badgeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  badgeRarity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: 1,
  },
  badgeDescription: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  xpRewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  xpRewardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 100,
    justifyContent: 'center',
  },
  shareButton: {
    backgroundColor: '#2196F3',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  closeButton: {
    backgroundColor: '#4CAF50',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BadgeRevealPopup;