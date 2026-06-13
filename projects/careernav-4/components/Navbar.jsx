// components/Navbar.jsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/skills', label: 'Skills' },
  { href: '/resume', label: 'Resume' },
  { href: '/roadmap', label: 'Roadmap' },
  { href: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>⚡</span>
          <span className={styles.logoText}>CareerNav</span>
        </Link>

        {/* Desktop Links */}
        <ul className={styles.links}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`${styles.link} ${pathname === link.href ? styles.active : ''}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className={styles.cta}>
          <Link href="/resume" className="btn btn-primary btn-sm">
            Analyze Resume
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={styles.menuBtn}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span className={`${styles.menuBar} ${menuOpen ? styles.open : ''}`} />
          <span className={`${styles.menuBar} ${menuOpen ? styles.open : ''}`} />
          <span className={`${styles.menuBar} ${menuOpen ? styles.open : ''}`} />
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.mobileLink} ${pathname === link.href ? styles.active : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/resume"
            className="btn btn-primary"
            onClick={() => setMenuOpen(false)}
          >
            Analyze Resume
          </Link>
        </div>
      )}
    </nav>
  );
}
