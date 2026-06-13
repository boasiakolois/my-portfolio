// app/api/resumes/route.js
// GET  /api/resumes        — fetch all resumes for the guest user
// POST /api/resumes        — upload a new resume (multipart form data)
//
// File upload is handled with the Web Streams API built into Next.js 14
// (no multer needed in the App Router).

import { NextResponse } from 'next/server';
import { createResume, getResumes } from '../../../lib/resumeService.js';
import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_BYTES = Number(process.env.MAX_UPLOAD_BYTES || 5_242_880); // 5 MB

// ── GET /api/resumes ──────────────────────────────────────────────────────────
export async function GET() {
  try {
    const resumes = await getResumes();
    return NextResponse.json({ success: true, resumes });
  } catch (err) {
    console.error('GET /api/resumes error:', err.message);
    return NextResponse.json(
      { error: 'Failed to fetch resumes. Check your DATABASE_URL.' },
      { status: 500 }
    );
  }
}

// ── POST /api/resumes ─────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const formData = await request.formData();

    const file       = formData.get('file');
    const targetRole = formData.get('targetRole') || '';
    const resumeText = formData.get('resumeText') || '';

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // Size check
    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > MAX_BYTES) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_BYTES / 1_048_576} MB.` },
        { status: 413 }
      );
    }

    // Type check
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only PDF and DOCX files are accepted.' }, { status: 400 });
    }

    // Save file to disk
    await mkdir(UPLOAD_DIR, { recursive: true });
    const ext      = extname(file.name) || '.pdf';
    const diskName = `${Date.now()}-${randomUUID()}${ext}`;
    const filePath = join(UPLOAD_DIR, diskName);
    await writeFile(filePath, buffer);

    // Insert resume row into PostgreSQL
    const resume = await createResume({
      fileName:   file.name,
      filePath,
      targetRole,
      resumeText,
    });

    return NextResponse.json({ success: true, resume }, { status: 201 });

  } catch (err) {
    console.error('POST /api/resumes error:', err.message);
    return NextResponse.json({ error: 'Upload failed. ' + err.message }, { status: 500 });
  }
}
