/**
 * @fileOverview Nexvoro AI Master Question Data (v6.0 - Production Grade).
 * Calibrated for Tier-1 hiring standards with 8-language support and rigorous hidden test cases.
 * Progression: Q1-2 Easy, Q3-4 Medium, Q5 Hard.
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
      python: "import sys\n\ndef is_mirror_word(s):\n    # TODO: Implement logic\n    return False\n\nif __name__ == '__main__':\n    line = sys.stdin.read().strip()\n    if is_mirror_word(line):\n        print('YES')\n    else:\n        print('NO')",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static boolean isMirrorWord(String s) {\n        // TODO: Implement logic\n        return false;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            System.out.println(isMirrorWord(s) ? \"YES\" : \"NO\");\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <string>\nusing namespace std;\n\nbool isMirrorWord(string s) {\n    // TODO: Implement logic\n    return false;\n}\n\nint main() {\n    string s;\n    if (cin >> s) {\n        cout << (isMirrorWord(s) ? \"YES\" : \"NO\") << endl;\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction isMirrorWord(s) {\n    // TODO: Implement logic\n    return false;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nif (input) {\n    console.log(isMirrorWord(input) ? 'YES' : 'NO');\n}",
      c: "#include <stdio.h>\n#include <string.h>\n#include <stdbool.h>\n\nbool isMirrorWord(char* s) {\n    // TODO: Implement logic\n    return false;\n}\n\nint main() {\n    char s[10001];\n    if (scanf(\"%s\", s) != EOF) {\n        printf(\"%s\\n\", isMirrorWord(s) ? \"YES\" : \"NO\");\n    }\n    return 0;\n}",
      csharp: "using System;\n\nclass Program {\n    static bool IsMirrorWord(string s) {\n        // TODO: Implement logic\n        return false;\n    }\n\n    static void Main() {\n        string s = Console.ReadLine();\n        if (s != null) {\n            Console.WriteLine(IsMirrorWord(s.Trim()) ? \"YES\" : \"NO\");\n        }\n    }\n}",
      go: "package main\nimport \"fmt\"\n\nfunc isMirrorWord(s string) bool {\n    // TODO: Implement logic\n    return false\n}\n\nfunc main() {\n    var s string\n    fmt.Scanln(&s)\n    if isMirrorWord(s) {\n        fmt.Println(\"YES\")\n    } else {\n        fmt.Println(\"NO\")\n    }\n}",
      rust: "use std::io;\n\nfn is_mirror_word(s: &str) -> bool {\n    // TODO: Implement logic\n    false\n}\n\nfn main() {\n    let mut input = String::new();\n    io::stdin().read_line(&mut input).unwrap();\n    let s = input.trim();\n    if is_mirror_word(s) {\n        println!(\"YES\");\n    } else {\n        println!(\"NO\");\n    }\n}"
    },
    hiddenTestCases: [
      { input: "madam", output: "YES" },
      { input: "a", output: "YES" },
      { input: "ab", output: "NO" },
      { input: "12321", output: "YES" },
      { input: "12345", output: "NO" },
      { input: "rotor", output: "YES" },
      { input: "steponnoppets", output: "YES" },
      { input: "hello", output: "NO" },
      { input: "9876789", output: "YES" },
      { input: "abcba", output: "YES" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-easy-02",
    title: "Tournament Runner-Up Finder",
    description: "You are designing a leaderboard for a gaming tournament. You need to find the score of the person who came in second place (the Runner-Up). If multiple people have the highest score, the runner-up is the next highest unique score.",
    difficulty: "Easy",
    category: "Arrays",
    topic: "Arrays",
    estimatedTime: "10 min",
    company: "Accenture",
    tags: ["Arrays", "Logic"],
    inputFormat: "First line: Number of players N. Second line: N space-separated scores.",
    outputFormat: "The score of the runner-up. If everyone has the same score or only one player exists, print -1.",
    constraints: ["1 <= N <= 100,000", "0 <= score <= 10^9"],
    sampleInput: "5\n10 20 20 15 5",
    sampleOutput: "15",
    explanation: "How to think: Don't just pick the second number in the list. First, find the absolute highest score. Then, look for the highest number that is strictly smaller than that maximum. That is your Runner-Up!",
    starterCode: {
      python: "import sys\n\ndef get_runner_up(n, scores):\n    # TODO: Implement logic\n    return -1\n\nif __name__ == '__main__':\n    input_data = sys.stdin.read().split()\n    if len(input_data) >= 2:\n        n = int(input_data[0])\n        scores = [int(x) for x in input_data[1:]]\n        print(get_runner_up(n, scores))",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static int getRunnerUp(int n, int[] scores) {\n        // TODO: Implement logic\n        return -1;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] scores = new int[n];\n            for (int i = 0; i < n; i++) scores[i] = sc.nextInt();\n            System.out.println(getRunnerUp(n, scores));\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint getRunnerUp(int n, vector<int>& scores) {\n    // TODO: Implement logic\n    return -1;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> scores(n);\n        for (int i = 0; i < n; i++) cin >> scores[i];\n        cout << getRunnerUp(n, scores) << endl;\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction getRunnerUp(n, scores) {\n    // TODO: Implement logic\n    return -1;\n}\n\nconst input = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (input.length >= 2) {\n    const n = parseInt(input[0]);\n    const scores = input.slice(1, n + 1).map(Number);\n    console.log(getRunnerUp(n, scores));\n}",
      c: "#include <stdio.h>\n\nint getRunnerUp(int n, int* scores) {\n    // TODO: Implement logic\n    return -1;\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != EOF) {\n        int scores[100001];\n        for (int i = 0; i < n; i++) scanf(\"%d\", &scores[i]);\n        printf(\"%d\\n\", getRunnerUp(n, scores));\n    }\n    return 0;\n}",
      csharp: "using System;\n\nclass Program {\n    static int GetRunnerUp(int n, int[] scores) {\n        // TODO: Implement logic\n        return -1;\n    }\n\n    static void Main() {\n        string firstLine = Console.ReadLine();\n        if (firstLine != null) {\n            int n = int.Parse(firstLine);\n            string[] secondLine = Console.ReadLine().Split(' ', StringSplitOptions.RemoveEmptyEntries);\n            int[] scores = Array.ConvertAll(secondLine, int.Parse);\n            Console.WriteLine(GetRunnerUp(n, scores));\n        }\n    }\n}",
      go: "package main\nimport \"fmt\"\n\nfunc getRunnerUp(n int, scores []int) int {\n    // TODO: Implement logic\n    return -1\n}\n\nfunc main() {\n    var n int\n    if _, err := fmt.Scan(&n); err == nil {\n        scores := make([]int, n)\n        for i := 0; i < n; i++ {\n            fmt.Scan(&scores[i])\n        }\n        fmt.Println(getRunnerUp(n, scores))\n    }\n}",
      rust: "use std::io::{self, Read};\n\nfn get_runner_up(n: usize, scores: Vec<i32>) -> i32 {\n    // TODO: Implement logic\n    -1\n}\n\nfn main() {\n    let mut input = String::new();\n    io::stdin().read_to_string(&mut input).unwrap();\n    let mut words = input.split_whitespace();\n    if let Some(n_str) = words.next() {\n        let n: usize = n_str.parse().unwrap();\n        let scores: Vec<i32> = words.map(|s| s.parse().unwrap()).collect();\n        println!(\"{}\", get_runner_up(n, scores));\n    }\n}"
    },
    hiddenTestCases: [
      { input: "2\n10 10", output: "-1" },
      { input: "4\n1 2 3 4", output: "3" },
      { input: "1\n50", output: "-1" },
      { input: "5\n100 100 100 99 98", output: "99" },
      { input: "3\n5 10 2", output: "5" },
      { input: "6\n5 5 5 5 5 5", output: "-1" },
      { input: "5\n10 5 5 5 5", output: "5" },
      { input: "2\n10 5", output: "5" },
      { input: "4\n-1 -2 -3 -4", output: "-2" },
      { input: "10\n1 2 3 4 5 6 7 8 9 10", output: "9" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
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
      python: "import sys\n\ndef is_balanced(s):\n    # TODO: Implement logic using a stack\n    return False\n\nif __name__ == '__main__':\n    line = sys.stdin.read().strip()\n    if is_balanced(line):\n        print('true')\n    else:\n        print('false')",
      java: "import java.util.Scanner;\nimport java.util.Stack;\n\npublic class Main {\n    public static boolean isBalanced(String s) {\n        // TODO: Implement logic using a stack\n        return false;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            System.out.println(isBalanced(sc.next()) ? \"true\" : \"false\");\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <stack>\n#include <string>\nusing namespace std;\n\nbool isBalanced(string s) {\n    // TODO: Implement logic using a stack\n    return false;\n}\n\nint main() {\n    string s;\n    if (cin >> s) {\n        cout << (isBalanced(s) ? \"true\" : \"false\") << endl;\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction isBalanced(s) {\n    // TODO: Implement logic\n    return false;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nif (input) {\n    console.log(isBalanced(input) ? 'true' : 'false');\n}",
      c: "#include <stdio.h>\n#include <stdbool.h>\n#include <string.h>\n\nbool isBalanced(char* s) {\n    // TODO: Implement logic\n    return false;\n}\n\nint main() {\n    char s[10001];\n    if (scanf(\"%s\", s) != EOF) {\n        printf(\"%s\\n\", isBalanced(s) ? \"true\" : \"false\");\n    }\n    return 0;\n}",
      csharp: "using System;\nusing System.Collections.Generic;\n\nclass Program {\n    static bool IsBalanced(string s) {\n        // TODO: Implement logic\n        return false;\n    }\n\n    static void Main() {\n        string s = Console.ReadLine();\n        if (s != null) {\n            Console.WriteLine(IsBalanced(s.Trim()) ? \"true\" : \"false\");\n        }\n    }\n}",
      go: "package main\nimport \"fmt\"\n\nfunc isBalanced(s string) bool {\n    // TODO: Implement logic\n    return false\n}\n\nfunc main() {\n    var s string\n    fmt.Scanln(&s)\n    if isBalanced(s) {\n        fmt.Println(\"true\")\n    } else {\n        fmt.Println(\"false\")\n    }\n}",
      rust: "use std::io;\n\nfn is_balanced(s: &str) -> bool {\n    // TODO: Implement logic\n    false\n}\n\nfn main() {\n    let mut input = String::new();\n    io::stdin().read_line(&mut input).unwrap();\n    let s = input.trim();\n    if is_balanced(s) {\n        println!(\"true\");\n    } else {\n        println!(\"false\");\n    }\n}"
    },
    hiddenTestCases: [
      { input: "()", output: "true" },
      { input: "()[]{}", output: "true" },
      { input: "(]", output: "false" },
      { input: "([)]", output: "false" },
      { input: "((", output: "false" },
      { input: "]]", output: "false" },
      { input: "{[()]}", output: "true" },
      { input: "((()))", output: "true" },
      { input: "(((", output: "false" },
      { input: "[{()}]()", output: "true" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
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
    outputFormat: "The zero-based index of the first unique visitor. If none, print -1.",
    constraints: ["1 <= length <= 100,000", "Smallest English letters only."],
    sampleInput: "nexvoroai",
    sampleOutput: "0",
    explanation: "How to think: First, count how many times each letter appears in the whole string using a Hash Map (Dictionary). Then, scan the string from left to right. The first letter you find with a count of exactly 1 is your answer!",
    starterCode: {
      python: "import sys\n\ndef first_unique(s):\n    # TODO: Implement using a frequency map\n    return -1\n\nif __name__ == '__main__':\n    line = sys.stdin.read().strip()\n    print(first_unique(line))",
      java: "import java.util.Scanner;\nimport java.util.HashMap;\n\npublic class Main {\n    public static int firstUnique(String s) {\n        // TODO: Implement frequency map logic\n        return -1;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            System.out.println(firstUnique(sc.next()));\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <string>\n#include <unordered_map>\nusing namespace std;\n\nint firstUnique(string s) {\n    // TODO: Implement frequency map logic\n    return -1;\n}\n\nint main() {\n    string s;\n    if (cin >> s) {\n        cout << firstUnique(s) << endl;\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction firstUnique(s) {\n    // TODO: Implement logic\n    return -1;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nif (input) {\n    console.log(firstUnique(input));\n}",
      c: "#include <stdio.h>\n#include <string.h>\n\nint firstUnique(char* s) {\n    // TODO: Implement logic\n    return -1;\n}\n\nint main() {\n    char s[100001];\n    if (scanf(\"%s\", s) != EOF) {\n        printf(\"%d\\n\", firstUnique(s));\n    }\n    return 0;\n}",
      csharp: "using System;\nusing System.Collections.Generic;\n\nclass Program {\n    static int FirstUnique(string s) {\n        // TODO: Implement logic\n        return -1;\n    }\n\n    static void Main() {\n        string s = Console.ReadLine();\n        if (s != null) {\n            Console.WriteLine(FirstUnique(s.Trim()));\n        }\n    }\n}",
      go: "package main\nimport \"fmt\"\n\nfunc firstUnique(s string) int {\n    // TODO: Implement logic\n    return -1\n}\n\nfunc main() {\n    var s string\n    fmt.Scanln(&s)\n    fmt.Println(firstUnique(s))\n}",
      rust: "use std::io;\n\nfn first_unique(s: &str) -> i32 {\n    // TODO: Implement logic\n    -1\n}\n\nfn main() {\n    let mut input = String::new();\n    io::stdin().read_line(&mut input).unwrap();\n    let s = input.trim();\n    println!(\"{}\", first_unique(s));\n}"
    },
    hiddenTestCases: [
      { input: "aabb", output: "-1" },
      { input: "leetcode", output: "0" },
      { input: "loveleetcode", output: "2" },
      { input: "z", output: "0" },
      { input: "abcabc", output: "-1" },
      { input: "aabbccddeeffg", output: "12" },
      { input: "statistics", output: "3" },
      { input: "algorithm", output: "0" },
      { input: "tattarrattat", output: "-1" },
      { input: "abcdefg", output: "0" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
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
      python: "import sys\n\ndef max_subarray_sum(n, arr):\n    # TODO: Implement Kadane's Algorithm\n    return 0\n\nif __name__ == '__main__':\n    data = sys.stdin.read().split()\n    if len(data) >= 1:\n        n = int(data[0])\n        arr = [int(x) for x in data[1:n+1]]\n        print(max_subarray_sum(n, arr))",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static long maxSubarraySum(int n, int[] arr) {\n        // TODO: Implement logic\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] arr = new int[n];\n            for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n            System.out.println(maxSubarraySum(n, arr));\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nlong long maxSubarraySum(int n, vector<int>& arr) {\n    // TODO: Implement logic\n    return 0;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> arr(n);\n        for (int i = 0; i < n; i++) cin >> arr[i];\n        cout << maxSubarraySum(n, arr) << endl;\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction maxSubarraySum(n, arr) {\n    // TODO: Implement logic\n    return 0;\n}\n\nconst input = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (input.length >= 1) {\n    const n = parseInt(input[0]);\n    const arr = input.slice(1, n + 1).map(Number);\n    console.log(maxSubarraySum(n, arr));\n}",
      c: "#include <stdio.h>\n#include <limits.h>\n\nlong long maxSubarraySum(int n, int* arr) {\n    // TODO: Implement logic\n    return 0;\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != EOF) {\n        int arr[100001];\n        for (int i = 0; i < n; i++) scanf(\"%d\", &arr[i]);\n        printf(\"%lld\\n\", maxSubarraySum(n, arr));\n    }\n    return 0;\n}",
      csharp: "using System;\n\nclass Program {\n    static long MaxSubarraySum(int n, int[] arr) {\n        // TODO: Implement logic\n        return 0;\n    }\n\n    static void Main() {\n        string line1 = Console.ReadLine();\n        if (line1 != null) {\n            int n = int.Parse(line1);\n            string[] line2 = Console.ReadLine().Split(' ', StringSplitOptions.RemoveEmptyEntries);\n            int[] arr = Array.ConvertAll(line2, int.Parse);\n            Console.WriteLine(MaxSubarraySum(n, arr));\n        }\n    }\n}",
      go: "package main\nimport \"fmt\"\n\nfunc maxSubarraySum(n int, arr []int) int64 {\n    // TODO: Implement logic\n    return 0\n}\n\nfunc main() {\n    var n int\n    if _, err := fmt.Scan(&n); err == nil {\n        arr := make([]int, n)\n        for i := 0; i < n; i++ {\n            fmt.Scan(&arr[i])\n        }\n        fmt.Println(maxSubarraySum(n, arr))\n    }\n}",
      rust: "use std::io::{self, Read};\n\nfn max_subarray_sum(n: usize, arr: Vec<i32>) -> i64 {\n    // TODO: Implement logic\n    0\n}\n\nfn main() {\n    let mut input = String::new();\n    io::stdin().read_to_string(&mut input).unwrap();\n    let mut words = input.split_whitespace();\n    if let Some(n_str) = words.next() {\n        let n: usize = n_str.parse().unwrap();\n        let arr: Vec<i32> = words.map(|s| s.parse().unwrap()).collect();\n        println!(\"{}\", max_subarray_sum(n, arr));\n    }\n}"
    },
    hiddenTestCases: [
      { input: "1\n-5", output: "-5" },
      { input: "4\n1 2 3 4", output: "10" },
      { input: "5\n-1 -2 -3 -4 -5", output: "-1" },
      { input: "3\n10 -5 20", output: "25" },
      { input: "6\n-2 1 -3 4 -1 2", output: "5" },
      { input: "8\n-2 1 -3 4 -1 2 1 -5", output: "6" },
      { input: "5\n2 3 -1 4 5", output: "13" },
      { input: "2\n100 -200", output: "100" },
      { input: "4\n-10 2 -1 5", output: "6" },
      { input: "7\n1 1 1 1 1 1 1", output: "7" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  }
];
