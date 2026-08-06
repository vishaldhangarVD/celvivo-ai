import { NextResponse } from 'next/server';

/**
 * @fileOverview JDoodle Neural Execution Gateway.
 * Provides a secure bridge for real-time code compilation and logic verification.
 * Replaces legacy Piston/Judge0 protocols.
 */

const JDOODLE_URL = 'https://api.jdoodle.com/v1/execute';

// Configuration Mapping for JDoodle Language Protocols
const LANGUAGE_MAP: Record<string, { language: string; versionIndex: string }> = {
  python: { language: 'python3', versionIndex: '4' },
  java: { language: 'java', versionIndex: '4' },
  cpp: { language: 'cpp17', versionIndex: '1' },
  javascript: { language: 'nodejs', versionIndex: '4' },
  c: { language: 'c', versionIndex: '4' },
  csharp: { language: 'csharp', versionIndex: '4' },
  go: { language: 'go', versionIndex: '4' },
  rust: { language: 'rust', versionIndex: '4' },
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Missing logic payload." }, { status: 400 });

    const { source_code, language, stdin, testCases } = body;
    const config = LANGUAGE_MAP[language];

    // Placeholder credentials - In production, these should come from process.env.JDOODLE_CLIENT_ID / SECRET
    const clientId = process.env.JDOODLE_CLIENT_ID || "";
    const clientSecret = process.env.JDOODLE_CLIENT_SECRET || "";

    if (!config) return NextResponse.json({ error: `Language protocol "${language}" not supported.` }, { status: 400 });
    if (!source_code) return NextResponse.json({ error: "Implementation node empty." }, { status: 400 });

    // Node 1: Single Run Mode (Manual Debugging)
    if (!testCases || !Array.isArray(testCases)) {
      const response = await fetch(JDOODLE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          clientSecret,
          script: source_code,
          stdin: stdin || "",
          language: config.language,
          versionIndex: config.versionIndex,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        return NextResponse.json({ error: data.error, details: "JDoodle Node Error" }, { status: 500 });
      }

      return NextResponse.json({
        stdout: data.output || "",
        stderr: "", // JDoodle bundles stderr into output usually
        compile_output: "",
        status: { description: data.statusCode === 200 ? "Accepted" : "Execution Finished" },
        time: data.cpuTime || "0.00",
        memory: data.memory || "N/A"
      });
    }

    // Node 2: Batch Audit Mode (Hidden Test Case Verification)
    const results = [];
    for (const tc of testCases) {
      try {
        const response = await fetch(JDOODLE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId,
            clientSecret,
            script: source_code,
            stdin: tc.input || "",
            language: config.language,
            versionIndex: config.versionIndex,
          }),
        });

        const data = await response.json();
        const actualOutput = (data.output || "").trim();
        const expectedOutput = (tc.output || "").trim();

        results.push({
          status: { description: data.statusCode === 200 ? "Accepted" : "Finished" },
          stdout: data.output || "",
          time: data.cpuTime || "0.00",
          passed: actualOutput === expectedOutput
        });
      } catch (e: any) {
        results.push({ status: { description: "Node Failure" }, passed: false });
      }
    }

    return NextResponse.json({ results });

  } catch (error: any) {
    console.error('[JDoodle API Proxy] Fault:', error);
    return NextResponse.json({ error: "Neural execution node encountered a critical fault." }, { status: 500 });
  }
}
