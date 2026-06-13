// app/skills/page.jsx
// Skills Page - enter skills, select target role, get AI recommendations

'use client';
import { useState } from 'react';
import styles from './page.module.css';

const SKILL_CATEGORIES = {
  technical: { label: 'Technical Skills', icon: '💻', color: '#2563EB' },
  soft: { label: 'Soft Skills', icon: '🤝', color: '#10B981' },
  tools: { label: 'Tools & Platforms', icon: '🛠️', color: '#06B6D4' },
  recommended: { label: 'Recommended to Learn', icon: '⭐', color: '#F59E0B' },
};

const COMMON_SKILLS = {
  technical: ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'SQL', 'Java', 'C++', 'HTML/CSS', 'REST APIs', 'GraphQL', 'Docker', 'AWS', 'Machine Learning'],
  soft: ['Communication', 'Teamwork', 'Problem Solving', 'Leadership', 'Time Management', 'Critical Thinking', 'Adaptability', 'Creativity'],
  tools: ['Git', 'VS Code', 'Figma', 'Jira', 'Notion', 'Firebase', 'Linux', 'Postman', 'Tableau', 'Excel'],
};

const TARGET_ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full-Stack Developer',
  'Data Scientist', 'Data Analyst', 'ML Engineer', 'DevOps Engineer',
  'UX/UI Designer', 'Product Manager', 'Cybersecurity Analyst',
];

