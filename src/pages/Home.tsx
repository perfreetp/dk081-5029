import { useNavigate } from 'react-router-dom';
import {
  Building2, FileText, ClipboardList, LayoutDashboard, MessageSquare,
  BookOpen, HelpCircle, CheckCircle2, Clock, ArrowRight, Users,
  Sparkles, Award, FileCheck, Shield, Briefcase, User, Handshake,
  UserCircle, Newspaper,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { enterpriseTypes } from '@/data/mockData';
import type { ProcessStatus, EnterpriseType } from '@/types';

const processSteps = [
  { icon: Building2, title: '选择企业类型', desc: '根据业务需求选择合适的企业类型' },
  { icon: FileText, title: '准备材料', desc: '按照材料清单准备相关文件' },
  { icon: ClipboardList, title: '并联申报', desc: '一次填报，多部门并联审批' },
  { icon: Award, title: '领取证照', desc: '线上下载或窗口领取营业执照等' },
];

const quickEntries = [
  { icon: FileText, title: '材料向导', desc: '材料清单与模板下载', color: 'bg-primary-50 text-primary-600' },
  { icon: ClipboardList, title: '并联申报', desc: '一次填报，六事联办', color: 'bg-success-50 text-success-600' },
  { icon: LayoutDashboard, title: '进度中心', desc: '查看办理进度与状态', color: 'bg-warning-50 text-warning-700' },
  { icon: MessageSquare, title: '消息中心', desc: '办理通知与政策推送', color: 'bg-primary-50 text-primary-600' },
  { icon: BookOpen, title: '政策法规', desc: '最新政策与法规解读', color: 'bg-success-50 text-success-600' },
  { icon: HelpCircle, title: '常见问题', desc: '办事指南与问题解答', color: 'bg-warning-50 text-warning-700' },
];

const enterpriseIcons: Record<string, typeof Building2> = {
  limited: Briefcase, individual: User, partnership: Handshake, sole: UserCircle,
};

const policyNews = [
  { title: '2026年小微企业税收优惠政策延续实施', summary: '为支持小微企业发展，2026年继续实施增值税和企业所得税优惠政策...', time: '2026-06-15', tag: '税收优惠' },
  { title: '市场监管总局简化企业开办流程通知', summary: '企业开办时间压缩至1个工作日内，实现"一次填报、一窗受理、一网通办"...', time: '2026-06-10', tag: '政策解读' },
  { title: '电子营业执照应用范围进一步扩大', summary: '电子营业执照可用于银行开户、税务办理、社保登记等多个场景...', time: '2026-06-05', tag: '办事指南' },
];

function getStatusBadge(status: ProcessStatus) {
  switch (status) {
    case 'completed': return 'badge-success';
    case 'reviewing': case 'accepted': return 'badge-info';
    case 'returned': return 'badge-warning';
    default: return 'badge-default';
  }
}

function getStatusText(status: ProcessStatus) {
  switch (status) {
    case 'completed': return '已完成';
    case 'reviewing': return '审核中';
    case 'accepted': return '已受理';
    case 'returned': return '已退回';
    default: return '待办';
  }
}

export default function Home() {
  const navigate = useNavigate();
  const { currentApplication, setCurrentApplication, updateApplication } = useAppStore();
  const displaySteps = currentApplication?.processSteps.slice(0, 5) || [];
  const completedCount = displaySteps.filter((s) => s.status === 'completed').length;
  const progressPercent = displaySteps.length > 0 ? (completedCount / displaySteps.length) * 100 : 0;

  const handleStartApplication = () => {
    navigate('/material-guide');
  };

  const handleQuickEntry = (title: string) => {
    const routeMap: Record<string, string> = {
      '材料向导': '/material-guide',
      '并联申报': '/application',
      '进度中心': '/progress',
      '消息中心': '/messages',
      '政策法规': '/messages',
      '常见问题': '/dashboard',
    };
    navigate(routeMap[title] || '/');
  };

  const handleSelectEnterpriseType = (type: EnterpriseType) => {
    if (currentApplication) {
      updateApplication(currentApplication.id, { enterpriseType: type });
    }
    navigate('/material-guide');
  };

  return (
    <div className="min-h-screen animate-fade-in">
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white">
        <div className="container py-16 lg:py-24">
          <div className="max-w-3xl animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur rounded-full text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>企业开办全流程"一网通办"</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-balance">企业开办一窗通</h1>
            <p className="text-lg lg:text-xl text-primary-100 mb-8 text-balance">
              一次填报，六事联办，最快1个工作日办结
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary !bg-white !text-primary-600 !hover:bg-primary-50 px-6 py-3 text-base" onClick={handleStartApplication}>
                立即开始申报 <ArrowRight className="w-5 h-5" />
              </button>
              <button className="btn-secondary !bg-transparent !border-white/30 !text-white !hover:bg-white/10 px-6 py-3 text-base">
                了解更多
              </button>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg">
              <div><div className="text-3xl font-bold">1</div><div className="text-sm text-primary-200">个工作日办结</div></div>
              <div><div className="text-3xl font-bold">6</div><div className="text-sm text-primary-200">事项联办</div></div>
              <div><div className="text-3xl font-bold">100%</div><div className="text-sm text-primary-200">线上办理</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-12 lg:py-16 -mt-8">
        <div className="card p-6 lg:p-8 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-primary-600" />办理进度概览
              </h2>
              {currentApplication && (
                <p className="text-sm text-zinc-500 mt-1">
                  {currentApplication.enterpriseName} · {currentApplication.applicationNo}
                </p>
              )}
            </div>
            {currentApplication && (
              <span className={getStatusBadge(currentApplication.status)}>
                {getStatusText(currentApplication.status)}
              </span>
            )}
          </div>
          {currentApplication ? (
            <>
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-zinc-600">整体进度</span>
                <span className="font-medium text-primary-600">{Math.round(progressPercent)}%</span>
              </div>
              <div className="progress-bar mb-8">
                <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {displaySteps.map((step) => (
                  <div key={step.stage} className="flex flex-col items-center text-center p-3 rounded-lg bg-zinc-50">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      step.status === 'completed' ? 'bg-success-100 text-success-600'
                        : step.status === 'reviewing' || step.status === 'accepted' ? 'bg-primary-100 text-primary-600'
                        : 'bg-zinc-200 text-zinc-500'
                    }`}>
                      {step.status === 'completed' ? <CheckCircle2 className="w-5 h-5" />
                        : step.status === 'reviewing' || step.status === 'accepted' ? <Clock className="w-5 h-5" />
                        : <FileCheck className="w-5 h-5" />}
                    </div>
                    <div className="text-sm font-medium text-zinc-800 mb-1">{step.name}</div>
                    <span className={getStatusBadge(step.status)}>{getStatusText(step.status)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-zinc-500">
              <FileCheck className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
              <p>暂无办理中的申请</p>
              <button className="btn-primary mt-4" onClick={handleStartApplication}>开始新申报 <ArrowRight className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      </section>

      <section className="container py-12 lg:py-16">
        <div className="text-center mb-10 animate-slide-up">
          <h2 className="text-2xl lg:text-3xl font-bold text-zinc-900 mb-3">办理流程</h2>
          <p className="text-zinc-500">简单四步，轻松完成企业开办</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {processSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="card-hover p-6 animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-500">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container py-12 lg:py-16">
        <div className="text-center mb-10 animate-slide-up">
          <h2 className="text-2xl lg:text-3xl font-bold text-zinc-900 mb-3">快捷入口</h2>
          <p className="text-zinc-500">常用功能一键直达</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickEntries.map((entry, idx) => {
            const Icon = entry.icon;
            return (
              <button key={idx} className="card-hover p-5 text-center group animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }} onClick={() => handleQuickEntry(entry.title)}>
                <div className={`w-12 h-12 rounded-xl ${entry.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-zinc-900 mb-1">{entry.title}</div>
                <div className="text-xs text-zinc-500">{entry.desc}</div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="container py-12 lg:py-16">
        <div className="text-center mb-10 animate-slide-up">
          <h2 className="text-2xl lg:text-3xl font-bold text-zinc-900 mb-3">选择企业类型</h2>
          <p className="text-zinc-500">根据您的业务需求选择最适合的企业类型</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {enterpriseTypes.map((type, idx) => {
            const Icon = enterpriseIcons[type.id] || Building2;
            return (
              <div key={type.id} className="card-hover p-6 cursor-pointer animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }} onClick={() => handleSelectEnterpriseType(type.id)}>
                <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">{type.name}</h3>
                <p className="text-sm text-zinc-500 mb-4 line-clamp-2">{type.description}</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-zinc-500">适用场景</span><span className="text-zinc-700 font-medium text-right ml-2">{type.suitableFor}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">股东人数</span><span className="text-zinc-700 font-medium">{type.shareholderCount}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">责任形式</span><span className="text-zinc-700 font-medium">{type.liability}</span></div>
                </div>
                <button className="btn-primary w-full mt-5 text-sm" onClick={(e) => { e.stopPropagation(); handleSelectEnterpriseType(type.id); }}>选择此类型 <ArrowRight className="w-4 h-4" /></button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container py-12 lg:py-16">
        <div className="flex items-center justify-between mb-8 animate-slide-up">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-zinc-900 mb-2 flex items-center gap-2">
              <Newspaper className="w-6 h-6 text-primary-600" />政策资讯
            </h2>
            <p className="text-zinc-500">了解最新政策动态和办事指南</p>
          </div>
          <button className="btn-secondary text-sm">查看全部 <ArrowRight className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {policyNews.map((news, idx) => (
            <article key={idx} className="card-hover p-6 animate-slide-up cursor-pointer" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="badge-info">{news.tag}</span>
                <span className="text-xs text-zinc-400">{news.time}</span>
              </div>
              <h3 className="text-base font-semibold text-zinc-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">{news.title}</h3>
              <p className="text-sm text-zinc-500 line-clamp-3 mb-4">{news.summary}</p>
              <div className="flex items-center text-primary-600 text-sm font-medium">
                阅读全文 <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary-50 to-primary-100/50 py-12 lg:py-16 mt-8">
        <div className="container text-center animate-slide-up">
          <Shield className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl lg:text-3xl font-bold text-zinc-900 mb-3">安全、高效、便捷的企业开办服务</h2>
          <p className="text-zinc-600 mb-8 max-w-2xl mx-auto">
            全程电子化办理，数据加密传输，多部门信息共享，让您足不出户完成企业开办全流程
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="btn-primary px-6 py-3" onClick={handleStartApplication}>立即开始申报 <ArrowRight className="w-5 h-5" /></button>
            <button className="btn-secondary px-6 py-3"><Users className="w-5 h-5" />联系客服</button>
          </div>
        </div>
      </section>
    </div>
  );
}
