// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { ArrowRight, Award, BarChart2, Globe, BookOpen, ChevronRight, Star } from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import CourseCard from '../components/CourseCard';
import Logo from '../components/Logo';

export default function Home() {
  const { publishedCourses } = useCourses();
  const featured = publishedCourses.slice(0, 3);

  const categories = [
    { name: 'UI/UX Design', count: 42, emoji: '🎨', bg: '#4A7C6F' },
    { name: 'Web Development', count: 68, emoji: '💻', bg: '#B8965A' },
    { name: 'Data Science', count: 35, emoji: '📊', bg: '#6B5B8A' },
    { name: 'Cloud & DevOps', count: 28, emoji: '☁️', bg: '#4A6B7C' },
    { name: 'Mobile Dev', count: 24, emoji: '📱', bg: '#8B6F4E' },
    { name: 'Cybersecurity', count: 19, emoji: '🔐', bg: '#2D3347' },
  ];

  const testimonials = [
    { name: 'Noura K.', role: 'Product Designer @ Meta', text: 'This platform transformed my career. I went from zero design experience to landing a senior role in 8 months.', rating: 5 },
    { name: 'Carlos M.', role: 'Senior Engineer @ Shopify', text: "The Full-Stack course is the most comprehensive I've ever taken. Real projects, real code, real skills.", rating: 5 },
    { name: 'Fatima A.', role: 'Data Analyst @ NEOM', text: 'The instructors are world-class practitioners. Finally, a platform that teaches how things actually work.', rating: 5 },
  ];

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative bg-orbit-navy overflow-hidden pt-[70px]">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-orbit-gold/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-orbit-teal/8 rounded-full blur-3xl" />
        </div>

        <div className="orbit-container relative pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-orbit-cream/10 border border-orbit-cream/15 rounded-full text-orbit-cream text-sm font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-orbit-teal animate-pulse" />
            Trusted by 50,000+ learners worldwide
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-orbit-bg leading-[1.1] tracking-tight mb-6 animate-slide-up">
            Master the Skills<br />
            <span className="text-orbit-gold">That Shape</span> the Future
          </h1>

          <p className="text-orbit-cream/70 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10 animate-slide-up stagger-2">
            Industry-leading courses in design, development &amp; data — built by practitioners who&apos;ve shipped real products at top companies.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-16 animate-slide-up stagger-3">
            <Link to="/courses" className="btn-primary text-base px-8 py-4">
              Explore Courses <ArrowRight size={18} />
            </Link>
            <Link to="/signup" className="btn-outline text-orbit-cream border-orbit-cream/30 hover:bg-orbit-cream/10 text-base px-8 py-4">
              Start Free Trial
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 sm:gap-16 animate-slide-up stagger-4">
            {[['200+', 'Expert Courses'], ['50K+', 'Students'], ['4.8★', 'Avg Rating'], ['95%', 'Completion Rate']].map(([n, l]) => (
              <div key={l} className="text-center">
                <p className="font-display text-3xl sm:text-4xl font-bold text-orbit-cream">{n}</p>
                <p className="text-orbit-cream/50 text-sm mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED COURSES ── */}
      <section className="py-20">
        <div className="orbit-container">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <h2 className="section-title">Featured Courses</h2>
              <p className="text-gray-500 mt-2">Handpicked by our expert team</p>
            </div>
            <Link to="/courses" className="flex items-center gap-1 text-orbit-gold font-semibold text-sm hover:gap-2 transition-all">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
        </div>
      </section>

      {/* ── WHY ORBIT ── */}
      <section className="py-20 bg-orbit-navy mx-4 rounded-3xl mb-16">
        <div className="orbit-container text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-orbit-cream mb-4">Why Orbit?</h2>
          <p className="text-orbit-cream/60 max-w-xl mx-auto mb-14">We're not just a course platform. We're your career accelerator.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Award size={22} />, title: 'Expert Instructors', desc: 'Learn from practitioners with 10+ years at top companies worldwide.' },
              { icon: <BarChart2 size={22} />, title: 'Project-Based', desc: 'Build real portfolio pieces — not toy examples. Every course has a capstone.' },
              { icon: <Globe size={22} />, title: 'Certificates', desc: 'Earn credentials recognized by top hiring companies globally.' },
              { icon: <BookOpen size={22} />, title: 'Lifetime Access', desc: 'Buy once, keep forever. All updates and new materials included.' },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-orbit-cream/5 border border-orbit-cream/10 text-left">
                <div className="w-11 h-11 rounded-xl bg-orbit-gold/20 flex items-center justify-center text-orbit-gold mb-5">{f.icon}</div>
                <h3 className="font-bold text-orbit-cream mb-2">{f.title}</h3>
                <p className="text-orbit-cream/55 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-16">
        <div className="orbit-container">
          <h2 className="section-title text-center mb-3">Browse by Category</h2>
          <p className="text-gray-500 text-center mb-10">Find your path to mastery</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <Link
                key={i}
                to="/courses"
                className="p-5 rounded-2xl flex flex-col gap-3 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg"
                style={{ background: cat.bg }}
              >
                <span className="text-3xl">{cat.emoji}</span>
                <div>
                  <p className="font-bold text-white text-sm">{cat.name}</p>
                  <p className="text-white/60 text-xs mt-0.5">{cat.count} courses</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 bg-orbit-cream/20">
        <div className="orbit-container">
          <h2 className="section-title text-center mb-3">What Our Students Say</h2>
          <p className="text-gray-500 text-center mb-12">Real results from real learners</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="orbit-card p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array(t.rating).fill(0).map((_, j) => (
                    <Star key={j} size={14} className="text-orbit-gold fill-orbit-gold" />
                  ))}
                </div>
                <p className="text-orbit-navy/80 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-orbit-cream-light">
                  <div className="w-9 h-9 rounded-full bg-orbit-navy flex items-center justify-center text-orbit-cream text-sm font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-orbit-navy text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #B8965A 0%, #8B6F4E 100%)' }}>
        <div className="orbit-container text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-4">Start Learning Today</h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">Join 50,000+ professionals who chose Orbit to accelerate their careers.</p>
          <Link to="/signup" className="inline-flex items-center gap-2 px-10 py-4 bg-orbit-navy text-orbit-cream rounded-xl font-bold text-base hover:bg-orbit-navy-light transition-colors">
            Get Started Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
