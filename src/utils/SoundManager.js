import { Platform } from 'react-native';

/**
 * Sound Manager for Badge Reveal System
 * Handles sound effects for different badge rarities and achievements
 */
class SoundManager {
  constructor() {
    this.sounds = {};
    this.initialized = false;
    this.soundEnabled = true;
  }

  /**
   * Initialize sound system (placeholder for future implementation)
   */
  async initialize() {
    try {
      // Future implementation: Load sound files here
      // For now, we'll use system sounds and haptic feedback
      this.initialized = true;
      console.log('SoundManager: Initialized with system sounds');
    } catch (error) {
      console.error('SoundManager: Failed to initialize', error);
    }
  }

  /**
   * Enable or disable sound effects
   */
  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
  }

  /**
   * Play badge reveal sound based on rarity
   */
  playBadgeRevealSound(rarity = 'common') {
    if (!this.soundEnabled || !this.initialized) {
      return;
    }

    try {
      // For now, we'll use system notifications and haptic feedback
      // Future implementation could use react-native-sound or expo-av
      
      switch (rarity) {
        case 'legendary':
          this.playSystemSound('legendary');
          break;
        case 'epic':
          this.playSystemSound('epic');
          break;
        case 'rare':
          this.playSystemSound('rare');
          break;
        case 'uncommon':
          this.playSystemSound('uncommon');
          break;
        default:
          this.playSystemSound('common');
      }
    } catch (error) {
      console.error('SoundManager: Error playing badge reveal sound', error);
    }
  }

  /**
   * Play XP gain sound
   */
  playXPGainSound(amount) {
    if (!this.soundEnabled || !this.initialized) {
      return;
    }

    try {
      // Different sounds based on XP amount
      if (amount >= 100) {
        this.playSystemSound('xp_large');
      } else if (amount >= 50) {
        this.playSystemSound('xp_medium');
      } else {
        this.playSystemSound('xp_small');
      }
    } catch (error) {
      console.error('SoundManager: Error playing XP gain sound', error);
    }
  }

  /**
   * Play level up sound
   */
  playLevelUpSound() {
    if (!this.soundEnabled || !this.initialized) {
      return;
    }

    try {
      this.playSystemSound('level_up');
    } catch (error) {
      console.error('SoundManager: Error playing level up sound', error);
    }
  }

  /**
   * Play challenge completion sound
   */
  playChallengeCompletionSound() {
    if (!this.soundEnabled || !this.initialized) {
      return;
    }

    try {
      this.playSystemSound('challenge_complete');
    } catch (error) {
      console.error('SoundManager: Error playing challenge completion sound', error);
    }
  }

  /**
   * Play system sound (placeholder implementation)
   */
  playSystemSound(soundType) {
    // Future implementation: Use react-native-sound or expo-av
    // For now, log the sound that would be played
    console.log(`SoundManager: Playing ${soundType} sound`);
    
    // On iOS, we could use system sounds
    if (Platform.OS === 'ios') {
      // SystemSoundID implementation would go here
      // For example: AudioServicesPlaySystemSound(1007); // SMS sound
    }
  }

  /**
   * Preload sounds for better performance
   */
  async preloadSounds() {
    try {
      // Future implementation: Preload all sound files
      console.log('SoundManager: Sounds preloaded');
    } catch (error) {
      console.error('SoundManager: Error preloading sounds', error);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    try {
      // Future implementation: Release sound resources
      this.sounds = {};
      this.initialized = false;
      console.log('SoundManager: Cleaned up resources');
    } catch (error) {
      console.error('SoundManager: Error during cleanup', error);
    }
  }
}

// Create singleton instance
const soundManager = new SoundManager();

export default soundManager;

/**
 * Hook for using sound manager in React components
 */
export const useSoundManager = () => {
  return {
    playBadgeRevealSound: (rarity) => soundManager.playBadgeRevealSound(rarity),
    playXPGainSound: (amount) => soundManager.playXPGainSound(amount),
    playLevelUpSound: () => soundManager.playLevelUpSound(),
    playChallengeCompletionSound: () => soundManager.playChallengeCompletionSound(),
    setSoundEnabled: (enabled) => soundManager.setSoundEnabled(enabled),
  };
};

/**
 * Initialize sound manager (call this in your app's entry point)
 */
export const initializeSoundManager = async () => {
  await soundManager.initialize();
  await soundManager.preloadSounds();
};