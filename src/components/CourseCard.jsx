// src/components/CourseCard.jsx
import { Link } from 'react-router-dom';
import { Star, Clock, Users, BarChart2 } from 'lucide-react';

export default function CourseCard({ course }) {
  const levelColor = {
    Beginner: 'bg-green-100 text-green-700',
    Intermediate: 'bg-amber-100 text-amber-700',
    Advanced: 'bg-red-100 text-red-700',
  }[course.level] || 'bg-gray-100 text-gray-600';

  return (
    <Link to={`/courses/${course.slug}`} className="orbit-card block group">
      {/* Thumbnail */}
      <div
        className="relative h-44 flex items-center justify-center overflow-hidden rounded-t-2xl"
        style={{ background: course.color || '#2D3347' }}
      >
        {course.logoUrl ? (
          <img src={course.logoUrl} alt={course.title} className="w-20 h-20 object-contain" />
        ) : (
          <span className="text-5xl">{course.emoji || '📚'}</span>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 group-hover:to-black/30 transition-all" />
        <span className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white`}>
          {course.level}
        </span>
        {course.modules?.some(m => m.free) && (
          <span className="absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full bg-orbit-teal text-white">
            Free Preview
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <span className="text-xs font-bold text-orbit-gold uppercase tracking-widest">{course.category}</span>
        <h3 className="mt-1.5 mb-1 font-bold text-orbit-navy text-[15px] leading-snug group-hover:text-orbit-gold transition-colors line-clamp-2">
          {course.title}
        </h3>
        <p className="text-sm text-gray-500 mb-3">{course.instructor}</p>

        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          {course.rating > 0 && (
            <span className="flex items-center gap-1 text-orbit-gold font-semibold">
              <Star size={12} fill="currentColor" /> {course.rating}
            </span>
          )}
          <span className="flex items-center gap-1"><Clock size={12} /> {course.duration}</span>
          {course.students > 0 && (
            <span className="flex items-center gap-1"><Users size={12} /> {course.students.toLocaleString()}</span>
          )}
        </div>

        <div className="flex items-baseline gap-2 pt-3 border-t border-orbit-cream-light">
          <span className="font-display text-xl font-bold text-orbit-navy">${course.price}</span>
          {course.originalPrice && (
            <span className="text-sm text-gray-400 line-through">${course.originalPrice}</span>
          )}
          {course.originalPrice && (
            <span className="ml-auto text-xs font-semibold text-orbit-teal bg-orbit-teal/10 px-2 py-0.5 rounded-full">
              {Math.round((1 - course.price / course.originalPrice) * 100)}% OFF
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
