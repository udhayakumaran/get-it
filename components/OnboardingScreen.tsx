import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  withSpring,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useOnboardingStore } from '../store/onboardingStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_STEPS = [
  {
    title: 'Welcome to GetIt!',
    description: 'Your ultimate tool for organizing shopping lists. Swipe, tap, and shop with ease.',
    icon: 'cart',
    animation: 'welcome',
  },
  {
    title: 'Create and Manage Lists',
    description: 'Easily create, name, and organize your shopping lists. Keep everything in one place.',
    icon: 'list',
    animation: 'create-lists',
  },
  {
    title: 'Add Items Quickly',
    description: 'Add items to your list with a simple swipe. Mark items as urgent when needed.',
    icon: 'add-circle',
    animation: 'add-items',
  },
  {
    title: 'Share with Others',
    description: 'Share your shopping lists with family and friends instantly.',
    icon: 'share-social',
    animation: 'share',
  },
  {
    title: 'Shop Anywhere',
    description: 'Access your lists anytime, anywhere - even without an internet connection.',
    icon: 'globe',
    animation: 'offline',
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const { completeOnboarding } = useOnboardingStore();

  // Always define animated styles
  const demoScale = useAnimatedStyle(() => ({
    transform: [{ scale: withSequence(
      withTiming(1, { duration: 500 }),
      withSpring(1.1),
      withSpring(1)
    ) }]
  }));

  const handleNext = useCallback(() => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeOnboarding();
      router.replace('/(tabs)');
    }
  }, [currentStep, completeOnboarding, router]);

  const handleSkip = useCallback(() => {
    completeOnboarding();
    router.replace('/(tabs)');
  }, [completeOnboarding, router]);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={styles.content}
        entering={FadeIn}
        exiting={FadeOut}>
        <View style={styles.header}>
          <Text style={styles.logo}>GetIt</Text>
          {currentStep < ONBOARDING_STEPS.length - 1 && (
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          )}
        </View>

        <Animated.View
          key={currentStep}
          entering={SlideInRight}
          exiting={SlideOutLeft}
          style={[styles.step, demoScale]}>
          <View style={styles.demoContainer}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={ONBOARDING_STEPS[currentStep].icon as any}
                size={64}
                color="#8AB661"
              />
            </View>
            {currentStep === 0 && (
              <Animated.View 
                style={[styles.swipeDemo, useAnimatedStyle(() => ({
                  transform: [{ translateX: withSequence(
                    withTiming(100, { duration: 1000 }),
                    withTiming(0, { duration: 0 })
                  ) }]
                }))]}
              />
            )}
            {currentStep === 1 && (
              <View style={styles.listDemo}>
                <Text style={styles.listText}>Groceries</Text>
                <Text style={styles.listText}>Hardware</Text>
                <Text style={styles.listText}>Gifts</Text>
              </View>
            )}
            {currentStep === 2 && (
              <View style={styles.itemsDemo}>
                <View style={styles.itemRow}>
                  <Ionicons name="checkmark-circle" size={24} color="#8AB661" />
                  <Text style={styles.itemText}>Milk</Text>
                </View>
                <View style={styles.itemRow}>
                  <Ionicons name="checkmark-circle-outline" size={24} color="#8AB661" />
                  <Text style={styles.itemText}>Bread</Text>
                </View>
                <View style={styles.itemRow}>
                  <Ionicons name="checkmark-circle-outline" size={24} color="#8AB661" />
                  <Text style={styles.itemText}>Eggs</Text>
                </View>
              </View>
            )}
          </View>
          <Text style={styles.title}>{ONBOARDING_STEPS[currentStep].title}</Text>
          <Text style={styles.description}>
            {ONBOARDING_STEPS[currentStep].description}
          </Text>
        </Animated.View>

        <View style={styles.footer}>
          <View style={styles.dots}>
            {ONBOARDING_STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentStep && styles.activeDot,
                ]}
              />
            ))}
          </View>

          <AnimatedPressable
            style={styles.nextButton}
            onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
          </AnimatedPressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2027',
  },
  content: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
  },
  step: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  demoContainer: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    backgroundColor: 'rgba(138, 182, 97, 0.1)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    overflow: 'hidden',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(138, 182, 97, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeDemo: {
    position: 'absolute',
    width: 60,
    height: 60,
    backgroundColor: '#8AB661',
    borderRadius: 30,
    opacity: 0.5,
  },
  listDemo: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
    gap: 10,
  },
  listText: {
    color: '#8AB661',
    fontSize: 20,
    fontWeight: '600',
  },
  itemsDemo: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'flex-start',
    gap: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemText: {
    color: '#8AB661',
    fontSize: 18,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#8AB661',
    width: 24,
  },
  nextButton: {
    backgroundColor: '#8AB661',
    height: 60,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});