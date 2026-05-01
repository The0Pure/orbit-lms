// src/context/CourseContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_COURSES, SAMPLE_ORDERS } from '../data/courses';

const CourseContext = createContext(null);

export function CourseProvider({ children }) {
  const [courses, setCourses] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('orbit_courses');
    setCourses(stored ? JSON.parse(stored) : INITIAL_COURSES);
    const storedOrders = localStorage.getItem('orbit_orders');
    setOrders(storedOrders ? JSON.parse(storedOrders) : SAMPLE_ORDERS);
  }, []);

  const persist = (updated) => {
    setCourses(updated);
    localStorage.setItem('orbit_courses', JSON.stringify(updated));
  };

  const persistOrders = (updated) => {
    setOrders(updated);
    localStorage.setItem('orbit_orders', JSON.stringify(updated));
  };

  // ── Admin CRUD ──
  const addCourse = (course) => {
    const newCourse = {
      ...course,
      id: `course-${Date.now()}`,
      slug: course.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      students: 0,
      rating: 0,
      createdAt: new Date().toISOString(),
      modules: course.modules || [],
    };
    persist([...courses, newCourse]);
    return newCourse;
  };

  const updateCourse = (id, updates) => {
    const updated = courses.map(c => c.id === id ? { ...c, ...updates } : c);
    persist(updated);
  };

  const deleteCourse = (id) => {
    persist(courses.filter(c => c.id !== id));
  };

  const getCourse = (idOrSlug) =>
    courses.find(c => c.id === idOrSlug || c.slug === idOrSlug);

  // ── Orders ──
  const addOrder = (order) => {
    const newOrder = { ...order, id: `ord-${Date.now()}`, date: new Date().toISOString() };
    persistOrders([...orders, newOrder]);
    return newOrder;
  };

  // ── Revenue stats ──
  const getRevenueStats = () => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const monthlyRevenue = Array(12).fill(0);
    orders.forEach(o => {
      const d = new Date(o.date);
      if (d.getFullYear() === thisYear) monthlyRevenue[d.getMonth()] += o.amount;
    });

    const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
    const thisMonthRevenue = monthlyRevenue[thisMonth];
    const lastMonthRevenue = monthlyRevenue[(thisMonth + 11) % 12];
    const growth = lastMonthRevenue ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : 0;

    const revenueByMonth = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      .map((month, i) => ({ month, revenue: monthlyRevenue[i] }));

    const paymentMethods = orders.reduce((acc, o) => {
      acc[o.paymentMethod] = (acc[o.paymentMethod] || 0) + 1;
      return acc;
    }, {});

    const topCourses = courses.map(c => ({
      ...c,
      revenue: orders.filter(o => o.courseId === c.id).reduce((s, o) => s + o.amount, 0),
      sales: orders.filter(o => o.courseId === c.id).length,
    })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    return {
      totalRevenue,
      totalOrders: orders.length,
      totalStudents: new Set(orders.map(o => o.userId)).size,
      thisMonthRevenue,
      growth,
      revenueByMonth,
      paymentMethods,
      topCourses,
    };
  };

  return (
    <CourseContext.Provider value={{
      courses, orders,
      addCourse, updateCourse, deleteCourse, getCourse,
      addOrder, getRevenueStats,
      publishedCourses: courses.filter(c => c.published),
    }}>
      {children}
    </CourseContext.Provider>
  );
}

export const useCourses = () => useContext(CourseContext);
