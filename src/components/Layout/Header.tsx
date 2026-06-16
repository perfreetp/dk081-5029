import { NavLink, useLocation } from 'react-router-dom';
import { Building2, LayoutDashboard, MessageSquare, FileText, ClipboardList, UserCircle } from 'lucide-react';
import { useAppStore } from '@/store';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { to: '/', label: '首页', icon: Building2 },
  { to: '/material-guide', label: '材料向导', icon: FileText },
  { to: '/application', label: '并联申报', icon: ClipboardList },
  { to: '/progress', label: '进度中心', icon: LayoutDashboard },
  { to: '/messages', label: '消息中心', icon: MessageSquare },
  { to: '/dashboard', label: '个人空间', icon: UserCircle },
];

export default function Header() {
  const location = useLocation();
  const getUnreadMessageCount = useAppStore((state) => state.getUnreadMessageCount);
  const unreadCount = getUnreadMessageCount();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-zinc-200 shadow-sm">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 leading-tight">企业开办一窗通</h1>
              <p className="text-xs text-zinc-500 leading-tight">一站式企业开办服务平台</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              const showBadge = item.to === '/messages' && unreadCount > 0;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    isActive
                      ? 'nav-link-active relative'
                      : 'nav-link relative'
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {showBadge && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger-500 text-[10px] font-medium text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors">
              <MessageSquare className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger-500 text-[10px] font-medium text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-zinc-200">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <UserCircle className="w-5 h-5 text-primary-600" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-zinc-700">创业者</span>
            </div>
          </div>
        </div>
      </div>

      <nav className="md:hidden border-t border-zinc-100 overflow-x-auto scrollbar-thin">
        <div className="container mx-auto flex items-center gap-1 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? 'nav-link-active shrink-0' : 'nav-link shrink-0'
                }
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
