// app/dashboard/page.jsx
// Dashboard — uses /api/resumes (PostgreSQL) instead of Firebase SDK

'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

function StatCard({ icon, label, value, color, href }) {
  const inner = (
    <div className={`card ${styles.statCard}`} style={{ borderColor: `${color}30` }}>
      <div className={styles.statIcon} style={{ background: `${color}15`, border: `1px solid ${color}30` }}>{icon}</div>
      <div>
        <p className={styles.statLabel}>{label}</p>
        <p className={styles.statValue} style={{ color }}>{value}</p>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function fmt(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DashboardPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    fetch('/api/resumes')
      .then((r) => r.json())
      .then((d) => { setResumes(d.resumes || []); })
      .catch((e) => setError('Could not load dashboard. Is your database running? (' + e.message + ')'))
      .finally(() => setLoading(false));
  }, []);

  const totalResumes   = resumes.length;
  const analyzedCount  = resumes.filter((r) => r.status === 'analyzed').length;
  const allSkills      = [...new Set(resumes.flatMap((r) => r.detectedSkills || []))];
  const allGaps        = [...new Set(resumes.flatMap((r) => r.feedback?.missingKeywords || []))];
  const latestRoadmap  = resumes.find((r) => r.roadmap?.length)?.roadmap || [];
  const totalTasks     = latestRoadmap.reduce((s, p) => s + (p.tasks?.length || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <span className="badge badge-primary">Overview</span>
          <h1>Your <span className="text-gradient">Dashboard</span></h1>
          <p>Track your resume uploads, skill progress, and career roadmap completion.</p>
        </div>
      </div>

      <div className="section">
        <div className="container">
          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div className="card"><div className="empty-state"><div className="spinner spinner-lg" /><p>Loading…</p></div></div>
          ) : (
            <>
              <div className={`${styles.statsGrid} grid-4`}>
                <StatCard icon="📄" label="Resumes Uploaded"   value={totalResumes}     color="#2563EB" href="/resume" />
                <StatCard icon="✅" label="Analyses Complete"  value={analyzedCount}    color="#10B981" />
                <StatCard icon="🎯" label="Skills Identified"  value={allSkills.length} color="#06B6D4" href="/skills" />
                <StatCard icon="⭐" label="Skills to Learn"    value={allGaps.length}   color="#F59E0B" href="/skills" />
              </div>

              <div className={styles.bottomGrid}>
                {/* Recent Resumes */}
                <div className="card">
                  <div className={styles.cardHeader}>
                    <h3>Recent Resumes</h3>
                    <Link href="/resume" className="btn btn-outline btn-sm">View All</Link>
                  </div>
                  {resumes.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">📁</div>
                      <h3>No Resumes Yet</h3>
                      <p>Upload your first resume to get started.</p>
                      <Link href="/resume" className="btn btn-primary btn-sm">Upload Resume</Link>
                    </div>
                  ) : (
                    <div className={styles.resumeList}>
                      {resumes.slice(0, 5).map((r) => (
                        <div key={r.id} className={styles.resumeRow}>
                          <span className={styles.resumeIcon}>{r.fileName?.endsWith('.pdf') ? '📄' : '📝'}</span>
                          <div className={styles.resumeInfo}>
                            <p className={styles.resumeFileName}>{r.fileName}</p>
                            <p className={styles.resumeMeta}>{fmt(r.uploadDate)} · {r.targetRole || '—'}</p>
                          </div>
                          <span className={`badge ${
                            r.status === 'analyzed' ? 'badge-success' :
                            r.status === 'analyzing' ? 'badge-warning' :
                            r.status === 'error' ? 'badge-error' : 'badge-primary'
                          }`}>{r.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right column */}
                <div className={styles.rightColumn}>
                  {/* Skills */}
                  <div className="card">
                    <div className={styles.cardHeader}>
                      <h3>Detected Skills</h3>
                      <Link href="/skills" className="btn btn-outline btn-sm">Analyze</Link>
                    </div>
                    {allSkills.length === 0 ? (
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Analyze a resume to detect your skills.</p>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
                        {allSkills.slice(0, 12).map((s) => <span key={s} className="skill-tag">{s}</span>)}
                        {allSkills.length > 12 && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', padding: '6px 0' }}>+{allSkills.length - 12} more</span>}
                      </div>
                    )}
                  </div>

                  {/* Roadmap */}
                  <div className="card">
                    <div className={styles.cardHeader}>
                      <h3>Roadmap Progress</h3>
                      <Link href="/roadmap" className="btn btn-outline btn-sm">View Roadmap</Link>
                    </div>
                    {latestRoadmap.length === 0 ? (
                      <div>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: 'var(--space-md)' }}>Generate a roadmap to track your progress.</p>
                        <Link href="/roadmap" className="btn btn-primary btn-sm">Generate Roadmap</Link>
                      </div>
                    ) : (
                      <div className={styles.roadmapProgress}>
                        {latestRoadmap.map((p, i) => (
                          <div key={i} className={styles.phaseRow}>
                            <span className={styles.phaseName}>{p.phase}</span>
                            <span className={styles.phaseTaskCount}>{p.tasks?.length || 0} tasks</span>
                          </div>
                        ))}
                        <div className={styles.divider} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                            {totalTasks} tasks across {latestRoadmap.length} phases
                          </span>
                          <Link href="/roadmap" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>Start →</Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="card">
                    <h3 style={{ marginBottom: 'var(--space-md)' }}>Quick Actions</h3>
                    <div className={styles.quickActions}>
                      <Link href="/resume"  className="btn btn-secondary" style={{ flex: 1 }}>📄 Upload Resume</Link>
                      <Link href="/skills"  className="btn btn-secondary" style={{ flex: 1 }}>🎯 Check Skills</Link>
                      <Link href="/roadmap" className="btn btn-secondary" style={{ flex: 1 }}>🗺️ View Roadmap</Link>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
