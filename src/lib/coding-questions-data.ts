/**
 * @fileOverview Nexvoro AI Master Question Data (v3.0 - Level-Based Progression).
 * Curated list of 30+ challenges with structured metadata for fresher-friendly rounds.
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
  // EASY - ARRAYS & STRINGS
  {
    id: "easy-01",
    title: "Reverse a String",
    description: "Write a program that takes a string as input and returns the string in reverse order.",
    difficulty: "Easy",
    category: "Strings",
    topic: "Strings",
    estimatedTime: "5-10 min",
    company: "TCS",
    tags: ["Basic", "Logic"],
    inputFormat: "A single line containing a string S.",
    outputFormat: "A single line containing the reversed string.",
    constraints: ["1 <= S.length <= 10^5", "S contains printable ASCII characters."],
    sampleInput: "Nexvoro",
    sampleOutput: "orovxeN",
    explanation: "The characters of the string are rearranged from the last index to the first index.",
    starterCode: {
      python: "def solve():\n    s = input()\n    print(s[::-1])\nsolve()",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        System.out.println(new StringBuilder(s).reverse().toString());\n    }\n}",
      javascript: "const fs = require('fs');\nconst s = fs.readFileSync(0, 'utf8').trim();\nconsole.log(s.split('').reverse().join(''));"
    },
    hiddenTestCases: [
      { input: "hello", output: "olleh" },
      { input: "a", output: "a" },
      { input: "12345", output: "54321" },
      { input: "Racecar", output: "racecaR" },
      { input: "Space ", output: "ecapS" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "easy-02",
    title: "Find Maximum in Array",
    description: "Given an array of N integers, find the largest element present in it.",
    difficulty: "Easy",
    category: "Arrays",
    topic: "Arrays",
    estimatedTime: "5-10 min",
    company: "Infosys",
    tags: ["Basic", "Iteration"],
    inputFormat: "First line contains N. Second line contains N space-separated integers.",
    outputFormat: "A single integer representing the maximum value.",
    constraints: ["1 <= N <= 10^5", "-10^9 <= arr[i] <= 10^9"],
    sampleInput: "5\n1 5 3 9 2",
    sampleOutput: "9",
    explanation: "Iterate through the array and track the largest value seen so far. In [1, 5, 3, 9, 2], 9 is the largest.",
    starterCode: {
      python: "n = int(input())\narr = list(map(int, input().split()))\nprint(max(arr))",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        long max = Long.MIN_VALUE;\n        for(int i=0; i<n; i++) {\n            long x = sc.nextLong();\n            if(x > max) max = x;\n        }\n        System.out.println(max);\n    }\n}"
    },
    hiddenTestCases: [
      { input: "3\n-1 -5 -2", output: "-1" },
      { input: "1\n100", output: "100" },
      { input: "5\n10 10 10 10 10", output: "10" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },

  // MEDIUM - LOGIC & SLIDING WINDOW
  {
    id: "medium-01",
    title: "Two Sum",
    description: "Given an array of integers and a target sum, find if there exist two numbers that add up to the target.",
    difficulty: "Medium",
    category: "Hashing",
    topic: "Arrays",
    estimatedTime: "10-20 min",
    company: "Amazon",
    tags: ["HashMap", "Two Pointers"],
    inputFormat: "First line contains N and Target. Second line contains N integers.",
    outputFormat: "YES if a pair exists, otherwise NO.",
    constraints: ["2 <= N <= 10^5", "1 <= Target <= 10^9"],
    sampleInput: "5 9\n2 7 11 15 3",
    sampleOutput: "YES",
    explanation: "The pair (2, 7) adds up to 9. Since 2+7=9, the output is YES.",
    starterCode: {
      python: "def solve():\n    n, target = map(int, input().split())\n    arr = list(map(int, input().split()))\n    seen = set()\n    for x in arr:\n        if target - x in seen:\n            print('YES'); return\n        seen.add(x)\n    print('NO')\nsolve()"
    },
    hiddenTestCases: [
      { input: "4 10\n1 2 3 4", output: "NO" },
      { input: "2 5\n2 3", output: "YES" },
      { input: "6 100\n10 20 30 40 50 60", output: "YES" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "medium-02",
    title: "Merge Intervals",
    description: "Given a collection of intervals, merge all overlapping intervals.",
    difficulty: "Medium",
    category: "Arrays",
    topic: "Sorting",
    estimatedTime: "15-25 min",
    company: "Google",
    tags: ["Sorting", "Intervals"],
    inputFormat: "First line contains N. Next N lines contain two integers (start, end).",
    outputFormat: "Merged intervals in sorted order.",
    constraints: ["1 <= N <= 10^4"],
    sampleInput: "4\n1 3\n2 6\n8 10\n15 18",
    sampleOutput: "1 6\n8 10\n15 18",
    explanation: "Intervals [1,3] and [2,6] overlap, so they are merged into [1,6].",
    starterCode: {
      python: "def solve():\n    n = int(input())\n    intervals = []\n    for _ in range(n):\n        intervals.append(list(map(int, input().split())))\n    intervals.sort()\n    merged = [intervals[0]]\n    for i in range(1, n):\n        if intervals[i][0] <= merged[-1][1]:\n            merged[-1][1] = max(merged[-1][1], intervals[i][1])\n        else:\n            merged.append(intervals[i])\n    for m in merged: print(m[0], m[1])\nsolve()"
    },
    hiddenTestCases: [
      { input: "2\n1 4\n4 5", output: "1 5" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },

  // HARD - BASIC DP / RECURSION
  {
    id: "hard-01",
    title: "Longest Common Subsequence",
    description: "Find the length of the longest common subsequence between two strings.",
    difficulty: "Hard",
    category: "Dynamic Programming",
    topic: "DP",
    estimatedTime: "25-40 min",
    company: "Microsoft",
    tags: ["Recursion", "Strings"],
    inputFormat: "Two strings S1 and S2 on separate lines.",
    outputFormat: "An integer representing the LCS length.",
    constraints: ["1 <= S1, S2 length <= 1000"],
    sampleInput: "abcde\nace",
    sampleOutput: "3",
    explanation: "The LCS is 'ace', which has length 3.",
    starterCode: {
      python: "s1 = input()\ns2 = input()\nn, m = len(s1), len(s2)\ndp = [[0]*(m+1) for _ in range(n+1)]\nfor i in range(1, n+1):\n    for j in range(1, m+1):\n        if s1[i-1] == s2[j-1]: dp[i][j] = 1 + dp[i-1][j-1]\n        else: dp[i][j] = max(dp[i-1][j], dp[i][j-1])\nprint(dp[n][m])"
    },
    hiddenTestCases: [
      { input: "abc\ndef", output: "0" },
      { input: "AGGTAB\nGXTXAYB", output: "4" }
    ],
    timeLimit: "2s",
    memoryLimit: "512MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  }
];
