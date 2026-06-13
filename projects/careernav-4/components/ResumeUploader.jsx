// components/ResumeUploader.jsx
// File upload component — sends resume to /api/resumes (PostgreSQL backend)

'use client';
import { useState, useRef } from 'react';
import styles from './ResumeUploader.module.css';

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export default function ResumeUploader({ onUploadComplete, onError }) {
  const [file, setFile]           = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [skills, setSkills]       = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver]   = useState(false);
  const fileInputRef              = useRef(null);

  function handleFileSelect(selected) {
    if (!selected) return;
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      onError?.('Please upload a PDF or DOCX file.');
      return;
    }
    if (selected.size > MAX_BYTES) {
      onError?.('File is too large. Maximum size is 5 MB.');
      return;
    }
    setFile(selected);
    onError?.('');
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files[0]);
  }

  /** Extract plain text from the file for AI analysis */
  async function extractText(f) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const raw = e.target.result || '';
        resolve(raw.replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim() || `Resume: ${f.name}`);
      };
      reader.onerror = () => resolve(`Resume: ${f.name}`);
      reader.readAsText(f);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file || !targetRole.trim()) return;

    setUploading(true);
    onError?.('');

    try {
      const resumeText   = await extractText(file);
      const userSkills   = skills.split(',').map((s) => s.trim()).filter(Boolean);

      // 1️⃣  Upload file + create DB row via /api/resumes
      const formData = new FormData();
      formData.append('file', file);
      formData.append('targetRole', targetRole);
      formData.append('resumeText', resumeText);

      const uploadRes = await fetch('/api/resumes', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');

      const newResume = uploadData.resume;

      // 2️⃣  Notify parent — parent triggers AI analysis
      onUploadComplete?.(newResume, resumeText, userSkills, targetRole);

      // Reset form
      setFile(null);
      setTargetRole('');
      setSkills('');
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (err) {
      console.error('Upload error:', err);
      onError?.(err.message || 'Upload failed. Check that your database is running.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={`card ${styles.uploader}`}>
      <h2 className={styles.title}>Upload Your Resume</h2>
      <p className={styles.subtitle}>PDF or DOCX · Max 5 MB</p>

      <form onSubmit={handleSubmit} noValidate>
        {/* Drop Zone */}
        <div
          className={`${styles.dropZone} ${dragOver ? styles.dragOver : ''} ${file ? styles.hasFile : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          aria-label="Click or drag to upload resume"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            className={styles.fileInput}
            aria-hidden="true"
          />
          {file ? (
            <div className={styles.filePreview}>
              <span className={styles.fileIcon}>{file.name.endsWith('.pdf') ? '📄' : '📝'}</span>
              <div>
                <p className={styles.fileName}>{file.name}</p>
                <p className={styles.fileSize}>{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <button
                type="button"
                className={styles.removeFile}
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                aria-label="Remove file"
              >✕</button>
            </div>
          ) : (
            <div className={styles.dropContent}>
              <div className={styles.dropIcon}>📤</div>
              <p>Drag & drop your resume here</p>
              <span>or click to browse files</span>
            </div>
          )}
        </div>

        {/* Target Role */}
        <div className="form-group">
          <label className="form-label" htmlFor="targetRole">Target Role *</label>
          <input
            id="targetRole"
            type="text"
            className="form-input"
            placeholder="e.g. Software Engineer, Data Analyst, UX Designer"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            required
          />
        </div>

        {/* Skills */}
        <div className="form-group">
          <label className="form-label" htmlFor="skills">Current Skills (optional)</label>
          <input
            id="skills"
            type="text"
            className="form-input"
            placeholder="React, Python, SQL (comma-separated)"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>
            Helps Claude give more accurate feedback
          </span>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={!file || !targetRole.trim() || uploading}
        >
          {uploading ? <><span className="spinner" /> Uploading &amp; Analyzing…</> : '⚡ Analyze with Claude AI'}
        </button>
      </form>
    </div>
  );
}
