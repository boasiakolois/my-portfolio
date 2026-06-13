// app/page.jsx
// CareerNav Home Page
// Hero section + how it works + feature cards + CTA

import Link from 'next/link';
import styles from './page.module.css';

const features = [
  {
    icon: '📄',
    title: 'AI Resume Analyzer',
    description: 'Upload your resume and get instant AI-powered feedback on strengths, weaknesses, and missing keywords.',
    href: '/resume',
    color: '#2563EB',
  },
  {
    icon: '🎯',
    title: 'Skill Matching',
    description: 'Enter your current skills and discover what you need to learn to land your target role.',
    href: '/skills',
    color: '#06B6D4',
  },
  {
    icon: '🗺️',
    title: 'Career Roadmap',
    description: 'Get a personalized, phase-by-phase career roadmap with tasks, tools, and milestones.',
    href: '/roadmap',
    color: '#10B981',
  },
  {
    icon: '📊',
    title: 'Progress Dashboard',
    description: 'Track your resume uploads, skill progress, and roadmap completion in one place.',
    href: '/dashboard',
    color: '#F59E0B',
  },
];

const steps = [
  { number: '01', title: 'Upload Your Resume', description: 'Upload your PDF or DOCX resume securely to CareerNav.' },
  { number: '02', title: 'AI Analyzes It', description: 'Claude AI reviews your resume and identifies strengths, gaps, and opportunities.' },
  { number: '03', title: 'Get Your Roadmap', description: 'Receive a custom career roadmap with actionable phases and tasks.' },
  { number: '04', title: 'Track Progress', description: 'Check off tasks, improve skills, and monitor your growth over time.' },
];

export default function HomePage() {
  return (
    <>
      {/* ==================== HERO ==================== */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true">
          <div className={styles.orb1} />
          <div className={styles.orb2} />
          <div className={styles.grid} />
        </div>

        <div className="container">
          <div className={styles.heroContent}>
            <span className="badge badge-primary fade-in">
              ⚡ Powered by Claude AI
            </span>

            <h1 className={`${styles.heroTitle} fade-in fade-in-delay-1`}>
              Your AI-Powered<br />
              <span className="text-gradient">Career Navigator</span>
            </h1>

            <p className={`${styles.heroSubtitle} fade-in fade-in-delay-2`}>
              Upload your resume, discover your skill gaps, and receive a personalized
              roadmap to your dream career — all powered by Claude AI.
            </p>

            <div className={`${styles.heroCtas} fade-in fade-in-delay-3`}>
              <Link href="/resume" className="btn btn-primary btn-lg">
                📄 Analyze My Resume
              </Link>
              <Link href="/roadmap" className="btn btn-secondary btn-lg">
                🗺️ Build My Roadmap
              </Link>
            </div>

            <div className={`${styles.heroStats} fade-in fade-in-delay-3`}>
              <div className={styles.stat}>
                <strong>Claude AI</strong>
                <span>Powered Analysis</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <strong>Instant</strong>
                <span>Feedback</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <strong>Free</strong>
                <span>To Get Started</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section className={`${styles.features} section`}>
        <div className="container">
          <div className={`${styles.sectionHeader} text-center`}>
            <span className="badge badge-primary">Features</span>
            <h2>Everything You Need to Level Up</h2>
            <p className="text-muted">
              CareerNav combines AI analysis with personalized guidance to accelerate your career.
            </p>
          </div>

          <div className={`${styles.featureGrid} grid-4`}>
            {features.map((feature, i) => (
              <Link
                key={feature.title}
                href={feature.href}
                className={`${styles.featureCard} card fade-in`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className={styles.featureIcon}
                  style={{ background: `${feature.color}20`, border: `1px solid ${feature.color}40` }}
                >
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span className={styles.featureArrow}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className={`${styles.howItWorks} section`}>
        <div className="container">
          <div className={`${styles.sectionHeader} text-center`}>
            <span className="badge badge-primary">Process</span>
            <h2>How CareerNav Works</h2>
            <p className="text-muted">Four simple steps to transform your career trajectory.</p>
          </div>

          <div className={styles.stepsGrid}>
            {steps.map((step, i) => (
              <div key={step.number} className={styles.step}>
                <div className={styles.stepNumber}>{step.number}</div>
                {i < steps.length - 1 && <div className={styles.stepConnector} aria-hidden="true" />}
                <div className={styles.stepContent}>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA BANNER ==================== */}
      <section className={`${styles.ctaBanner} section-sm`}>
        <div className="container">
          <div className={styles.ctaBox}>
            <div className={styles.ctaBg} aria-hidden="true" />
            <div className={styles.ctaContent}>
              <h2>Ready to Navigate Your Career?</h2>
              <p>Upload your resume in seconds and get your personalized AI analysis.</p>
              <div className={styles.ctaButtons}>
                <Link href="/resume" className="btn btn-primary btn-lg">
                  Get Started Free
                </Link>
                <Link href="/dashboard" className="btn btn-outline btn-lg">
                  View Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
