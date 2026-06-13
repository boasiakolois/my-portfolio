// app/api/files/[filename]/route.js
// Serves uploaded resume files from the local uploads directory.
// GET /api/files/:filename

import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join, extname, basename } from 'path';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

export async function GET(request, { params }) {
  try {
    // Decode and sanitise the filename — prevent path traversal attacks
    const rawName = decodeURIComponent(params.filename);
    const safeName = basename(rawName); // strips any directory components

    const filePath = join(UPLOAD_DIR, safeName);
    const buffer = await readFile(filePath);

    const ext = extname(safeName).toLowerCase();
    const contentType =
      ext === '.pdf'  ? 'application/pdf' :
      ext === '.docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
                        'application/octet-stream';

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${safeName}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });

  } catch (err) {
    if (err.code === 'ENOENT') {
      return NextResponse.json({ error: 'File not found.' }, { status: 404 });
    }
    console.error('File serve error:', err.message);
    return NextResponse.json({ error: 'Could not read file.' }, { status: 500 });
  }
}
