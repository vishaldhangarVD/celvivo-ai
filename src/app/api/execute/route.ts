import { NextResponse } from 'next/server';

/**
 * @fileOverview Secure server-side proxy for Piston code execution.
 * Handles single run and batch test case verification with robust error auditing.
 */

const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';

const LANGUAGE_MAP: Record<string, { language: string; version: string; extension: string }> = {
  python: { language: 'python', version: '3.10.0', extension: 'py' },
  java: { language: 'java', version: '15.0.2', extension: 'java' },
  cpp: { language: 'cpp', version: '10.2.0', extension: 'cpp' },
  javascript: { language: 'javascript', version: '18.15.0', extension: 'js' },
  c: { language: 'c', version: '10.2.0', extension: 'c' },
  csharp: { language: 'csharp', version: '6.12.0', extension: 'cs' },
  go: { language: 'go', version: '1.16.2', extension: 'go' },
  rust: { language: 'rust', version: '1.40.0', extension: 'rs' },
};

export async function POST(req: Request) {
  try {
    // 1. Parse and validate the incoming request body
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Missing or malformed JSON payload." }, { status: 400 });
    }

    const { source_code, language, stdin, testCases } = body;
    const config = LANGUAGE_MAP[language];

    if (!config) {
      return NextResponse.json({ error: `Protocol for language "${language}" is not defined.` }, { status: 400 });
    }

    if (!source_code) {
      return NextResponse.json({ error: "Implementation node cannot be empty." }, { status: 400 });
    }

    // 2. Single Execution Logic (Run Code Protocol)
    if (!testCases || !Array.isArray(testCases)) {
      const response = await fetch(PISTON_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: config.language,
          version: config.version,
          files: [{ name: `main.${config.extension}`, content: source_code }],
          stdin: stdin || "",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data || !data.run) {
        return NextResponse.json({
          error: "Execution node returned an error.",
          details: data?.message || response.statusText,
          response: data
        }, { status: response.status || 500 });
      }

      return NextResponse.json({
        stdout: data.run.stdout || "",
        stderr: data.run.stderr || "",
        compile_output: data.compile?.stderr || data.compile?.stdout || "",
        status: { description: data.run.code === 0 ? "Accepted" : "Runtime Error" },
        time: data.run.time || "0.000",
        memory: "N/A"
      });
    } 

    // 3. Batch Execution Logic (Submit Code / Hidden Test Cases)
    const results = [];
    
    for (const tc of testCases) {
      try {
        const response = await fetch(PISTON_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: config.language,
            version: config.version,
            files: [{ name: `main.${config.extension}`, content: source_code }],
            stdin: tc.input || "",
          }),
        });

        const data = await response.json();

        if (!response.ok || !data || !data.run) {
          results.push({
            status: { description: "API Error" },
            stdout: "",
            stderr: data?.message || `Piston Node Status: ${response.status}`,
            passed: false
          });
          continue;
        }

        const actualOutput = (data.run.stdout || "").trim();
        const expectedOutput = (tc.output || "").trim();
        
        results.push({
          status: { description: data.run.code === 0 ? "Accepted" : "Runtime Error" },
          stdout: data.run.stdout || "",
          stderr: data.run.stderr || "",
          compile_output: data.compile?.stderr || "",
          time: data.run.time || "0.000",
          passed: actualOutput === expectedOutput && data.run.code === 0
        });
      } catch (innerError: any) {
        results.push({
          status: { description: "Node Failure" },
          stderr: innerError.message,
          passed: false
        });
      }
    }

    return NextResponse.json({ results });

  } catch (error: any) {
    console.error('[Piston API Proxy] Critical Failure:', error);
    return NextResponse.json({ 
      error: "Neural execution node encountered a critical fault.", 
      details: error.message 
    }, { status: 500 });
  }
}
