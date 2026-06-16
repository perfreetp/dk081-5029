import { useNavigate } from 'react-router-dom';
import {
  Building2,
  CreditCard,
  ListTodo,
  History,
  GitBranch,
  Copy,
  Clock,
  AlertCircle,
  Search,
  Check,
  ChevronRight,
  FileCheck,
  FileText,
  Users,
  Bell,
  ArrowRight,
  Edit3,
  FileWarning,
} from 'lucide-react';
import { useAppStore } from '@/store';

export default function Dashboard() {
  const navigate = useNavigate();
  const enterprises = useAppStore((s) => s.enterprises);
  const applications = useAppStore((s) => s.applications);
  const tasks = useAppStore((s) => s.tasks);
  const unreadCount = useAppStore((s) => s.getUnreadMessageCount());
  const pendingTaskCount = useAppStore((s) => s.getPendingTaskCount());
  const toggleTask = useAppStore((s) => s.toggleTask);
  const setCurrentApplication = useAppStore((s) => s.setCurrentApplication);

  const handleViewApplication = (appId: string) => {
    const app = applications.find((a) => a.id === appId);
    if (app) {
      setCurrentApplication(app);
    }
    navigate('/progress');
  };

  const handleContinueDraft = (appId: string) => {
    const app = applications.find((a) => a.id === appId);
    if (app) setCurrentApplication(app);
    navigate(`/application?appId=${appId}`);
  };

  const draftApps = applications.filter((a) => a.isDraft);
  const submittedApps = applications.filter((a) => !a.isDraft);

  const handleViewEnterprise = (enterpriseId: string) => {
    navigate('/progress');
  };

  const handleNewBranch = () => {
    navigate('/material-guide');
  };

  const stats = [
    { label: '已办企业数', value: enterprises.length, icon: Building2, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: '办理中申请', value: applications.filter((a) => a.status !== 'completed').length, icon: CreditCard, color: 'text-warning-600', bg: 'bg-warning-50' },
    { label: '待办任务数', value: pendingTaskCount, icon: ListTodo, color: 'text-danger-600', bg: 'bg-danger-50' },
    { label: '未读消息数', value: unreadCount, icon: Bell, color: 'text-success-600', bg: 'bg-success-50' },
  ];

  const getStatusBadge = (s: string) => {
    const map: Record<string, string> = { normal: 'badge-success', abnormal: 'badge-warning', cancelled: 'badge-danger' };
    return map[s] || 'badge-default';
  };

  const getStatusText = (s: string) => {
    const label: Record<string, string> = { normal: '正常', abnormal: '异常', cancelled: '已注销' };
    return label[s] || s;
  };

  const getAppStatusBadge = (s: string) => {
    const map: Record<string, string> = { pending: 'badge-default', accepted: 'badge-info', reviewing: 'badge-warning', returned: 'badge-danger', completed: 'badge-success' };
    return map[s] || 'badge-default';
  };

  const getAppStatusText = (s: string, isDraft?: boolean) => {
    if (isDraft) return '草稿';
    const label: Record<string, string> = { pending: '待提交', accepted: '已受理', reviewing: '审核中', returned: '已退回', completed: '已完成' };
    return label[s] || s;
  };

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">个人空间</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input className="input pl-9 w-72" placeholder="搜索企业、申请..." />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card-hover p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">{s.label}</p>
                  <p className="text-3xl font-bold mt-1">{s.value}</p>
                </div>
                <div className={s.bg + ' ' + s.color + ' p-3 rounded-xl'}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary-600" />我的企业
              </h3>
              <button className="btn-outline text-sm" onClick={handleNewBranch}>
                <GitBranch className="w-4 h-4" />快速设立分支机构
              </button>
            </div>
            {enterprises.length === 0 ? (
              <div className="text-center py-10 text-zinc-500">暂无企业信息</div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {enterprises.map((e) => (
                  <div key={e.id} className="p-4 rounded-xl border border-zinc-200 hover:border-primary-300 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{e.name}</h4>
                        <div className="mt-1">
                          <span className={getStatusBadge(e.status)}>{getStatusText(e.status)}</span>
                        </div>
                      </div>
                      <button className="text-zinc-400 hover:text-primary-600" onClick={() => handleViewEnterprise(e.id)}>
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs text-zinc-500 mb-2 flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />{e.unifiedCreditCode}
                    </p>
                    <p className="text-xs text-zinc-500 mb-3 flex items-center gap-1">
                      <Users className="w-3 h-3" />法定代表人：{e.legalRepresentative}
                    </p>
                    <div className="flex gap-2">
                      <button className="btn-secondary text-xs px-2 py-1">
                        <FileText className="w-3 h-3" />详情
                      </button>
                      <button className="btn-outline text-xs px-2 py-1">
                        <Copy className="w-3 h-3" />变更
                      </button>
                      <button className="btn-outline text-xs px-2 py-1">
                        <GitBranch className="w-3 h-3" />分支
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {draftApps.length > 0 && (
            <div className="card p-5 border-warning-200 bg-warning-50/30">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Edit3 className="w-5 h-5 text-warning-600" />未提交草稿
                <span className="badge-warning text-xs">{draftApps.length}</span>
              </h3>
              <div className="space-y-3">
                {draftApps.map((a) => (
                  <div key={a.id} className="p-4 rounded-xl bg-white border border-warning-200 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-zinc-900">{a.enterpriseName}</h4>
                          <span className="badge-warning">草稿</span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1 font-mono">{a.applicationNo}</p>
                      </div>
                      <button className="btn-primary text-xs !px-3 !py-1.5" onClick={() => handleContinueDraft(a.id)}>
                        <Edit3 className="w-3.5 h-3.5" />继续填写
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />创建时间：{a.createTime}
                      </span>
                      {a.lastSaveTime && (
                        <span className="flex items-center gap-1">
                          <FileWarning className="w-3 h-3" />上次保存：{new Date(a.lastSaveTime).toLocaleString('zh-CN', { hour12: false })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-primary-600" />历史申报记录
              <span className="badge-info text-xs">{submittedApps.length}</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-zinc-500">
                    <th className="text-left py-2 px-2 font-medium">申请编号</th>
                    <th className="text-left py-2 px-2 font-medium">企业名称</th>
                    <th className="text-left py-2 px-2 font-medium">申请时间</th>
                    <th className="text-left py-2 px-2 font-medium">状态</th>
                    <th className="text-left py-2 px-2 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {submittedApps.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-zinc-400 text-sm">暂无已提交记录</td>
                    </tr>
                  ) : (
                    submittedApps.map((a) => (
                      <tr key={a.id} className="border-b last:border-0 hover:bg-zinc-50">
                        <td className="py-3 px-2 font-mono text-xs">{a.applicationNo}</td>
                        <td className="py-3 px-2">{a.enterpriseName}</td>
                        <td className="py-3 px-2 text-zinc-500">{a.submitTime || a.createTime}</td>
                        <td className="py-3 px-2">
                          <span className={getAppStatusBadge(a.status)}>{getAppStatusText(a.status)}</span>
                        </td>
                        <td className="py-3 px-2">
                          <button className="text-primary-600 hover:text-primary-700 text-xs flex items-center gap-1" onClick={() => handleViewApplication(a.id)}>
                            <FileCheck className="w-3 h-3" />查看进度
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <ListTodo className="w-5 h-5 text-primary-600" />任务清单
            </h3>
            <div className="space-y-3">
              <p className="text-xs font-medium text-zinc-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />待办（{pendingTasks.length}）
              </p>
              {pendingTasks.length === 0 ? (
                <p className="text-sm text-zinc-400 py-2">暂无待办任务</p>
              ) : (
                pendingTasks.map((t) => (
                  <div key={t.id} className="p-3 rounded-lg bg-warning-50 border border-warning-200">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" checked={false} onChange={() => toggleTask(t.id)} className="mt-0.5 w-4 h-4" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{t.title}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{t.description}</p>
                        {t.deadline && (
                          <p className="text-xs text-danger-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />截止：{t.deadline}
                          </p>
                        )}
                      </div>
                    </label>
                  </div>
                ))
              )}
              <p className="text-xs font-medium text-zinc-500 flex items-center gap-1 pt-2">
                <Check className="w-3 h-3" />已完成（{completedTasks.length}）
              </p>
              {completedTasks.length === 0 ? (
                <p className="text-sm text-zinc-400 py-2">暂无已完成任务</p>
              ) : (
                completedTasks.map((t) => (
                  <div key={t.id} className="p-3 rounded-lg border border-zinc-200 opacity-60">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" checked={true} onChange={() => toggleTask(t.id)} className="mt-0.5 w-4 h-4" />
                      <div className="flex-1">
                        <p className="text-sm font-medium line-through">{t.title}</p>
                        <p className="text-xs text-zinc-500 mt-0.5 line-through">{t.description}</p>
                      </div>
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card p-5 bg-gradient-to-br from-primary-50 to-white border-primary-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-primary-600 text-white p-2.5 rounded-xl">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-primary-700">快速设立分支机构</h4>
                <p className="text-xs text-primary-600">一键复用已有企业信息</p>
              </div>
            </div>
            <button className="btn-primary w-full mt-2" onClick={handleNewBranch}>
              <GitBranch className="w-4 h-4" />立即设立
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
