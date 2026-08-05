import { NextResponse } from 'next/server';

/**
 * @fileOverview Secure server-side proxy for Piston code execution.
 * Replaces Judge0 CE. Handles single run and batch test case verification.
 */

const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';

const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  python: { language: 'python', version: '3.10.0' },
  java: { language: 'java', version: '15.0.2' },
  cpp: { language: 'cpp', version: '10.2.0' },
  javascript: { language: 'javascript', version: '18.15.0' },
  c: { language: 'c', version: '10.2.0' },
  csharp: { language: 'csharp', version: '6.12.0' },
  go: { language: 'go', version: '1.16.2' },
  rust: { language: 'rust', version: '1.40.0' },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { source_code, language, stdin, testCases } = body;
    const config = LANGUAGE_MAP[language];

    console.log("========== EXECUTION REQUEST ==========");
    console.log(`Selected Language: ${language}`);
    console.log(`Mapped Config: ${JSON.stringify(config)}`);
    console.log("======================================");

    if (!config) {
      return NextResponse.json({ error: `Protocol for ${language} not defined.` }, { status: 400 });
    }

    if (!testCases) {
      // Single Execution Node (Run Code)
      const startTime = Date.now();
      const response = await fetch(PISTON_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: config.language,
          version: config.version,
          files: [{ content: source_code }],
          stdin: stdin || "",
        }),
      });

      console.log(`[Piston] Response Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        throw new Error(`Piston API Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("========== PISTON RESPONSE (SINGLE) ==========");
      console.log(JSON.stringify(data, null, 2));
      console.log("==============================================");

      // Validate Piston Response Structure
      if (!data || !data.run) {
        return NextResponse.json({
          error: "Invalid response from Piston",
          response: data
        }, { status: 500 });
      }

      const executionTime = ((Date.now() - startTime) / 1000).toFixed(3);

      return NextResponse.json({
        stdout: data.run.stdout || "",
        stderr: data.run.stderr || "",
        compile_output: data.compile?.stderr || data.compile?.stdout || "",
        status: { description: data.run.code === 0 ? "Accepted" : "Runtime Error" },
        time: executionTime,
        memory: "N/A"
      });
    } else {
      // Batch Execution Node (Submit Code - Hidden Test Cases)
      const results = [];
      
      for (const tc of testCases) {
        const startTime = Date.now();
        const response = await fetch(PISTON_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: config.language,
            version: config.version,
            files: [{ content: source_code }],
            stdin: tc.input || "",
          }),
        });

        if (!response.ok) {
          results.push({
            status: { description: "API Error" },
            stdout: "",
            stderr: `Piston API Error: ${response.statusText}`,
            compile_output: "",
            time: "0.000",
            memory: "N/A",
            passed: false
          });
          continue;
        }

        const data = await response.json();
        console.log("========== PISTON RESPONSE (BATCH) ==========");
        console.log(JSON.stringify(data, null, 2));
        console.log("=============================================");

        if (!data || !data.run) {
          results.push({
            status: { description: "Piston Error" },
            stdout: "",
            stderr: "Invalid response from Piston node.",
            compile_output: "",
            time: "0.000",
            memory: "N/A",
            passed: false
          });
          continue;
        }

        const executionTime = ((Date.now() - startTime) / 1000).toFixed(3);
        const actualOutput = (data.run.stdout || "").trim();
        const expectedOutput = (tc.output || "").trim();
        
        results.push({
          status: { description: data.run.code === 0 ? "Accepted" : "Runtime Error" },
          stdout: data.run.stdout || "",
          stderr: data.run.stderr || "",
          compile_output: data.compile?.stderr || "",
          time: executionTime,
          memory: "N/A",
          passed: actualOutput === expectedOutput && data.run.code === 0
        });
      }

      return NextResponse.json({ results });
    }
  } catch (error: any) {
    console.error('[Piston API Proxy] Error:', error);
    return NextResponse.json({ 
      error: "Neural execution node unavailable.", 
      details: error.message 
    }, { status: 500 });
  }
}