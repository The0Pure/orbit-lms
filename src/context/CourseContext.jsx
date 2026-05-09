import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const CourseContext = createContext(null);

export function CourseProvider({ children }) {
  const { user, isAdmin } = useAuth();

  const [courses,  setCourses]  = useState([]);
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);

  // ── Fetch courses ─────────────────────────────────────────
  const fetchCourses = useCallback(async () => {
    const query = supabase.from('courses').select('*').order('created_at', { ascending: false });
    const { data, error } = isAdmin ? await query : await query.eq('published', true);
    if (error) { console.error('fetchCourses:', error.message); return; }
    setCourses(data || []);
  }, [isAdmin]);

  // ── Fetch orders (admin: all; student: own) ───────────────
  const fetchOrders = useCallback(async () => {
    if (!user) { setOrders([]); return; }
    let query = supabase
      .from('orders')
      .select(`*, profiles:user_id(first_name, last_name, email)`)
      .order('created_at', { ascending: false });
    if (!isAdmin) query = query.eq('user_id', user.id);
    const { data, error } = await query;
    if (error) { console.error('fetchOrders:', error.message); return; }
    // Normalise to the shape the rest of the app expects
    setOrders((data || []).map(o => ({
      id:             o.id,
      userId:         o.user_id,
      userName:       o.profiles ? `${o.profiles.first_name} ${o.profiles.last_name}`.trim() : '',
      userEmail:      o.profiles?.email || '',
      courseId:       o.course_id,
      courseName:     o.course_name,
      originalAmount: o.original_amount,
      discountCode:   o.discount_code,
      discountAmt:    o.discount_amt,
      amount:         o.amount,
      method:         o.method,
      status:         o.status,
      date:           new Date(o.created_at).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }),
    })));
  }, [user, isAdmin]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchCourses();
      await fetchOrders();
      setLoading(false);
    })();
  }, [fetchCourses, fetchOrders]);

  // ── Course CRUD (admin only — RLS enforces on server) ─────
  const addCourse = async (courseData) => {
    const slug = courseData.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 80);

    const { data, error } = await supabase
      .from('courses')
      .insert({ ...mapCourseToDb(courseData), slug, students: 0, rating: 0 })
      .select()
      .single();

    if (error) { console.error('addCourse:', error.message); return null; }
    await fetchCourses();
    return data;
  };

  const updateCourse = async (id, updates) => {
    const { error } = await supabase
      .from('courses')
      .update(mapCourseToDb(updates))
      .eq('id', id);
    if (error) { console.error('updateCourse:', error.message); return; }
    await fetchCourses();
  };

  const deleteCourse = async (id) => {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) { console.error('deleteCourse:', error.message); return; }
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const getCourse = (idOrSlug) =>
    courses.find(c => c.id === idOrSlug || c.slug === idOrSlug);

  // ── Payment / Enrollment ──────────────────────────────────
  // For free courses: enroll directly (admin RLS bypass via service role is not
  // needed — free enrollment is handled server-side via api/enroll-free endpoint).
  // For paid courses: create a pending order + initiate Stripe; the webhook
  // completes the enrollment (see api/verify-payment.js).

  const createPendingOrder = async ({ courseId, courseName, amount, originalAmount, discountCode, discountAmt, method }) => {
    if (!user) return { success: false, error: 'Not logged in' };
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id:         user.id,
        course_id:       courseId,
        course_name:     courseName,
        original_amount: originalAmount,
        discount_code:   discountCode || null,
        discount_amt:    discountAmt || 0,
        amount:          amount,
        method,
        status:          'pending',
      })
      .select()
      .single();
    if (error) return { success: false, error: error.message };
    return { success: true, orderId: data.id };
  };

  // ── Discount codes ────────────────────────────────────────
  const getDiscountCodes = async () => {
    if (!isAdmin) return [];
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return [];
    return data;
  };

  const validateDiscountCode = async (code) => {
    // RLS only returns active, non-expired, non-exhausted codes
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .maybeSingle();
    if (error || !data) return null;
    return data;
  };

  const saveDiscountCode = async (codeData, editId = null) => {
    const entry = {
      code:        codeData.code.trim().toUpperCase(),
      type:        codeData.type,
      value:       Number(codeData.value),
      max_uses:    codeData.maxUses ? Number(codeData.maxUses) : null,
      expiry:      codeData.expiry || null,
      active:      codeData.active,
      description: codeData.description || '',
    };
    if (editId) {
      const { error } = await supabase.from('discount_codes').update(entry).eq('id', editId);
      return !error;
    }
    const { error } = await supabase.from('discount_codes').insert(entry);
    return !error;
  };

  const deleteDiscountCode = async (id) => {
    const { error } = await supabase.from('discount_codes').delete().eq('id', id);
    return !error;
  };

  const toggleDiscountCode = async (id, active) => {
    const { error } = await supabase.from('discount_codes').update({ active }).eq('id', id);
    return !error;
  };

  // ── Users (admin only) ────────────────────────────────────
  const getUsers = async () => {
    if (!isAdmin) return [];
    const { data, error } = await supabase
      .from('profiles')
      .select('*, auth_users:id(email, created_at, email_confirmed_at)')
      .order('created_at', { ascending: false });
    if (error) { console.error('getUsers:', error.message); return []; }
    return (data || []).map(p => ({
      id:          p.id,
      firstName:   p.first_name,
      lastName:    p.last_name,
      name:        `${p.first_name} ${p.last_name}`.trim(),
      email:       p.auth_users?.email || '',
      role:        p.role,
      verified:    !!p.auth_users?.email_confirmed_at,
      createdAt:   p.created_at,
      avatarUrl:   p.avatar_url,
    }));
  };

  const updateUserAdmin = async (id, updates) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: updates.firstName,
        last_name:  updates.lastName,
        role:       updates.role,
      })
      .eq('id', id);
    return !error;
  };

  const deleteUserAdmin = async (id) => {
    // Deletes from auth.users (cascade removes profile + all related data)
    const { error } = await supabase.rpc('delete_user', { target_user_id: id });
    return !error;
  };

  // ── Revenue stats ─────────────────────────────────────────
  const getRevenueStats = useCallback(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear  = now.getFullYear();

    const monthlyRevenue = Array(12).fill(0);
    orders.forEach(o => {
      if (o.status !== 'completed') return;
      const d = new Date(o.date);
      if (d.getFullYear() === thisYear) monthlyRevenue[d.getMonth()] += Number(o.amount);
    });

    const totalRevenue     = orders.filter(o => o.status === 'completed').reduce((s, o) => s + Number(o.amount), 0);
    const thisMonthRevenue = monthlyRevenue[thisMonth];
    const lastMonthRevenue = monthlyRevenue[(thisMonth + 11) % 12];
    const growth           = lastMonthRevenue
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : 0;

    const revenueByMonth = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      .map((month, i) => ({ month, revenue: monthlyRevenue[i] }));

    const paymentMethods = orders.reduce((acc, o) => {
      acc[o.method] = (acc[o.method] || 0) + 1;
      return acc;
    }, {});

    const topCourses = courses.map(c => ({
      ...c,
      revenue: orders.filter(o => o.courseId === c.id && o.status === 'completed').reduce((s, o) => s + Number(o.amount), 0),
      sales:   orders.filter(o => o.courseId === c.id && o.status === 'completed').length,
    })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    return {
      totalRevenue,
      totalOrders:   orders.filter(o => o.status === 'completed').length,
      totalStudents: new Set(orders.filter(o => o.status === 'completed').map(o => o.userId)).size,
      thisMonthRevenue,
      growth,
      revenueByMonth,
      paymentMethods,
      topCourses,
    };
  }, [orders, courses]);

  return (
    <CourseContext.Provider value={{
      courses,
      orders,
      loading,
      publishedCourses: courses.filter(c => c.published),
      fetchCourses,
      fetchOrders,
      addCourse,
      updateCourse,
      deleteCourse,
      getCourse,
      createPendingOrder,
      getDiscountCodes,
      validateDiscountCode,
      saveDiscountCode,
      deleteDiscountCode,
      toggleDiscountCode,
      getUsers,
      updateUserAdmin,
      deleteUserAdmin,
      getRevenueStats,
    }}>
      {children}
    </CourseContext.Provider>
  );
}

