// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@orbit.com';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'OrbitAdmin2026!';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('orbit_user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Admin check
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser = { id: 'admin', email, name: 'Admin', role: 'admin', avatar: 'AD' };
      setUser(adminUser);
      localStorage.setItem('orbit_user', JSON.stringify(adminUser));
      return { success: true, role: 'admin' };
    }

    // Student login — check registered users in localStorage
    const users = JSON.parse(localStorage.getItem('orbit_users') || '[]');
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...safeUser } = found;
      setUser(safeUser);
      localStorage.setItem('orbit_user', JSON.stringify(safeUser));
      return { success: true, role: 'student' };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const signup = async ({ firstName, lastName, email, password }) => {
    const users = JSON.parse(localStorage.getItem('orbit_users') || '[]');
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Email already registered' };
    }
    const newUser = {
      id: `user-${Date.now()}`,
      email, password,
      name: `${firstName} ${lastName}`,
      firstName, lastName,
      role: 'student',
      avatar: `${firstName[0]}${lastName[0]}`.toUpperCase(),
      createdAt: new Date().toISOString(),
      enrolledCourses: [],
      completedModules: {},
      certificates: [],
    };
    users.push(newUser);
    localStorage.setItem('orbit_users', JSON.stringify(users));
    const { password: _, ...safeUser } = newUser;
    setUser(safeUser);
    localStorage.setItem('orbit_user', JSON.stringify(safeUser));
    return { success: true, role: 'student' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('orbit_user');
  };

  const updateUserProgress = (courseId, moduleId) => {
    const users = JSON.parse(localStorage.getItem('orbit_users') || '[]');
    const idx = users.findIndex(u => u.id === user?.id);
    if (idx === -1) return;
    if (!users[idx].completedModules) users[idx].completedModules = {};
    if (!users[idx].completedModules[courseId]) users[idx].completedModules[courseId] = [];
    if (!users[idx].completedModules[courseId].includes(moduleId)) {
      users[idx].completedModules[courseId].push(moduleId);
    }
    localStorage.setItem('orbit_users', JSON.stringify(users));
    const { password: _, ...safe } = users[idx];
    setUser(safe);
    localStorage.setItem('orbit_user', JSON.stringify(safe));
  };

  const enrollCourse = (courseId) => {
    const users = JSON.parse(localStorage.getItem('orbit_users') || '[]');
    const idx = users.findIndex(u => u.id === user?.id);
    if (idx === -1) return;
    if (!users[idx].enrolledCourses.includes(courseId)) {
      users[idx].enrolledCourses.push(courseId);
    }
    localStorage.setItem('orbit_users', JSON.stringify(users));
    const { password: _, ...safe } = users[idx];
    setUser(safe);
    localStorage.setItem('orbit_user', JSON.stringify(safe));
  };

  const addCertificate = (cert) => {
    const users = JSON.parse(localStorage.getItem('orbit_users') || '[]');
    const idx = users.findIndex(u => u.id === user?.id);
    if (idx === -1) return;
    if (!users[idx].certificates) users[idx].certificates = [];
    users[idx].certificates.push(cert);
    localStorage.setItem('orbit_users', JSON.stringify(users));
    const { password: _, ...safe } = users[idx];
    setUser(safe);
    localStorage.setItem('orbit_user', JSON.stringify(safe));
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, signup, logout,
      updateUserProgress, enrollCourse, addCertificate,
      isAdmin: user?.role === 'admin',
      isLoggedIn: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
