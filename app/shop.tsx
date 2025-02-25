import React, { useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Platform, TextInput, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useShoppingStore } from '../store/shoppingStore';
import { SwipeableCard } from '../components/SwipeableCard';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

// Realistic sample data with Unsplash images
const ITEMS = {
  '1': [ // Snacks
    { id: 's1', name: 'Mixed Nuts', type: 'solid', image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32' },
    { id: 's2', name: 'Potato Chips', type: 'solid', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b' },
    { id: 's3', name: 'Dark Chocolate', type: 'solid', image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52' },
    { id: 's4', name: 'Trail Mix', type: 'solid', image: 'https://images.unsplash.com/photo-1594489428504-5c0c480a15fd' },
    { id: 's5', name: 'Popcorn', type: 'solid', image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f' },
    { id: 's6', name: 'Pretzels', type: 'solid', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087' },
    { id: 's7', name: 'Dried Fruit', type: 'solid', image: 'https://images.unsplash.com/photo-1596567595142-e9b1656e7cd8' },
    { id: 's8', name: 'Granola Bars', type: 'count', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087' },
    { id: 's9', name: 'Rice Cakes', type: 'count', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35' },
    { id: 's10', name: 'Crackers', type: 'solid', image: 'https://images.unsplash.com/photo-1590507621108-433608c97823' },
  ],
  '2': [ // Breakfast
    { id: 'b1', name: 'Oatmeal', type: 'solid', image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf' },
    { id: 'b2', name: 'Cereal', type: 'solid', image: 'https://images.unsplash.com/photo-1521483451569-e33803c0330c' },
    { id: 'b3', name: 'Pancake Mix', type: 'solid', image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93' },
    { id: 'b4', name: 'Maple Syrup', type: 'liquid', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc' },
    { id: 'b5', name: 'Eggs', type: 'count', image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03' },
    { id: 'b6', name: 'Bread', type: 'count', image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73' },
    { id: 'b7', name: 'Bagels', type: 'count', image: 'https://images.unsplash.com/photo-1585445490387-f47934b73b54' },
    { id: 'b8', name: 'Yogurt', type: 'count', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b' },
    { id: 'b9', name: 'Fresh Berries', type: 'solid', image: 'https://images.unsplash.com/photo-1563583991746-a3b85a56b697' },
    { id: 'b10', name: 'Jam', type: 'solid', image: 'https://images.unsplash.com/photo-1622484211817-4f764a6f72c9' },
  ],
  '3': [ // Drinks
    { id: 'd1', name: 'Orange Juice', type: 'liquid', image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423' },
    { id: 'd2', name: 'Milk', type: 'liquid', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150' },
    { id: 'd3', name: 'Sparkling Water', type: 'liquid', image: 'https://images.unsplash.com/photo-1598343175492-9e7dc0e63cc6' },
    { id: 'd4', name: 'Green Tea', type: 'count', image: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5' },
    { id: 'd5', name: 'Lemonade', type: 'liquid', image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859' },
    { id: 'd6', name: 'Coconut Water', type: 'liquid', image: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054' },
    { id: 'd7', name: 'Apple Juice', type: 'liquid', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba' },
    { id: 'd8', name: 'Iced Tea', type: 'liquid', image: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87' },
    { id: 'd9', name: 'Smoothies', type: 'liquid', image: 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82' },
    { id: 'd10', name: 'Energy Drinks', type: 'count', image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3' },
  ],
  '4': [ // Coffee
    { id: 'c1', name: 'Coffee Beans', type: 'solid', image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e' },
    { id: 'c2', name: 'Ground Coffee', type: 'solid', image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0' },
    { id: 'c3', name: 'Espresso Pods', type: 'count', image: 'https://images.unsplash.com/photo-1610889556528-9a770e32642f' },
    { id: 'c4', name: 'Coffee Filters', type: 'count', image: 'https://images.unsplash.com/photo-1622465413095-2d3ffa4b7e0f' },
    { id: 'c5', name: 'Instant Coffee', type: 'solid', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735' },
    { id: 'c6', name: 'Cold Brew', type: 'liquid', image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5' },
    { id: 'c7', name: 'Coffee Creamer', type: 'liquid', image: 'https://images.unsplash.com/photo-1587578855906-7d581eee6d8e' },
    { id: 'c8', name: 'Sugar Packets', type: 'count', image: 'https://images.unsplash.com/photo-1581097543550-b3cbe2e6ca4a' },
    { id: 'c9', name: 'Sweetener', type: 'count', image: 'https://images.unsplash.com/photo-1581097543550-b3cbe2e6ca4a' },
    { id: 'c10', name: 'Coffee Syrup', type: 'liquid', image: 'https://images.unsplash.com/photo-1622465413094-73e7b47358c5' },
  ],
  '5': [ // Fruits
    { id: 'f1', name: 'Apples', type: 'solid', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6' },
    { id: 'f2', name: 'Bananas', type: 'solid', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e' },
    { id: 'f3', name: 'Oranges', type: 'solid', image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9' },
    { id: 'f4', name: 'Strawberries', type: 'solid', image: 'https://images.unsplash.com/photo-1518635017498-87f514b751ba' },
    { id: 'f5', name: 'Blueberries', type: 'solid', image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e' },
    { id: 'f6', name: 'Grapes', type: 'solid', image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f' },
    { id: 'f7', name: 'Pineapple', type: 'count', image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba' },
    { id: 'f8', name: 'Mango', type: 'count', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078' },
    { id: 'f9', name: 'Kiwi', type: 'count', image: 'https://images.unsplash.com/photo-1585059895289-72c27c12bc3b' },
    { id: 'f10', name: 'Peaches', type: 'solid', image: 'https://images.unsplash.com/photo-1595017013671-ee8217b4ce51' },
  ],
  '6': [ // Vegetables
    { id: 'v1', name: 'Carrots', type: 'solid', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37' },
    { id: 'v2', name: 'Broccoli', type: 'solid', image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc' },
    { id: 'v3', name: 'Spinach', type: 'solid', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb' },
    { id: 'v4', name: 'Tomatoes', type: 'solid', image: 'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2' },
    { id: 'v5', name: 'Bell Peppers', type: 'count', image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83' },
    { id: 'v6', name: 'Cucumber', type: 'count', image: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e' },
    { id: 'v7', name: 'Lettuce', type: 'count', image: 'https://images.unsplash.com/photo-1622205313162-be1d5712a43c' },
    { id: 'v8', name: 'Onions', type: 'solid', image: 'https://images.unsplash.com/photo-1508747703725-719777637510' },
    { id: 'v9', name: 'Potatoes', type: 'solid', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655' },
    { id: 'v10', name: 'Mushrooms', type: 'solid', image: 'https://images.unsplash.com/photo-1504545102780-26774c1bb073' },
  ],
};

export default function ShopScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const [loading, setLoading] = useState(true);
  const [currentItems, setCurrentItems] = useState<typeof ITEMS[keyof typeof ITEMS]>([]);
  const { addToBasket, hideItem, createNewList, currentListName } = useShoppingStore();
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  
  const defaultListName = `List - ${new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })}`;
  
  const [listName, setListName] = useState(defaultListName);

  useEffect(() => {
    if (category && ITEMS[category]) {
      setCurrentItems(ITEMS[category]);
      setLoading(false);
      if (!currentListName) {
        setShowNamePrompt(true);
      }
    }
  }, [category, currentListName]);

  const triggerHaptic = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  const handleCreateList = useCallback(() => {
    createNewList(listName);
    setShowNamePrompt(false);
  }, [createNewList, listName]);

  const handleSwipeLeft = useCallback((id: string) => {
    triggerHaptic();
    hideItem(id);
    setCurrentItems(prev => prev.filter(item => item.id !== id));
  }, [hideItem, triggerHaptic]);

  const handleSwipeRight = useCallback((id: string, quantity: number, unit: string) => {
    triggerHaptic();
    const item = currentItems.find(item => item.id === id);
    if (item) {
      addToBasket(item, quantity, unit);
      setCurrentItems(prev => prev.filter(i => i.id !== id));
    }
  }, [addToBasket, currentItems, triggerHaptic]);

  const handleSwipeUp = useCallback((id: string, quantity: number, unit: string) => {
    triggerHaptic();
    const item = currentItems.find(item => item.id === id);
    if (item) {
      addToBasket({ ...item, urgent: true }, quantity, unit);
      setCurrentItems(prev => prev.filter(i => i.id !== id));
    }
  }, [addToBasket, currentItems, triggerHaptic]);

  const handleBack = useCallback(() => {
    router.replace('/(tabs)');
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable 
          style={styles.backButton} 
          onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.title}>Add Items</Text>
        <View style={{ width: 40 }} />
      </View>

      {showNamePrompt && (
        <View style={styles.namePrompt}>
          <Text style={styles.promptTitle}>Name Your Shopping List</Text>
          <TextInput
            style={styles.nameInput}
            value={listName}
            onChangeText={setListName}
            placeholder={defaultListName}
            placeholderTextColor="#666666"
          />
          <Pressable style={styles.createButton} onPress={handleCreateList}>
            <Text style={styles.createButtonText}>Create List</Text>
          </Pressable>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#0B4A3F" style={styles.loader} />
      ) : currentItems.length > 0 ? (
        <View style={styles.cardContainer}>
          {currentItems.map((item) => (
            <SwipeableCard
              key={item.id}
              item={item}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              onSwipeUp={handleSwipeUp}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No more items to show</Text>
          <Ionicons 
            name="arrow-back"
            size={24}
            color="#0B4A3F"
            style={styles.emptyStateIcon}
          />
          <Text style={styles.emptyStateSubtext}>Go back to categories</Text>
        </View>
      )}

      <View style={styles.instructions}>
        <Text style={styles.instructionText}>👈 Skip</Text>
        <Text style={styles.instructionText}>Add 👉</Text>
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
    backgroundColor: '#0B4A3F',
    paddingTop: Platform.OS === 'web' ? 20 : 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  namePrompt: {
    position: 'absolute',
    top: '30%',
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0B4A3F',
    marginBottom: 16,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#E8F3F1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#0B4A3F',
  },
  createButton: {
    backgroundColor: '#0B4A3F',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    flex: 1,
  },
  instructions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  instructionText: {
    color: '#0B4A3F',
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    color: '#0B4A3F',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  emptyStateSubtext: {
    color: '#40916C',
    fontSize: 16,
    marginTop: 8,
  },
  emptyStateIcon: {
    marginTop: 16,
    marginBottom: 8,
  },
});