// src/pages/admin/AdminOrders.jsx
import { useCourses } from '../../context/CourseContext';

export default function AdminOrders() {
  const { orders, courses } = useCourses();
  const sorted = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-orbit-navy">Orders</h1>
        <p className="text-gray-500 mt-1">{orders.length} total transactions</p>
      </div>

      <div className="bg-white rounded-2xl border border-orbit-cream-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-orbit-bg border-b border-orbit-cream-light">
              <tr>
                {['Order ID', 'Course', 'Date', 'Amount', 'Method', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-orbit-cream-light">
              {sorted.map(order => {
                const course = courses.find(c => c.id === order.courseId);
                return (
                  <tr key={order.id} className="hover:bg-orbit-bg/50 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-gray-500">{order.id}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-orbit-navy truncate max-w-[180px]">{course?.title || order.courseId}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">
                      {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 font-bold text-orbit-gold">${order.amount}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        order.paymentMethod === 'apple_pay' ? 'bg-gray-900 text-white' :
                        order.paymentMethod === 'amazon_pay' ? 'bg-[#FF9900]/15 text-[#B36B00]' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {order.paymentMethod === 'apple_pay' ? '🍎 Apple Pay' :
                         order.paymentMethod === 'amazon_pay' ? '📦 Amazon Pay' : '💳 Card'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orbit-teal/10 text-orbit-teal">
                        ● {order.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