export default function SkillsPage() {
  const [currentSkills, setCurrentSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('technical');

  function addSkill(skill) {
    const trimmed = skill.trim();
    if (trimmed && !currentSkills.includes(trimmed)) {
      setCurrentSkills((prev) => [...prev, trimmed]);
    }
  }

  function removeSkill(skill) {
    setCurrentSkills((prev) => prev.filter((s) => s !== skill));
  }

  function handleInputKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(skillInput);
      setSkillInput('');
    }
  }

  async function handleAnalyze() {
    if (!targetRole) {
      setError('Please select a target role first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use the same Claude API route with a brief "resume" describing the user's skills
      const resumeText = `Skills: ${currentSkills.join(', ') || 'None specified'}`;

      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          targetRole,
          userSkills: currentSkills,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Analysis failed');

      setAnalysis(data.analysis);
    } catch (err) {
      setError(err.message || 'Failed to get AI recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <span className="badge badge-primary">AI Skills Advisor</span>
          <h1>Skill <span className="text-gradient">Analyzer</span></h1>
          <p>Enter your skills, choose your target role, and get personalized AI recommendations.</p>
        </div>
      </div>

      <div className="section">
        <div className="container">
          {error && <div className="alert alert-error">{error}</div>}

          <div className={styles.layout}>
            {/* Input Panel */}
            <div className={styles.inputPanel}>
              {/* Target Role */}
              <div className="card">
                <h3 className={styles.cardTitle}>🎯 Target Role</h3>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <select
                    className="form-select"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                  >
                    <option value="">Select your target role...</option>
                    {TARGET_ROLES.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Skill Entry */}
              <div className="card">
                <h3 className={styles.cardTitle}>📝 Your Current Skills</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)' }}>
                  Type a skill and press Enter, or click from the list below.
                </p>

                <div className={styles.skillInput}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Python, React, SQL..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => { addSkill(skillInput); setSkillInput(''); }}
                    disabled={!skillInput.trim()}
                  >
                    Add
                  </button>
                </div>

                {/* Current Skills Tags */}
                {currentSkills.length > 0 && (
                  <div className={styles.currentSkills}>
                    {currentSkills.map((skill) => (
                      <span key={skill} className="skill-tag">
                        {skill}
                        <button
                          className="skill-tag-remove"
                          onClick={() => removeSkill(skill)}
                          aria-label={`Remove ${skill}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {currentSkills.length === 0 && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', marginTop: 'var(--space-sm)' }}>
                    No skills added yet.
                  </p>
                )}
              </div>

              {/* Quick-add common skills */}
              <div className="card">
                <h3 className={styles.cardTitle}>⚡ Quick Add</h3>

                <div className={styles.categoryTabs}>
                  {Object.entries(SKILL_CATEGORIES).filter(([key]) => key !== 'recommended').map(([key, cat]) => (
                    <button
                      key={key}
                      className={`${styles.catTab} ${activeCategory === key ? styles.catTabActive : ''}`}
                      onClick={() => setActiveCategory(key)}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>

                <div className={styles.quickSkills}>
                  {COMMON_SKILLS[activeCategory]?.map((skill) => (
                    <button
                      key={skill}
                      className={`${styles.quickSkillBtn} ${currentSkills.includes(skill) ? styles.added : ''}`}
                      onClick={() => currentSkills.includes(skill) ? removeSkill(skill) : addSkill(skill)}
                    >
                      {currentSkills.includes(skill) ? '✓ ' : '+ '}{skill}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={handleAnalyze}
                disabled={loading || currentSkills.length === 0 || !targetRole}
              >
                {loading ? (
                  <><span className="spinner" /> Analyzing with Claude...</>
                ) : (
                  '⚡ Get AI Recommendations'
                )}
              </button>
            </div>

            {/* Results Panel */}
            <div className={styles.resultsPanel}>
              {!analysis && !loading && (
                <div className="card">
                  <div className="empty-state">
                    <div className="empty-state-icon">🎯</div>
                    <h3>Add Your Skills</h3>
                    <p>Select your target role, add your current skills, and Claude AI will recommend what to learn next.</p>
                  </div>
                </div>
              )}

              {loading && (
                <div className="card">
                  <div className="empty-state">
                    <div className="spinner spinner-lg" />
                    <h3>Claude is analyzing your skills...</h3>
                    <p>Getting personalized recommendations for {targetRole}.</p>
                  </div>
                </div>
              )}

              {analysis && !loading && (
                <div className={styles.results}>
                  {/* Detected Skills */}
                  {analysis.detectedSkills?.length > 0 && (
                    <div className={`card ${styles.resultCard}`}>
                      <h3 className={styles.resultTitle}>
                        <span style={{ color: '#2563EB' }}>💻</span> Your Identified Skills
                      </h3>
                      <div className={styles.skillGrid}>
                        {analysis.detectedSkills.map((skill) => (
                          <span key={skill} className="skill-tag">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing / Recommended Skills */}
                  {analysis.missingKeywords?.length > 0 && (
                    <div className={`card ${styles.resultCard}`}>
                      <h3 className={styles.resultTitle}>
                        <span style={{ color: '#F59E0B' }}>⭐</span> Recommended Skills for {targetRole}
                      </h3>
                      <div className={styles.skillGrid}>
                        {analysis.missingKeywords.map((skill) => (
                          <span
                            key={skill}
                            className="skill-tag"
                            style={{
                              background: 'rgba(245, 158, 11, 0.1)',
                              borderColor: 'rgba(245, 158, 11, 0.3)',
                              color: '#FCD34D',
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {analysis.suggestions?.length > 0 && (
                    <div className={`card ${styles.resultCard}`}>
                      <h3 className={styles.resultTitle}>
                        <span>💡</span> Learning Recommendations
                      </h3>
                      <ul className={styles.suggestionList}>
                        {analysis.suggestions.map((s, i) => (
                          <li key={i} className={styles.suggestionItem}>
                            <span className={styles.suggestionNum}>{i + 1}</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Career Path */}
                  {analysis.careerPath && (
                    <div className={`card ${styles.resultCard}`}>
                      <h3 className={styles.resultTitle}>🛤️ Your Career Path</h3>
                      <p style={{ color: 'var(--color-primary-light)', fontWeight: 500 }}>
                        {analysis.careerPath}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
