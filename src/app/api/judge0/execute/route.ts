/**
 * @fileOverview Legacy Judge0 Execution Route (Deprecated).
 * Replaced by the unified JDoodle Neural Gateway at /api/execute.
 */

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: "Protocol Deprecated. Please migrate to /api/execute." }, { status: 410 });
}
