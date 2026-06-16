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

  const filteredMessages = useMemo(() => {
    const sorted = [...messages].sort(
      (a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
    );
    if (activeTab === 'all') return sorted;
    return sorted.filter((m) => m.type === activeTab);
  }, [messages, activeTab]);

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

  const handleViewApplication = (appId?: string) => {
    if (appId) {
      navigate('/progress');
    }
  };

  const handleGoToProgress = (stage?: string) => {
    navigate('/progress');
  };

  const handleFixMaterial = () => {
    navigate('/material-guide');
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
        <button className="btn-secondary" onClick={handleMarkAllRead}>
          <CheckCheck className="w-4 h-4" />
          全部标记为已读
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-220px)]">
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
            {filteredMessages.length === 0 ? (
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
                          <p className="text-xs text-zinc-400 mt-2">{msg.createTime}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
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
                    <button className="btn-primary" onClick={() => handleViewApplication(selectedMessage.relatedApplicationId)}>
                      <ArrowRight className="w-4 h-4" />
                      查看相关办件
                    </button>
                    {selectedMessage.relatedStage && (
                      <button className="btn-secondary" onClick={() => handleGoToProgress(selectedMessage.relatedStage)}>
                        跳转至进度中心
                      </button>
                    )}
                    {selectedMessage.type === 'reminder' && (
                      <button className="btn-outline" onClick={handleFixMaterial}>
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
