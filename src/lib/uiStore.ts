import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// UI Store Types
interface UIStore {
  // Date and time selection
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  
  // Filter states
  selectedDentistIds: string[];
  setSelectedDentistIds: (ids: string[]) => void;
  addSelectedDentistId: (id: string) => void;
  removeSelectedDentistId: (id: string) => void;
  clearSelectedDentistIds: () => void;
  
  selectedRoomIds: string[];
  setSelectedRoomIds: (ids: string[]) => void;
  addSelectedRoomId: (id: string) => void;
  removeSelectedRoomId: (id: string) => void;
  clearSelectedRoomIds: () => void;
  
  // Search and filters
  search: string;
  setSearch: (search: string) => void;
  
  showUrgentOnly: boolean;
  setShowUrgentOnly: (show: boolean) => void;
  
  // Audio settings
  soundOn: boolean;
  setSoundOn: (enabled: boolean) => void;
  
  // Queue board layout
  queueBoardLayout: 'byDentist' | 'byRoom';
  setQueueBoardLayout: (layout: 'byDentist' | 'byRoom') => void;
  
  // Kiosk mode
  kioskFullScreen: boolean;
  setKioskFullScreen: (fullScreen: boolean) => void;
  
  // View preferences
  viewMode: 'list' | 'grid' | 'calendar';
  setViewMode: (mode: 'list' | 'grid' | 'calendar') => void;
  
  // Panel states
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  filterPanelOpen: boolean;
  setFilterPanelOpen: (open: boolean) => void;
  
  // Actions
  resetFilters: () => void;
  resetAll: () => void;
}

// Get today's date as default
const getTodayString = () => new Date().toISOString().split('T')[0];

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Date selection
      selectedDate: getTodayString(),
      setSelectedDate: (date) => set({ selectedDate: date }),
      
      // Dentist filters
      selectedDentistIds: [],
      setSelectedDentistIds: (ids) => set({ selectedDentistIds: ids }),
      addSelectedDentistId: (id) => {
        const current = get().selectedDentistIds;
        if (!current.includes(id)) {
          set({ selectedDentistIds: [...current, id] });
        }
      },
      removeSelectedDentistId: (id) => {
        const current = get().selectedDentistIds;
        set({ selectedDentistIds: current.filter(dentistId => dentistId !== id) });
      },
      clearSelectedDentistIds: () => set({ selectedDentistIds: [] }),
      
      // Room filters
      selectedRoomIds: [],
      setSelectedRoomIds: (ids) => set({ selectedRoomIds: ids }),
      addSelectedRoomId: (id) => {
        const current = get().selectedRoomIds;
        if (!current.includes(id)) {
          set({ selectedRoomIds: [...current, id] });
        }
      },
      removeSelectedRoomId: (id) => {
        const current = get().selectedRoomIds;
        set({ selectedRoomIds: current.filter(roomId => roomId !== id) });
      },
      clearSelectedRoomIds: () => set({ selectedRoomIds: [] }),
      
      // Search
      search: '',
      setSearch: (search) => set({ search }),
      
      // Urgent filter
      showUrgentOnly: false,
      setShowUrgentOnly: (show) => set({ showUrgentOnly: show }),
      
      // Audio
      soundOn: true,
      setSoundOn: (enabled) => set({ soundOn: enabled }),
      
      // Layout
      queueBoardLayout: 'byDentist',
      setQueueBoardLayout: (layout) => set({ queueBoardLayout: layout }),
      
      // Kiosk mode
      kioskFullScreen: false,
      setKioskFullScreen: (fullScreen) => set({ kioskFullScreen: fullScreen }),
      
      // View mode
      viewMode: 'list',
      setViewMode: (mode) => set({ viewMode: mode }),
      
      // Panel states
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      
      filterPanelOpen: false,
      setFilterPanelOpen: (open) => set({ filterPanelOpen: open }),
      
      // Reset actions
      resetFilters: () => set({ 
        selectedDentistIds: [],
        selectedRoomIds: [],
        search: '',
        showUrgentOnly: false 
      }),
      
      resetAll: () => set({
        selectedDate: getTodayString(),
        selectedDentistIds: [],
        selectedRoomIds: [],
        search: '',
        showUrgentOnly: false,
        queueBoardLayout: 'byDentist',
        kioskFullScreen: false,
        viewMode: 'list',
        sidebarCollapsed: false,
        filterPanelOpen: false
      }),
    }),
    {
      name: 'wavenet-ui-store',
      // Only persist certain keys
      partialize: (state) => ({
        soundOn: state.soundOn,
        queueBoardLayout: state.queueBoardLayout,
        viewMode: state.viewMode,
        sidebarCollapsed: state.sidebarCollapsed,
        // Note: Don't persist selectedDate, filters, or search to start fresh each session
      }),
    }
  )
);

// Convenience selectors
export const useSelectedFilters = () => {
  const store = useUIStore();
  return {
    dentistIds: store.selectedDentistIds,
    roomIds: store.selectedRoomIds,
    search: store.search,
    showUrgentOnly: store.showUrgentOnly,
    hasActiveFilters: store.selectedDentistIds.length > 0 || 
                     store.selectedRoomIds.length > 0 || 
                     store.search.length > 0 || 
                     store.showUrgentOnly
  };
};

export const useQueueSettings = () => {
  const store = useUIStore();
  return {
    layout: store.queueBoardLayout,
    setLayout: store.setQueueBoardLayout,
    soundOn: store.soundOn,
    setSoundOn: store.setSoundOn,
    fullScreen: store.kioskFullScreen,
    setFullScreen: store.setKioskFullScreen
  };
};

export const useViewSettings = () => {
  const store = useUIStore();
  return {
    viewMode: store.viewMode,
    setViewMode: store.setViewMode,
    sidebarCollapsed: store.sidebarCollapsed,
    setSidebarCollapsed: store.setSidebarCollapsed,
    filterPanelOpen: store.filterPanelOpen,
    setFilterPanelOpen: store.setFilterPanelOpen
  };
};