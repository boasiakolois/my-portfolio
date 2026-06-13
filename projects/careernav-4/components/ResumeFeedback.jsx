// components/ResumeFeedback.jsx
// Displays the structured AI analysis returned from Claude

import styles from './ResumeFeedback.module.css';

export default function ResumeFeedback({ resume, analyzing }) {
  // Analyzing state
  if (analyzing) {
    return (
      <div className={`card ${styles.feedback}`}>
        <div className={styles.analyzingState}>
          <div className="spinner spinner-lg" />
          <h3>Claude is analyzing your resume...</h3>
          <p>This usually takes 10–20 seconds. Please wait.</p>
          <div className={styles.analyzingSteps}>
            {['Reading your resume', 'Identifying skills', 'Finding gaps', 'Building roadmap'].map((step, i) => (
              <div key={step} className={styles.analyzingStep} style={{ animationDelay: `${i * 0.4}s` }}>
                <div className={styles.stepDot} />
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // No resume selected
  if (!resume) {
    return (
      <div className={`card ${styles.feedback}`}>
        <div className="empty-state">
          <div className="empty-state-icon">🤖</div>
          <h3>No Analysis Yet</h3>
          <p>Upload a resume to receive your personalized AI feedback from Claude.</p>
        </div>
      </div>
    );
  }

  // Resume uploaded but not yet analyzed
  if (resume.status === 'uploaded') {
    return (
      <div className={`card ${styles.feedback}`}>
        <div className="empty-state">
          <div className="empty-state-icon">📤</div>
          <h3>Resume Uploaded!</h3>
          <p>Analysis will begin automatically. Select this resume and click Re-analyze if it doesn't start.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (resume.status === 'error') {
    return (
      <div className={`card ${styles.feedback}`}>
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <h3>Analysis Failed</h3>
          <p>Something went wrong. Click Re-analyze to try again, or check your API configuration.</p>
        </div>
      </div>
    );
  }

  const { feedback = {}, detectedSkills = [], roadmap = [] } = resume;

  return (
    <div className={`card ${styles.feedback}`}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2>AI Analysis Results</h2>
          <p className={styles.headerMeta}>
            {resume.fileName} · {resume.targetRole}
          </p>
        </div>
        <span className="badge badge-success">✅ Analyzed</span>
      </div>

      <div className={styles.divider} />

      {/* Detected Skills */}
      {detectedSkills.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>🎯 Detected Skills</h3>
          <div className={styles.tagGrid}>
            {detectedSkills.map((skill) => (
              <span key={skill} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* Two-column: Strengths & Weaknesses */}
      <div className={styles.twoCol}>
        {feedback.strengths?.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span style={{ color: 'var(--color-success)' }}>✅</span> Strengths
            </h3>
            <ul className={styles.feedbackList}>
              {feedback.strengths.map((item, i) => (
                <li key={i} className={`${styles.feedbackItem} ${styles.strength}`}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {feedback.weaknesses?.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span style={{ color: 'var(--color-warning)' }}>⚠️</span> Weaknesses
            </h3>
            <ul className={styles.feedbackList}>
              {feedback.weaknesses.map((item, i) => (
                <li key={i} className={`${styles.feedbackItem} ${styles.weakness}`}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Missing Keywords */}
      {feedback.missingKeywords?.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <span style={{ color: 'var(--color-error)' }}>🔑</span> Missing Keywords
          </h3>
          <div className={styles.tagGrid}>
            {feedback.missingKeywords.map((kw) => (
              <span
                key={kw}
                className="skill-tag"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  borderColor: 'rgba(239,68,68,0.25)',
                  color: '#FCA5A5',
                }}
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {feedback.suggestions?.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>💡 Suggestions</h3>
          <ul className={styles.feedbackList}>
            {feedback.suggestions.map((item, i) => (
              <li key={i} className={`${styles.feedbackItem} ${styles.suggestion}`}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Projects */}
      {feedback.recommendedProjects?.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>🚀 Recommended Projects</h3>
          <ul className={styles.feedbackList}>
            {feedback.recommendedProjects.map((item, i) => (
              <li key={i} className={`${styles.feedbackItem} ${styles.suggestion}`}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Career Path */}
      {feedback.careerPath && (
        <div className={styles.careerPath}>
          <h3 className={styles.sectionTitle}>🛤️ Suggested Career Path</h3>
          <p className={styles.careerPathText}>{feedback.careerPath}</p>
        </div>
      )}

      {/* Mini Roadmap Preview */}
      {roadmap?.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>🗺️ Roadmap Preview</h3>
          <div className={styles.roadmapPreview}>
            {roadmap.map((phase, i) => (
              <div key={i} className={styles.roadmapPhase}>
                <div className={styles.phaseHeader}>
                  <span className={styles.phaseTag}>{phase.phase}</span>
                  <span className={styles.phaseTitle}>{phase.title}</span>
                </div>
                <p className={styles.phaseHint}>{phase.tasks?.length} tasks</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
