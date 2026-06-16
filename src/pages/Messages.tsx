import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Bell,
  Megaphone,
  AlertCircle,
  CheckCheck,
  ArrowRight,
  Paperclip,
  Edit3,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Building2,
  CircleDot,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { Message } from '@/types';

type TabType = 'all' | 'process' | 'reminder' | 'policy' | 'system';

const tabs: { key: TabType; label: string; icon: typeof FileText; color: string; activeBg: string; activeText: string }[] = [
  { key: 'all', label: '全部', icon: Bell, color: 'text-zinc-500', activeBg: 'bg-zinc-100', activeText: 'text-zinc-900' },
  { key: 'process', label: '办件通知', icon: FileText, color: 'text-primary-500', activeBg: 'bg-primary-50', activeText: 'text-primary-700' },
  { key: 'reminder', label: '待办提醒', icon: AlertCircle, color: 'text-warning-500', activeBg: 'bg-warning-50', activeText: 'text-warning-700' },
  { key: 'policy', label: '政策提醒', icon: Megaphone, color: 'text-success-500', activeBg: 'bg-success-50', activeText: 'text-success-700' },
  { key: 'system', label: '系统公告', icon: Bell, color: 'text-zinc-500', activeBg: 'bg-zinc-100', activeText: 'text-zinc-900' },
];

const getMessageIcon = (type: Message['type']) => {
  switch (type) {
    case 'process':
      return { Icon: FileText, bg: 'bg-primary-100', color: 'text-primary-600' };
    case 'reminder':
      return { Icon: AlertCircle, bg: 'bg-warning-100', color: 'text-warning-600' };
    case 'policy':
      return { Icon: Megaphone, bg: 'bg-success-100', color: 'text-success-600' };
    case 'system':
    default:
      return { Icon: Bell, bg: 'bg-zinc-100', color: 'text-zinc-600' };
  }
};

const getTypeLabel = (type: Message['type']) => {
  switch (type) {
    case 'process':
      return '办件通知';
    case 'reminder':
      return '待办提醒';
    case 'policy':
      return '政策提醒';
    case 'system':
    default:
      return '系统公告';
  }
};

