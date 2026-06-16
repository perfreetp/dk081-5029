import { create } from 'zustand';
import type {
  EnterpriseApplication,
  Message,
  Enterprise,
  UserTask,
  ProcessStatus,
  ProcessStage,
  TimelineNode,
} from '@/types';
import { mockApplications, mockMessages, mockEnterprises, mockTasks } from '@/data/mockData';

interface AppState {
  currentApplication: EnterpriseApplication | null;
  applications: EnterpriseApplication[];
  enterprises: Enterprise[];
  messages: Message[];
  tasks: UserTask[];

  setCurrentApplication: (app: EnterpriseApplication | null) => void;
  setCurrentApplicationById: (appId: string) => void;
  updateApplication: (id: string, updates: Partial<EnterpriseApplication>) => void;
  submitApplication: (id: string) => void;
  saveDraft: (id: string, updates: Partial<EnterpriseApplication>) => void;
  submitCorrection: (appId: string, stage: ProcessStage) => void;
  addMessage: (msg: Message) => void;
  markMessageRead: (id: string) => void;
  markAllMessagesRead: () => void;
  toggleTask: (id: string) => void;
  getUnreadMessageCount: () => number;
  getPendingTaskCount: () => number;
  updateProcessStep: (appId: string, stage: ProcessStage, updates: Partial<EnterpriseApplication['processSteps'][0]>) => void;
  addTimelineNode: (appId: string, stage: ProcessStage, node: TimelineNode) => void;
  updateMaterialStatus: (appId: string, materialId: string, status: 'missing' | 'uploaded' | 'verified') => void;
  updateMaterial: (appId: string, materialId: string, updates: Partial<EnterpriseApplication['materials'][0]>) => void;
  markMaterialForCorrection: (appId: string, materialIds: string[]) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentApplication: mockApplications[0] || null,
  applications: mockApplications,
  enterprises: mockEnterprises,
  messages: mockMessages,
  tasks: mockTasks,

  setCurrentApplication: (app) => set({ currentApplication: app }),

  setCurrentApplicationById: (appId) => {
    const app = get().applications.find((a) => a.id === appId);
    if (app) set({ currentApplication: app });
  },

  updateApplication: (id, updates) =>
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === id ? { ...a, ...updates, lastSaveTime: new Date().toISOString() } : a
      ),
      currentApplication:
        state.currentApplication?.id === id
          ? { ...state.currentApplication, ...updates, lastSaveTime: new Date().toISOString() }
          : state.currentApplication,
    })),

  saveDraft: (id, updates) =>
    set((state) => {
      const now = new Date().toISOString();
      return {
        applications: state.applications.map((a) =>
          a.id === id ? { ...a, ...updates, isDraft: true, lastSaveTime: now } : a
        ),
        currentApplication:
          state.currentApplication?.id === id
            ? { ...state.currentApplication, ...updates, isDraft: true, lastSaveTime: now }
            : state.currentApplication,
      };
    }),

  submitApplication: (id) =>
    set((state) => {
      const now = new Date().toISOString();
      const updatedApp = state.applications.find((a) => a.id === id);
      if (!updatedApp) return state;

      const newProcessSteps = updatedApp.processSteps.map((step, idx) => {
        if (idx === 0) {
          const newTimeline: TimelineNode[] = [
            ...step.timeline,
            {
              id: `submit_${Date.now()}`,
              type: 'submit',
              title: '提交申请',
              description: '申请人已提交开办申请，等待受理',
              time: now,
              operator: updatedApp.legalRepresentative.name,
            },
            {
              id: `accept_${Date.now() + 1}`,
              type: 'accept',
              title: '受理通过',
              description: '材料齐全、符合法定形式，予以受理',
              time: now,
              operator: '市场监督管理局',
            },
          ];
          return { ...step, status: 'accepted' as ProcessStatus, acceptTime: now, timeline: newTimeline };
        }
        return step;
      });

      return {
        applications: state.applications.map((a) =>
          a.id === id
            ? { ...a, status: 'accepted' as ProcessStatus, submitTime: now, processSteps: newProcessSteps, isDraft: false }
            : a
        ),
        currentApplication:
          state.currentApplication?.id === id
            ? { ...state.currentApplication, status: 'accepted' as ProcessStatus, submitTime: now, processSteps: newProcessSteps, isDraft: false }
            : state.currentApplication,
      };
    }),

  submitCorrection: (appId, stage) =>
    set((state) => {
      const now = new Date().toISOString();
      const updateSteps = (steps: EnterpriseApplication['processSteps']) =>
        steps.map((s) => {
          if (s.stage === stage) {
            const newNode: TimelineNode = {
              id: `correct_submit_${Date.now()}`,
              type: 'correct_submit',
              title: '补正材料已提交',
              description: '申请人已提交补正材料，等待重新审核',
              time: now,
              operator: state.currentApplication?.legalRepresentative?.name || '申请人',
            };
            return { ...s, status: 'reviewing' as ProcessStatus, correctionSubmitted: true, timeline: [...s.timeline, newNode] };
          }
          return s;
        });

      const app = state.applications.find((a) => a.id === appId);
      return {
        applications: state.applications.map((a) =>
          a.id === appId ? { ...a, status: 'reviewing' as ProcessStatus, processSteps: updateSteps(a.processSteps) } : a
        ),
        currentApplication:
          state.currentApplication?.id === appId
            ? { ...state.currentApplication, status: 'reviewing' as ProcessStatus, processSteps: updateSteps(state.currentApplication.processSteps) }
            : state.currentApplication,
        messages: app
          ? [
              ...state.messages,
              {
                id: `msg_correct_${Date.now()}`,
                type: 'process' as const,
                title: `${app.enterpriseName} 补正材料已提交`,
                content: '您的补正材料已提交，相关部门将在 1-2 个工作日内完成审核。',
                isRead: false,
                createTime: now,
                relatedApplicationId: appId,
                relatedStage: stage,
              },
              ...state.messages,
            ]
          : state.messages,
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

  addTimelineNode: (appId, stage, node) =>
    set((state) => {
      const updateSteps = (steps: EnterpriseApplication['processSteps']) =>
        steps.map((s) => (s.stage === stage ? { ...s, timeline: [...s.timeline, node] } : s));

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

  updateMaterial: (appId, materialId, updates) =>
    set((state) => {
      const updateMaterials = (materials: EnterpriseApplication['materials']) =>
        materials.map((m) => (m.id === materialId ? { ...m, ...updates } : m));

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

  markMaterialForCorrection: (appId, materialIds) =>
    set((state) => {
      const updateMaterials = (materials: EnterpriseApplication['materials']) =>
        materials.map((m) =>
          materialIds.includes(m.id) ? { ...m, remark: '需补正', status: 'missing' as const } : m
        );

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
