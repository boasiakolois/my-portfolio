// lib/resumeService.js
// All database operations for CareerNav using PostgreSQL.
// Replaces the previous Firebase/Firestore service.

import { query } from './db.js';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';

const GUEST_USER_ID = '00000000-0000-0000-0000-000000000001';
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// ─── File helpers ─────────────────────────────────────────────────────────────

export async function saveFileToDisk(buffer, originalName) {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = extname(originalName) || '.pdf';
  const fileName = `${Date.now()}-${randomUUID()}${ext}`;
  const filePath = join(UPLOAD_DIR, fileName);
  await writeFile(filePath, buffer);
  return { filePath, fileName };
}

async function deleteFileFromDisk(filePath) {
  if (!filePath) return;
  try { await unlink(filePath); } catch { /* already gone */ }
}

// ─── Resume CRUD ──────────────────────────────────────────────────────────────

export async function createResume({ fileName, filePath = null, targetRole = '', resumeText = '', userId = GUEST_USER_ID }) {
  const result = await query(
    `INSERT INTO resumes (user_id, file_name, file_path, target_role, resume_text, status)
     VALUES ($1, $2, $3, $4, $5, 'uploaded') RETURNING *`,
    [userId, fileName, filePath, targetRole, resumeText]
  );
  return normaliseResume(result.rows[0]);
}

export async function getResumes(userId = GUEST_USER_ID) {
  const result = await query(
    `SELECT r.*,
            rf.strengths, rf.weaknesses,
            rf.missing_keywords, rf.detected_skills,
            rf.suggestions, rf.recommended_projects,
            rf.career_path, rf.roadmap
     FROM resumes r
     LEFT JOIN resume_feedback rf ON rf.resume_id = r.id
     WHERE r.user_id = $1
     ORDER BY r.upload_date DESC`,
    [userId]
  );
  return result.rows.map(normaliseResume);
}

export async function getResume(resumeId, userId = GUEST_USER_ID) {
  const result = await query(
    `SELECT r.*,
            rf.strengths, rf.weaknesses,
            rf.missing_keywords, rf.detected_skills,
            rf.suggestions, rf.recommended_projects,
            rf.career_path, rf.roadmap
     FROM resumes r
     LEFT JOIN resume_feedback rf ON rf.resume_id = r.id
     WHERE r.id = $1 AND r.user_id = $2`,
    [resumeId, userId]
  );
  return result.rows[0] ? normaliseResume(result.rows[0]) : null;
}

export async function updateResumeStatus(resumeId, status) {
  await query(`UPDATE resumes SET status = $1 WHERE id = $2`, [status, resumeId]);
}

export async function updateResumeFeedback(resumeId, analysis) {
  const {
    strengths = [], weaknesses = [], missingKeywords = [],
    detectedSkills = [], suggestions = [], recommendedProjects = [],
    careerPath = '', roadmap = [],
  } = analysis;

  await query(
    `INSERT INTO resume_feedback
       (resume_id, strengths, weaknesses, missing_keywords, detected_skills,
        suggestions, recommended_projects, career_path, roadmap)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     ON CONFLICT (resume_id) DO UPDATE SET
       strengths=$2, weaknesses=$3, missing_keywords=$4, detected_skills=$5,
       suggestions=$6, recommended_projects=$7, career_path=$8, roadmap=$9`,
    [
      resumeId,
      JSON.stringify(strengths), JSON.stringify(weaknesses),
      JSON.stringify(missingKeywords), JSON.stringify(detectedSkills),
      JSON.stringify(suggestions), JSON.stringify(recommendedProjects),
      careerPath, JSON.stringify(roadmap),
    ]
  );

  await query(
    `UPDATE resumes SET status='analyzed', analyzed_at=NOW() WHERE id=$1`,
    [resumeId]
  );
}

export async function deleteResume(resumeId, userId = GUEST_USER_ID) {
  const res = await query(
    `DELETE FROM resumes WHERE id=$1 AND user_id=$2 RETURNING file_path`,
    [resumeId, userId]
  );
  await deleteFileFromDisk(res.rows[0]?.file_path);
}

// ─── Shape normaliser ─────────────────────────────────────────────────────────

function normaliseResume(row) {
  if (!row) return null;
  return {
    id:          row.id,
    userId:      row.user_id,
    fileName:    row.file_name,
    filePath:    row.file_path,
    fileUrl:     row.file_path ? `/api/files/${encodeURIComponent(row.file_name)}` : null,
    targetRole:  row.target_role || '',
    status:      row.status || 'uploaded',
    resumeText:  row.resume_text || '',
    uploadDate:  row.upload_date ? new Date(row.upload_date) : new Date(),
    analyzedAt:  row.analyzed_at ? new Date(row.analyzed_at) : null,
    detectedSkills: row.detected_skills || [],
    feedback: {
      strengths:           row.strengths             || [],
      weaknesses:          row.weaknesses            || [],
      missingKeywords:     row.missing_keywords      || [],
      suggestions:         row.suggestions           || [],
      recommendedProjects: row.recommended_projects  || [],
      careerPath:          row.career_path           || '',
    },
    roadmap: row.roadmap || [],
  };
}
