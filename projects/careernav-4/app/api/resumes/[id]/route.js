// app/api/resumes/[id]/route.js
// GET    /api/resumes/:id  — fetch a single resume with its feedback
// DELETE /api/resumes/:id  — delete a resume and its file from disk

import { NextResponse } from 'next/server';
import { getResume, deleteResume } from '../../../../lib/resumeService.js';

export async function GET(request, { params }) {
  try {
    const resume = await getResume(params.id);
    if (!resume) {
      return NextResponse.json({ error: 'Resume not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, resume });
  } catch (err) {
    console.error(`GET /api/resumes/${params.id} error:`, err.message);
    return NextResponse.json({ error: 'Failed to fetch resume.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await deleteResume(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`DELETE /api/resumes/${params.id} error:`, err.message);
    return NextResponse.json({ error: 'Failed to delete resume.' }, { status: 500 });
  }
}
