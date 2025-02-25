import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Logo } from '../../components/Logo';
import { useShoppingStore } from '../../store/shoppingStore';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HomeScreen() {
  const router = useRouter();
  const { pastLists } = useShoppingStore();

  const handleCreateList = () => {
    router.push('/create-list');
  };

  const handleViewLists = () => {
    router.push('/lists');
  };

  const handleOpenSettings = () => {
    // TODO: Implement settings screen
    console.log('Open settings');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Logo size={40} />
          <Text style={styles.title}>GetIt</Text>
          <Pressable
            style={styles.settingsButton}
            onPress={handleOpenSettings}>
            <MaterialCommunityIcons name="cog" size={24} color="#0B4A3F" />
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        <AnimatedPressable
          style={styles.createListCard}
          onPress={handleCreateList}
          entering={FadeIn.delay(200)}>
          <View style={styles.createListIcon}>
            <MaterialCommunityIcons name="plus-circle" size={32} color="#0B4A3F" />
          </View>
          <Text style={styles.createListTitle}>Create New List</Text>
          <Text style={styles.createListDescription}>
            Start a new shopping list from scratch
          </Text>
        </AnimatedPressable>

        <AnimatedPressable
          style={styles.viewListsCard}
          onPress={handleViewLists}
          entering={FadeIn.delay(400)}>
          <View style={styles.viewListsContent}>
            <View>
              <Text style={styles.viewListsTitle}>View My Lists</Text>
              <Text style={styles.viewListsDescription}>
                Manage all your shopping lists in one place
              </Text>
              {pastLists.length > 0 && (
                <Text style={styles.listCount}>
                  {pastLists.length} list{pastLists.length !== 1 ? 's' : ''}
                </Text>
              )}
            </View>
            <View style={styles.viewListsIcon}>
              <MaterialCommunityIcons name="format-list-bulleted" size={48} color="#0B4A3F" />
            </View>
          </View>
        </AnimatedPressable>

        {pastLists.length === 0 && (
          <Animated.View 
            style={styles.emptyState}
            entering={FadeIn.delay(600)}>
            <Text style={styles.emptyStateText}>
              No shopping lists yet! Tap 'Create New List' to get started.
            </Text>
          </Animated.View>
        )}
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
    paddingTop: Platform.OS === 'web' ? 20 : 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0B4A3F',
    marginLeft: 12,
    flex: 1,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F3F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  createListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  createListIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F3F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  createListTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0B4A3F',
    marginBottom: 8,
  },
  createListDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  viewListsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  viewListsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewListsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0B4A3F',
    marginBottom: 8,
  },
  viewListsDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  listCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#40916C',
  },
  viewListsIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F3F1',
    alignItems: 'center',
    justifyContent: 'center',
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
});