export default function Messages() {
  const navigate = useNavigate();
  const { messages, markMessageRead, markAllMessagesRead } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedId, setSelectedId] = useState<string | null>(messages[0]?.id || null);
  const [viewMode, setViewMode] = useState<'list' | 'conversation'>('list');
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const messageIconMap: Record<string, typeof CircleDot> = {
    提交: Send,
    受理: FileText,
    审核: AlertCircle,
    退回: XCircle,
    补正: Edit3,
    完成: CheckCircle2,
  };
  const messageColorMap: Record<string, string> = {
    提交: 'text-zinc-600 bg-zinc-100',
    受理: 'text-primary-600 bg-primary-50',
    审核: 'text-warning-600 bg-warning-50',
    退回: 'text-danger-600 bg-danger-50',
    补正: 'text-primary-600 bg-primary-50',
    完成: 'text-success-600 bg-success-50',
  };
  const getNodeStyle = (title: string) => {
    for (const k of Object.keys(messageIconMap)) {
      if (title.includes(k)) return { Icon: messageIconMap[k], cls: messageColorMap[k] };
    }
    return { Icon: CircleDot, cls: 'text-zinc-500 bg-zinc-100' };
  };

  const filteredMessages = useMemo(() => {
    const sorted = [...messages].sort(
      (a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
    );
    if (activeTab === 'all') return sorted;
    return sorted.filter((m) => m.type === activeTab);
  }, [messages, activeTab]);

  const conversations = useMemo(() => {
    const baseSorted = [...messages].sort(
      (a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
    );
    const baseForConversation =
      activeTab === 'all'
        ? baseSorted.filter((m) => m.type === 'process' || m.type === 'reminder')
        : activeTab === 'process' || activeTab === 'reminder'
        ? baseSorted
        : baseSorted;

    const groups: Record<string, { appId: string; appName: string; appNo: string; msgs: Message[]; lastTime: string; unread: number }> = {};
    const ungrouped: Message[] = [];

    baseForConversation.forEach((m) => {
      if (m.relatedApplicationId) {
        const app = applications.find((a) => a.id === m.relatedApplicationId);
        const appId = m.relatedApplicationId;
        if (!groups[appId]) {
          groups[appId] = {
            appId,
            appName: app?.enterpriseName || '未知申请',
            appNo: app?.applicationNo || appId,
            msgs: [],
            lastTime: m.createTime,
            unread: 0,
          };
        }
        groups[appId].msgs.push(m);
        if (new Date(m.createTime).getTime() > new Date(groups[appId].lastTime).getTime()) {
          groups[appId].lastTime = m.createTime;
        }
        if (!m.isRead) groups[appId].unread += 1;
      } else {
        ungrouped.push(m);
      }
    });

    return {
      groups: Object.values(groups).sort(
        (a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime()
      ),
      ungrouped,
    };
  }, [messages, activeTab, applications]);

  const unreadCounts = useMemo(() => {
    const counts: Record<TabType, number> = { all: 0, process: 0, reminder: 0, policy: 0, system: 0 };
    messages.forEach((m) => {
      if (!m.isRead) {
        counts.all += 1;
        if (m.type === 'process') counts.process += 1;
        else if (m.type === 'reminder') counts.reminder += 1;
        else if (m.type === 'policy') counts.policy += 1;
        else if (m.type === 'system') counts.system += 1;
      }
    });
    return counts;
  }, [messages]);

  const setCurrentApplicationById = useAppStore((s) => s.setCurrentApplicationById);
  const applications = useAppStore((s) => s.applications);

  const handleViewApplication = (appId?: string, stage?: string) => {
    if (!appId) return;
    setCurrentApplicationById(appId);
    const params = new URLSearchParams();
    params.set('appId', appId);
    if (stage) params.set('stage', stage);
    navigate(`/progress?${params.toString()}`);
  };

  const handleGoToProgress = (appId?: string, stage?: string) => {
    if (appId) setCurrentApplicationById(appId);
    const params = new URLSearchParams();
    if (appId) params.set('appId', appId);
    if (stage) params.set('stage', stage);
    navigate(`/progress?${params.toString()}`);
  };

  const handleFixMaterial = (appId?: string, stage?: string) => {
    if (!appId) {
      navigate('/material-guide');
      return;
    }
    setCurrentApplicationById(appId);
    const app = applications.find((a) => a.id === appId);
    const correctItems = stage ? app?.processSteps.find((s) => s.stage === stage)?.correctItems : undefined;
    const params = new URLSearchParams();
    params.set('appId', appId);
    if (stage) params.set('stage', stage);
    if (correctItems && correctItems.length > 0) params.set('materialIds', correctItems.join(','));
    navigate(`/material-guide?${params.toString()}`);
  };

  const selectedMessage = filteredMessages.find((m) => m.id === selectedId) || null;

  const handleSelect = (msg: Message) => {
    setSelectedId(msg.id);
    if (!msg.isRead) {
      markMessageRead(msg.id);
    }
  };

  const handleMarkAllRead = () => {
    markAllMessagesRead();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">消息中心</h1>
          <p className="text-sm text-zinc-500 mt-1">查看系统通知、办件进度和政策提醒</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 rounded-lg border border-zinc-200 p-1 bg-zinc-50">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === 'list' ? 'bg-white text-primary-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />列表视图
            </button>
            <button
              onClick={() => setViewMode('conversation')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === 'conversation' ? 'bg-white text-primary-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />办件会话
            </button>
          </div>
          <button className="btn-secondary" onClick={handleMarkAllRead}>
            <CheckCheck className="w-4 h-4" />
            全部标记为已读
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-260px)]">
        <div className="lg:col-span-2 card flex flex-col overflow-hidden">
          <div className="flex border-b border-zinc-200 px-2 pt-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              const count = unreadCounts[tab.key];
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-t-lg transition-all relative ${
                    isActive
                      ? `${tab.activeBg} ${tab.activeText} border-b-2 border-primary-500`
                      : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span className="min-w-[18px] h-[18px] flex items-center justify-center px-1.5 rounded-full bg-danger-500 text-white text-[10px] font-medium">
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {viewMode === 'list' ? (
            filteredMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-400 text-sm">
                暂无消息
              </div>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {filteredMessages.map((msg) => {
                  const { Icon, bg, color } = getMessageIcon(msg.type);
                  const isActive = selectedId === msg.id;
                  return (
                    <li
                      key={msg.id}
                      onClick={() => handleSelect(msg)}
                      className={`p-4 cursor-pointer transition-all relative ${
                        isActive
                          ? 'bg-primary-50 border-l-4 border-l-primary-500'
                          : 'hover:bg-zinc-50 border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}>
                          <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-medium truncate ${
                              msg.isRead ? 'text-zinc-600' : 'text-zinc-900'
                            }`}>
                              {msg.title}
                            </p>
                            {!msg.isRead && (
                              <span className="w-2 h-2 rounded-full bg-danger-500 mt-1.5 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                            {msg.content}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-xs text-zinc-400">{msg.createTime}</span>
                            {msg.relatedApplicationId && (() => {
                              const relatedApp = applications.find((a) => a.id === msg.relatedApplicationId);
                              return relatedApp ? (
                                <span className="text-[11px] text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                                  {relatedApp.enterpriseName}
                                </span>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )) : (
              <div className="py-2">
                {conversations.groups.length === 0 && conversations.ungrouped.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-zinc-400 text-sm py-20">
                    暂无办件会话
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100">
                    {conversations.groups.map((g) => {
                      const expanded = expandedSession === g.appId;
                      const firstMsg = g.msgs[0];
                      const isActive =
                        firstMsg && selectedId === firstMsg.id;
                      return (
                        <div key={g.appId}>
                          <button
                            onClick={() => {
                              setExpandedSession(expanded ? null : g.appId);
                              if (firstMsg) handleSelect(firstMsg);
                            }}
                            className={`w-full p-4 text-left transition-all relative ${
                              isActive
                                ? 'bg-primary-50 border-l-4 border-l-primary-500'
                                : 'hover:bg-zinc-50 border-l-4 border-l-transparent'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-primary-100 text-primary-600">
                                <Building2 className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className={`text-sm font-semibold truncate ${
                                      g.unread > 0 ? 'text-zinc-900' : 'text-zinc-600'
                                    }`}>
                                      {g.appName}
                                    </p>
                                    <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                                      {g.appNo} · {g.msgs.length}条通知
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {g.unread > 0 && (
                                      <span className="min-w-[18px] h-[18px] flex items-center justify-center px-1.5 rounded-full bg-danger-500 text-white text-[10px] font-medium">
                                        {g.unread > 99 ? '99+' : g.unread}
                                      </span>
                                    )}
                                    {expanded ? (
                                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                                    )}
                                  </div>
                                </div>
                                {firstMsg && (
                                  <p className="text-xs text-zinc-500 mt-1.5 line-clamp-1">
                                    <span className="text-zinc-400 mr-1.5">{g.lastTime}</span>
                                    {firstMsg.title}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                          {expanded && (
                            <div className="bg-zinc-50/70 px-2 pb-2 border-t border-zinc-100">
                              <div className="relative pl-7 pt-3 pb-1">
                                {g.msgs.map((m, idx) => {
                                  const isLast = idx === g.msgs.length - 1;
                                  const { Icon, cls } = getNodeStyle(m.title);
                                  return (
                                    <div key={m.id} className="relative pb-3">
                                      {!isLast && (
                                        <div className="absolute left-[11px] top-7 bottom-0 w-px bg-zinc-200" />
                                      )}
                                      <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 -ml-7 mr-3 float-left ${cls}`}>
                                        <Icon className="w-3.5 h-3.5" />
                                      </div>
                                      <div
                                        className={`p-2.5 rounded-lg cursor-pointer transition-all ${
                                          selectedId === m.id
                                            ? 'bg-primary-100 ring-1 ring-primary-300'
                                            : 'bg-white hover:bg-zinc-100'
                                        }`}
                                        onClick={() => handleSelect(m)}
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <p className={`text-xs font-medium truncate ${
                                            m.isRead ? 'text-zinc-700' : 'text-zinc-900'
                                          }`}>
                                            {m.title}
                                          </p>
                                          <span className="text-[10px] text-zinc-400 whitespace-nowrap">
                                            {m.createTime}
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">
                                          {m.content}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                          {m.relatedStage && (
                                            <span
                                              className="text-[10px] px-1.5 py-0.5 rounded bg-primary-50 text-primary-600 font-medium cursor-pointer hover:bg-primary-100"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleGoToProgress(g.appId, m.relatedStage);
                                              }}
                                            >
                                              环节：{m.relatedStage}
                                            </span>
                                          )}
                                          {m.title.includes('退回') || m.title.includes('补正') ? (
                                            <span
                                              className="text-[10px] px-1.5 py-0.5 rounded bg-danger-50 text-danger-600 font-medium cursor-pointer hover:bg-danger-100"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleFixMaterial(g.appId, m.relatedStage);
                                              }}
                                            >
                                              去补正材料
                                            </span>
                                          ) : (
                                            m.relatedStage && (
                                              <span
                                                className="text-[10px] px-1.5 py-0.5 rounded bg-success-50 text-success-600 font-medium cursor-pointer hover:bg-success-100"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleGoToProgress(g.appId, m.relatedStage);
                                                }}
                                              >
                                                查看进度
                                              </span>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {conversations.ungrouped.length > 0 && (
                      <div className="pt-2">
                        <p className="px-4 py-1.5 text-[11px] font-medium text-zinc-400 bg-zinc-50 border-t">
                          其它通知
                        </p>
                        {conversations.ungrouped.map((msg) => {
                          const { Icon, bg, color } = getMessageIcon(msg.type);
                          const isActive = selectedId === msg.id;
                          return (
                            <div
                              key={msg.id}
                              onClick={() => handleSelect(msg)}
                              className={`p-4 cursor-pointer transition-all relative ${
                                isActive
                                  ? 'bg-primary-50 border-l-4 border-l-primary-500'
                                  : 'hover:bg-zinc-50 border-l-4 border-l-transparent'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}>
                                  <Icon className={`w-4 h-4 ${color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className={`text-xs font-medium truncate ${
                                      msg.isRead ? 'text-zinc-600' : 'text-zinc-900'
                                    }`}>
                                      {msg.title}
                                    </p>
                                    {!msg.isRead && (
                                      <span className="w-2 h-2 rounded-full bg-danger-500 mt-1 flex-shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-[11px] text-zinc-500 mt-1 line-clamp-1">
                                    {msg.content}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 card overflow-hidden flex flex-col">
          {selectedMessage ? (
            <div className="flex-1 overflow-y-auto scrollbar-thin animate-fade-in">
              <div className="p-6 border-b border-zinc-100">
                <div className="flex items-start gap-3">
                  {(() => {
                    const { Icon, bg, color } = getMessageIcon(selectedMessage.type);
                    return (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}>
                        <Icon className={`w-6 h-6 ${color}`} />
                      </div>
                    );
                  })()}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-zinc-900">{selectedMessage.title}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`badge ${
                        selectedMessage.type === 'process'
                          ? 'badge-info'
                          : selectedMessage.type === 'reminder'
                          ? 'badge-warning'
                          : selectedMessage.type === 'policy'
                          ? 'badge-success'
                          : 'badge-default'
                      }`}>
                        {getTypeLabel(selectedMessage.type)}
                      </span>
                      <span className="text-sm text-zinc-500">{selectedMessage.createTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="prose prose-sm max-w-none text-zinc-700 leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.content}
                </div>

                {selectedMessage.attachmentName && (
                  <div className="mt-6 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                    <div className="flex items-center gap-3">
                      <Paperclip className="w-5 h-5 text-zinc-400" />
                      <span className="text-sm text-zinc-700 flex-1">{selectedMessage.attachmentName}</span>
                      <button className="btn-outline text-sm">
                        <ArrowRight className="w-4 h-4" />
                        下载
                      </button>
                    </div>
                  </div>
                )}

                {selectedMessage.relatedApplicationId && (
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button className="btn-primary" onClick={() => handleViewApplication(selectedMessage.relatedApplicationId, selectedMessage.relatedStage)}>
                      <ArrowRight className="w-4 h-4" />
                      查看相关办件
                    </button>
                    {selectedMessage.relatedStage && (
                      <button className="btn-secondary" onClick={() => handleGoToProgress(selectedMessage.relatedApplicationId, selectedMessage.relatedStage)}>
                        跳转至进度中心
                      </button>
                    )}
                    {selectedMessage.type === 'reminder' && (
                      <button className="btn-outline" onClick={() => handleFixMaterial(selectedMessage.relatedApplicationId, selectedMessage.relatedStage)}>
                        <Edit3 className="w-4 h-4" />
                        补充材料
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-400">
              请选择左侧消息查看详情
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
