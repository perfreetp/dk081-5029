import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ChevronRight,
  ChevronDown,
  Download,
  Edit,
  FileText,
  Send,
  User,
  Building2,
  CircleDot,
  Building,
  BriefcaseBusiness,
  FileCheck2,
  Home,
  Landmark,
  Users,
  Shield,
  Banknote,
  ClipboardList,
  Layers,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { ProcessStep, ProcessStatus, TimelineNode, TimelineNodeType, ProcessStage } from '@/types';

const statusMap: Record<ProcessStatus, { color: string; dot: string; label: string; badge: string }> = {
  completed: { color: 'text-success-600', dot: 'bg-success-600', label: '已完成', badge: 'badge-success' },
  accepted: { color: 'text-primary-600', dot: 'bg-primary-600', label: '受理中', badge: 'badge-info' },
  reviewing: { color: 'text-primary-600', dot: 'bg-primary-600', label: '审核中', badge: 'badge-info' },
  returned: { color: 'text-danger-600', dot: 'bg-danger-600', label: '已退回', badge: 'badge-danger' },
  pending: { color: 'text-zinc-400', dot: 'bg-zinc-300', label: '待办理', badge: 'badge-default' },
};

const timelineIconMap: Record<TimelineNodeType, typeof CircleDot> = {
  submit: Send,
  accept: FileText,
  review: AlertCircle,
  complete: CheckCircle2,
  return: XCircle,
  correct_submit: Edit,
};

