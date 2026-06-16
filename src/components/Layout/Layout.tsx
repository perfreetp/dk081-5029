import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto py-6 animate-fade-in">
          <Outlet />
        </div>
      </main>
      <footer className="border-t border-zinc-200 bg-white py-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-sm text-zinc-500">
              © 2026 企业开办一窗通服务平台 | 政务服务便民热线：12345</div>
            <div className="flex items-center gap-4 text-sm text-zinc-500">
              <a href="#" className="hover:text-primary-600 transition-colors">使用帮助</a>
              <span className="text-zinc-300">|</span>
              <a href="#" className="hover:text-primary-600 transition-colors">隐私政策</a>
              <span className="text-zinc-300">|</span>
              <a href="#" className="hover:text-primary-600 transition-colors">联系我们</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
