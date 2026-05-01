// src/pages/admin/AdminDashboard.jsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Users, BookOpen, ShoppingBag, TrendingUp } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';

export default function AdminDashboard() {
  const { getRevenueStats, courses } = useCourses();
  const stats = getRevenueStats();

  const kpis = [
    { icon: <DollarSign size={22} />, label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, sub: `+${stats.growth}% vs last month`, color: 'text-orbit-gold', bg: 'bg-orbit-gold/10' },
    { icon: <ShoppingBag size={22} />, label: 'Total Orders', value: stats.totalOrders, sub: `${stats.thisMonthRevenue} this month`, color: 'text-orbit-teal', bg: 'bg-orbit-teal/10' },
    { icon: <Users size={22} />, label: 'Students', value: stats.totalStudents.toLocaleString(), sub: 'Unique learners', color: 'text-purple-500', bg: 'bg-purple-50' },
    { icon: <BookOpen size={22} />, label: 'Live Courses', value: courses.filter(c => c.published).length, sub: `${courses.length} total`, color: 'text-orbit-navy', bg: 'bg-orbit-navy/10' },
  ];

  const PIE_COLORS = ['#B8965A', '#4A7C6F'];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-orbit-navy">Dashboard</h1>
        <p className="text-gray-500 mt-1">Platform overview &amp; revenue analytics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {kpis.map((k, i) => (
          <div key={i} className="bg-white rounded-2xl border border-orbit-cream-light p-5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${k.bg} ${k.color} mb-4`}>{k.icon}</div>
            <p className="font-display text-2xl font-bold text-orbit-navy">{k.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{k.label}</p>
            <p className="text-xs text-orbit-teal font-medium mt-1 flex items-center gap-1">
              <TrendingUp size={11} /> {k.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-orbit-cream-light p-6">
          <h3 className="font-bold text-orbit-navy mb-6">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.revenueByMonth} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #E8E4DD', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                formatter={v => [`$${v}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#B8965A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl border border-orbit-cream-light p-6">
          <h3 className="font-bold text-orbit-navy mb-6">Payment Methods</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={Object.entries(stats.paymentMethods).map(([name, value]) => ({ name, value }))}
                cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                dataKey="value" paddingAngle={3}
              >
                {Object.keys(stats.paymentMethods).map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {Object.entries(stats.paymentMethods).map(([method, count], i) => (
              <div key={method} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-gray-600 capitalize">{method.replace('_', ' ')}</span>
                </div>
                <span className="font-semibold text-orbit-navy">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Courses */}
      <div className="bg-white rounded-2xl border border-orbit-cream-light p-6">
        <h3 className="font-bold text-orbit-navy mb-5">Top Performing Courses</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-orbit-cream-light">
                {['Course', 'Category', 'Students', 'Sales', 'Revenue'].map(h => (
                  <th key={h} className="text-left py-3 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.topCourses.map((c, i) => (
                <tr key={c.id} className="border-b border-orbit-cream-light/50 hover:bg-orbit-bg transition-colors">
                  <td className="py-3.5 px-2">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: c.color }}>
                        {c.emoji}
                      </span>
                      <span className="font-medium text-orbit-navy truncate max-w-[160px]">{c.title}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-2 text-gray-500">{c.category}</td>
                  <td className="py-3.5 px-2 font-medium text-orbit-navy">{c.students.toLocaleString()}</td>
                  <td className="py-3.5 px-2 font-medium text-orbit-navy">{c.sales}</td>
                  <td className="py-3.5 px-2 font-bold text-orbit-gold">${c.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
