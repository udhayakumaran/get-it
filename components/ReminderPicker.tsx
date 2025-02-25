import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import DatePicker from 'react-native-date-picker';

interface ReminderPickerProps {
  enabled: boolean;
  date: Date | null;
  onToggle: () => void;
  onDateChange: (date: Date) => void;
}

export function ReminderPicker({
  enabled,
  date,
  onToggle,
  onDateChange,
}: ReminderPickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reminder</Text>
        <Pressable
          style={[styles.toggle, enabled && styles.toggleEnabled]}
          onPress={onToggle}>
          <View style={[styles.toggleHandle, enabled && styles.toggleHandleEnabled]} />
        </Pressable>
      </View>

      {enabled && (
        <Animated.View 
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.content}>
          <Pressable
            style={styles.dateButton}
            onPress={() => setShowPicker(true)}>
            <Ionicons name="calendar" size={20} color="#0B4A3F" />
            <Text style={styles.dateText}>
              {date ? formatDate(date) : 'Select date and time'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#0B4A3F" />
          </Pressable>

          {Platform.OS !== 'web' && (
            <DatePicker
              modal
              open={showPicker}
              date={date || new Date()}
              onConfirm={(date) => {
                setShowPicker(false);
                onDateChange(date);
              }}
              onCancel={() => {
                setShowPicker(false);
              }}
              minimumDate={new Date()}
              mode="datetime"
              theme="light"
              title="Select Reminder Date & Time"
              confirmText="Set Reminder"
              cancelText="Cancel"
            />
          )}

          {Platform.OS === 'web' && showPicker && (
            <View style={styles.pickerContainer}>
              <input
                type="datetime-local"
                style={{
                  fontSize: '16px',
                  padding: '8px',
                  border: '1px solid #E8E8E8',
                  borderRadius: '8px',
                  color: '#0B4A3F',
                  width: '100%',
                  outline: 'none',
                }}
                value={date?.toISOString().slice(0, 16) || ''}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  if (!isNaN(newDate.getTime())) {
                    onDateChange(newDate);
                    setShowPicker(false);
                  }
                }}
                onBlur={() => setShowPicker(false)}
              />
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E8E8E8',
    padding: 2,
  },
  toggleEnabled: {
    backgroundColor: '#40916C',
  },
  toggleHandle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toggleHandleEnabled: {
    transform: [{ translateX: 20 }],
  },
  content: {
    marginTop: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#0B4A3F',
  },
  pickerContainer: {
    marginTop: 8,
  },
});