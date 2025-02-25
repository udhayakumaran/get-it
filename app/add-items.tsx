import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  SlideInRight,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useShoppingStore } from '../store/shoppingStore';

const CATEGORIES = [
  {
    id: 'dairy',
    name: 'Dairy',
    icon: '🥛',
    items: ['Milk', 'Cheese', 'Yogurt', 'Butter', 'Cream', 'Eggs'],
  },
  {
    id: 'produce',
    name: 'Produce',
    icon: '🥬',
    items: ['Apples', 'Bananas', 'Potatoes', 'Onions', 'Tomatoes', 'Lettuce'],
  },
  {
    id: 'snacks',
    name: 'Snacks',
    icon: '🍪',
    items: ['Chips', 'Cookies', 'Nuts', 'Popcorn', 'Crackers', 'Pretzels'],
  },
  {
    id: 'beverages',
    name: 'Beverages',
    icon: '🥤',
    items: ['Juice', 'Soda', 'Coffee', 'Tea', 'Water', 'Energy Drinks'],
  },
  {
    id: 'household',
    name: 'Household',
    icon: '🧻',
    items: ['Toilet Paper', 'Detergent', 'Soap', 'Paper Towels', 'Trash Bags'],
  },
];

const COMMON_ITEMS = [
  'Milk', 'Bread', 'Eggs', 'Cheese', 'Chicken', 'Rice',
  'Pasta', 'Tomatoes', 'Onions', 'Potatoes', 'Apples', 'Bananas',
];

type TabType = 'search' | 'categories';

export default function AddItemsScreen() {
  const router = useRouter();
  const { listName } = useLocalSearchParams<{ listName: string }>();
  const { createNewList } = useShoppingStore();
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<{ name: string; quantity: number }[]>([]);

  const filteredItems = searchQuery
    ? COMMON_ITEMS.filter(item => 
        item.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : COMMON_ITEMS;

  const handleBack = useCallback(() => {
    if (selectedItems.length > 0) {
      Alert.alert(
        'Discard Changes?',
        'Are you sure you want to go back? Your items will not be saved.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Discard',
            style: 'destructive',
            onPress: () => router.back()
          },
        ]
      );
    } else {
      router.back();
    }
  }, [selectedItems, router]);

  const handleSave = useCallback(() => {
    if (selectedItems.length === 0) {
      Alert.alert('Error', 'Please add at least one item to your list');
      return;
    }

    createNewList(listName, selectedItems);
    router.replace('/(tabs)');
  }, [listName, selectedItems, createNewList, router]);

  const addItem = useCallback((itemName: string) => {
    setSelectedItems(prev => {
      const exists = prev.find(item => item.name === itemName);
      if (exists) {
        return prev.map(item =>
          item.name === itemName
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { name: itemName, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((itemName: string) => {
    setSelectedItems(prev => prev.filter(item => item.name !== itemName));
  }, []);

  const updateQuantity = useCallback((itemName: string, delta: number) => {
    setSelectedItems(prev => prev.map(item => {
      if (item.name === itemName) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </Pressable>
        <Text style={styles.title}>Add Items</Text>
        <Pressable
          style={styles.saveButton}
          onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'search' && styles.activeTab]}
          onPress={() => setActiveTab('search')}>
          <Ionicons
            name="search"
            size={20}
            color={activeTab === 'search' ? '#0B4A3F' : '#666666'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'search' && styles.activeTabText,
            ]}>
            Search
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'categories' && styles.activeTab]}
          onPress={() => setActiveTab('categories')}>
          <Ionicons
            name="grid"
            size={20}
            color={activeTab === 'categories' ? '#0B4A3F' : '#666666'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'categories' && styles.activeTabText,
            ]}>
            Categories
          </Text>
        </Pressable>
      </View>

      {activeTab === 'search' ? (
        <Animated.View 
          style={styles.searchContainer}
          entering={FadeIn}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#666666" />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search for items..."
              placeholderTextColor="#666666"
            />
          </View>

          <ScrollView style={styles.suggestions}>
            {filteredItems.map((item, index) => (
              <Animated.View
                key={item}
                entering={SlideInRight.delay(index * 50)}>
                <Pressable
                  style={styles.suggestionItem}
                  onPress={() => addItem(item)}>
                  <Text style={styles.suggestionText}>{item}</Text>
                  <Ionicons name="add-circle" size={24} color="#0B4A3F" />
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>
      ) : (
        <Animated.View 
          style={styles.categoriesContainer}
          entering={FadeIn}>
          <ScrollView horizontal style={styles.categoryList}>
            {CATEGORIES.map((category, index) => (
              <Animated.View
                key={category.id}
                entering={FadeInDown.delay(index * 100)}>
                <Pressable
                  style={[
                    styles.categoryCard,
                    selectedCategory === category.id && styles.selectedCategory,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>

          {selectedCategory && (
            <ScrollView style={styles.categoryItems}>
              {CATEGORIES.find(c => c.id === selectedCategory)?.items.map((item, index) => (
                <Animated.View
                  key={item}
                  entering={SlideInRight.delay(index * 50)}>
                  <Pressable
                    style={styles.categoryItem}
                    onPress={() => addItem(item)}>
                    <Text style={styles.categoryItemText}>{item}</Text>
                    <Ionicons name="add-circle" size={24} color="#0B4A3F" />
                  </Pressable>
                </Animated.View>
              ))}
            </ScrollView>
          )}
        </Animated.View>
      )}

      <Animated.View 
        style={styles.selectedItemsContainer}
        entering={FadeInUp}>
        <Text style={styles.selectedItemsTitle}>
          Selected Items ({selectedItems.length})
        </Text>
        
        {selectedItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No items added yet! Use Search or Categories to start building your list.
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.selectedItems}>
            {selectedItems.map((item, index) => (
              <Animated.View
                key={`${item.name}-${index}`}
                entering={SlideInRight.delay(index * 50)}
                style={styles.selectedItem}>
                <Text style={styles.selectedItemText}>{item.name}</Text>
                <View style={styles.quantityContainer}>
                  <Pressable
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.name, -1)}>
                    <Ionicons name="remove" size={20} color="#0B4A3F" />
                  </Pressable>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <Pressable
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.name, 1)}>
                    <Ionicons name="add" size={20} color="#0B4A3F" />
                  </Pressable>
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => removeItem(item.name)}>
                    <Ionicons name="trash-outline" size={20} color="#E17055" />
                  </Pressable>
                </View>
              </Animated.View>
            ))}
          </ScrollView>
        )}
      </Animated.View>
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
    paddingTop: Platform.OS === 'web' ? 20 : 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
    color: '#000000',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#0B4A3F',
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#E8F3F1',
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
  },
  activeTabText: {
    color: '#0B4A3F',
    fontWeight: '600',
  },
  searchContainer: {
    flex: 1,
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#000000',
  },
  suggestions: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 16,
    color: '#000000',
  },
  categoriesContainer: {
    flex: 1,
  },
  categoryList: {
    padding: 16,
  },
  categoryCard: {
    width: 100,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCategory: {
    backgroundColor: '#E8F3F1',
    borderWidth: 2,
    borderColor: '#0B4A3F',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
  },
  categoryItems: {
    flex: 1,
    padding: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryItemText: {
    fontSize: 16,
    color: '#000000',
  },
  selectedItemsContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  selectedItemsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  selectedItems: {
    maxHeight: 200,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F7FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedItemText: {
    fontSize: 16,
    color: '#000000',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0B4A3F',
    minWidth: 24,
    textAlign: 'center',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});