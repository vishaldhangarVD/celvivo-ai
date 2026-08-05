/**
 * @fileOverview Piston API Integration for Nexvoro AI.
 * Handles high-fidelity code execution across core programming languages.
 */

export type ExecutionResult = {
  stdout: string;
  stderr: string;
  code: number;
  signal: string | null;
  output: string;
};

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

export async function executeCode(language: string, code: string, stdin: string = ""): Promise<ExecutionResult> {
  const config = LANGUAGE_MAP[language];
  if (!config) throw new Error(`Protocol for ${language} not defined.`);

  try {
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: config.language,
        version: config.version,
        files: [{ content: code }],
        stdin: stdin,
      }),
    });

    const result = await response.json();
    if (!result.run) throw new Error("Execution node failed to respond.");

    return {
      stdout: result.run.stdout,
      stderr: result.run.stderr,
      code: result.run.code,
      signal: result.run.signal,
      output: result.run.output,
    };
  } catch (error) {
    console.error('[Piston] Execution Error:', error);
    throw error;
  }
}
