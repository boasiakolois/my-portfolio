// components/Footer.jsx
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <span className={styles.logo}>⚡ CareerNav</span>
          <p>AI-powered career development for the next generation of professionals.</p>
        </div>

        <nav className={styles.links} aria-label="Footer navigation">
          <Link href="/">Home</Link>
          <Link href="/skills">Skills</Link>
          <Link href="/resume">Resume</Link>
          <Link href="/roadmap">Roadmap</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>

        <p className={styles.copy}>© {new Date().getFullYear()} CareerNav. Built with Claude AI.</p>
      </div>
    </footer>
  );
}
