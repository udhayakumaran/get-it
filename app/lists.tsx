import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Pressable,
  Alert,
  Share,
  SectionList,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  SlideInRight,
} from 'react-native-reanimated';

import { useShoppingStore } from '../store/shoppingStore';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function EmptyState({ onCreateList }: { onCreateList: () => void }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="list" size={64} color="#0B4A3F" />
      <Text style={styles.emptyTitle}>No shopping lists yet</Text>
      <Text style={styles.emptyText}>
        Create your first list to get started
      </Text>
      <Pressable 
        style={styles.createButton}
        onPress={onCreateList}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.createButtonText}>Create New List</Text>
      </Pressable>
    </View>
  );
}

function ReminderIndicator({ date }: { date: string }) {
  const reminderDate = new Date(date);
  const now = new Date();
  const isPast = reminderDate < now;

  // Format the date nicely
  const formattedDate = reminderDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <View style={[styles.reminderIndicator, isPast && styles.pastReminder]}>
      <Ionicons 
        name="notifications" 
        size={14} 
        color={isPast ? '#666666' : '#0B4A3F'} 
      />
      <Text style={[
        styles.reminderText,
        isPast && styles.pastReminderText
      ]}>
        {isPast ? 'Due ' : 'Reminder: '}{formattedDate}
      </Text>
    </View>
  );
}

function ListItem({ 
  item, 
  onPress, 
  onDelete, 
  onShare 
}: {
  item: {
    id: string;
    name: string;
    items: any[];
    date: string;
    reminder?: {
      date: string;
      enabled: boolean;
    };
  };
  onPress: () => void;
  onDelete: () => void;
  onShare: () => void;
}) {
  const completedItems = item.items.filter(i => i.purchased).length;
  const progress = (completedItems / item.items.length) * 100;

  return (
    <Pressable 
      style={styles.listItem}
      onPress={onPress}>
      <View style={styles.listHeader}>
        <Text style={styles.listName}>{item.name}</Text>
        <Text style={styles.itemCount}>
          {completedItems}/{item.items.length} items
        </Text>
      </View>

      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill,
            { width: `${progress}%` }
          ]} 
        />
      </View>

      {item.reminder?.enabled && (
        <ReminderIndicator date={item.reminder.date} />
      )}

      <View style={styles.previewContainer}>
        {item.items.slice(0, 3).map((listItem, index) => (
          <Text 
            key={listItem.id}
            style={[
              styles.previewItem,
              listItem.purchased && styles.completedItem
            ]}
            numberOfLines={1}>
            {listItem.name}
          </Text>
        ))}
        {item.items.length > 3 && (
          <Text style={styles.moreItems}>
            +{item.items.length - 3} more
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        <Pressable 
          style={styles.actionButton}
          onPress={onShare}>
          <Ionicons name="share-outline" size={20} color="#0B4A3F" />
        </Pressable>
        <Pressable 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={onDelete}>
          <Ionicons name="trash-outline" size={20} color="#E17055" />
        </Pressable>
      </View>
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function ListsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { pastLists, deletePastList } = useShoppingStore();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sections = useMemo(() => {
    if (pastLists.length === 0) return [];

    const grouped = pastLists.reduce((acc, list) => {
      const date = new Date(list.date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let title = '';
      if (date.toDateString() === today.toDateString()) {
        title = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        title = 'Yesterday';
      } else {
        title = date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      }

      if (!acc[title]) {
        acc[title] = [];
      }
      acc[title].push(list);
      return acc;
    }, {} as Record<string, typeof pastLists>);

    return Object.entries(grouped)
      .map(([title, data]) => ({ title, data }))
      .sort((a, b) => {
        if (a.title === 'Today') return -1;
        if (b.title === 'Today') return 1;
        if (a.title === 'Yesterday') return -1;
        if (b.title === 'Yesterday') return 1;
        return sortOrder === 'desc' ? 
          new Date(b.data[0].date).getTime() - new Date(a.data[0].date).getTime() :
          new Date(a.data[0].date).getTime() - new Date(b.data[0].date).getTime();
      });
  }, [pastLists, sortOrder]);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      router.replace('/(tabs)');
    }
  }, [navigation, router]);

  const handleCreateList = useCallback(() => {
    router.push('/create-list');
  }, [router]);

  const handleDeleteList = useCallback((id: string) => {
    Alert.alert(
      'Delete List',
      'Are you sure you want to delete this list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePastList(id),
        },
      ]
    );
  }, [deletePastList]);

  const handleShareList = useCallback(async (list: typeof pastLists[0]) => {
    if (!list || list.items.length === 0) return;

    try {
      const completedItems = list.items.filter(item => item.purchased).length;
      const progress = `${completedItems} of ${list.items.length} items completed`;
      
      const message = `Shopping List: ${list.name}\n\n${list.items
        .map(item => `${item.name} - ${item.quantity} ${item.unit}${item.purchased ? ' ✓' : ''}`)
        .join('\n')}\n\n${progress}`;

      const result = await Share.share({
        message,
        title: list.name,
      }, {
        dialogTitle: `Share ${list.name}`,
      });

      if (result.action === Share.sharedAction) {
        console.log('Shared successfully');
      }
    } catch (error) {
      console.error('Error sharing list:', error);
      Alert.alert(
        'Sharing Failed',
        'Unable to share the list at this time. Please try again.'
      );
    }
  }, []);

  const renderItem = useCallback(({ item, index }: { item: typeof pastLists[0], index: number }) => (
    <Animated.View entering={SlideInRight.delay(index * 100)}>
      <ListItem
        item={item}
        onPress={() => router.push(`/edit-list/${item.id}`)}
        onDelete={() => handleDeleteList(item.id)}
        onShare={() => handleShareList(item)}
      />
    </Animated.View>
  ), [router, handleDeleteList, handleShareList]);

  const renderSectionHeader = useCallback(({ section: { title } }: { section: { title: string } }) => (
    <SectionHeader title={title} />
  ), []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </Pressable>
        <Text style={styles.title}>Shopping Lists</Text>
        <Pressable
          style={styles.sortButton}
          onPress={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
          <Ionicons
            name={sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'}
            size={24}
            color="#0B4A3F"
          />
        </Pressable>
      </View>

      {pastLists.length === 0 ? (
        <EmptyState onCreateList={handleCreateList} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={renderSectionHeader}
          renderItem={renderItem}
        />
      )}

      <AnimatedPressable
        style={styles.fab}
        onPress={handleCreateList}
        entering={FadeIn.delay(300)}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </AnimatedPressable>
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
  sortButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F3F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 12,
    marginTop: 24,
  },
  listItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
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
  progressBar: {
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#40916C',
    borderRadius: 2,
  },
  previewContainer: {
    marginBottom: 16,
  },
  previewItem: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 4,
  },
  completedItem: {
    textDecorationLine: 'line-through',
    color: '#666666',
  },
  moreItems: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: '#FFE5E5',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0B4A3F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0B4A3F',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B4A3F',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  reminderIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F3F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
    alignSelf: 'flex-start',
    gap: 6,
  },
  pastReminder: {
    backgroundColor: '#F0F0F0',
  },
  reminderText: {
    fontSize: 12,
    color: '#0B4A3F',
    fontWeight: '500',
  },
  pastReminderText: {
    color: '#666666',
  },
});