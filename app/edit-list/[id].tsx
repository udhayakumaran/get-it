import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Platform,
  TextInput,
  Pressable,
  FlatList,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useShoppingStore } from '../../store/shoppingStore';
import { styles } from './styles';
import { format, isAfter } from 'date-fns';
import { SimpleDatePicker } from '../../components/SimpleDatePicker';

const SAVE_DELAY = 1000; // 1 second delay before auto-saving

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function FloatingReminderButton({ 
  enabled, 
  date,
  onPress 
}: { 
  enabled: boolean;
  date: Date | null;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const rStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const formattedDate = date ? format(date, 'EEE, MMM d, h:mm a') : null;

  return (
    <View>
      <AnimatedPressable
        style={[styles.floatingReminder, rStyle, enabled && styles.floatingReminderEnabled]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}>
        <MaterialIcons 
          name={enabled ? "notifications" : "notifications-none"} 
          size={24} 
          color={enabled ? "#FFFFFF" : "#0B4A3F"} 
        />
      </AnimatedPressable>
      {enabled && formattedDate && (
        <View style={styles.reminderBadge}>
          <Text style={styles.reminderBadgeText}>{formattedDate}</Text>
        </View>
      )}
    </View>
  );
}

function ListItem({ 
  item, 
  onToggle, 
  onDelete,
  onUndoDelete 
}: { 
  item: { 
    id: string; 
    name: string; 
    quantity: number; 
    unit: string; 
    purchased?: boolean; 
  };
  onToggle: () => void;
  onDelete: () => void;
  onUndoDelete: () => void;
}) {
  const [showUndo, setShowUndo] = useState(false);

  const handleDelete = () => {
    setShowUndo(true);
    setTimeout(() => {
      if (!showUndo) {
        onDelete();
      }
    }, 3000);
  };

  const handleUndo = () => {
    setShowUndo(false);
    onUndoDelete();
  };

  return (
    <AnimatedPressable 
      style={[styles.item, item.purchased && styles.purchasedItem]}
      onPress={onToggle}>
      <View style={styles.itemLeft}>
        <View style={[styles.checkbox, item.purchased && styles.checkedBox]}>
          {item.purchased && (
            <MaterialIcons name="check" size={16} color="#FFFFFF" />
          )}
        </View>
        <View>
          <Text style={[styles.itemName, item.purchased && styles.purchasedText]}>
            {item.name}
          </Text>
          <Text style={styles.itemQuantity}>
            {item.quantity} {item.unit}
          </Text>
        </View>
      </View>
      {showUndo ? (
        <Pressable 
          style={styles.undoButton}
          onPress={handleUndo}>
          <Text style={styles.undoText}>Undo</Text>
        </Pressable>
      ) : (
        <Pressable 
          style={styles.deleteButton}
          onPress={handleDelete}>
          <MaterialIcons name="delete-outline" size={20} color="#E17055" />
        </Pressable>
      )}
    </AnimatedPressable>
  );
}

export default function EditListScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pastLists, updateList, setReminder } = useShoppingStore();
  
  const list = pastLists.find(list => list.id === id);
  const [listName, setListName] = useState(list?.name || '');
  const [items, setItems] = useState(list?.items || []);
  const [reminderEnabled, setReminderEnabled] = useState(!!list?.reminder?.enabled);
  const [reminderDate, setReminderDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [deletedItems, setDeletedItems] = useState<typeof items>([]);
  const [showReminderBadge, setShowReminderBadge] = useState(false);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const hasUnsavedChanges = useRef(false);

  const handleReminderChange = (date: Date) => {
    const now = new Date();
    if (!isAfter(date, now)) {
      Alert.alert(
        'Invalid Date',
        'Please select a future date and time for the reminder.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setReminderDate(date);
    setReminderEnabled(true);
  };

  const handleReminderPress = () => {
    if (!reminderDate) {
      setReminderDate(new Date());
    }
    setShowDatePicker(true);
  };

  const handleToggleItem = useCallback((id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, purchased: !item.purchased } : item
    ));
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleDeleteItem = useCallback((id: string) => {
    const itemToDelete = items.find(item => item.id === id);
    if (itemToDelete) {
      setDeletedItems(prev => [...prev, itemToDelete]);
      setItems(prev => prev.filter(item => item.id !== id));
    }
  }, [items]);

  const handleUndoDelete = useCallback((id: string) => {
    const itemToRestore = deletedItems.find(item => item.id === id);
    if (itemToRestore) {
      setItems(prev => [...prev, itemToRestore]);
      setDeletedItems(prev => prev.filter(item => item.id !== id));
    }
  }, [deletedItems]);

  useEffect(() => {
    if (!list) return;
    
    const hasChanges = 
      listName !== list.name ||
      JSON.stringify(items) !== JSON.stringify(list.items) ||
      reminderEnabled !== !!list.reminder?.enabled ||
      (reminderEnabled && reminderDate?.toISOString() !== list.reminder?.date);
    
    if (!hasChanges) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    hasUnsavedChanges.current = true;

    saveTimeoutRef.current = setTimeout(() => {
      if (!list) return;

      const updatedList = {
        ...list,
        name: listName.trim(),
        items,
        date: new Date().toISOString(),
      };

      updateList(id, updatedList);

      if (reminderEnabled && reminderDate) {
        setReminder(id, {
          enabled: true,
          date: reminderDate.toISOString(),
        });
      } else {
        setReminder(id, undefined);
      }
      
      hasUnsavedChanges.current = false;
    }, SAVE_DELAY);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [listName, items, reminderEnabled, reminderDate, list, id, updateList, setReminder]);

  useEffect(() => {
    // Load list data
    // ...
    
    // Check if there's a reminder for this list
    // This is a placeholder - replace with your actual reminder loading logic
    const loadReminder = async () => {
      try {
        // Example: const savedReminder = await AsyncStorage.getItem(`reminder_${id}`);
        // if (savedReminder) {
        //   setReminderDate(new Date(savedReminder));
        // }
        
        // For demo purposes:
        const demoReminder = new Date();
        demoReminder.setHours(demoReminder.getHours() + 24); // Tomorrow
        setReminderDate(demoReminder);
      } catch (error) {
        console.error('Failed to load reminder:', error);
      }
    };
    
    loadReminder();
  }, [id]);

  const formatReminderTime = (date: Date) => {
    const now = new Date();
    const isToday = date.getDate() === now.getDate() && 
                   date.getMonth() === now.getMonth() && 
                   date.getFullYear() === now.getFullYear();
    
    if (isToday) {
      return `Today at ${format(date, 'h:mm a')}`;
    }
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.getDate() === tomorrow.getDate() && 
                       date.getMonth() === tomorrow.getMonth() && 
                       date.getFullYear() === tomorrow.getFullYear();
    
    if (isTomorrow) {
      return `Tomorrow at ${format(date, 'h:mm a')}`;
    }
    
    return format(date, 'MMM d, yyyy \'at\' h:mm a');
  };

  const handleDeleteReminder = async () => {
    try {
      // Delete the reminder
      // Example: await AsyncStorage.removeItem(`reminder_${id}`);
      setReminderDate(null);
      setShowReminderBadge(false);
      
      // Cancel any scheduled notifications
      // Example: await Notifications.cancelScheduledNotificationAsync(`reminder_${id}`);
      
      // Show confirmation
      Alert.alert('Reminder deleted');
    } catch (error) {
      console.error('Failed to delete reminder:', error);
    }
  };

  const handleBack = useCallback(() => {
    if (hasUnsavedChanges.current) {
      Alert.alert(
        'Unsaved Changes',
        'Your changes are being saved. Do you want to wait?',
        [
          {
            text: 'Wait',
            style: 'cancel'
          },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => router.back()
          }
        ]
      );
    } else {
      router.back();
    }
  }, [router]);

  if (!list) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={64} color="#E17055" />
        <Text style={styles.errorTitle}>List Not Found</Text>
        <Text style={styles.errorText}>
          The shopping list you're looking for doesn't exist or has been deleted.
        </Text>
        <Pressable 
          style={styles.errorButton}
          onPress={() => router.back()}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const completedItems = items.filter(item => item.purchased).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable
            style={styles.backButton}
            onPress={handleBack}>
            <MaterialIcons name="arrow-back" size={24} color="#000000" />
          </Pressable>
          <Text style={styles.title}>Edit List</Text>
          <View style={styles.headerActions}>
            <Pressable
              style={styles.shareButton}
              onPress={() => {}}>
              <MaterialIcons name="share" size={24} color="#0B4A3F" />
            </Pressable>
          </View>
        </View>
        
        <View style={styles.nameEditor}>
          <TextInput
            style={styles.nameInput}
            value={listName}
            onChangeText={setListName}
            placeholder="List name..."
            placeholderTextColor="#666666"
          />
        </View>
        
        <Animated.View 
          style={[
            styles.titleReminderContainer,
            !reminderDate && styles.titleReminderContainerDisabled
          ]}
          entering={FadeIn.duration(300)}
        >
          <MaterialCommunityIcons 
            name={reminderDate ? "bell-ring" : "bell-off"} 
            size={16} 
            color={reminderDate ? "#0B4A3F" : "#666666"} 
          />
          <Text style={[
            styles.titleReminderText,
            !reminderDate && styles.titleReminderTextDisabled
          ]}>
            {reminderDate 
              ? `Reminder: ${format(reminderDate, 'EEE, MMM d h:mm a')}` 
              : "No reminder set"}
          </Text>
          {reminderDate && (
            <Pressable 
              style={styles.titleReminderDeleteButton}
              onPress={handleDeleteReminder}
            >
              <MaterialCommunityIcons name="close" size={14} color="#666666" />
            </Pressable>
          )}
        </Animated.View>
      </View>

      <View style={styles.progress}>
        <Text style={styles.progressText}>
          {completedItems} of {items.length} items completed
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${items.length ? (completedItems / items.length) * 100 : 0}%` }
            ]} 
          />
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View entering={SlideInRight.delay(index * 50)}>
            <ListItem
              item={item}
              onToggle={() => handleToggleItem(item.id)}
              onDelete={() => handleDeleteItem(item.id)}
              onUndoDelete={() => handleUndoDelete(item.id)}
            />
          </Animated.View>
        )}
      />

      <FloatingReminderButton 
        enabled={reminderEnabled}
        date={reminderDate}
        onPress={handleReminderPress}
      />

      <SimpleDatePicker
        visible={showDatePicker}
        date={reminderDate}
        onDateChange={handleReminderChange}
        onClose={() => setShowDatePicker(false)}
      />
    </View>
  );
}