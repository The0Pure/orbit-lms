// src/pages/admin/AdminAnalytics.jsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useCourses } from '../../context/CourseContext';

export default function AdminAnalytics() {
  const { getRevenueStats } = useCourses();
  const stats = getRevenueStats();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-orbit-navy">Analytics</h1>
        <p className="text-gray-500 mt-1">Detailed platform performance metrics</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-orbit-cream-light p-6">
          <h3 className="font-bold text-orbit-navy mb-6">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stats.revenueByMonth}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B8965A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#B8965A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={v => [`$${v}`, 'Revenue']} contentStyle={{ borderRadius: 12, border: '1px solid #E8E4DD' }} />
              <Area type="monotone" dataKey="revenue" stroke="#B8965A" strokeWidth={2.5} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-orbit-cream-light p-6">
          <h3 className="font-bold text-orbit-navy mb-6">Enrollments Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={stats.revenueByMonth.map((d, i) => ({ ...d, enrollments: Math.round(d.revenue / 95) }))}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E8E4DD' }} />
              <Line type="monotone" dataKey="enrollments" stroke="#4A7C6F" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── STUDENTS ─────────────────────────────────────
export function AdminStudents() {
  const users = JSON.parse(localStorage.getItem('orbit_users') || '[]');

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-orbit-navy">Students</h1>
        <p className="text-gray-500 mt-1">{users.length} registered students</p>
      </div>

      <div className="bg-white rounded-2xl border border-orbit-cream-light overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-orbit-bg border-b border-orbit-cream-light">
            <tr>
              {['Student', 'Email', 'Joined', 'Courses', 'Certificates'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-orbit-cream-light">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-orbit-bg/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-orbit-navy flex items-center justify-center text-orbit-cream text-sm font-bold">
                      {u.avatar || u.name?.[0] || '?'}
                    </div>
                    <span className="font-medium text-orbit-navy">{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-500">{u.email}</td>
                <td className="px-5 py-4 text-gray-500 text-xs">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                </td>
                <td className="px-5 py-4 font-semibold text-orbit-navy">{u.enrolledCourses?.length || 0}</td>
                <td className="px-5 py-4 font-semibold text-orbit-gold">{u.certificates?.length || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-16 text-gray-400">No students registered yet</div>
        )}
      </div>
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────
export function AdminSettings() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-orbit-navy">Settings</h1>
        <p className="text-gray-500 mt-1">Platform configuration</p>
      </div>

      <div className="space-y-4">
        {[
          { title: 'EmailJS Integration', desc: 'Configure to enable certificate emails', key: 'VITE_EMAILJS_SERVICE_ID' },
          { title: 'Amazon Pay', desc: 'Set Merchant ID &amp; Store ID for live payments', key: 'VITE_AMAZON_PAY_MERCHANT_ID' },
          { title: 'Apple Pay Domain Verification', desc: 'Add apple-developer-merchantid-domain-association file to /public', key: 'apple_pay_domain' },
          { title: 'Admin Credentials', desc: 'Change admin email/password in Vercel env vars', key: 'VITE_ADMIN_EMAIL' },
        ].map(item => (
          <div key={item.key} className="bg-white rounded-2xl border border-orbit-cream-light p-5">
            <h3 className="font-bold text-orbit-navy">{item.title}</h3>
            <p className="text-sm text-gray-500 mt-1 mb-3">{item.desc}</p>
            <code className="text-xs bg-orbit-bg px-3 py-1.5 rounded-lg font-mono text-orbit-navy/70">{item.key}</code>
          </div>
        ))}

        <div className="bg-orbit-gold/8 border border-orbit-gold/20 rounded-2xl p-5">
          <p className="text-sm font-semibold text-orbit-navy mb-1">💡 Configuration</p>
          <p className="text-sm text-gray-600">All settings are managed via environment variables. See <code className="bg-orbit-bg px-1.5 py-0.5 rounded font-mono text-xs">.env.example</code> for the complete list. Add them to Vercel → Settings → Environment Variables.</p>
        </div>
      </div>
    </div>
  );
}
