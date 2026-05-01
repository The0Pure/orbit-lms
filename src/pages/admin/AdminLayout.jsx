// src/pages/admin/AdminLayout.jsx
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, ShoppingBag, Settings, LogOut, BarChart2 } from 'lucide-react';
import Logo from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/admin', icon: <LayoutDashboard size={18} />, label: 'Dashboard', end: true },
  { to: '/admin/courses', icon: <BookOpen size={18} />, label: 'Courses' },
  { to: '/admin/orders', icon: <ShoppingBag size={18} />, label: 'Orders' },
  { to: '/admin/students', icon: <Users size={18} />, label: 'Students' },
  { to: '/admin/analytics', icon: <BarChart2 size={18} />, label: 'Analytics' },
  { to: '/admin/settings', icon: <Settings size={18} />, label: 'Settings' },
];

export default function AdminLayout() {
  const { isAdmin, logout } = useAuth();
  if (!isAdmin) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-orbit-bg overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[220px] shrink-0 bg-orbit-navy flex flex-col">
        <div className="flex items-center gap-2.5 px-5 h-[70px] border-b border-white/10">
          <Logo size={28} variant="light" />
          <span className="font-display text-base font-bold text-orbit-cream">Admin</span>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-orbit-gold/20 text-orbit-gold'
                    : 'text-orbit-cream/60 hover:text-orbit-cream hover:bg-white/5'
                }`
              }
            >
              {link.icon} {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-orbit-cream/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
