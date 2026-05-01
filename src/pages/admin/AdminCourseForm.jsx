// src/pages/admin/AdminCourseForm.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Upload, Loader2, GripVertical, Link as LinkIcon } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { CATEGORIES } from '../../data/courses';
import toast from 'react-hot-toast';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const MODULE_TYPES = ['video', 'reading', 'project'];
const COLORS = ['#4A7C6F','#B8965A','#6B5B8A','#4A6B7C','#8B6F4E','#2D3347','#C65D5D','#5D7DC6'];
const EMOJIS = ['🎨','💻','📊','☁️','📱','🔐','🤖','📐','🎯','🚀','⚙️','📈'];

const defaultModule = () => ({ id: `m-${Date.now()}`, title: '', duration: '', type: 'video', videoUrl: '', free: false });
const defaultForm = {
  title: '', category: 'Design', instructor: '', instructorBio: '',
  duration: '', price: '', originalPrice: '', level: 'Beginner',
  description: '', emoji: '📚', color: '#4A7C6F', logoUrl: '',
  whatYouLearn: [''], requirements: [''], modules: [defaultModule()],
  published: false,
};

export default function AdminCourseForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const { getCourse, addCourse, updateCourse } = useCourses();
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const logoRef = useRef();

  useEffect(() => {
    if (isEdit) {
      const c = getCourse(id);
      if (c) setForm({
        ...defaultForm, ...c,
        whatYouLearn: c.whatYouLearn?.length ? c.whatYouLearn : [''],
        requirements: c.requirements?.length ? c.requirements : [''],
        modules: c.modules?.length ? c.modules : [defaultModule()],
      });
    }
  }, [id]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const setList = (key, idx, val) => {
    const arr = [...form[key]];
    arr[idx] = val;
    set(key, arr);
  };
  const addListItem = (key) => set(key, [...form[key], '']);
  const removeListItem = (key, idx) => set(key, form[key].filter((_, i) => i !== idx));

  const setModule = (idx, key, val) => {
    const mods = [...form.modules];
    mods[idx] = { ...mods[idx], [key]: val };
    set('modules', mods);
  };
  const addModule = () => set('modules', [...form.modules, defaultModule()]);
  const removeModule = (idx) => set('modules', form.modules.filter((_, i) => i !== idx));

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Logo must be under 2MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => set('logoUrl', ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price) { toast.error('Title and price are required'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    const data = {
      ...form,
      price: Number(form.price),
      originalPrice: Number(form.originalPrice) || null,
      whatYouLearn: form.whatYouLearn.filter(Boolean),
      requirements: form.requirements.filter(Boolean),
      modules: form.modules.filter(m => m.title),
    };
    if (isEdit) {
      updateCourse(id, data);
      toast.success('Course updated!');
    } else {
      addCourse(data);
      toast.success('Course created!');
    }
    setSaving(false);
    navigate('/admin/courses');
  };

  const sections = ['basic', 'content', 'curriculum', 'media'];

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/admin/courses')} className="p-2 rounded-xl hover:bg-orbit-cream-light transition-colors">
          <ArrowLeft size={20} className="text-orbit-navy" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-orbit-navy">{isEdit ? 'Edit Course' : 'New Course'}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{isEdit ? 'Update course details' : 'Fill in details to create a new course'}</p>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 mb-8 bg-orbit-bg rounded-xl p-1">
        {sections.map(s => (
          <button key={s} onClick={() => setActiveSection(s)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
              activeSection === s ? 'bg-white text-orbit-navy shadow-sm' : 'text-gray-500 hover:text-orbit-navy'
            }`}>
            {s}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── BASIC INFO ── */}
        {activeSection === 'basic' && (
          <div className="space-y-5">
            <div>
              <label className="orbit-label">Course Title *</label>
              <input type="text" required className="orbit-input" placeholder="e.g. UI/UX Design Masterclass"
                value={form.title} onChange={e => set('title', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="orbit-label">Category</label>
                <select className="orbit-input" value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="orbit-label">Level</label>
                <select className="orbit-input" value={form.level} onChange={e => set('level', e.target.value)}>
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="orbit-label">Instructor Name</label>
              <input type="text" className="orbit-input" placeholder="Full name"
                value={form.instructor} onChange={e => set('instructor', e.target.value)} />
            </div>
            <div>
              <label className="orbit-label">Instructor Bio</label>
              <textarea rows={2} className="orbit-input resize-none" placeholder="Short bio..."
                value={form.instructorBio} onChange={e => set('instructorBio', e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="orbit-label">Price ($) *</label>
                <input type="number" required min={0} className="orbit-input"
                  value={form.price} onChange={e => set('price', e.target.value)} />
              </div>
              <div>
                <label className="orbit-label">Original Price ($)</label>
                <input type="number" min={0} className="orbit-input"
                  value={form.originalPrice} onChange={e => set('originalPrice', e.target.value)} />
              </div>
              <div>
                <label className="orbit-label">Duration</label>
                <input type="text" className="orbit-input" placeholder="e.g. 24h"
                  value={form.duration} onChange={e => set('duration', e.target.value)} />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-orbit-bg rounded-xl">
              <input type="checkbox" id="published" className="accent-orbit-gold w-4 h-4"
                checked={form.published} onChange={e => set('published', e.target.checked)} />
              <label htmlFor="published" className="text-sm font-medium text-orbit-navy cursor-pointer">
                Published (visible to students)
              </label>
            </div>
          </div>
        )}

        {/* ── CONTENT ── */}
        {activeSection === 'content' && (
          <div className="space-y-6">
            <div>
              <label className="orbit-label">Course Description</label>
              <textarea rows={4} className="orbit-input resize-none"
                placeholder="What is this course about? What will students achieve?"
                value={form.description} onChange={e => set('description', e.target.value)} />
            </div>

            <div>
              <label className="orbit-label">What You'll Learn</label>
              <div className="space-y-2">
                {form.whatYouLearn.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" className="orbit-input flex-1" placeholder={`Learning outcome ${i + 1}`}
                      value={item} onChange={e => setList('whatYouLearn', i, e.target.value)} />
                    {form.whatYouLearn.length > 1 && (
                      <button type="button" onClick={() => removeListItem('whatYouLearn', i)}
                        className="p-2.5 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => addListItem('whatYouLearn')}
                  className="text-sm text-orbit-gold font-semibold hover:underline flex items-center gap-1 mt-1">
                  <Plus size={14} /> Add item
                </button>
              </div>
            </div>

            <div>
              <label className="orbit-label">Requirements</label>
              <div className="space-y-2">
                {form.requirements.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" className="orbit-input flex-1" placeholder={`Requirement ${i + 1}`}
                      value={item} onChange={e => setList('requirements', i, e.target.value)} />
                    {form.requirements.length > 1 && (
                      <button type="button" onClick={() => removeListItem('requirements', i)}
                        className="p-2.5 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => addListItem('requirements')}
                  className="text-sm text-orbit-gold font-semibold hover:underline flex items-center gap-1 mt-1">
                  <Plus size={14} /> Add requirement
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CURRICULUM ── */}
        {activeSection === 'curriculum' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">{form.modules.length} modules — add YouTube/Vimeo URLs for video lessons</p>
            {form.modules.map((mod, i) => (
              <div key={mod.id} className="bg-white border border-orbit-cream-light rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-orbit-navy text-sm">Module {i + 1}</span>
                  <button type="button" onClick={() => removeModule(i)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div>
                  <label className="orbit-label">Title</label>
                  <input type="text" className="orbit-input" placeholder="Module title"
                    value={mod.title} onChange={e => setModule(i, 'title', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="orbit-label">Type</label>
                    <select className="orbit-input" value={mod.type} onChange={e => setModule(i, 'type', e.target.value)}>
                      {MODULE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="orbit-label">Duration</label>
                    <input type="text" className="orbit-input" placeholder="e.g. 45 min"
                      value={mod.duration} onChange={e => setModule(i, 'duration', e.target.value)} />
                  </div>
                </div>
                {mod.type === 'video' && (
                  <div>
                    <label className="orbit-label flex items-center gap-1"><LinkIcon size={13} /> Video URL (YouTube / Vimeo)</label>
                    <input type="url" className="orbit-input" placeholder="https://youtube.com/watch?v=..."
                      value={mod.videoUrl} onChange={e => setModule(i, 'videoUrl', e.target.value)} />
                    <p className="text-xs text-gray-400 mt-1.5">Supports YouTube, Vimeo, and direct video URLs</p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input type="checkbox" id={`free-${i}`} className="accent-orbit-gold w-4 h-4"
                    checked={mod.free} onChange={e => setModule(i, 'free', e.target.checked)} />
                  <label htmlFor={`free-${i}`} className="text-sm text-orbit-navy cursor-pointer">Free preview module</label>
                </div>
              </div>
            ))}
            <button type="button" onClick={addModule}
              className="btn-outline w-full py-3 border-dashed">
              <Plus size={16} /> Add Module
            </button>
          </div>
        )}

        {/* ── MEDIA ── */}
        {activeSection === 'media' && (
          <div className="space-y-6">
            <div>
              <label className="orbit-label">Course Logo / Thumbnail</label>
              <div className="flex items-center gap-5">
                <div
                  className="w-24 h-24 rounded-2xl border-2 border-dashed border-orbit-cream-light flex items-center justify-center cursor-pointer hover:border-orbit-gold transition-colors overflow-hidden"
                  style={{ background: form.color }}
                  onClick={() => logoRef.current?.click()}
                >
                  {form.logoUrl
                    ? <img src={form.logoUrl} className="w-full h-full object-cover" alt="logo" />
                    : <span className="text-3xl">{form.emoji}</span>
                  }
                </div>
                <div>
                  <button type="button" onClick={() => logoRef.current?.click()}
                    className="btn-outline text-sm py-2.5 mb-2">
                    <Upload size={15} /> Upload Logo
                  </button>
                  <p className="text-xs text-gray-400">PNG, JPG, WebP · Max 2MB · Recommended 400×400px</p>
                  {form.logoUrl && (
                    <button type="button" onClick={() => set('logoUrl', '')}
                      className="text-xs text-red-500 hover:underline mt-1">Remove</button>
                  )}
                </div>
              </div>
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>

            <div>
              <label className="orbit-label">Or pick an Emoji</label>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map(e => (
                  <button key={e} type="button" onClick={() => set('emoji', e)}
                    className={`w-11 h-11 rounded-xl text-xl transition-all ${form.emoji === e ? 'bg-orbit-navy scale-110' : 'bg-orbit-bg hover:bg-orbit-cream-light'}`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="orbit-label">Card Background Color</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => set('color', c)}
                    className={`w-8 h-8 rounded-lg transition-all ${form.color === c ? 'scale-125 ring-2 ring-offset-2 ring-orbit-gold' : ''}`}
                    style={{ background: c }} />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input type="color" value={form.color} onChange={e => set('color', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-orbit-cream-light cursor-pointer" />
                <input type="text" className="orbit-input max-w-[120px] font-mono text-sm" value={form.color}
                  onChange={e => set('color', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-4 pt-2">
          <button type="button" onClick={() => navigate('/admin/courses')} className="btn-outline flex-1 py-3.5">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary flex-1 py-3.5">
            {saving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : isEdit ? 'Save Changes' : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  );
}
