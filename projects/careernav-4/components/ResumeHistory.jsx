// components/ResumeHistory.jsx
// Shows a list of previously uploaded resumes with status and actions

import styles from './ResumeHistory.module.css';

const STATUS_CONFIG = {
  uploaded:  { label: 'Uploaded',  badge: 'badge-primary',  icon: '📤' },
  analyzing: { label: 'Analyzing', badge: 'badge-warning',  icon: '⏳' },
  analyzed:  { label: 'Analyzed',  badge: 'badge-success',  icon: '✅' },
  error:     { label: 'Error',     badge: 'badge-error',    icon: '❌' },
};

function formatDate(date) {
  if (!date) return '—';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ResumeHistory({
  resumes,
  loading,
  selectedId,
  onSelect,
  onDelete,
  onReanalyze,
  analyzing,
}) {
  if (loading) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="spinner spinner-lg" />
          <p>Loading resumes...</p>
        </div>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <h3>No Resumes Yet</h3>
          <p>Upload your first resume to get started with AI analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      <h2 className={styles.heading}>Resume History</h2>

      {resumes.map((resume) => {
        const status = STATUS_CONFIG[resume.status] || STATUS_CONFIG.uploaded;
        const isSelected = resume.id === selectedId;

        return (
          <div
            key={resume.id}
            className={`${styles.item} ${isSelected ? styles.selected : ''}`}
            onClick={() => onSelect(resume)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(resume)}
          >
            <div className={styles.itemHeader}>
              <span className={styles.fileIcon}>
                {resume.fileName?.endsWith('.pdf') ? '📄' : '📝'}
              </span>
              <div className={styles.itemInfo}>
                <p className={styles.fileName}>{resume.fileName}</p>
                <p className={styles.itemMeta}>
                  {formatDate(resume.uploadDate)} · {resume.targetRole || 'No role specified'}
                </p>
              </div>
              <span className={`badge ${status.badge}`}>
                {status.icon} {status.label}
              </span>
            </div>

            {/* Detected skills preview */}
            {resume.detectedSkills?.length > 0 && (
              <div className={styles.skillsPreview}>
                {resume.detectedSkills.slice(0, 4).map((skill) => (
                  <span key={skill} className="skill-tag" style={{ fontSize: '0.75rem', padding: '3px 10px' }}>
                    {skill}
                  </span>
                ))}
                {resume.detectedSkills.length > 4 && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    +{resume.detectedSkills.length - 4} more
                  </span>
                )}
              </div>
            )}

            {/* Actions */}
            <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
              {resume.status === 'analyzed' && resume.fileUrl && (
                <a
                  href={resume.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  View File
                </a>
              )}
              <button
                className="btn btn-outline btn-sm"
                onClick={() => onReanalyze(resume)}
                disabled={analyzing || resume.status === 'analyzing'}
              >
                {resume.status === 'analyzing' ? (
                  <><span className="spinner" style={{ width: 12, height: 12 }} /> Analyzing...</>
                ) : (
                  '⚡ Re-analyze'
                )}
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => onDelete(resume)}
                aria-label={`Delete ${resume.fileName}`}
              >
                🗑️
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
