/**
 * @fileOverview Nexvoro AI Master Question Data (v31.0 - Audited Nodes, 13 Languages).
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
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9"],
    sampleInput: "4 9\n2 7 11 15",
    sampleOutput: "0 1",
    explanation: "Because nums[0] + nums[1] == 9, we return 0 1.",
    starterCode: {
      python: "import sys\n\ndef solution():\n    line1 = sys.stdin.readline().split()\n    if not line1: return\n    n, target = map(int, line1)\n    nums = list(map(int, sys.stdin.readline().split()))\n    # Write your logic here\n\nif __name__ == \"__main__\":\n    solution()",
      java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int target = sc.nextInt();\n        int[] nums = new int[n];\n        for(int i=0; i<n; i++) nums[i] = sc.nextInt();\n        // Write your logic here\n    }\n}",
      javascript: "const fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf8').split(/\\s+/);\n    if (input.length < 2) return;\n    const n = parseInt(input[0]);\n    const target = parseInt(input[1]);\n    const nums = input.slice(2, 2 + n).map(Number);\n    // Write your logic here\n}\nsolve();",
      typescript: "import * as fs from 'fs';\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf8').split(/\\s+/);\n    if (input.length < 2) return;\n    const n = parseInt(input[0]);\n    const target = parseInt(input[1]);\n    const nums = input.slice(2, 2 + n).map(Number);\n    // Write your logic here\n}\nsolve();",
      cpp: "#include <iostream>\n#include <vector>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    int n, target;\n    if(!(cin >> n >> target)) return 0;\n    vector<int> nums(n);\n    for(int i=0; i<n; i++) cin >> nums[i];\n    // Write your logic here\n    return 0;\n}",
      c: "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n, target;\n    if(scanf(\"%d %d\", &n, &target) != 2) return 0;\n    int *nums = (int*)malloc(n * sizeof(int));\n    for(int i=0; i<n; i++) scanf(\"%d\", &nums[i]);\n    // Write your logic here\n    free(nums);\n    return 0;\n}",
      csharp: "using System;\nusing System.Collections.Generic;\n\nclass Solution {\n    static void Main(string[] args) {\n        string input = Console.ReadLine();\n        if(string.IsNullOrEmpty(input)) return;\n        string[] line1 = input.Split();\n        int n = int.Parse(line1[0]);\n        int target = int.Parse(line1[1]);\n        string[] line2 = Console.ReadLine().Split();\n        int[] nums = new int[n];\n        for(int i=0; i<n; i++) nums[i] = int.Parse(line2[i]);\n        // Write your logic here\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    var n, target int\n    if _, err := fmt.Scan(&n, &target); err != nil { return }\n    nums := make([]int, n)\n    for i := 0; i < n; i++ { fmt.Scan(&nums[i]) }\n    // Write your logic here\n}",
      rust: "use std::io::{self, BufRead};\n\nfn main() {\n    let stdin = io::stdin();\n    let mut lines = stdin.lock().lines();\n    if let Some(Ok(line)) = lines.next() {\n        let parts: Vec<i32> = line.split_whitespace().map(|s| s.parse().unwrap()).collect();\n        let n = parts[0] as usize;\n        let target = parts[1];\n        if let Some(Ok(line2)) = lines.next() {\n            let nums: Vec<i32> = line2.split_whitespace().map(|s| s.parse().unwrap()).collect();\n            // Write your logic here\n        }\n    }\n}",
      kotlin: "import java.util.Scanner\n\nfun main(args: Array<String>) {\n    val sc = Scanner(System.`in`)\n    if (!sc.hasNextInt()) return\n    val n = sc.nextInt()\n    val target = sc.nextInt()\n    val nums = IntArray(n)\n    for (i in 0 until n) nums[i] = sc.nextInt()\n    // Write your logic here\n}",
      php: "<?php\n$stdin = fopen('php://stdin', 'r');\n$line1 = fgets($stdin);\nif (!$line1) exit;\nlist($n, $target) = explode(' ', trim($line1));\n$line2 = fgets($stdin);\n$nums = explode(' ', trim($line2));\n// Write your logic here\n?>",
      swift: "import Foundation\n\nif let line1 = readLine()?.split(separator: \" \") {\n    let n = Int(line1[0])!\n    let target = Int(line1[1])!\n    if let line2 = readLine()?.split(separator: \" \") {\n        let nums = line2.map { Int($0)! }\n        // Write your logic here\n    }\n}",
      ruby: "line1 = gets.split\nexit if line1.empty?\nn = line1[0].to_i\ntarget = line1[1].to_i\nnums = gets.split.map(&:to_i)\n# Write your logic here"
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
    title: "Palindrome Number",
    description: "Given an integer x, return true if x is a palindrome integer. An integer is a palindrome when it reads the same backward as forward.",
    difficulty: "Easy",
    category: "Math",
    topic: "LOGIC",
    estimatedTime: "5 mins",
    company: "Microsoft",
    tags: ["Math"],
    inputFormat: "A single integer X.",
    outputFormat: "true or false.",
    constraints: ["-2^31 <= x <= 2^31 - 1"],
    sampleInput: "121",
    sampleOutput: "true",
    explanation: "121 reads as 121 from left to right and from right to left.",
    starterCode: {
      python: "import sys\n\ndef solution():\n    x = sys.stdin.read().strip()\n    if not x: return\n    # Write your logic here\n\nif __name__ == \"__main__\":\n    solution()",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNext()) return;\n        String x = sc.next();\n        // Write your logic here\n    }\n}",
      javascript: "const fs = require('fs');\n\nfunction solve() {\n    const x = fs.readFileSync(0, 'utf8').trim();\n    // Write your logic here\n}\nsolve();",
      typescript: "import * as fs from 'fs';\n\nfunction solve() {\n    const x = fs.readFileSync(0, 'utf8').trim();\n    // Write your logic here\n}\nsolve();",
      cpp: "#include <iostream>\n#include <string>\n\nusing namespace std;\n\nint main() {\n    string x;\n    if(!(cin >> x)) return 0;\n    // Write your logic here\n    return 0;\n}",
      c: "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char x[64];\n    if(scanf(\"%s\", x) != 1) return 0;\n    // Write your logic here\n    return 0;\n}",
      csharp: "using System;\n\nclass Solution {\n    static void Main(string[] args) {\n        string x = Console.ReadLine();\n        if(string.IsNullOrEmpty(x)) return;\n        // Write your logic here\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    var x string\n    fmt.Scan(&x)\n    // Write your logic here\n}",
      rust: "use std::io::{self, Read};\n\nfn main() {\n    let mut x = String::new();\n    io::stdin().read_to_string(&mut x).unwrap();\n    let x = x.trim();\n    // Write your logic here\n}",
      kotlin: "import java.util.Scanner\n\nfun main(args: Array<String>) {\n    val sc = Scanner(System.`in`)\n    if(!sc.hasNext()) return\n    val x = sc.next()\n    // Write your logic here\n}",
      php: "<?php\n$x = trim(file_get_contents('php://stdin'));\n// Write your logic here\n?>",
      swift: "import Foundation\n\nif let x = readLine() {\n    // Write your logic here\n}",
      ruby: "x = gets.to_s.strip\n# Write your logic here"
    },
    hiddenTestCases: [
      { input: "-121", output: "false" },
      { input: "10", output: "false" },
      { input: "0", output: "true" },
      { input: "12321", output: "true" },
      { input: "123456", output: "false" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "javascript", "typescript", "cpp", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "easy-03",
    title: "Valid Parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    difficulty: "Easy",
    category: "Strings",
    topic: "STACK",
    estimatedTime: "10 mins",
    company: "Amazon",
    tags: ["Strings", "Stack"],
    inputFormat: "A single string S.",
    outputFormat: "true or false.",
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only."],
    sampleInput: "()[]{}",
    sampleOutput: "true",
    explanation: "Every opening bracket is closed by the same type of brackets in the correct order.",
    starterCode: {
      python: "import sys\n\ndef solution():\n    s = sys.stdin.read().strip()\n    if not s: return\n    # Write your logic here\n\nif __name__ == \"__main__\":\n    solution()",
      java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(!sc.hasNext()) return;\n        String s = sc.next();\n        // Write your logic here\n    }\n}",
      javascript: "const fs = require('fs');\n\nfunction solve() {\n    const s = fs.readFileSync(0, 'utf8').trim();\n    // Write your logic here\n}\nsolve();",
      typescript: "import * as fs from 'fs';\n\nfunction solve() {\n    const s = fs.readFileSync(0, 'utf8').trim();\n    // Write your logic here\n}\nsolve();",
      cpp: "#include <iostream>\n#include <string>\n#include <stack>\n\nusing namespace std;\n\nint main() {\n    string s;\n    if(!(cin >> s)) return 0;\n    // Write your logic here\n    return 0;\n}",
      c: "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[10001];\n    if(scanf(\"%s\", s) != 1) return 0;\n    // Write your logic here\n    return 0;\n}",
      csharp: "using System;\nusing System.Collections.Generic;\n\nclass Solution {\n    static void Main(string[] args) {\n        string s = Console.ReadLine();\n        if(string.IsNullOrEmpty(s)) return;\n        // Write your logic here\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    var s string\n    fmt.Scan(&s)\n    // Write your logic here\n}",
      rust: "use std::io::{self, Read};\n\nfn main() {\n    let mut s = String::new();\n    io::stdin().read_to_string(&mut s).unwrap();\n    let s = s.trim();\n    // Write your logic here\n}",
      kotlin: "import java.util.Scanner\n\nfun main(args: Array<String>) {\n    val sc = Scanner(System.`in`)\n    if(!sc.hasNext()) return\n    val s = sc.next()\n    // Write your logic here\n}",
      php: "<?php\n$s = trim(file_get_contents('php://stdin'));\n// Write your logic here\n?>",
      swift: "import Foundation\n\nif let s = readLine() {\n    // Write your logic here\n}",
      ruby: "s = gets.to_s.strip\n# Write your logic here"
    },
    hiddenTestCases: [
      { input: "(]", output: "false" },
      { input: "([)]", output: "false" },
      { input: "{[]}", output: "true" },
      { input: "((()))", output: "true" },
      { input: "(){}}{", output: "false" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "javascript", "typescript", "cpp", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "easy-04",
    title: "Merge Two Sorted Lists",
    description: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists.",
    difficulty: "Easy",
    category: "Linked Lists",
    topic: "RECURSION",
    estimatedTime: "15 mins",
    company: "Meta",
    tags: ["Linked List", "Recursion"],
    inputFormat: "First line: N1 followed by N1 elements of List1. Second line: N2 followed by N2 elements of List2.",
    outputFormat: "Merged sorted list elements.",
    constraints: ["0 <= node.val <= 100", "0 <= length <= 50"],
    sampleInput: "3 1 2 4\n3 1 3 4",
    sampleOutput: "1 1 2 3 4 4",
    explanation: "Lists [1,2,4] and [1,3,4] are merged into [1,1,2,3,4,4].",
    starterCode: {
      python: "import sys\n\ndef solution():\n    input_data = sys.stdin.read().splitlines()\n    if not input_data: return\n    list1 = list(map(int, input_data[0].split()))[1:]\n    list2 = list(map(int, input_data[1].split()))[1:]\n    # Write your logic here\n\nif __name__ == \"__main__\":\n    solution()",
      java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(!sc.hasNextInt()) return;\n        int n1 = sc.nextInt();\n        List<Integer> l1 = new ArrayList<>();\n        for(int i=0; i<n1; i++) l1.add(sc.nextInt());\n        int n2 = sc.nextInt();\n        List<Integer> l2 = new ArrayList<>();\n        for(int i=0; i<n2; i++) l2.add(sc.nextInt());\n        // Write your logic here\n    }\n}",
      javascript: "const fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf8').split('\\n');\n    const l1 = input[0].trim().split(/\\s+/).slice(1).map(Number);\n    const l2 = input[1].trim().split(/\\s+/).slice(1).map(Number);\n    // Write your logic here\n}\nsolve();",
      typescript: "import * as fs from 'fs';\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf8').split('\\n');\n    if (input.length < 2) return;\n    const l1 = input[0].trim().split(/\\s+/).slice(1).map(Number);\n    const l2 = input[1].trim().split(/\\s+/).slice(1).map(Number);\n    // Write your logic here\n}\nsolve();",
      cpp: "#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nint main() {\n    int n1, n2;\n    if(!(cin >> n1)) return 0;\n    vector<int> l1(n1);\n    for(int i=0; i<n1; i++) cin >> l1[i];\n    if(!(cin >> n2)) return 0;\n    vector<int> l2(n2);\n    for(int i=0; i<n2; i++) cin >> l2[i];\n    // Write your logic here\n    return 0;\n}",
      c: "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n1, n2;\n    if(scanf(\"%d\", &n1) != 1) return 0;\n    int *l1 = (int*)malloc(n1 * sizeof(int));\n    for(int i=0; i<n1; i++) scanf(\"%d\", &l1[i]);\n    if(scanf(\"%d\", &n2) != 1) return 0;\n    int *l2 = (int*)malloc(n2 * sizeof(int));\n    for(int i=0; i<n2; i++) scanf(\"%d\", &l2[i]);\n    // Write your logic here\n    free(l1); free(l2);\n    return 0;\n}",
      csharp: "using System;\nusing System.Collections.Generic;\n\nclass Solution {\n    static void Main(string[] args) {\n        string line1 = Console.ReadLine();\n        if(string.IsNullOrEmpty(line1)) return;\n        string[] p1 = line1.Split();\n        int n1 = int.Parse(p1[0]);\n        string line2 = Console.ReadLine();\n        string[] p2 = line2.Split();\n        int n2 = int.Parse(p2[0]);\n        // Write your logic here\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    var n1, n2 int\n    if _, err := fmt.Scan(&n1); err != nil { return }\n    l1 := make([]int, n1)\n    for i := 0; i < n1; i++ { fmt.Scan(&l1[i]) }\n    if _, err := fmt.Scan(&n2); err != nil { return }\n    l2 := make([]int, n2)\n    for i := 0; i < n2; i++ { fmt.Scan(&l2[i]) }\n    // Write your logic here\n}",
      rust: "use std::io::{self, BufRead};\n\nfn main() {\n    let stdin = io::stdin();\n    let mut lines = stdin.lock().lines();\n    // Write your logic here\n}",
      kotlin: "import java.util.Scanner\n\nfun main(args: Array<String>) {\n    val sc = Scanner(System.`in`)\n    if(!sc.hasNextInt()) return\n    val n1 = sc.nextInt()\n    val l1 = IntArray(n1)\n    for(i in 0 until n1) l1[i] = sc.nextInt()\n    val n2 = sc.nextInt()\n    val l2 = IntArray(n2)\n    for(i in 0 until n2) l2[i] = sc.nextInt()\n    // Write your logic here\n}",
      php: "<?php\n$stdin = fopen('php://stdin', 'r');\n$l1 = explode(' ', trim(fgets($stdin)));\n$l2 = explode(' ', trim(fgets($stdin)));\n// Write your logic here\n?>",
      swift: "import Foundation\n\nif let line1 = readLine()?.split(separator: \" \") {\n    let l1 = line1.dropFirst().map { Int($0)! }\n    if let line2 = readLine()?.split(separator: \" \") {\n        let l2 = line2.dropFirst().map { Int($0)! }\n        // Write your logic here\n    }\n}",
      ruby: "l1 = gets.split.map(&:to_i)[1..-1]\nl2 = gets.split.map(&:to_i)[1..-1]\n# Write your logic here"
    },
    hiddenTestCases: [
      { input: "1 0\n1 0", output: "0 0" },
      { input: "0\n1 0", output: "0" },
      { input: "2 1 5\n2 2 6", output: "1 2 5 6" },
      { input: "3 10 20 30\n3 15 25 35", output: "10 15 20 25 30 35" },
      { input: "1 1\n1 2", output: "1 2" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "javascript", "typescript", "cpp", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "easy-05",
    title: "Maximum Subarray",
    description: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
    difficulty: "Easy",
    category: "Arrays",
    topic: "DYNAMIC_PROGRAMMING",
    estimatedTime: "10 mins",
    company: "Apple",
    tags: ["Arrays", "Dynamic Programming"],
    inputFormat: "First line: N. Second line: N integers.",
    outputFormat: "Max sum value.",
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    sampleInput: "9\n-2 1 -3 4 -1 2 1 -5 4",
    sampleOutput: "6",
    explanation: "[4,-1,2,1] has the largest sum = 6.",
    starterCode: {
      python: "import sys\n\ndef solution():\n    input_data = sys.stdin.read().split()\n    if not input_data: return\n    n = int(input_data[0])\n    nums = list(map(int, input_data[1:]))\n    # Write your logic here\n\nif __name__ == \"__main__\":\n    solution()",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int[] nums = new int[n];\n        for(int i=0; i<n; i++) nums[i] = sc.nextInt();\n        // Write your logic here\n    }\n}",
      javascript: "const fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf8').split(/\\s+/);\n    const n = parseInt(input[0]);\n    const nums = input.slice(1).map(Number);\n    // Write your logic here\n}\nsolve();",
      typescript: "import * as fs from 'fs';\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf8').split(/\\s+/);\n    const n = parseInt(input[0]);\n    const nums = input.slice(1, 1 + n).map(Number);\n    // Write your logic here\n}\nsolve();",
      cpp: "#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nint main() {\n    int n;\n    if(!(cin >> n)) return 0;\n    vector<int> nums(n);\n    for(int i=0; i<n; i++) cin >> nums[i];\n    // Write your logic here\n    return 0;\n}",
      c: "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n;\n    if(scanf(\"%d\", &n) != 1) return 0;\n    int *nums = (int*)malloc(n * sizeof(int));\n    for(int i=0; i<n; i++) scanf(\"%d\", &nums[i]);\n    // Write your logic here\n    free(nums);\n    return 0;\n}",
      csharp: "using System;\n\nclass Solution {\n    static void Main(string[] args) {\n        int n = int.Parse(Console.ReadLine());\n        string[] p = Console.ReadLine().Split();\n        int[] nums = new int[n];\n        for(int i=0; i<n; i++) nums[i] = int.Parse(p[i]);\n        // Write your logic here\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    var n int\n    fmt.Scan(&n)\n    nums := make([]int, n)\n    for i := 0; i < n; i++ { fmt.Scan(&nums[i]) }\n    // Write your logic here\n}",
      rust: "use std::io::{self, Read};\n\nfn main() {\n    let mut input = String::new();\n    io::stdin().read_to_string(&mut input).unwrap();\n    let mut parts = input.split_whitespace();\n    let n: usize = parts.next().unwrap().parse().unwrap();\n    // Write your logic here\n}",
      kotlin: "import java.util.Scanner\n\nfun main(args: Array<String>) {\n    val sc = Scanner(System.`in`)\n    if(!sc.hasNextInt()) return\n    val n = sc.nextInt()\n    val nums = IntArray(n)\n    for(i in 0 until n) nums[i] = sc.nextInt()\n    // Write your logic here\n}",
      php: "<?php\n$input = preg_split('/\\s+/', trim(file_get_contents('php://stdin')));\n$n = $input[0];\n$nums = array_slice($input, 1);\n// Write your logic here\n?>",
      swift: "import Foundation\n\nif let line1 = readLine(), let n = Int(line1) {\n    if let line2 = readLine()?.split(separator: \" \") {\n        let nums = line2.map { Int($0)! }\n        // Write your logic here\n    }\n}",
      ruby: "n = gets.to_i\nnums = gets.split.map(&:to_i)\n# Write your logic here"
    },
    hiddenTestCases: [
      { input: "1\n1", output: "1" },
      { input: "5\n5 4 -1 7 8", output: "23" },
      { input: "2\n-1 -2", output: "-1" },
      { input: "3\n-2 1 -3", output: "1" },
      { input: "4\n1 2 3 4", output: "10" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "javascript", "typescript", "cpp", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "easy-06",
    title: "Reverse String",
    description: "Write a function that reverses a string. The input string is given as a string S. Return the reversed string.",
    difficulty: "Easy",
    category: "Strings",
    topic: "TWO_POINTERS",
    estimatedTime: "5 mins",
    company: "Google",
    tags: ["Strings", "Two Pointers"],
    inputFormat: "A single line containing the string S.",
    outputFormat: "The reversed string S'.",
    constraints: ["1 <= s.length <= 10^5", "s consists of printable ASCII characters."],
    sampleInput: "hello",
    sampleOutput: "olleh",
    explanation: "The reversed form of 'hello' is 'olleh'.",
    starterCode: {
      python: "import sys\n\ndef solution():\n    s = sys.stdin.read().strip()\n    if not s: return\n    # Write your logic here\n\nif __name__ == \"__main__\":\n    solution()",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(!sc.hasNextLine()) return;\n        String s = sc.nextLine();\n        // Write your logic here\n    }\n}",
      javascript: "const fs = require('fs');\n\nfunction solve() {\n    const s = fs.readFileSync(0, 'utf8').trim();\n    // Write your logic here\n}\nsolve();",
      typescript: "import * as fs from 'fs';\n\nfunction solve() {\n    const s = fs.readFileSync(0, 'utf8').trim();\n    // Write your logic here\n}\nsolve();",
      cpp: "#include <iostream>\n#include <string>\n#include <algorithm>\n\nusing namespace std;\n\nint main() {\n    string s;\n    if(!getline(cin, s)) return 0;\n    // Write your logic here\n    return 0;\n}",
      c: "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[100005];\n    if(!fgets(s, sizeof(s), stdin)) return 0;\n    s[strcspn(s, \"\\n\")] = 0;\n    // Write your logic here\n    return 0;\n}",
      csharp: "using System;\n\nclass Solution {\n    static void Main(string[] args) {\n        string s = Console.ReadLine();\n        if(s == null) return;\n        // Write your logic here\n    }\n}",
      go: "package main\n\nimport (\n    \"bufio\"\n    \"fmt\"\n    \"os\"\n)\n\nfunc main() {\n    scanner := bufio.NewScanner(os.Stdin)\n    if scanner.Scan() {\n        s := scanner.Text()\n        _ = s\n        // Write your logic here\n    }\n}",
      rust: "use std::io::{self, Read};\n\nfn main() {\n    let mut s = String::new();\n    io::stdin().read_to_string(&mut s).unwrap();\n    let s = s.trim();\n    // Write your logic here\n}",
      kotlin: "import java.util.Scanner\n\nfun main(args: Array<String>) {\n    val sc = Scanner(System.`in`)\n    if(!sc.hasNextLine()) return\n    val s = sc.nextLine()\n    // Write your logic here\n}",
      php: "<?php\n$s = trim(file_get_contents('php://stdin'));\n// Write your logic here\n?>",
      swift: "import Foundation\n\nif let s = readLine() {\n    // Write your logic here\n}",
      ruby: "s = gets.to_s.strip\n# Write your logic here"
    },
    hiddenTestCases: [
      { input: "Hannah", output: "hannaH" },
      { input: "12345", output: "54321" },
      { input: "A man a plan a canal Panama", output: "amanaP lanac a nalp a nam A" },
      { input: "racecar", output: "racecar" },
      { input: "Nexvoro AI", output: "IA orovxeN" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "javascript", "typescript", "cpp", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "easy-07",
    title: "Fizz Buzz",
    description: "Given an integer n, return a string array answer (1-indexed) where:\n- answer[i] == 'FizzBuzz' if i is divisible by 3 and 5.\n- answer[i] == 'Fizz' if i is divisible by 3.\n- answer[i] == 'Buzz' if i is divisible by 5.\n- answer[i] == i (as a string) if none of the above conditions are true.",
    difficulty: "Easy",
    category: "Logic",
    topic: "LOGIC",
    estimatedTime: "5 mins",
    company: "Microsoft",
    tags: ["Logic", "Math"],
    inputFormat: "A single integer N.",
    outputFormat: "N lines, each containing the value for index i.",
    constraints: ["1 <= n <= 10^4"],
    sampleInput: "3",
    sampleOutput: "1\n2\nFizz",
    explanation: "For n=3, 1 is not div by 3/5, 2 is not div by 3/5, 3 is div by 3.",
    starterCode: {
      python: "import sys\n\ndef solution():\n    line = sys.stdin.read().strip()\n    if not line: return\n    n = int(line)\n    # Write your logic here\n\nif __name__ == \"__main__\":\n    solution()",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        // Write your logic here\n    }\n}",
      javascript: "const fs = require('fs');\n\nfunction solve() {\n    const n = parseInt(fs.readFileSync(0, 'utf8').trim());\n    // Write your logic here\n}\nsolve();",
      typescript: "import * as fs from 'fs';\n\nfunction solve() {\n    const n = parseInt(fs.readFileSync(0, 'utf8').trim());\n    // Write your logic here\n}\nsolve();",
      cpp: "#include <iostream>\n\nusing namespace std;\n\nint main() {\n    int n;\n    if(!(cin >> n)) return 0;\n    // Write your logic here\n    return 0;\n}",
      c: "#include <stdio.h>\n\nint main() {\n    int n;\n    if(scanf(\"%d\", &n) != 1) return 0;\n    // Write your logic here\n    return 0;\n}",
      csharp: "using System;\n\nclass Solution {\n    static void Main(string[] args) {\n        string input = Console.ReadLine();\n        if(string.IsNullOrEmpty(input)) return;\n        int n = int.Parse(input);\n        // Write your logic here\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    var n int\n    fmt.Scan(&n)\n    // Write your logic here\n}",
      rust: "use std::io::{self, Read};\n\nfn main() {\n    let mut input = String::new();\n    io::stdin().read_to_string(&mut input).unwrap();\n    if let Ok(n) = input.trim().parse::<i32>() {\n        // Write your logic here\n    }\n}",
      kotlin: "import java.util.Scanner\n\nfun main(args: Array<String>) {\n    val sc = Scanner(System.`in`)\n    if(!sc.hasNextInt()) return\n    val n = sc.nextInt()\n    // Write your logic here\n}",
      php: "<?php\n$n = (int)trim(file_get_contents('php://stdin'));\n// Write your logic here\n?>",
      swift: "import Foundation\n\nif let line = readLine(), let n = Int(line) {\n    // Write your logic here\n}",
      ruby: "n = gets.to_i\n# Write your logic here"
    },
    hiddenTestCases: [
      { input: "5", output: "1\n2\nFizz\n4\nBuzz" },
      { input: "15", output: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz" },
      { input: "1", output: "1" },
      { input: "0", output: "" },
      { input: "10", output: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "javascript", "typescript", "cpp", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "easy-08",
    title: "Binary Search",
    description: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.",
    difficulty: "Easy",
    category: "Search",
    topic: "BINARY_SEARCH",
    estimatedTime: "10 mins",
    company: "Meta",
    tags: ["Arrays", "Binary Search"],
    inputFormat: "First line: N and Target. Second line: N integers.",
    outputFormat: "Index of target or -1.",
    constraints: ["1 <= nums.length <= 10^4", "-10^4 < nums[i], target < 10^4", "All integers in nums are unique.", "nums is sorted in ascending order."],
    sampleInput: "6 9\n-1 0 3 5 9 12",
    sampleOutput: "4",
    explanation: "9 exists in nums and its index is 4.",
    starterCode: {
      python: "import sys\n\ndef solution():\n    input_data = sys.stdin.read().split()\n    if not input_data: return\n    n = int(input_data[0])\n    target = int(input_data[1])\n    nums = list(map(int, input_data[2:]))\n    # Write your logic here\n\nif __name__ == \"__main__\":\n    solution()",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int target = sc.nextInt();\n        int[] nums = new int[n];\n        for(int i=0; i<n; i++) nums[i] = sc.nextInt();\n        // Write your logic here\n    }\n}",
      javascript: "const fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf8').split(/\\s+/);\n    if (input.length < 2) return;\n    const n = parseInt(input[0]);\n    const target = parseInt(input[1]);\n    const nums = input.slice(2, 2 + n).map(Number);\n    // Write your logic here\n}\nsolve();",
      typescript: "import * as fs from 'fs';\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf8').split(/\\s+/);\n    if (input.length < 2) return;\n    const n = parseInt(input[0]);\n    const target = parseInt(input[1]);\n    const nums = input.slice(2, 2 + n).map(Number);\n    // Write your logic here\n}\nsolve();",
      cpp: "#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nint main() {\n    int n, target;\n    if(!(cin >> n >> target)) return 0;\n    vector<int> nums(n);\n    for(int i=0; i<n; i++) cin >> nums[i];\n    // Write your logic here\n    return 0;\n}",
      c: "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n, target;\n    if(scanf(\"%d %d\", &n, &target) != 2) return 0;\n    int *nums = (int*)malloc(n * sizeof(int));\n    for(int i=0; i<n; i++) scanf(\"%d\", &nums[i]);\n    // Write your logic here\n    free(nums);\n    return 0;\n}",
      csharp: "using System;\n\nclass Solution {\n    static void Main(string[] args) {\n        string input = Console.ReadLine();\n        if(string.IsNullOrEmpty(input)) return;\n        string[] line1 = input.Split();\n        int n = int.Parse(line1[0]);\n        int target = int.Parse(line1[1]);\n        string[] line2 = Console.ReadLine().Split();\n        int[] nums = new int[n];\n        for(int i=0; i<n; i++) nums[i] = int.Parse(line2[i]);\n        // Write your logic here\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    var n, target int\n    fmt.Scan(&n, &target)\n    nums := make([]int, n)\n    for i := 0; i < n; i++ { fmt.Scan(&nums[i]) }\n    // Write your logic here\n}",
      rust: "use std::io::{self, Read};\n\nfn main() {\n    let mut input = String::new();\n    io::stdin().read_to_string(&mut input).unwrap();\n    let mut parts = input.split_whitespace();\n    if let (Some(ns), Some(ts)) = (parts.next(), parts.next()) {\n        let n: usize = ns.parse().unwrap();\n        let target: i32 = ts.parse().unwrap();\n        let nums: Vec<i32> = parts.map(|s| s.parse().unwrap()).collect();\n        // Write your logic here\n    }\n}",
      kotlin: "import java.util.Scanner\n\nfun main(args: Array<String>) {\n    val sc = Scanner(System.`in`)\n    if(!sc.hasNextInt()) return\n    val n = sc.nextInt()\n    val target = sc.nextInt()\n    val nums = IntArray(n)\n    for(i in 0 until n) nums[i] = sc.nextInt()\n    // Write your logic here\n}",
      php: "<?php\n$input = preg_split('/\\s+/', trim(file_get_contents('php://stdin')));\n$n = $input[0];\n$target = $input[1];\n$nums = array_slice($input, 2);\n// Write your logic here\n?>",
      swift: "import Foundation\n\nif let line1 = readLine()?.split(separator: \" \") {\n    let n = Int(line1[0])!\n    let target = Int(line1[1])!\n    if let line2 = readLine()?.split(separator: \" \") {\n        let nums = line2.map { Int($0)! }\n        // Write your logic here\n    }\n}",
      ruby: "line1 = gets.split\nexit if line1.empty?\nn = line1[0].to_i\ntarget = line1[1].to_i\nnums = gets.split.map(&:to_i)\n# Write your logic here"
    },
    hiddenTestCases: [
      { input: "6 2\n-1 0 3 5 9 12", output: "-1" },
      { input: "1 5\n5", output: "0" },
      { input: "1 2\n5", output: "-1" },
      { input: "5 0\n-5 -2 0 3 7", output: "2" },
      { input: "2 10\n10 20", output: "0" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "javascript", "typescript", "cpp", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "easy-09",
    title: "Single Number",
    description: "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.",
    difficulty: "Easy",
    category: "Bit Manipulation",
    topic: "XOR",
    estimatedTime: "5 mins",
    company: "Amazon",
    tags: ["Arrays", "Bit Manipulation"],
    inputFormat: "First line: N. Second line: N integers.",
    outputFormat: "The unique integer.",
    constraints: ["1 <= nums.length <= 3 * 10^4", "-3 * 10^4 <= nums[i] <= 3 * 10^4", "Each element in the array appears twice except for one element which appears only once."],
    sampleInput: "3\n2 2 1",
    sampleOutput: "1",
    explanation: "2 appears twice, 1 appears once.",
    starterCode: {
      python: "import sys\n\ndef solution():\n    input_data = sys.stdin.read().split()\n    if not input_data: return\n    n = int(input_data[0])\n    nums = list(map(int, input_data[1:]))\n    # Write your logic here\n\nif __name__ == \"__main__\":\n    solution()",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int[] nums = new int[n];\n        for(int i=0; i<n; i++) nums[i] = sc.nextInt();\n        // Write your logic here\n    }\n}",
      javascript: "const fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf8').split(/\\s+/);\n    const n = parseInt(input[0]);\n    const nums = input.slice(1).map(Number);\n    // Write your logic here\n}\nsolve();",
      typescript: "import * as fs from 'fs';\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf8').split(/\\s+/);\n    const n = parseInt(input[0]);\n    const nums = input.slice(1, 1 + n).map(Number);\n    // Write your logic here\n}\nsolve();",
      cpp: "#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nint main() {\n    int n;\n    if(!(cin >> n)) return 0;\n    vector<int> nums(n);\n    for(int i=0; i<n; i++) cin >> nums[i];\n    // Write your logic here\n    return 0;\n}",
      c: "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n;\n    if(scanf(\"%d\", &n) != 1) return 0;\n    int *nums = (int*)malloc(n * sizeof(int));\n    for(int i=0; i<n; i++) scanf(\"%d\", &nums[i]);\n    // Write your logic here\n    free(nums);\n    return 0;\n}",
      csharp: "using System;\n\nclass Solution {\n    static void Main(string[] args) {\n        int n = int.Parse(Console.ReadLine());\n        string[] p = Console.ReadLine().Split();\n        int[] nums = new int[n];\n        for(int i=0; i<n; i++) nums[i] = int.Parse(p[i]);\n        // Write your logic here\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    var n int\n    fmt.Scan(&n)\n    nums := make([]int, n)\n    for i := 0; i < n; i++ { fmt.Scan(&nums[i]) }\n    // Write your logic here\n}",
      rust: "use std::io::{self, Read};\n\nfn main() {\n    let mut input = String::new();\n    io::stdin().read_to_string(&mut input).unwrap();\n    let mut parts = input.split_whitespace();\n    if let Some(ns) = parts.next() {\n        let n: usize = ns.parse().unwrap();\n        let nums: Vec<i32> = parts.map(|s| s.parse().unwrap()).collect();\n        // Write your logic here\n    }\n}",
      kotlin: "import java.util.Scanner\n\nfun main(args: Array<String>) {\n    val sc = Scanner(System.`in`)\n    if(!sc.hasNextInt()) return\n    val n = sc.nextInt()\n    val nums = IntArray(n)\n    for(i in 0 until n) nums[i] = sc.nextInt()\n    // Write your logic here\n}",
      php: "<?php\n$input = preg_split('/\\s+/', trim(file_get_contents('php://stdin')));\n$n = $input[0];\n$nums = array_slice($input, 1);\n// Write your logic here\n?>",
      swift: "import Foundation\n\nif let line1 = readLine(), let n = Int(line1) {\n    if let line2 = readLine()?.split(separator: \" \") {\n        let nums = line2.map { Int($0)! }\n        // Write your logic here\n    }\n}",
      ruby: "n = gets.to_i\nnums = gets.split.map(&:to_i)\n# Write your logic here"
    },
    hiddenTestCases: [
      { input: "5\n4 1 2 1 2", output: "4" },
      { input: "1\n1", output: "1" },
      { input: "3\n0 0 7", output: "7" },
      { input: "7\n1 1 2 2 3 3 4", output: "4" },
      { input: "5\n-1 -1 -2 5 -2", output: "5" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "javascript", "typescript", "cpp", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "easy-10",
    title: "Contains Duplicate",
    description: "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
    difficulty: "Easy",
    category: "Arrays",
    topic: "HASHING",
    estimatedTime: "5 mins",
    company: "Adobe",
    tags: ["Arrays", "Hash Table"],
    inputFormat: "First line: N. Second line: N integers.",
    outputFormat: "true or false.",
    constraints: ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
    sampleInput: "4\n1 2 3 1",
    sampleOutput: "true",
    explanation: "1 appears twice.",
    starterCode: {
      python: "import sys\n\ndef solution():\n    input_data = sys.stdin.read().split()\n    if not input_data: return\n    n = int(input_data[0])\n    nums = list(map(int, input_data[1:]))\n    # Write your logic here\n\nif __name__ == \"__main__\":\n    solution()",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int[] nums = new int[n];\n        for(int i=0; i<n; i++) nums[i] = sc.nextInt();\n        // Write your logic here\n    }\n}",
      javascript: "const fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf8').split(/\\s+/);\n    const n = parseInt(input[0]);\n    const nums = input.slice(1).map(Number);\n    // Write your logic here\n}\nsolve();",
      typescript: "import * as fs from 'fs';\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf8').split(/\\s+/);\n    const n = parseInt(input[0]);\n    const nums = input.slice(1, 1 + n).map(Number);\n    // Write your logic here\n}\nsolve();",
      cpp: "#include <iostream>\n#include <vector>\n#include <unordered_set>\n\nusing namespace std;\n\nint main() {\n    int n;\n    if(!(cin >> n)) return 0;\n    vector<int> nums(n);\n    for(int i=0; i<n; i++) cin >> nums[i];\n    // Write your logic here\n    return 0;\n}",
      c: "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n;\n    if(scanf(\"%d\", &n) != 1) return 0;\n    int *nums = (int*)malloc(n * sizeof(int));\n    for(int i=0; i<n; i++) scanf(\"%d\", &nums[i]);\n    // Write your logic here\n    free(nums);\n    return 0;\n}",
      csharp: "using System;\nusing System.Collections.Generic;\n\nclass Solution {\n    static void Main(string[] args) {\n        int n = int.Parse(Console.ReadLine());\n        string[] p = Console.ReadLine().Split();\n        int[] nums = new int[n];\n        for(int i=0; i<n; i++) nums[i] = int.Parse(p[i]);\n        // Write your logic here\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    var n int\n    fmt.Scan(&n)\n    nums := make([]int, n)\n    for i := 0; i < n; i++ { fmt.Scan(&nums[i]) }\n    // Write your logic here\n}",
      rust: "use std::io::{self, Read};\n\nfn main() {\n    let mut input = String::new();\n    io::stdin().read_to_string(&mut input).unwrap();\n    let mut parts = input.split_whitespace();\n    if let Some(ns) = parts.next() {\n        let n: usize = ns.parse().unwrap();\n        let nums: Vec<i64> = parts.map(|s| s.parse().unwrap()).collect();\n        // Write your logic here\n    }\n}",
      kotlin: "import java.util.Scanner\n\nfun main(args: Array<String>) {\n    val sc = Scanner(System.`in`)\n    if(!sc.hasNextInt()) return\n    val n = sc.nextInt()\n    val nums = IntArray(n)\n    for(i in 0 until n) nums[i] = sc.nextInt()\n    // Write your logic here\n}",
      php: "<?php\n$input = preg_split('/\\s+/', trim(file_get_contents('php://stdin')));\n$n = $input[0];\n$nums = array_slice($input, 1);\n// Write your logic here\n?>",
      swift: "import Foundation\n\nif let line1 = readLine(), let n = Int(line1) {\n    if let line2 = readLine()?.split(separator: \" \") {\n        let nums = line2.map { Int($0)! }\n        // Write your logic here\n    }\n}",
      ruby: "n = gets.to_i\nnums = gets.split.map(&:to_i)\n# Write your logic here"
    },
    hiddenTestCases: [
      { input: "4\n1 2 3 4", output: "false" },
      { input: "10\n1 1 1 3 3 4 3 2 4 2", output: "true" },
      { input: "1\n1", output: "false" },
      { input: "5\n-1 -2 -3 -4 -1", output: "true" },
      { input: "2\n100 200", output: "false" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "javascript", "typescript", "cpp", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  }
];
