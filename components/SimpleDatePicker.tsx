import React, { useState } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface SimpleDatePickerProps {
  date: Date | null;
  onDateChange: (date: Date) => void;
  onClose: () => void;
  visible: boolean;
}

export function SimpleDatePicker({ 
  date, 
  onDateChange,
  onClose,
  visible 
}: SimpleDatePickerProps) {
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [tempDate, setTempDate] = useState<Date>(date || new Date());

  if (!visible) return null;

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webOverlay}>
        <View style={styles.webContainer}>
          <input
            type="datetime-local"
            style={{
              fontSize: '16px',
              padding: '12px',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: '#E8E8E8',
              borderRadius: '8px',
              color: '#0B4A3F',
              outlineWidth: 0,
            }}
            min={new Date().toISOString().slice(0, 16)}
            value={date?.toISOString().slice(0, 16) || new Date().toISOString().slice(0, 16)}
            onChange={(e) => {
              const newDate = new Date(e.target.value);
              if (!isNaN(newDate.getTime())) {
                onDateChange(newDate);
                onClose();
              }
            }}
            autoFocus
          />
        </View>
      </View>
    );
  }

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'set' && selectedDate) {
        if (mode === 'date') {
          setTempDate(selectedDate);
          setMode('time');
        } else {
          onDateChange(selectedDate);
          onClose();
        }
      } else if (event.type === 'dismissed') {
        if (mode === 'time') {
          setMode('date');
        } else {
          onClose();
        }
      }
    } else {
      // iOS
      if (selectedDate) {
        onDateChange(selectedDate);
      }
      if (event.type === 'dismissed') {
        onClose();
      }
    }
  };

  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        testID="dateTimePicker"
        value={mode === 'date' ? (date || new Date()) : tempDate}
        mode={mode}
        is24Hour={false}
        onChange={handleChange}
        display="default"
      />
    );
  }

  return (
    <DateTimePicker
      testID="dateTimePicker"
      value={date || new Date()}
      mode="datetime"
      is24Hour={false}
      display="spinner"
      onChange={handleChange}
    />
  );
}

const styles = StyleSheet.create({
  webOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  webContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1001,
  },
});