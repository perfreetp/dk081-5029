import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ChevronRight,
  Download,
  Edit,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { ProcessStep, ProcessStatus } from '@/types';

const statusMap: Record<ProcessStatus, { color: string; dot: string; label: string; badge: string }> = {
  completed: {
    color: 'text-success-600',
    dot: 'bg-success-600',
    label: '已完成',
    badge: 'badge-success',
  },
  accepted: {
    color: 'text-primary-600',
    dot: 'bg-primary-600',
    label: '受理中',
    badge: 'badge-info',
  },
  reviewing: {
    color: 'text-primary-600',
    dot: 'bg-primary-600',
    label: '审核中',
    badge: 'badge-info',
  },
  returned: {
    color: 'text-danger-600',
    dot: 'bg-danger-600',
    label: '已退回',
    badge: 'badge-danger',
  },
  pending: {
    color: 'text-zinc-400',
    dot: 'bg-zinc-300',
    label: '待办理',
    badge: 'badge-default',
  },
};

const getStatusIcon = (status: ProcessStatus) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-5 h-5" />;
    case 'returned':
      return <XCircle className="w-5 h-5" />;
    case 'pending':
      return <Clock className="w-5 h-5" />;
    default:
      return <AlertCircle className="w-5 h-5" />;
  }
};

