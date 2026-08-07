/**
 * @fileOverview Nexvoro AI Master Question Data (v4.0 - Fresher Recruitment Calibration).
 * Curated for Tier-1 hiring standards (TCS, Infosys, Accenture, Wipro).
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
  // --- EASY CATEGORY (Q1 & Q2) ---
  {
    id: "fresher-easy-01",
    title: "Palindrome Verification",
    description: "Write a program to determine if a given string is a palindrome. A string is a palindrome if it reads the same forward and backward, ignoring case and non-alphanumeric characters.",
    difficulty: "Easy",
    category: "Strings",
    topic: "Strings",
    estimatedTime: "5-8 min",
    company: "TCS",
    tags: ["Basic", "Logic", "Strings"],
    inputFormat: "A single line containing a string S.",
    outputFormat: "Print 'YES' if it is a palindrome, otherwise 'NO'.",
    constraints: ["1 <= length of S <= 10^4", "S contains ASCII characters."],
    sampleInput: "racecar",
    sampleOutput: "YES",
    explanation: "The string 'racecar' reads the same in both directions. Hence, it is a palindrome.",
    starterCode: {
      python: "def solve():\n    s = input().lower()\n    # Implement logic here\n    if s == s[::-1]:\n        print('YES')\n    else:\n        print('NO')\nsolve()",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine().toLowerCase();\n        String rev = new StringBuilder(s).reverse().toString();\n        if(s.equals(rev)) System.out.println(\"YES\");\n        else System.out.println(\"NO\");\n    }\n}",
      javascript: "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8').trim().toLowerCase();\nconst rev = input.split('').reverse().join('');\nconsole.log(input === rev ? 'YES' : 'NO');"
    },
    hiddenTestCases: [
      { input: "madam", output: "YES" },
      { input: "hello", output: "NO" },
      { input: "a", output: "YES" },
      { input: "Abba", output: "YES" },
      { input: "12321", output: "YES" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "javascript"]
  },
  {
    id: "fresher-easy-02",
    title: "Second Largest Node",
    description: "Given an array of N integers, find the second largest element. If the second largest element does not exist (e.g., all elements are same), print -1.",
    difficulty: "Easy",
    category: "Arrays",
    topic: "Arrays",
    estimatedTime: "8-12 min",
    company: "Accenture",
    tags: ["Arrays", "Iteration"],
    inputFormat: "First line contains integer N. Second line contains N space-separated integers.",
    outputFormat: "A single integer representing the second largest value.",
    constraints: ["1 <= N <= 10^5", "1 <= arr[i] <= 10^9"],
    sampleInput: "5\n12 35 1 10 34",
    sampleOutput: "34",
    explanation: "In the array [12, 35, 1, 10, 34], the largest is 35 and the second largest is 34.",
    starterCode: {
      python: "def solve():\n    n = int(input())\n    arr = list(map(int, input().split()))\n    # Implement logic\n    unique_arr = list(set(arr))\n    unique_arr.sort()\n    if len(unique_arr) < 2:\n        print(-1)\n    else:\n        print(unique_arr[-2])\nsolve()",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        TreeSet<Integer> set = new TreeSet<>();\n        for(int i=0; i<n; i++) set.add(sc.nextInt());\n        if(set.size() < 2) System.out.println(-1);\n        else {\n            set.pollLast();\n            System.out.println(set.last());\n        }\n    }\n}"
    },
    hiddenTestCases: [
      { input: "2\n10 10", output: "-1" },
      { input: "3\n1 2 3", output: "2" },
      { input: "5\n5 4 3 2 1", output: "4" },
      { input: "1\n100", output: "-1" },
      { input: "4\n10 20 20 15", output: "10" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "javascript"]
  },

  // --- MEDIUM CATEGORY (Q3 & Q4) ---
  {
    id: "fresher-medium-01",
    title: "Balanced Bracket Sequence",
    description: "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if brackets are closed in the correct order and by the same type of brackets.",
    difficulty: "Medium",
    category: "Stack",
    topic: "Stack",
    estimatedTime: "15-20 min",
    company: "Capgemini",
    tags: ["Stack", "Data Structures"],
    inputFormat: "A single string S.",
    outputFormat: "Print 'true' if valid, 'false' otherwise.",
    constraints: ["1 <= S.length <= 10^4", "S consists of bracket characters only."],
    sampleInput: "{[()]}",
    sampleOutput: "true",
    explanation: "Every opening bracket has a corresponding closing bracket in the correct nested order.",
    starterCode: {
      python: "def solve():\n    s = input().strip()\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top: \n                print('false'); return\n        else:\n            stack.append(char)\n    print('true' if not stack else 'false')\nsolve()",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.next();\n        Stack<Character> stack = new Stack<>();\n        for(char c : s.toCharArray()) {\n            if(c == '(' || c == '{' || c == '[') stack.push(c);\n            else if(stack.isEmpty()) { System.out.println(\"false\"); return; }\n            else if(c == ')' && stack.pop() != '(') { System.out.println(\"false\"); return; }\n            else if(c == '}' && stack.pop() != '{') { System.out.println(\"false\"); return; }\n            else if(c == ']' && stack.pop() != '[') { System.out.println(\"false\"); return; }\n        }\n        System.out.println(stack.isEmpty() ? \"true\" : \"false\");\n    }\n}"
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
    title: "Unique Character Audit",
    description: "Given a string S, find the first non-repeating character and return its index. If it doesn't exist, return -1. Consider the string to be lowercase English letters only.",
    difficulty: "Medium",
    category: "Hashing",
    topic: "HashMap",
    estimatedTime: "12-18 min",
    company: "Infosys",
    tags: ["Hashing", "Strings"],
    inputFormat: "A single line containing string S.",
    outputFormat: "The index of the first non-repeating character.",
    constraints: ["1 <= S.length <= 10^5", "S consists of lowercase English letters."],
    sampleInput: "nexvoroai",
    sampleOutput: "0",
    explanation: "In 'nexvoroai', 'n' is the first character that appears only once in the string.",
    starterCode: {
      python: "def solve():\n    s = input().strip()\n    # Use a hash map to store frequencies\n    count = {}\n    for char in s:\n        count[char] = count.get(char, 0) + 1\n    for i, char in enumerate(s):\n        if count[char] == 1:\n            print(i); return\n    print(-1)\nsolve()",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.next();\n        int[] freq = new int[26];\n        for(char c : s.toCharArray()) freq[c-'a']++;\n        for(int i=0; i<s.length(); i++) {\n            if(freq[s.charAt(i)-'a'] == 1) {\n                System.out.println(i); return;\n            }\n        }\n        System.out.println(-1);\n    }\n}"
    },
    hiddenTestCases: [
      { input: "leetcode", output: "0" },
      { input: "loveleetcode", output: "2" },
      { input: "aabb", output: "-1" },
      { input: "abcdef", output: "0" },
      { input: "z", output: "0" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "javascript"]
  },

  // --- HARD CATEGORY (Q5 - Fresher Peak) ---
  {
    id: "fresher-hard-01",
    title: "Maximum Subarray Sum",
    description: "Given an array of integers, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum. This is commonly solved using Kadane's Algorithm.",
    difficulty: "Hard",
    category: "Arrays",
    topic: "Dynamic Programming",
    estimatedTime: "20-30 min",
    company: "Wipro",
    tags: ["Optimization", "Arrays"],
    inputFormat: "First line contains integer N. Second line contains N integers.",
    outputFormat: "A single integer representing the maximum sum.",
    constraints: ["1 <= N <= 10^5", "-10^4 <= arr[i] <= 10^4"],
    sampleInput: "8\n-2 1 -3 4 -1 2 1 -5",
    sampleOutput: "6",
    explanation: "The contiguous subarray [4, -1, 2, 1] has the largest sum = 6.",
    starterCode: {
      python: "def solve():\n    n = int(input())\n    arr = list(map(int, input().split()))\n    # Implement Kadane's Algorithm\n    max_so_far = arr[0]\n    current_max = arr[0]\n    for i in range(1, n):\n        current_max = max(arr[i], current_max + arr[i])\n        max_so_far = max(max_so_far, current_max)\n    print(max_so_far)\nsolve()",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for(int i=0; i<n; i++) arr[i] = sc.nextInt();\n        long maxSoFar = arr[0], currentMax = arr[0];\n        for(int i=1; i<n; i++) {\n            currentMax = Math.max(arr[i], currentMax + arr[i]);\n            maxSoFar = Math.max(maxSoFar, currentMax);\n        }\n        System.out.println(maxSoFar);\n    }\n}"
    },
    hiddenTestCases: [
      { input: "1\n5", output: "5" },
      { input: "5\n-1 -2 -3 -4 -5", output: "-1" },
      { input: "4\n1 2 3 4", output: "10" },
      { input: "6\n-2 1 -3 4 -1 2", output: "4" },
      { input: "3\n10 -5 20", output: "20" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "javascript"]
  }
];
