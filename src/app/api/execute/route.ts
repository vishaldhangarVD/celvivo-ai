import { NextResponse } from 'next/server';

/**
 * @fileOverview JDoodle Neural Execution Gateway v8.0 (Optimized).
 * Securely proxies code execution requests to JDoodle high-performance nodes.
 * Implements a Batch Execution Harness to minimize credit consumption.
 * Achieves 1-credit per node-submission audit by wrapping logic in a server-side runner.
 */

const JDOODLE_URL = 'https://api.jdoodle.com/v1/execute';

/**
 * Protocol Configuration for JDoodle Nodes.
 * Includes compilation and execution directives for the batch harness.
 */
const LANGUAGE_CONFIG: Record<string, { 
  language: string; 
  versionIndex: string; 
  ext: string;
  compile?: string;
  run: string;
  file: string;
}> = {
  python: { 
    language: 'python3', 
    versionIndex: '4', 
    ext: 'py', 
    run: 'python3 solution.py', 
    file: 'solution.py' 
  },
  java: { 
    language: 'java', 
    versionIndex: '4', 
    ext: 'java', 
    compile: 'javac Main.java', 
    run: 'java Main', 
    file: 'Main.java' 
  },
  cpp: { 
    language: 'cpp17', 
    versionIndex: '1', 
    ext: 'cpp', 
    compile: 'g++ -O3 solution.cpp -o solution', 
    run: './solution', 
    file: 'solution.cpp' 
  },
  javascript: { 
    language: 'nodejs', 
    versionIndex: '4', 
    ext: 'js', 
    run: 'node solution.js', 
    file: 'solution.js' 
  },
  c: { 
    language: 'c', 
    versionIndex: '4', 
    ext: 'c', 
    compile: 'gcc -O3 solution.c -o solution', 
    run: './solution', 
    file: 'solution.c' 
  },
  csharp: { 
    language: 'csharp', 
    versionIndex: '4', 
    ext: 'cs', 
    compile: 'mcs solution.cs', 
    run: 'mono solution.exe', 
    file: 'solution.cs' 
  },
  go: { 
    language: 'go', 
    versionIndex: '4', 
    ext: 'go', 
    compile: 'go build -o solution solution.go', 
    run: './solution', 
    file: 'solution.go' 
  },
  rust: { 
    language: 'rust', 
    versionIndex: '4', 
    ext: 'rs', 
    compile: 'rustc solution.rs -o solution', 
    run: './solution', 
    file: 'solution.rs' 
  },
};

/**
 * Normalizes output for robust logic comparison.
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
    const config = LANGUAGE_CONFIG[language];

    const clientId = process.env.JDOODLE_CLIENT_ID;
    const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "JDoodle credentials missing in environment." }, { status: 500 });
    }

    if (!config) return NextResponse.json({ error: `Language "${language}" not supported.` }, { status: 400 });
    if (!source_code) return NextResponse.json({ error: "Implementation buffer empty." }, { status: 400 });

    // Mode A: Single Execution (Run Sample) - Preserves original behavior
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

    // Mode B: Optimized Batch Execution (Submit Node)
    // We construct a bash script that handles all test cases in one JDoodle call.
    
    let bashScript = `cat << 'NEXVORO_CODE_EOF' > ${config.file}\n${source_code}\nNEXVORO_CODE_EOF\n\n`;
    
    // Compilation Step
    if (config.compile) {
      bashScript += `${config.compile} 2> compile_errors.txt\n`;
      bashScript += `if [ $? -ne 0 ]; then\n  echo "NEXVORO_COMPILE_ERROR"\n  cat compile_errors.txt\n  exit 0\nfi\n\n`;
    }

    // Write all input cases to individual files
    testCases.forEach((tc, idx) => {
      bashScript += `cat << 'NEXVORO_IN_${idx}' > in_${idx}.txt\n${tc.input || ""}\nNEXVORO_IN_${idx}\n`;
    });

    // Run execution loop with delimiters
    bashScript += `\necho "NEXVORO_BATCH_START"\n`;
    testCases.forEach((tc, idx) => {
      bashScript += `echo "NEXVORO_CASE_${idx}_START"\n`;
      bashScript += `${config.run} < in_${idx}.txt 2>&1\n`;
      bashScript += `echo "NEXVORO_CASE_${idx}_END"\n`;
    });
    bashScript += `echo "NEXVORO_BATCH_END"\n`;

    const response = await fetch(JDOODLE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        clientSecret,
        script: bashScript,
        language: 'bash',
        versionIndex: '4',
      }),
    });

    const data = await response.json();
    if (data.error) return NextResponse.json({ error: data.error }, { status: 500 });

    const output = data.output || "";
    
    // Check for Compilation Error
    if (output.includes("NEXVORO_COMPILE_ERROR")) {
      const compileMsg = output.split("NEXVORO_COMPILE_ERROR")[1]?.trim() || "Compilation failed.";
      return NextResponse.json({
        results: testCases.map(tc => ({
          input: tc.input,
          expected: tc.output,
          actual: compileMsg,
          passed: false,
          status: "Compilation Error"
        }))
      });
    }

    // Parse batch output into individual case results
    const auditResults = testCases.map((tc, idx) => {
      const startTag = `NEXVORO_CASE_${idx}_START`;
      const endTag = `NEXVORO_CASE_${idx}_END`;
      
      const parts = output.split(startTag);
      if (parts.length < 2) return { input: tc.input, expected: tc.output, actual: "Internal Error", passed: false, status: "Audit Fault" };
      
      const caseOutput = parts[1].split(endTag)[0]?.trim() || "";
      
      const actualNormalized = normalizeOutput(caseOutput);
      const expectedNormalized = normalizeOutput(tc.output);
      
      // Determine if there was a runtime error (captured via 2>&1 in bash)
      const isRuntimeError = caseOutput.toLowerCase().includes("traceback") || 
                            caseOutput.toLowerCase().includes("exception") ||
                            caseOutput.toLowerCase().includes("runtime error") ||
                            caseOutput.toLowerCase().includes("segmentation fault");

      const passed = !isRuntimeError && (actualNormalized === expectedNormalized);

      return {
        input: tc.input,
        expected: expectedNormalized,
        actual: actualNormalized,
        passed: passed,
        status: isRuntimeError ? "Runtime Error" : passed ? "Verified" : "Logic Mismatch",
        executionTime: (parseFloat(data.cpuTime || "0") / testCases.length).toFixed(2),
        memory: data.memory || "N/A",
        rawOutput: caseOutput
      };
    });

    return NextResponse.json({ results: auditResults });

  } catch (error: any) {
    console.error('[JDoodle Optimized Proxy] Fatal Fault:', error);
    return NextResponse.json({ error: "Internal Batch Audit Failure" }, { status: 500 });
  }
}