import React from 'react';
import { Stack } from 'expo-router';

// This replaces the tab navigator with a simple stack
export default function TabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
} 