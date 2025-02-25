import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Reminder {
  date: string;
  enabled: boolean;
}

interface Item {
  id: string;
  name: string;
  image: string;
  urgent?: boolean;
  quantity: number;
  unit: string;
  purchased?: boolean;
}

interface List {
  id: string;
  name: string;
  date: string;
  items: Item[];
  reminder?: Reminder;
}

interface ShoppingStore {
  basket: Item[];
  hiddenItems: string[];
  urgentItems: string[];
  pastLists: List[];
  currentListName: string | null;
  lastArchivedList: List | null;
  addToBasket: (item: Omit<Item, 'quantity' | 'unit'>, quantity?: number, unit?: string) => void;
  removeFromBasket: (id: string) => void;
  hideItem: (id: string) => void;
  markUrgent: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateUnit: (id: string, unit: string) => void;
  togglePurchased: (id: string) => void;
  archiveCurrentList: () => void;
  undoArchive: () => void;
  createNewList: (name: string, items: { name: string; quantity: number }[]) => void;
  updateList: (id: string, updatedList: List) => void;
  deletePastList: (id: string) => void;
  setReminder: (listId: string, reminder: Reminder | undefined) => void;
}

export const useShoppingStore = create<ShoppingStore>()(
  persist(
    (set) => ({
      basket: [],
      hiddenItems: [],
      urgentItems: [],
      pastLists: [],
      currentListName: null,
      lastArchivedList: null,
      addToBasket: (item, quantity = 1, unit = 'pc') =>
        set((state) => ({
          basket: [...state.basket, { ...item, quantity, unit }],
        })),
      removeFromBasket: (id) =>
        set((state) => ({
          basket: state.basket.filter((item) => item.id !== id),
        })),
      hideItem: (id) =>
        set((state) => ({
          hiddenItems: [...state.hiddenItems, id],
        })),
      markUrgent: (id) =>
        set((state) => ({
          urgentItems: [...state.urgentItems, id],
          basket: state.basket.map((item) =>
            item.id === id ? { ...item, urgent: true } : item
          ),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          basket: state.basket.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        })),
      updateUnit: (id, unit) =>
        set((state) => ({
          basket: state.basket.map((item) =>
            item.id === id ? { ...item, unit } : item
          ),
        })),
      togglePurchased: (id) =>
        set((state) => ({
          basket: state.basket.map((item) =>
            item.id === id ? { ...item, purchased: !item.purchased } : item
          ),
        })),
      archiveCurrentList: () =>
        set((state) => {
          if (state.basket.length === 0) return state;

          const newList = {
            id: Date.now().toString(),
            name: state.currentListName || `List - ${new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: '2-digit',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}`,
            date: new Date().toISOString(),
            items: state.basket,
          };

          return {
            basket: [],
            currentListName: null,
            lastArchivedList: newList,
            pastLists: [newList, ...state.pastLists],
          };
        }),
      undoArchive: () =>
        set((state) => {
          if (!state.lastArchivedList) return state;
          
          return {
            basket: state.lastArchivedList.items,
            currentListName: state.lastArchivedList.name,
            lastArchivedList: null,
            pastLists: state.pastLists.filter(list => list.id !== state.lastArchivedList?.id),
          };
        }),
      createNewList: (name, items) =>
        set((state) => {
          const newList = {
            id: Date.now().toString(),
            name,
            date: new Date().toISOString(),
            items: items.map((item) => ({
              id: Math.random().toString(36).substr(2, 9),
              name: item.name,
              quantity: item.quantity,
              unit: 'pc',
              image: '',
            })),
          };

          return {
            pastLists: [newList, ...state.pastLists],
          };
        }),
      updateList: (id, updatedList) =>
        set((state) => ({
          pastLists: state.pastLists.map(list =>
            list.id === id ? updatedList : list
          ),
        })),
      deletePastList: (id) =>
        set((state) => ({
          pastLists: state.pastLists.filter(list => list.id !== id),
        })),
      setReminder: (listId, reminder) =>
        set((state) => ({
          pastLists: state.pastLists.map(list =>
            list.id === listId ? { ...list, reminder } : list
          ),
        })),
    }),
    {
      name: 'shopping-store',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);