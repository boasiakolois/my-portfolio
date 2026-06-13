// app/api/get-resumes/route.js
// Server-side route to fetch resumes from Firestore

import { NextResponse } from 'next/server';

export async function GET(request) {
  // This is handled client-side via Firebase SDK
  // This route exists as a reference for server-side fetching if needed
  return NextResponse.json({ message: 'Use client-side Firebase SDK for fetching resumes.' });
}
