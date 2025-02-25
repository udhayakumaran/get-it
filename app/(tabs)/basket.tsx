import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Platform, Pressable, Share } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useShoppingStore } from '../../store/shoppingStore';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInUp, SlideOutDown } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function BasketScreen() {
  const { 
    basket, 
    removeFromBasket, 
    updateQuantity, 
    togglePurchased, 
    archiveCurrentList,
    lastArchivedList,
    undoArchive,
    currentListName
  } = useShoppingStore();

  const handleShare = async () => {
    if (basket.length === 0) return;

    const listTitle = currentListName || 'Shopping List';
    const items = basket
      .map(item => `${item.name} - ${item.quantity} ${item.unit}`)
      .join('\n');

    const message = `${listTitle}\n\n${items}`;

    try {
      await Share.share({
        message,
        title: listTitle,
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (lastArchivedList) {
      const timer = setTimeout(() => {
        useShoppingStore.setState({ lastArchivedList: null });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [lastArchivedList]);

  const handleQuantityChange = (id: string, delta: number) => {
    const item = basket.find(item => item.id === id);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + delta);
      updateQuantity(id, newQuantity);
    }
  };

  if (basket.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Shopping List</Text>
          <View style={styles.headerInfo}>
            <Text style={styles.estimatedTotal}>0 items</Text>
          </View>
        </View>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>0</Text>
            </View>
          </View>
          <Text style={styles.emptyStateTitle}>Your basket is empty</Text>
          <Text style={styles.emptyStateText}>
            Start adding items by browsing categories
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable 
            style={styles.shareButton}
            onPress={handleShare}>
            <Ionicons name="share-social-outline" size={24} color="#0B4A3F" />
          </Pressable>
          <Text style={styles.title}>Shopping List</Text>
          <View style={{ width: 40 }} />
        </View>
        {currentListName && (
          <Text style={styles.subtitle}>{currentListName}</Text>
        )}
        <Text style={styles.itemCount}>{basket.length} items</Text>
      </View>
      
      <FlashList
        data={basket}
        estimatedItemSize={100}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <AnimatedPressable
            entering={FadeIn.delay(50 * index)}
            style={[styles.item, item.purchased && styles.purchasedItem]}>
            <Pressable
              style={styles.checkbox}
              onPress={() => togglePurchased(item.id)}>
              <View style={[styles.checkboxInner, item.purchased && styles.checkboxChecked]}>
                {item.purchased && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
            </Pressable>
            <View style={styles.itemContent}>
              <View style={styles.itemHeader}>
                <Text style={[
                  styles.itemName,
                  item.purchased && styles.purchasedText
                ]}>
                  {item.name}
                </Text>
                {item === basket[basket.length - 1] && (
                  <Text style={styles.lastAdded}>Last added</Text>
                )}
              </View>
              <View style={styles.itemQuantityContainer}>
                <Pressable
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(item.id, -1)}>
                  <Ionicons name="remove" size={20} color="#0B4A3F" />
                </Pressable>
                <Text style={styles.itemQuantity}>
                  {item.quantity} {item.unit}
                </Text>
                <Pressable
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(item.id, 1)}>
                  <Ionicons name="add" size={20} color="#0B4A3F" />
                </Pressable>
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => removeFromBasket(item.id)}>
                  <Ionicons name="trash-outline" size={20} color="#E17055" />
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

      {lastArchivedList && (
        <Animated.View 
          style={styles.undoContainer}
          entering={SlideInUp}
          exiting={SlideOutDown}>
          <Text style={styles.undoText}>List archived</Text>
          <Pressable 
            style={styles.undoButton}
            onPress={undoArchive}>
            <Text style={styles.undoButtonText}>Undo</Text>
          </Pressable>
        </Animated.View>
      )}

      {basket.length > 0 && (
        <View style={styles.footer}>
          <Pressable 
            style={styles.checkoutButton}
            onPress={archiveCurrentList}>
            <Text style={styles.checkoutButtonText}>Archive List</Text>
          </Pressable>
        </View>
      )}
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
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F3F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  itemCount: {
    fontSize: 16,
    color: '#666666',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyIconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 64,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#E8F3F1',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#0B4A3F',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  listContent: {
    padding: 16,
  },
  separator: {
    height: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    gap: 12,
  },
  purchasedItem: {
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0B4A3F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0B4A3F',
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  lastAdded: {
    fontSize: 12,
    color: '#40916C',
    fontStyle: 'italic',
  },
  purchasedText: {
    textDecorationLine: 'line-through',
    color: '#666666',
  },
  itemQuantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemQuantity: {
    fontSize: 16,
    color: '#40916C',
    minWidth: 50,
    textAlign: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F3F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
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
  undoContainer: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: '#0B4A3F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  undoText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  undoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  undoButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  checkoutButton: {
    backgroundColor: '#B4E33D',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
  },
});