import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,             setUser]             = useState(null);
  const [profile,          setProfile]          = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [isRecovering,     setIsRecovering]     = useState(false);

  // Build a merged user object the rest of the app can consume
  const buildUser = useCallback((supabaseUser, prof) => {
    if (!supabaseUser) return null;
    const p = prof || {};
    return {
      id:              supabaseUser.id,
      email:           supabaseUser.email,
      firstName:       p.first_name || '',
      lastName:        p.last_name  || '',
      name:            `${p.first_name || ''} ${p.last_name || ''}`.trim() || supabaseUser.email,
      phone:           p.phone       || '',
      avatar:          p.avatar_url  || `${(p.first_name||'?')[0]}${(p.last_name||'?')[0]}`.toUpperCase(),
      role:            p.role        || 'student',
      provider:        p.provider    || 'email',
    };
  }, []);

  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      console.error('fetchProfile error:', error.message);
      return null;
    }
    return data;
  }, []);

  // ── Initialise session ──────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const prof = await fetchProfile(session.user.id);
        setProfile(prof);
        setUser(buildUser(session.user, prof));
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Supabase fires PASSWORD_RECOVERY when the user arrives via a reset link.
      // detectSessionInUrl clears the hash before React mounts, so we must
      // detect recovery here rather than from the URL.
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovering(true);
      }

      if (session?.user) {
        const prof = await fetchProfile(session.user.id);
        setProfile(prof);
        setUser(buildUser(session.user, prof));
        // Fetch enrolled course IDs for fast client-side checks
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('user_id', session.user.id);
        setEnrolledCourseIds((enrollments || []).map(e => e.course_id));
      } else {
        setProfile(null);
        setUser(null);
        setEnrolledCourseIds([]);
        setIsRecovering(false);
      }
      if (event === 'INITIAL_SESSION') setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [buildUser, fetchProfile]);

  // ── Sign up ─────────────────────────────────────────────
  const signup = async ({ firstName, lastName, email, password }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName, provider: 'email' },
      },
    });

    if (error) return { success: false, error: error.message };

    return {
      success: true,
      emailConfirmationRequired: false,
      role: 'student',
    };
  };

  // ── Sign in ─────────────────────────────────────────────
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Supabase returns a generic message; keep it to avoid user enumeration
      return { success: false, error: 'Invalid email or password.' };
    }
    const prof = await fetchProfile(data.user.id);
    return { success: true, role: prof?.role || 'student' };
  };

  // ── Sign in with Google (Authorization Code + PKCE via Supabase) ───
  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: { access_type: 'offline', prompt: 'select_account' },
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  // ── Sign out ─────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // ── Password reset (sends Supabase email, no client-side token) ──
  const requestPasswordReset = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, error: error.message };
    setIsRecovering(false);
    return { success: true };
  };

  // ── Profile update ───────────────────────────────────────
  const updateProfile = async (updates) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: updates.firstName,
        last_name:  updates.lastName,
        phone:      updates.phone || '',
      })
      .eq('id', user.id);

    if (error) return { success: false, error: error.message };

    const prof = await fetchProfile(user.id);
    setProfile(prof);
    setUser(buildUser(await supabase.auth.getUser().then(r => r.data.user), prof));
    return { success: true };
  };

  // ── Progress tracking ────────────────────────────────────
  const markModuleComplete = async (courseId, moduleId) => {
    const { error } = await supabase
      .from('module_completions')
      .upsert({ user_id: user.id, course_id: courseId, module_id: moduleId });
    if (error) console.error('markModuleComplete:', error.message);
  };

  const getCompletedModules = async (courseId) => {
    const { data, error } = await supabase
      .from('module_completions')
      .select('module_id')
      .eq('user_id', user.id)
      .eq('course_id', courseId);
    if (error) return [];
    return data.map(r => r.module_id);
  };

  const getEnrolledCourses = async () => {
    const { data, error } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('user_id', user.id);
    if (error) return [];
    return data.map(r => r.course_id);
  };

  const isEnrolled = async (courseId) => {
    const { data } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle();
    return !!data;
  };

  // ── Certificates ─────────────────────────────────────────
  const getCertificates = async () => {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', user.id)
      .order('issued_at', { ascending: false });
    if (error) return [];
    return data;
  };

  const refreshEnrollments = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('user_id', user.id);
    setEnrolledCourseIds((data || []).map(e => e.course_id));
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      enrolledCourseIds,
      isAdmin:   user?.role === 'admin',
      isLoggedIn: !!user,
      isRecovering,
      signup,
      login,
      loginWithGoogle,
      logout,
      requestPasswordReset,
      updatePassword,
      updateProfile,
      markModuleComplete,
      getCompletedModules,
      getEnrolledCourses,
      isEnrolled,
      getCertificates,
      refreshEnrollments,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
