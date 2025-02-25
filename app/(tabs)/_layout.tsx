import { Tabs } from 'expo-router';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#0B4A3F',
        tabBarInactiveTintColor: '#A8A8A8',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons 
              name="home" 
              size={size} 
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="basket"
        options={{
          title: 'Basket',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons 
              name="basket" 
              size={size} 
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Past Lists',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons 
              name="history" 
              size={size} 
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}