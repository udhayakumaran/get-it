import React, { useState } from 'react';
import { StyleSheet, Dimensions, useColorScheme, Platform, View, Text, Pressable, TextInput } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  runOnJS,
  interpolateColor,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  ZoomIn,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface SwipeableCardProps {
  item: {
    id: string;
    name: string;
    image: string;
    type?: 'liquid' | 'solid' | 'count';
  };
  onSwipeLeft: (id: string) => void;
  onSwipeRight: (id: string, quantity: number, unit: string) => void;
  onSwipeUp: (id: string) => void;
}

const getDefaultUnit = (type?: 'liquid' | 'solid' | 'count') => {
  switch (type) {
    case 'liquid':
      return 'L';
    case 'solid':
      return 'kg';
    default:
      return 'pc';
  }
};

const getUnitOptions = (type?: 'liquid' | 'solid' | 'count') => {
  switch (type) {
    case 'liquid':
      return ['mL', 'L'];
    case 'solid':
      return ['g', 'kg'];
    default:
      return ['pc', 'dozen'];
  }
};

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

export function SwipeableCard({
  item,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
}: SwipeableCardProps) {
  const isDark = useColorScheme() === 'dark';
  const [isUrgent, setIsUrgent] = useState(false);
  const [quantity, setQuantity] = useState('1.00');
  const [selectedUnit, setSelectedUnit] = useState(getDefaultUnit(item.type));
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardRotate = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const colorProgress = useSharedValue(0);
  const opacity = useSharedValue(1);

  const triggerHaptic = (intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (Platform.OS !== 'web') {
      switch (intensity) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
      }
    }
  };

  const handleQuantityChange = (delta: number) => {
    const currentValue = parseFloat(quantity) || 0;
    const newValue = Math.max(0.01, Math.min(99.99, currentValue + delta));
    setQuantity(newValue.toFixed(2));
    triggerHaptic('light');
  };

  const handleQuantityInput = (text: string) => {
    // Allow only numbers and one decimal point
    const filtered = text.replace(/[^0-9.]/g, '');
    if (filtered === '') {
      setQuantity('');
      return;
    }
    
    const parts = filtered.split('.');
    if (parts.length > 2) return; // Don't allow multiple decimal points
    if (parts[0].length > 2) return; // Don't allow more than 2 digits before decimal
    if (parts[1] && parts[1].length > 2) return; // Don't allow more than 2 decimal places
    
    setQuantity(filtered);
  };

  const handleQuantityBlur = () => {
    const value = parseFloat(quantity) || 0;
    if (value < 0.01) {
      setQuantity('0.01');
    } else if (value > 99.99) {
      setQuantity('99.99');
    } else {
      setQuantity(value.toFixed(2));
    }
  };

  const handleUnitChange = () => {
    const units = getUnitOptions(item.type);
    const currentIndex = units.indexOf(selectedUnit);
    const nextIndex = (currentIndex + 1) % units.length;
    setSelectedUnit(units[nextIndex]);
    triggerHaptic('light');
  };

  const showSuccess = () => {
    setShowSuccessAnimation(true);
    setTimeout(() => {
      setShowSuccessAnimation(false);
    }, 1500);
  };

  const handleAddToList = (urgent: boolean = false) => {
    triggerHaptic('medium');
    if (urgent) {
      onSwipeUp(item.id);
    } else {
      onSwipeRight(item.id, parseFloat(quantity), selectedUnit);
    }
    runOnJS(showSuccess)();
    opacity.value = withDelay(1500, withTiming(0, { duration: 300 }));
  };

  const gesture = Gesture.Pan()
    .onBegin(() => {
      cardScale.value = withSpring(1.05, { damping: 10 });
      runOnJS(triggerHaptic)('light');
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      cardRotate.value = event.translationX / 15;
      
      if (Math.abs(event.translationX) > Math.abs(event.translationY)) {
        // Horizontal swipe
        colorProgress.value = withTiming(event.translationX > 0 ? 1 : 2, {
          duration: 150,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
      } else if (event.translationY < 0) {
        // Upward swipe only
        colorProgress.value = withTiming(3, {
          duration: 150,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
      }
    })
    .onEnd((event) => {
      const swipeX = Math.abs(event.translationX) > SWIPE_THRESHOLD;
      const swipeY = event.translationY < -SWIPE_THRESHOLD;

      if (swipeX || swipeY) {
        if (swipeX && event.translationX > 0) {
          // Right swipe - add to list
          runOnJS(handleAddToList)(false);
        } else if (swipeX && event.translationX < 0) {
          // Left swipe - skip
          translateX.value = withSpring(-SCREEN_WIDTH * 1.5, { damping: 12 });
          opacity.value = withTiming(0, { duration: 200 });
          cardScale.value = withSequence(
            withSpring(1.1),
            withDelay(100, withSpring(0.8))
          );
          runOnJS(triggerHaptic)('light');
          runOnJS(onSwipeLeft)(item.id);
        } else if (swipeY) {
          // Up swipe - urgent
          runOnJS(setIsUrgent)(true);
          runOnJS(handleAddToList)(true);
        }
      } else {
        translateX.value = withSpring(0, { damping: 15 });
        translateY.value = withSpring(0, { damping: 15 });
        cardRotate.value = withSpring(0, { damping: 15 });
        colorProgress.value = withTiming(0, { duration: 150 });
        cardScale.value = withSpring(1, { damping: 15 });
      }
    });

  const rStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${cardRotate.value}deg` },
      { scale: cardScale.value },
    ],
    opacity: opacity.value,
    backgroundColor: interpolateColor(
      colorProgress.value,
      [0, 1, 2, 3],
      [
        isDark ? '#1A1A1A' : '#FFFFFF',
        '#4CAF50',  // Green for right swipe (add)
        '#FF5252',  // Red for left swipe (skip)
        '#E17055',  // Orange for up swipe (urgent)
      ]
    ),
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, rStyle]}>
        <LinearGradient
          colors={isDark ? ['#2A2A2A', '#1A1A1A'] : ['#FFFFFF', '#F5F5F5']}
          style={styles.gradient}>
          <Animated.Image
            source={{ uri: item.image }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.cardContent}>
            <Animated.Text style={[styles.name, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              {item.name}
            </Animated.Text>
            <View style={styles.quantityRow}>
              <View style={styles.quantityInputContainer}>
                <Pressable 
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(-0.01)}>
                  <Ionicons name="remove" size={20} color="#0B4A3F" />
                </Pressable>
                <TextInput
                  style={styles.quantityInput}
                  value={quantity}
                  onChangeText={handleQuantityInput}
                  onBlur={handleQuantityBlur}
                  keyboardType="decimal-pad"
                  selectTextOnFocus
                  maxLength={5}
                />
                <Pressable 
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(0.01)}>
                  <Ionicons name="add" size={20} color="#0B4A3F" />
                </Pressable>
              </View>

              {item.type && (
                <Pressable 
                  style={styles.unitButton}
                  onPress={handleUnitChange}>
                  <Text style={styles.unitText}>{selectedUnit}</Text>
                  <Ionicons name="chevron-down" size={16} color="#0B4A3F" />
                </Pressable>
              )}
            </View>
          </View>

          {showSuccessAnimation && (
            <Animated.View 
              entering={ZoomIn}
              style={styles.successOverlay}>
              <AnimatedIonicons
                name="checkmark-circle"
                size={64}
                color="#4CAF50"
                entering={ZoomIn}
              />
              <Animated.Text 
                style={styles.successText}
                entering={FadeIn.delay(200)}>
                Added to List
              </Animated.Text>
            </Animated.View>
          )}
        </LinearGradient>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 1.2,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
  },
  image: {
    width: '100%',
    height: '60%',
    borderRadius: 15,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    marginTop: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 8,
  },
  quantityInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quantityInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: '#0B4A3F',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unitText: {
    color: '#0B4A3F',
    fontSize: 16,
    fontWeight: '600',
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  successText: {
    color: '#4CAF50',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
});