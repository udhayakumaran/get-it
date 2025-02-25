import React from 'react';
import { StyleSheet, View, Text, Platform, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useShoppingStore } from '../../store/shoppingStore';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HistoryScreen() {
  const router = useRouter();
  const { pastLists } = useShoppingStore();

  const handleListPress = (id: string) => {
    router.push(`/past-list/${id}`);
  };

  if (pastLists.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Past Lists</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="time" size={64} color="#0B4A3F" />
          <Text style={styles.emptyStateTitle}>No past lists yet</Text>
          <Text style={styles.emptyStateText}>
            Your archived shopping lists will appear here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Past Lists</Text>
      </View>
      
      <FlashList
        data={pastLists}
        estimatedItemSize={100}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <AnimatedPressable
            entering={FadeIn.delay(index * 100)}
            style={styles.listItem}
            onPress={() => handleListPress(item.id)}>
            <View style={styles.listHeader}>
              <Text style={styles.listName}>{item.name}</Text>
              <Text style={styles.itemCount}>
                {item.items.length} items
              </Text>
            </View>
            <View style={styles.itemsList}>
              {item.items.slice(0, 3).map((listItem, index) => (
                <View key={index} style={styles.itemChip}>
                  <Text style={styles.itemText}>
                    {listItem.quantity} {listItem.unit} {listItem.name}
                  </Text>
                </View>
              ))}
              {item.items.length > 3 && (
                <View style={styles.moreChip}>
                  <Text style={styles.moreText}>
                    +{item.items.length - 3} more
                  </Text>
                </View>
              )}
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#0B4A3F"
              style={styles.arrow}
            />
          </AnimatedPressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingTop: Platform.OS === 'web' ? 20 : 60,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000000',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0B4A3F',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#40916C',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  listItem: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  itemCount: {
    fontSize: 14,
    color: '#666666',
  },
  itemsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemChip: {
    backgroundColor: '#E8F3F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  itemText: {
    color: '#0B4A3F',
    fontSize: 14,
    fontWeight: '500',
  },
  moreChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  moreText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
  },
  arrow: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
});