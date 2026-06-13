// app/api/analyze-resume/route.js
// Server-side Claude AI resume analysis.
// ANTHROPIC_API_KEY never reaches the browser.

import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { updateResumeFeedback, updateResumeStatus } from '../../../lib/resumeService.js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  try {
    const body = await request.json();
    const { resumeText, targetRole, userSkills, resumeId } = body;

    if (!resumeText || resumeText.trim().length < 10) {
      return NextResponse.json(
        { error: 'Resume text is too short or missing.' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert career coach and resume analyst with 15 years of experience in tech recruiting.
Analyze resumes and provide structured, actionable feedback.
You MUST respond with ONLY valid JSON matching the exact structure requested. No preamble, no markdown fences.`;

    const userPrompt = `Analyze this resume for the target role: "${targetRole || 'Software Engineer'}"

User's self-reported skills: ${userSkills?.length ? userSkills.join(', ') : 'None provided'}

Resume text:
---
${resumeText.slice(0, 4000)}
---

Return ONLY this exact JSON structure with no extra text:
{
  "strengths": ["strength1", "strength2", "strength3", "strength4"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "missingKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "detectedSkills": ["skill1", "skill2", "skill3", "skill4"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4"],
  "recommendedProjects": ["project1", "project2", "project3"],
  "careerPath": "Junior ${targetRole || 'Engineer'} → ${targetRole || 'Engineer'} → Senior ${targetRole || 'Engineer'}",
  "roadmap": [
    { "phase": "Phase 1", "title": "Strengthen Fundamentals", "tasks": ["task1", "task2", "task3", "task4"] },
    { "phase": "Phase 2", "title": "Build Projects & Portfolio", "tasks": ["task1", "task2", "task3", "task4"] },
    { "phase": "Phase 3", "title": "Polish Resume & Online Presence", "tasks": ["task1", "task2", "task3", "task4"] },
    { "phase": "Phase 4", "title": "Apply & Interview", "tasks": ["task1", "task2", "task3", "task4"] }
  ]
}`;

    // ── Call Claude ──────────────────────────────────────────────────────────
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const responseText = message.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');

    // ── Parse Claude's JSON ──────────────────────────────────────────────────
    let analysis;
    try {
      const clean = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(clean);
    } catch {
      console.error('Claude JSON parse failed:', responseText.slice(0, 300));
      return NextResponse.json(
        { error: 'AI returned an invalid response format. Please try again.' },
        { status: 500 }
      );
    }

    // ── Validate required fields ─────────────────────────────────────────────
    const required = ['strengths', 'weaknesses', 'missingKeywords', 'detectedSkills', 'roadmap'];
    for (const field of required) {
      if (!Array.isArray(analysis[field])) {
        return NextResponse.json(
          { error: `AI response missing field: ${field}. Please try again.` },
          { status: 500 }
        );
      }
    }

    // ── Persist to PostgreSQL (if resumeId provided) ──────────────────────────
    if (resumeId) {
      try {
        await updateResumeFeedback(resumeId, analysis);
      } catch (dbErr) {
        console.error('DB write failed (non-fatal):', dbErr.message);
        // Still return analysis to the client even if DB write failed
      }
    }

    return NextResponse.json({ success: true, analysis });

  } catch (err) {
    console.error('analyze-resume error:', err);

    if (err.status === 401) {
      return NextResponse.json({ error: 'Invalid Anthropic API key.' }, { status: 500 });
    }
    if (err.status === 429) {
      return NextResponse.json({ error: 'AI service busy — please wait a moment and try again.' }, { status: 429 });
    }

    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 });
  }
}
