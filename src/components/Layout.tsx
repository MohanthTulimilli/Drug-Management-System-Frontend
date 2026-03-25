import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, Package, ShoppingCart, Truck, Users, ClipboardList, BarChart3, LogOut, Pill, FileText, History, Menu, X, Sun, Moon, Store, UserPlus, CreditCard } from 'lucide-react';

const roleMenus: Record<string, { label: string; path: string; icon: any; badge?: string }[]> = {
  SUPER_ADMIN: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Manage Users', path: '/users', icon: Users },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Audit Logs', path: '/audit-logs', icon: FileText },
  ],
  ADMIN: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Medicines', path: '/medicines', icon: Pill },
    { label: 'Inventory', path: '/inventory', icon: Package },
    { label: 'Bulk Upload', path: '/bulk-upload', icon: ClipboardList },
    { label: 'Create Retailer', path: '/create-retailer', icon: UserPlus },
    { label: 'Create Delivery', path: '/create-delivery', icon: UserPlus },
    { label: 'Manage Retailers', path: '/manage-retailers', icon: Store },
    { label: 'Manage Delivery', path: '/manage-delivery', icon: Truck },
    { label: 'Retailers', path: '/retailers', icon: Users },
    { label: 'Orders', path: '/orders', icon: ShoppingCart, badge: '5' },
    { label: 'Deliveries', path: '/deliveries', icon: Truck },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
  ],
  RETAILER: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Catalog', path: '/catalog', icon: Pill },
    { label: 'Cart', path: '/cart', icon: ShoppingCart },
    { label: 'My Orders', path: '/my-orders', icon: ClipboardList },
    { label: 'Payment History', path: '/payment-history', icon: CreditCard },
  ],
  DELIVERY: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Deliveries', path: '/my-deliveries', icon: Truck },
    { label: 'History', path: '/delivery-history', icon: History },
  ],
};

const pathToTitle: Record<string, string> = {
  '/dashboard': 'Admin Dashboard',
  '/medicines': 'Medicines',
  '/inventory': 'Inventory Management',
  '/bulk-upload': 'Bulk Upload',
  '/retailers': 'Retailers',
  '/orders': 'Orders',
  '/deliveries': 'Deliveries',
  '/reports': 'Reports',
  '/users': 'Manage Users',
  '/analytics': 'Analytics',
  '/audit-logs': 'Audit Logs',
  '/catalog': 'Medicine Catalog',
  '/cart': 'Cart',
  '/checkout': 'Checkout',
  '/my-orders': 'My Orders',
  '/payment-history': 'Payment History',
  '/my-deliveries': 'My Deliveries',
  '/delivery-history': 'Delivery History',
  '/create-retailer': 'Create Retailer',
  '/create-delivery': 'Create Delivery',
  '/manage-retailers': 'Manage Retailers',
  '/manage-delivery': 'Manage Delivery Personnel',
};

function getPageTitle(pathname: string): string {
  const base = pathname.split('/').filter(Boolean)[0] || '';
  const key = '/' + pathname.split('/').slice(1).join('/') || pathname;
  if (pathToTitle[key]) return pathToTitle[key];
  if (pathname.includes('dashboard')) return 'Admin Dashboard';
  if (pathname.includes('medicines')) return 'Medicines';
  if (pathname.includes('inventory')) return 'Inventory Management';
  if (pathname.includes('bulk')) return 'Bulk Upload';
  if (pathname.includes('retailers')) return 'Retailers';
  if (pathname.includes('orders')) return pathname.includes('my-orders') ? 'My Orders' : 'Orders';
  if (pathname.includes('deliveries') || pathname.includes('delivery-history')) return pathname.includes('my-deliveries') ? 'My Deliveries' : pathname.includes('history') ? 'Delivery History' : 'Deliveries';
  if (pathname.includes('reports')) return 'Reports';
  return pathToTitle[pathname] || 'MedDist';
}

function getInitials(first?: string, last?: string): string {
  const f = (first || '').trim().charAt(0);
  const l = (last || '').trim().charAt(0);
  return (f + l).toUpperCase() || 'U';
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const menus = roleMenus[user?.role || ''] || [];
  const pageTitle = getPageTitle(location.pathname);

  const handleLogout = () => { logout(); navigate('/login'); };
  const showBulkUploadBtn = user?.role === 'ADMIN';

  return (
    <div className="app">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden />
      )}

      <aside
        className={`sidebar fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="sb-logo">
          <div className="sb-logo-icon">
            <Pill className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="sb-logo-text">MedDist</div>
            <div className="sb-logo-sub">Medicine Distribution</div>
          </div>
        </div>

        <nav className="sb-nav">
          {menus.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sb-footer">
          <div className="sb-user">
            <div className="sb-avatar">{getInitials(user?.firstName, user?.lastName)}</div>
            <div className="sb-user-info">
              <div className="sb-user-name">{user?.firstName} {user?.lastName}</div>
              <span className="sb-role-pill">{user?.role?.replace('_', ' ')}</span>
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="sb-signout">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg border border-[var(--tb-btn-border)] bg-[var(--tb-btn-bg)] text-[var(--tb-btn-color)]"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="topbar-welcome">Welcome back, {user?.firstName}!</span>
            <h1 id="pgTitle" className="pg-title">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="theme-toggle"
              title={theme === 'light' ? 'Switch to dark' : 'Switch to light'}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            {showBulkUploadBtn && (
              <NavLink to="/bulk-upload" className="tb-btn primary">
                Bulk Upload
              </NavLink>
            )}
          </div>
        </header>
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
}
