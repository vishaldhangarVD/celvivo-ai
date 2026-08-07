/**
 * @fileOverview Nexvoro AI Master Question Data (v5.0 - Professional UX Calibration).
 * Curated for Tier-1 hiring standards with real-world scenarios and intuitive explanations.
 * Progression: Q1-2 Easy, Q3-4 Medium, Q5 Hard (Fresher Standard).
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
  // --- EASY CATEGORY ---
  {
    id: "fresher-easy-01",
    title: "The Mirror Word Test",
    description: "You are building a 'Mirror Word' validator for a children's educational app. A word is a 'Mirror Word' if it reads exactly the same forward and backward. Your task is to check if the given word is a mirror word.",
    difficulty: "Easy",
    category: "Strings",
    topic: "Strings",
    estimatedTime: "10 min",
    company: "TCS",
    tags: ["Basic", "Logic", "Strings"],
    inputFormat: "A single line containing one word (string).",
    outputFormat: "Print 'YES' if it is a Mirror Word, otherwise print 'NO'.",
    constraints: ["1 <= length <= 10,000", "Includes alphabets and numbers only."],
    sampleInput: "racecar",
    sampleOutput: "YES",
    explanation: "How to think: To check if a word is a mirror, imagine a line in the middle. The first character must match the last, the second must match the second-to-last, and so on. If every pair matches until you reach the middle, it's a Mirror Word!",
    starterCode: {
      python: "def solve():\n    # Read input and convert to lowercase\n    s = input().strip().lower()\n    # Check if string is equal to its reverse\n    if s == s[::-1]:\n        print('YES')\n    else:\n        print('NO')\nsolve()",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(!sc.hasNext()) return;\n        String s = sc.next().toLowerCase();\n        String rev = new StringBuilder(s).reverse().toString();\n        if(s.equals(rev)) System.out.println(\"YES\");\n        else System.out.println(\"NO\");\n    }\n}",
      javascript: "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8').trim().toLowerCase();\nconst rev = input.split('').reverse().join('');\nprocess.stdout.write(input === rev ? 'YES' : 'NO');"
    },
    hiddenTestCases: [
      { input: "madam", output: "YES" },
      { input: "hello", output: "NO" },
      { input: "12321", output: "YES" },
      { input: "Abba", output: "YES" },
      { input: "a", output: "YES" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "javascript"]
  },
  {
    id: "fresher-easy-02",
    title: "Tournament Runner-Up Finder",
    description: "You are designing a leaderboard for a gaming tournament. You need to find the score of the person who came in second place (the Runner-Up). If everyone has the same score, there is no runner-up.",
    difficulty: "Easy",
    category: "Arrays",
    topic: "Arrays",
    estimatedTime: "10 min",
    company: "Accenture",
    tags: ["Arrays", "Iteration"],
    inputFormat: "First line: Number of players N. Second line: N space-separated scores.",
    outputFormat: "The score of the runner-up. If not found, print -1.",
    constraints: ["1 <= N <= 100,000", "0 <= score <= 10^9"],
    sampleInput: "5\n10 20 20 15 5",
    sampleOutput: "15",
    explanation: "How to think: Don't just pick the second number in the list. First, find the absolute highest score. Then, look for the highest number that is strictly smaller than that maximum. That is your Runner-Up!",
    starterCode: {
      python: "def solve():\n    try:\n        n = int(input())\n        scores = list(map(int, input().split()))\n        # Use set to remove duplicates and sort\n        unique_scores = sorted(list(set(scores)))\n        if len(unique_scores) < 2:\n            print(-1)\n        else:\n            print(unique_scores[-2])\n    except: pass\nsolve()",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        TreeSet<Integer> set = new TreeSet<>();\n        for(int i=0; i<n; i++) set.add(sc.nextInt());\n        if(set.size() < 2) System.out.println(-1);\n        else {\n            set.pollLast(); // Remove largest\n            System.out.println(set.last()); // Print new largest\n        }\n    }\n}"
    },
    hiddenTestCases: [
      { input: "2\n10 10", output: "-1" },
      { input: "4\n1 2 3 4", output: "3" },
      { input: "1\n50", output: "-1" },
      { input: "5\n100 100 100 99 98", output: "99" },
      { input: "3\n5 10 2", output: "5" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "javascript"]
  },

  // --- MEDIUM CATEGORY ---
  {
    id: "fresher-medium-01",
    title: "Code Syntax Auditor",
    description: "You are writing a validator for a text editor. It needs to check if the brackets in a piece of code are balanced. Every opening bracket '(', '{', '[' must be closed by the matching type in the correct order.",
    difficulty: "Medium",
    category: "Stack",
    topic: "Stack",
    estimatedTime: "18 min",
    company: "Capgemini",
    tags: ["Stack", "Data Structures"],
    inputFormat: "A single string of brackets.",
    outputFormat: "Print 'true' if the code is balanced, otherwise print 'false'.",
    constraints: ["1 <= length <= 10,000", "Contains only: ( ) { } [ ]"],
    sampleInput: "{[()]}",
    sampleOutput: "true",
    explanation: "How to think: Use a 'Stack' (like a stack of plates). When you see an opening bracket, put it on the stack. When you see a closing bracket, check the plate on top of the stack. If they match, remove the plate. If they don't, or the stack is empty, the code is broken!",
    starterCode: {
      python: "def solve():\n    s = input().strip()\n    stack = []\n    pairs = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in pairs:\n            if not stack or stack.pop() != pairs[char]:\n                print('false'); return\n        else:\n            stack.append(char)\n    print('true' if not stack else 'false')\nsolve()",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(!sc.hasNext()) return;\n        String s = sc.next();\n        Stack<Character> stack = new Stack<>();\n        for(char c : s.toCharArray()) {\n            if(c == '(' || c == '{' || c == '[') stack.push(c);\n            else {\n                if(stack.isEmpty()) { System.out.println(\"false\"); return; }\n                char top = stack.pop();\n                if(c == ')' && top != '(') { System.out.println(\"false\"); return; }\n                if(c == '}' && top != '{') { System.out.println(\"false\"); return; }\n                if(c == ']' && top != '[') { System.out.println(\"false\"); return; }\n            }\n        }\n        System.out.println(stack.isEmpty() ? \"true\" : \"false\");\n    }\n}"
    },
    hiddenTestCases: [
      { input: "()", output: "true" },
      { input: "()[]{}", output: "true" },
      { input: "(]", output: "false" },
      { input: "([)]", output: "false" },
      { input: "((", output: "false" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "javascript"]
  },
  {
    id: "fresher-medium-02",
    title: "First Unique Visitor",
    description: "You are analyzing website traffic. Given a string representing visitor IDs (one letter per visitor), find the index of the first visitor who visited only once. If everyone visited multiple times, return -1.",
    difficulty: "Medium",
    category: "Hash Map",
    topic: "Hash Map",
    estimatedTime: "18 min",
    company: "Infosys",
    tags: ["Hashing", "Strings"],
    inputFormat: "A single line containing the visitor string.",
    outputFormat: "The zero-based index of the first unique visitor.",
    constraints: ["1 <= length <= 100,000", "Smallest English letters only."],
    sampleInput: "nexvoroai",
    sampleOutput: "0",
    explanation: "How to think: First, count how many times each letter appears in the whole string using a Hash Map (Dictionary). Then, scan the string from left to right. The first letter you find with a count of exactly 1 is your answer!",
    starterCode: {
      python: "def solve():\n    s = input().strip()\n    counts = {}\n    for char in s:\n        counts[char] = counts.get(char, 0) + 1\n    for i, char in enumerate(s):\n        if counts[char] == 1:\n            print(i); return\n    print(-1)\nsolve()",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(!sc.hasNext()) return;\n        String s = sc.next();\n        Map<Character, Integer> counts = new HashMap<>();\n        for(char c : s.toCharArray()) counts.put(c, counts.getOrDefault(c, 0) + 1);\n        for(int i=0; i<s.length(); i++) {\n            if(counts.get(s.charAt(i)) == 1) {\n                System.out.println(i); return;\n            }\n        }\n        System.out.println(-1);\n    }\n}"
    },
    hiddenTestCases: [
      { input: "aabb", output: "-1" },
      { input: "leetcode", output: "0" },
      { input: "loveleetcode", output: "2" },
      { input: "z", output: "0" },
      { input: "abcabc", output: "-1" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "javascript"]
  },

  // --- HARD CATEGORY ---
  {
    id: "fresher-hard-01",
    title: "Maximum Profit Window",
    description: "You are tracking daily gains and losses in a volatile stock market period. Given an array of integers representing profits (positive) and losses (negative), find the largest possible sum of any consecutive sequence of days.",
    difficulty: "Hard",
    category: "Arrays",
    topic: "Arrays",
    estimatedTime: "30 min",
    company: "Wipro",
    tags: ["Optimization", "Arrays", "Kadane"],
    inputFormat: "First line: Number of days N. Second line: N space-separated integers.",
    outputFormat: "The maximum sum possible.",
    constraints: ["1 <= N <= 100,000", "-10,000 <= value <= 10,000"],
    sampleInput: "8\n-2 1 -3 4 -1 2 1 -5",
    sampleOutput: "6",
    explanation: "How to think: Imagine you are walking through the list. Keep adding the numbers to a 'Current Sum'. If your 'Current Sum' becomes negative, it's better to reset it to 0 and start fresh from the next day. Always keep track of the 'Best Sum' you've ever seen!",
    starterCode: {
      python: "def solve():\n    try:\n        n = int(input())\n        arr = list(map(int, input().split()))\n        max_so_far = -float('inf')\n        current_max = 0\n        for x in arr:\n            current_max += x\n            if max_so_far < current_max:\n                max_so_far = current_max\n            if current_max < 0:\n                current_max = 0\n        print(max_so_far)\n    except: pass\nsolve()",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        long maxSoFar = Long.MIN_VALUE, currentMax = 0;\n        for(int i=0; i<n; i++) {\n            int val = sc.nextInt();\n            currentMax += val;\n            if(maxSoFar < currentMax) maxSoFar = currentMax;\n            if(currentMax < 0) currentMax = 0;\n        }\n        System.out.println(maxSoFar);\n    }\n}"
    },
    hiddenTestCases: [
      { input: "1\n-5", output: "-5" },
      { input: "4\n1 2 3 4", output: "10" },
      { input: "5\n-1 -2 -3 -4 -5", output: "-1" },
      { input: "3\n10 -5 20", output: "25" },
      { input: "6\n-2 1 -3 4 -1 2", output: "5" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "javascript"]
  }
];
