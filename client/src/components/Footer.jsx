import { Link } from 'react-router-dom'
import {
  GraduationCap, Mail, Phone
} from 'lucide-react'
import { RentHubMark } from './Logo'

const Twitter = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);
const Instagram = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);
const Linkedin = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const COLLEGES = [
  'IIT Delhi', 'IIT Bombay', 'IIT Madras', 'NIT Trichy', 'Delhi University',
  'Mumbai University', 'VIT Vellore', 'BITS Pilani', 'Manipal Institute', 'Anna University',
]

const LINKS = {
  Product: [
    ['Browse Listings', '/listings'],
    ['List Your Property', '/listings/new'],
    ['Sign Up Free', '/signup'],
  ],
  Company: [
    ['About', '#'],
    ['Blog', '#'],
    ['Careers', '#'],
    ['Contact', '#'],
  ],
}

export default function Footer() {
  return (
    <footer className="border-t mt-24" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

          {/* Brand column */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-2.5 mb-4">
              <RentHubMark size={30} />
              <span className="text-base font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Rent<span style={{ color: 'var(--brand-600)' }}>Hub</span>
              </span>
              <span className="badge badge-indigo text-[10px]">Campus</span>
            </div>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-muted)' }}>
              India's trusted student housing platform. Find verified rooms, PGs and flats near your campus.
            </p>

            {/* Social */}
            <div className="flex gap-2">
              {[
                { icon: <Twitter size={15} />,   href: '#', label: 'Twitter'   },
                { icon: <Instagram size={15} />,  href: '#', label: 'Instagram' },
                { icon: <Linkedin size={15} />,   href: '#', label: 'LinkedIn'  },
              ].map(s => (
                <a key={s.label} href={s.href} aria-label={s.label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all hover:scale-105 hover:border-indigo-400"
                  style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)', borderColor: 'var(--border-default)' }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section} className="md:col-span-2">
              <h4 className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: 'var(--text-muted)' }}>
                {section}
              </h4>
              <ul className="space-y-2.5">
                {items.map(([label, href]) => (
                  <li key={label}>
                    <Link to={href}
                      className="text-sm transition-colors hover:text-indigo-500"
                      style={{ color: 'var(--text-secondary)' }}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Colleges */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-1.5 mb-4">
              <GraduationCap size={13} style={{ color: 'var(--text-muted)' }} />
              <h4 className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: 'var(--text-muted)' }}>
                Partner Colleges
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
              {COLLEGES.map(c => (
                <Link key={c}
                  to={`/listings?nearCollege=${encodeURIComponent(c)}`}
                  className="text-sm truncate transition-colors hover:text-indigo-500"
                  style={{ color: 'var(--text-secondary)' }}>
                  {c}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: 'var(--border-default)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} RentHub Campus Technologies Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs" style={{ color: 'var(--text-muted)' }}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
              <a key={l} href="#" className="hover:text-indigo-500 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
