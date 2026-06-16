import { create } from 'zustand';
import type {
  EnterpriseApplication,
  Message,
  Enterprise,
  UserTask,
  ProcessStatus,
  ProcessStage,
} from '@/types';
import { mockApplications, mockMessages, mockEnterprises, mockTasks } from '@/data/mockData';

interface AppState {
  currentApplication: EnterpriseApplication | null;
  applications: EnterpriseApplication[];
  enterprises: Enterprise[];
  messages: Message[];
  tasks: UserTask[];

  setCurrentApplication: (app: EnterpriseApplication | null) => void;
  updateApplication: (id: string, updates: Partial<EnterpriseApplication>) => void;
  submitApplication: (id: string) => void;
  addMessage: (msg: Message) => void;
  markMessageRead: (id: string) => void;
  markAllMessagesRead: () => void;
  toggleTask: (id: string) => void;
  getUnreadMessageCount: () => number;
  getPendingTaskCount: () => number;
  updateProcessStep: (appId: string, stage: ProcessStage, updates: Partial<EnterpriseApplication['processSteps'][0]>) => void;
  updateMaterialStatus: (appId: string, materialId: string, status: 'missing' | 'uploaded' | 'verified') => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentApplication: mockApplications[0] || null,
  applications: mockApplications,
  enterprises: mockEnterprises,
  messages: mockMessages,
  tasks: mockTasks,

  setCurrentApplication: (app) => set({ currentApplication: app }),

  updateApplication: (id, updates) =>
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
      currentApplication:
        state.currentApplication?.id === id
          ? { ...state.currentApplication, ...updates }
          : state.currentApplication,
    })),

  submitApplication: (id) =>
    set((state) => {
      const now = new Date().toISOString();
      const updatedApp = state.applications.find((a) => a.id === id);
      if (!updatedApp) return state;

      const newProcessSteps = updatedApp.processSteps.map((step, idx) => {
        if (idx === 0) {
          return { ...step, status: 'accepted' as ProcessStatus, acceptTime: now };
        }
        return step;
      });

      return {
        applications: state.applications.map((a) =>
          a.id === id
            ? { ...a, status: 'accepted' as ProcessStatus, submitTime: now, processSteps: newProcessSteps }
            : a
        ),
        currentApplication:
          state.currentApplication?.id === id
            ? { ...state.currentApplication, status: 'accepted' as ProcessStatus, submitTime: now, processSteps: newProcessSteps }
            : state.currentApplication,
      };
    }),

  addMessage: (msg) =>
    set((state) => ({
      messages: [msg, ...state.messages],
    })),

  markMessageRead: (id) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, isRead: true } : m
      ),
    })),

  markAllMessagesRead: () =>
    set((state) => ({
      messages: state.messages.map((m) => ({ ...m, isRead: true })),
    })),

  toggleTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t
      ),
    })),

  getUnreadMessageCount: () => {
    return get().messages.filter((m) => !m.isRead).length;
  },

  getPendingTaskCount: () => {
    return get().tasks.filter((t) => t.status === 'pending' && t.type === 'todo').length;
  },

  updateProcessStep: (appId, stage, updates) =>
    set((state) => {
      const updateSteps = (steps: EnterpriseApplication['processSteps']) =>
        steps.map((s) => (s.stage === stage ? { ...s, ...updates } : s));

      return {
        applications: state.applications.map((a) =>
          a.id === appId ? { ...a, processSteps: updateSteps(a.processSteps) } : a
        ),
        currentApplication:
          state.currentApplication?.id === appId
            ? { ...state.currentApplication, processSteps: updateSteps(state.currentApplication.processSteps) }
            : state.currentApplication,
      };
    }),

  updateMaterialStatus: (appId, materialId, status) =>
    set((state) => {
      const updateMaterials = (materials: EnterpriseApplication['materials']) =>
        materials.map((m) => (m.id === materialId ? { ...m, status } : m));

      return {
        applications: state.applications.map((a) =>
          a.id === appId ? { ...a, materials: updateMaterials(a.materials) } : a
        ),
        currentApplication:
          state.currentApplication?.id === appId
            ? { ...state.currentApplication, materials: updateMaterials(state.currentApplication.materials) }
            : state.currentApplication,
      };
    }),
}));
