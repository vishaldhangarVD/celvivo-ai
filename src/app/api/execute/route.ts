import { NextResponse } from 'next/server';

/**
 * @fileOverview JDoodle Neural Execution Gateway v5.0.
 * Securely proxies code execution requests to JDoodle high-performance nodes.
 * Supports dual-mode: Single Run (Run Code) and Batch Audit (Submit Code).
 */

const JDOODLE_URL = 'https://api.jdoodle.com/v1/execute';

// Protocol Configuration for JDoodle Nodes
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
    if (!body) return NextResponse.json({ error: "Empty logic payload." }, { status: 400 });

    const { source_code, language, stdin, testCases } = body;
    const config = LANGUAGE_MAP[language];

    // Environment Intelligence
    const clientId = process.env.JDOODLE_CLIENT_ID;
    const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "JDoodle credentials missing in environment." }, { status: 500 });
    }

    if (!config) return NextResponse.json({ error: `Language "${language}" not supported by JDoodle protocol.` }, { status: 400 });
    if (!source_code) return NextResponse.json({ error: "Implementation buffer empty." }, { status: 400 });

    // Mode A: Single Execution Node (Run Code)
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
        return NextResponse.json({ error: data.error, details: "JDoodle execution node error" }, { status: 500 });
      }

      return NextResponse.json({
        stdout: data.output || "",
        status: { description: data.statusCode === 200 ? "Accepted" : "Finished" },
        time: data.cpuTime || "0.00",
        memory: data.memory || "N/A"
      });
    }

    // Mode B: Batch Neural Audit (Submit Code - Hidden Test Cases)
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
        results.push({ status: { description: "Node Connection Failed" }, passed: false, stdout: "" });
      }
    }

    return NextResponse.json({ results });

  } catch (error: any) {
    console.error('[JDoodle Proxy] Fatal Fault:', error);
    return NextResponse.json({ error: "Neural execution bridge encountered a critical failure." }, { status: 500 });
  }
}
