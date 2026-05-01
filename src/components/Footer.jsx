// src/components/Footer.jsx
import { Link } from 'react-router-dom';
import Logo from './Logo';

const footerLinks = {
  Platform: [
    { label: 'Browse Courses', to: '/courses' },
    { label: 'Learning Paths', to: '/courses' },
    { label: 'Certifications', to: '/courses' },
    { label: 'For Business', to: '/courses' },
  ],
  Company: [
    { label: 'About Us', to: '/' },
    { label: 'Careers', to: '/' },
    { label: 'Blog', to: '/' },
    { label: 'Contact', to: '/' },
  ],
  Legal: [
    { label: 'Privacy Policy', to: '/' },
    { label: 'Terms of Service', to: '/' },
    { label: 'Accessibility', to: '/' },
    { label: 'Cookie Policy', to: '/' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-orbit-navy text-orbit-cream">
      <div className="orbit-container pt-16 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <Logo size={28} variant="light" />
              <span className="font-display text-xl font-bold text-orbit-cream">Orbit</span>
            </div>
            <p className="text-orbit-cream/60 text-sm leading-relaxed max-w-[220px]">
              Empowering learners worldwide with expert-crafted courses in technology, design, and business.
            </p>
            <div className="flex gap-3 mt-6">
              {['𝕏', 'in', 'fb', 'ig'].map(s => (
                <button key={s} className="w-9 h-9 rounded-lg bg-white/10 hover:bg-orbit-gold/20 text-orbit-cream/70 hover:text-orbit-gold text-sm font-bold transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-orbit-cream text-xs font-bold uppercase tracking-widest mb-5">{group}</h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-orbit-cream/60 text-sm hover:text-orbit-gold transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-orbit-cream/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-orbit-cream/40 text-xs">© 2026 Orbit Learning. All rights reserved.</p>
          <div className="flex items-center gap-2 text-orbit-cream/40 text-xs">
            <span>Payments secured by</span>
            <span className="font-semibold text-orbit-cream/60">Amazon Pay</span>
            <span>&</span>
            <span className="font-semibold text-orbit-cream/60">Apple Pay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
