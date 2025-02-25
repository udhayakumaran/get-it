import React from 'react';
import { View, Text, StyleSheet, Platform, Pressable, Alert, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useShoppingStore } from '../../store/shoppingStore';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function PastListDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { pastLists, addToBasket, deletePastList } = useShoppingStore();
  const list = pastLists.find(list => list.id === id);

  const handleShare = async () => {
    if (!list) return;

    const items = list.items
      .map(item => `${item.name} - ${item.quantity} ${item.unit}`)
      .join('\n');

    const message = `${list.name}\n\n${items}`;

    try {
      await Share.share({
        message,
        title: list.name,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteList = () => {
    Alert.alert(
      "Delete List",
      "Are you sure you want to delete this list? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deletePastList(id);
            router.back();
          }
        }
      ]
    );
  };

  if (!list) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={64} color="#E17055" />
          <Text style={styles.emptyStateTitle}>List not found</Text>
          <Text style={styles.emptyStateText}>
            This shopping list may have been deleted or doesn't exist
          </Text>
          <Pressable 
            style={styles.backButton}
            onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const handleAddToBasket = (item: typeof list.items[0]) => {
    addToBasket({
      id: item.id,
      name: item.name,
      image: '',
      urgent: item.urgent
    }, item.quantity, item.unit);
  };

  const handleAddAllToBasket = () => {
    list.items.forEach(item => handleAddToBasket(item));
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{list.name}</Text>
        <View style={styles.headerActions}>
          <Pressable 
            style={styles.shareButton}
            onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#0B4A3F" />
          </Pressable>
          <Pressable 
            style={styles.deleteButton}
            onPress={handleDeleteList}>
            <Ionicons name="trash-outline" size={24} color="#E17055" />
          </Pressable>
        </View>
      </View>

      <FlashList
        data={list.items}
        estimatedItemSize={80}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <AnimatedPressable
            entering={FadeIn.delay(index * 100)}
            style={styles.item}>
            <View style={styles.itemContent}>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={styles.quantityContainer}>
                <Text style={styles.quantity}>
                  {item.quantity} {item.unit}
                </Text>
                <Pressable
                  style={styles.addButton}
                  onPress={() => handleAddToBasket(item)}>
                  <View style={styles.addButtonContent}>
                    <Ionicons name="basket" size={20} color="#FFFFFF" />
                    <Ionicons 
                      name="add" 
                      size={16} 
                      color="#FFFFFF"
                      style={styles.plusIcon}
                    />
                  </View>
                </Pressable>
              </View>
            </View>
            {item.urgent && (
              <View style={styles.urgentBadge}>
                <Ionicons name="flash" size={16} color="#FFFFFF" />
                <Text style={styles.urgentText}>Urgent</Text>
              </View>
            )}
          </AnimatedPressable>
        )}
      />

      <View style={styles.footer}>
        <Pressable 
          style={styles.actionButton}
          onPress={handleAddAllToBasket}>
          <Text style={styles.actionButtonText}>Add All to Current List</Text>
          <View style={styles.actionButtonIcon}>
            <Ionicons name="basket" size={24} color="#FFFFFF" />
            <Ionicons 
              name="add" 
              size={16} 
              color="#FFFFFF"
              style={styles.plusIcon}
            />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F3F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
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
    color: '#E17055',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#0B4A3F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantity: {
    fontSize: 16,
    color: '#40916C',
  },
  addButton: {
    backgroundColor: '#0B4A3F',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonContent: {
    position: 'relative',
  },
  plusIcon: {
    position: 'absolute',
    right: -8,
    top: -8,
    backgroundColor: '#0B4A3F',
    borderRadius: 8,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E17055',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  urgentText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  actionButton: {
    backgroundColor: '#0B4A3F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  actionButtonIcon: {
    position: 'relative',
  },
});