export const useCourses = () => {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourses must be used inside CourseProvider');
  return ctx;
};

// ── Helpers ───────────────────────────────────────────────
function mapCourseToDb(c) {
  const out = {};
  if (c.title       !== undefined) out.title        = c.title;
  if (c.titleAr     !== undefined) out.title_ar      = c.titleAr;
  if (c.description !== undefined) out.description   = c.description;
  if (c.descAr      !== undefined) out.desc_ar       = c.descAr;
  if (c.price       !== undefined) out.price         = Number(c.price) || 0;
  if (c.currency    !== undefined) out.currency      = c.currency;
  if (c.level       !== undefined) out.level         = c.level;
  if (c.language    !== undefined) out.language      = c.language;
  if (c.duration    !== undefined) out.duration      = c.duration;
  if (c.category    !== undefined) out.category      = c.category;
  if (c.color       !== undefined) out.color         = c.color;
  if (c.patternType !== undefined) out.pattern_type  = c.patternType;
  if (c.iconUrl     !== undefined) out.icon_url      = c.iconUrl;
  if (c.isFree      !== undefined) out.is_free       = c.isFree;
  if (c.published   !== undefined) out.published     = c.published;
  if (c.modules     !== undefined) out.modules       = c.modules;
  if (c.whatLearn   !== undefined) out.what_learn    = c.whatLearn;
  if (c.instructor  !== undefined) out.instructor    = c.instructor;
  if (c.students    !== undefined) out.students      = c.students;
  if (c.rating      !== undefined) out.rating        = c.rating;
  return out;
}
