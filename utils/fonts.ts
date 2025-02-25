import * as Font from 'expo-font';

export async function loadFonts() {
  try {
    await Font.loadAsync({
      'Ionicons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf')
    });
  } catch (e) {
    console.warn('Error loading fonts:', e);
  }
}