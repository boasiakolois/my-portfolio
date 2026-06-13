// components/RoadmapTimeline.jsx
// Visual roadmap with phase cards and interactive task checkboxes

import styles from './RoadmapTimeline.module.css';

const PHASE_COLORS = [
  { bg: 'rgba(37, 99, 235, 0.1)', border: 'rgba(37, 99, 235, 0.3)', text: '#3B82F6', icon: '🏗️' },
  { bg: 'rgba(6, 182, 212, 0.1)', border: 'rgba(6, 182, 212, 0.3)', text: '#22D3EE', icon: '🚀' },
  { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', text: '#34D399', icon: '✨' },
  { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', text: '#FCD34D', icon: '🎯' },
];

export default function RoadmapTimeline({ roadmap, completedTasks, onToggleTask }) {
  return (
    <div className={styles.timeline}>
      {roadmap.map((phase, phaseIndex) => {
        const color = PHASE_COLORS[phaseIndex % PHASE_COLORS.length];
        const phaseTasks = phase.tasks || [];
        const completedInPhase = phaseTasks.filter((_, ti) => completedTasks[`${phaseIndex}-${ti}`]).length;
        const phaseProgress = phaseTasks.length > 0
          ? Math.round((completedInPhase / phaseTasks.length) * 100)
          : 0;

        return (
          <div key={phaseIndex} className={styles.phaseWrapper}>
            {/* Connector line between phases */}
            {phaseIndex < roadmap.length - 1 && (
              <div className={styles.connector} aria-hidden="true" />
            )}

            <div
              className={styles.phase}
              style={{ borderColor: color.border, background: color.bg }}
            >
              {/* Phase Header */}
              <div className={styles.phaseHeader}>
                <div className={styles.phaseLeft}>
                  <div
                    className={styles.phaseIcon}
                    style={{ background: color.bg, border: `1px solid ${color.border}` }}
                  >
                    {color.icon}
                  </div>
                  <div>
                    <span
                      className={styles.phaseLabel}
                      style={{ color: color.text }}
                    >
                      {phase.phase}
                    </span>
                    <h3 className={styles.phaseTitle}>{phase.title}</h3>
                  </div>
                </div>

                <div className={styles.phaseProgress}>
                  <span style={{ color: color.text, fontWeight: 700, fontSize: '1.25rem' }}>
                    {phaseProgress}%
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {completedInPhase}/{phaseTasks.length} tasks
                  </span>
                </div>
              </div>

              {/* Phase progress bar */}
              <div className="progress-bar" style={{ marginBottom: 'var(--space-lg)' }}>
                <div
                  className="progress-fill"
                  style={{ width: `${phaseProgress}%`, background: `linear-gradient(90deg, ${color.text}, ${color.text}88)` }}
                />
              </div>

              {/* Tasks */}
              <ul className={styles.taskList}>
                {phaseTasks.map((task, taskIndex) => {
                  const key = `${phaseIndex}-${taskIndex}`;
                  const done = !!completedTasks[key];

                  return (
                    <li key={taskIndex} className={styles.taskItem}>
                      <label className={`checkbox-label ${done ? 'checked' : ''}`}>
                        <input
                          type="checkbox"
                          checked={done}
                          onChange={() => onToggleTask(phaseIndex, taskIndex)}
                          aria-label={task}
                        />
                        <span>{task}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}
