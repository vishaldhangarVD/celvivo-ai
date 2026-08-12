import { NextResponse } from 'next/server';

/**
 * @fileOverview JDoodle Neural Execution Gateway v10.0 (Standardized Validation).
 * Securely proxies code execution and performs strict output validation.
 * Supports 13 languages: Python, Java, C++, JavaScript, TypeScript, C, C#, Go, Rust, Kotlin, PHP, Swift, Ruby.
 */

const JDOODLE_URL = 'https://api.jdoodle.com/v1/execute';

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
  typescript: { 
    language: 'typescript', 
    versionIndex: '0', 
    ext: 'ts', 
    compile: 'tsc solution.ts --target es6 --module commonjs', 
    run: 'node solution.js', 
    file: 'solution.ts' 
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
  kotlin: { 
    language: 'kotlin', 
    versionIndex: '3', 
    ext: 'kt', 
    compile: 'kotlinc solution.kt -include-runtime -d solution.jar', 
    run: 'java -jar solution.jar', 
    file: 'solution.kt' 
  },
  php: { 
    language: 'php', 
    versionIndex: '4', 
    ext: 'php', 
    run: 'php solution.php', 
    file: 'solution.php' 
  },
  swift: { 
    language: 'swift', 
    versionIndex: '4', 
    ext: 'swift', 
    compile: 'swiftc solution.swift -o solution', 
    run: './solution', 
    file: 'solution.swift' 
  },
  ruby: { 
    language: 'ruby', 
    versionIndex: '4', 
    ext: 'rb', 
    run: 'ruby solution.rb', 
    file: 'solution.rb' 
  }
};

/**
 * Normalizes output for robust logic comparison.
 * Trims each line, removes trailing empty lines, and normalizes line endings.
 */
function normalizeOutput(output: string): string {
  if (!output) return "";
  return output
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .trim();
}

/**
 * Identifies if output contains common runtime error markers.
 */
function detectRuntimeError(output: string): boolean {
  const lower = output.toLowerCase();
  return lower.includes("traceback") || 
         lower.includes("exception") ||
         lower.includes("runtime error") ||
         lower.includes("segmentation fault") ||
         lower.includes("core dumped") ||
         lower.includes("panic") ||
         lower.includes("fatal error") ||
         lower.includes("unexpected error");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Empty logic payload." }, { status: 400 });

    const { source_code, language, stdin, testCases, expectedOutput } = body;
    const config = LANGUAGE_CONFIG[language];

    const clientId = process.env.JDOODLE_CLIENT_ID;
    const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "JDoodle credentials missing." }, { status: 500 });
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

      const stdout = data.output || "";
      const actualNormalized = normalizeOutput(stdout);
      const isRuntimeError = detectRuntimeError(stdout);
      
      let status = "PASSED";
      let passed = true;

      if (isRuntimeError) {
        status = "RUNTIME ERROR";
        passed = false;
      } else if (expectedOutput) {
        const expectedNormalized = normalizeOutput(expectedOutput);
        if (actualNormalized !== expectedNormalized) {
          status = "WRONG ANSWER";
          passed = false;
        }
      }

      return NextResponse.json({
        stdout,
        passed,
        status,
        time: data.cpuTime || "0.00",
        memory: data.memory || "N/A"
      });
    }

    // Mode B: Optimized Batch Execution (Submit Node)
    let bashScript = `cat << 'NEXVORO_CODE_EOF' > ${config.file}\n${source_code}\nNEXVORO_CODE_EOF\n\n`;
    
    if (config.compile) {
      bashScript += `${config.compile} 2> compile_errors.txt\n`;
      bashScript += `if [ $? -ne 0 ]; then\n  echo "NEXVORO_COMPILE_ERROR"\n  cat compile_errors.txt\n  exit 0\nfi\n\n`;
    }

    testCases.forEach((tc, idx) => {
      bashScript += `cat << 'NEXVORO_IN_${idx}' > in_${idx}.txt\n${tc.input || ""}\nNEXVORO_IN_${idx}\n`;
    });

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
    
    if (output.includes("NEXVORO_COMPILE_ERROR")) {
      const compileMsg = output.split("NEXVORO_COMPILE_ERROR")[1]?.trim() || "Compilation failed.";
      return NextResponse.json({
        results: testCases.map(tc => ({
          passed: false,
          status: "COMPILATION ERROR",
          actual: compileMsg
        }))
      });
    }

    const auditResults = testCases.map((tc, idx) => {
      const startTag = `NEXVORO_CASE_${idx}_START`;
      const endTag = `NEXVORO_CASE_${idx}_END`;
      const parts = output.split(startTag);
      if (parts.length < 2) return { passed: false, status: "EXECUTION ERROR" };
      
      const caseOutput = parts[1].split(endTag)[0]?.trim() || "";
      const actualNormalized = normalizeOutput(caseOutput);
      const expectedNormalized = normalizeOutput(tc.output);
      const isRuntimeError = detectRuntimeError(caseOutput);
      const isTLE = output.toLowerCase().includes("time limit exceeded");

      let status = "PASSED";
      let passed = !isRuntimeError && !isTLE && (actualNormalized === expectedNormalized);

      if (isTLE) status = "TIME LIMIT EXCEEDED";
      else if (isRuntimeError) status = "RUNTIME ERROR";
      else if (!passed) status = "WRONG ANSWER";

      return {
        passed,
        status,
        actual: actualNormalized,
        executionTime: (parseFloat(data.cpuTime || "0") / testCases.length).toFixed(2),
        memory: data.memory || "N/A"
      };
    });

    return NextResponse.json({ results: auditResults });

  } catch (error: any) {
    console.error('[JDoodle Standardized Proxy] Fatal Fault:', error);
    return NextResponse.json({ error: "Internal Audit Failure" }, { status: 500 });
  }
}
