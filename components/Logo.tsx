import * as React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { View } from 'react-native';

export function Logo(props: { size?: number; color?: string }) {
  const { size = 32, color = '#0B4A3F' } = props;
  
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <MaterialCommunityIcons name="shopping" size={size} color={color} />
    </View>
  );
}