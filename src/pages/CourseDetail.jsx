// src/pages/CourseDetail.jsx
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star, Clock, Users, BarChart2, PlayCircle, BookOpen,
  ChevronRight, Check, Lock, Award, ChevronDown, ChevronUp
} from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import VideoPlayer from '../components/VideoPlayer';
import PaymentModal from '../components/PaymentModal';
import toast from 'react-hot-toast';

export default function CourseDetail() {
  const { slug } = useParams();
  const { getCourse } = useCourses();
  const { user, isLoggedIn, updateUserProgress } = useAuth();
  const navigate = useNavigate();

  const course = getCourse(slug);
  const [activeTab, setActiveTab] = useState('curriculum');
  const [showPayment, setShowPayment] = useState(false);
  const [activeModule, setActiveModule] = useState(null);
  const [expandedModule, setExpandedModule] = useState(null);

  if (!course) {
    return (
      <div className="pt-[70px] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">😕</p>
          <h1 className="font-display text-2xl font-bold text-orbit-navy mb-2">Course Not Found</h1>
          <Link to="/courses" className="btn-primary mt-4">Browse Courses</Link>
        </div>
      </div>
    );
  }

  const isEnrolled = user?.enrolledCourses?.includes(course.id);
  const completedModules = user?.completedModules?.[course.id] || [];
  const progress = course.modules?.length
    ? Math.round((completedModules.length / course.modules.length) * 100)
    : 0;

  const handleEnroll = () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    setShowPayment(true);
  };

  const handleModuleComplete = (moduleId) => {
    updateUserProgress(course.id, moduleId);
    toast.success('Module marked complete!');
    if (completedModules.length + 1 >= course.modules.length) {
      toast('🎉 You completed this course! Check your dashboard for your certificate.', { icon: '🏆', duration: 5000 });
    }
  };

  const canAccessModule = (mod) => mod.free || isEnrolled;

  const TABS = ['curriculum', 'overview', 'reviews'];

  return (
    <div className="pt-[70px]">
      {/* ── Hero ── */}
      <div className="py-14" style={{ background: course.color || '#2D3347' }}>
        <div className="orbit-container">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link to="/courses" className="hover:text-white transition-colors">Courses</Link>
            <ChevronRight size={14} />
            <span className="text-white/80">{course.category}</span>
            <ChevronRight size={14} />
            <span className="text-white/80 truncate max-w-[200px]">{course.title}</span>
          </div>

          <div className="max-w-3xl">
            <span className="text-4xl mb-4 block">{course.emoji}</span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
              {course.title}
            </h1>
            <p className="text-white/70 text-lg mb-6">{course.description}</p>
            <p className="text-white/80 text-sm mb-6">Created by <strong className="text-white">{course.instructor}</strong></p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
              {course.rating > 0 && (
                <span className="flex items-center gap-1.5 text-orbit-gold font-semibold">
                  <Star size={15} fill="currentColor" /> {course.rating} rating
                </span>
              )}
              {course.students > 0 && (
                <span className="flex items-center gap-1.5"><Users size={15} /> {course.students.toLocaleString()} students</span>
              )}
              <span className="flex items-center gap-1.5"><Clock size={15} /> {course.duration}</span>
              <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-semibold">
                {course.level}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="orbit-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Content */}
          <div className="lg:col-span-2 order-2 lg:order-1">

            {/* Active Video */}
            {activeModule && (
              <div className="mb-8">
                <VideoPlayer
                  url={activeModule.videoUrl}
                  title={activeModule.title}
                  isLocked={!canAccessModule(activeModule)}
                  onProgress={(p) => {
                    if (p >= 0.9 && isEnrolled && !completedModules.includes(activeModule.id)) {
                      handleModuleComplete(activeModule.id);
                    }
                  }}
                />
                <p className="mt-3 font-semibold text-orbit-navy">{activeModule.title}</p>
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-orbit-cream-light mb-8 overflow-x-auto scrollbar-hide">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={activeTab === tab ? 'orbit-tab-active' : 'orbit-tab'}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* CURRICULUM */}
            {activeTab === 'curriculum' && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500 mb-4">{course.modules?.length || 0} modules · {course.duration} total</p>
                {course.modules?.map((mod, i) => {
                  const done = completedModules.includes(mod.id);
                  const accessible = canAccessModule(mod);
                  const isActive = activeModule?.id === mod.id;
                  return (
                    <div key={mod.id}
                      onClick={() => setActiveModule(mod)}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        isActive
                          ? 'border-orbit-gold bg-orbit-gold/5'
                          : 'border-orbit-cream-light bg-white hover:border-orbit-navy/20'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold ${
                        done ? 'bg-orbit-teal text-white' : 'bg-orbit-bg text-orbit-navy'
                      }`}>
                        {done ? <Check size={16} /> : i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-orbit-navy text-sm truncate">{mod.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {mod.type === 'video' ? '📹' : mod.type === 'reading' ? '📖' : '🛠'} {mod.type} · {mod.duration}
                          {mod.free && <span className="ml-2 text-orbit-teal font-semibold">Free</span>}
                        </p>
                      </div>
                      <div className="shrink-0 text-gray-400">
                        {accessible ? (done ? <Check size={16} className="text-orbit-teal" /> : <PlayCircle size={18} />) : <Lock size={15} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div>
                <h3 className="font-display text-xl font-bold text-orbit-navy mb-5">What You'll Learn</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
                  {course.whatYouLearn?.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-orbit-bg rounded-xl">
                      <div className="w-5 h-5 rounded-md bg-orbit-teal/15 flex items-center justify-center mt-0.5 shrink-0">
                        <Check size={12} className="text-orbit-teal" />
                      </div>
                      <span className="text-sm text-orbit-navy/80">{item}</span>
                    </div>
                  ))}
                </div>

                <h3 className="font-display text-xl font-bold text-orbit-navy mb-5">Requirements</h3>
                <ul className="space-y-2 mb-10">
                  {course.requirements?.map((req, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-orbit-navy/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-orbit-gold shrink-0" />{req}
                    </li>
                  ))}
                </ul>

                <h3 className="font-display text-xl font-bold text-orbit-navy mb-3">About the Instructor</h3>
                <div className="p-5 bg-white rounded-2xl border border-orbit-cream-light">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-orbit-navy flex items-center justify-center text-orbit-cream font-bold">
                      {course.instructor?.[0]}
                    </div>
                    <div>
                      <p className="font-bold text-orbit-navy">{course.instructor}</p>
                      <p className="text-xs text-gray-500">{course.category} Expert</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{course.instructorBio}</p>
                </div>
              </div>
            )}

            {/* REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {[
                  { name: 'Noura K.', rating: 5, text: 'Incredible depth and quality. This course gave me everything I needed to land my next role.', date: '2 weeks ago' },
                  { name: 'Carlos M.', rating: 5, text: "Best structured course I've taken. The projects are real and the instructor explains everything clearly.", date: '1 month ago' },
                  { name: 'Priya S.', rating: 4, text: 'Great content. Would love more advanced sections added in future updates.', date: '2 months ago' },
                ].map((r, i) => (
                  <div key={i} className="orbit-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-orbit-navy flex items-center justify-center text-orbit-cream text-sm font-bold">
                        {r.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-orbit-navy text-sm">{r.name}</p>
                        <div className="flex gap-0.5 mt-0.5">
                          {Array(r.rating).fill(0).map((_, j) => <Star key={j} size={11} className="text-orbit-gold fill-orbit-gold" />)}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{r.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Enroll card */}
          <div className="order-1 lg:order-2">
            <div className="bg-white rounded-2xl border border-orbit-cream-light shadow-orbit p-6 sticky top-[86px]">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-display text-3xl font-bold text-orbit-navy">${course.price}</span>
                {course.originalPrice && <span className="text-lg text-gray-400 line-through">${course.originalPrice}</span>}
                {course.originalPrice && (
                  <span className="text-sm font-semibold text-orbit-teal">{Math.round((1 - course.price / course.originalPrice) * 100)}% OFF</span>
                )}
              </div>

              {isEnrolled ? (
                <>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-orbit-navy">Your progress</span>
                      <span className="font-bold text-orbit-gold">{progress}%</span>
                    </div>
                    <div className="h-2 bg-orbit-bg rounded-full">
                      <div className="h-2 bg-orbit-gold rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveModule(course.modules?.[0])}
                    className="btn-primary w-full py-3.5"
                  >
                    <PlayCircle size={18} /> Continue Learning
                  </button>
                </>
              ) : (
                <button onClick={handleEnroll} className="btn-primary w-full py-3.5 mb-3">
                  Enroll Now
                </button>
              )}

              <p className="text-center text-xs text-gray-400 mt-3 mb-5">30-day money-back guarantee</p>

              <ul className="space-y-3 border-t border-orbit-cream-light pt-5 text-sm">
                {[
                  ['📹', `${course.modules?.length || 0} lessons`],
                  ['⏱', `${course.duration} of content`],
                  ['♾️', 'Lifetime access'],
                  ['📱', 'Mobile &amp; desktop'],
                  ['🏆', 'Certificate of completion'],
                ].map(([icon, text]) => (
                  <li key={text} className="flex items-center gap-3 text-gray-600">
                    <span>{icon}</span>{text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          course={course}
          onClose={() => setShowPayment(false)}
          onSuccess={() => navigate(`/courses/${slug}`)}
        />
      )}
    </div>
  );
}
