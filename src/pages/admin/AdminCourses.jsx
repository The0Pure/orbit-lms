// src/pages/admin/AdminCourses.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit3, Trash2, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import toast from 'react-hot-toast';

export default function AdminCourses() {
  const { courses, deleteCourse, updateCourse } = useCourses();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id) => {
    deleteCourse(id);
    setDeleteConfirm(null);
    toast.success('Course deleted');
  };

  const togglePublish = (course) => {
    updateCourse(course.id, { published: !course.published });
    toast.success(course.published ? 'Course unpublished' : 'Course published');
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-orbit-navy">Courses</h1>
          <p className="text-gray-500 mt-1">{courses.length} total · {courses.filter(c => c.published).length} published</p>
        </div>
        <Link to="/admin/courses/new" className="btn-primary">
          <Plus size={18} /> Add Course
        </Link>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search courses..."
        className="orbit-input mb-6 max-w-sm"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Table */}
      <div className="bg-white rounded-2xl border border-orbit-cream-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-orbit-bg border-b border-orbit-cream-light">
              <tr>
                {['Course', 'Category', 'Price', 'Students', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-orbit-cream-light">
              {filtered.map(course => (
                <tr key={course.id} className="hover:bg-orbit-bg/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: course.color }}>
                        {course.logoUrl
                          ? <img src={course.logoUrl} className="w-8 h-8 object-contain" alt="" />
                          : course.emoji
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-orbit-navy truncate max-w-[200px]">{course.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{course.instructor}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{course.category}</td>
                  <td className="px-5 py-4 font-bold text-orbit-navy">${course.price}</td>
                  <td className="px-5 py-4 text-gray-600">{course.students.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      course.published ? 'bg-orbit-teal/10 text-orbit-teal' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {course.published ? '● Published' : '○ Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => togglePublish(course)}
                        title={course.published ? 'Unpublish' : 'Publish'}
                        className="p-2 rounded-lg hover:bg-orbit-bg text-gray-400 hover:text-orbit-navy transition-colors"
                      >
                        {course.published ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <Link to={`/admin/courses/${course.id}/edit`}
                        className="p-2 rounded-lg hover:bg-orbit-bg text-gray-400 hover:text-orbit-navy transition-colors">
                        <Edit3 size={16} />
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(course.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">No courses found</div>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center animate-slide-up">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={26} className="text-red-500" />
            </div>
            <h3 className="font-display text-xl font-bold text-orbit-navy mb-2">Delete Course?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone. All enrolled students will lose access.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 px-5 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 active:scale-95 transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
