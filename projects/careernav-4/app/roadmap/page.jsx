// app/roadmap/page.jsx
// Roadmap Page — loads most recent resume from PostgreSQL via /api/resumes

'use client';
import { useState, useEffect } from 'react';
import RoadmapTimeline from '../../components/RoadmapTimeline';
import styles from './page.module.css';

const TARGET_ROLES = [
  'Software Engineer','Frontend Developer','Backend Developer','Full-Stack Developer',
  'Data Scientist','Data Analyst','ML Engineer','DevOps Engineer',
  'UX/UI Designer','Product Manager','Cybersecurity Analyst',
];

export default function RoadmapPage() {
  const [roadmap, setRoadmap]             = useState([]);
  const [targetRole, setTargetRole]       = useState('Software Engineer');
  const [skills, setSkills]               = useState('');
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [careerPath, setCareerPath]       = useState('');
  const [completedTasks, setCompletedTasks] = useState({});
  const [recentResume, setRecentResume]   = useState(null);

  useEffect(() => {
    fetch('/api/resumes')
      .then((r) => r.json())
      .then((d) => {
        const analyzed = d.resumes?.find((r) => r.status === 'analyzed' && r.roadmap?.length > 0);
        if (analyzed) {
          setRecentResume(analyzed);
          setRoadmap(analyzed.roadmap || []);
          setTargetRole(analyzed.targetRole || 'Software Engineer');
          setCareerPath(analyzed.feedback?.careerPath || '');
        }
      })
      .catch(() => {});
  }, []);

  async function handleGenerate() {
    setLoading(true);
    setError('');
    try {
      const resumeText = skills ? `Skills: ${skills}` : (recentResume?.resumeText || `Target role: ${targetRole}`);
      const res  = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          targetRole,
          userSkills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to generate roadmap');
      setRoadmap(data.analysis.roadmap || []);
      setCareerPath(data.analysis.careerPath || '');
      setCompletedTasks({});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleTask(phaseIndex, taskIndex) {
    const key = `${phaseIndex}-${taskIndex}`;
    setCompletedTasks((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const totalTasks     = roadmap.reduce((s, p) => s + (p.tasks?.length || 0), 0);
  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPct    = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <span className="badge badge-primary">AI Generated</span>
          <h1>Career <span className="text-gradient">Roadmap</span></h1>
          <p>Get a personalised, phase-by-phase plan to reach your career goals.</p>
        </div>
      </div>

      <div className="section">
        <div className="container">
          {error && <div className="alert alert-error">{error}</div>}

          <div className={`card ${styles.generator}`}>
            <div className={styles.generatorLeft}>
              <h3>Generate Your Roadmap</h3>
              {recentResume && <p style={{ fontSize:'0.85rem', color:'var(--color-text-muted)', marginTop:4 }}>Using: {recentResume.fileName}</p>}
            </div>
            <div className={styles.generatorForm}>
              <select className="form-select" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} style={{ minWidth:'200px' }}>
                {TARGET_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <input type="text" className="form-input" placeholder="Your skills (optional): React, Python…" value={skills} onChange={(e) => setSkills(e.target.value)} style={{ flex:1 }} />
              <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
                {loading ? <><span className="spinner" /> Generating…</> : '⚡ Generate Roadmap'}
              </button>
            </div>
          </div>

          {roadmap.length > 0 && (
            <div className={`card ${styles.progressCard}`}>
              <div className={styles.progressHeader}>
                <div>
                  <h3>Overall Progress</h3>
                  {careerPath && <p className={styles.careerPath}>{careerPath}</p>}
                </div>
                <div className={styles.progressStat}>
                  <span className={styles.progressNum}>{progressPct}%</span>
                  <span className={styles.progressLabel}>{completedCount}/{totalTasks} tasks</span>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          )}

          {loading && (
            <div className="card"><div className="empty-state"><div className="spinner spinner-lg" /><h3>Claude is building your roadmap…</h3><p>Creating a plan for {targetRole}.</p></div></div>
          )}

          {!loading && roadmap.length > 0 && (
            <RoadmapTimeline roadmap={roadmap} completedTasks={completedTasks} onToggleTask={toggleTask} />
          )}

          {!loading && roadmap.length === 0 && (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">🗺️</div>
                <h3>No Roadmap Yet</h3>
                <p>Select your target role above and click Generate Roadmap, or analyse a resume first for a more personalised plan.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
