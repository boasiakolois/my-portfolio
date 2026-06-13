// lib/mockAiAnalyzer.js
// Fallback mock analyzer used when Claude API is unavailable.
// Returns realistic structured feedback for testing the UI.

/**
 * Generate mock AI analysis for a resume.
 * Replace this with a real API call to Claude in production.
 *
 * @param {string} resumeText - Extracted text from the resume
 * @param {string} targetRole - The user's target job role
 * @param {string[]} userSkills - Skills the user entered manually
 * @returns {Object} Structured feedback matching Claude's expected JSON format
 */
export function mockAnalyzeResume(resumeText = '', targetRole = 'Software Engineer', userSkills = []) {
  const role = targetRole.toLowerCase();

  const isDataRole = role.includes('data') || role.includes('analyst') || role.includes('ml');
  const isDesignRole = role.includes('design') || role.includes('ux') || role.includes('ui');

  return {
    strengths: [
      'Strong academic background with relevant coursework',
      'Clear project experience demonstrating hands-on skills',
      'Well-organized resume structure and formatting',
      'Demonstrates initiative through personal projects',
    ],
    weaknesses: [
      'Lacks measurable achievements (add numbers and metrics)',
      'Resume would benefit from a strong summary statement',
      'Project descriptions are too vague — add impact and outcomes',
      'Missing links to deployed projects or GitHub portfolio',
    ],
    missingKeywords: isDataRole
      ? ['Python', 'SQL', 'Pandas', 'NumPy', 'Tableau', 'Machine Learning', 'ETL']
      : isDesignRole
      ? ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems']
      : ['React', 'Firebase', 'REST API', 'Git', 'CI/CD', 'TypeScript', 'Testing'],
    detectedSkills: userSkills.length > 0
      ? userSkills
      : ['JavaScript', 'HTML', 'CSS', 'Node.js', 'Git'],
    suggestions: [
      'Add bullet points with specific numbers: "Improved load time by 40%"',
      'Include a 2–3 sentence professional summary at the top',
      'Add links to deployed projects and your GitHub profile',
      `Tailor each bullet point to ${targetRole} responsibilities`,
      'Use action verbs: Built, Designed, Implemented, Optimized',
    ],
    recommendedProjects: isDataRole
      ? [
          'Build a data dashboard with Python and Streamlit',
          'Create a machine learning model with scikit-learn',
          'Analyze a public dataset and publish findings on Medium',
        ]
      : [
          'Build a full-stack web app with React and Firebase',
          'Create a REST API with Node.js and deploy to Render',
          'Contribute to an open-source project on GitHub',
        ],
    careerPath: `Junior ${targetRole} → ${targetRole} → Senior ${targetRole} → Lead / Staff Engineer`,
    roadmap: [
      {
        phase: 'Phase 1',
        title: 'Strengthen Fundamentals',
        tasks: [
          `Master core ${targetRole} skills (data structures, algorithms)`,
          'Complete at least 50 LeetCode problems',
          'Read "Clean Code" by Robert Martin',
          'Set up a professional GitHub profile',
        ],
      },
      {
        phase: 'Phase 2',
        title: 'Build Projects & Portfolio',
        tasks: [
          'Build 2–3 full-stack projects from scratch',
          'Deploy projects to production (Vercel, Render, etc.)',
          'Write README files with clear setup instructions',
          'Document your process in a blog or case study',
        ],
      },
      {
        phase: 'Phase 3',
        title: 'Polish Resume & Portfolio',
        tasks: [
          'Rewrite resume with measurable impact bullets',
          'Create a personal portfolio website',
          'Get resume reviewed by a mentor or peer',
          `Add ${targetRole}-specific keywords to all materials`,
        ],
      },
      {
        phase: 'Phase 4',
        title: 'Apply & Interview',
        tasks: [
          'Apply to 5–10 jobs per week on LinkedIn and Indeed',
          'Practice mock interviews on Pramp or Interviewing.io',
          'Network on LinkedIn — connect with engineers at target companies',
          'Track all applications in a spreadsheet',
        ],
      },
    ],
  };
}
