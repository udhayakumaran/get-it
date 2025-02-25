import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function CreateListScreen() {
  const router = useRouter();
  const [listName, setListName] = useState('');

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    if (!listName.trim()) {
      Alert.alert('Error', 'Please enter a list name');
      return;
    }

    router.push({
      pathname: '/add-items',
      params: { listName: listName.trim() }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={handleBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000000" />
        </Pressable>
        <Text style={styles.title}>Create New List</Text>
        <View style={{ width: 40 }} />
      </View>

      <Animated.View 
        style={styles.content}
        entering={FadeInDown.delay(200)}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>List Name</Text>
          <TextInput
            style={styles.input}
            value={listName}
            onChangeText={setListName}
            placeholder="Enter list name..."
            placeholderTextColor="#666666"
            autoFocus
          />
        </View>

        <Text style={styles.hint}>
          Give your list a descriptive name like "Weekly Groceries" or "Party Supplies"
        </Text>
      </Animated.View>

      <Animated.View 
        style={styles.footer}
        entering={FadeIn.delay(400)}>
        <Pressable
          style={styles.continueButton}
          onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
          <MaterialCommunityIcons name="arrow-right" size={24} color="#FFFFFF" />
        </Pressable>
      </Animated.View>
    </View>
  );
}