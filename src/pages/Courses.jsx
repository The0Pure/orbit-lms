// src/pages/Courses.jsx
import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import CourseCard from '../components/CourseCard';
import { CATEGORIES } from '../data/courses';

const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
const SORT = ['Most Popular', 'Highest Rated', 'Newest', 'Price: Low to High', 'Price: High to Low'];

export default function Courses() {
  const { publishedCourses } = useCourses();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeLevel, setActiveLevel] = useState('All Levels');
  const [sortBy, setSortBy] = useState('Most Popular');
  const [maxPrice, setMaxPrice] = useState(500);

  const filtered = useMemo(() => {
    let list = [...publishedCourses];
    if (search) list = list.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.instructor.toLowerCase().includes(search.toLowerCase()));
    if (activeCategory !== 'All') list = list.filter(c => c.category === activeCategory);
    if (activeLevel !== 'All Levels') list = list.filter(c => c.level === activeLevel);
    list = list.filter(c => c.price <= maxPrice);
    switch (sortBy) {
      case 'Highest Rated': list.sort((a, b) => b.rating - a.rating); break;
      case 'Newest': list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      case 'Price: Low to High': list.sort((a, b) => a.price - b.price); break;
      case 'Price: High to Low': list.sort((a, b) => b.price - a.price); break;
      default: list.sort((a, b) => b.students - a.students);
    }
    return list;
  }, [publishedCourses, search, activeCategory, activeLevel, sortBy, maxPrice]);

  return (
    <div className="pt-[70px]">
      {/* Page header */}
      <div className="bg-orbit-navy py-14">
        <div className="orbit-container text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-orbit-cream mb-3">Course Catalog</h1>
          <p className="text-orbit-cream/60 text-lg">{publishedCourses.length} expert-led courses in technology, design &amp; business</p>
        </div>
      </div>

      <div className="orbit-container py-10">
        {/* Search & sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 flex items-center gap-3 bg-white border border-orbit-cream-light rounded-xl px-4 py-3">
            <Search size={18} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search courses or instructors..."
              className="flex-1 text-sm text-orbit-navy bg-transparent outline-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="orbit-input w-auto px-4 py-3 text-sm cursor-pointer"
          >
            {SORT.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="lg:w-60 shrink-0">
            <div className="bg-white rounded-2xl border border-orbit-cream-light p-5 sticky top-[86px]">
              <p className="font-bold text-orbit-navy mb-4 flex items-center gap-2"><SlidersHorizontal size={16} /> Filters</p>

              <div className="mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Category</p>
                <div className="flex flex-col gap-1">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeCategory === cat ? 'bg-orbit-navy text-white font-semibold' : 'text-gray-600 hover:bg-orbit-bg'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Level</p>
                <div className="flex flex-col gap-1">
                  {LEVELS.map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setActiveLevel(lvl)}
                      className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeLevel === lvl ? 'bg-orbit-navy text-white font-semibold' : 'text-gray-600 hover:bg-orbit-bg'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Max Price: ${maxPrice}</p>
                <input
                  type="range" min={10} max={500} value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-orbit-gold"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1"><span>$10</span><span>$500</span></div>
              </div>

              <button
                onClick={() => { setActiveCategory('All'); setActiveLevel('All Levels'); setMaxPrice(500); setSearch(''); }}
                className="mt-5 w-full text-sm text-orbit-gold font-semibold hover:underline"
              >
                Reset all filters
              </button>
            </div>
          </aside>

          {/* Course grid */}
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-5">{filtered.length} courses found</p>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map(c => <CourseCard key={c.id} course={c} />)}
              </div>
            ) : (
              <div className="text-center py-24">
                <p className="text-5xl mb-4">🔍</p>
                <p className="font-semibold text-orbit-navy text-lg mb-2">No courses found</p>
                <p className="text-gray-500 text-sm">Try adjusting your filters or search term</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