export default function Progress() {
  const navigate = useNavigate();
  const { applications, currentApplication, setCurrentApplication } = useAppStore();
  const [selectedStep, setSelectedStep] = useState<ProcessStep | null>(
    currentApplication?.processSteps.find((s) => s.status !== 'pending' && s.status !== 'completed') ||
      currentApplication?.processSteps[0] || null
  );

  const handleEditMaterial = () => {
    navigate('/material-guide');
  };

  const handleDownloadLicense = () => {
    alert('正在下载电子营业执照...');
  };

  const app = currentApplication;

  const calculateProgress = () => {
    if (!app) return 0;
    const total = app.processSteps.length;
    const completed = app.processSteps.filter((s) => s.status === 'completed').length;
    return Math.round((completed / total) * 100);
  };

  const progress = calculateProgress();

  const handleAppChange = (appId: string) => {
    const selected = applications.find((a) => a.id === appId);
    if (selected) {
      setCurrentApplication(selected);
      const firstActive =
        selected.processSteps.find((s) => s.status !== 'pending' && s.status !== 'completed') ||
        selected.processSteps[0];
      setSelectedStep(firstActive || null);
    }
  };

  const getOverallBadge = () => {
    if (!app) return { text: '无数据', cls: 'badge-default' };
    if (app.processSteps.every((s) => s.status === 'completed')) {
      return { text: '全部完成', cls: 'badge-success' };
    }
    if (app.processSteps.some((s) => s.status === 'returned')) {
      return { text: '有退回待补正', cls: 'badge-danger' };
    }
    if (app.processSteps.some((s) => s.status === 'reviewing' || s.status === 'accepted')) {
      return { text: '办理中', cls: 'badge-info' };
    }
    return { text: '待提交', cls: 'badge-warning' };
  };

  const overallBadge = getOverallBadge();

  if (!app) {
    return (
      <div className="p-6">
        <div className="card p-8 text-center text-zinc-500">暂无申请数据</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">进度中心</h1>
          <p className="text-sm text-zinc-500 mt-1">查看企业开办各环节办理进度</p>
        </div>
        <div className="w-72">
          <select
            className="input"
            value={app.id}
            onChange={(e) => handleAppChange(e.target.value)}
          >
            {applications.map((a) => (
              <option key={a.id} value={a.id}>
                {a.enterpriseName} - {a.applicationNo}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-600">总体进度</span>
            <span className={`${overallBadge.cls}`}>{overallBadge.text}</span>
          </div>
          <span className="text-2xl font-bold text-primary-600">{progress}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-zinc-500">
          <span>提交申请</span>
          <span>完成开办</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-base font-semibold text-zinc-900 mb-4">办理环节</h2>
          <div className="relative">
            {app.processSteps.map((step, idx) => {
              const status = statusMap[step.status];
              const isActive = selectedStep?.stage === step.stage;
              const isLast = idx === app.processSteps.length - 1;

              return (
                <div key={step.stage} className="relative">
                  {!isLast && (
                    <div
                      className={`absolute left-4 top-8 bottom-0 w-0.5 ${
                        step.status === 'completed' ? 'bg-success-300' : 'bg-zinc-200'
                      }`}
                    />
                  )}
                  <div
                    className={`relative flex items-start gap-3 py-3 pr-3 cursor-pointer rounded-lg transition-all ${
                      isActive ? 'bg-primary-50 -ml-3 pl-3' : 'hover:bg-zinc-50 -ml-3 pl-3'
                    }`}
                    onClick={() => setSelectedStep(step)}
                  >
                    <div
                      className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-white ${status.dot} ${
                        step.status === 'accepted' || step.status === 'reviewing'
                          ? 'ring-4 ring-primary-100'
                          : ''
                      }`}
                    >
                      {step.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : step.status === 'returned' ? (
                        <XCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-medium">{idx + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-900">{step.name}</span>
                        <ChevronRight
                          className={`w-4 h-4 text-zinc-400 transition-transform ${
                            isActive ? 'rotate-90 text-primary-500' : ''
                          }`}
                        />
                      </div>
                      <span className={`text-xs ${status.color} mt-0.5 block`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-3 card p-6">
          {selectedStep ? (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`${statusMap[selectedStep.status].color}`}>
                    {getStatusIcon(selectedStep.status)}
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-zinc-900">{selectedStep.name}</h2>
                    <span className={`${statusMap[selectedStep.status].badge} mt-1`}>
                      {statusMap[selectedStep.status].label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">受理时间</p>
                  <p className="text-sm text-zinc-900">
                    {selectedStep.acceptTime || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">预计完成时间</p>
                  <p className="text-sm text-zinc-900">
                    {selectedStep.expectedTime || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">办理部门</p>
                  <p className="text-sm text-zinc-900">{selectedStep.department}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">经办人</p>
                  <p className="text-sm text-zinc-900">{selectedStep.handler || '待分配'}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-zinc-500 mb-1">状态说明</p>
                <p className="text-sm text-zinc-700 bg-zinc-50 rounded-lg p-3">
                  {selectedStep.status === 'completed' && '该环节已完成，可下载相关证照。'}
                  {selectedStep.status === 'reviewing' && '材料已受理，正在审核中，请耐心等待。'}
                  {selectedStep.status === 'accepted' && '材料已受理，将尽快进入审核环节。'}
                  {selectedStep.status === 'returned' && '材料存在问题，请按补正要求修改后重新提交。'}
                  {selectedStep.status === 'pending' && '等待上一环节完成后自动进入本环节。'}
                </p>
              </div>

              {selectedStep.status === 'completed' && (
                <div>
                  <p className="text-xs text-zinc-500 mb-1">完成时间</p>
                  <p className="text-sm text-zinc-900 mb-4">
                    {selectedStep.completeTime || '—'}
                  </p>
                  <button className="btn-primary" onClick={handleDownloadLicense}>
                    <Download className="w-4 h-4" />
                    下载相关证照
                  </button>
                </div>
              )}

              {selectedStep.status === 'returned' && (
                <div className="border border-danger-200 rounded-lg p-4 bg-danger-50">
                  <p className="text-sm font-medium text-danger-700 mb-2">补正原因</p>
                  <ul className="space-y-2 mb-4">
                    {(selectedStep.correctItems || [selectedStep.returnReason || '请检查材料完整性']).map(
                      (item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-danger-600">
                          <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      )
                    )}
                  </ul>
                  <button className="btn-outline" onClick={handleEditMaterial}>
                    <Edit className="w-4 h-4" />
                    修改材料
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-400 py-20">
              请选择左侧环节查看详情
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