const timelineColorMap: Record<TimelineNodeType, string> = {
  submit: 'text-zinc-600 bg-zinc-100',
  accept: 'text-primary-600 bg-primary-50',
  review: 'text-warning-600 bg-warning-50',
  complete: 'text-success-600 bg-success-50',
  return: 'text-danger-600 bg-danger-50',
  correct_submit: 'text-primary-600 bg-primary-50',
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

const formatTime = (t?: string) => {
  if (!t) return '—';
  try {
    const d = new Date(t);
    if (isNaN(d.getTime())) return t;
    return d.toLocaleString('zh-CN', { hour12: false });
  } catch {
    return t;
  }
};

export default function Progress() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { applications, currentApplication, setCurrentApplication } = useAppStore();

  const appIdFromUrl = searchParams.get('appId');
  const stageFromUrl = searchParams.get('stage') as ProcessStage | null;

  const [selectedStep, setSelectedStep] = useState<ProcessStep | null>(null);
  const [viewMode, setViewMode] = useState<'process' | 'dept'>('process');
  const [expandedDept, setExpandedDept] = useState<string | null>(null);

  const deptIconMap: Record<string, typeof Building> = {
    '市场监督管理局': Building,
    '公安局': Shield,
    '税务局': Banknote,
    '人力资源和社会保障局': Users,
    '住房公积金管理中心': Home,
    '银行网点': Landmark,
  };

  const deptMaterialStageMap: Record<string, string[]> = {
    '市场监督管理局': ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'],
    '公安局': ['m7'],
    '税务局': ['m8'],
    '人力资源和社会保障局': ['m9'],
    '住房公积金管理中心': ['m10'],
    '银行网点': [],
  };

  useEffect(() => {
    if (appIdFromUrl) {
      const app = applications.find((a) => a.id === appIdFromUrl);
      if (app) setCurrentApplication(app);
    }
  }, [appIdFromUrl, applications, setCurrentApplication]);

  useEffect(() => {
    if (currentApplication) {
      let target: ProcessStep | null = null;
      if (stageFromUrl) {
        target = currentApplication.processSteps.find((s) => s.stage === stageFromUrl) || null;
      }
      if (!target) {
        target =
          currentApplication.processSteps.find(
            (s) => s.status !== 'pending' && s.status !== 'completed'
          ) || currentApplication.processSteps[0] || null;
      }
      setSelectedStep(target);
    }
  }, [currentApplication, stageFromUrl]);

  const app = currentApplication;

  const departments = useMemo(() => {
    if (!app) return [];
    const map: Record<string, { dept: string; steps: ProcessStep[]; expectedTime?: string }> = {};
    app.processSteps.forEach((step) => {
      if (!step.department) return;
      if (!map[step.department]) {
        map[step.department] = { dept: step.department, steps: [], expectedTime: step.expectedTime };
      }
      map[step.department].steps.push(step);
      if (!map[step.department].expectedTime && step.expectedTime) {
        map[step.department].expectedTime = step.expectedTime;
      }
      if (step.expectedTime && map[step.department].expectedTime && new Date(step.expectedTime).getTime() > new Date(map[step.department].expectedTime!).getTime()) {
        map[step.department].expectedTime = step.expectedTime;
      }
    });
    return Object.values(map);
  }, [app]);

  const getDeptSummary = (steps: ProcessStep[]) => {
    const completed = steps.filter((s) => s.status === 'completed').length;
    const running = steps.filter((s) => s.status === 'accepted' || s.status === 'reviewing').length;
    const returned = steps.filter((s) => s.status === 'returned').length;
    if (returned > 0) return { text: `${returned}项待补正`, cls: 'text-danger-600' };
    if (completed === steps.length) return { text: `已完成（${completed}/${steps.length}）`, cls: 'text-success-600' };
    if (running > 0) return { text: `办理中（${completed}/${steps.length}）`, cls: 'text-primary-600' };
    return { text: `未启动（${completed}/${steps.length}）`, cls: 'text-zinc-500' };
  };

  const getMaterialSummary = (dept: string) => {
    if (!app) return [];
    const matIds = deptMaterialStageMap[dept] || [];
    return matIds
      .map((mid) => app.materials.find((m) => m.id === mid))
      .filter(Boolean) as typeof app.materials;
  };

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

  const handleEditMaterial = () => {
    const params = new URLSearchParams();
    if (app) params.set('appId', app.id);
    if (selectedStep) {
      params.set('stage', selectedStep.stage);
      if (selectedStep.correctItems && selectedStep.correctItems.length > 0) {
        params.set('materialIds', selectedStep.correctItems.join(','));
      }
    }
    navigate(`/material-guide?${params.toString()}`);
  };

  const getOverallBadge = () => {
    if (!app) return { text: '无数据', cls: 'badge-default' };
    if (app.isDraft) return { text: '草稿', cls: 'badge-warning' };
    if (app.processSteps.every((s) => s.status === 'completed')) return { text: '全部完成', cls: 'badge-success' };
    if (app.processSteps.some((s) => s.status === 'returned')) return { text: '有退回待补正', cls: 'badge-danger' };
    if (app.processSteps.some((s) => s.status === 'reviewing' || s.status === 'accepted')) return { text: '办理中', cls: 'badge-info' };
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
          <select className="input" value={app.id} onChange={(e) => handleAppChange(e.target.value)}>
            {applications.map((a) => (
              <option key={a.id} value={a.id}>
                {a.enterpriseName} - {a.applicationNo}
                {a.isDraft ? '（草稿）' : ''}
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

      <div className="flex gap-2 border-b border-zinc-200">
        <button
          onClick={() => setViewMode('process')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all flex items-center gap-1.5 ${
            viewMode === 'process'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <ClipboardList className="w-4 h-4" />办理流程
        </button>
        <button
          onClick={() => setViewMode('dept')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all flex items-center gap-1.5 ${
            viewMode === 'dept'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <Layers className="w-4 h-4" />部门协同（{departments.length}个部门）
        </button>
      </div>

      {viewMode === 'process' && (
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
                        {step.correctionSubmitted ? '（补正已提交）' : ''}
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
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`${statusMap[selectedStep.status].badge}`}>
                        {statusMap[selectedStep.status].label}
                      </span>
                      {selectedStep.correctionSubmitted && (
                        <span className="badge-info">补正已提交</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">受理时间</p>
                  <p className="text-sm text-zinc-900">{formatTime(selectedStep.acceptTime)}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">预计完成时间</p>
                  <p className="text-sm text-zinc-900">{formatTime(selectedStep.expectedTime)}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">办理部门</p>
                  <p className="text-sm text-zinc-900 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                    {selectedStep.department}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">经办人</p>
                  <p className="text-sm text-zinc-900 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    {selectedStep.handler || '待分配'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-zinc-500 mb-2">办理时间线</p>
                {selectedStep.timeline && selectedStep.timeline.length > 0 ? (
                  <div className="relative pl-2">
                    {selectedStep.timeline.map((node: TimelineNode, idx: number) => {
                      const Icon = timelineIconMap[node.type];
                      const isLast = idx === selectedStep.timeline!.length - 1;
                      return (
                        <div key={node.id} className="relative flex gap-3 pb-5">
                          {!isLast && (
                            <div className="absolute left-[15px] top-8 bottom-0 w-px bg-zinc-200" />
                          )}
                          <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${timelineColorMap[node.type]} flex-shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 pt-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-zinc-900">{node.title}</span>
                              <span className="text-xs text-zinc-500">{formatTime(node.time)}</span>
                            </div>
                            <p className="text-xs text-zinc-600 mt-1">{node.description}</p>
                            {node.operator && (
                              <p className="text-xs text-zinc-400 mt-0.5">操作人：{node.operator}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-zinc-400 bg-zinc-50 rounded-lg p-4 text-center">
                    该环节尚未开始办理
                  </div>
                )}
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
                  <p className="text-sm text-zinc-900 mb-4">{formatTime(selectedStep.completeTime)}</p>
                  <button className="btn-primary" onClick={() => alert('正在下载电子营业执照...')}>
                    <Download className="w-4 h-4" />
                    下载相关证照
                  </button>
                </div>
              )}

              {selectedStep.status === 'returned' && (
                <div className="border border-danger-200 rounded-lg p-4 bg-danger-50">
                  <p className="text-sm font-medium text-danger-700 mb-2">补正原因</p>
                  {selectedStep.returnReason && (
                    <p className="text-sm text-danger-600 mb-3">{selectedStep.returnReason}</p>
                  )}
                  {selectedStep.correctItems && selectedStep.correctItems.length > 0 && (
                    <>
                      <p className="text-xs text-danger-600 mb-2">需补正的材料：</p>
                      <ul className="space-y-1.5 mb-4">
                        {selectedStep.correctItems.map((mid) => {
                          const mat = app.materials.find((m) => m.id === mid);
                          return (
                            <li key={mid} className="flex items-start gap-2 text-sm text-danger-600">
                              <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span>{mat?.name || mid}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  )}
                  <button className="btn-primary" onClick={handleEditMaterial}>
                    <Edit className="w-4 h-4" />
                    修改材料并提交补正
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
      )}

      {viewMode === 'dept' && (
        <div className="space-y-4">
          {departments.map((group) => {
            const Icon = deptIconMap[group.dept] || Building;
            const expanded = expandedDept === group.dept;
            const summary = getDeptSummary(group.steps);
            const materials = getMaterialSummary(group.dept);
            const activeSteps = group.steps.filter((s) => s.status !== 'pending');

            return (
              <div key={group.dept} className="card overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-5 hover:bg-zinc-50 transition-colors"
                  onClick={() => setExpandedDept(expanded ? null : group.dept)}
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-zinc-900">{group.dept}</h3>
                        <span className={`${summary.cls} text-xs font-medium`}>{summary.text}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-zinc-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <FileCheck2 className="w-3.5 h-3.5" />
                          办理事项：{activeSteps.length > 0 ? activeSteps.map((s) => s.name).join('、') : '暂未接件'}
                        </span>
                        {group.expectedTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            预计反馈：{formatTime(group.expectedTime)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {expanded ? (
                    <ChevronDown className="w-5 h-5 text-zinc-400 flex-shrink-0 ml-4" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-zinc-400 flex-shrink-0 ml-4" />
                  )}
                </button>

                {expanded && (
                  <div className="border-t border-zinc-100 divide-y divide-zinc-100 bg-zinc-50/50">
                    {group.steps.map((step) => {
                      const st = statusMap[step.status];
                      const lastTimeline = step.timeline && step.timeline.length > 0 ? step.timeline[step.timeline.length - 1] : null;
                      return (
                        <div key={step.stage} className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
                          <div className="lg:col-span-2">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`${st.dot} w-2 h-2 rounded-full`} />
                              <h4 className="font-medium text-zinc-900">{step.name}</h4>
                              <span className={`${st.badge} text-xs`}>{st.label}</span>
                              {step.correctionSubmitted && <span className="badge-info text-xs">补正已提交</span>}
                            </div>
                            {lastTimeline ? (
                              <div className="pl-4 border-l-2 border-zinc-200 space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium text-zinc-800">{lastTimeline.title}</span>
                                  <span className="text-xs text-zinc-500">{formatTime(lastTimeline.time)}</span>
                                </div>
                                <p className="text-xs text-zinc-600">{lastTimeline.description}</p>
                              </div>
                            ) : (
                              <p className="text-xs text-zinc-400 pl-4">等待相关部门接件</p>
                            )}
                            {step.status !== 'pending' && (
                              <button
                                className="mt-3 text-primary-600 hover:text-primary-700 text-xs flex items-center gap-1"
                                onClick={() => {
                                  setSelectedStep(step);
                                  setViewMode('process');
                                }}
                              >
                                <BriefcaseBusiness className="w-3.5 h-3.5" />
                                查看完整时间线
                              </button>
                            )}
                          </div>

                          {step.status === 'completed' && step.completeTime ? (
                            <div className="p-3 rounded-lg bg-success-50 border border-success-200 text-sm">
                              <p className="font-medium text-success-700 mb-1 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />办理完成
                              </p>
                              <p className="text-xs text-success-600">完成时间：{formatTime(step.completeTime)}</p>
                            </div>
                          ) : step.status === 'returned' ? (
                            <button
                              className="p-3 rounded-lg bg-danger-50 border border-danger-200 text-left hover:bg-danger-100 transition-all w-full"
                              onClick={handleEditMaterial}
                            >
                              <p className="font-medium text-danger-700 mb-1 flex items-center gap-1">
                                <XCircle className="w-4 h-4" />
                                {step.correctItems?.length || 0} 项材料待补正
                              </p>
                              <p className="text-xs text-danger-600 mb-2">点击前往补正材料</p>
                              <span className="text-xs font-medium text-danger-700 underline underline-offset-2">立即处理 →</span>
                            </button>
                          ) : (
                            <div className="p-3 rounded-lg bg-white border border-zinc-200 text-sm space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-zinc-500">受理部门</span>
                                <span className="font-medium text-zinc-800">{step.department}</span>
                              </div>
                              {step.acceptTime && (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-zinc-500">受理时间</span>
                                  <span className="font-medium text-zinc-800">{formatTime(step.acceptTime)}</span>
                                </div>
                              )}
                              {step.expectedTime && (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-zinc-500">预计完成</span>
                                  <span className="font-medium text-primary-700">{formatTime(step.expectedTime)}</span>
                                </div>
                              )}
                              {step.handler ? (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-zinc-500">经办人</span>
                                  <span className="font-medium text-zinc-800">{step.handler}</span>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {materials.length > 0 && (
                      <div className="p-5 bg-white/70">
                        <p className="text-xs font-semibold text-zinc-600 mb-3 flex items-center gap-1.5">
                          <FileText className="w-4 h-4" />
                          该部门收到的材料摘要
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {materials.map((m) => {
                            const matStatusBadge =
                              m.status === 'verified' ? 'badge-success' :
                              m.status === 'uploaded' ? 'badge-info' : 'badge-danger';
                            const matStatusText =
                              m.status === 'verified' ? '已核验' :
                              m.status === 'uploaded' ? '已上传' : '待补';
                            return (
                              <div key={m.id} className="flex items-start justify-between p-3 rounded-lg bg-white border border-zinc-200">
                                <div className="flex items-start gap-2 min-w-0">
                                  <FileText className={`w-4 h-4 mt-0.5 flex-shrink-0 ${m.status === 'verified' ? 'text-success-500' : m.status === 'uploaded' ? 'text-primary-500' : 'text-danger-500'}`} />
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-zinc-800 truncate">{m.name}</p>
                                    {m.remark && <p className="text-xs text-zinc-500 mt-0.5">{m.remark}</p>}
                                  </div>
                                </div>
                                <span className={`${matStatusBadge} text-xs ml-2 flex-shrink-0`}>{matStatusText}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
