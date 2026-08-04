/**
 * @fileOverview Judge0 Language ID Mapping for Nexvoro AI.
 * Reference: https://ce.judge0.com/languages
 */

export const JUDGE0_LANG_MAP: Record<string, number> = {
  'c': 50,          // C (GCC 9.2.0)
  'cpp': 54,        // C++ (GCC 9.2.0)
  'csharp': 51,     // C# (Mono 6.6.0.161)
  'go': 60,         // Go (1.13.5)
  'java': 62,       // Java (OpenJDK 13.0.1)
  'javascript': 63, // JavaScript (Node.js 12.14.0)
  'python': 71,     // Python (3.8.1)
  'rust': 73,       // Rust (1.40.0)
};

export const getJudge0LanguageId = (id: string): number => {
  return JUDGE0_LANG_MAP[id] || 71; // Default to Python 3
};
