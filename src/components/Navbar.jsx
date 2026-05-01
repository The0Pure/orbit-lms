// src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, BookOpen, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, isAdmin, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Courses', to: '/courses' },
  ];

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-orbit-bg/95 backdrop-blur-xl shadow-sm' : 'bg-orbit-bg/80 backdrop-blur-md'
    } border-b border-orbit-cream-light/60`}>
      <div className="orbit-container">
        <div className="flex items-center justify-between h-[70px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <Logo size={32} />
            <span className="font-display text-xl font-bold text-orbit-navy tracking-tight">Orbit</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  location.pathname === link.to
                    ? 'text-orbit-navy font-semibold bg-orbit-cream/50'
                    : 'text-gray-500 hover:text-orbit-navy hover:bg-orbit-cream/30'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full border border-orbit-cream-light hover:border-orbit-navy/20 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-orbit-navy flex items-center justify-center text-orbit-cream text-sm font-bold">
                    {user?.avatar || user?.name?.[0] || '?'}
                  </div>
                  <span className="text-sm font-medium text-orbit-navy">{user?.firstName || user?.name?.split(' ')[0]}</span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-orbit-cream-light shadow-lg py-2 animate-slide-down">
                    {isAdmin ? (
                      <>
                        <DropdownItem to="/admin" icon={<Settings size={16} />} label="Admin Panel" />
                        <DropdownItem to="/admin/courses" icon={<BookOpen size={16} />} label="Manage Courses" />
                      </>
                    ) : (
                      <>
                        <DropdownItem to="/dashboard" icon={<LayoutDashboard size={16} />} label="My Dashboard" />
                        <DropdownItem to="/dashboard/courses" icon={<BookOpen size={16} />} label="My Courses" />
                      </>
                    )}
                    <div className="border-t border-orbit-cream-light my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-outline text-sm py-2.5">Sign In</Link>
                <Link to="/signup" className="btn-primary text-sm py-2.5">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-orbit-navy"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-orbit-bg border-t border-orbit-cream-light animate-slide-down">
          <div className="orbit-container py-4 flex flex-col gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-3 rounded-xl text-sm font-medium text-orbit-navy hover:bg-orbit-cream/30 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-orbit-cream-light my-2" />
            {isLoggedIn ? (
              <>
                <Link to={isAdmin ? '/admin' : '/dashboard'} className="px-4 py-3 rounded-xl text-sm font-medium text-orbit-navy hover:bg-orbit-cream/30">
                  {isAdmin ? 'Admin Panel' : 'My Dashboard'}
                </Link>
                <button onClick={handleLogout} className="px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 text-left">
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link to="/login" className="btn-outline justify-center">Sign In</Link>
                <Link to="/signup" className="btn-primary justify-center">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function DropdownItem({ to, icon, label }) {
  return (
    <Link to={to} className="flex items-center gap-3 px-4 py-2.5 text-sm text-orbit-navy hover:bg-orbit-bg transition-colors">
      <span className="text-gray-400">{icon}</span> {label}
    </Link>
  );
}
