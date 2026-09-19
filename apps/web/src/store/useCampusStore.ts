import { create } from 'zustand';
import { Resource, Building, CampusTelemetrySummary, SystemHealthStatus, User } from '@campussynapse/shared-types';
import { api } from '../services/api';
import { getSocket } from '../services/socket';

interface CampusState {
  user: User | null;
  resources: Resource[];
  buildings: Building[];
  telemetry: CampusTelemetrySummary | null;
  systemHealth: SystemHealthStatus | null;
  pendingApprovalsCount: number;
  activeBuildingFilter: string | null;
  selectedResource: Resource | null;
  isHealthModalOpen: boolean;
  isDemoModalOpen: boolean;
  toast: { message: string; type: 'info' | 'success' | 'warning' | 'error' } | null;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  setSelectedResource: (resource: Resource | null) => void;
  setActiveBuildingFilter: (buildingId: string | null) => void;
  setHealthModalOpen: (open: boolean) => void;
  setDemoModalOpen: (open: boolean) => void;
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  clearToast: () => void;

  initApp: () => Promise<void>;
  fetchDashboard: () => Promise<void>;
  fetchResources: () => Promise<void>;
}

export const useCampusStore = create<CampusState>((set, get) => ({
  user: {
    id: 'demo-admin-id',
    name: 'Dr. Rajesh Sharma',
    email: 'admin@campussynapse.edu',
    role: 'SUPER_ADMIN',
    department: 'Central Administration',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  },
  resources: [],
  buildings: [],
  telemetry: null,
  systemHealth: null,
  pendingApprovalsCount: 0,
  activeBuildingFilter: null,
  selectedResource: null,
  isHealthModalOpen: false,
  isDemoModalOpen: false,
  toast: null,
  isLoading: false,

  setUser: (user) => set({ user }),
  setSelectedResource: (selectedResource) => set({ selectedResource }),
  setActiveBuildingFilter: (activeBuildingFilter) => set({ activeBuildingFilter }),
  setHealthModalOpen: (isHealthModalOpen) => set({ isHealthModalOpen }),
  setDemoModalOpen: (isDemoModalOpen) => set({ isDemoModalOpen }),
  showToast: (message, type = 'info') => {
    set({ toast: { message, type } });
    setTimeout(() => {
      if (get().toast?.message === message) {
        set({ toast: null });
      }
    }, 4000);
  },
  clearToast: () => set({ toast: null }),

  fetchDashboard: async () => {
    try {
      const data = await api.getDashboard();
      set({
        telemetry: data.telemetry,
        systemHealth: data.systemHealth,
        pendingApprovalsCount: data.pendingApprovals?.length || 0,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard telemetry:', err);
    }
  },

  fetchResources: async () => {
    try {
      const [resList, bldList] = await Promise.all([
        api.getResources(),
        api.getBuildings(),
      ]);
      set({ resources: resList, buildings: bldList });
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    }
  },

  initApp: async () => {
    set({ isLoading: true });
    await Promise.all([get().fetchDashboard(), get().fetchResources()]);
    set({ isLoading: false });

    // Set up realtime Socket.IO listener
    const socket = getSocket();

    socket.on('digital_twin_updated', (evt) => {
      console.log('[Store] Realtime digital twin event received:', evt);
      get().fetchResources();
      get().fetchDashboard();
      get().showToast(`Digital Twin Updated: ${evt.eventType}`, 'info');
    });

    socket.on('notification_created', (notif) => {
      get().showToast(`${notif.title}: ${notif.message}`, notif.type === 'CRITICAL' ? 'error' : 'info');
      get().fetchDashboard();
    });

    socket.on('demo_reset', () => {
      get().fetchResources();
      get().fetchDashboard();
      get().showToast('Campus Digital Twin reset to baseline state.', 'success');
    });
  },
}));
