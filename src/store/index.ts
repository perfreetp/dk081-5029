import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  addMessageOnce: (msg: Message) => void;
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

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
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
      const nowStr = new Date().toLocaleString('zh-CN', { hour12: false });
      const updatedApp = state.applications.find((a) => a.id === id);
      if (!updatedApp) return state;

      const departmentMap: Record<string, string> = {
        name_approval: '市场监督管理局',
        business_license: '市场监督管理局',
        seal_engraving: '公安局',
        tax_registration: '税务局',
        social_insurance: '人力资源和社会保障局',
        housing_fund: '住房公积金管理中心',
        bank_appointment: '银行网点',
      };
      const nameMap: Record<string, string> = {
        name_approval: '名称自主申报',
        business_license: '营业执照办理',
        seal_engraving: '公章刻制备案',
        tax_registration: '税务登记',
        social_insurance: '社保开户',
        housing_fund: '公积金开户',
        bank_appointment: '银行开户预约',
      };

      const selectedStages = updatedApp.selectedServices?.length
        ? ['name_approval', ...updatedApp.selectedServices]
        : ['name_approval', 'business_license', 'seal_engraving', 'tax_registration', 'social_insurance', 'housing_fund', 'bank_appointment'];

      const newProcessSteps = updatedApp.processSteps.map((step) => {
        if (!selectedStages.includes(step.stage)) return step;
        const dept = departmentMap[step.stage] || step.department;
        const stName = nameMap[step.stage] || step.name;

        const baseTimeline: TimelineNode[] =
          step.stage === 'name_approval' && step.timeline.length > 0
            ? step.timeline
            : [];

        const submitNode: TimelineNode = {
          id: `submit_${step.stage}_${Date.now()}`,
          type: 'submit',
          title: step.stage === 'name_approval' ? '提交名称申请' : `提交${stName}申请`,
          description: step.stage === 'name_approval' ? '申请人提交名称自主申报申请' : '一窗通联办自动推送申请材料',
          time: now,
          operator: updatedApp.legalRepresentative?.name || '申请人',
        };
        const acceptNode: TimelineNode = {
          id: `accept_${step.stage}_${Date.now() + 1}`,
          type: 'accept',
          title: `${dept}已接件`,
          description: `材料齐全、符合法定形式，${dept}已受理并联办件`,
          time: now,
          operator: dept,
        };

        const newStatus: ProcessStatus = step.stage === 'name_approval' ? 'completed' : 'accepted';
        const existingSubmit = baseTimeline.some((n) => n.type === 'submit');
        const existingAccept = baseTimeline.some((n) => n.type === 'accept');

        return {
          ...step,
          status: newStatus,
          acceptTime: existingAccept ? step.acceptTime : now,
          timeline: [
            ...baseTimeline,
            ...(existingSubmit ? [] : [submitNode]),
            ...(existingAccept ? [] : [acceptNode]),
          ],
        };
      });

      void nowStr;

      return {
        applications: state.applications.map((a) =>
          a.id === id
            ? { ...a, status: 'accepted' as ProcessStatus, submitTime: now, processSteps: newProcessSteps, isDraft: false, currentStep: undefined }
            : a
        ),
        currentApplication:
          state.currentApplication?.id === id
            ? { ...state.currentApplication, status: 'accepted' as ProcessStatus, submitTime: now, processSteps: newProcessSteps, isDraft: false, currentStep: undefined }
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
              operator: state.applications.find((a) => a.id === appId)?.legalRepresentative?.name || '申请人',
            };
            return { ...s, status: 'reviewing' as ProcessStatus, correctionSubmitted: true, timeline: [...s.timeline, newNode] };
          }
          return s;
        });

      const app = state.applications.find((a) => a.id === appId);
      const correctMsgId = `msg_correct_${appId}_${stage}`;
      const alreadyHasMsg = state.messages.some((m) => m.id === correctMsgId);

      const newMsg: Message | null =
        app && !alreadyHasMsg
          ? {
              id: correctMsgId,
              type: 'process' as const,
              title: `${app.enterpriseName} 补正材料已提交`,
              content: '您的补正材料已提交，相关部门将在 1-2 个工作日内完成审核。',
              isRead: false,
              createTime: new Date().toLocaleString('zh-CN', { hour12: false }),
              relatedApplicationId: appId,
              relatedStage: stage,
            }
          : null;

      return {
        applications: state.applications.map((a) =>
          a.id === appId ? { ...a, status: 'reviewing' as ProcessStatus, processSteps: updateSteps(a.processSteps) } : a
        ),
        currentApplication:
          state.currentApplication?.id === appId
            ? { ...state.currentApplication, status: 'reviewing' as ProcessStatus, processSteps: updateSteps(state.currentApplication.processSteps) }
            : state.currentApplication,
        messages: newMsg ? [newMsg, ...state.messages] : state.messages,
      };
    }),

  addMessage: (msg) =>
    set((state) => ({
      messages: [msg, ...state.messages],
    })),

  addMessageOnce: (msg) =>
    set((state) => {
      if (state.messages.some((m) => m.id === msg.id)) return state;
      return { messages: [msg, ...state.messages] };
    }),

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
    }),
    {
      name: 'qiyekaiban-store',
      version: 1,
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as object),
      }),
      partialize: (state) => ({
        applications: state.applications,
        currentApplication: state.currentApplication,
        messages: state.messages,
        tasks: state.tasks,
      }),
    }
  )
);
