import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  CogIcon, 
  UsersIcon, 
  ChartBarIcon,
  PaintBrushIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title = '管理後台' }: AdminLayoutProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    setUser({ username: 'admin' });
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      localStorage.removeItem('auth_token');
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navigation = [
    { name: '儀表板', href: '/admin', icon: HomeIcon },
    { name: '文章', href: '/admin/posts', icon: DocumentTextIcon },
    { name: '外觀', href: '/admin/appearance', icon: PaintBrushIcon },
    { name: '設定', href: '/admin/settings', icon: CogIcon },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return router.pathname === '/admin';
    }
    return router.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex flex-col flex-1 w-full max-w-xs bg-background">
          <div className="absolute top-0 right-0 pt-2 -mr-12">
            <button
              type="button"
              className="flex items-center justify-center w-10 h-10 ml-1 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="w-6 h-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-8 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-6">
              <h1 className="text-2xl font-bold text-foreground">管理</h1>
            </div>
            <nav className="px-4 mt-8 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  } group flex items-center px-3 py-2 text-base font-medium rounded-lg transition-all duration-200`}
                >
                  <item.icon className="w-6 h-6 mr-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-1 min-h-0 border-r bg-background border-border">
          <div className="flex flex-col flex-1 pt-8 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-6">
              <h1 className="text-2xl font-bold text-foreground">管理面板</h1>
            </div>
            <nav className="flex-1 px-4 mt-8 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  } group flex items-center px-3 py-2 text-base font-medium rounded-lg transition-all duration-200`}
                >
                  <item.icon className="w-6 h-6 mr-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 md:pl-72">
        <div className="sticky top-0 z-10 pt-1 pl-1 border-b md:hidden sm:pl-3 sm:pt-3 bg-background border-border">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
        </div>

        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-lg border-border">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center">
                <h1 className="text-3xl font-bold text-foreground">{title}</h1>
              </div>
              <div className="flex items-center space-x-6">
                <Link
                  href="/"
                  className="text-sm font-medium transition-colors text-muted-foreground hover:text-foreground"
                >
                  查看網站
                </Link>
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 transition-colors rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  {theme === 'dark' ? (
                    <SunIcon className="w-6 h-6" />
                  ) : (
                    <MoonIcon className="w-6 h-6" />
                  )}
                </button>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">歡迎, {user?.username}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 transition-colors rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="登出"
                  >
                    <ArrowRightOnRectangleIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}