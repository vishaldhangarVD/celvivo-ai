import { NextResponse } from 'next/server';

/**
 * @fileOverview Gemini TTS Gateway (Purged/Deprecated).
 * This route is currently unusable due to environment-specific OAuth conflicts 
 * in the Firebase Studio dev environment. 
 * The app has reverted to browser-native speechSynthesis.
 */

export async function POST() {
  return NextResponse.json({ 
    error: 'Protocol Deprecated',
    details: 'System has reverted to browser-native vocalization protocols.'
  }, { status: 410 });
}
