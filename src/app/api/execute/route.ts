import { NextResponse } from 'next/server';

/**
 * @fileOverview JDoodle Neural Execution Gateway v7.0.
 * Securely proxies code execution requests to JDoodle high-performance nodes.
 * Implements resilient batch auditing and detailed telemetry for hidden test cases.
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

/**
 * Normalizes output by removing trailing/leading whitespace and converting
 * multi-line or redundant spacing into single spaces for robust comparison.
 */
function normalizeOutput(output: string): string {
  return (output || "")
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    .trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Empty logic payload." }, { status: 400 });

    const { source_code, language, stdin, testCases } = body;
    const config = LANGUAGE_MAP[language];

    const clientId = process.env.JDOODLE_CLIENT_ID;
    const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "JDoodle credentials missing in environment." }, { status: 500 });
    }

    if (!config) return NextResponse.json({ error: `Language "${language}" not supported.` }, { status: 400 });
    if (!source_code) return NextResponse.json({ error: "Implementation buffer empty." }, { status: 400 });

    // Mode A: Single Execution (Run Sample)
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
      if (data.error) return NextResponse.json({ error: data.error }, { status: 500 });

      return NextResponse.json({
        stdout: data.output || "",
        status: { description: "Finished" },
        time: data.cpuTime || "0.00",
        memory: data.memory || "N/A"
      });
    }

    // Mode B: Batch Neural Audit (Submit Node)
    const auditResults = [];
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
        
        // Detect Errors (Platform vs Code)
        const isCompileError = data.output?.toLowerCase().includes("error") && (data.statusCode === 400 || data.output?.includes("line"));
        const isRuntimeError = data.output?.toLowerCase().includes("traceback") || data.output?.toLowerCase().includes("exception");

        const actualRaw = data.output || "";
        const expectedRaw = tc.output || "";

        const actualNormalized = normalizeOutput(actualRaw);
        const expectedNormalized = normalizeOutput(expectedRaw);

        const passed = !isCompileError && !isRuntimeError && (actualNormalized === expectedNormalized);

        auditResults.push({
          input: tc.input,
          expected: expectedNormalized,
          actual: actualNormalized,
          passed: passed,
          status: isCompileError ? "Compilation Error" : isRuntimeError ? "Runtime Error" : passed ? "Verified" : "Logic Mismatch",
          executionTime: data.cpuTime || "0.00",
          memory: data.memory || "N/A",
          rawOutput: actualRaw
        });
      } catch (e) {
        auditResults.push({
          input: tc.input,
          expected: tc.output,
          actual: "Network Fault",
          passed: false,
          status: "Audit Fault"
        });
      }
    }

    return NextResponse.json({ results: auditResults });

  } catch (error: any) {
    console.error('[JDoodle Proxy] Fatal Fault:', error);
    return NextResponse.json({ error: "Internal Audit Failure" }, { status: 500 });
  }
}
