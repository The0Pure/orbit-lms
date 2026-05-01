// src/pages/Dashboard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, Clock, Flame, Download, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import { downloadCertificate } from '../utils/certificate';
import { sendCertificateEmail } from '../utils/emailCertificate';
import toast from 'react-hot-toast';

const genId = () => Math.random().toString(36).substring(2, 10).toUpperCase();

export default function Dashboard() {
  const { user, addCertificate } = useAuth();
  const { courses } = useCourses();
  const [sendingEmail, setSendingEmail] = useState(null);

  const enrolled = courses.filter(c => user?.enrolledCourses?.includes(c.id));
  const completedModules = user?.completedModules || {};

  const getCourseProgress = (course) => {
    if (!course.modules?.length) return 0;
    const done = (completedModules[course.id] || []).length;
    return Math.round((done / course.modules.length) * 100);
  };

  const isCompleted = (course) => getCourseProgress(course) === 100;
  const completed = enrolled.filter(isCompleted);
  const inProgress = enrolled.filter(c => !isCompleted(c));

  const totalHours = enrolled.reduce((s, c) => {
    const h = parseInt(c.duration) || 0;
    return s + h * (getCourseProgress(c) / 100);
  }, 0);

  const handleDownloadCert = (course) => {
    const certData = {
      studentName: user.name,
      courseName: course.title,
      instructorName: course.instructor,
      completionDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      certificateId: genId(),
    };
    downloadCertificate(certData);
    toast.success('Certificate downloaded!');
  };

  const handleSendCertEmail = async (course) => {
    setSendingEmail(course.id);
    const certId = genId();
    const certData = {
      studentName: user.name,
      studentEmail: user.email,
      courseName: course.title,
      completionDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      certificateId: certId,
    };
    const result = await sendCertificateEmail(certData);
    setSendingEmail(null);
    if (result.success) {
      toast.success(`Certificate sent to ${user.email}`);
      addCertificate({ ...certData, courseId: course.id, issuedAt: new Date().toISOString() });
    } else {
      toast.error(result.error || 'Failed to send email');
    }
  };

  const stats = [
    { icon: <BookOpen size={20} />, value: enrolled.length, label: 'Enrolled', color: 'bg-orbit-teal/10 text-orbit-teal' },
    { icon: <Award size={20} />, value: completed.length, label: 'Completed', color: 'bg-orbit-gold/10 text-orbit-gold' },
    { icon: <Clock size={20} />, value: `${Math.round(totalHours)}h`, label: 'Hours Learned', color: 'bg-orbit-navy/10 text-orbit-navy' },
    { icon: <Flame size={20} />, value: '12 days', label: 'Streak', color: 'bg-red-100 text-red-500' },
  ];

  return (
    <div className="pt-[70px] pb-16">
      <div className="orbit-container pt-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <h1 className="page-title">Welcome back, {user?.firstName || user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-gray-500 mt-1">Continue your learning journey</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orbit-navy flex items-center justify-center text-orbit-cream font-bold text-lg">
            {user?.avatar || '?'}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((s, i) => (
            <div key={i} className="orbit-card p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>{s.icon}</div>
              <div>
                <p className="font-display text-2xl font-bold text-orbit-navy">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* In Progress */}
        {inProgress.length > 0 && (
          <div className="mb-12">
            <h2 className="section-title mb-6">Continue Learning</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {inProgress.map(course => {
                const prog = getCourseProgress(course);
                return (
                  <Link to={`/courses/${course.slug}`} key={course.id}
                    className="orbit-card p-5 flex flex-col gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ background: course.color }}>
                        {course.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-orbit-navy text-sm truncate">{course.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{course.instructor}</p>
                      </div>
                      <span className="font-display text-xl font-bold shrink-0" style={{ color: course.color }}>{prog}%</span>
                    </div>
                    <div>
                      <div className="h-2 bg-orbit-bg rounded-full">
                        <div className="h-2 rounded-full transition-all" style={{ width: `${prog}%`, background: course.color }} />
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5">
                        {(completedModules[course.id] || []).length} / {course.modules?.length || 0} modules
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Certificates */}
        {completed.length > 0 && (
          <div className="mb-12">
            <h2 className="section-title mb-6">🏆 Your Certificates</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {completed.map(course => (
                <div key={course.id} className="orbit-card p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: course.color }}>
                      {course.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-orbit-navy text-sm">{course.title}</p>
                      <div className="flex items-center gap-1 mt-0.5 text-orbit-teal text-xs font-semibold">
                        <CheckCircle size={12} /> Completed
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadCert(course)}
                      className="btn-primary flex-1 py-2.5 text-sm"
                    >
                      <Download size={15} /> Download PDF
                    </button>
                    <button
                      onClick={() => handleSendCertEmail(course)}
                      disabled={sendingEmail === course.id}
                      className="btn-outline flex-1 py-2.5 text-sm"
                    >
                      {sendingEmail === course.id
                        ? <><Loader2 size={15} className="animate-spin" /> Sending...</>
                        : <><Mail size={15} /> Send Email</>
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {enrolled.length === 0 && (
          <div className="text-center py-24">
            <p className="text-5xl mb-5">📚</p>
            <h2 className="font-display text-2xl font-bold text-orbit-navy mb-3">No courses yet</h2>
            <p className="text-gray-500 mb-8">Enroll in your first course and start learning today</p>
            <Link to="/courses" className="btn-primary">Browse Courses</Link>
          </div>
        )}
      </div>
    </div>
  );
}
