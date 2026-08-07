/**
 * @fileOverview Nexvoro AI Master Question Data (v8.0 - Production Grade).
 * Calibrated for high-fidelity auditing with 8-language support and resilient hidden test cases.
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
  functionInfo?: {
    name: string;
    params: string;
    returnType: string;
    goal: string;
  };
}

export const MASTER_QUESTIONS: CodingQuestion[] = [
  {
    id: "fresher-easy-01",
    title: "The Mirror Word Test",
    description: "You are building a pattern recognition engine for a children's literacy application. The core feature is to identify 'Mirror Words.' A Mirror Word is a sequence of characters that remains identical when read from left-to-right and right-to-left. For example, 'level' is a mirror word, while 'hello' is not. Your task is to implement a robust verification node to detect these patterns.",
    difficulty: "Easy",
    category: "Strings",
    topic: "STRING ENGINE",
    estimatedTime: "10 mins",
    company: "TCS",
    tags: ["Strings", "Logic", "Pattern Recognition"],
    inputFormat: "A single line containing one sequence of characters (string).",
    outputFormat: "Print 'YES' if it is a Mirror Word, otherwise print 'NO'.",
    constraints: [
      "- 1 <= string length <= 10,000",
      "- Consists of alphanumeric characters only.",
      "- Case sensitivity is active (A is not a)."
    ],
    sampleInput: "racecar",
    sampleOutput: "YES",
    explanation: "Compare the sequence with its reversed version. If both are identical, it passes the Mirror Word protocol.",
    functionInfo: {
      name: "isMirrorWord(s)",
      params: "s : string",
      returnType: "boolean",
      goal: "Detect if a string is a palindrome."
    },
    starterCode: {
      python: "import sys\n\ndef is_mirror_word(s):\n    # TODO: Implement mirror detection\n    pass\n\nif __name__ == '__main__':\n    line = sys.stdin.read().strip()\n    if is_mirror_word(line):\n        print('YES')\n    else:\n        print('NO')",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static boolean isMirrorWord(String s) {\n        // TODO: Implement mirror detection\n        return false;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            System.out.println(isMirrorWord(s) ? \"YES\" : \"NO\");\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <string>\nusing namespace std;\n\nbool isMirrorWord(string s) {\n    // TODO: Implement mirror detection\n    return false;\n}\n\nint main() {\n    string s;\n    if (cin >> s) {\n        cout << (isMirrorWord(s) ? \"YES\" : \"NO\") << endl;\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction isMirrorWord(s) {\n    // TODO: Implement mirror detection\n    return false;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nif (input) {\n    console.log(isMirrorWord(input) ? 'YES' : 'NO');\n}",
      c: "#include <stdio.h>\n#include <string.h>\n#include <stdbool.h>\n\nbool isMirrorWord(char* s) {\n    // TODO: Implement mirror detection\n    return false;\n}\n\nint main() {\n    char s[10001];\n    if (scanf(\"%s\", s) != EOF) {\n        printf(\"%s\\n\", isMirrorWord(s) ? \"YES\" : \"NO\");\n    }\n    return 0;\n}",
      csharp: "using System;\n\nclass Program {\n    static bool IsMirrorWord(string s) {\n        // TODO: Implement mirror detection\n        return false;\n    }\n\n    static void Main() {\n        string s = Console.ReadLine();\n        if (s != null) {\n            Console.WriteLine(IsMirrorWord(s.Trim()) ? \"YES\" : \"NO\");\n        }\n    }\n}",
      go: "package main\nimport \"fmt\"\n\nfunc isMirrorWord(s string) bool {\n    // TODO: Implement mirror detection\n    return false\n}\n\nfunc main() {\n    var s string\n    fmt.Scanln(&s)\n    if isMirrorWord(s) {\n        fmt.Println(\"YES\")\n    } else {\n        fmt.Println(\"NO\")\n    }\n}",
      rust: "use std::io;\n\nfn is_mirror_word(s: &str) -> bool {\n    // TODO: Implement mirror detection\n    false\n}\n\nfn main() {\n    let mut input = String::new();\n    io::stdin().read_line(&mut input).unwrap();\n    let s = input.trim();\n    if is_mirror_word(s) {\n        println!(\"YES\");\n    } else {\n        println!(\"NO\");\n    }\n}"
    },
    hiddenTestCases: [
      { input: "madam", output: "YES" },
      { input: "a", output: "YES" },
      { input: "ab", output: "NO" },
      { input: "12321", output: "YES" },
      { input: "Aa", output: "NO" },
      { input: "A", output: "YES" },
      { input: "12345", output: "NO" },
      { input: "radar", output: "YES" },
      { input: "rotor", output: "YES" },
      { input: "nexvoro", output: "NO" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-easy-02",
    title: "Tournament Runner-Up Finder",
    description: "You are archiving scores for a regional gaming tournament. To recognize exceptional performance, the system must identify the 'Runner-Up' score. The Runner-Up is defined as the maximum score that is strictly less than the highest achieved score. Multiple players might share the same top score, in which case the system must find the next highest unique node.",
    difficulty: "Easy",
    category: "Arrays",
    topic: "DATA STRUCTURES",
    estimatedTime: "10 mins",
    company: "Accenture",
    tags: ["Arrays", "Logic", "Sorting"],
    inputFormat: "Line 1: Integer N (Number of players). Line 2: N space-separated integers (Scores).",
    outputFormat: "Print the runner-up score as an integer. If no runner-up exists, print -1.",
    constraints: [
      "- 1 <= N <= 100,000",
      "- 0 <= score <= 10^9"
    ],
    sampleInput: "5\n10 20 20 15 5",
    sampleOutput: "15",
    explanation: "Highest score is 20. The unique score just below that is 15.",
    functionInfo: {
      name: "getRunnerUp(n, scores)",
      params: "n: int, scores: int[]",
      returnType: "int",
      goal: "Find the strictly second-largest unique element."
    },
    starterCode: {
      python: "import sys\n\ndef get_runner_up(n, scores):\n    # TODO: Implement runner-up detection\n    pass\n\nif __name__ == '__main__':\n    data = sys.stdin.read().split()\n    if len(data) >= 2:\n        n = int(data[0])\n        scores = [int(x) for x in data[1:n+1]]\n        print(get_runner_up(n, scores))",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static int getRunnerUp(int n, int[] scores) {\n        // TODO: Implement runner-up detection\n        return -1;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] scores = new int[n];\n            for (int i = 0; i < n; i++) scores[i] = sc.nextInt();\n            System.out.println(getRunnerUp(n, scores));\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <vector>\n#include <set>\n#include <algorithm>\nusing namespace std;\n\nint getRunnerUp(int n, vector<int>& scores) {\n    // TODO: Implement runner-up detection\n    return -1;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> scores(n);\n        for (int i = 0; i < n; i++) cin >> scores[i];\n        cout << getRunnerUp(n, scores) << endl;\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction getRunnerUp(n, scores) {\n    // TODO: Implement runner-up detection\n    return -1;\n}\n\nconst input = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (input.length >= 2) {\n    const n = parseInt(input[0]);\n    const scores = input.slice(1, n + 1).map(Number);\n    console.log(getRunnerUp(n, scores));\n}",
      c: "#include <stdio.h>\n\nint getRunnerUp(int n, int* scores) {\n    // TODO: Implement runner-up detection\n    return -1;\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != EOF) {\n        int scores[100001];\n        for (int i = 0; i < n; i++) scanf(\"%d\", &scores[i]);\n        printf(\"%d\\n\", getRunnerUp(n, scores));\n    }\n    return 0;\n}",
      csharp: "using System;\nusing System.Linq;\n\nclass Program {\n    static int GetRunnerUp(int n, int[] scores) {\n        // TODO: Implement runner-up detection\n        return -1;\n    }\n\n    static void Main() {\n        string line1 = Console.ReadLine();\n        if (line1 != null) {\n            int n = int.Parse(line1);\n            string[] line2 = Console.ReadLine().Split(' ', StringSplitOptions.RemoveEmptyEntries);\n            int[] scores = Array.ConvertAll(line2, int.Parse);\n            Console.WriteLine(GetRunnerUp(n, scores));\n        }\n    }\n}",
      go: "package main\nimport \"fmt\"\n\nfunc getRunnerUp(n int, scores []int) int {\n    // TODO: Implement runner-up detection\n    return -1\n}\n\nfunc main() {\n    var n int\n    fmt.Scan(&n)\n    scores := make([]int, n)\n    for i := 0; i < n; i++ {\n        fmt.Scan(&scores[i])\n    }\n    fmt.Println(getRunnerUp(n, scores))\n}",
      rust: "use std::io::{self, Read};\n\nfn get_runner_up(n: usize, scores: Vec<i32>) -> i32 {\n    // TODO: Implement runner-up detection\n    -1\n}\n\nfn main() {\n    let mut input = String::new();\n    io::stdin().read_to_string(&mut input).unwrap();\n    let mut words = input.split_whitespace();\n    if let Some(n_str) = words.next() {\n        let n: usize = n_str.parse().unwrap();\n        let scores: Vec<i32> = words.map(|s| s.parse().unwrap()).collect();\n        println!(\"{}\", get_runner_up(n, scores));\n    }\n}"
    },
    hiddenTestCases: [
      { input: "2\n10 10", output: "-1" },
      { input: "4\n1 2 3 4", output: "3" },
      { input: "5\n100 100 100 99 98", output: "99" },
      { input: "3\n5 10 2", output: "5" },
      { input: "6\n5 5 5 5 5 5", output: "-1" },
      { input: "5\n10 5 5 5 5", output: "5" },
      { input: "2\n10 5", output: "5" },
      { input: "1\n50", output: "-1" },
      { input: "4\n-1 -2 -3 -4", output: "-2" },
      { input: "10\n1 2 3 4 5 6 7 8 9 10", output: "9" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  }
];
