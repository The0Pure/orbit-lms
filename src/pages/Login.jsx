// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      toast.success('Welcome back!');
      navigate(result.role === 'admin' ? '/admin' : '/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="pt-[70px] min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex justify-center mb-5">
            <Logo size={52} />
          </Link>
          <h1 className="font-display text-3xl font-bold text-orbit-navy">Welcome Back</h1>
          <p className="text-gray-500 mt-2 text-sm">Sign in to continue your learning journey</p>
        </div>

        <div className="bg-white rounded-3xl border border-orbit-cream-light shadow-orbit p-8">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-5">
              <AlertCircle size={16} className="shrink-0" /> {error}
            </div>
          )}

          {/* Demo credentials hint */}
          <div className="p-3 bg-orbit-gold/8 border border-orbit-gold/20 rounded-xl text-xs text-orbit-navy/70 mb-5">
            <p className="font-semibold mb-1">Demo Admin:</p>
            <p>Email: admin@orbit.com · Password: OrbitAdmin2026!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="orbit-label">Email</label>
              <input type="email" required placeholder="you@example.com" className="orbit-input"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="orbit-label mb-0">Password</label>
                <button type="button" className="text-xs text-orbit-gold font-semibold hover:underline">Forgot?</button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required placeholder="Your password" className="orbit-input pr-11"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orbit-navy">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="relative my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-orbit-cream-light" />
            <span className="text-xs text-gray-400">or continue with</span>
            <div className="flex-1 h-px bg-orbit-cream-light" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {['G', '𝕏', 'in'].map(icon => (
              <button key={icon} onClick={() => toast('OAuth — configure in AuthContext.jsx')}
                className="py-2.5 border border-orbit-cream-light rounded-xl text-sm font-bold text-orbit-navy hover:bg-orbit-bg transition-colors">
                {icon}
              </button>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-orbit-gold font-semibold hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── SIGNUP ───────────────────────────────────────
export function Signup() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    const result = await signup(form);
    setLoading(false);
    if (result.success) {
      toast.success('Account created! Welcome to Orbit 🎉');
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="pt-[70px] min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex justify-center mb-5"><Logo size={52} /></Link>
          <h1 className="font-display text-3xl font-bold text-orbit-navy">Create Account</h1>
          <p className="text-gray-500 mt-2 text-sm">Start your journey with Orbit</p>
        </div>

        <div className="bg-white rounded-3xl border border-orbit-cream-light shadow-orbit p-8">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-5">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="orbit-label">First Name</label>
                <input required type="text" placeholder="First" className="orbit-input"
                  value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div>
                <label className="orbit-label">Last Name</label>
                <input required type="text" placeholder="Last" className="orbit-input"
                  value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="orbit-label">Email</label>
              <input required type="email" placeholder="you@example.com" className="orbit-input"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>

            <div>
              <label className="orbit-label">Password</label>
              <input required type="password" placeholder="Min. 8 characters" className="orbit-input"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              <p className="text-xs text-gray-400 mt-1.5">Must be at least 8 characters</p>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              By signing up, you agree to our{' '}
              <span className="text-orbit-gold">Terms of Service</span> and{' '}
              <span className="text-orbit-gold">Privacy Policy</span>.
            </p>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-orbit-gold font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
