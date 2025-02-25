import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import { useOnboardingStore } from '../store/onboardingStore';
import { loadIcons } from '../utils/icons';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const { hasCompletedOnboarding } = useOnboardingStore();

  useEffect(() => {
    async function prepare() {
      try {
        await loadIcons();
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}>
        {!hasCompletedOnboarding ? (
          <Stack.Screen
            name="onboarding"
            options={{
              gestureEnabled: false,
            }}
          />
        ) : (
          <>
            <Stack.Screen
              name="(tabs)"
              options={{
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="create-list"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                gestureEnabled: true,
                gestureDirection: 'vertical',
              }}
            />
            <Stack.Screen
              name="add-items"
              options={{
                animation: 'slide_from_right',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="lists"
              options={{
                animation: 'slide_from_right',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="edit-list/[id]"
              options={{
                animation: 'slide_from_right',
                gestureEnabled: true,
              }}
            />
          </>
        )}
      </Stack>
    </View>
  );
}