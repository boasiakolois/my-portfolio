// app/resume/page.jsx
// Resume Page — upload, history, and Claude AI analysis
// All data operations go through /api/resumes and /api/analyze-resume (PostgreSQL)

'use client';
import { useState, useEffect, useCallback } from 'react';
import ResumeUploader   from '../../components/ResumeUploader';
import ResumeHistory    from '../../components/ResumeHistory';
import ResumeFeedback   from '../../components/ResumeFeedback';
import styles from './page.module.css';

export default function ResumePage() {
  const [resumes, setResumes]           = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [analyzing, setAnalyzing]       = useState(false);
  const [error, setError]               = useState('');
  const [activeTab, setActiveTab]       = useState('upload');

  const loadResumes = useCallback(async () => {
    try {
      setLoading(true);
      const res  = await fetch('/api/resumes');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load resumes');
      setResumes(data.resumes || []);
      const analyzed = data.resumes?.find((r) => r.status === 'analyzed');
      if (analyzed) setSelectedResume(analyzed);
    } catch (err) {
      setError('Could not load resumes. Is your database running? (' + err.message + ')');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadResumes(); }, [loadResumes]);

  async function handleUploadComplete(newResume, resumeText, userSkills, targetRole) {
    setResumes((prev) => [newResume, ...prev]);
    setSelectedResume(newResume);
    setActiveTab('history');
    await handleAnalyze(newResume, resumeText, userSkills, targetRole);
  }

  async function handleAnalyze(resume, resumeText, userSkills = [], targetRole = '') {
    setAnalyzing(true);
    setError('');

    // Optimistic UI — show "analyzing" badge immediately
    setResumes((prev) => prev.map((r) => r.id === resume.id ? { ...r, status: 'analyzing' } : r));
    setSelectedResume((prev) => prev?.id === resume.id ? { ...prev, status: 'analyzing' } : prev);

    try {
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText:  resumeText || resume.resumeText || resume.fileName,
          targetRole:  targetRole || resume.targetRole || 'Software Engineer',
          userSkills:  userSkills.length ? userSkills : (resume.detectedSkills || []),
          resumeId:    resume.id,   // tells the server to persist results to DB
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Analysis failed');

      // Merge analysis into local state
      const updated = {
        ...resume,
        status:        'analyzed',
        detectedSkills: data.analysis.detectedSkills || [],
        feedback: {
          strengths:           data.analysis.strengths           || [],
          weaknesses:          data.analysis.weaknesses          || [],
          missingKeywords:     data.analysis.missingKeywords     || [],
          suggestions:         data.analysis.suggestions         || [],
          recommendedProjects: data.analysis.recommendedProjects || [],
          careerPath:          data.analysis.careerPath          || '',
        },
        roadmap: data.analysis.roadmap || [],
      };
      setResumes((prev) => prev.map((r) => r.id === resume.id ? updated : r));
      setSelectedResume(updated);

    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
      setResumes((prev) => prev.map((r) => r.id === resume.id ? { ...r, status: 'error' } : r));
      setSelectedResume((prev) => prev?.id === resume.id ? { ...prev, status: 'error' } : prev);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleDelete(resume) {
    if (!confirm(`Delete "${resume.fileName}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/resumes/${resume.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setResumes((prev) => prev.filter((r) => r.id !== resume.id));
      if (selectedResume?.id === resume.id) setSelectedResume(null);
    } catch (err) {
      setError('Failed to delete resume: ' + err.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <span className="badge badge-primary">AI Powered</span>
          <h1>Resume <span className="text-gradient">Analyzer</span></h1>
          <p>Upload your resume and get instant, personalised AI feedback from Claude.</p>
        </div>
      </div>

      <div className="section">
        <div className="container">
          {error && (
            <div className="alert alert-error" role="alert" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {error}
              <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: 12 }}>✕</button>
            </div>
          )}

          {/* Tabs */}
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${activeTab === 'upload'  ? styles.tabActive : ''}`} onClick={() => setActiveTab('upload')}>
              📤 Upload Resume
            </button>
            <button className={`${styles.tab} ${activeTab === 'history' ? styles.tabActive : ''}`} onClick={() => setActiveTab('history')}>
              📋 History {resumes.length > 0 && <span className={styles.tabBadge}>{resumes.length}</span>}
            </button>
          </div>

          <div className={styles.layout}>
            <div className={styles.leftPanel}>
              {activeTab === 'upload' ? (
                <ResumeUploader onUploadComplete={handleUploadComplete} onError={setError} />
              ) : (
                <ResumeHistory
                  resumes={resumes}
                  loading={loading}
                  selectedId={selectedResume?.id}
                  onSelect={setSelectedResume}
                  onDelete={handleDelete}
                  onReanalyze={(resume) => handleAnalyze(resume, resume.resumeText, [], resume.targetRole)}
                  analyzing={analyzing}
                />
              )}
            </div>

            <div className={styles.rightPanel}>
              <ResumeFeedback resume={selectedResume} analyzing={analyzing} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
