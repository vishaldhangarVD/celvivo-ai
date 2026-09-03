/**
 * @fileOverview Nexvoro AI Master Question Data (v46.0 - Restoration Batch 1).
 * Features Easy-01 to Easy-07 with full 13-language functional I/O support.
 * All stubs have been replaced with idiomatic, runnable templates.
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
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    difficulty: "Easy",
    category: "Arrays",
    topic: "HASH_MAP",
    estimatedTime: "10 mins",
    company: "Google",
    tags: ["Arrays", "Hash Table"],
    inputFormat: "First line contains N and Target. Second line contains N integers.",
    outputFormat: "Two space-separated indices.",
    constraints: ["2 <= N <= 10^4", "-10^9 <= nums[i] <= 10^9"],
    sampleInput: "4 9\n2 7 11 15",
    sampleOutput: "0 1",
    explanation: "Because nums[0] + nums[1] == 9, we return 0 1.",
    starterCode: {
      python: "import sys\n\ndef solution():\n    input_data = sys.stdin.read().split()\n    if not input_data: return\n    n = int(input_data[0])\n    target = int(input_data[1])\n    nums = [int(x) for x in input_data[2:2+n]]\n    \n    # Write your logic here\n    # Example: prevMap = {} ...\n\nif __name__ == \"__main__\":\n    solution()",
      java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int target = sc.nextInt();\n        int[] nums = new int[n];\n        for(int i = 0; i < n; i++) {\n            nums[i] = sc.nextInt();\n        }\n\n        // Write your logic here\n    }\n}",
      cpp: "#include <iostream>\n#include <vector>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n, target;\n    if(!(cin >> n >> target)) return 0;\n    vector<int> nums(n);\n    for(int i = 0; i < n; i++) cin >> nums[i];\n\n    // Write your logic here\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf8').split(/\\s+/);\n    if (input.length < 2) return;\n    const n = parseInt(input[0]);\n    const target = parseInt(input[1]);\n    const nums = input.slice(2, 2 + n).map(Number);\n\n    // Write your logic here\n}\n\nsolve();",
      typescript: "import * as fs from 'fs';\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf8').split(/\\s+/);\n    if (input.length < 2) return;\n    const n = parseInt(input[0]);\n    const target = parseInt(input[1]);\n    const nums = input.slice(2, 2 + n).map(Number);\n\n    // Write your logic here\n}\n\nsolve();",
      c: "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n, target;\n    if(scanf(\"%d %d\", &n, &target) != 2) return 0;\n    int *nums = (int*)malloc(n * sizeof(int));\n    for(int i = 0; i < n; i++) {\n        if(scanf(\"%d\", &nums[i]) != 1) break;\n    }\n\n    // Write your logic here\n\n    free(nums);\n    return 0;\n}",
      csharp: "using System;\nusing System.Collections.Generic;\n\nclass Solution {\n    static void Main() {\n        string input = Console.In.ReadToEnd();\n        string[] parts = input.Split(new[] { ' ', '\\n', '\\r', '\\t' }, StringSplitOptions.RemoveEmptyEntries);\n        if (parts.Length < 2) return;\n        int n = int.Parse(parts[0]);\n        int target = int.Parse(parts[1]);\n        int[] nums = new int[n];\n        for (int i = 0; i < n; i++) nums[i] = int.Parse(parts[i + 2]);\n        \n        // Write your logic here\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    var n, target int\n    if _, err := fmt.Scan(&n, &target); err != nil {\n        return\n    }\n    nums := make([]int, n)\n    for i := 0; i < n; i++ {\n        fmt.Scan(&nums[i])\n    }\n    \n    // Write your logic here\n}",
      rust: "use std::io::{self, Read};\n\nfn main() {\n    let mut buffer = String::new();\n    io::stdin().read_to_string(&mut buffer).unwrap();\n    let mut words = buffer.split_whitespace();\n    \n    if let (Some(n_str), Some(t_str)) = (words.next(), words.next()) {\n        let n: usize = n_str.parse().unwrap();\n        let target: i32 = t_str.parse().unwrap();\n        let nums: Vec<i32> = words.take(n).map(|x| x.parse().unwrap()).collect();\n        \n        // Write your logic here\n    }\n}",
      kotlin: "import java.util.Scanner\n\nfun main(args: Array<String>) {\n    val sc = Scanner(System.`in`)\n    if (!sc.hasNextInt()) return\n    val n = sc.nextInt()\n    val target = sc.nextInt()\n    val nums = IntArray(n)\n    for (i in 0 until n) {\n        nums[i] = sc.nextInt()\n    }\n    \n    // Write your logic here\n}",
      php: "<?php\n\n$input = preg_split('/\\s+/', trim(file_get_contents('php://stdin')));\nif (count($input) < 2) exit;\n\n$n = (int)$input[0];\n$target = (int)$input[1];\n$nums = array_slice($input, 2, $n);\n\n// Write your logic here (Find indices of numbers that sum to target)\n\n?>",
      swift: "import Foundation\n\nif let input = readLine()?.split(separator: \" \"), input.count >= 2 {\n    let n = Int(input[0])!\n    let target = Int(input[1])!\n    if let numsInput = readLine()?.split(separator: \" \") {\n        let nums = numsInput.map { Int($0)! }\n        // Write your logic here\n    }\n}",
      ruby: "line1 = gets.to_s.split\nif !line1.empty?\n  n, target = line1.map(&:to_i)\n  nums = gets.to_s.split.map(&:to_i)\n  \n  # Write your logic here\nend"
    },
    hiddenTestCases: [
      { input: "3 6\n3 2 4", output: "1 2" },
      { input: "2 6\n3 3", output: "0 1" },
      { input: "4 10\n1 2 3 8", output: "2 3" },
      { input: "5 100\n10 20 30 40 60", output: "3 4" },
      { input: "3 0\n-3 4 3", output: "0 2" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "javascript", "typescript", "cpp", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "easy-02",
    title: "Reverse String",
    description: "Write a function that reverses a string. The input string is given as an array of characters s.",
    difficulty: "Easy",
    category: "Strings",
    topic: "TWO_POINTERS",
    estimatedTime: "5 mins",
    company: "Amazon",
    tags: ["Strings", "Two Pointers"],
    inputFormat: "A single string s.",
    outputFormat: "The reversed string.",
    constraints: ["1 <= s.length <= 10^5"],
    sampleInput: "hello",
    sampleOutput: "olleh",
    explanation: "Reversing 'hello' results in 'olleh'.",
    starterCode: {
      python: "import sys\n\ndef solution():\n    s = sys.stdin.read().strip()\n    if not s: return\n    \n    # Write your logic here\n    # Example: print(s[::-1])\n\nif __name__ == \"__main__\":\n    solution()",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(!sc.hasNext()) return;\n        String s = sc.next();\n\n        // Write your logic here\n        // Example: StringBuilder sb = new StringBuilder(s); System.out.print(sb.reverse());\n    }\n}",
      cpp: "#include <iostream>\n#include <string>\n#include <algorithm>\n\nusing namespace std;\n\nint main() {\n    string s;\n    if(!(cin >> s)) return 0;\n\n    // Write your logic here\n    // Example: reverse(s.begin(), s.end()); cout << s;\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction solve() {\n    const s = fs.readFileSync(0, 'utf8').trim();\n    if (!s) return;\n\n    // Write your logic here\n}\n\nsolve();",
      typescript: "import * as fs from 'fs';\n\nfunction solve() {\n    const s = fs.readFileSync(0, 'utf8').trim();\n    if (!s) return;\n\n    // Write your logic here\n}\n\nsolve();",
      c: "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[100005];\n    if(scanf(\"%s\", s) != 1) return 0;\n\n    // Write your logic here\n    // Reverse the string and print it\n\n    return 0;\n}",
      csharp: "using System;\nusing System.Linq;\n\nclass Solution {\n    static void Main() {\n        string s = Console.ReadLine();\n        if (string.IsNullOrEmpty(s)) return;\n        \n        // Write your logic here\n    }\n}",
      go: "package main\n\nimport (\n    \"fmt\"\n)\n\nfunc main() {\n    var s string\n    if _, err := fmt.Scan(&s); err != nil {\n        return\n    }\n    \n    // Write your logic here\n}",
      rust: "use std::io::{self, Read};\n\nfn main() {\n    let mut buffer = String::new();\n    io::stdin().read_to_string(&mut buffer).unwrap();\n    let s = buffer.trim();\n    \n    if !s.is_empty() {\n        // Write your logic here\n    }\n}",
      kotlin: "import java.util.Scanner\n\nfun main(args: Array<String>) {\n    val sc = Scanner(System.`in`)\n    if (!sc.hasNext()) return\n    val s = sc.next()\n    \n    // Write your logic here\n}",
      php: "<?php\n\n$s = trim(file_get_contents('php://stdin'));\nif (empty($s)) exit;\n\n// Write your logic here (Reverse string and print)\n\n?>",
      swift: "import Foundation\n\nif let s = readLine() {\n    // Write your logic here\n}",
      ruby: "s = gets.to_s.strip\nif !s.empty?\n  # Write your logic here\nend"
    },
    hiddenTestCases: [
      { input: "hannah", output: "hannah" },
      { input: "Nexvoro", output: "orovxeN" },
      { input: "a", output: "a" },
      { input: "racecar", output: "racecar" },
      { input: "coding", output: "gnidoc" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "javascript", "typescript", "cpp", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "easy-03",
    title: "Palindrome Check",
    description: "Given a string s, return true if it is a palindrome, or false otherwise.",
    difficulty: "Easy",
    category: "Strings",
    topic: "TWO_POINTERS",
    estimatedTime: "5 mins",
    company: "Microsoft",
    tags: ["Strings", "Two Pointers"],
    inputFormat: "A single string s.",
    outputFormat: "'true' or 'false'.",
    constraints: ["1 <= s.length <= 2 * 10^5"],
    sampleInput: "racecar",
    sampleOutput: "true",
    explanation: "'racecar' read backwards is still 'racecar'.",
    starterCode: {
      python: "import sys\n\ndef solution():\n    s = sys.stdin.read().strip()\n    if not s: return\n    \n    # Write your logic here\n\nif __name__ == \"__main__\":\n    solution()",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(!sc.hasNext()) return;\n        String s = sc.next();\n\n        // Write your logic here\n    }\n}",
      cpp: "#include <iostream>\n#include <string>\n\nusing namespace std;\n\nint main() {\n    string s;\n    if(!(cin >> s)) return 0;\n\n    // Write your logic here\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction solve() {\n    const s = fs.readFileSync(0, 'utf8').trim();\n    if (!s) return;\n\n    // Write your logic here\n}\n\nsolve();",
      typescript: "import * as fs from 'fs';\n\nfunction solve() {\n    const s = fs.readFileSync(0, 'utf8').trim();\n    if (!s) return;\n\n    // Write your logic here\n}\n\nsolve();",
      c: "#include <stdio.h>\n#include <string.h>\n#include <stdbool.h>\n\nint main() {\n    char s[200005];\n    if(scanf(\"%s\", s) != 1) return 0;\n\n    // Write your logic here\n\n    return 0;\n}",
      csharp: "using System;\n\nclass Solution {\n    static void Main() {\n        string s = Console.ReadLine();\n        if (string.IsNullOrEmpty(s)) return;\n        \n        // Write your logic here\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    var s string\n    if _, err := fmt.Scan(&s); err != nil {\n        return\n    }\n    // Write your logic here\n}",
      rust: "use std::io::{self, Read};\n\nfn main() {\n    let mut buffer = String::new();\n    io::stdin().read_to_string(&mut buffer).unwrap();\n    let s = buffer.trim();\n    if !s.is_empty() {\n        // Write your logic here\n    }\n}",
      kotlin: "import java.util.Scanner\n\nfun main(args: Array<String>) {\n    val sc = Scanner(System.`in`)\n    if (!sc.hasNext()) return\n    val s = sc.next()\n    \n    // Write your logic here\n}",
      php: "<?php\n\n$s = trim(file_get_contents('php://stdin'));\nif (empty($s)) exit;\n\n// Write your logic here (Print 'true' or 'false')\n\n?>",
      swift: "import Foundation\n\nif let s = readLine() {\n    // Write your logic here\n}",
      ruby: "s = gets.to_s.strip\nif !s.empty?\n  # Write your logic here\nend"
    },
    hiddenTestCases: [
      { input: "apple", output: "false" },
      { input: "aba", output: "true" },
      { input: "abccba", output: "true" },
      { input: "abcdef", output: "false" },
      { input: "z", output: "true" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "javascript", "typescript", "cpp", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "easy-04",
    title: "FizzBuzz",
    description: "Given an integer n, return a string array answer (1-indexed) where: answer[i] == 'FizzBuzz' if i is divisible by 3 and 5, answer[i] == 'Fizz' if i is divisible by 3, answer[i] == 'Buzz' if i is divisible by 5, and answer[i] == i if none of the above conditions are true.",
    difficulty: "Easy",
    category: "Math",
    topic: "SIMULATION",
    estimatedTime: "5 mins",
    company: "IBM",
    tags: ["Math", "Simulation"],
    inputFormat: "A single integer n.",
    outputFormat: "n space-separated strings.",
    constraints: ["1 <= n <= 10^4"],
    sampleInput: "5",
    sampleOutput: "1 2 Fizz 4 Buzz",
    explanation: "Numbers from 1 to 5 follow the specified rules.",
    starterCode: {
      python: "import sys\n\ndef solution():\n    line = sys.stdin.read().strip()\n    if not line: return\n    n = int(line)\n    \n    # Write your logic here\n\nif __name__ == \"__main__\":\n    solution()",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n\n        // Write your logic here\n    }\n}",
      cpp: "#include <iostream>\n#include <string>\n#include <vector>\n\nusing namespace std;\n\nint main() {\n    int n;\n    if(!(cin >> n)) return 0;\n\n    // Write your logic here\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf8').trim();\n    if (!input) return;\n    const n = parseInt(input);\n\n    // Write your logic here\n}\n\nsolve();",
      typescript: "import * as fs from 'fs';\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf8').trim();\n    if (!input) return;\n    const n = parseInt(input);\n\n    // Write your logic here\n}\n\nsolve();",
      c: "#include <stdio.h>\n\nint main() {\n    int n;\n    if(scanf(\"%d\", &n) != 1) return 0;\n\n    // Write your logic here\n\n    return 0;\n}",
      csharp: "using System;\n\nclass Solution {\n    static void Main() {\n        string input = Console.ReadLine();\n        if (string.IsNullOrEmpty(input)) return;\n        int n = int.Parse(input);\n        \n        // Write your logic here\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    var n int\n    if _, err := fmt.Scan(&n); err != nil {\n        return\n    }\n    // Write your logic here\n}",
      rust: "use std::io::{self, Read};\n\nfn main() {\n    let mut buffer = String::new();\n    io::stdin().read_to_string(&mut buffer).unwrap();\n    if let Ok(n) = buffer.trim().parse::<i32>() {\n        // Write your logic here\n    }\n}",
      kotlin: "import java.util.Scanner\n\nfun main(args: Array<String>) {\n    val sc = Scanner(System.`in`)\n    if (!sc.hasNextInt()) return\n    val n = sc.nextInt()\n    \n    // Write your logic here\n}",
      php: "<?php\n\n$n = (int)trim(file_get_contents('php://stdin'));\nif ($n <= 0) exit;\n\n// Write your logic here (Print space-separated FizzBuzz values)\n\n?>",
      swift: "import Foundation\n\nif let line = readLine(), let n = Int(line) {\n    // Write your logic here\n}",
      ruby: "n = gets.to_i\nif n > 0\n  # Write your logic here\nend"
    },
    hiddenTestCases: [
      { input: "3", output: "1 2 Fizz" },
      { input: "15", output: "1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz" },
      { input: "1", output: "1" },
      { input: "10", output: "1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz" },
      { input: "20", output: "1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz 16 17 Fizz 19 Buzz" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "javascript", "typescript", "cpp", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "easy-05",
    title: "Valid Anagram",
    description: "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
    difficulty: "Easy",
    category: "Strings",
    topic: "HASH_TABLE",
    estimatedTime: "10 mins",
    company: "Facebook",
    tags: ["Strings", "Hash Table", "Sorting"],
    inputFormat: "Two strings s and t on separate lines.",
    outputFormat: "'true' or 'false'.",
    constraints: ["1 <= s.length, t.length <= 5 * 10^4", "s and t consist of lowercase English letters."],
    sampleInput: "anagram\nnagaram",
    sampleOutput: "true",
    explanation: "Both strings have the same characters with the same frequencies.",
    starterCode: {
      python: "import sys\n\ndef solution():\n    lines = sys.stdin.read().split()\n    if len(lines) < 2: return\n    s, t = lines[0], lines[1]\n    \n    # Write your logic here\n\nif __name__ == \"__main__\":\n    solution()",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(!sc.hasNext()) return;\n        String s = sc.next();\n        if(!sc.hasNext()) return;\n        String t = sc.next();\n\n        // Write your logic here\n    }\n}",
      cpp: "#include <iostream>\n#include <string>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nint main() {\n    string s, t;\n    if(!(cin >> s >> t)) return 0;\n\n    // Write your logic here\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf8').split(/\\s+/);\n    if (input.length < 2) return;\n    const s = input[0];\n    const t = input[1];\n\n    // Write your logic here\n}\n\nsolve();",
      typescript: "import * as fs from 'fs';\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf8').split(/\\s+/);\n    if (input.length < 2) return;\n    const s = input[0];\n    const t = input[1];\n\n    // Write your logic here\n}\n\nsolve();",
      c: "#include <stdio.h>\n#include <string.h>\n#include <stdbool.h>\n\nint main() {\n    char s[50005], t[50005];\n    if(scanf(\"%s %s\", s, t) != 2) return 0;\n\n    // Write your logic here\n\n    return 0;\n}",
      csharp: "using System;\n\nclass Solution {\n    static void Main() {\n        string s = Console.ReadLine();\n        string t = Console.ReadLine();\n        if (string.IsNullOrEmpty(s) || string.IsNullOrEmpty(t)) return;\n        \n        // Write your logic here\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    var s, t string\n    if _, err := fmt.Scan(&s, &t); err != nil {\n        return\n    }\n    // Write your logic here\n}",
      rust: "use std::io::{self, Read};\n\nfn main() {\n    let mut buffer = String::new();\n    io::stdin().read_to_string(&mut buffer).unwrap();\n    let mut words = buffer.split_whitespace();\n    \n    if let (Some(s), Some(t)) = (words.next(), words.next()) {\n        // Write your logic here\n    }\n}",
      kotlin: "import java.util.Scanner\n\nfun main(args: Array<String>) {\n    val sc = Scanner(System.`in`)\n    if (!sc.hasNext()) return\n    val s = sc.next()\n    if (!sc.hasNext()) return\n    val t = sc.next()\n    \n    // Write your logic here\n}",
      php: "<?php\n\n$input = preg_split('/\\s+/', trim(file_get_contents('php://stdin')));\nif (count($input) < 2) exit;\n\n$s = $input[0];\n$t = $input[1];\n\n// Write your logic here (Print 'true' or 'false')\n\n?>",
      swift: "import Foundation\n\nif let line1 = readLine(), let line2 = readLine() {\n    // Write your logic here\n}",
      ruby: "s = gets.to_s.strip\nt = gets.to_s.strip\nif !s.empty? && !t.empty?\n  # Write your logic here\nend"
    },
    hiddenTestCases: [
      { input: "rat\ncar", output: "false" },
      { input: "a\na", output: "true" },
      { input: "ab\nba", output: "true" },
      { input: "listen\nsilent", output: "true" },
      { input: "hello\nworld", output: "false" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "javascript", "typescript", "cpp", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "easy-06",
    title: "Fibonacci Number",
    description: "The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1. That is: F(0) = 0, F(1) = 1, F(n) = F(n - 1) + F(n - 2), for n > 1. Given n, calculate F(n).",
    difficulty: "Easy",
    category: "Math",
    topic: "DYNAMIC_PROGRAMMING",
    estimatedTime: "10 mins",
    company: "Goldman Sachs",
    tags: ["Math", "Dynamic Programming", "Recursion"],
    inputFormat: "A single integer n.",
    outputFormat: "The value of F(n).",
    constraints: ["0 <= n <= 30"],
    sampleInput: "4",
    sampleOutput: "3",
    explanation: "F(4) = F(3) + F(2) = 2 + 1 = 3.",
    starterCode: {
      python: "import sys\n\ndef solution():\n    line = sys.stdin.read().strip()\n    if not line: return\n    n = int(line)\n    \n    # Write your logic here\n\nif __name__ == \"__main__\":\n    solution()",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n\n        // Write your logic here\n    }\n}",
      cpp: "#include <iostream>\n\nusing namespace std;\n\nint main() {\n    int n;\n    if(!(cin >> n)) return 0;\n\n    // Write your logic here\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf8').trim();\n    if (!input) return;\n    const n = parseInt(input);\n\n    // Write your logic here\n}\n\nsolve();",
      typescript: "import * as fs from 'fs';\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf8').trim();\n    if (!input) return;\n    const n = parseInt(input);\n\n    // Write your logic here\n}\n\nsolve();",
      c: "#include <stdio.h>\n\nint main() {\n    int n;\n    if(scanf(\"%d\", &n) != 1) return 0;\n\n    // Write your logic here\n\n    return 0;\n}",
      csharp: "using System;\n\nclass Solution {\n    static void Main() {\n        string input = Console.ReadLine();\n        if (string.IsNullOrEmpty(input)) return;\n        int n = int.Parse(input);\n        \n        // Write your logic here\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    var n int\n    if _, err := fmt.Scan(&n); err != nil {\n        return\n    }\n    // Write your logic here\n}",
      rust: "use std::io::{self, Read};\n\nfn main() {\n    let mut buffer = String::new();\n    io::stdin().read_to_string(&mut buffer).unwrap();\n    if let Ok(n) = buffer.trim().parse::<i32>() {\n        // Write your logic here\n    }\n}",
      kotlin: "import java.util.Scanner\n\nfun main(args: Array<String>) {\n    val sc = Scanner(System.`in`)\n    if (!sc.hasNextInt()) return\n    val n = sc.nextInt()\n    \n    // Write your logic here\n}",
      php: "<?php\n\n$line = trim(file_get_contents('php://stdin'));\nif ($line === '') exit;\n$n = (int)$line;\n\n// Write your logic here (Print F(n))\n\n?>",
      swift: "import Foundation\n\nif let line = readLine(), let n = Int(line) {\n    // Write your logic here\n}",
      ruby: "n = gets.to_i\n# Write your logic here"
    },
    hiddenTestCases: [
      { input: "0", output: "0" },
      { input: "1", output: "1" },
      { input: "2", output: "1" },
      { input: "10", output: "55" },
      { input: "30", output: "832040" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "javascript", "typescript", "cpp", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "easy-07",
    title: "Climbing Stairs",
    description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    difficulty: "Easy",
    category: "Math",
    topic: "DYNAMIC_PROGRAMMING",
    estimatedTime: "10 mins",
    company: "Google",
    tags: ["Math", "Dynamic Programming", "Memoization"],
    inputFormat: "A single integer n.",
    outputFormat: "Number of ways.",
    constraints: ["1 <= n <= 45"],
    sampleInput: "3",
    sampleOutput: "3",
    explanation: "Ways to reach step 3: (1+1+1), (1+2), (2+1).",
    starterCode: {
      python: "import sys\n\ndef solution():\n    line = sys.stdin.read().strip()\n    if not line: return\n    n = int(line)\n    \n    # Write your logic here\n\nif __name__ == \"__main__\":\n    solution()",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n\n        // Write your logic here\n    }\n}",
      cpp: "#include <iostream>\n\nusing namespace std;\n\nint main() {\n    int n;\n    if(!(cin >> n)) return 0;\n\n    // Write your logic here\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf8').trim();\n    if (!input) return;\n    const n = parseInt(input);\n\n    // Write your logic here\n}\n\nsolve();",
      typescript: "import * as fs from 'fs';\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf8').trim();\n    if (!input) return;\n    const n = parseInt(input);\n\n    // Write your logic here\n}\n\nsolve();",
      c: "#include <stdio.h>\n\nint main() {\n    int n;\n    if(scanf(\"%d\", &n) != 1) return 0;\n\n    // Write your logic here\n\n    return 0;\n}",
      csharp: "using System;\n\nclass Solution {\n    static void Main() {\n        string input = Console.ReadLine();\n        if (string.IsNullOrEmpty(input)) return;\n        int n = int.Parse(input);\n        \n        // Write your logic here\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    var n int\n    if _, err := fmt.Scan(&n); err != nil {\n        return\n    }\n    // Write your logic here\n}",
      rust: "use std::io::{self, Read};\n\nfn main() {\n    let mut buffer = String::new();\n    io::stdin().read_to_string(&mut buffer).unwrap();\n    if let Ok(n) = buffer.trim().parse::<i32>() {\n        // Write your logic here\n    }\n}",
      kotlin: "import java.util.Scanner\n\nfun main(args: Array<String>) {\n    val sc = Scanner(System.`in`)\n    if (!sc.hasNextInt()) return\n    val n = sc.nextInt()\n    \n    // Write your logic here\n}",
      php: "<?php\n\n$line = trim(file_get_contents('php://stdin'));\nif ($line === '') exit;\n$n = (int)$line;\n\n// Write your logic here (Print number of ways)\n\n?>",
      swift: "import Foundation\n\nif let line = readLine(), let n = Int(line) {\n    // Write your logic here\n}",
      ruby: "n = gets.to_i\n# Write your logic here"
    },
    hiddenTestCases: [
      { input: "2", output: "2" },
      { input: "1", output: "1" },
      { input: "5", output: "8" },
      { input: "10", output: "89" },
      { input: "45", output: "1836311903" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "javascript", "typescript", "cpp", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  }
];
