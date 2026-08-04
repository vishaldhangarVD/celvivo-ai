import { NextResponse } from 'next/server';

/**
 * @fileOverview Secure server-side proxy for Judge0 CE code execution.
 * Prevents exposing API endpoints and handles batch execution for hidden test cases.
 */

const JUDGE0_CE_URL = 'https://ce.judge0.com';

export async function POST(req: Request) {
  try {
    const { source_code, language_id, stdin, testCases } = await req.json();

    if (!testCases) {
      // Single Execution Node (Run Code)
      const response = await fetch(`${JUDGE0_CE_URL}/submissions/?base64_encoded=false&wait=true`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          source_code, 
          language_id, 
          stdin: stdin || "" 
        }),
      });

      if (response.status === 401) {
        return NextResponse.json({ error: "Judge0 Configuration Error: Authentication Required." }, { status: 401 });
      }

      const data = await response.json();
      return NextResponse.json(data);
    } else {
      // Batch Execution Node (Submit Code - Hidden Test Cases)
      const results = [];
      
      for (const tc of testCases) {
        const response = await fetch(`${JUDGE0_CE_URL}/submissions/?base64_encoded=false&wait=true`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            source_code, 
            language_id, 
            stdin: tc.input 
          }),
        });

        const data = await response.json();
        
        results.push({
          status: data.status,
          stdout: data.stdout,
          stderr: data.stderr,
          compile_output: data.compile_output,
          time: data.time,
          memory: data.memory,
          expected: tc.output,
          passed: data.stdout?.trim() === tc.output?.trim() && data.status.id === 3
        });
      }

      return NextResponse.json({ results });
    }
  } catch (error: any) {
    console.error('[Judge0 API Proxy] Error:', error);
    return NextResponse.json({ 
      error: "Neural execution node unavailable.", 
      details: error.message 
    }, { status: 500 });
  }
}
