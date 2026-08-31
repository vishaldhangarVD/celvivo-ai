/**
 * @fileOverview Nexvoro AI Master Question Data (v30.0 - Audited Nodes, 13 Languages).
 * A high-fidelity repository of coding challenges across all difficulty tiers.
 */

export interface CodingQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  topic: string;
  estimatedTime: string;
  company: string;
  tags: string[];
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  sampleInput: string;
  sampleOutput: string;
  explanation: string;
  starterCode: Record<string, string>;
  hiddenTestCases: { input: string; output: string }[];
  timeLimit: string;
  memoryLimit: string;
  languageSupport: string[];
}

export const MASTER_QUESTIONS: CodingQuestion[] = [
  {
    id: "easy-01",
    title: "Palindrome Verification",
    description: "Determine if a string reads the same forwards and backwards.",
    difficulty: "Easy",
    category: "Strings",
    topic: "STRING_LOGIC",
    estimatedTime: "10 mins",
    company: "TCS",
    tags: ["Strings", "Logic"],
    inputFormat: "A single string S.",
    outputFormat: "YES or NO.",
    constraints: ["1 <= |S| <= 10^5"],
    sampleInput: "racecar",
    sampleOutput: "YES",
    explanation: "'racecar' is identical when reversed.",
    starterCode: {
      python: "def solution(s):\n    # Write your logic here\n    pass",
      javascript: "function solution(s) {\n  // Write your logic here\n}",
      java: "public class Main {\n    public static void main(String[] args) {\n        // Write your logic here\n    }\n}"
    },
    hiddenTestCases: [
      { input: "madam", output: "YES" },
      { input: "hello", output: "NO" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "javascript", "java"]
  },
  {
    id: "medium-01",
    title: "Array Rotation",
    description: "Rotate an array of N integers to the right by K steps.",
    difficulty: "Medium",
    category: "Arrays",
    topic: "ALGORITHM",
    estimatedTime: "15 mins",
    company: "Microsoft",
    tags: ["Arrays", "Optimization"],
    inputFormat: "N and K followed by N integers.",
    outputFormat: "The rotated array.",
    constraints: ["1 <= N <= 10^5", "0 <= K <= 10^5"],
    sampleInput: "5 2\n1 2 3 4 5",
    sampleOutput: "4 5 1 2 3",
    explanation: "Elements shift right by 2 positions.",
    starterCode: {
      python: "def solution(nums, k):\n    # Write your logic here\n    pass"
    },
    hiddenTestCases: [
      { input: "3 1\n10 20 30", output: "30 10 20" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python"]
  },
  {
    id: "hard-01",
    title: "Trapping Rain Water",
    description: "Compute how much water an elevation map can trap after raining.",
    difficulty: "Hard",
    category: "Arrays",
    topic: "TWO_POINTERS",
    estimatedTime: "30 mins",
    company: "Google",
    tags: ["Hard", "Logic"],
    inputFormat: "N followed by N integers.",
    outputFormat: "Total water trapped.",
    constraints: ["1 <= N <= 10^5"],
    sampleInput: "6\n4 2 0 3 2 5",
    sampleOutput: "9",
    explanation: "Water is trapped between higher bars.",
    starterCode: {
      python: "def solution(heights):\n    # Write your logic here\n    pass"
    },
    hiddenTestCases: [
      { input: "3\n2 0 2", output: "2" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python"]
  }
];
