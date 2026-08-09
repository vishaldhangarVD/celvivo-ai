/**
 * @fileOverview Nexvoro AI Master Question Data (v14.0 - Formatted & Sanitized).
 * All functional solutions have been removed from starterCode to ensure a valid assessment experience.
 * Starter code is formatted with consistent indentation to prevent syntax errors during candidate input.
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
  walkthrough?: {
    input: string;
    received: string;
    expected: string;
    output: string;
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
    constraints: ["- 1 <= string length <= 10,000", "- Consists of alphanumeric characters only.", "- Case sensitivity is active (A is not a)."],
    sampleInput: "racecar",
    sampleOutput: "YES",
    explanation: "A Mirror Word is a palindrome. You must check if the input remains the same when reversed.",
    functionInfo: {
      name: "isMirrorWord(s)",
      params: "s : string",
      returnType: "boolean",
      goal: "Detect if a string is a palindrome."
    },
    walkthrough: { input: "racecar", received: "s = \"racecar\"", expected: "True", output: "YES" },
    starterCode: {
      python: "import sys\n\ndef is_mirror_word(s):\n    # TODO: Implement the logic to check if 's' is a palindrome\n    return False\n\nif __name__ == '__main__':\n    line = sys.stdin.read().strip()\n    if line:\n        if is_mirror_word(line):\n            print('YES')\n        else:\n            print('NO')",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static boolean isMirrorWord(String s) {\n        // TODO: Implement the logic to check if 's' is a palindrome\n        return false;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            if (isMirrorWord(s)) {\n                System.out.println(\"YES\");\n            } else {\n                System.out.println(\"NO\");\n            }\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <string>\n#include <algorithm>\n\nusing namespace std;\n\nbool isMirrorWord(string s) {\n    // TODO: Implement mirror word logic\n    return false;\n}\n\nint main() {\n    string s;\n    if (cin >> s) {\n        if (isMirrorWord(s)) {\n            cout << \"YES\" << endl;\n        } else {\n            cout << \"NO\" << endl;\n        }\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction isMirrorWord(s) {\n    // TODO: Implement mirror word logic\n    return false;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nif (input) {\n    console.log(isMirrorWord(input) ? 'YES' : 'NO');\n}",
      c: "#include <stdio.h>\n#include <string.h>\n#include <stdbool.h>\n\nbool isMirrorWord(char* s) {\n    // TODO: Implement mirror word logic\n    return false;\n}\n\nint main() {\n    char s[10001];\n    if (scanf(\"%s\", s) != EOF) {\n        if (isMirrorWord(s)) {\n            printf(\"YES\\n\");\n        } else {\n            printf(\"NO\\n\");\n        }\n    }\n    return 0;\n}",
      csharp: "using System;\n\nclass Program {\n    static bool IsMirrorWord(string s) {\n        // TODO: Implement mirror word logic\n        return false;\n    }\n\n    static void Main() {\n        string s = Console.ReadLine();\n        if (s != null) {\n            if (IsMirrorWord(s.Trim())) {\n                Console.WriteLine(\"YES\");\n            } else {\n                Console.WriteLine(\"NO\");\n            }\n        }\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc isMirrorWord(s string) bool {\n    // TODO: Implement mirror word logic\n    return false\n}\n\nfunc main() {\n    var s string\n    fmt.Scanln(&s)\n    if s != \"\" {\n        if isMirrorWord(s) {\n            fmt.Println(\"YES\")\n        } else {\n            fmt.Println(\"NO\")\n        }\n    }\n}",
      rust: "use std::io;\n\nfn is_mirror_word(s: &str) -> bool {\n    // TODO: Implement mirror word logic\n    false\n}\n\nfn main() {\n    let mut input = String::new();\n    if let Ok(_) = io::stdin().read_line(&mut input) {\n        let s = input.trim();\n        if !s.is_empty() {\n            if is_mirror_word(s) {\n                println!(\"YES\");\n            } else {\n                println!(\"NO\");\n            }\n        }\n    }\n}"
    },
    hiddenTestCases: [
      { input: "madam", output: "YES" }, { input: "a", output: "YES" }, { input: "ab", output: "NO" }, { input: "12321", output: "YES" }, { input: "Aa", output: "NO" }, { input: "A", output: "YES" }, { input: "12345", output: "NO" }, { input: "radar", output: "YES" }, { input: "rotor", output: "YES" }, { input: "nexvoro", output: "NO" }
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
    inputFormat: "Line 1: Integer N (Number of players).\nLine 2: N space-separated integers (Scores).",
    outputFormat: "Print the runner-up score as an integer. If no runner-up exists, print -1.",
    constraints: ["- 1 <= N <= 100,000", "- 0 <= score <= 10^9"],
    sampleInput: "5\n10 20 20 15 5",
    sampleOutput: "15",
    explanation: "Highest score is 20. The unique score just below that is 15.",
    functionInfo: {
      name: "getRunnerUp(n, scores)",
      params: "n: int, scores: int[]",
      returnType: "int",
      goal: "Find the strictly second-largest unique element."
    },
    walkthrough: { input: "5\n10 20 20 15 5", received: "scores = [10, 20, 20, 15, 5]", expected: "15", output: "15" },
    starterCode: {
      python: "import sys\n\ndef get_runner_up(n, scores):\n    # TODO: Find the second largest unique element\n    return -1\n\nif __name__ == '__main__':\n    data = sys.stdin.read().split()\n    if len(data) >= 2:\n        n = int(data[0])\n        scores = [int(x) for x in data[1:n+1]]\n        print(get_runner_up(n, scores))",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static int getRunnerUp(int n, int[] scores) {\n        // TODO: Find the second largest unique element\n        return -1;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] scores = new int[n];\n            for (int i = 0; i < n; i++) {\n                if (sc.hasNextInt()) scores[i] = sc.nextInt();\n            }\n            System.out.println(getRunnerUp(n, scores));\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nint getRunnerUp(int n, vector<int>& scores) {\n    // TODO: Find the second largest unique element\n    return -1;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> scores(n);\n        for (int i = 0; i < n; i++) cin >> scores[i];\n        cout << getRunnerUp(n, scores) << endl;\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction getRunnerUp(n, scores) {\n    // TODO: Find the second largest unique element\n    return -1;\n}\n\nconst input = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (input.length >= 2) {\n    const n = parseInt(input[0]);\n    const scores = input.slice(1, n + 1).filter(x => x !== '').map(Number);\n    console.log(getRunnerUp(n, scores));\n}",
      c: "#include <stdio.h>\n\nint getRunnerUp(int n, int* scores) {\n    // TODO: Find the second largest unique element\n    return -1;\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != EOF) {\n        int scores[100001];\n        for (int i = 0; i < n; i++) scanf(\"%d\", &scores[i]);\n        printf(\"%d\\n\", getRunnerUp(n, scores));\n    }\n    return 0;\n}",
      csharp: "using System;\nusing System.Collections.Generic;\nusing System.Linq;\n\nclass Program {\n    static int GetRunnerUp(int n, int[] scores) {\n        // TODO: Find the second largest unique element\n        return -1;\n    }\n\n    static void Main() {\n        string line1 = Console.ReadLine();\n        if (line1 != null) {\n            int n = int.Parse(line1);\n            string line2 = Console.ReadLine();\n            if (line2 != null) {\n                string[] parts = line2.Split(' ', StringSplitOptions.RemoveEmptyEntries);\n                int[] scores = Array.ConvertAll(parts, int.Parse);\n                Console.WriteLine(GetRunnerUp(n, scores));\n            }\n        }\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc getRunnerUp(n int, scores []int) int {\n    // TODO: Find the second largest unique element\n    return -1\n}\n\nfunc main() {\n    var n int\n    if _, err := fmt.Scan(&n); err == nil {\n        scores := make([]int, n)\n        for i := 0; i < n; i++ {\n            fmt.Scan(&scores[i])\n        }\n        fmt.Println(getRunnerUp(n, scores))\n    }\n}",
      rust: "use std::io::{self, Read};\n\nfn get_runner_up(n: usize, scores: Vec<i32>) -> i32 {\n    // TODO: Find the second largest unique element\n    -1\n}\n\nfn main() {\n    let mut input = String::new();\n    if let Ok(_) = io::stdin().read_to_string(&mut input) {\n        let mut words = input.split_whitespace();\n        if let Some(n_str) = words.next() {\n            let n: usize = n_str.parse().unwrap();\n            let scores: Vec<i32> = words.map(|s| s.parse().unwrap()).collect();\n            println!(\"{}\", get_runner_up(n, scores));\n        }\n    }\n}"
    },
    hiddenTestCases: [
      { input: "2\n10 10", output: "-1" }, { input: "4\n1 2 3 4", output: "3" }, { input: "5\n100 100 100 99 98", output: "99" }, { input: "3\n5 10 2", output: "5" }, { input: "6\n5 5 5 5 5 5", output: "-1" }, { input: "5\n10 5 5 5 5", output: "5" }, { input: "2\n10 5", output: "5" }, { input: "1\n50", output: "-1" }, { input: "4\n-1 -2 -3 -4", output: "-2" }, { input: "10\n1 2 3 4 5 6 7 8 9 10", output: "9" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-easy-03",
    title: "Vowel Counter Protocol",
    description: "In linguistics analysis, determining the frequency of vowels is a core operation. Your mission is to implement a high-speed vowel extraction node. Given a string, count the total number of vowels (a, e, i, o, u) present, regardless of case sensitivity.",
    difficulty: "Easy",
    category: "Strings",
    topic: "STRING ENGINE",
    estimatedTime: "10 mins",
    company: "Infosys",
    tags: ["Strings", "Counting"],
    inputFormat: "A single line containing a string S.",
    outputFormat: "A single integer representing the count of vowels.",
    constraints: ["- 1 <= |S| <= 10^5", "- S consists of alphanumeric characters and spaces."],
    sampleInput: "Hello World",
    sampleOutput: "3",
    explanation: "'e', 'o', 'o' are vowels in 'Hello World'.",
    functionInfo: { name: "countVowels(s)", params: "s: string", returnType: "int", goal: "Count vowels in a string." },
    walkthrough: { input: "Hello World", received: "s=\"Hello World\"", expected: "3", output: "3" },
    starterCode: {
      python: "import sys\n\ndef count_vowels(s):\n    # TODO: Count vowels (a, e, i, o, u) case-insensitively\n    return 0\n\nif __name__ == '__main__':\n    line = sys.stdin.read().strip()\n    print(count_vowels(line))",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static int countVowels(String s) {\n        // TODO: Count vowels (a, e, i, o, u) case-insensitively\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            System.out.println(countVowels(sc.nextLine()));\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <string>\n\nusing namespace std;\n\nint countVowels(string s) {\n    // TODO: Count vowels (a, e, i, o, u) case-insensitively\n    return 0;\n}\n\nint main() {\n    string s;\n    if (getline(cin, s)) {\n        cout << countVowels(s) << endl;\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction countVowels(s) {\n    // TODO: Count vowels (a, e, i, o, u) case-insensitively\n    return 0;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nconsole.log(countVowels(input));",
      c: "#include <stdio.h>\n#include <ctype.h>\n#include <string.h>\n\nint countVowels(char* s) {\n    // TODO: Count vowels (a, e, i, o, u) case-insensitively\n    return 0;\n}\n\nint main() {\n    char s[100001];\n    if (fgets(s, 100001, stdin)) {\n        printf(\"%d\\n\", countVowels(s));\n    }\n    return 0;\n}",
      csharp: "using System;\n\nclass Program {\n    static int CountVowels(string s) {\n        // TODO: Count vowels (a, e, i, o, u) case-insensitively\n        return 0;\n    }\n\n    static void Main() {\n        string s = Console.ReadLine();\n        Console.WriteLine(CountVowels(s ?? \"\"));\n    }\n}",
      go: "package main\n\nimport (\n    \"fmt\"\n    \"bufio\"\n    \"os\"\n)\n\nfunc countVowels(s string) int {\n    // TODO: Count vowels (a, e, i, o, u) case-insensitively\n    return 0\n}\n\nfunc main() {\n    reader := bufio.NewReader(os.Stdin)\n    s, _ := reader.ReadString('\\n')\n    fmt.Println(countVowels(s))\n}",
      rust: "use std::io::{self, BufRead};\n\nfn count_vowels(s: &str) -> usize {\n    // TODO: Count vowels (a, e, i, o, u) case-insensitively\n    0\n}\n\nfn main() {\n    let stdin = io::stdin();\n    let mut line = String::new();\n    if let Ok(_) = stdin.lock().read_line(&mut line) {\n        println!(\"{}\", count_vowels(line.trim()));\n    }\n}"
    },
    hiddenTestCases: [
      { input: "aeiou", output: "5" }, { input: "AEIOU", output: "5" }, { input: "bcdfg", output: "0" }, { input: "a", output: "1" }, { input: "", output: "0" }, { input: "Algorithm Node", output: "5" }, { input: "12345", output: "0" }, { input: "The quick brown fox", output: "5" }, { input: "Sky rhythm", output: "0" }, { input: "Education", output: "5" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-easy-04",
    title: "Array Aggregator Node",
    description: "You are designing an accounting module for a financial terminal. The core requirement is to calculate the total sum of all integer values in a dataset. Implement an aggregator node that takes an array of integers and returns their cumulative total.",
    difficulty: "Easy",
    category: "Arrays",
    topic: "DATA STRUCTURES",
    estimatedTime: "10 mins",
    company: "Wipro",
    tags: ["Arrays", "Arithmetic"],
    inputFormat: "Line 1: Integer N.\nLine 2: N space-separated integers.",
    outputFormat: "A single integer representing the total sum.",
    constraints: ["- 1 <= N <= 10^5", "- -10^6 <= element <= 10^6"],
    sampleInput: "4\n1 2 3 4",
    sampleOutput: "10",
    explanation: "1 + 2 + 3 + 4 = 10.",
    functionInfo: { name: "sumArray(n, arr)", params: "n: int, arr: int[]", returnType: "long", goal: "Sum elements of an array." },
    walkthrough: { input: "4, [1, 2, 3, 4]", received: "arr=[1,2,3,4]", expected: "10", output: "10" },
    starterCode: {
      python: "import sys\n\ndef sum_array(n, arr):\n    # TODO: Return total sum of array elements\n    return 0\n\nif __name__ == '__main__':\n    data = sys.stdin.read().split()\n    if len(data) >= 1:\n        n = int(data[0])\n        arr = [int(x) for x in data[1:n+1]]\n        print(sum_array(n, arr))",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static long sumArray(int n, int[] arr) {\n        // TODO: Return total sum of array elements\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] arr = new int[n];\n            for (int i = 0; i < n; i++) {\n                if (sc.hasNextInt()) arr[i] = sc.nextInt();\n            }\n            System.out.println(sumArray(n, arr));\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nlong long sumArray(int n, vector<int>& a) {\n    // TODO: Return total sum of array elements\n    return 0;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i];\n        cout << sumArray(n, a) << endl;\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction sumArray(n, arr) {\n    // TODO: Return total sum of array elements\n    return 0;\n}\n\nconst input = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (input.length > 1) {\n    const n = parseInt(input[0]);\n    const arr = input.slice(1, n + 1).filter(x => x !== '').map(Number);\n    console.log(sumArray(n, arr).toString());\n}",
      c: "#include <stdio.h>\n\nlong long sumArray(int n, int* arr) {\n    // TODO: Return total sum of array elements\n    return 0;\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != EOF) {\n        int a[100001];\n        for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n        printf(\"%lld\\n\", sumArray(n, a));\n    }\n    return 0;\n}",
      csharp: "using System;\n\nclass Program {\n    static long SumArray(int n, int[] arr) {\n        // TODO: Return total sum of array elements\n        return 0;\n    }\n\n    static void Main() {\n        string l1 = Console.ReadLine();\n        if (l1 != null) {\n            int n = int.Parse(l1);\n            string l2 = Console.ReadLine();\n            if (l2 != null) {\n                int[] arr = Array.ConvertAll(l2.Split(' ', StringSplitOptions.RemoveEmptyEntries), int.Parse);\n                Console.WriteLine(SumArray(n, arr));\n            }\n        }\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc sumArray(n int, arr []int) int64 {\n    // TODO: Return total sum of array elements\n    return 0\n}\n\nfunc main() {\n    var n int\n    if _, err := fmt.Scan(&n); err == nil {\n        a := make([]int, n)\n        for i := 0; i < n; i++ {\n            fmt.Scan(&a[i])\n        }\n        fmt.Println(sumArray(n, a))\n    }\n}",
      rust: "use std::io::{self, BufRead};\n\nfn sum_array(arr: &[i64]) -> i64 {\n    // TODO: Return total sum of array elements\n    0\n}\n\nfn main() {\n    let stdin = io::stdin();\n    let mut lines = stdin.lock().lines();\n    if let Some(Ok(l1)) = lines.next() {\n        if let Some(Ok(l2)) = lines.next() {\n            let a: Vec<i64> = l2.split_whitespace().map(|x| x.parse::<i64>().unwrap()).collect();\n            println!(\"{}\", sum_array(&a));\n        }\n    }\n}"
    },
    hiddenTestCases: [
      { input: "1\n100", output: "100" }, { input: "5\n-1 -2 -3 -4 -5", output: "-15" }, { input: "3\n1000000 1000000 1000000", output: "3000000" }, { input: "2\n-1000000 1000000", output: "0" }, { input: "4\n0 0 0 0", output: "0" }, { input: "10\n1 1 1 1 1 1 1 1 1 1", output: "10" }, { input: "2\n123456 654321", output: "777777" }, { input: "3\n10 20 -30", output: "0" }, { input: "5\n10 10 10 10 10", output: "50" }, { input: "2\n-50 25", output: "-25" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-easy-05",
    title: "Peak Element Detector",
    description: "In signal processing, identifying the highest magnitude is crucial. Your task is to implement a Peak Detector for an array of integers. Find and output the largest integer present in the given sequence.",
    difficulty: "Easy",
    category: "Arrays",
    topic: "DATA STRUCTURES",
    estimatedTime: "10 mins",
    company: "Cognizant",
    tags: ["Arrays", "Maximum"],
    inputFormat: "Line 1: Integer N.\nLine 2: N integers.",
    outputFormat: "The largest integer in the array.",
    constraints: ["- 1 <= N <= 10^5", "- -10^9 <= element <= 10^9"],
    sampleInput: "3\n10 50 20",
    sampleOutput: "50",
    explanation: "50 is the largest node in [10, 50, 20].",
    functionInfo: { name: "findMax(n, arr)", params: "n: int, arr: int[]", returnType: "int", goal: "Find maximum value in array." },
    walkthrough: { input: "3, [10, 50, 20]", received: "arr=[10,50,20]", expected: "50", output: "50" },
    starterCode: {
      python: "import sys\n\ndef find_max(n, arr):\n    # TODO: Find maximum element in array\n    return -10**10\n\nif __name__ == '__main__':\n    data = sys.stdin.read().split()\n    if len(data) >= 1:\n        n = int(data[0])\n        arr = [int(x) for x in data[1:n+1]]\n        print(find_max(n, arr))",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static long findMax(int n, int[] arr) {\n        // TODO: Find maximum element in array\n        return Long.MIN_VALUE;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] a = new int[n];\n            for (int i = 0; i < n; i++) {\n                if (sc.hasNextInt()) a[i] = sc.nextInt();\n            }\n            System.out.println(findMax(n, a));\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <vector>\n#include <climits>\n\nusing namespace std;\n\nlong long findMax(int n, vector<int>& a) {\n    // TODO: Find maximum element in array\n    return LLONG_MIN;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i];\n        cout << findMax(n, a) << endl;\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction findMax(n, arr) {\n    // TODO: Find maximum element in array\n    return -Infinity;\n}\n\nconst input = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (input.length > 1) {\n    const n = parseInt(input[0]);\n    const arr = input.slice(1, n + 1).filter(x => x !== '').map(Number);\n    console.log(findMax(n, arr));\n}",
      c: "#include <stdio.h>\n#include <limits.h>\n\nlong long findMax(int n, int* arr) {\n    // TODO: Find maximum element in array\n    return -2147483648LL;\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != EOF) {\n        int a[100001];\n        for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n        printf(\"%lld\\n\", findMax(n, a));\n    }\n    return 0;\n}",
      csharp: "using System;\n\nclass Program {\n    static long FindMax(int n, int[] arr) {\n        // TODO: Find maximum element in array\n        return long.MinValue;\n    }\n\n    static void Main() {\n        string l1 = Console.ReadLine();\n        if (l1 != null) {\n            int n = int.Parse(l1);\n            string l2 = Console.ReadLine();\n            if (l2 != null) {\n                int[] arr = Array.ConvertAll(l2.Split(' ', StringSplitOptions.RemoveEmptyEntries), int.Parse);\n                Console.WriteLine(FindMax(n, arr));\n            }\n        }\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc findMax(n int, arr []int) int64 {\n    // TODO: Find maximum element in array\n    return -9223372036854775808\n}\n\nfunc main() {\n    var n int\n    if _, err := fmt.Scan(&n); err == nil {\n        a := make([]int, n)\n        for i := 0; i < n; i++ {\n            fmt.Scan(&a[i])\n        }\n        fmt.Println(findMax(n, a))\n    }\n}",
      rust: "use std::io::{self, BufRead};\n\nfn find_max(arr: &[i64]) -> i64 {\n    // TODO: Find maximum element in array\n    i64::MIN\n}\n\nfn main() {\n    let stdin = io::stdin();\n    let mut lines = stdin.lock().lines();\n    if let Some(Ok(l1)) = lines.next() {\n        if let Some(Ok(l2)) = lines.next() {\n            let a: Vec<i64> = l2.split_whitespace().map(|x| x.parse::<i64>().unwrap()).collect();\n            println!(\"{}\", find_max(&a));\n        }\n    }\n}"
    },
    hiddenTestCases: [
      { input: "1\n5", output: "5" }, { input: "5\n1 2 3 4 5", output: "5" }, { input: "5\n5 4 3 2 1", output: "5" }, { input: "3\n-10 -5 -20", output: "-5" }, { input: "4\n100 100 100 100", output: "100" }, { input: "6\n0 10 0 10 0 10", output: "10" }, { input: "2\n-1000000000 1000000000", output: "1000000000" }, { input: "5\n12 45 67 23 89", output: "89" }, { input: "3\n0 0 0", output: "0" }, { input: "10\n1 9 2 8 3 7 4 6 5 0", output: "9" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-easy-06",
    title: "Sequence Reversal Logic",
    description: "Reverse Engineering often starts with simple sequence inversion. Implement a module that takes a string S and returns its reversed version. This is foundational for encryption and data recovery protocols.",
    difficulty: "Easy",
    category: "Strings",
    topic: "STRING ENGINE",
    estimatedTime: "10 mins",
    company: "Capgemini",
    tags: ["Strings", "Manipulation"],
    inputFormat: "A single string S.",
    outputFormat: "The reversed string.",
    constraints: ["- 1 <= |S| <= 10^5"],
    sampleInput: "Nexvoro",
    sampleOutput: "orovxeN",
    explanation: "'Nexvoro' reversed is 'orovxeN'.",
    functionInfo: { name: "reverseString(s)", params: "s: string", returnType: "string", goal: "Invert a string." },
    walkthrough: { input: "Nexvoro", received: "s=\"Nexvoro\"", expected: "orovxeN", output: "orovxeN" },
    starterCode: {
      python: "import sys\n\ndef reverse_s(s):\n    # TODO: Return reversed version of 's'\n    return \"\"\n\nif __name__ == '__main__':\n    line = sys.stdin.read().strip()\n    print(reverse_s(line))",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static String reverseString(String s) {\n        // TODO: Return reversed version of 's'\n        return \"\";\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            System.out.println(reverseString(sc.nextLine()));\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <string>\n#include <algorithm>\n\nusing namespace std;\n\nstring reverseString(string s) {\n    // TODO: Return reversed version of 's'\n    return \"\";\n}\n\nint main() {\n    string s;\n    if (getline(cin, s)) {\n        cout << reverseString(s) << endl;\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction reverseString(s) {\n    // TODO: Return reversed version of 's'\n    return \"\";\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nconsole.log(reverseString(input));",
      c: "#include <stdio.h>\n#include <string.h>\n\nvoid reverseString(char* s) {\n    // TODO: Invert the character sequence in 's'\n}\n\nint main() {\n    char s[100001];\n    if (fgets(s, 100001, stdin)) {\n        int l = strlen(s);\n        if (l > 0 && s[l - 1] == '\\n') s[--l] = '\\0';\n        reverseString(s);\n        printf(\"%s\\n\", s);\n    }\n    return 0;\n}",
      csharp: "using System;\n\nclass Program {\n    static string ReverseString(string s) {\n        // TODO: Return reversed version of 's'\n        return \"\";\n    }\n\n    static void Main() {\n        string s = Console.ReadLine();\n        if (s != null) {\n            Console.WriteLine(ReverseString(s));\n        }\n    }\n}",
      go: "package main\n\nimport (\n    \"fmt\"\n    \"bufio\"\n    \"os\"\n)\n\nfunc reverseString(s string) string {\n    // TODO: Return reversed version of 's'\n    return \"\"\n}\n\nfunc main() {\n    reader := bufio.NewReader(os.Stdin)\n    s, _ := reader.ReadString('\\n')\n    fmt.Println(reverseString(s))\n}",
      rust: "use std::io::{self, BufRead};\n\nfn reverse_string(s: &str) -> String {\n    // TODO: Return reversed version of 's'\n    String::new()\n}\n\nfn main() {\n    let mut line = String::new();\n    if let Ok(_) = io::stdin().lock().read_line(&mut line) {\n        println!(\"{}\", reverse_string(line.trim()));\n    }\n}"
    },
    hiddenTestCases: [
      { input: "abc", output: "cba" }, { input: "123", output: "321" }, { input: "a", output: "a" }, { input: "racecar", output: "racecar" }, { input: "Hello World", output: "dlroW olleH" }, { input: "A", output: "A" }, { input: "  ", output: "  " }, { input: "0101", output: "1010" }, { input: "nexvoroAI", output: "IAorovxen" }, { input: "z", output: "z" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-easy-07",
    title: "Character Frequency Monitor",
    description: "In cybersecurity, analyzing character frequency helps detect anomalous patterns. Your objective is to count how many times a specific target character 'C' appears in a string S.",
    difficulty: "Easy",
    category: "Strings",
    topic: "STRING ENGINE",
    estimatedTime: "10 mins",
    company: "Tech Mahindra",
    tags: ["Strings", "Frequency"],
    inputFormat: "Line 1: A string S.\nLine 2: A character C.",
    outputFormat: "A single integer count.",
    constraints: ["- 1 <= |S| <= 10^5", "- S contains alphanumeric characters and spaces."],
    sampleInput: "Programming in Python\nn",
    sampleOutput: "3",
    explanation: "'n' appears 3 times in 'Programming in Python'.",
    functionInfo: { name: "charFreq(s, c)", params: "s: string, c: char", returnType: "int", goal: "Count occurrences of char in string." },
    walkthrough: { input: "\"abc\", 'a'", received: "s=\"abc\", c='a'", expected: "1", output: "1" },
    starterCode: {
      python: "import sys\n\ndef char_freq(s, c):\n    # TODO: Return frequency of character 'c' in string 's'\n    return 0\n\nif __name__ == '__main__':\n    lines = sys.stdin.read().splitlines()\n    if len(lines) >= 2:\n        print(char_freq(lines[0], lines[1][0]))",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static int charFreq(String s, char c) {\n        // TODO: Return frequency of character 'c' in string 's'\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            String s = sc.nextLine();\n            if (sc.hasNextLine()) {\n                String cLine = sc.nextLine();\n                if (cLine.length() > 0) {\n                    System.out.println(charFreq(s, cLine.charAt(0)));\n                }\n            }\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <string>\n\nusing namespace std;\n\nint charFreq(string s, char c) {\n    // TODO: Return frequency of character 'c' in string 's'\n    return 0;\n}\n\nint main() {\n    string s;\n    if (getline(cin, s)) {\n        char c;\n        if (cin >> c) {\n            cout << charFreq(s, c) << endl;\n        }\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction charFreq(s, c) {\n    // TODO: Return frequency of character 'c' in string 's'\n    return 0;\n}\n\nconst lines = fs.readFileSync(0, 'utf8').split('\\n');\nif (lines.length >= 2) {\n    console.log(charFreq(lines[0], lines[1][0]));\n}",
      c: "#include <stdio.h>\n#include <string.h>\n\nint charFreq(char* s, char c) {\n    // TODO: Return frequency of character 'c' in string 's'\n    return 0;\n}\n\nint main() {\n    char s[100001], c;\n    if (fgets(s, 100001, stdin)) {\n        if (scanf(\" %c\", &c) != EOF) {\n            printf(\"%d\\n\", charFreq(s, c));\n        }\n    }\n    return 0;\n}",
      csharp: "using System;\n\nclass Program {\n    static int CharFreq(string s, char c) {\n        // TODO: Return frequency of character 'c' in string 's'\n        return 0;\n    }\n\n    static void Main() {\n        string s = Console.ReadLine();\n        string cLine = Console.ReadLine();\n        if (s != null && cLine != null && cLine.Length > 0) {\n            Console.WriteLine(CharFreq(s, cLine[0]));\n        }\n    }\n}",
      go: "package main\n\nimport (\n    \"fmt\"\n    \"bufio\"\n    \"os\"\n)\n\nfunc charFreq(s string, c byte) int {\n    // TODO: Return frequency of character 'c' in string 's'\n    return 0\n}\n\nfunc main() {\n    reader := bufio.NewReader(os.Stdin)\n    s, _ := reader.ReadString('\\n')\n    cLine, _ := reader.ReadString('\\n')\n    if len(cLine) > 0 {\n        fmt.Println(charFreq(s, cLine[0]))\n    }\n}",
      rust: "use std::io::{self, BufRead};\n\nfn char_freq(s: &str, c: char) -> usize {\n    // TODO: Return frequency of character 'c' in string 's'\n    0\n}\n\nfn main() {\n    let stdin = io::stdin();\n    let mut lines = stdin.lock().lines();\n    if let Some(Ok(s)) = lines.next() {\n        if let Some(Ok(c_line)) = lines.next() {\n            if let Some(c) = c_line.chars().next() {\n                println!(\"{}\", char_freq(&s, c));\n            }\n        }\n    }\n}"
    },
    hiddenTestCases: [
      { input: "aaaaa\na", output: "5" }, { input: "abcde\nz", output: "0" }, { input: "  \n ", output: "2" }, { input: "AbcA\nA", output: "1" }, { input: "112233\n1", output: "2" }, { input: "Protocol Node\no", output: "3" }, { input: "X\nX", output: "1" }, { input: "apple\np", output: "2" }, { input: "banana\na", output: "3" }, { input: "mississippi\ns", output: "4" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-easy-08",
    title: "Unique Element Filter",
    description: "Database de-duplication is a key architectural requirement. Given a **sorted** array of integers, count the number of unique elements. Each unique element should be counted only once.",
    difficulty: "Easy",
    category: "Arrays",
    topic: "DATA STRUCTURES",
    estimatedTime: "10 mins",
    company: "TCS",
    tags: ["Arrays", "De-duplication"],
    inputFormat: "Line 1: Integer N.\nLine 2: N sorted integers.",
    outputFormat: "The number of unique elements.",
    constraints: ["- 1 <= N <= 10^5", "- Array is sorted in non-decreasing order."],
    sampleInput: "5\n1 1 2 2 3",
    sampleOutput: "3",
    explanation: "Unique elements are 1, 2, 3. Count is 3.",
    functionInfo: { name: "countUnique(n, arr)", params: "n: int, arr: int[]", returnType: "int", goal: "Count unique elements in sorted array." },
    walkthrough: { input: "5, [1,1,2,2,3]", received: "arr=[1,1,2,2,3]", expected: "3", output: "3" },
    starterCode: {
      python: "import sys\n\ndef count_unique(n, arr):\n    # TODO: Count unique elements in a sorted array\n    return 0\n\nif __name__ == '__main__':\n    data = sys.stdin.read().split()\n    if len(data) >= 1:\n        n = int(data[0])\n        arr = [int(x) for x in data[1:n+1]]\n        print(count_unique(n, arr))",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static int countUnique(int n, int[] arr) {\n        // TODO: Count unique elements in a sorted array\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] arr = new int[n];\n            for (int i = 0; i < n; i++) {\n                if (sc.hasNextInt()) arr[i] = sc.nextInt();\n            }\n            System.out.println(countUnique(n, arr));\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nint countUnique(int n, vector<int>& a) {\n    // TODO: Count unique elements in a sorted array\n    return 0;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i];\n        cout << countUnique(n, a) << endl;\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction countUnique(n, arr) {\n    // TODO: Count unique elements in a sorted array\n    return 0;\n}\n\nconst tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (tokens.length > 1) {\n    const n = parseInt(tokens[0]);\n    const arr = tokens.slice(1, n + 1).filter(x => x !== '').map(Number);\n    console.log(countUnique(n, arr));\n}",
      c: "#include <stdio.h>\n\nint countUnique(int n, int* arr) {\n    // TODO: Count unique elements in a sorted array\n    return 0;\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != EOF) {\n        int a[100001];\n        for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n        printf(\"%d\\n\", countUnique(n, a));\n    }\n    return 0;\n}",
      csharp: "using System;\n\nclass Program {\n    static int CountUnique(int n, int[] arr) {\n        // TODO: Count unique elements in a sorted array\n        return 0;\n    }\n\n    static void Main() {\n        string l1 = Console.ReadLine();\n        if (l1 != null) {\n            int n = int.Parse(l1);\n            string l2 = Console.ReadLine();\n            if (l2 != null) {\n                int[] arr = Array.ConvertAll(l2.Split(' ', StringSplitOptions.RemoveEmptyEntries), int.Parse);\n                Console.WriteLine(CountUnique(n, arr));\n            }\n        }\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc countUnique(n int, arr []int) int {\n    // TODO: Count unique elements in a sorted array\n    return 0\n}\n\nfunc main() {\n    var n int\n    if _, err := fmt.Scan(&n); err == nil {\n        a := make([]int, n)\n        for i := 0; i < n; i++ {\n            fmt.Scan(&a[i])\n        }\n        fmt.Println(countUnique(n, a))\n    }\n}",
      rust: "use std::io::{self, BufRead};\n\nfn count_unique(arr: &[i32]) -> usize {\n    // TODO: Count unique elements in a sorted array\n    0\n}\n\nfn main() {\n    let stdin = io::stdin();\n    let mut lines = stdin.lock().lines();\n    if let Some(Ok(l1)) = lines.next() {\n        if let Ok(n) = l1.trim().parse::<usize>() {\n            if let Some(Ok(l2)) = lines.next() {\n                let a: Vec<i32> = l2.split_whitespace().map(|x| x.parse().unwrap()).collect();\n                println!(\"{}\", count_unique(&a));\n            }\n        }\n    }\n}"
    },
    hiddenTestCases: [
      { input: "1\n10", output: "1" }, { input: "2\n1 1", output: "1" }, { input: "3\n1 2 3", output: "3" }, { input: "6\n1 1 1 2 2 2", output: "2" }, { input: "4\n-1 -1 0 0", output: "2" }, { input: "10\n1 1 1 1 1 1 1 1 1 1", output: "1" }, { input: "5\n0 1 2 3 4", output: "5" }, { input: "2\n-5 -5", output: "1" }, { input: "4\n10 10 20 30", output: "3" }, { input: "3\n100 200 200", output: "2" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-easy-09",
    title: "Matrix Search Node",
    description: "In large-scale data retrieval, locating a specific 'Target' ID is the most common query. Implement a search node that checks if a target integer exists within an array. Return 'FOUND' or 'NOT FOUND'.",
    difficulty: "Easy",
    category: "Arrays",
    topic: "DATA STRUCTURES",
    estimatedTime: "10 mins",
    company: "HCL",
    tags: ["Arrays", "Search"],
    inputFormat: "Line 1: Integer N.\nLine 2: N integers.\nLine 3: Target integer T.",
    outputFormat: "FOUND or NOT FOUND.",
    constraints: ["- 1 <= N <= 10^5", "- -10^9 <= element, T <= 10^9"],
    sampleInput: "4\n1 5 8 12\n8",
    sampleOutput: "FOUND",
    explanation: "8 exists in the array.",
    functionInfo: { name: "search(n, arr, t)", params: "n: int, arr: int[], t: int", returnType: "string", goal: "Find target in array." },
    walkthrough: { input: "[1,2,3], 2", received: "arr=[1,2,3], t=2", expected: "FOUND", output: "FOUND" },
    starterCode: {
      python: "import sys\n\ndef search(n, arr, t):\n    # TODO: Check if 't' exists in 'arr'\n    return \"NOT FOUND\"\n\nif __name__ == '__main__':\n    data = sys.stdin.read().split()\n    if len(data) >= 3:\n        n = int(data[0])\n        arr = [int(x) for x in data[1:n+1]]\n        t = int(data[n+1])\n        print(search(n, arr, t))",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static String search(int n, int[] a, int t) {\n        // TODO: Check if 't' exists in 'a'\n        return \"NOT FOUND\";\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] a = new int[n];\n            for (int i = 0; i < n; i++) {\n                if (sc.hasNextInt()) a[i] = sc.nextInt();\n            }\n            if (sc.hasNextInt()) {\n                int t = sc.nextInt();\n                System.out.println(search(n, a, t));\n            }\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <vector>\n#include <string>\n\nusing namespace std;\n\nstring search(int n, vector<int>& a, int t) {\n    // TODO: Check if 't' exists in 'a'\n    return \"NOT FOUND\";\n}\n\nint main() {\n    int n, t;\n    if (cin >> n) {\n        vector<int> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i];\n        if (cin >> t) {\n            cout << search(n, a, t) << endl;\n        }\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction search(n, a, t) {\n    // TODO: Check if 't' exists in 'a'\n    return \"NOT FOUND\";\n}\n\nconst tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (tokens.length >= 3) {\n    const n = parseInt(tokens[0]);\n    const a = tokens.slice(1, n + 1).filter(x => x !== '').map(Number);\n    const t = parseInt(tokens[n + 1]);\n    console.log(search(n, a, t));\n}",
      c: "#include <stdio.h>\n\nchar* search(int n, int* a, int t) {\n    // TODO: Check if 't' exists in 'a'\n    return \"NOT FOUND\";\n}\n\nint main() {\n    int n, t;\n    if (scanf(\"%d\", &n) != EOF) {\n        int a[100001];\n        for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n        if (scanf(\"%d\", &t) != EOF) {\n            printf(\"%s\\n\", search(n, a, t));\n        }\n    }\n    return 0;\n}",
      csharp: "using System;\nusing System.Linq;\n\nclass Program {\n    static string Search(int n, int[] a, int t) {\n        // TODO: Check if 't' exists in 'a'\n        return \"NOT FOUND\";\n    }\n\n    static void Main() {\n        string l1 = Console.ReadLine();\n        if (l1 != null) {\n            int n = int.Parse(l1);\n            string l2 = Console.ReadLine();\n            if (l2 != null) {\n                int[] a = l2.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n                string l3 = Console.ReadLine();\n                if (l3 != null) {\n                    int t = int.Parse(l3);\n                    Console.WriteLine(Search(n, a, t));\n                }\n            }\n        }\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc search(n int, arr []int, t int) string {\n    // TODO: Check if 't' exists in 'arr'\n    return \"NOT FOUND\"\n}\n\nfunc main() {\n    var n int\n    if _, err := fmt.Scan(&n); err == nil {\n        a := make([]int, n)\n        for i := 0; i < n; i++ {\n            fmt.Scan(&a[i])\n        }\n        var t int\n        fmt.Scan(&t)\n        fmt.Println(search(n, a, t))\n    }\n}",
      rust: "use std::io::{self, BufRead};\n\nfn search(a: &[i32], t: i32) -> String {\n    // TODO: Check if 't' exists in 'a'\n    \"NOT FOUND\".to_string()\n}\n\nfn main() {\n    let stdin = io::stdin();\n    let mut lines = stdin.lock().lines();\n    if let Some(Ok(l1)) = lines.next() {\n        if let Ok(n) = l1.trim().parse::<usize>() {\n            if let Some(Ok(l2)) = lines.next() {\n                let a: Vec<i32> = l2.split_whitespace().map(|x| x.parse().unwrap()).collect();\n                if let Some(Ok(l3)) = lines.next() {\n                    if let Ok(t) = l3.trim().parse::<i32>() {\n                        println!(\"{}\", search(&a, t));\n                    }\n                }\n            }\n        }\n    }\n}"
    },
    hiddenTestCases: [
      { input: "1\n5\n5", output: "FOUND" }, { input: "1\n5\n10", output: "NOT FOUND" }, { input: "5\n1 2 3 4 5\n1", output: "FOUND" }, { input: "5\n1 2 3 4 5\n5", output: "FOUND" }, { input: "3\n-10 -20 -30\n-20", output: "FOUND" }, { input: "4\n10 20 30 40\n25", output: "NOT FOUND" }, { input: "2\n0 100\n0", output: "FOUND" }, { input: "5\n10 10 10 10 10\n10", output: "FOUND" }, { input: "6\n1 3 5 7 9 11\n8", output: "NOT FOUND" }, { input: "3\n12345 67890 0\n0", output: "FOUND" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-easy-10",
    title: "Minimal Distance Finder",
    description: "In geospatial mapping, finding the smallest gap between points is essential. Implement a node that takes an array of integers and finds the minimum absolute difference between any two distinct elements in the array.",
    difficulty: "Easy",
    category: "Arrays",
    topic: "OPTIMIZATION CORE",
    estimatedTime: "10 mins",
    company: "Deloitte",
    tags: ["Arrays", "Sorting", "Optimization"],
    inputFormat: "Line 1: Integer N.\nLine 2: N integers.",
    outputFormat: "A single integer representing the minimum difference.",
    constraints: ["- 2 <= N <= 10^5", "- -10^9 <= element <= 10^9"],
    sampleInput: "4\n1 15 3 9",
    sampleOutput: "2",
    explanation: "Min diff is between 1 and 3: |1-3| = 2.",
    functionInfo: { name: "minDiff(n, arr)", params: "n: int, arr: int[]", returnType: "int", goal: "Find minimum absolute difference." },
    walkthrough: { input: "[1,5,3]", received: "arr=[1,5,3]", expected: "2", output: "2" },
    starterCode: {
      python: "import sys\n\ndef min_diff(n, arr):\n    # TODO: Find the minimum absolute difference between any two elements\n    return 0\n\nif __name__ == '__main__':\n    data = sys.stdin.read().split()\n    if len(data) >= 1:\n        n = int(data[0])\n        arr = [int(x) for x in data[1:n+1]]\n        print(min_diff(n, arr))",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static long minDiff(int n, long[] a) {\n        // TODO: Find the minimum absolute difference between any two elements\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            long[] a = new long[n];\n            for (int i = 0; i < n; i++) {\n                if (sc.hasNextLong()) a[i] = sc.nextLong();\n            }\n            System.out.println(minDiff(n, a));\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nlong long minDiff(int n, vector<long long>& a) {\n    // TODO: Find the minimum absolute difference between any two elements\n    return 0;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<long long> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i];\n        cout << minDiff(n, a) << endl;\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction minDiff(n, a) {\n    // TODO: Find the minimum absolute difference between any two elements\n    return 0;\n}\n\nconst tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (tokens.length > 1) {\n    const n = parseInt(tokens[0]);\n    const a = tokens.slice(1, n + 1).filter(x => x !== '').map(Number);\n    console.log(minDiff(n, a));\n}",
      c: "#include <stdio.h>\n#include <stdlib.h>\n#include <limits.h>\n\nlong long minDiff(int n, int* a) {\n    // TODO: Find the minimum absolute difference between any two elements\n    return 0;\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != EOF) {\n        int a[100001];\n        for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n        printf(\"%lld\\n\", minDiff(n, a));\n    }\n    return 0;\n}",
      csharp: "using System;\nusing System.Linq;\n\nclass Program {\n    static long MinDiff(int n, long[] a) {\n        // TODO: Find the minimum absolute difference between any two elements\n        return 0;\n    }\n\n    static void Main() {\n        string l1 = Console.ReadLine();\n        if (l1 != null) {\n            int n = int.Parse(l1);\n            string l2 = Console.ReadLine();\n            if (l2 != null) {\n                long[] a = l2.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(long.Parse).ToArray();\n                Console.WriteLine(MinDiff(n, a));\n            }\n        }\n    }\n}",
      go: "package main\n\nimport (\n    \"fmt\"\n    \"sort\"\n)\n\nfunc minDiff(n int, arr []int) int {\n    // TODO: Find the minimum absolute difference between any two elements\n    return 0\n}\n\nfunc main() {\n    var n int\n    if _, err := fmt.Scan(&n); err == nil {\n        a := make([]int, n)\n        for i := 0; i < n; i++ {\n            fmt.Scan(&a[i])\n        }\n        fmt.Println(minDiff(n, a))\n    }\n}",
      rust: "use std::io::{self, BufRead};\n\nfn min_diff(a: &mut [i64]) -> i64 {\n    // TODO: Find the minimum absolute difference between any two elements\n    0\n}\n\nfn main() {\n    let stdin = io::stdin();\n    let mut lines = stdin.lock().lines();\n    if let Some(Ok(l1)) = lines.next() {\n        if let Ok(n) = l1.trim().parse::<usize>() {\n            if let Some(Ok(l2)) = lines.next() {\n                let mut a: Vec<i64> = l2.split_whitespace().map(|x| x.parse().unwrap()).collect();\n                println!(\"{}\", min_diff(&mut a));\n            }\n        }\n    }\n}"
    },
    hiddenTestCases: [
      { input: "2\n10 20", output: "10" }, { input: "3\n1 5 10", output: "4" }, { input: "5\n10 10 10 10 10", output: "0" }, { input: "4\n-10 -2 5 8", output: "3" }, { input: "3\n0 100 200", output: "100" }, { input: "6\n1 10 20 30 40 41", output: "1" }, { input: "2\n1000000 0", output: "1000000" }, { input: "4\n5 12 18 20", output: "2" }, { input: "5\n-50 -30 0 10 15", output: "5" }, { input: "3\n10 11 12", output: "1" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-medium-01",
    title: "Target Sum Verification",
    description: "In cryptographic hashing, finding pairs that match a target sum is foundational. Implement a node that takes an array of integers and a target T. Find two integers in the array that sum up to T. Output their indices in ascending order. Each input has exactly one solution.",
    difficulty: "Medium",
    category: "Arrays",
    topic: "DATA STRUCTURES",
    estimatedTime: "20 mins",
    company: "Google",
    tags: ["Arrays", "Hash Map", "Searching"],
    inputFormat: "Line 1: Integer N.\nLine 2: N integers.\nLine 3: Target T.",
    outputFormat: "Two space-separated indices.",
    constraints: ["- 2 <= N <= 10^5", "- -10^9 <= element, T <= 10^9"],
    sampleInput: "4\n2 7 11 15\n9",
    sampleOutput: "0 1",
    explanation: "Find two numbers whose sum equals the target and print their indices.",
    functionInfo: { name: "twoSum(n, arr, t)", params: "n: int, arr: int[], t: int", returnType: "int[]", goal: "Find indices of two numbers that sum to target." },
    walkthrough: { input: "[2,7], 9", received: "arr=[2,7], t=9", expected: "0 1", output: "0 1" },
    starterCode: {
      python: "import sys\n\ndef two_sum(n, arr, t):\n    # TODO: Find indices of two elements that sum to 't'\n    return \"0 0\"\n\nif __name__ == '__main__':\n    data = sys.stdin.read().split()\n    if len(data) >= 3:\n        n = int(data[0])\n        arr = [int(x) for x in data[1:n+1]]\n        t = int(data[n+1])\n        print(two_sum(n, arr, t))",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static void solve(int n, int[] a, int t) {\n        // TODO: Find indices of two elements that sum to 't' and print them separated by space\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] a = new int[n];\n            for (int i = 0; i < n; i++) {\n                if (sc.hasNextInt()) a[i] = sc.nextInt();\n            }\n            if (sc.hasNextInt()) {\n                int t = sc.nextInt();\n                solve(n, a, t);\n            }\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nvoid solve(int n, vector<int>& a, int t) {\n    // TODO: Find indices of two elements that sum to 't' and print them separated by space\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i];\n        int t;\n        if (cin >> t) {\n            solve(n, a, t);\n        }\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction solve(n, a, t) {\n    // TODO: Find indices of two elements that sum to 't' and log them\n}\n\nconst tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (tokens.length >= 3) {\n    const n = parseInt(tokens[0]);\n    const arr = tokens.slice(1, n + 1).filter(x => x !== '').map(Number);\n    const t = parseInt(tokens[n + 1]);\n    solve(n, arr, t);\n}",
      c: "#include <stdio.h>\n\nvoid solve(int n, int* a, int t) {\n    // TODO: Find indices of two elements that sum to 't' and print them\n}\n\nint main() {\n    int n, t;\n    if (scanf(\"%d\", &n) != EOF) {\n        int a[100001];\n        for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n        if (scanf(\"%d\", &t) != EOF) {\n            solve(n, a, t);\n        }\n    }\n    return 0;\n}",
      csharp: "using System;\nusing System.Linq;\n\nclass Program {\n    static void Solve(int n, int[] a, int t) {\n        // TODO: Find indices of two elements that sum to 't' and print them\n    }\n\n    static void Main() {\n        string l1 = Console.ReadLine();\n        if (l1 != null) {\n            int n = int.Parse(l1);\n            string l2 = Console.ReadLine();\n            if (l2 != null) {\n                int[] a = l2.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n                string l3 = Console.ReadLine();\n                if (l3 != null) {\n                    int t = int.Parse(l3);\n                    Solve(n, a, t);\n                }\n            }\n        }\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc solve(n int, arr []int, t int) {\n    // TODO: Find indices of two elements that sum to 't' and print them\n}\n\nfunc main() {\n    var n int\n    if _, err := fmt.Scan(&n); err == nil {\n        a := make([]int, n)\n        for i := 0; i < n; i++ {\n            fmt.Scan(&a[i])\n        }\n        var t int\n        fmt.Scan(&t)\n        solve(n, a, t)\n    }\n}",
      rust: "use std::io::{self, BufRead};\n\nfn solve(a: &[i32], t: i32) {\n    // TODO: Find indices of two elements that sum to 't' and print them\n}\n\nfn main() {\n    let stdin = io::stdin();\n    let mut lines = stdin.lock().lines();\n    if let Some(Ok(l1)) = lines.next() {\n        if let Ok(n) = l1.trim().parse::<usize>() {\n            if let Some(Ok(l2)) = lines.next() {\n                let a: Vec<i32> = l2.split_whitespace().map(|x| x.parse().unwrap()).collect();\n                if let Some(Ok(l3)) = lines.next() {\n                    if let Ok(t) = l3.trim().parse::<i32>() {\n                        solve(&a, t);\n                    }\n                }\n            }\n        }\n    }\n}"
    },
    hiddenTestCases: [
      { input: "2\n1 2\n3", output: "0 1" }, { input: "3\n10 20 30\n50", output: "1 2" }, { input: "5\n-1 -2 -3 -4 -5\n-8", output: "2 4" }, { input: "4\n100 200 300 400\n500", output: "0 3" }, { input: "3\n0 0 0\n0", output: "0 1" }, { input: "6\n1 3 5 7 9 11\n20", output: "4 5" }, { input: "2\n-50 50\n0", output: "0 1" }, { input: "5\n10 15 20 25 30\n45", output: "2 3" }, { input: "4\n5 8 12 18\n20", output: "1 3" }, { input: "3\n1 10 100\n101", output: "1 2" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-medium-02",
    title: "Maximum Flux Subarray",
    description: "In algorithmic trading, identifying the period of maximum growth is essential. Given an array of integers, find the contiguous subarray (containing at least one number) which has the largest sum. This is commonly known as Kadane's algorithm.",
    difficulty: "Medium",
    category: "Arrays",
    topic: "ALGORITHM CORE",
    estimatedTime: "15 mins",
    company: "Amazon",
    tags: ["Arrays", "Dynamic Programming", "Subarray"],
    inputFormat: "Line 1: Integer N.\nLine 2: N space-separated integers.",
    outputFormat: "A single integer representing the maximum sum.",
    constraints: ["- 1 <= N <= 10^5", "- -10^4 <= element <= 10^4"],
    sampleInput: "9\n-2 1 -3 4 -1 2 1 -5 4",
    sampleOutput: "6",
    explanation: "Implement Kadane's algorithm to find the maximum contiguous subarray sum.",
    functionInfo: { name: "maxSubArray(n, arr)", params: "n: int, arr: int[]", returnType: "int", goal: "Find maximum subarray sum." },
    walkthrough: { input: "[1,-2,3]", received: "arr=[1,-2,3]", expected: "3", output: "3" },
    starterCode: {
      python: "import sys\n\ndef max_subarray(n, arr):\n    # TODO: Implement Kadane's algorithm\n    return 0\n\nif __name__ == '__main__':\n    data = sys.stdin.read().split()\n    if len(data) >= 1:\n        n = int(data[0])\n        arr = [int(x) for x in data[1:n+1]]\n        print(max_subarray(n, arr))",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static long maxSubArray(int n, int[] arr) {\n        // TODO: Implement Kadane's algorithm\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] arr = new int[n];\n            for (int i = 0; i < n; i++) {\n                if (sc.hasNextInt()) arr[i] = sc.nextInt();\n            }\n            System.out.println(maxSubArray(n, arr));\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nlong long maxSubArray(int n, vector<int>& a) {\n    // TODO: Implement Kadane's algorithm\n    return 0;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i];\n        cout << maxSubArray(n, a) << endl;\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction maxSubArray(n, a) {\n    // TODO: Implement Kadane's algorithm\n    return 0;\n}\n\nconst tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (tokens.length > 1) {\n    const n = parseInt(tokens[0]);\n    const arr = tokens.slice(1, n + 1).filter(x => x !== '').map(Number);\n    console.log(maxSubArray(n, arr));\n}",
      c: "#include <stdio.h>\n\nlong long maxSubArray(int n, int* arr) {\n    // TODO: Implement Kadane's algorithm\n    return 0;\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != EOF) {\n        int a[100001];\n        for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n        printf(\"%lld\\n\", maxSubArray(n, a));\n    }\n    return 0;\n}",
      csharp: "using System;\n\nclass Program {\n    static long MaxSubArray(int n, int[] arr) {\n        // TODO: Implement Kadane's algorithm\n        return 0;\n    }\n\n    static void Main() {\n        string l1 = Console.ReadLine();\n        if (l1 != null) {\n            int n = int.Parse(l1);\n            string l2 = Console.ReadLine();\n            if (l2 != null) {\n                int[] a = Array.ConvertAll(l2.Split(' ', StringSplitOptions.RemoveEmptyEntries), int.Parse);\n                Console.WriteLine(MaxSubArray(n, a));\n            }\n        }\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc maxSubArray(n int, arr []int) int64 {\n    // TODO: Implement Kadane's algorithm\n    return 0\n}\n\nfunc main() {\n    var n int\n    if _, err := fmt.Scan(&n); err == nil {\n        a := make([]int, n)\n        for i := 0; i < n; i++ {\n            fmt.Scan(&a[i])\n        }\n        fmt.Println(maxSubArray(n, a))\n    }\n}",
      rust: "use std::io::{self, BufRead};\n\nfn max_subarray(a: &[i64]) -> i64 {\n    // TODO: Implement Kadane's algorithm\n    0\n}\n\nfn main() {\n    let stdin = io::stdin();\n    let mut lines = stdin.lock().lines();\n    if let Some(Ok(l1)) = lines.next() {\n        if let Ok(n) = l1.trim().parse::<usize>() {\n            if let Some(Ok(l2)) = lines.next() {\n                let a: Vec<i64> = l2.split_whitespace().map(|x| x.parse().unwrap()).collect();\n                println!(\"{}\", max_subarray(&a));\n            }\n        }\n    }\n}"
    },
    hiddenTestCases: [
      { input: "1\n-5", output: "-5" }, { input: "5\n1 2 3 4 5", output: "15" }, { input: "5\n-1 -2 -3 -4 -5", output: "-1" }, { input: "4\n-1 2 3 -1", output: "5" }, { input: "2\n10 -20", output: "10" }, { input: "6\n-2 1 -3 4 -1 2", output: "6" }, { input: "3\n5 4 -1", output: "9" }, { input: "5\n-10 0 -1 2 1", output: "3" }, { input: "4\n1 2 -5 10", output: "10" }, { input: "10\n1 2 3 4 5 6 7 8 9 10", output: "55" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-medium-03",
    title: "Syntax Integrity Validator",
    description: "In compiler design, ensuring that parentheses are correctly balanced is critical. Implement a validator that takes a string containing only '(', ')', '{', '}', '[' and ']'. Determine if the input string is valid. A string is valid if open brackets are closed by the same type and in the correct order.",
    difficulty: "Medium",
    category: "Strings",
    topic: "ALGORITHM CORE",
    estimatedTime: "15 mins",
    company: "Microsoft",
    tags: ["Strings", "Stack"],
    inputFormat: "A single string S.",
    outputFormat: "YES or NO.",
    constraints: ["- 1 <= |S| <= 10^5"],
    sampleInput: "()[]{}",
    sampleOutput: "YES",
    explanation: "Use a stack-based approach to ensure brackets are closed in the correct order.",
    functionInfo: { name: "isValid(s)", params: "s: string", returnType: "boolean", goal: "Validate bracket balancing." },
    walkthrough: { input: "\"{}\"", received: "s=\"{}\"", expected: "YES", output: "YES" },
    starterCode: {
      python: "import sys\n\ndef is_valid(s):\n    # TODO: Validate bracket balance using a stack\n    return False\n\nif __name__ == '__main__':\n    line = sys.stdin.read().strip()\n    if is_valid(line):\n        print(\"YES\")\n    else:\n        print(\"NO\")",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static boolean isValid(String s) {\n        // TODO: Validate bracket balance using a stack\n        return false;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            if (isValid(s)) {\n                System.out.println(\"YES\");\n            } else {\n                System.out.println(\"NO\");\n            }\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <stack>\n#include <string>\n\nusing namespace std;\n\nbool isValid(string s) {\n    // TODO: Validate bracket balance using a stack\n    return false;\n}\n\nint main() {\n    string s;\n    if (cin >> s) {\n        if (isValid(s)) {\n            cout << \"YES\" << endl;\n        } else {\n            cout << \"NO\" << endl;\n        }\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction isValid(s) {\n    // TODO: Validate bracket balance using a stack\n    return false;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nconsole.log(isValid(input) ? \"YES\" : \"NO\");",
      c: "#include <stdio.h>\n#include <stdbool.h>\n\nbool isValid(char* s) {\n    // TODO: Validate bracket balance using a stack\n    return false;\n}\n\nint main() {\n    char s[100001];\n    if (scanf(\"%s\", s) != EOF) {\n        printf(\"%s\\n\", isValid(s) ? \"YES\" : \"NO\");\n    }\n    return 0;\n}",
      csharp: "using System;\nusing System.Collections.Generic;\n\nclass Program {\n    static bool IsValid(string s) {\n        // TODO: Validate bracket balance using a stack\n        return false;\n    }\n\n    static void Main() {\n        string s = Console.ReadLine();\n        if (s != null) {\n            Console.WriteLine(IsValid(s.Trim()) ? \"YES\" : \"NO\");\n        }\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc isValid(s string) bool {\n    // TODO: Validate bracket balance using a stack\n    return false\n}\n\nfunc main() {\n    var s string\n    fmt.Scan(&s)\n    if isValid(s) {\n        fmt.Println(\"YES\")\n    } else {\n        fmt.Println(\"NO\")\n    }\n}",
      rust: "use std::io::{self, BufRead};\n\nfn is_valid(s: &str) -> bool {\n    // TODO: Validate bracket balance using a stack\n    false\n}\n\nfn main() {\n    let mut line = String::new();\n    if let Ok(_) = io::stdin().lock().read_line(&mut line) {\n        let s = line.trim();\n        println!(\"{}\", if is_valid(s) { \"YES\" } else { \"NO\" });\n    }\n}"
    },
    hiddenTestCases: [
      { input: "()", output: "YES" }, { input: "([)]", output: "NO" }, { input: "{[]}", output: "YES" }, { input: "(", output: "NO" }, { input: ")", output: "NO" }, { input: "{{}}", output: "YES" }, { input: "[", output: "NO" }, { input: "[(())]", output: "YES" }, { input: "((()))", output: "YES" }, { input: "{[()]}", output: "YES" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-medium-04",
    title: "Anagram Signature Audit",
    description: "Detecting identical character distributions is key in pattern recognition. Your mission is to determine if two strings S1 and S2 are anagrams of each other. An anagram is a word or phrase formed by rearranging the letters of another.",
    difficulty: "Medium",
    category: "Strings",
    topic: "ALGORITHM CORE",
    estimatedTime: "15 mins",
    company: "Meta",
    tags: ["Strings", "Hash Map", "Sorting"],
    inputFormat: "Line 1: String S1.\nLine 2: String S2.",
    outputFormat: "YES or NO.",
    constraints: ["- 1 <= |S1|, |S2| <= 10^5"],
    sampleInput: "listen\nsilent",
    sampleOutput: "YES",
    explanation: "Two strings are anagrams if they have the same frequency of every character.",
    functionInfo: { name: "isAnagram(s1, s2)", params: "s1: string, s2: string", returnType: "boolean", goal: "Detect if two strings are anagrams." },
    walkthrough: { input: "\"a\", \"a\"", received: "s1=\"a\", s2=\"a\"", expected: "YES", output: "YES" },
    starterCode: {
      python: "import sys\n\ndef is_anagram(s1, s2):\n    # TODO: Determine if 's1' and 's2' are anagrams\n    return False\n\nif __name__ == '__main__':\n    lines = sys.stdin.read().splitlines()\n    if len(lines) >= 2:\n        if is_anagram(lines[0], lines[1]):\n            print(\"YES\")\n        else:\n            print(\"NO\")",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static boolean isAnagram(String s1, String s2) {\n        // TODO: Determine if 's1' and 's2' are anagrams\n        return false;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s1 = sc.next();\n            if (sc.hasNext()) {\n                String s2 = sc.next();\n                if (isAnagram(s1, s2)) {\n                    System.out.println(\"YES\");\n                } else {\n                    System.out.println(\"NO\");\n                }\n            }\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <string>\n\nusing namespace std;\n\nbool isAnagram(string s1, string s2) {\n    // TODO: Determine if 's1' and 's2' are anagrams\n    return false;\n}\n\nint main() {\n    string s1, s2;\n    if (cin >> s1 >> s2) {\n        if (isAnagram(s1, s2)) {\n            cout << \"YES\" << endl;\n        } else {\n            cout << \"NO\" << endl;\n        }\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction isAnagram(s1, s2) {\n    // TODO: Determine if 's1' and 's2' are anagrams\n    return false;\n}\n\nconst tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (tokens.length >= 2) {\n    console.log(isAnagram(tokens[0], tokens[1]) ? \"YES\" : \"NO\");\n}",
      c: "#include <stdio.h>\n#include <string.h>\n#include <stdbool.h>\n\nbool isAnagram(char* s1, char* s2) {\n    // TODO: Determine if 's1' and 's2' are anagrams\n    return false;\n}\n\nint main() {\n    char s1[100001], s2[100001];\n    if (scanf(\"%s %s\", s1, s2) != EOF) {\n        if (isAnagram(s1, s2)) {\n            printf(\"YES\\n\");\n        } else {\n            printf(\"NO\\n\");\n        }\n    }\n    return 0;\n}",
      csharp: "using System;\n\nclass Program {\n    static bool IsAnagram(string s1, string s2) {\n        // TODO: Determine if 's1' and 's2' are anagrams\n        return false;\n    }\n\n    static void Main() {\n        string s1 = Console.ReadLine();\n        string s2 = Console.ReadLine();\n        if (s1 != null && s2 != null) {\n            if (IsAnagram(s1.Trim(), s2.Trim())) {\n                Console.WriteLine(\"YES\");\n            } else {\n                Console.WriteLine(\"NO\");\n            }\n        }\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc isAnagram(s1, s2 string) bool {\n    // TODO: Determine if 's1' and 's2' are anagrams\n    return false\n}\n\nfunc main() {\n    var s1, s2 string\n    if _, err := fmt.Scan(&s1, &s2); err == nil {\n        if isAnagram(s1, s2) {\n            fmt.Println(\"YES\")\n        } else {\n            fmt.Println(\"NO\")\n        }\n    }\n}",
      rust: "use std::io::{self, BufRead};\n\nfn is_anagram(s1: &str, s2: &str) -> bool {\n    // TODO: Determine if 's1' and 's2' are anagrams\n    false\n}\n\nfn main() {\n    let stdin = io::stdin();\n    let mut lines = stdin.lock().lines();\n    if let Some(Ok(s1)) = lines.next() {\n        if let Some(Ok(s2)) = lines.next() {\n            let res = is_anagram(s1.trim(), s2.trim());\n            println!(\"{}\", if res { \"YES\" } else { \"NO\" });\n        }\n    }\n}"
    },
    hiddenTestCases: [
      { input: "anagram\nnagaram", output: "YES" }, { input: "rat\ncar", output: "NO" }, { input: "a\na", output: "YES" }, { input: "abc\ndef", output: "NO" }, { input: "race\ncare", output: "YES" }, { input: "cinema\niceman", output: "YES" }, { input: "hello\nworld", output: "NO" }, { input: "abcde\nedcba", output: "YES" }, { input: "aaabbb\nbbbaaa", output: "YES" }, { input: "abc\nab", output: "NO" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-medium-05",
    title: "Sorted Matrix Fusion",
    description: "In distributed database joins, merging sorted streams is a frequent operation. You are given two sorted arrays A1 and A2. Merge them into a single sorted array. This is the core logic behind Merge Sort's 'Merge' step.",
    difficulty: "Medium",
    category: "Arrays",
    topic: "DATA STRUCTURES",
    estimatedTime: "15 mins",
    company: "Flipkart",
    tags: ["Arrays", "Two Pointers", "Sorting"],
    inputFormat: "Line 1: N1 (Size of A1).\nLine 2: N1 sorted integers.\nLine 3: N2 (Size of A2).\nLine 4: N2 sorted integers.",
    outputFormat: "Merged space-separated sorted integers.",
    constraints: ["- 1 <= N1, N2 <= 10^5", "- Array elements are sorted."],
    sampleInput: "3\n1 3 5\n2\n2 4",
    sampleOutput: "1 2 3 4 5",
    explanation: "Merge the two sorted arrays into one while maintaining the sorted order.",
    functionInfo: { name: "merge(n1, a1, n2, a2)", params: "n1: int, a1: int[], n2: int, a2: int[]", returnType: "int[]", goal: "Merge two sorted arrays." },
    walkthrough: { input: "[1], [2]", received: "a1=[1], a2=[2]", expected: "1 2", output: "1 2" },
    starterCode: {
      python: "import sys\n\ndef merge(n1, a1, n2, a2):\n    # TODO: Merge two sorted arrays into a new sorted array\n    # Return the merged list\n    return []\n\nif __name__ == '__main__':\n    data = sys.stdin.read().split()\n    if len(data) >= 2:\n        idx = 0\n        n1 = int(data[idx]); idx += 1\n        a1 = [int(x) for x in data[idx:idx+n1]]; idx += n1\n        n2 = int(data[idx]); idx += 1\n        a2 = [int(x) for x in data[idx:idx+n2]]\n        res = merge(n1, a1, n2, a2)\n        print(\" \".join(map(str, res)))",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static void merge(int n1, int[] a1, int n2, int[] a2) {\n        // TODO: Merge and print the combined sorted elements separated by space\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n1 = sc.nextInt();\n            int[] a1 = new int[n1];\n            for (int i = 0; i < n1; i++) if (sc.hasNextInt()) a1[i] = sc.nextInt();\n            if (sc.hasNextInt()) {\n                int n2 = sc.nextInt();\n                int[] a2 = new int[n2];\n                for (int i = 0; i < n2; i++) if (sc.hasNextInt()) a2[i] = sc.nextInt();\n                merge(n1, a1, n2, a2);\n            }\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nvoid mergeSorted(int n1, vector<int>& a1, int n2, vector<int>& a2) {\n    // TODO: Merge and print the combined sorted elements separated by space\n}\n\nint main() {\n    int n1, n2;\n    if (cin >> n1) {\n        vector<int> a1(n1);\n        for (int i = 0; i < n1; i++) cin >> a1[i];\n        if (cin >> n2) {\n            vector<int> a2(n2);\n            for (int i = 0; i < n2; i++) cin >> a2[i];\n            mergeSorted(n1, a1, n2, a2);\n        }\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction merge(n1, a1, n2, a2) {\n    // TODO: Merge two sorted arrays into a new sorted array and return it\n    return [];\n}\n\nconst tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (tokens.length > 1) {\n    let idx = 0;\n    const n1 = parseInt(tokens[idx++]);\n    const a1 = tokens.slice(idx, idx + n1).filter(x => x !== '').map(Number); idx += n1;\n    const n2 = parseInt(tokens[idx++]);\n    const a2 = tokens.slice(idx, idx + n2).filter(x => x !== '').map(Number);\n    console.log(merge(n1, a1, n2, a2).join(' '));\n}",
      c: "#include <stdio.h>\n\nvoid merge(int n1, int* a1, int n2, int* a2) {\n    // TODO: Merge and print the combined sorted elements separated by space\n}\n\nint main() {\n    int n1, n2;\n    if (scanf(\"%d\", &n1) != EOF) {\n        int a1[100001], a2[100001];\n        for (int i = 0; i < n1; i++) scanf(\"%d\", &a1[i]);\n        if (scanf(\"%d\", &n2) != EOF) {\n            for (int i = 0; i < n2; i++) scanf(\"%d\", &a2[i]);\n            merge(n1, a1, n2, a2);\n        }\n    }\n    return 0;\n}",
      csharp: "using System;\nusing System.Collections.Generic;\nusing System.Linq;\n\nclass Program {\n    static void Merge(int[] a1, int[] a2) {\n        // TODO: Merge and print the combined sorted elements separated by space\n    }\n\n    static void Main() {\n        string s1 = Console.ReadLine();\n        if (s1 == null) return;\n        int n1 = int.Parse(s1);\n        int[] a1 = Console.ReadLine().Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n        int n2 = int.Parse(Console.ReadLine());\n        int[] a2 = Console.ReadLine().Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n        Merge(a1, a2);\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc merge(a1, a2 []int) []int {\n    // TODO: Merge two sorted arrays into a new sorted array\n    return []int{}\n}\n\nfunc main() {\n    var n1, n2 int\n    fmt.Scan(&n1)\n    a1 := make([]int, n1); for i := 0; i < n1; i++ { fmt.Scan(&a1[i]) }\n    fmt.Scan(&n2)\n    a2 := make([]int, n2); for i := 0; i < n2; i++ { fmt.Scan(&a2[i]) }\n    res := merge(a1, a2)\n    for i, v := range res {\n        fmt.Print(v)\n        if i < len(res)-1 { fmt.Print(\" \") }\n    }\n    fmt.Println()\n}",
      rust: "use std::io::{self, BufRead};\n\nfn merge(a1: &[i32], a2: &[i32]) -> Vec<i32> {\n    // TODO: Merge two sorted arrays into a new sorted array\n    Vec::new()\n}\n\nfn main() {\n    let stdin = io::stdin();\n    let mut lines = stdin.lock().lines();\n    if let Some(Ok(l1)) = lines.next() {\n        if let Ok(n1) = l1.trim().parse::<usize>() {\n            if let Some(Ok(l2)) = lines.next() {\n                let a1: Vec<i32> = l2.split_whitespace().map(|x| x.parse().unwrap()).collect();\n                if let Some(Ok(l3)) = lines.next() {\n                    if let Ok(n2) = l3.trim().parse::<usize>() {\n                        if let Some(Ok(l4)) = lines.next() {\n                            let a2: Vec<i32> = l4.split_whitespace().map(|x| x.parse().unwrap()).collect();\n                            let res = merge(&a1, &a2);\n                            let output: Vec<String> = res.iter().map(|x| x.to_string()).collect();\n                            println!(\"{}\", output.join(\" \"));\n                        }\n                    }\n                }\n            }\n        }\n    }\n}"
    },
    hiddenTestCases: [
      { input: "1\n1\n1\n2", output: "1 2" }, { input: "3\n10 20 30\n2\n5 15", output: "5 10 15 20 30" }, { input: "2\n1 1\n2\n1 1", output: "1 1 1 1" }, { input: "4\n1 2 3 4\n1\n5", output: "1 2 3 4 5" }, { input: "2\n1 5\n2\n0 10", output: "0 1 5 10" }, { input: "3\n1 2 3\n0\n", output: "1 2 3" }, { input: "0\n\n2\n10 20", output: "10 20" }, { input: "3\n-5 0 5\n3\n-10 1 10", output: "-10 -5 0 1 5 10" }, { input: "5\n1 2 3 4 5\n5\n6 7 8 9 10", output: "1 2 3 4 5 6 7 8 9 10" }, { input: "2\n100 200\n2\n50 150", output: "50 100 150 200" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-medium-06",
    title: "Logarithmic Search Node",
    description: "Binary Search is the gold standard for searching in sorted datasets. Implement an algorithm that searches for a target T in a sorted array A. Return the index of T. If T is not present, return -1.",
    difficulty: "Medium",
    category: "Arrays",
    topic: "ALGORITHM CORE",
    estimatedTime: "15 mins",
    company: "Microsoft",
    tags: ["Arrays", "Binary Search"],
    inputFormat: "Line 1: N.\nLine 2: N sorted integers.\nLine 3: Target T.",
    outputFormat: "Index or -1.",
    constraints: ["- 1 <= N <= 10^5", "- Sorted array.", "- -10^9 <= element, T <= 10^9"],
    sampleInput: "5\n1 2 3 4 5\n4",
    sampleOutput: "3",
    explanation: "Implement an efficient search that runs in logarithmic time.",
    functionInfo: { name: "binarySearch(n, arr, t)", params: "n: int, arr: int[], t: int", returnType: "int", goal: "Implement binary search." },
    walkthrough: { input: "[1,2,3], 3", received: "arr=[1,2,3], t=3", expected: "2", output: "2" },
    starterCode: {
      python: "import sys\n\ndef bin_search(n, arr, t):\n    # TODO: Implement binary search to find 't' in sorted 'arr'\n    return -1\n\nif __name__ == '__main__':\n    data = sys.stdin.read().split()\n    if len(data) >= 3:\n        n = int(data[0])\n        arr = [int(x) for x in data[1:n+1]]\n        t = int(data[n+1])\n        print(bin_search(n, arr, t))",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static int binarySearch(int n, int[] a, int t) {\n        // TODO: Implement binary search to find 't' in sorted 'a'\n        return -1;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] a = new int[n];\n            for (int i = 0; i < n; i++) if (sc.hasNextInt()) a[i] = sc.nextInt();\n            if (sc.hasNextInt()) {\n                int t = sc.nextInt();\n                System.out.println(binarySearch(n, a, t));\n            }\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nint binarySearch(int n, vector<int>& a, int t) {\n    // TODO: Implement binary search to find 't' in sorted 'a'\n    return -1;\n}\n\nint main() {\n    int n, t;\n    if (cin >> n) {\n        vector<int> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i];\n        if (cin >> t) {\n            cout << binarySearch(n, a, t) << endl;\n        }\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction binarySearch(n, a, t) {\n    // TODO: Implement binary search to find 't' in sorted 'a'\n    return -1;\n}\n\nconst tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (tokens.length >= 3) {\n    const n = parseInt(tokens[0]);\n    const arr = tokens.slice(1, n + 1).filter(x => x !== '').map(Number);\n    const t = parseInt(tokens[n + 1]);\n    console.log(binarySearch(n, arr, t));\n}",
      c: "#include <stdio.h>\n\nint binarySearch(int n, int* a, int t) {\n    // TODO: Implement binary search to find 't' in sorted 'a'\n    return -1;\n}\n\nint main() {\n    int n, t;\n    if (scanf(\"%d\", &n) != EOF) {\n        int a[100001];\n        for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n        if (scanf(\"%d\", &t) != EOF) {\n            printf(\"%d\\n\", binarySearch(n, a, t));\n        }\n    }\n    return 0;\n}",
      csharp: "using System;\nusing System.Linq;\n\nclass Program {\n    static int BinarySearch(int n, int[] a, int t) {\n        // TODO: Implement binary search to find 't' in sorted 'a'\n        return -1;\n    }\n\n    static void Main() {\n        string l1 = Console.ReadLine();\n        if (l1 != null) {\n            int n = int.Parse(l1);\n            string l2 = Console.ReadLine();\n            if (l2 != null) {\n                int[] a = l2.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n                string l3 = Console.ReadLine();\n                if (l3 != null) {\n                    int t = int.Parse(l3);\n                    Console.WriteLine(BinarySearch(n, a, t));\n                }\n            }\n        }\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc binarySearch(n int, arr []int, t int) int {\n    // TODO: Implement binary search to find 't' in sorted 'arr'\n    return -1\n}\n\nfunc main() {\n    var n int\n    if _, err := fmt.Scan(&n); err == nil {\n        a := make([]int, n)\n        for i := 0; i < n; i++ {\n            fmt.Scan(&a[i])\n        }\n        var t int\n        fmt.Scan(&t)\n        fmt.Println(binarySearch(n, a, t))\n    }\n}",
      rust: "use std::io::{self, BufRead};\n\nfn binary_search(a: &[i32], t: i32) -> i32 {\n    // TODO: Implement binary search to find 't' in sorted 'a'\n    -1\n}\n\nfn main() {\n    let stdin = io::stdin();\n    let mut lines = stdin.lock().lines();\n    if let Some(Ok(l1)) = lines.next() {\n        if let Ok(n) = l1.trim().parse::<usize>() {\n            if let Some(Ok(l2)) = lines.next() {\n                let a: Vec<i32> = l2.split_whitespace().map(|x| x.parse().unwrap()).collect();\n                if let Some(Ok(l3)) = lines.next() {\n                    if let Ok(t) = l3.trim().parse::<i32>() {\n                        println!(\"{}\", binary_search(&a, t));\n                    }\n                }\n            }\n        }\n    }\n}"
    },
    hiddenTestCases: [
      { input: "1\n10\n10", output: "0" }, { input: "2\n10 20\n10", output: "0" }, { input: "2\n10 20\n20", output: "1" }, { input: "5\n1 3 5 7 9\n5", output: "2" }, { input: "5\n1 3 5 7 9\n10", output: "-1" }, { input: "4\n-10 -5 0 5\n0", output: "2" }, { input: "3\n100 200 300\n150", output: "-1" }, { input: "6\n1 2 3 4 5 6\n1", output: "0" }, { input: "6\n1 2 3 4 5 6\n6", output: "5" }, { input: "3\n-100 -50 0\n-100", output: "0" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-medium-07",
    title: "Window Sum Optimizer",
    description: "Analyzing sliding windows of data is standard in performance monitoring. Implement a node that takes an array and an integer K. Find the maximum sum of any contiguous subarray of size K.",
    difficulty: "Medium",
    category: "Arrays",
    topic: "ALGORITHM CORE",
    estimatedTime: "15 mins",
    company: "Amazon",
    tags: ["Arrays", "Sliding Window"],
    inputFormat: "Line 1: N, K.\nLine 2: N integers.",
    outputFormat: "The maximum sum.",
    constraints: ["- 1 <= K <= N <= 10^5", "- -10^4 <= element <= 10^4"],
    sampleInput: "4 2\n1 2 3 4",
    sampleOutput: "7",
    explanation: "Calculate the sum of every sliding window of size K and return the maximum value.",
    functionInfo: { name: "maxSumK(n, k, arr)", params: "n: int, k: int, arr: int[]", returnType: "long", goal: "Find max sum of subarray size K." },
    walkthrough: { input: "[1,2,3], 2", received: "arr=[1,2,3], k=2", expected: "5", output: "5" },
    starterCode: {
      python: "import sys\n\ndef max_sum_k(n, k, arr):\n    # TODO: Find maximum sum of a contiguous subarray of size 'k'\n    return 0\n\nif __name__ == '__main__':\n    data = sys.stdin.read().split()\n    if len(data) >= 2:\n        n = int(data[0])\n        k = int(data[1])\n        arr = [int(x) for x in data[2:n+2]]\n        print(max_sum_k(n, k, arr))",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static long maxSumK(int n, int k, int[] a) {\n        // TODO: Find maximum sum of a contiguous subarray of size 'k'\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            if (sc.hasNextInt()) {\n                int k = sc.nextInt();\n                int[] a = new int[n];\n                for (int i = 0; i < n; i++) if (sc.hasNextInt()) a[i] = sc.nextInt();\n                System.out.println(maxSumK(n, k, a));\n            }\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nlong long maxSumK(int n, int k, vector<int>& a) {\n    // TODO: Find maximum sum of a contiguous subarray of size 'k'\n    return 0;\n}\n\nint main() {\n    int n, k;\n    if (cin >> n >> k) {\n        vector<int> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i];\n        cout << maxSumK(n, k, a) << endl;\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction maxSumK(n, k, a) {\n    // TODO: Find maximum sum of a contiguous subarray of size 'k'\n    return 0;\n}\n\nconst tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (tokens.length >= 2) {\n    const n = parseInt(tokens[0]);\n    const k = parseInt(tokens[1]);\n    const arr = tokens.slice(2, n + 2).filter(x => x !== '').map(Number);\n    console.log(maxSumK(n, k, arr).toString());\n}",
      c: "#include <stdio.h>\n\nlong long maxSumK(int n, int k, int* a) {\n    // TODO: Find maximum sum of a contiguous subarray of size 'k'\n    return 0;\n}\n\nint main() {\n    int n, k;\n    if (scanf(\"%d %d\", &n, &k) != EOF) {\n        int a[100001];\n        for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n        printf(\"%lld\\n\", maxSumK(n, k, a));\n    }\n    return 0;\n}",
      csharp: "using System;\nusing System.Linq;\n\nclass Program {\n    static long MaxSumK(int n, int k, int[] a) {\n        // TODO: Find maximum sum of a contiguous subarray of size 'k'\n        return 0;\n    }\n\n    static void Main() {\n        string line1 = Console.ReadLine();\n        if (line1 != null) {\n            string[] parts = line1.Split(' ', StringSplitOptions.RemoveEmptyEntries);\n            int n = int.Parse(parts[0]);\n            int k = int.Parse(parts[1]);\n            string line2 = Console.ReadLine();\n            if (line2 != null) {\n                int[] a = line2.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n                Console.WriteLine(MaxSumK(n, k, a));\n            }\n        }\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc maxSumK(n, k int, arr []int) int64 {\n    // TODO: Find maximum sum of a contiguous subarray of size 'k'\n    return 0\n}\n\nfunc main() {\n    var n, k int\n    if _, err := fmt.Scan(&n, &k); err == nil {\n        a := make([]int, n)\n        for i := 0; i < n; i++ {\n            fmt.Scan(&a[i])\n        }\n        fmt.Println(maxSumK(n, k, a))\n    }\n}",
      rust: "use std::io::{self, BufRead};\n\nfn max_sum_k(a: &[i64], k: usize) -> i64 {\n    // TODO: Find maximum sum of a contiguous subarray of size 'k'\n    0\n}\n\nfn main() {\n    let stdin = io::stdin();\n    let mut lines = stdin.lock().lines();\n    if let Some(Ok(l1)) = lines.next() {\n        let v: Vec<usize> = l1.split_whitespace().map(|x| x.parse().unwrap()).collect();\n        let (n, k) = (v[0], v[1]);\n        if let Some(Ok(l2)) = lines.next() {\n            let a: Vec<i64> = l2.split_whitespace().map(|x| x.parse().unwrap()).collect();\n            println!(\"{}\", max_sum_k(&a, k));\n        }\n    }\n}"
    },
    hiddenTestCases: [
      { input: "2 1\n10 20", output: "20" }, { input: "5 3\n1 2 3 4 5", output: "12" }, { input: "3 3\n10 10 10", output: "30" }, { input: "5 2\n-1 -2 -3 -4 -5", output: "-3" }, { input: "4 1\n100 200 300 400", output: "400" }, { input: "6 3\n1 1 1 1 1 1", output: "3" }, { input: "2 2\n-50 50", output: "0" }, { input: "5 4\n1 2 3 4 100", output: "109" }, { input: "4 2\n5 8 1 10", output: "13" }, { input: "10 5\n1 1 1 1 100 1 1 1 1 1", output: "104" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-medium-08",
    title: "Prefix Equilibrium Node",
    description: "Finding the balance point in a dataset is a core statistical operation. Given an array, find the 'Equilibrium Index'. An Equilibrium Index is an index such that the sum of elements at lower indices is equal to the sum of elements at higher indices. Return the first such index. If none exists, return -1.",
    difficulty: "Medium",
    category: "Arrays",
    topic: "ALGORITHM CORE",
    estimatedTime: "15 mins",
    company: "TCS",
    tags: ["Arrays", "Prefix Sum"],
    inputFormat: "Line 1: N.\nLine 2: N integers.",
    outputFormat: "The index or -1.",
    constraints: ["- 1 <= N <= 10^5", "- -10^5 <= element <= 10^5"],
    sampleInput: "3\n1 2 1",
    sampleOutput: "1",
    explanation: "The pivot point where the left-side sum equals the right-side sum.",
    functionInfo: { name: "findEquilibrium(n, arr)", params: "n: int, arr: int[]", returnType: "int", goal: "Find pivot index." },
    walkthrough: { input: "[1,7,3,6,5,6]", received: "arr=[1,7,3,6,5,6]", expected: "3", output: "3" },
    starterCode: {
      python: "import sys\n\ndef find_equilibrium(n, arr):\n    # TODO: Find the equilibrium index (sum left == sum right)\n    return -1\n\nif __name__ == '__main__':\n    data = sys.stdin.read().split()\n    if len(data) >= 1:\n        n = int(data[0])\n        arr = [int(x) for x in data[1:n+1]]\n        print(find_equilibrium(n, arr))",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static int findEquilibrium(int n, int[] a) {\n        // TODO: Find the equilibrium index (sum left == sum right)\n        return -1;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] a = new int[n];\n            for (int i = 0; i < n; i++) if (sc.hasNextInt()) a[i] = sc.nextInt();\n            System.out.println(findEquilibrium(n, a));\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nint findEquilibrium(int n, vector<int>& a) {\n    // TODO: Find the equilibrium index (sum left == sum right)\n    return -1;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i];\n        cout << findEquilibrium(n, a) << endl;\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction findEquilibrium(n, a) {\n    // TODO: Find the equilibrium index (sum left == sum right)\n    return -1;\n}\n\nconst tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (tokens.length > 1) {\n    const n = parseInt(tokens[0]);\n    const arr = tokens.slice(1, n + 1).filter(x => x !== '').map(Number);\n    console.log(findEquilibrium(n, arr));\n}",
      c: "#include <stdio.h>\n\nint findEquilibrium(int n, int* a) {\n    // TODO: Find the equilibrium index (sum left == sum right)\n    return -1;\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != EOF) {\n        int a[100001];\n        for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n        printf(\"%d\\n\", findEquilibrium(n, a));\n    }\n    return 0;\n}",
      csharp: "using System;\nusing System.Linq;\n\nclass Program {\n    static int FindEquilibrium(int n, int[] a) {\n        // TODO: Find the equilibrium index (sum left == sum right)\n        return -1;\n    }\n\n    static void Main() {\n        string l1 = Console.ReadLine();\n        if (l1 != null) {\n            int n = int.Parse(l1);\n            string l2 = Console.ReadLine();\n            if (l2 != null) {\n                int[] a = l2.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n                Console.WriteLine(FindEquilibrium(n, a));\n            }\n        }\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc findEquilibrium(n int, arr []int) int {\n    // TODO: Find the equilibrium index (sum left == sum right)\n    return -1\n}\n\nfunc main() {\n    var n int\n    if _, err := fmt.Scan(&n); err == nil {\n        a := make([]int, n)\n        for i := 0; i < n; i++ {\n            fmt.Scan(&a[i])\n        }\n        fmt.Println(findEquilibrium(n, a))\n    }\n}",
      rust: "use std::io::{self, BufRead};\n\nfn find_equilibrium(a: &[i32]) -> i32 {\n    // TODO: Find the equilibrium index (sum left == sum right)\n    -1\n}\n\nfn main() {\n    let stdin = io::stdin();\n    let mut lines = stdin.lock().lines();\n    if let Some(Ok(l1)) = lines.next() {\n        if let Ok(n) = l1.trim().parse::<usize>() {\n            if let Some(Ok(l2)) = lines.next() {\n                let a: Vec<i32> = l2.split_whitespace().map(|x| x.parse().unwrap()).collect();\n                println!(\"{}\", find_equilibrium(&a));\n            }\n        }\n    }\n}"
    },
    hiddenTestCases: [
      { input: "1\n5", output: "0" }, { input: "2\n1 2", output: "-1" }, { input: "5\n1 7 3 6 5", output: "-1" }, { input: "6\n1 7 3 6 5 6", output: "3" }, { input: "3\n1 0 -1", output: "1" }, { input: "4\n1 1 1 1", output: "-1" }, { input: "5\n0 0 0 0 0", output: "0" }, { input: "3\n-1 0 1", output: "1" }, { input: "5\n10 -10 5 2 3", output: "2" }, { input: "2\n0 0", output: "0" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-medium-09",
    title: "Array Cycle Shifter",
    description: "Rotating datasets is essential in circular buffer management. Given an array A and an integer K, rotate the array to the right by K steps, where K is non-negative.",
    difficulty: "Medium",
    category: "Arrays",
    topic: "ALGORITHM CORE",
    estimatedTime: "15 mins",
    company: "Accenture",
    tags: ["Arrays", "Manipulation"],
    inputFormat: "Line 1: N, K.\nLine 2: N integers.",
    outputFormat: "Space-separated rotated array integers.",
    constraints: ["- 1 <= N <= 10^5", "- 0 <= K <= 10^9"],
    sampleInput: "3 1\n1 2 3",
    sampleOutput: "3 1 2",
    explanation: "Move every element K positions to the right, wrapping around to the beginning.",
    functionInfo: { name: "rotate(n, k, arr)", params: "n: int, k: int, arr: int[]", returnType: "int[]", goal: "Rotate array by K positions." },
    walkthrough: { input: "[1,2], 1", received: "arr=[1,2], k=1", expected: "2 1", output: "2 1" },
    starterCode: {
      python: "import sys\n\ndef rotate(n, k, arr):\n    # TODO: Rotate array 'arr' to the right by 'k' steps\n    # Return the rotated list\n    return []\n\nif __name__ == '__main__':\n    data = sys.stdin.read().split()\n    if len(data) >= 2:\n        n = int(data[0])\n        k = int(data[1])\n        arr = [int(x) for x in data[2:n+2]]\n        res = rotate(n, k, arr)\n        print(\" \".join(map(str, res)))",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static void rotate(int n, int k, int[] a) {\n        // TODO: Rotate array 'a' to the right by 'k' steps and print separated by space\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            if (sc.hasNextInt()) {\n                int k = sc.nextInt();\n                int[] a = new int[n];\n                for (int i = 0; i < n; i++) if (sc.hasNextInt()) a[i] = sc.nextInt();\n                rotate(n, k, a);\n            }\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nvoid rotateArray(int n, int k, vector<int>& a) {\n    // TODO: Rotate array 'a' to the right by 'k' steps and print separated by space\n}\n\nint main() {\n    int n, k;\n    if (cin >> n >> k) {\n        vector<int> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i];\n        rotateArray(n, k, a);\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction rotateArray(n, k, a) {\n    // TODO: Rotate array 'a' to the right by 'k' steps and return it as array\n    return [];\n}\n\nconst tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (tokens.length >= 2) {\n    const n = parseInt(tokens[0]);\n    const k = parseInt(tokens[1]);\n    const arr = tokens.slice(2, n + 2).filter(x => x !== '').map(Number);\n    console.log(rotateArray(n, k, arr).join(' '));\n}",
      c: "#include <stdio.h>\n\nvoid rotateArray(int n, int k, int* a) {\n    // TODO: Rotate array 'a' to the right by 'k' steps and print separated by space\n}\n\nint main() {\n    int n, k;\n    if (scanf(\"%d %d\", &n, &k) != EOF) {\n        int a[100001];\n        for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n        rotateArray(n, k, a);\n    }\n    return 0;\n}",
      csharp: "using System;\nusing System.Linq;\n\nclass Program {\n    static void Rotate(int n, int k, int[] a) {\n        // TODO: Rotate array 'a' to the right by 'k' steps and print separated by space\n    }\n\n    static void Main() {\n        string line1 = Console.ReadLine();\n        if (line1 != null) {\n            string[] parts = line1.Split(' ', StringSplitOptions.RemoveEmptyEntries);\n            int n = int.Parse(parts[0]);\n            int k = int.Parse(parts[1]);\n            string line2 = Console.ReadLine();\n            if (line2 != null) {\n                int[] a = line2.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n                Rotate(n, k, a);\n            }\n        }\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc rotate(n, k int, arr []int) []int {\n    // TODO: Rotate array 'arr' to the right by 'k' steps\n    return []int{}\n}\n\nfunc main() {\n    var n, k int\n    if _, err := fmt.Scan(&n, &k); err == nil {\n        a := make([]int, n)\n        for i := 0; i < n; i++ {\n            fmt.Scan(&a[i])\n        }\n        res := rotate(n, k, a)\n        for i, v := range res {\n            fmt.Print(v)\n            if i < len(res)-1 { fmt.Print(\" \") }\n        }\n        fmt.Println()\n    }\n}",
      rust: "use std::io::{self, BufRead};\n\nfn rotate(a: &[i32], k: usize) -> Vec<i32> {\n    // TODO: Rotate array 'a' to the right by 'k' steps\n    Vec::new()\n}\n\nfn main() {\n    let stdin = io::stdin();\n    let mut lines = stdin.lock().lines();\n    if let Some(Ok(l1)) = lines.next() {\n        let v: Vec<usize> = l1.split_whitespace().map(|x| x.parse().unwrap()).collect();\n        let (n, k) = (v[0], v[1]);\n        if let Some(Ok(l2)) = lines.next() {\n            let a: Vec<i32> = l2.split_whitespace().map(|x| x.parse().unwrap()).collect();\n            let res = rotate(&a, k);\n            let output: Vec<String> = res.iter().map(|x| x.to_string()).collect();\n            println!(\"{}\", output.join(\" \"));\n        }\n    }\n}"
    },
    hiddenTestCases: [
      { input: "2 1\n1 2", output: "2 1" }, { input: "5 2\n1 2 3 4 5", output: "4 5 1 2 3" }, { input: "3 0\n10 20 30", output: "10 20 30" }, { input: "4 4\n1 2 3 4", output: "1 2 3 4" }, { input: "5 10\n1 2 3 4 5", output: "1 2 3 4 5" }, { input: "2 3\n5 10", output: "10 5" }, { input: "6 1\n1 2 3 4 5 6", output: "6 1 2 3 4 5" }, { input: "4 2\n-1 -2 -3 -4", output: "-3 -4 -1 -2" }, { input: "3 5\n10 20 30", output: "20 30 10" }, { input: "1 100\n5", output: "5" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-medium-10",
    title: "Unique Subsequence Auditor",
    description: "In network stream processing, detecting unique patterns is essential. Given a string S, find the length of the longest substring without repeating characters.",
    difficulty: "Medium",
    category: "Strings",
    topic: "ALGORITHM CORE",
    estimatedTime: "20 mins",
    company: "Google",
    tags: ["Strings", "Sliding Window", "Hash Map"],
    inputFormat: "A single string S.",
    outputFormat: "The integer length.",
    constraints: ["- 1 <= |S| <= 10^5"],
    sampleInput: "abcabcbb",
    sampleOutput: "3",
    explanation: "Find the longest part of the string that contains no duplicate letters.",
    functionInfo: { name: "longestUniqueSub(s)", params: "s: string", returnType: "int", goal: "Find longest substring without duplicates." },
    walkthrough: { input: "\"bbbbb\"", received: "s=\"bbbbb\"", expected: "1", output: "1" },
    starterCode: {
      python: "import sys\n\ndef longest_unique(s):\n    # TODO: Find length of longest substring without repeating characters\n    return 0\n\nif __name__ == '__main__':\n    line = sys.stdin.read().strip()\n    print(longest_unique(line))",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static int longestUniqueSub(String s) {\n        // TODO: Find length of longest substring without repeating characters\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            System.out.println(longestUniqueSub(sc.nextLine()));\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <string>\n\nusing namespace std;\n\nint longestUniqueSub(string s) {\n    // TODO: Find length of longest substring without repeating characters\n    return 0;\n}\n\nint main() {\n    string s;\n    if (getline(cin, s)) {\n        cout << longestUniqueSub(s) << endl;\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction longestUniqueSub(s) {\n    // TODO: Find length of longest substring without repeating characters\n    return 0;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nconsole.log(longestUniqueSub(input));",
      c: "#include <stdio.h>\n#include <string.h>\n\nint longestUniqueSub(char* s) {\n    // TODO: Find length of longest substring without repeating characters\n    return 0;\n}\n\nint main() {\n    char s[100001];\n    if (fgets(s, 100001, stdin)) {\n        int l = strlen(s);\n        if (l > 0 && s[l - 1] == '\\n') s[--l] = '\\0';\n        printf(\"%d\\n\", longestUniqueSub(s));\n    }\n    return 0;\n}",
      csharp: "using System;\n\nclass Program {\n    static int LongestUniqueSub(string s) {\n        // TODO: Find length of longest substring without repeating characters\n        return 0;\n    }\n\n    static void Main() {\n        string s = Console.ReadLine();\n        Console.WriteLine(LongestUniqueSub(s ?? \"\"));\n    }\n}",
      go: "package main\n\nimport (\n    \"fmt\"\n    \"bufio\"\n    \"os\"\n)\n\nfunc longestUniqueSub(s string) int {\n    // TODO: Find length of longest substring without repeating characters\n    return 0\n}\n\nfunc main() {\n    reader := bufio.NewReader(os.Stdin)\n    s, _ := reader.ReadString('\\n')\n    fmt.Println(longestUniqueSub(s))\n}",
      rust: "use std::io::{self, BufRead};\n\nfn longest_unique_sub(s: &str) -> usize {\n    // TODO: Find length of longest substring without repeating characters\n    0\n}\n\nfn main() {\n    let mut line = String::new();\n    if let Ok(_) = io::stdin().lock().read_line(&mut line) {\n        println!(\"{}\", longest_unique_sub(line.trim()));\n    }\n}"
    },
    hiddenTestCases: [
      { input: "abcabcbb", output: "3" }, { input: "bbbbb", output: "1" }, { input: "pwwkew", output: "3" }, { input: "abcdef", output: "6" }, { input: "a", output: "1" }, { input: "abcbdef", output: "4" }, { input: "12312345", output: "5" }, { input: "dvdf", output: "3" }, { input: " ", output: "1" }, { input: "nexvoro", output: "7" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-hard-01",
    title: "Centric Palindrome Detector",
    description: "In biological sequencing, finding the longest palindromic chain is a primary objective. Given a string S, return the length of the longest palindromic substring in S.",
    difficulty: "Hard",
    category: "Strings",
    topic: "ALGORITHM CORE",
    estimatedTime: "25 mins",
    company: "Google",
    tags: ["Strings", "DP", "Manacher"],
    inputFormat: "A single string S.",
    outputFormat: "The integer length.",
    constraints: ["- 1 <= |S| <= 2000"],
    sampleInput: "babad",
    sampleOutput: "3",
    explanation: "Implement an algorithm to find the longest substring that is also a palindrome.",
    functionInfo: { name: "longestPal(s)", params: "s: string", returnType: "int", goal: "Find longest palindromic substring length." },
    walkthrough: { input: "\"abacaba\"", received: "s=\"abacaba\"", expected: "7", output: "7" },
    starterCode: {
      python: "import sys\n\ndef longest_pal(s):\n    # TODO: Find the length of the longest palindromic substring\n    return 0\n\nif __name__ == '__main__':\n    line = sys.stdin.read().strip()\n    print(longest_pal(line))",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static int longestPal(String s) {\n        // TODO: Find the length of the longest palindromic substring\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            System.out.println(longestPal(sc.nextLine()));\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <string>\n\nusing namespace std;\n\nint longestPal(string s) {\n    // TODO: Find the length of the longest palindromic substring\n    return 0;\n}\n\nint main() {\n    string s;\n    if (getline(cin, s)) {\n        cout << longestPal(s) << endl;\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction longestPal(s) {\n    // TODO: Find the length of the longest palindromic substring\n    return 0;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nconsole.log(longestPal(input));",
      c: "#include <stdio.h>\n#include <string.h>\n\nint longestPal(char* s) {\n    // TODO: Find the length of the longest palindromic substring\n    return 0;\n}\n\nint main() {\n    char s[2001];\n    if (fgets(s, 2001, stdin)) {\n        int l = strlen(s);\n        if (l > 0 && s[l - 1] == '\\n') s[--l] = '\\0';\n        printf(\"%d\\n\", longestPal(s));\n    }\n    return 0;\n}",
      csharp: "using System;\n\nclass Program {\n    static int LongestPal(string s) {\n        // TODO: Find the length of the longest palindromic substring\n        return 0;\n    }\n\n    static void Main() {\n        string s = Console.ReadLine();\n        Console.WriteLine(LongestPal(s ?? \"\"));\n    }\n}",
      go: "package main\n\nimport (\n    \"fmt\"\n    \"bufio\"\n    \"os\"\n)\n\nfunc longestPal(s string) int {\n    // TODO: Find the length of the longest palindromic substring\n    return 0\n}\n\nfunc main() {\n    reader := bufio.NewReader(os.Stdin)\n    s, _ := reader.ReadString('\\n')\n    fmt.Println(longestPal(s))\n}",
      rust: "use std::io::{self, BufRead};\n\nfn longest_pal(s: &str) -> usize {\n    // TODO: Find the length of the longest palindromic substring\n    0\n}\n\nfn main() {\n    let mut line = String::new();\n    if let Ok(_) = io::stdin().lock().read_line(&mut line) {\n        println!(\"{}\", longest_pal(line.trim()));\n    }\n}"
    },
    hiddenTestCases: [
      { input: "aaaaa", output: "5" }, { input: "abccba", output: "6" }, { input: "abcde", output: "1" }, { input: "racecar", output: "7" }, { input: "abbac", output: "4" }, { input: "noon", output: "4" }, { input: "a", output: "1" }, { input: "cbbd", output: "2" }, { input: "abacaba", output: "7" }, { input: "forgeeksskeegfor", output: "10" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-hard-02",
    title: "Temporal Interval Fusion",
    description: "Managing overlapping schedules is a critical feature in calendar applications. Given a collection of intervals, merge all overlapping intervals. Each interval is represented as a pair of integers [start, end].",
    difficulty: "Hard",
    category: "Arrays",
    topic: "ALGORITHM CORE",
    estimatedTime: "25 mins",
    company: "Uber",
    tags: ["Arrays", "Sorting", "Intervals"],
    inputFormat: "Line 1: N.\nFollowing N lines: Two integers start, end.",
    outputFormat: "Each merged interval on a new line.",
    constraints: ["- 1 <= N <= 10^5", "- 0 <= start <= end <= 10^6"],
    sampleInput: "4\n1 3\n2 6\n8 10\n15 18",
    sampleOutput: "1 6\n8 10\n15 18",
    explanation: "Identify intervals that overlap and fuse them into single continuous ranges.",
    functionInfo: { name: "mergeIntervals(n, intervals)", params: "n: int, intervals: int[][]", returnType: "int[][]", goal: "Combine overlapping intervals." },
    walkthrough: { input: "2, [1,5], [2,6]", received: "intv=[[1,5],[2,6]]", expected: "1 6", output: "1 6" },
    starterCode: {
      python: "import sys\n\ndef merge_intervals(n, intervals):\n    # TODO: Merge overlapping intervals and print results line by line\n    # Output each merged interval as \"start end\" on a new line\n    pass\n\nif __name__ == '__main__':\n    data = sys.stdin.read().split()\n    if len(data) >= 1:\n        n = int(data[0])\n        intervals = []\n        for i in range(n):\n            intervals.append([int(data[2*i+1]), int(data[2*i+2])])\n        merge_intervals(n, intervals)",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static void mergeIntervals(int n, int[][] intervals) {\n        // TODO: Merge overlapping intervals and print results line by line\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[][] a = new int[n][2];\n            for (int i = 0; i < n; i++) {\n                if (sc.hasNextInt()) a[i][0] = sc.nextInt();\n                if (sc.hasNextInt()) a[i][1] = sc.nextInt();\n            }\n            mergeIntervals(n, a);\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nvoid mergeIntervals(int n, vector<pair<int, int>>& a) {\n    // TODO: Merge overlapping intervals and print results line by line\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<pair<int, int>> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i].first >> a[i].second;\n        mergeIntervals(n, a);\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction mergeIntervals(n, a) {\n    // TODO: Merge overlapping intervals and log results line by line\n}\n\nconst tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (tokens.length > 1) {\n    const n = parseInt(tokens[0]);\n    const a = [];\n    for (let i = 0; i < n; i++) {\n        a.push([parseInt(tokens[2 * i + 1]), parseInt(tokens[2 * i + 2])]);\n    }\n    mergeIntervals(n, a);\n}",
      c: "#include <stdio.h>\n\nvoid mergeIntervals(int n, int a[][2]) {\n    // TODO: Merge overlapping intervals and print results line by line\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != EOF) {\n        int a[100001][2];\n        for (int i = 0; i < n; i++) scanf(\"%d %d\", &a[i][0], &a[i][1]);\n        mergeIntervals(n, a);\n    }\n    return 0;\n}",
      csharp: "using System;\nusing System.Collections.Generic;\nusing System.Linq;\n\nclass Program {\n    static void MergeIntervals(int n, int[][] a) {\n        // TODO: Merge overlapping intervals and print results line by line\n    }\n\n    static void Main() {\n        string line = Console.ReadLine();\n        if (line != null) {\n            int n = int.Parse(line);\n            int[][] a = new int[n][];\n            for (int i = 0; i < n; i++) {\n                string row = Console.ReadLine();\n                if (row != null) {\n                    a[i] = row.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n                }\n            }\n            MergeIntervals(n, a);\n        }\n    }\n}",
      go: "package main\n\nimport (\n    \"fmt\"\n    \"sort\"\n)\n\nfunc mergeIntervals(n int, a [][]int) {\n    // TODO: Merge overlapping intervals and print results line by line\n}\n\nfunc main() {\n    var n int\n    if _, err := fmt.Scan(&n); err == nil {\n        a := make([][]int, n)\n        for i := 0; i < n; i++ {\n            a[i] = make([]int, 2)\n            fmt.Scan(&a[i][0], &a[i][1])\n        }\n        mergeIntervals(n, a)\n    }\n}",
      rust: "use std::io::{self, BufRead};\n\nfn merge_intervals(a: Vec<Vec<i32>>) {\n    // TODO: Merge overlapping intervals and print results line by line\n}\n\nfn main() {\n    let stdin = io::stdin();\n    let mut lines = stdin.lock().lines();\n    if let Some(Ok(l1)) = lines.next() {\n        if let Ok(n) = l1.trim().parse::<usize>() {\n            let mut a = Vec::new();\n            for _ in 0..n {\n                if let Some(Ok(ln)) = lines.next() {\n                    let v: Vec<i32> = ln.split_whitespace().map(|x| x.parse().unwrap()).collect();\n                    a.push(v);\n                }\n            }\n            merge_intervals(a);\n        }\n    }\n}"
    },
    hiddenTestCases: [
      { input: "2\n1 4\n4 5", output: "1 5" }, { input: "3\n1 3\n5 7\n10 12", output: "1 3\n5 7\n10 12" }, { input: "1\n10 20", output: "10 20" }, { input: "4\n1 10\n2 3\n4 5\n6 7", output: "1 10" }, { input: "2\n5 8\n1 10", output: "1 10" }, { input: "3\n1 5\n2 4\n3 6", output: "1 6" }, { input: "2\n1 2\n3 4", output: "1 2\n3 4" }, { input: "5\n1 2\n2 3\n3 4\n4 5\n5 6", output: "1 6" }, { input: "2\n1 100\n100 200", output: "1 200" }, { input: "3\n10 15\n15 20\n10 20", output: "10 20" }
    ],
    timeLimit: "2s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-hard-03",
    title: "Frequency Magnitude Audit",
    description: "In social media analytics, identifying trending topics involves finding the most frequent elements. Given an array of integers and an integer K, return the K most frequent elements. The result should be in descending order of frequency.",
    difficulty: "Hard",
    category: "Arrays",
    topic: "ALGORITHM CORE",
    estimatedTime: "25 mins",
    company: "Amazon",
    tags: ["Arrays", "Hash Map", "Sorting"],
    inputFormat: "Line 1: N, K.\nLine 2: N integers.",
    outputFormat: "K space-separated most frequent integers.",
    constraints: ["- 1 <= N <= 10^5", "- 1 <= K <= number of unique elements"],
    sampleInput: "6 2\n1 1 1 2 2 3",
    sampleOutput: "1 2",
    explanation: "Count the occurrence of each integer and return the K elements with the highest counts.",
    functionInfo: { name: "topK(n, k, arr)", params: "n: int, k: int, arr: int[]", returnType: "int[]", goal: "Find K most frequent elements." },
    walkthrough: { input: "[1,1,2], 1", received: "arr=[1,1,2], k=1", expected: "1", output: "1" },
    starterCode: {
      python: "import sys\n\ndef top_k(n, k, arr):\n    # TODO: Find K most frequent elements and return the list\n    return []\n\nif __name__ == '__main__':\n    data = sys.stdin.read().split()\n    if len(data) >= 2:\n        n = int(data[0])\n        k = int(data[1])\n        arr = [int(x) for x in data[2:n+2]]\n        res = top_k(n, k, arr)\n        print(\" \".join(map(str, res)))",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static void topK(int n, int k, int[] arr) {\n        // TODO: Find and print K most frequent elements separated by space\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            if (sc.hasNextInt()) {\n                int k = sc.nextInt();\n                int[] arr = new int[n];\n                for (int i = 0; i < n; i++) if (sc.hasNextInt()) arr[i] = sc.nextInt();\n                topK(n, k, arr);\n            }\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nvoid topK(int n, int k, vector<int>& a) {\n    // TODO: Find and print K most frequent elements separated by space\n}\n\nint main() {\n    int n, k;\n    if (cin >> n >> k) {\n        vector<int> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i];\n        topK(n, k, a);\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction topK(n, k, a) {\n    // TODO: Find K most frequent elements and return them as an array\n    return [];\n}\n\nconst tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (tokens.length >= 2) {\n    const n = parseInt(tokens[0]);\n    const k = parseInt(tokens[1]);\n    const arr = tokens.slice(2, n + 2).filter(x => x !== '').map(Number);\n    console.log(topK(n, k, arr).join(' '));\n}",
      c: "#include <stdio.h>\n\nvoid topK(int n, int k, int* a) {\n    // TODO: Find and print K most frequent elements separated by space\n}\n\nint main() {\n    int n, k;\n    if (scanf(\"%d %d\", &n, &k) != EOF) {\n        int a[100001];\n        for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n        topK(n, k, a);\n    }\n    return 0;\n}",
      csharp: "using System;\nusing System.Collections.Generic;\nusing System.Linq;\n\nclass Program {\n    static void TopK(int n, int k, int[] a) {\n        // TODO: Find and print K most frequent elements separated by space\n    }\n\n    static void Main() {\n        string line1 = Console.ReadLine();\n        if (line1 != null) {\n            string[] parts = line1.Split(' ', StringSplitOptions.RemoveEmptyEntries);\n            int n = int.Parse(parts[0]);\n            int k = int.Parse(parts[1]);\n            string line2 = Console.ReadLine();\n            if (line2 != null) {\n                int[] a = line2.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n                TopK(n, k, a);\n            }\n        }\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc topK(n, k int, arr []int) []int {\n    // TODO: Find K most frequent elements\n    return []int{}\n}\n\nfunc main() {\n    var n, k int\n    if _, err := fmt.Scan(&n, &k); err == nil {\n        a := make([]int, n)\n        for i := 0; i < n; i++ {\n            fmt.Scan(&a[i])\n        }\n        res := topK(n, k, a)\n        for i, v := range res {\n            fmt.Print(v)\n            if i < len(res)-1 { fmt.Print(\" \") }\n        }\n        fmt.Println()\n    }\n}",
      rust: "use std::io::{self, BufRead};\n\nfn top_k(a: &[i32], k: usize) -> Vec<i32> {\n    // TODO: Find K most frequent elements\n    Vec::new()\n}\n\nfn main() {\n    let stdin = io::stdin();\n    let mut lines = stdin.lock().lines();\n    if let Some(Ok(l1)) = lines.next() {\n        let v: Vec<usize> = l1.split_whitespace().map(|x| x.parse().unwrap()).collect();\n        let (n, k) = (v[0], v[1]);\n        if let Some(Ok(l2)) = lines.next() {\n            let a: Vec<i32> = l2.split_whitespace().map(|x| x.parse().unwrap()).collect();\n            let res = top_k(&a, k);\n            let output: Vec<String> = res.iter().map(|x| x.to_string()).collect();\n            println!(\"{}\", output.join(\" \"));\n        }\n    }\n}"
    },
    hiddenTestCases: [
      { input: "1 1\n5", output: "5" }, { input: "4 2\n1 2 1 2", output: "1 2" }, { input: "3 1\n1 2 2", output: "2" }, { input: "5 2\n1 1 1 1 5", output: "1 5" }, { input: "7 3\n1 2 3 1 2 1 0", output: "1 2 3" }, { input: "4 1\n10 10 10 10", output: "10" }, { input: "5 1\n1 2 3 4 5", output: "1" }, { input: "6 2\n1 2 3 1 2 3", output: "1 2" }, { input: "2 1\n100 200", output: "100" }, { input: "10 2\n1 1 1 2 2 2 3 3 4 5", output: "1 2" }
    ],
    timeLimit: "2s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-hard-04",
    title: "Boundary Substring Anchor",
    description: "In genomic research, finding the smallest window that contains all specific markers is vital. Given two strings S and T, return the length of the minimum window substring of S such that every character in T (including duplicates) is included in the window.",
    difficulty: "Hard",
    category: "Strings",
    topic: "ALGORITHM CORE",
    estimatedTime: "30 mins",
    company: "Google",
    tags: ["Strings", "Sliding Window", "Hash Map"],
    inputFormat: "Line 1: String S.\nLine 2: String T.",
    outputFormat: "The integer length of the minimum window. If no window exists, return 0.",
    constraints: ["- 1 <= |S|, |T| <= 10^5"],
    sampleInput: "ADOBECODEBANC\nABC",
    sampleOutput: "4",
    explanation: "Find the smallest contiguous sequence in S that contains all the letters in T.",
    functionInfo: { name: "minWindow(s, t)", params: "s: string, t: string", returnType: "int", goal: "Find min window substring length." },
    walkthrough: { input: "\"a\", \"a\"", received: "s=\"a\", t=\"a\"", expected: "1", output: "1" },
    starterCode: {
      python: "import sys\n\ndef min_window(s, t):\n    # TODO: Find length of the smallest window in 's' containing all characters of 't'\n    return 0\n\nif __name__ == '__main__':\n    lines = sys.stdin.read().splitlines()\n    if len(lines) >= 2:\n        print(min_window(lines[0], lines[1]))",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static int minWindow(String s, String t) {\n        // TODO: Find length of the smallest window in 's' containing all characters of 't'\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            String s = sc.nextLine();\n            if (sc.hasNextLine()) {\n                String t = sc.nextLine();\n                System.out.println(minWindow(s, t));\n            }\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <string>\n\nusing namespace std;\n\nint minWindow(string s, string t) {\n    // TODO: Find length of the smallest window in 's' containing all characters of 't'\n    return 0;\n}\n\nint main() {\n    string s, t;\n    if (cin >> s >> t) {\n        cout << minWindow(s, t) << endl;\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction minWindow(s, t) {\n    // TODO: Find length of the smallest window in 's' containing all characters of 't'\n    return 0;\n}\n\nconst tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (tokens.length >= 2) {\n    console.log(minWindow(tokens[0], tokens[1]));\n}",
      c: "#include <stdio.h>\n#include <string.h>\n\nint minWindow(char* s, char* t) {\n    // TODO: Find length of the smallest window in 's' containing all characters of 't'\n    return 0;\n}\n\nint main() {\n    char s[100001], t[100001];\n    if (scanf(\"%s %s\", s, t) != EOF) {\n        printf(\"%d\\n\", minWindow(s, t));\n    }\n    return 0;\n}",
      csharp: "using System;\n\nclass Program {\n    static int MinWindow(string s, string t) {\n        // TODO: Find length of the smallest window in 's' containing all characters of 't'\n        return 0;\n    }\n\n    static void Main() {\n        string s = Console.ReadLine();\n        string t = Console.ReadLine();\n        if (s != null && t != null) {\n            Console.WriteLine(MinWindow(s.Trim(), t.Trim()));\n        }\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc minWindow(s, t string) int {\n    // TODO: Find length of the smallest window in 's' containing all characters of 't'\n    return 0\n}\n\nfunc main() {\n    var s, t string\n    if _, err := fmt.Scan(&s, &t); err == nil {\n        fmt.Println(minWindow(s, t))\n    }\n}",
      rust: "use std::io::{self, BufRead};\n\nfn min_window(s: &str, t: &str) -> usize {\n    // TODO: Find length of the smallest window in 's' containing all characters of 't'\n    0\n}\n\nfn main() {\n    let stdin = io::stdin();\n    let mut lines = stdin.lock().lines();\n    if let Some(Ok(s)) = lines.next() {\n        if let Some(Ok(t)) = lines.next() {\n            println!(\"{}\", min_window(s.trim(), t.trim()));\n        }\n    }\n}"
    },
    hiddenTestCases: [
      { input: "ADOBECODEBANC\nABC", output: "4" }, { input: "a\na", output: "1" }, { input: "a\naa", output: "0" }, { input: "abc\nb", output: "1" }, { input: "aaabbb\nab", output: "2" }, { input: "ab\nd", output: "0" }, { input: "xyz\nxy", output: "2" }, { input: "ABC\nABC", output: "3" }, { input: "aa\naa", output: "2" }, { input: "thisisaverylongstring\nits", output: "4" }
    ],
    timeLimit: "3s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-hard-05",
    title: "Consecutive Sequence Monitor",
    description: "Finding the longest chain of sequential IDs is a common problem in audit logs. Given an unsorted array of integers, find the length of the longest consecutive elements sequence. The algorithm must run in O(n) complexity.",
    difficulty: "Hard",
    category: "Arrays",
    topic: "ALGORITHM CORE",
    estimatedTime: "25 mins",
    company: "Google",
    tags: ["Arrays", "Hash Set", "Logic"],
    inputFormat: "Line 1: Integer N.\nLine 2: N integers.",
    outputFormat: "Length of the longest consecutive sequence.",
    constraints: ["- 1 <= N <= 10^5", "- -10^9 <= element <= 10^9"],
    sampleInput: "6\n100 4 200 1 3 2",
    sampleOutput: "4",
    explanation: "Find the longest sequence of integers that are consecutive (e.g., 1, 2, 3, 4) in the array.",
    functionInfo: { name: "longestConsecutive(n, arr)", params: "n: int, arr: int[]", returnType: "int", goal: "Find longest consecutive chain length." },
    walkthrough: { input: "[10, 5, 11, 6]", received: "arr=[10,5,11,6]", expected: "2", output: "2" },
    starterCode: {
      python: "import sys\n\ndef longest_consecutive(n, arr):\n    # TODO: Find length of the longest consecutive sequence in O(n) time\n    return 0\n\nif __name__ == '__main__':\n    data = sys.stdin.read().split()\n    if len(data) >= 1:\n        n = int(data[0])\n        arr = [int(x) for x in data[1:n+1]]\n        print(longest_consecutive(n, arr))",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static int longestConsecutive(int n, int[] arr) {\n        // TODO: Find length of the longest consecutive sequence in O(n) time\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] a = new int[n];\n            for (int i = 0; i < n; i++) if (sc.hasNextInt()) a[i] = sc.nextInt();\n            System.out.println(longestConsecutive(n, a));\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nint longestConsecutive(int n, vector<int>& a) {\n    // TODO: Find length of the longest consecutive sequence in O(n) time\n    return 0;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i];\n        cout << longestConsecutive(n, a) << endl;\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction longestConsecutive(n, a) {\n    // TODO: Find length of the longest consecutive sequence in O(n) time\n    return 0;\n}\n\nconst tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (tokens.length > 1) {\n    const n = parseInt(tokens[0]);\n    const arr = tokens.slice(1, n + 1).filter(x => x !== '').map(Number);\n    console.log(longestConsecutive(n, arr));\n}",
      c: "#include <stdio.h>\n\nint longestConsecutive(int n, int* arr) {\n    // TODO: Find length of the longest consecutive sequence in O(n) time\n    return 0;\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != EOF) {\n        int a[100001];\n        for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n        printf(\"%d\\n\", longestConsecutive(n, a));\n    }\n    return 0;\n}",
      csharp: "using System;\nusing System.Linq;\n\nclass Program {\n    static int LongestConsecutive(int n, int[] arr) {\n        // TODO: Find length of the longest consecutive sequence in O(n) time\n        return 0;\n    }\n\n    static void Main() {\n        string l1 = Console.ReadLine();\n        if (l1 != null) {\n            int n = int.Parse(l1);\n            string l2 = Console.ReadLine();\n            if (l2 != null) {\n                int[] a = l2.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n                Console.WriteLine(LongestConsecutive(n, a));\n            }\n        }\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc longestConsecutive(n int, arr []int) int {\n    // TODO: Find length of the longest consecutive sequence in O(n) time\n    return 0\n}\n\nfunc main() {\n    var n int\n    if _, err := fmt.Scan(&n); err == nil {\n        a := make([]int, n)\n        for i := 0; i < n; i++ {\n            fmt.Scan(&a[i])\n        }\n        fmt.Println(longestConsecutive(n, a))\n    }\n}",
      rust: "use std::io::{self, BufRead};\n\nfn longest_consecutive(arr: &[i32]) -> usize {\n    // TODO: Find length of the longest consecutive sequence in O(n) time\n    0\n}\n\nfn main() {\n    let stdin = io::stdin();\n    let mut lines = stdin.lock().lines();\n    if let Some(Ok(l1)) = lines.next() {\n        if let Ok(n) = l1.trim().parse::<usize>() {\n            if let Some(Ok(l2)) = lines.next() {\n                let a: Vec<i32> = l2.split_whitespace().map(|x| x.parse().unwrap()).collect();\n                println!(\"{}\", longest_consecutive(&a));\n            }\n        }\n    }\n}"
    },
    hiddenTestCases: [
      { input: "6\n100 4 200 1 3 2", output: "4" }, { input: "1\n5", output: "1" }, { input: "5\n1 1 1 1 1", output: "1" }, { input: "5\n10 20 30 40 50", output: "1" }, { input: "4\n1 2 3 4", output: "4" }, { input: "3\n-1 0 1", output: "3" }, { input: "5\n0 3 7 2 5", output: "1" }, { input: "6\n9 1 4 7 3 -1", output: "1" }, { input: "2\n10 11", output: "2" }, { input: "10\n1 3 5 7 9 2 4 6 8 10", output: "10" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-hard-06",
    title: "Neural Grid Pathfinding",
    description: "In robotics, verifying if a path exists through a grid of obstacles is a standard task. You are given an N x N matrix of 0s (path) and 1s (obstacle). Determine if there is a path from (0,0) to (N-1,N-1). You can move up, down, left, or right.",
    difficulty: "Hard",
    category: "Graphs",
    topic: "ALGORITHM CORE",
    estimatedTime: "25 mins",
    company: "Meta",
    tags: ["Graphs", "DFS", "Matrix"],
    inputFormat: "Line 1: N.\nFollowing N lines: N space-separated integers (0 or 1).",
    outputFormat: "YES or NO.",
    constraints: ["- 1 <= N <= 100"],
    sampleInput: "3\n0 0 1\n1 0 1\n1 0 0",
    sampleOutput: "YES",
    explanation: "Determine if a continuous path of 0s exists between the top-left and bottom-right corners.",
    functionInfo: { name: "hasPath(n, grid)", params: "n: int, grid: int[][]", returnType: "boolean", goal: "Find if exit is reachable from start." },
    walkthrough: { input: "2, [[0,1],[1,0]]", received: "grid=[[0,1],[1,0]]", expected: "NO", output: "NO" },
    starterCode: {
      python: "import sys\n\ndef has_path(n, grid):\n    # TODO: Return True if a path exists from (0,0) to (n-1, n-1)\n    return False\n\nif __name__ == '__main__':\n    data = sys.stdin.read().split()\n    if len(data) >= 1:\n        n = int(data[0])\n        grid = []\n        for i in range(n):\n            row = [int(x) for x in data[1 + i*n : 1 + (i+1)*n]]\n            grid.append(row)\n        if has_path(n, grid):\n            print(\"YES\")\n        else:\n            print(\"NO\")",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static boolean hasPath(int n, int[][] g) {\n        // TODO: Return true if a path exists from (0,0) to (n-1, n-1)\n        return false;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[][] g = new int[n][n];\n            for (int i = 0; i < n; i++) {\n                for (int j = 0; j < n; j++) if (sc.hasNextInt()) g[i][j] = sc.nextInt();\n            }\n            if (hasPath(n, g)) {\n                System.out.println(\"YES\");\n            } else {\n                System.out.println(\"NO\");\n            }\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nbool hasPath(int n, vector<vector<int>>& g) {\n    // TODO: Return true if a path exists from (0,0) to (n-1, n-1)\n    return false;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<vector<int>> g(n, vector<int>(n));\n        for (int i = 0; i < n; i++) {\n            for (int j = 0; j < n; j++) cin >> g[i][j];\n        }\n        if (hasPath(n, g)) {\n            cout << \"YES\" << endl;\n        } else {\n            cout << \"NO\" << endl;\n        }\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction hasPath(n, g) {\n    // TODO: Return true if a path exists from (0,0) to (n-1, n-1)\n    return false;\n}\n\nconst tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (tokens.length > 1) {\n    const n = parseInt(tokens[0]);\n    const g = [];\n    for (let i = 0; i < n; i++) {\n        g.push(tokens.slice(1 + i * n, 1 + (i + 1) * n).map(Number));\n    }\n    console.log(hasPath(n, g) ? \"YES\" : \"NO\");\n}",
      c: "#include <stdio.h>\n#include <stdbool.h>\n\nbool hasPath(int n, int g[][101]) {\n    // TODO: Return true if a path exists from (0,0) to (n-1, n-1)\n    return false;\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != EOF) {\n        int g[101][101];\n        for (int i = 0; i < n; i++) {\n            for (int j = 0; j < n; j++) scanf(\"%d\", &g[i][j]);\n        }\n        printf(\"%s\\n\", hasPath(n, g) ? \"YES\" : \"NO\");\n    }\n    return 0;\n}",
      csharp: "using System;\n\nclass Program {\n    static bool HasPath(int n, int[][] g) {\n        // TODO: Return true if a path exists from (0,0) to (n-1, n-1)\n        return false;\n    }\n\n    static void Main() {\n        string l = Console.ReadLine();\n        if (l != null) {\n            int n = int.Parse(l);\n            int[][] g = new int[n][];\n            for (int i = 0; i < n; i++) {\n                string row = Console.ReadLine();\n                if (row != null) {\n                    g[i] = Array.ConvertAll(row.Split(' ', StringSplitOptions.RemoveEmptyEntries), int.Parse);\n                }\n            }\n            Console.WriteLine(HasPath(n, g) ? \"YES\" : \"NO\");\n        }\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc hasPath(n int, g [][]int) bool {\n    // TODO: Return true if a path exists from (0,0) to (n-1, n-1)\n    return false\n}\n\nfunc main() {\n    var n int\n    if _, err := fmt.Scan(&n); err == nil {\n        g := make([][]int, n)\n        for i := 0; i < n; i++ {\n            g[i] = make([]int, n)\n            for j := 0; j < n; j++ {\n                fmt.Scan(&g[i][j])\n            }\n        }\n        if hasPath(n, g) {\n            fmt.Println(\"YES\")\n        } else {\n            fmt.Println(\"NO\")\n        }\n    }\n}",
      rust: "use std::io::{self, BufRead};\n\nfn has_path(n: usize, g: Vec<Vec<i32>>) -> bool {\n    // TODO: Return true if a path exists from (0,0) to (n-1, n-1)\n    false\n}\n\nfn main() {\n    let stdin = io::stdin();\n    let mut lines = stdin.lock().lines();\n    if let Some(Ok(l1)) = lines.next() {\n        if let Ok(n) = l1.trim().parse::<usize>() {\n            let mut g = Vec::new();\n            for _ in 0..n {\n                if let Some(Ok(ln)) = lines.next() {\n                    let row: Vec<i32> = ln.split_whitespace().map(|x| x.parse().unwrap()).collect();\n                    g.push(row);\n                }\n            }\n            println!(\"{}\", if has_path(n, g) { \"YES\" } else { \"NO\" });\n        }\n    }\n}"
    },
    hiddenTestCases: [
      { input: "3\n0 0 0\n0 0 0\n0 0 0", output: "YES" }, { input: "2\n1 0\n0 0", output: "NO" }, { input: "3\n0 1 0\n1 1 0\n0 0 0", output: "NO" }, { input: "4\n0 0 1 1\n1 0 0 1\n1 1 0 0\n1 1 1 0", output: "YES" }, { input: "2\n0 0\n0 0", output: "YES" }, { input: "5\n0 1 1 1 1\n0 0 0 0 0\n1 1 1 1 0\n0 0 0 0 0\n0 1 1 1 0", output: "YES" }, { input: "3\n0 0 1\n1 0 0\n1 1 0", output: "YES" }, { input: "2\n0 1\n1 0", output: "NO" }, { input: "4\n0 0 0 0\n0 1 1 0\n0 1 1 0\n0 0 0 0", output: "YES" }, { input: "1\n0", output: "YES" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-hard-07",
    title: "Grid Shortest Vector",
    description: "In logistics optimization, calculating the shortest distance through a grid is vital. Given an N x N grid with 0s (path) and 1s (obstacle), return the shortest path length from (0,0) to (N-1,N-1). If no path exists, return -1. Length is the number of cells in the path.",
    difficulty: "Hard",
    category: "Graphs",
    topic: "ALGORITHM CORE",
    estimatedTime: "25 mins",
    company: "Google",
    tags: ["Graphs", "BFS", "Matrix"],
    inputFormat: "Line 1: N.\nFollowing N lines: N integers.",
    outputFormat: "Shortest path length or -1.",
    constraints: ["- 1 <= N <= 100"],
    sampleInput: "3\n0 0 0\n1 1 0\n1 1 0",
    sampleOutput: "5",
    explanation: "Use Breadth-First Search (BFS) to find the minimum number of steps to reach the exit.",
    functionInfo: { name: "shortestPath(n, matrix)", params: "n: int, matrix: int[][]", returnType: "int", goal: "Find BFS distance in matrix." },
    walkthrough: { input: "2, [[0,0],[0,0]]", received: "grid=[[0,0],[0,0]]", expected: "3", output: "3" },
    starterCode: {
      python: "import sys\n\ndef shortest_path(n, grid):\n    # TODO: Find shortest path from (0,0) to (n-1, n-1) using BFS\n    return -1\n\nif __name__ == '__main__':\n    data = sys.stdin.read().split()\n    if len(data) >= 1:\n        n = int(data[0])\n        grid = []\n        for i in range(n):\n            row = [int(x) for x in data[1 + i*n : 1 + (i+1)*n]]\n            grid.append(row)\n        print(shortest_path(n, grid))",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static int shortestPath(int n, int[][] g) {\n        // TODO: Find shortest path from (0,0) to (n-1, n-1) using BFS\n        return -1;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[][] g = new int[n][n];\n            for (int i = 0; i < n; i++) {\n                for (int j = 0; j < n; j++) if (sc.hasNextInt()) g[i][j] = sc.nextInt();\n            }\n            System.out.println(shortestPath(n, g));\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <vector>\n#include <queue>\n\nusing namespace std;\n\nint shortestPath(int n, vector<vector<int>>& g) {\n    // TODO: Find shortest path from (0,0) to (n-1, n-1) using BFS\n    return -1;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<vector<int>> g(n, vector<int>(n));\n        for (int i = 0; i < n; i++) {\n            for (int j = 0; j < n; j++) cin >> g[i][j];\n        }\n        cout << shortestPath(n, g) << endl;\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction shortestPath(n, g) {\n    // TODO: Find shortest path from (0,0) to (n-1, n-1) using BFS\n    return -1;\n}\n\nconst tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (tokens.length > 1) {\n    const n = parseInt(tokens[0]);\n    const g = [];\n    for (let i = 0; i < n; i++) {\n        g.push(tokens.slice(1 + i * n, 1 + (i + 1) * n).map(Number));\n    }\n    console.log(shortestPath(n, g));\n}",
      c: "#include <stdio.h>\n\nint shortestPath(int n, int g[][101]) {\n    // TODO: Find shortest path from (0,0) to (n-1, n-1) using BFS\n    return -1;\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != EOF) {\n        int g[101][101];\n        for (int i = 0; i < n; i++) {\n            for (int j = 0; j < n; j++) scanf(\"%d\", &g[i][j]);\n        }\n        printf(\"%d\\n\", shortestPath(n, g));\n    }\n    return 0;\n}",
      csharp: "using System;\nusing System.Collections.Generic;\n\nclass Program {\n    static int ShortestPath(int n, int[][] g) {\n        // TODO: Find shortest path from (0,0) to (n-1, n-1) using BFS\n        return -1;\n    }\n\n    static void Main() {\n        string l = Console.ReadLine();\n        if (l != null) {\n            int n = int.Parse(l);\n            int[][] g = new int[n][];\n            for (int i = 0; i < n; i++) {\n                string row = Console.ReadLine();\n                if (row != null) {\n                    g[i] = Array.ConvertAll(row.Split(' ', StringSplitOptions.RemoveEmptyEntries), int.Parse);\n                }\n            }\n            Console.WriteLine(ShortestPath(n, g));\n        }\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc shortestPath(n int, g [][]int) int {\n    // TODO: Find shortest path from (0,0) to (n-1, n-1) using BFS\n    return -1\n}\n\nfunc main() {\n    var n int\n    if _, err := fmt.Scan(&n); err == nil {\n        g := make([][]int, n)\n        for i := 0; i < n; i++ {\n            g[i] = make([]int, n)\n            for j := 0; j < n; j++ {\n                fmt.Scan(&g[i][j])\n            }\n        }\n        fmt.Println(shortestPath(n, g))\n    }\n}",
      rust: "use std::io::{self, BufRead};\n\nfn shortest_path(n: usize, g: Vec<Vec<i32>>) -> i32 {\n    // TODO: Find shortest path from (0,0) to (n-1, n-1) using BFS\n    -1\n}\n\nfn main() {\n    let stdin = io::stdin();\n    let mut lines = stdin.lock().lines();\n    if let Some(Ok(l1)) = lines.next() {\n        if let Ok(n) = l1.trim().parse::<usize>() {\n            let mut g = Vec::new();\n            for _ in 0..n {\n                if let Some(Ok(ln)) = lines.next() {\n                    let row: Vec<i32> = ln.split_whitespace().map(|x| x.parse().unwrap()).collect();\n                    g.push(row);\n                }\n            }\n            println!(\"{}\", shortest_path(n, g));\n        }\n    }\n}"
    },
    hiddenTestCases: [
      { input: "3\n0 0 0\n0 0 0\n0 0 0", output: "5" }, { input: "2\n0 1\n0 0", output: "3" }, { input: "3\n0 1 0\n0 1 0\n0 0 0", output: "5" }, { input: "4\n0 0 0 0\n1 1 1 0\n0 0 0 0\n0 1 1 1\n0 0 0 0", output: "7" }, { input: "2\n1 0\n0 0", output: "-1" }, { input: "3\n0 0 1\n1 0 0\n1 1 0", output: "5" }, { input: "5\n0 1 1 1 1\n0 0 0 0 0\n1 1 1 1 0\n0 0 0 0 0\n0 1 1 1 0", output: "13" }, { input: "1\n0", output: "1" }, { input: "2\n0 1\n1 0", output: "-1" }, { input: "4\n0 1 1 1\n0 1 1 1\n0 1 1 1\n0 0 0 0", output: "7" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-hard-08",
    title: "Common Sequence Blueprint",
    description: "In document comparison (diffing), finding common strings is foundational. Given two strings S1 and S2, return the length of their Longest Common Subsequence (LCS). A subsequence is a sequence that appears in the same relative order, but not necessarily contiguously.",
    difficulty: "Hard",
    category: "Strings",
    topic: "ALGORITHM CORE",
    estimatedTime: "25 mins",
    company: "Google",
    tags: ["Strings", "DP"],
    inputFormat: "Line 1: String S1.\nLine 2: String S2.",
    outputFormat: "The length of LCS.",
    constraints: ["- 1 <= |S1|, |S2| <= 1000"],
    sampleInput: "abcde\nace",
    sampleOutput: "3",
    explanation: "Determine the length of the longest subsequence present in both strings using Dynamic Programming.",
    functionInfo: { name: "lcs(s1, s2)", params: "s1: string, s2: string", returnType: "int", goal: "Find length of LCS." },
    walkthrough: { input: "\"abc\", \"abc\"", received: "s1=\"abc\", s2=\"abc\"", expected: "3", output: "3" },
    starterCode: {
      python: "import sys\n\ndef lcs(s1, s2):\n    # TODO: Find the length of the longest common subsequence\n    return 0\n\nif __name__ == '__main__':\n    lines = sys.stdin.read().splitlines()\n    if len(lines) >= 2:\n        print(lcs(lines[0], lines[1]))",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static int lcs(String s1, String s2) {\n        // TODO: Find the length of the longest common subsequence\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s1 = sc.next();\n            if (sc.hasNext()) {\n                String s2 = sc.next();\n                System.out.println(lcs(s1, s2));\n            }\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <string>\n\nusing namespace std;\n\nint lcs(string s1, string s2) {\n    // TODO: Find the length of the longest common subsequence\n    return 0;\n}\n\nint main() {\n    string s1, s2;\n    if (cin >> s1 >> s2) {\n        cout << lcs(s1, s2) << endl;\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction lcs(s1, s2) {\n    // TODO: Find the length of the longest common subsequence\n    return 0;\n}\n\nconst tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (tokens.length >= 2) {\n    console.log(lcs(tokens[0], tokens[1]));\n}",
      c: "#include <stdio.h>\n#include <string.h>\n\nint lcs(char* s1, char* s2) {\n    // TODO: Find the length of the longest common subsequence\n    return 0;\n}\n\nint main() {\n    char s1[1001], s2[1001];\n    if (scanf(\"%s %s\", s1, s2) != EOF) {\n        printf(\"%d\\n\", lcs(s1, s2));\n    }\n    return 0;\n}",
      csharp: "using System;\n\nclass Program {\n    static int Lcs(string s1, string s2) {\n        // TODO: Find the length of the longest common subsequence\n        return 0;\n    }\n\n    static void Main() {\n        string s1 = Console.ReadLine();\n        string s2 = Console.ReadLine();\n        if (s1 != null && s2 != null) {\n            Console.WriteLine(Lcs(s1.Trim(), s2.Trim()));\n        }\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc lcs(s1, s2 string) int {\n    // TODO: Find the length of the longest common subsequence\n    return 0\n}\n\nfunc main() {\n    var s1, s2 string\n    if _, err := fmt.Scan(&s1, &s2); err == nil {\n        fmt.Println(lcs(s1, s2))\n    }\n}",
      rust: "use std::io::{self, BufRead};\n\nfn lcs(s1: &str, s2: &str) -> usize {\n    // TODO: Find the length of the longest common subsequence\n    0\n}\n\nfn main() {\n    let stdin = io::stdin();\n    let mut lines = stdin.lock().lines();\n    if let Some(Ok(s1)) = lines.next() {\n        if let Some(Ok(s2)) = lines.next() {\n            println!(\"{}\", lcs(s1.trim(), s2.trim()));\n        }\n    }\n}"
    },
    hiddenTestCases: [
      { input: "abc\nabc", output: "3" }, { input: "abc\ndef", output: "0" }, { input: "AGGTAB\nGXTXAYB", output: "4" }, { input: "longest\nstone", output: "3" }, { input: "a\na", output: "1" }, { input: "a\nb", output: "0" }, { input: "dynamic\nprogramming", output: "3" }, { input: "apple\npeach", output: "2" }, { input: "hello\nworld", output: "1" }, { input: "abcde\nace", output: "3" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-hard-09",
    title: "Optimal Change Protocol",
    description: "In financial systems, determining the minimum currency nodes for a transaction is a classic optimization problem. Given an array of coin denominations and a total amount, return the fewest number of coins needed to make that amount. If the amount cannot be met, return -1.",
    difficulty: "Hard",
    category: "Arrays",
    topic: "ALGORITHM CORE",
    estimatedTime: "25 mins",
    company: "Goldman Sachs",
    tags: ["Arrays", "DP", "Optimization"],
    inputFormat: "Line 1: N (Number of coin types), T (Target amount).\nLine 2: N coin denominations.",
    outputFormat: "Minimum number of coins or -1.",
    constraints: ["- 1 <= N <= 100", "- 1 <= T <= 10^4", "- 1 <= coin <= 1000"],
    sampleInput: "3 11\n1 2 5",
    sampleOutput: "3",
    explanation: "Calculate the minimum number of coins required to achieve the exact target sum.",
    functionInfo: { name: "coinChange(coins, t)", params: "coins: int[], t: int", returnType: "int", goal: "Minimize coins for target sum." },
    walkthrough: { input: "[1,2,5], 11", received: "coins=[1,2,5], t=11", expected: "3", output: "3" },
    starterCode: {
      python: "import sys\n\ndef coin_change(n, t, coins):\n    # TODO: Find the minimum number of coins needed to make amount 't'\n    return -1\n\nif __name__ == '__main__':\n    data = sys.stdin.read().split()\n    if len(data) >= 2:\n        n = int(data[0])\n        t = int(data[1])\n        coins = [int(x) for x in data[2:n+2]]\n        print(coin_change(n, t, coins))",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static int coinChange(int[] coins, int t) {\n        // TODO: Find the minimum number of coins needed to make amount 't'\n        return -1;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            if (sc.hasNextInt()) {\n                int t = sc.nextInt();\n                int[] coins = new int[n];\n                for (int i = 0; i < n; i++) if (sc.hasNextInt()) coins[i] = sc.nextInt();\n                System.out.println(coinChange(coins, t));\n            }\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nint coinChange(vector<int>& coins, int t) {\n    // TODO: Find the minimum number of coins needed to make amount 't'\n    return -1;\n}\n\nint main() {\n    int n, t;\n    if (cin >> n >> t) {\n        vector<int> coins(n);\n        for (int i = 0; i < n; i++) cin >> coins[i];\n        cout << coinChange(coins, t) << endl;\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction coinChange(coins, t) {\n    // TODO: Find the minimum number of coins needed to make amount 't'\n    return -1;\n}\n\nconst tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (tokens.length >= 2) {\n    const n = parseInt(tokens[0]);\n    const t = parseInt(tokens[1]);\n    const coins = tokens.slice(2, n + 2).filter(x => x !== '').map(Number);\n    console.log(coinChange(coins, t));\n}",
      c: "#include <stdio.h>\n\nint coinChange(int n, int* coins, int t) {\n    // TODO: Find the minimum number of coins needed to make amount 't'\n    return -1;\n}\n\nint main() {\n    int n, t;\n    if (scanf(\"%d %d\", &n, &t) != EOF) {\n        int coins[101];\n        for (int i = 0; i < n; i++) scanf(\"%d\", &coins[i]);\n        printf(\"%d\\n\", coinChange(n, coins, t));\n    }\n    return 0;\n}",
      csharp: "using System;\nusing System.Linq;\n\nclass Program {\n    static int CoinChange(int[] coins, int t) {\n        // TODO: Find the minimum number of coins needed to make amount 't'\n        return -1;\n    }\n\n    static void Main() {\n        string line1 = Console.ReadLine();\n        if (line1 != null) {\n            string[] parts = line1.Split(' ', StringSplitOptions.RemoveEmptyEntries);\n            int n = int.Parse(parts[0]);\n            int t = int.Parse(parts[1]);\n            string line2 = Console.ReadLine();\n            if (line2 != null) {\n                int[] coins = line2.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n                Console.WriteLine(CoinChange(coins, t));\n            }\n        }\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc coinChange(coins []int, t int) int {\n    // TODO: Find the minimum number of coins needed to make amount 't'\n    return -1\n}\n\nfunc main() {\n    var n, t int\n    if _, err := fmt.Scan(&n, &t); err == nil {\n        coins := make([]int, n)\n        for i := 0; i < n; i++ {\n            fmt.Scan(&coins[i])\n        }\n        fmt.Println(coinChange(coins, t))\n    }\n}",
      rust: "use std::io::{self, BufRead};\n\nfn coin_change(coins: &[i32], t: i32) -> i32 {\n    // TODO: Find the minimum number of coins needed to make amount 't'\n    -1\n}\n\nfn main() {\n    let stdin = io::stdin();\n    let mut lines = stdin.lock().lines();\n    if let Some(Ok(l1)) = lines.next() {\n        let v: Vec<i32> = l1.split_whitespace().map(|x| x.parse().unwrap()).collect();\n        let (_n, t) = (v[0], v[1]);\n        if let Some(Ok(l2)) = lines.next() {\n            let coins: Vec<i32> = l2.split_whitespace().map(|x| x.parse().unwrap()).collect();\n            println!(\"{}\", coin_change(&coins, t));\n        }\n    }\n}"
    },
    hiddenTestCases: [
      { input: "1 2\n1", output: "2" }, { input: "1 2\n5", output: "-1" }, { input: "3 11\n1 2 5", output: "3" }, { input: "2 3\n2 1", output: "2" }, { input: "4 10\n1 3 4 5", output: "2" }, { input: "3 0\n1 2 5", output: "0" }, { input: "2 7\n2 3", output: "3" }, { input: "3 6249\n186 419 83", output: "20" }, { input: "2 100\n1 101", output: "100" }, { input: "1 100\n100", output: "1" }
    ],
    timeLimit: "2s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-hard-10",
    title: "Flux Density Capture",
    description: "In civil engineering, calculating water retention in varied terrain is a complex problem. Given N non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining. This is the 'Trapping Rain Water' problem.",
    difficulty: "Hard",
    category: "Arrays",
    topic: "ALGORITHM CORE",
    estimatedTime: "30 mins",
    company: "Google",
    tags: ["Arrays", "Two Pointers", "Dynamic Programming"],
    inputFormat: "Line 1: Integer N.\nLine 2: N elevation heights.",
    outputFormat: "Total water trapped (integer).",
    constraints: ["- 1 <= N <= 10^5", "- 0 <= height <= 10^5"],
    sampleInput: "12\n0 1 0 2 1 0 1 3 2 1 2 1",
    sampleOutput: "6",
    explanation: "Compute the total volume of water trapped between the elevation bars using the two-pointer or DP approach.",
    functionInfo: { name: "trap(n, arr)", params: "n: int, arr: int[]", returnType: "int", goal: "Calculate volume of trapped water." },
    walkthrough: { input: "[4,2,0,3,2,5]", received: "heights=[4,2,0,3,2,5]", expected: "9", output: "9" },
    starterCode: {
      python: "import sys\n\ndef trap(n, arr):\n    # TODO: Calculate how much water can be trapped after rain\n    return 0\n\nif __name__ == '__main__':\n    data = sys.stdin.read().split()\n    if len(data) >= 1:\n        n = int(data[0])\n        arr = [int(x) for x in data[1:n+1]]\n        print(trap(n, arr))",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static long trap(int n, int[] a) {\n        // TODO: Calculate how much water can be trapped after rain\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] a = new int[n];\n            for (int i = 0; i < n; i++) if (sc.hasNextInt()) a[i] = sc.nextInt();\n            System.out.println(trap(n, a));\n        }\n    }\n}",
      cpp: "#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nlong long trap(int n, vector<int>& a) {\n    // TODO: Calculate how much water can be trapped after rain\n    return 0;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i];\n        cout << trap(n, a) << endl;\n    }\n    return 0;\n}",
      javascript: "const fs = require('fs');\n\nfunction trap(n, a) {\n    // TODO: Calculate how much water can be trapped after rain\n    return 0;\n}\n\nconst tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (tokens.length > 1) {\n    const n = parseInt(tokens[0]);\n    const arr = tokens.slice(1, n + 1).filter(x => x !== '').map(Number);\n    console.log(trap(n, arr));\n}",
      c: "#include <stdio.h>\n\nlong long trap(int n, int* a) {\n    // TODO: Calculate how much water can be trapped after rain\n    return 0;\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != EOF) {\n        int a[100001];\n        for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n        printf(\"%lld\\n\", trap(n, a));\n    }\n    return 0;\n}",
      csharp: "using System;\nusing System.Linq;\n\nclass Program {\n    static long Trap(int n, int[] a) {\n        // TODO: Calculate how much water can be trapped after rain\n        return 0;\n    }\n\n    static void Main() {\n        string l1 = Console.ReadLine();\n        if (l1 != null) {\n            int n = int.Parse(l1);\n            string l2 = Console.ReadLine();\n            if (l2 != null) {\n                int[] a = l2.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n                Console.WriteLine(Trap(n, a));\n            }\n        }\n    }\n}",
      go: "package main\n\nimport \"fmt\"\n\nfunc trap(n int, arr []int) int64 {\n    // TODO: Calculate how much water can be trapped after rain\n    return 0\n}\n\nfunc main() {\n    var n int\n    if _, err := fmt.Scan(&n); err == nil {\n        a := make([]int, n)\n        for i := 0; i < n; i++ {\n            fmt.Scan(&a[i])\n        }\n        fmt.Println(trap(n, a))\n    }\n}",
      rust: "use std::io::{self, BufRead};\n\nfn trap(a: &[i32]) -> i64 {\n    // TODO: Calculate how much water can be trapped after rain\n    0\n}\n\nfn main() {\n    let stdin = io::stdin();\n    let mut lines = stdin.lock().lines();\n    if let Some(Ok(l1)) = lines.next() {\n        if let Ok(n) = l1.trim().parse::<usize>() {\n            if let Some(Ok(l2)) = lines.next() {\n                let a: Vec<i32> = l2.split_whitespace().map(|x| x.parse().unwrap()).collect();\n                println!(\"{}\", trap(&a));\n            }\n        }\n    }\n}"
    },
    hiddenTestCases: [
      { input: "1\n5", output: "0" }, { input: "2\n1 1", output: "0" }, { input: "3\n1 2 1", output: "0" }, { input: "5\n4 2 0 3 2 5", output: "9" }, { input: "6\n0 1 0 2 1 0", output: "1" }, { input: "3\n2 0 2", output: "2" }, { input: "5\n3 0 0 0 3", output: "6" }, { input: "2\n10 0", output: "0" }, { input: "4\n10 5 2 10", output: "15" }, { input: "10\n1 2 1 2 1 2 1 2 1 2", output: "4" }
    ],
    timeLimit: "3s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  }
];
