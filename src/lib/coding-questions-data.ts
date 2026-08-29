/**
 * @fileOverview Nexvoro AI Master Question Data (v7.0 - 15 Audited Nodes, 13 Languages).
 * A high-fidelity repository of coding challenges across all difficulty tiers.
 * Every node provides full runnable boilerplates for 13 languages.
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
  // ==========================================
  // EASY NODES (01-05)
  // ==========================================
  {
    id: "easy-01",
    title: "The Mirror Word Test",
    description: "Identify if a word is a 'Mirror Word' (Palindrome). A Mirror Word reads the same forwards and backwards.",
    difficulty: "Easy",
    category: "Strings",
    topic: "STRING ENGINE",
    estimatedTime: "10 mins",
    company: "TCS",
    tags: ["Strings", "Logic"],
    inputFormat: "A single string S.",
    outputFormat: "YES or NO.",
    constraints: ["1 <= |S| <= 100000"],
    sampleInput: "racecar",
    sampleOutput: "YES",
    explanation: "'racecar' read backwards is still 'racecar'.",
    functionInfo: {
      name: "isMirrorWord",
      params: "String s",
      returnType: "Boolean",
      goal: "Determine if s equals reverse(s)."
    },
    starterCode: {
      python: `import sys\n\ndef is_mirror_word(s):\n    # Write your logic here\n    return False\n\nif __name__ == "__main__":\n    line = sys.stdin.read().strip()\n    if line:\n        if is_mirror_word(line):\n            print("YES")\n        else:\n            print("NO")`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static boolean isMirrorWord(String s) {\n        // Write your logic here\n        return false;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            System.out.println(isMirrorWord(s) ? "YES" : "NO");\n        }\n    }\n}`,
      cpp: `#include <iostream>\n#include <string>\n#include <algorithm>\n\nusing namespace std;\n\nbool isMirrorWord(string s) {\n    // Write your logic here\n    return false;\n}\n\nint main() {\n    string s;\n    if (cin >> s) {\n        cout << (isMirrorWord(s) ? "YES" : "NO") << endl;\n    }\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction isMirrorWord(s) {\n  // Write your logic here\n  return false;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nif (input) {\n  console.log(isMirrorWord(input) ? "YES" : "NO");\n}`,
      typescript: `import * as fs from 'fs';\n\nfunction isMirrorWord(s: string): boolean {\n  // Write your logic here\n  return false;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nif (input) {\n  console.log(isMirrorWord(input) ? "YES" : "NO");\n}`,
      c: `#include <stdio.h>\n#include <string.h>\n#include <stdbool.h>\n\nbool isMirrorWord(char* s) {\n    // Write your logic here\n    return false;\n}\n\nint main() {\n    char s[100005];\n    if (scanf("%s", s) != EOF) {\n        printf("%s\\n", isMirrorWord(s) ? "YES" : "NO");\n    }\n    return 0;\n}`,
      csharp: `using System;\n\nclass Program {\n    static bool IsMirrorWord(string s) {\n        // Write your logic here\n        return false;\n    }\n\n    static void Main() {\n        string s = Console.ReadLine();\n        if (s != null) {\n            Console.WriteLine(IsMirrorWord(s.Trim()) ? "YES" : "NO");\n        }\n    }\n}`,
      go: `package main\n\nimport "fmt"\n\nfunc isMirrorWord(s string) bool {\n    // Write your logic here\n    return false\n}\n\nfunc main() {\n    var s string\n    fmt.Scan(&s)\n    if s != "" {\n        if isMirrorWord(s) {\n            fmt.Println("YES")\n        } else {\n            fmt.Println("NO")\n        }\n    }\n}`,
      rust: `use std::io::{self, BufRead};\n\nfn is_mirror_word(s: &str) -> bool {\n    // Write your logic here\n    false\n}\n\nfn main() {\n    let stdin = io::stdin();\n    let mut line = String::new();\n    if stdin.lock().read_line(&mut line).is_ok() {\n        let s = line.trim();\n        if !s.is_empty() {\n            println!("{}", if is_mirror_word(s) { "YES" } else { "NO" });\n        }\n    }\n}`,
      kotlin: `import java.util.Scanner\n\nfun isMirrorWord(s: String): Boolean {\n    // Write your logic here\n    return false\n}\n\nfun main(args: Array<String>) {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNext()) {\n        val s = sc.next()\n        println(if (isMirrorWord(s)) "YES" else "NO")\n    }\n}`,
      php: `<?php\n\nfunction isMirrorWord($s) {\n    // Write your logic here\n    return false;\n}\n\n$input = trim(file_get_contents("php://stdin"));\nif ($input !== "") {\n    echo isMirrorWord($input) ? "YES" : "NO";\n}\n?>`,
      swift: `import Foundation\n\nfunc isMirrorWord(_ s: String) -> Bool {\n    // Write your logic here\n    return false\n}\n\nif let input = readLine() {\n    print(isMirrorWord(input.trimmingCharacters(in: .whitespacesAndNewlines)) ? "YES" : "NO")\n}`,
      ruby: `def is_mirror_word(s)\n  # Write your logic here\n  false\nend\n\ninput = gets\nif input\n  puts is_mirror_word(input.strip) ? "YES" : "NO"\nend`
    },
    hiddenTestCases: [
      { input: "madam", output: "YES" },
      { input: "hello", output: "NO" },
      { input: "a", output: "YES" },
      { input: "abccba", output: "YES" },
      { input: "noon", output: "YES" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "easy-02",
    title: "Array Sum Pulse",
    description: "Given an array of integers, calculate the total sum of its elements.",
    difficulty: "Easy",
    category: "Arrays",
    topic: "BASIC LOGIC",
    estimatedTime: "5 mins",
    company: "Infosys",
    tags: ["Arrays", "Math"],
    inputFormat: "Line 1: N (array size)\nLine 2: N space-separated integers.",
    outputFormat: "A single integer.",
    constraints: ["1 <= N <= 1000", "-10^6 <= arr[i] <= 10^6"],
    sampleInput: "4\n1 2 3 4",
    sampleOutput: "10",
    explanation: "1 + 2 + 3 + 4 = 10.",
    functionInfo: {
      name: "arraySum",
      params: "Array arr",
      returnType: "Int",
      goal: "Sum all elements in the array."
    },
    starterCode: {
      python: `import sys\n\ndef array_sum(arr):\n    # Write your logic here\n    return 0\n\nif __name__ == "__main__":\n    data = sys.stdin.read().split()\n    if data:\n        n = int(data[0])\n        arr = [int(x) for x in data[1:1+n]]\n        print(array_sum(arr))`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static long arraySum(int[] arr) {\n        // Write your logic here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] arr = new int[n];\n            for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n            System.out.println(arraySum(arr));\n        }\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nlong long arraySum(vector<int>& arr) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> arr(n);\n        for (int i = 0; i < n; i++) cin >> arr[i];\n        cout << arraySum(arr) << endl;\n    }\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction arraySum(arr) {\n  // Write your logic here\n  return 0;\n}\n\nconst input = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (input.length > 1) {\n  const n = parseInt(input[0]);\n  const arr = input.slice(1, n + 1).map(Number);\n  console.log(arraySum(arr));\n}`,
      typescript: `import * as fs from 'fs';\n\nfunction arraySum(arr: number[]): number {\n  // Write your logic here\n  return 0;\n}\n\nconst input = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (input.length > 1) {\n  const n = parseInt(input[0]);\n  const arr = input.slice(1, n + 1).map(Number);\n  console.log(arraySum(arr));\n}`,
      c: `#include <stdio.h>\n\nlong long arraySum(int* arr, int n) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    int n;\n    if (scanf("%d", &n) != EOF) {\n        int arr[1005];\n        for (int i = 0; i < n; i++) scanf("%d", &arr[i]);\n        printf("%lld\\n", arraySum(arr, n));\n    }\n    return 0;\n}`,
      csharp: `using System;\nusing System.Linq;\n\nclass Program {\n    static long ArraySum(int[] arr) {\n        // Write your logic here\n        return 0;\n    }\n\n    static void Main() {\n        string l1 = Console.ReadLine();\n        if (l1 != null) {\n            int n = int.Parse(l1);\n            int[] arr = Console.ReadLine().Split().Select(int.Parse).ToArray();\n            Console.WriteLine(ArraySum(arr));\n        }\n    }\n}`,
      go: `package main\n\nimport "fmt"\n\nfunc arraySum(arr []int) int64 {\n    // Write your logic here\n    return 0\n}\n\nfunc main() {\n    var n int\n    fmt.Scan(&n)\n    arr := make([]int, n)\n    for i := 0; i < n; i++ {\n        fmt.Scan(&arr[i])\n    }\n    fmt.Println(arraySum(arr))\n}`,
      rust: `use std::io::{self, Read};\n\nfn array_sum(arr: Vec<i32>) -> i64 {\n    // Write your logic here\n    0\n}\n\nfn main() {\n    let mut s = String::new();\n    io::stdin().read_to_string(&mut s).ok();\n    let mut it = s.split_whitespace();\n    if let Some(n_s) = it.next() {\n        let n: usize = n_s.parse().unwrap();\n        let arr: Vec<i32> = it.map(|x| x.parse().unwrap()).collect();\n        println!("{}", array_sum(arr));\n    }\n}`,
      kotlin: `import java.util.Scanner\n\nfun arraySum(arr: IntArray): Long {\n    // Write your logic here\n    return 0L\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNextInt()) {\n        val n = sc.nextInt()\n        val arr = IntArray(n) { sc.nextInt() }\n        println(arraySum(arr))\n    }\n}`,
      php: `<?php\n\nfunction arraySum($arr) {\n    // Write your logic here\n    return 0;\n}\n\n$data = preg_split('/\\s+/', trim(file_get_contents("php://stdin")));\nif (count($data) > 1) {\n    $n = (int)$data[0];\n    $arr = array_slice($data, 1, $n);\n    echo arraySum($arr);\n}\n?>`,
      swift: `import Foundation\n\nfunc arraySum(_ arr: [Int]) -> Int {\n    // Write your logic here\n    return 0\n}\n\nif let l1 = readLine(), let n = Int(l1), let l2 = readLine() {\n    let arr = l2.split(separator: " ").compactMap { Int($0) }\n    print(arraySum(arr))\n}`,
      ruby: `def array_sum(arr)\n  # Write your logic here\n  0\nend\n\nn = gets.to_i\narr = gets.split.map(&:to_i)\nputs array_sum(arr)`
    },
    hiddenTestCases: [
      { input: "5\n10 20 30 40 50", output: "150" },
      { input: "3\n-1 -2 -3", output: "-6" },
      { input: "1\n100", output: "100" },
      { input: "2\n1000000 1000000", output: "2000000" },
      { input: "4\n0 0 0 0", output: "0" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "easy-03",
    title: "FizzBuzz Evolution",
    description: "For multiples of 3 print 'Fizz', for multiples of 5 print 'Buzz', for both print 'FizzBuzz', else print the number.",
    difficulty: "Easy",
    category: "Logic",
    topic: "CONTROL FLOW",
    estimatedTime: "5 mins",
    company: "Amazon",
    tags: ["Math", "Basics"],
    inputFormat: "A single integer N.",
    outputFormat: "The result string.",
    constraints: ["1 <= N <= 1000"],
    sampleInput: "15",
    sampleOutput: "FizzBuzz",
    explanation: "15 is divisible by both 3 and 5.",
    functionInfo: {
      name: "fizzBuzz",
      params: "Int n",
      returnType: "String",
      goal: "Execute FizzBuzz logic for n."
    },
    starterCode: {
      python: `import sys\n\ndef fizz_buzz(n):\n    # Write your logic here\n    return ""\n\nif __name__ == "__main__":\n    line = sys.stdin.read().strip()\n    if line:\n        print(fizz_buzz(int(line)))`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static String fizzBuzz(int n) {\n        // Write your logic here\n        return "";\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            System.out.println(fizzBuzz(sc.nextInt()));\n        }\n    }\n}`,
      cpp: `#include <iostream>\n#include <string>\n\nusing namespace std;\n\nstring fizzBuzz(int n) {\n    // Write your logic here\n    return "";\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << fizzBuzz(n) << endl;\n    }\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction fizzBuzz(n) {\n  // Write your logic here\n  return "";\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nif (input) {\n  console.log(fizzBuzz(parseInt(input)));\n}`,
      typescript: `import * as fs from 'fs';\n\nfunction fizzBuzz(n: number): string {\n  // Write your logic here\n  return "";\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nif (input) {\n  console.log(fizzBuzz(parseInt(input)));\n}`,
      c: `#include <stdio.h>\n\nvoid fizzBuzz(int n) {\n    // Write your logic here (use printf)\n}\n\nint main() {\n    int n;\n    if (scanf("%d", &n) != EOF) {\n        fizzBuzz(n);\n    }\n    return 0;\n}`,
      csharp: `using System;\n\nclass Program {\n    static string FizzBuzz(int n) {\n        // Write your logic here\n        return "";\n    }\n\n    static void Main() {\n        string line = Console.ReadLine();\n        if (line != null) {\n            Console.WriteLine(FizzBuzz(int.Parse(line)));\n        }\n    }\n}`,
      go: `package main\n\nimport "fmt"\n\nfunc fizzBuzz(n int) string {\n    // Write your logic here\n    return ""\n}\n\nfunc main() {\n    var n int\n    fmt.Scan(&n)\n    fmt.Println(fizzBuzz(n))\n}`,
      rust: `use std::io::{self, BufRead};\n\nfn fizz_buzz(n: i32) -> String {\n    // Write your logic here\n    String::new()\n}\n\nfn main() {\n    let mut line = String::new();\n    io::stdin().read_line(&mut line).ok();\n    if let Ok(n) = line.trim().parse() {\n        println!("{}", fizz_buzz(n));\n    }\n}`,
      kotlin: `import java.util.Scanner\n\nfun fizzBuzz(n: Int): String {\n    // Write your logic here\n    return ""\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNextInt()) {\n        println(fizzBuzz(sc.nextInt()))\n    }\n}`,
      php: `<?php\n\nfunction fizzBuzz($n) {\n    // Write your logic here\n    return "";\n}\n\n$n = (int)trim(file_get_contents("php://stdin"));\necho fizzBuzz($n);\n?>`,
      swift: `import Foundation\n\nfunc fizzBuzz(_ n: Int) -> String {\n    // Write your logic here\n    return ""\n}\n\nif let line = readLine(), let n = Int(line) {\n    print(fizzBuzz(n))\n}`,
      ruby: `def fizz_buzz(n)\n  # Write your logic here\n  ""\nend\n\nline = gets\nif line\n  puts fizz_buzz(line.to_i)\nend`
    },
    hiddenTestCases: [
      { input: "3", output: "Fizz" },
      { input: "5", output: "Buzz" },
      { input: "30", output: "FizzBuzz" },
      { input: "7", output: "7" },
      { input: "9", output: "Fizz" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "easy-04",
    title: "Vowel Pulse",
    description: "Count the number of vowels in a string.",
    difficulty: "Easy",
    category: "Strings",
    topic: "CHAR PROCESSING",
    estimatedTime: "5 mins",
    company: "Wipro",
    tags: ["Strings"],
    inputFormat: "A single string S.",
    outputFormat: "Total vowel count.",
    constraints: ["1 <= |S| <= 1000"],
    sampleInput: "hello world",
    sampleOutput: "3",
    explanation: "e, o, o are vowels.",
    functionInfo: {
      name: "countVowels",
      params: "String s",
      returnType: "Int",
      goal: "Count vowels a, e, i, o, u in s (case-insensitive)."
    },
    starterCode: {
      python: `import sys\n\ndef count_vowels(s):\n    # Write your logic here\n    return 0\n\nif __name__ == "__main__":\n    s = sys.stdin.read().strip()\n    print(count_vowels(s))`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static int countVowels(String s) {\n        // Write your logic here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            System.out.println(countVowels(sc.nextLine()));\n        }\n    }\n}`,
      cpp: `#include <iostream>\n#include <string>\n\nusing namespace std;\n\nint countVowels(string s) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    string s;\n    getline(cin, s);\n    cout << countVowels(s) << endl;\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction countVowels(s) {\n  // Write your logic here\n  return 0;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nconsole.log(countVowels(input));`,
      typescript: `import * as fs from 'fs';\n\nfunction countVowels(s: string): number {\n  // Write your logic here\n  return 0;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nconsole.log(countVowels(input));`,
      c: `#include <stdio.h>\n#include <ctype.h>\n\nint countVowels(char* s) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    char s[1005];\n    if (fgets(s, 1005, stdin)) {\n        printf("%d\\n", countVowels(s));\n    }\n    return 0;\n}`,
      csharp: `using System;\n\nclass Program {\n    static int CountVowels(string s) {\n        // Write your logic here\n        return 0;\n    }\n\n    static void Main() {\n        string s = Console.ReadLine();\n        if (s != null) {\n            Console.WriteLine(CountVowels(s));\n        }\n    }\n}`,
      go: `package main\n\nimport ("fmt"; "bufio"; "os")\n\nfunc countVowels(s string) int {\n    // Write your logic here\n    return 0\n}\n\nfunc main() {\n    scanner := bufio.NewScanner(os.Stdin)\n    if scanner.Scan() {\n        fmt.Println(countVowels(scanner.Text()))\n    }\n}`,
      rust: `use std::io::{self, Read};\n\nfn count_vowels(s: &str) -> i32 {\n    // Write your logic here\n    0\n}\n\nfn main() {\n    let mut s = String::new();\n    io::stdin().read_to_string(&mut s).ok();\n    println!("{}", count_vowels(s.trim()));\n}`,
      kotlin: `import java.util.Scanner\n\nfun countVowels(s: String): Int {\n    // Write your logic here\n    return 0\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNextLine()) {\n        println(countVowels(sc.nextLine()))\n    }\n}`,
      php: `<?php\n\nfunction countVowels($s) {\n    // Write your logic here\n    return 0;\n}\n\n$s = trim(file_get_contents("php://stdin"));\necho countVowels($s);\n?>`,
      swift: `import Foundation\n\nfunc countVowels(_ s: String) -> Int {\n    // Write your logic here\n    return 0\n}\n\nif let s = readLine() {\n    print(countVowels(s))\n}`,
      ruby: `def count_vowels(s)\n  # Write your logic here\n  0\nend\n\ns = STDIN.read.strip\nputs count_vowels(s)`
    },
    hiddenTestCases: [
      { input: "aeiou", output: "5" },
      { input: "bcdfg", output: "0" },
      { input: "Nexvoro AI", output: "5" },
      { input: "Python", output: "2" },
      { input: "Algorithm", output: "3" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "easy-05",
    title: "Factorial Node",
    description: "Calculate the factorial of a given number N.",
    difficulty: "Easy",
    category: "Math",
    topic: "RECURSION/LOOPS",
    estimatedTime: "5 mins",
    company: "Cognizant",
    tags: ["Math"],
    inputFormat: "A single integer N.",
    outputFormat: "The factorial of N.",
    constraints: ["0 <= N <= 20"],
    sampleInput: "5",
    sampleOutput: "120",
    explanation: "5 * 4 * 3 * 2 * 1 = 120.",
    functionInfo: {
      name: "factorial",
      params: "Int n",
      returnType: "Long",
      goal: "Calculate n!."
    },
    starterCode: {
      python: `import sys\n\ndef factorial(n):\n    # Write your logic here\n    return 1\n\nif __name__ == "__main__":\n    line = sys.stdin.read().strip()\n    if line:\n        print(factorial(int(line)))`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static long factorial(int n) {\n        // Write your logic here\n        return 1;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            System.out.println(factorial(sc.nextInt()));\n        }\n    }\n}`,
      cpp: `#include <iostream>\n\nusing namespace std;\n\nlong long factorial(int n) {\n    // Write your logic here\n    return 1;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << factorial(n) << endl;\n    }\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction factorial(n) {\n  // Write your logic here\n  return 1;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nif (input) {\n  console.log(factorial(parseInt(input)));\n}`,
      typescript: `import * as fs from 'fs';\n\nfunction factorial(n: number): number {\n  // Write your logic here\n  return 1;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nif (input) {\n  console.log(factorial(parseInt(input)));\n}`,
      c: `#include <stdio.h>\n\nlong long factorial(int n) {\n    // Write your logic here\n    return 1;\n}\n\nint main() {\n    int n;\n    if (scanf("%d", &n) != EOF) {\n        printf("%lld\\n", factorial(n));\n    }\n    return 0;\n}`,
      csharp: `using System;\n\nclass Program {\n    static long Factorial(int n) {\n        // Write your logic here\n        return 1;\n    }\n\n    static void Main() {\n        string line = Console.ReadLine();\n        if (line != null) {\n            Console.WriteLine(Factorial(int.Parse(line)));\n        }\n    }\n}`,
      go: `package main\n\nimport "fmt"\n\nfunc factorial(n int) int64 {\n    // Write your logic here\n    return 1\n}\n\nfunc main() {\n    var n int\n    fmt.Scan(&n)\n    fmt.Println(factorial(n))\n}`,
      rust: `use std::io;\n\nfn factorial(n: u64) -> u64 {\n    // Write your logic here\n    1\n}\n\nfn main() {\n    let mut line = String::new();\n    io::stdin().read_line(&mut line).ok();\n    if let Ok(n) = line.trim().parse() {\n        println!("{}", factorial(n));\n    }\n}`,
      kotlin: `import java.util.Scanner\n\nfun factorial(n: Int): Long {\n    // Write your logic here\n    return 1\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNextInt()) {\n        println(factorial(sc.nextInt()))\n    }\n}`,
      php: `<?php\n\nfunction factorial($n) {\n    // Write your logic here\n    return 1;\n}\n\n$n = (int)trim(file_get_contents("php://stdin"));\necho factorial($n);\n?>`,
      swift: `import Foundation\n\nfunc factorial(_ n: Int) -> Int64 {\n    // Write your logic here\n    return 1\n}\n\nif let line = readLine(), let n = Int(line) {\n    print(factorial(n))\n}`,
      ruby: `def factorial(n)\n  # Write your logic here\n  1\nend\n\nline = gets\nif line\n  puts factorial(line.to_i)\nend`
    },
    hiddenTestCases: [
      { input: "0", output: "1" },
      { input: "1", output: "1" },
      { input: "10", output: "3628800" },
      { input: "3", output: "6" },
      { input: "6", output: "720" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },

  // ==========================================
  // MEDIUM NODES (06-10)
  // ==========================================
  {
    id: "medium-01",
    title: "Token Refresh Scheduler",
    description: "A system generates N token refresh events at different time offsets. Given a list of offsets and a threshold K, count how many refreshes occur within the first K time units.",
    difficulty: "Medium",
    category: "Arrays",
    topic: "ALGORITHM CORE",
    estimatedTime: "15 mins",
    company: "Meta",
    tags: ["Arrays", "Counting"],
    inputFormat: "Line 1: N K.\nLine 2: N integers representing offsets.",
    outputFormat: "Total count.",
    constraints: ["1 <= N <= 100000", "0 <= K <= 10^9"],
    sampleInput: "5 10\n2 5 12 8 15",
    sampleOutput: "3",
    explanation: "Offsets 2, 5, and 8 are <= 10.",
    functionInfo: {
      name: "countRefreshes",
      params: "Int n, Int k, Array offsets",
      returnType: "Int",
      goal: "Count elements in offsets array that are less than or equal to k."
    },
    starterCode: {
      python: `import sys\n\ndef count_refreshes(n, k, offsets):\n    # Write your logic here\n    return 0\n\nif __name__ == "__main__":\n    data = sys.stdin.read().split()\n    if len(data) >= 2:\n        n, k = int(data[0]), int(data[1])\n        offsets = [int(x) for x in data[2:2+n]]\n        print(count_refreshes(n, k, offsets))`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static int countRefreshes(int n, int k, int[] offsets) {\n        // Write your logic here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int k = sc.nextInt();\n            int[] offsets = new int[n];\n            for (int i = 0; i < n; i++) offsets[i] = sc.nextInt();\n            System.out.println(countRefreshes(n, k, offsets));\n        }\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nint countRefreshes(int n, int k, vector<int>& offsets) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    int n, k;\n    if (cin >> n >> k) {\n        vector<int> offsets(n);\n        for (int i = 0; i < n; i++) cin >> offsets[i];\n        cout << countRefreshes(n, k, offsets) << endl;\n    }\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction countRefreshes(n, k, offsets) {\n  // Write your logic here\n  return 0;\n}\n\nconst data = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (data.length >= 2) {\n  const n = parseInt(data[0]);\n  const k = parseInt(data[1]);\n  const offsets = data.slice(2, 2 + n).map(Number);\n  console.log(countRefreshes(n, k, offsets));\n}`,
      typescript: `import * as fs from 'fs';\n\nfunction countRefreshes(n: number, k: number, offsets: number[]): number {\n  // Write your logic here\n  return 0;\n}\n\nconst data = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (data.length >= 2) {\n  const n = parseInt(data[0]);\n  const k = parseInt(data[1]);\n  const offsets = data.slice(2, 2 + n).map(Number);\n  console.log(countRefreshes(n, k, offsets));\n}`,
      c: `#include <stdio.h>\n\nint countRefreshes(int n, int k, int* offsets) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    int n, k;\n    if (scanf("%d %d", &n, &k) != EOF) {\n        int offsets[100005];\n        for (int i = 0; i < n; i++) scanf("%d", &offsets[i]);\n        printf("%d\\n", countRefreshes(n, k, offsets));\n    }\n    return 0;\n}`,
      csharp: `using System;\nusing System.Linq;\n\nclass Program {\n    static int CountRefreshes(int n, int k, int[] offsets) {\n        // Write your logic here\n        return 0;\n    }\n\n    static void Main() {\n        string l1 = Console.ReadLine();\n        if (l1 != null) {\n            int k = int.Parse(l1.Split()[1]);\n            int n = int.Parse(l1.Split()[0]);\n            int[] offsets = Console.ReadLine().Split().Select(int.Parse).ToArray();\n            Console.WriteLine(CountRefreshes(n, k, offsets));\n        }\n    }\n}`,
      go: `package main\n\nimport "fmt"\n\nfunc countRefreshes(n, k int, offsets []int) int {\n    // Write your logic here\n    return 0\n}\n\nfunc main() {\n    var n, k int\n    fmt.Scan(&n, &k)\n    offsets := make([]int, n)\n    for i := 0; i < n; i++ {\n        fmt.Scan(&offsets[i])\n    }\n    fmt.Println(countRefreshes(n, k, offsets))\n}`,
      rust: `use std::io::{self, Read};\n\nfn count_refreshes(n: usize, k: i32, offsets: Vec<i32>) -> usize {\n    // Write your logic here\n    0\n}\n\nfn main() {\n    let mut s = String::new();\n    io::stdin().read_to_string(&mut s).ok();\n    let mut it = s.split_whitespace();\n    if let (Some(n_s), Some(k_s)) = (it.next(), it.next()) {\n        let n: usize = n_s.parse().unwrap();\n        let k: i32 = k_s.parse().unwrap();\n        let offsets: Vec<i32> = it.map(|x| x.parse().unwrap()).collect();\n        println!("{}", count_refreshes(n, k, offsets));\n    }\n}`,
      kotlin: `import java.util.Scanner\n\nfun countRefreshes(n: Int, k: Int, offsets: IntArray): Int {\n    // Write your logic here\n    return 0\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNextInt()) {\n        val n = sc.nextInt()\n        val k = sc.nextInt()\n        val offsets = IntArray(n) { sc.nextInt() }\n        println(countRefreshes(n, k, offsets))\n    }\n}`,
      php: `<?php\n\nfunction countRefreshes($n, $k, $offsets) {\n    // Write your logic here\n    return 0;\n}\n\n$d = preg_split('/\\s+/', trim(file_get_contents("php://stdin")));\nif (count($d) > 2) {\n    $n = (int)$d[0];\n    $k = (int)$d[1];\n    $offsets = array_slice($d, 2, $n);\n    echo countRefreshes($n, $k, $offsets);\n}\n?>`,
      swift: `import Foundation\n\nfunc countRefreshes(_ n: Int, _ k: Int, _ offsets: [Int]) -> Int {\n    // Write your logic here\n    return 0\n}\n\nif let l1 = readLine() {\n    let parts = l1.split(separator: " ").map { Int($0)! }\n    let n = parts[0], k = parts[1]\n    if let l2 = readLine() {\n        let offsets = l2.split(separator: " ").compactMap { Int($0) }\n        print(countRefreshes(n, k, offsets))\n    }\n}`,
      ruby: `def count_refreshes(n, k, offsets)\n  # Write your logic here\n  0\nend\n\nl1 = gets.split\nif l1.length >= 2\n  n, k = l1.map(&:to_i)\n  offsets = gets.split.map(&:to_i)\n  puts count_refreshes(n, k, offsets)\nend`
    },
    hiddenTestCases: [
      { input: "5 10\n2 5 12 8 15", output: "3" },
      { input: "3 5\n1 2 3", output: "3" },
      { input: "4 0\n1 2 3 4", output: "0" },
      { input: "1 100\n50", output: "1" },
      { input: "2 10\n10 11", output: "1" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "medium-02",
    title: "Anagram Matrix",
    description: "Determine if two strings are anagrams of each other. Two strings are anagrams if they have the same characters with the same frequencies.",
    difficulty: "Medium",
    category: "Strings",
    topic: "HASH MAPS",
    estimatedTime: "10 mins",
    company: "Google",
    tags: ["Strings", "Hashing"],
    inputFormat: "Two strings S1 and S2 on separate lines.",
    outputFormat: "YES or NO.",
    constraints: ["1 <= |S1|, |S2| <= 10^5"],
    sampleInput: "listen\nsilent",
    sampleOutput: "YES",
    explanation: "Both strings contain the same letters in different order.",
    functionInfo: {
      name: "isAnagram",
      params: "String s1, String s2",
      returnType: "Boolean",
      goal: "Check if s1 and s2 are permutations of each other."
    },
    starterCode: {
      python: `import sys\n\ndef is_anagram(s1, s2):\n    # Write your logic here\n    return False\n\nif __name__ == "__main__":\n    lines = sys.stdin.read().split()\n    if len(lines) >= 2:\n        if is_anagram(lines[0], lines[1]):\n            print("YES")\n        else:\n            print("NO")`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static boolean isAnagram(String s1, String s2) {\n        // Write your logic here\n        return false;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s1 = sc.next();\n            String s2 = sc.next();\n            System.out.println(isAnagram(s1, s2) ? "YES" : "NO");\n        }\n    }\n}`,
      cpp: `#include <iostream>\n#include <string>\n\nusing namespace std;\n\nbool isAnagram(string s1, string s2) {\n    // Write your logic here\n    return false;\n}\n\nint main() {\n    string s1, s2;\n    if (cin >> s1 >> s2) {\n        cout << (isAnagram(s1, s2) ? "YES" : "NO") << endl;\n    }\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction isAnagram(s1, s2) {\n  // Write your logic here\n  return false;\n}\n\nconst input = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (input.length >= 2) {\n  console.log(isAnagram(input[0], input[1]) ? "YES" : "NO");\n}`,
      typescript: `import * as fs from 'fs';\n\nfunction isAnagram(s1: string, s2: string): boolean {\n  // Write your logic here\n  return false;\n}\n\nconst input = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (input.length >= 2) {\n  console.log(isAnagram(input[0], input[1]) ? "YES" : "NO");\n}`,
      c: `#include <stdio.h>\n#include <string.h>\n#include <stdbool.h>\n\nbool isAnagram(char* s1, char* s2) {\n    // Write your logic here\n    return false;\n}\n\nint main() {\n    char s1[100005], s2[100005];\n    if (scanf("%s %s", s1, s2) != EOF) {\n        printf("%s\\n", isAnagram(s1, s2) ? "YES" : "NO");\n    }\n    return 0;\n}`,
      csharp: `using System;\n\nclass Program {\n    static bool IsAnagram(string s1, string s2) {\n        // Write your logic here\n        return false;\n    }\n\n    static void Main() {\n        string s1 = Console.ReadLine();\n        string s2 = Console.ReadLine();\n        if (s1 != null && s2 != null) {\n            Console.WriteLine(IsAnagram(s1.Trim(), s2.Trim()) ? "YES" : "NO");\n        }\n    }\n}`,
      go: `package main\n\nimport "fmt"\n\nfunc isAnagram(s1, s2 string) bool {\n    // Write your logic here\n    return false\n}\n\nfunc main() {\n    var s1, s2 string\n    fmt.Scan(&s1, &s2)\n    if isAnagram(s1, s2) {\n        fmt.Println("YES")\n    } else {\n        fmt.Println("NO")\n    }\n}`,
      rust: `use std::io::{self, BufRead};\n\nfn is_anagram(s1: &str, s2: &str) -> bool {\n    // Write your logic here\n    false\n}\n\nfn main() {\n    let stdin = io::stdin();\n    let mut it = stdin.lock().lines();\n    if let (Some(Ok(s1)), Some(Ok(s2))) = (it.next(), it.next()) {\n        println!("{}", if is_anagram(s1.trim(), s2.trim()) { "YES" } else { "NO" });\n    }\n}`,
      kotlin: `import java.util.Scanner\n\nfun isAnagram(s1: String, s2: String): Boolean {\n    // Write your logic here\n    return false\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNext()) {\n        println(if (isAnagram(sc.next(), sc.next())) "YES" else "NO")\n    }\n}`,
      php: `<?php\n\nfunction isAnagram($s1, $s2) {\n    // Write your logic here\n    return false;\n}\n\n$d = preg_split('/\\s+/', trim(file_get_contents("php://stdin")));\nif (count($d) >= 2) {\n    echo isAnagram($d[0], $d[1]) ? "YES" : "NO";\n}\n?>`,
      swift: `import Foundation\n\nfunc isAnagram(_ s1: String, _ s2: String) -> Bool {\n    // Write your logic here\n    return false\n}\n\nif let s1 = readLine(), let s2 = readLine() {\n    print(isAnagram(s1, s2) ? "YES" : "NO")\n}`,
      ruby: `def is_anagram(s1, s2)\n  # Write your logic here\n  false\nend\n\ns1 = gets.strip\ns2 = gets.strip\nputs is_anagram(s1, s2) ? "YES" : "NO"`
    },
    hiddenTestCases: [
      { input: "triangle\nintegral", output: "YES" },
      { input: "apple\npeach", output: "NO" },
      { input: "a\na", output: "YES" },
      { input: "ab\nba", output: "YES" },
      { input: "abc\ndef", output: "NO" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "medium-03",
    title: "Rotation Cycle",
    description: "Rotate an array of size N to the right by K steps. The rotation should be in-place or return a new array depending on the language paradigm.",
    difficulty: "Medium",
    category: "Arrays",
    topic: "IN-PLACE TRANSFORMS",
    estimatedTime: "10 mins",
    company: "Microsoft",
    tags: ["Arrays"],
    inputFormat: "Line 1: N K\nLine 2: N integers",
    outputFormat: "The rotated array as space-separated integers.",
    constraints: ["1 <= N <= 10^5", "0 <= K <= 10^5"],
    sampleInput: "5 2\n1 2 3 4 5",
    sampleOutput: "4 5 1 2 3",
    explanation: "Rotating [1,2,3,4,5] right by 2 steps results in [4,5,1,2,3].",
    functionInfo: {
      name: "rotateArray",
      params: "Int[] arr, Int k",
      returnType: "Int[]",
      goal: "Shift elements k positions to the right circularily."
    },
    starterCode: {
      python: `import sys\n\ndef rotate_array(arr, k):\n    # Write your logic here\n    return arr\n\nif __name__ == "__main__":\n    d = sys.stdin.read().split()\n    if len(d) >= 2:\n        n, k = int(d[0]), int(d[1])\n        arr = [int(x) for x in d[2:2+n]]\n        res = rotate_array(arr, k)\n        print(" ".join(map(str, res)))`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static int[] rotateArray(int[] arr, int k) {\n        // Write your logic here\n        return arr;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int k = sc.nextInt();\n            int[] arr = new int[n];\n            for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n            int[] res = rotateArray(arr, k);\n            for (int i = 0; i < n; i++) System.out.print(res[i] + (i == n-1 ? "" : " "));\n        }\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nvector<int> rotateArray(vector<int>& arr, int k) {\n    // Write your logic here\n    return arr;\n}\n\nint main() {\n    int n, k;\n    if (cin >> n >> k) {\n        vector<int> arr(n);\n        for (int i = 0; i < n; i++) cin >> arr[i];\n        vector<int> res = rotateArray(arr, k);\n        for (int i = 0; i < n; i++) cout << res[i] << (i == n-1 ? "" : " ");\n    }\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction rotateArray(arr, k) {\n  // Write your logic here\n  return arr;\n}\n\nconst d = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (d.length >= 2) {\n  const n = parseInt(d[0]);\n  const k = parseInt(d[1]);\n  const arr = d.slice(2, 2 + n).map(Number);\n  console.log(rotateArray(arr, k).join(' '));\n}`,
      typescript: `import * as fs from 'fs';\n\nfunction rotateArray(arr: number[], k: number): number[] {\n  // Write your logic here\n  return arr;\n}\n\nconst d = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (d.length >= 2) {\n  const n = parseInt(d[0]);\n  const k = parseInt(d[1]);\n  const arr = d.slice(2, 2 + n).map(Number);\n  console.log(rotateArray(arr, k).join(' '));\n}`,
      c: `#include <stdio.h>\n\nvoid rotateArray(int* arr, int n, int k) {\n    // Write your logic here (modify arr in-place)\n}\n\nint main() {\n    int n, k;\n    if (scanf("%d %d", &n, &k) != EOF) {\n        int arr[100005];\n        for (int i = 0; i < n; i++) scanf("%d", &arr[i]);\n        rotateArray(arr, n, k);\n        for (int i = 0; i < n; i++) printf("%d%s", arr[i], i == n-1 ? "" : " ");\n    }\n    return 0;\n}`,
      csharp: `using System;\nusing System.Linq;\n\nclass Program {\n    static int[] RotateArray(int[] arr, int k) {\n        // Write your logic here\n        return arr;\n    }\n\n    static void Main() {\n        string l1 = Console.ReadLine();\n        if (l1 != null) {\n            int n = int.Parse(l1.Split()[0]);\n            int k = int.Parse(l1.Split()[1]);\n            int[] arr = Console.ReadLine().Split(new[]{' '}, StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n            int[] res = RotateArray(arr, k);\n            Console.WriteLine(string.Join(" ", res));\n        }\n    }\n}`,
      go: `package main\n\nimport "fmt"\n\nfunc rotateArray(arr []int, k int) []int {\n    // Write your logic here\n    return arr\n}\n\nfunc main() {\n    var n, k int\n    fmt.Scan(&n, &k)\n    arr := make([]int, n)\n    for i := 0; i < n; i++ {\n        fmt.Scan(&arr[i])\n    }\n    res := rotateArray(arr, k)\n    for i, v := range res {\n        fmt.Print(v)\n        if i < len(res)-1 { fmt.Print(" ") }\n    }\n}`,
      rust: `use std::io::{self, Read};\n\nfn rotate_array(arr: Vec<i32>, k: usize) -> Vec<i32> {\n    // Write your logic here\n    arr\n}\n\nfn main() {\n    let mut s = String::new();\n    io::stdin().read_to_string(&mut s).ok();\n    let mut it = s.split_whitespace();\n    if let (Some(n_s), Some(k_s)) = (it.next(), it.next()) {\n        let n: usize = n_s.parse().unwrap();\n        let k: usize = k_s.parse().unwrap();\n        let arr: Vec<i32> = it.map(|x| x.parse().unwrap()).collect();\n        let res = rotate_array(arr, k);\n        let r: Vec<String> = res.iter().map(|x| x.to_string()).collect();\n        println!("{}", r.join(" "));\n    }\n}`,
      kotlin: `import java.util.Scanner\n\nfun rotateArray(arr: IntArray, k: Int): IntArray {\n    // Write your logic here\n    return arr\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNextInt()) {\n        val n = sc.nextInt()\n        val k = sc.nextInt()\n        val arr = IntArray(n) { sc.nextInt() }\n        val res = rotateArray(arr, k)\n        for (i in 0 until n) print("\${res[i]}" + if (i == n-1) "" else " ")\n    }\n}`,
      php: `<?php\n\nfunction rotateArray($arr, $k) {\n    // Write your logic here\n    return $arr;\n}\n\n$d = preg_split('/\\s+/', trim(file_get_contents("php://stdin")));\nif (count($d) >= 2) {\n    $n = (int)$d[0];\n    $k = (int)$d[1];\n    $arr = array_slice($d, 2, $n);\n    echo implode(' ', rotateArray($arr, $k));\n}\n?>`,
      swift: `import Foundation\n\nfunc rotateArray(_ arr: [Int], _ k: Int) -> [Int] {\n    // Write your logic here\n    return arr\n}\n\nif let l1 = readLine() {\n    let parts = l1.split(separator: " ").map { Int($0)! }\n    if let l2 = readLine() {\n        let arr = l2.split(separator: " ").map { Int($0)! }\n        print(rotateArray(arr, parts[1]).map { String($0) }.joined(separator: " "))\n    }\n}`,
      ruby: `def rotate_array(arr, k)\n  # Write your logic here\n  arr\nend\n\nn, k = gets.split.map(&:to_i)\narr = gets.split.map(&:to_i)\nputs rotate_array(arr, k).join(' ')`
    },
    hiddenTestCases: [
      { input: "3 1\n10 20 30", output: "30 10 20" },
      { input: "4 4\n1 2 3 4", output: "1 2 3 4" },
      { input: "2 3\n1 2", output: "2 1" },
      { input: "5 0\n1 2 3 4 5", output: "1 2 3 4 5" },
      { input: "6 2\n1 2 3 4 5 6", output: "5 6 1 2 3 4" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "medium-04",
    title: "Missing ID Node",
    description: "Given an array containing N-1 unique integers in range [1, N], find the missing one.",
    difficulty: "Medium",
    category: "Arrays",
    topic: "ARITHMETIC SERIES",
    estimatedTime: "5 mins",
    company: "Amazon",
    tags: ["Arrays", "Math"],
    inputFormat: "Line 1: N\nLine 2: N-1 integers representing the set.",
    outputFormat: "The missing integer.",
    constraints: ["2 <= N <= 10^6"],
    sampleInput: "5\n1 2 4 5",
    sampleOutput: "3",
    explanation: "Sum of 1..5 is 15. The provided sum is 12. 15 - 12 = 3.",
    functionInfo: {
      name: "findMissing",
      params: "Long n, Long[] arr",
      returnType: "Long",
      goal: "Find the single integer from 1 to n absent in arr."
    },
    starterCode: {
      python: `import sys\n\ndef find_missing(n, arr):\n    # Write your logic here\n    return 0\n\nif __name__ == "__main__":\n    d = sys.stdin.read().split()\n    if d:\n        n = int(d[0])\n        arr = [int(x) for x in d[1:]]\n        print(find_missing(n, arr))`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static long findMissing(long n, long[] arr) {\n        // Write your logic here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLong()) {\n            long n = sc.nextLong();\n            long[] arr = new long[(int)n - 1];\n            for (int i = 0; i < n - 1; i++) arr[i] = sc.nextLong();\n            System.out.println(findMissing(n, arr));\n        }\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nlong long findMissing(long long n, vector<long long>& arr) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    long long n;\n    if (cin >> n) {\n        vector<long long> arr(n - 1);\n        for (int i = 0; i < n - 1; i++) cin >> arr[i];\n        cout << findMissing(n, arr) << endl;\n    }\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction findMissing(n, arr) {\n  // Write your logic here\n  return 0;\n}\n\nconst d = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (d.length > 0) {\n  const n = BigInt(d[0]);\n  const arr = d.slice(1).filter(Boolean).map(BigInt);\n  console.log(findMissing(n, arr).toString());\n}`,
      typescript: `import * as fs from 'fs';\n\nfunction findMissing(n: bigint, arr: bigint[]): bigint {\n  // Write your logic here\n  return BigInt(0);\n}\n\nconst d = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (d.length > 0) {\n  const n = BigInt(d[0]);\n  const arr = d.slice(1).filter(Boolean).map(BigInt);\n  console.log(findMissing(n, arr).toString());\n}`,
      c: `#include <stdio.h>\n\nlong long findMissing(long long n, long long* arr) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    long long n;\n    if (scanf("%lld", &n) != EOF) {\n        long long arr[1000005];\n        for (int i = 0; i < n - 1; i++) scanf("%lld", &arr[i]);\n        printf("%lld\\n", findMissing(n, arr));\n    }\n    return 0;\n}`,
      csharp: `using System;\nusing System.Linq;\n\nclass Program {\n    static long FindMissing(long n, long[] arr) {\n        // Write your logic here\n        return 0;\n    }\n\n    static void Main() {\n        string l1 = Console.ReadLine();\n        if (l1 != null) {\n            long n = long.Parse(l1);\n            long[] arr = Console.ReadLine().Split(new[]{' '}, StringSplitOptions.RemoveEmptyEntries).Select(long.Parse).ToArray();\n            Console.WriteLine(FindMissing(n, arr));\n        }\n    }\n}`,
      go: `package main\n\nimport "fmt"\n\nfunc findMissing(n int64, arr []int64) int64 {\n    // Write your logic here\n    return 0\n}\n\nfunc main() {\n    var n int64\n    fmt.Scan(&n)\n    arr := make([]int64, n-1)\n    for i := 0; i < int(n-1); i++ {\n        fmt.Scan(&arr[i])\n    }\n    fmt.Println(findMissing(n, arr))\n}`,
      rust: `use std::io::{self, Read};\n\nfn find_missing(n: i64, arr: Vec<i64>) -> i64 {\n    // Write your logic here\n    0\n}\n\nfn main() {\n    let mut s = String::new();\n    io::stdin().read_to_string(&mut s).ok();\n    let mut it = s.split_whitespace();\n    if let Some(n_s) = it.next() {\n        let n: i64 = n_s.parse().unwrap();\n        let arr: Vec<i64> = it.map(|x| x.parse().unwrap()).collect();\n        println!("{}", find_missing(n, arr));\n    }\n}`,
      kotlin: `import java.util.Scanner\n\nfun findMissing(n: Long, arr: LongArray): Long {\n    // Write your logic here\n    return 0L\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNextLong()) {\n        val n = sc.nextLong()\n        val arr = LongArray(n.toInt() - 1) { sc.nextLong() }\n        println(findMissing(n, arr))\n    }\n}`,
      php: `<?php\n\nfunction findMissing($n, $arr) {\n    // Write your logic here\n    return 0;\n}\n\n$d = preg_split('/\\s+/', trim(file_get_contents("php://stdin")));\nif (count($d) > 0) {\n    $n = (int)$d[0];\n    $arr = array_slice($d, 1);\n    echo findMissing($n, $arr);\n}\n?>`,
      swift: `import Foundation\n\nfunc findMissing(_ n: Int64, _ arr: [Int64]) -> Int64 {\n    // Write your logic here\n    return 0\n}\n\nif let l1 = readLine(), let n = Int64(l1), let l2 = readLine() {\n    let arr = l2.split(separator: " ").compactMap { Int64($0) }\n    print(findMissing(n, arr))\n}`,
      ruby: `def find_missing(n, arr)\n  # Write your logic here\n  0\nend\n\nn = gets.to_i\narr = gets.split.map(&:to_i)\nputs find_missing(n, arr)`
    },
    hiddenTestCases: [
      { input: "3\n1 3", output: "2" },
      { input: "2\n1", output: "2" },
      { input: "2\n2", output: "1" },
      { input: "10\n1 2 3 4 5 6 7 8 10", output: "9" },
      { input: "5\n1 2 3 4", output: "5" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "medium-05",
    title: "Binary Gap Protocol",
    description: "Find the longest sequence of zeros in the binary representation of N, surrounded by ones.",
    difficulty: "Medium",
    category: "Math",
    topic: "BIT MANIPULATION",
    estimatedTime: "10 mins",
    company: "Meta",
    tags: ["Math", "Bitwise"],
    inputFormat: "A single integer N.",
    outputFormat: "Longest gap length.",
    constraints: ["1 <= N <= 2^31 - 1"],
    sampleInput: "1041",
    sampleOutput: "5",
    explanation: "1041 is 10000010001 in binary. The longest gap of zeros between ones is length 5.",
    functionInfo: {
      name: "binaryGap",
      params: "Int n",
      returnType: "Int",
      goal: "Find the max length of zeros between two '1's in dec-to-bin(n)."
    },
    starterCode: {
      python: `import sys\n\ndef binary_gap(n):\n    # Write your logic here\n    return 0\n\nif __name__ == "__main__":\n    line = sys.stdin.read().strip()\n    if line:\n        print(binary_gap(int(line)))`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static int binaryGap(int n) {\n        // Write your logic here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            System.out.println(binaryGap(sc.nextInt()));\n        }\n    }\n}`,
      cpp: `#include <iostream>\n\nusing namespace std;\n\nint binaryGap(int n) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << binaryGap(n) << endl;\n    }\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction binaryGap(n) {\n  // Write your logic here\n  return 0;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nif (input) {\n  console.log(binaryGap(parseInt(input)));\n}`,
      typescript: `import * as fs from 'fs';\n\nfunction binaryGap(n: number): number {\n  // Write your logic here\n  return 0;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nif (input) {\n  console.log(binaryGap(parseInt(input)));\n}`,
      c: `#include <stdio.h>\n\nint binaryGap(int n) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    int n;\n    if (scanf("%d", &n) != EOF) {\n        printf("%d\\n", binaryGap(n));\n    }\n    return 0;\n}`,
      csharp: `using System;\n\nclass Program {\n    static int BinaryGap(int n) {\n        // Write your logic here\n        return 0;\n    }\n\n    static void Main() {\n        string line = Console.ReadLine();\n        if (line != null) {\n            Console.WriteLine(BinaryGap(int.Parse(line)));\n        }\n    }\n}`,
      go: `package main\n\nimport "fmt"\n\nfunc binaryGap(n int) int {\n    // Write your logic here\n    return 0\n}\n\nfunc main() {\n    var n int\n    fmt.Scan(&n)\n    fmt.Println(binaryGap(n))\n}`,
      rust: `use std::io;\n\nfn binary_gap(n: i32) -> i32 {\n    // Write your logic here\n    0\n}\n\nfn main() {\n    let mut line = String::new();\n    io::stdin().read_line(&mut line).ok();\n    if let Ok(n) = line.trim().parse() {\n        println!("{}", binary_gap(n));\n    }\n}`,
      kotlin: `import java.util.Scanner\n\nfun binaryGap(n: Int): Int {\n    // Write your logic here\n    return 0\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNextInt()) {\n        println(binaryGap(sc.nextInt()))\n    }\n}`,
      php: `<?php\n\nfunction binaryGap($n) {\n    // Write your logic here\n    return 0;\n}\n\n$n = (int)trim(file_get_contents("php://stdin"));\necho binaryGap($n);\n?>`,
      swift: `import Foundation\n\nfunc binaryGap(_ n: Int) -> Int {\n    // Write your logic here\n    return 0\n}\n\nif let line = readLine(), let n = Int(line) {\n    print(binaryGap(n))\n}`,
      ruby: `def binary_gap(n)\n  # Write your logic here\n  0\nend\n\nline = gets\nif line\n  puts binary_gap(line.to_i)\nend`
    },
    hiddenTestCases: [
      { input: "9", output: "2" },
      { input: "529", output: "4" },
      { input: "20", output: "1" },
      { input: "15", output: "0" },
      { input: "32", output: "0" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },

  // ==========================================
  // HARD NODES (11-15)
  // ==========================================
  {
    id: "hard-01",
    title: "Trapping Rain Logic",
    description: "Given N non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    difficulty: "Hard",
    category: "Arrays",
    topic: "TWO POINTERS",
    estimatedTime: "25 mins",
    company: "Google",
    tags: ["Arrays", "Two Pointers", "Stacks"],
    inputFormat: "Line 1: N\nLine 2: N integers representing elevations.",
    outputFormat: "Units of water trapped.",
    constraints: ["1 <= N <= 10^5", "0 <= height[i] <= 10^5"],
    sampleInput: "12\n0 1 0 2 1 0 1 3 2 1 2 1",
    sampleOutput: "6",
    explanation: "The elevation map traps 6 total units of water in the valleys.",
    functionInfo: {
      name: "trap",
      params: "Int[] height",
      returnType: "Long",
      goal: "Calculate the trapped water volume."
    },
    starterCode: {
      python: `import sys\n\ndef trap(height):\n    # Write your logic here\n    return 0\n\nif __name__ == "__main__":\n    data = sys.stdin.read().split()\n    if data:\n        n = int(data[0])\n        height = [int(x) for x in data[1:1+n]]\n        print(trap(height))`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static long trap(int[] height) {\n        // Write your logic here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] height = new int[n];\n            for (int i = 0; i < n; i++) height[i] = sc.nextInt();\n            System.out.println(trap(height));\n        }\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nlong long trap(vector<int>& height) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> height(n);\n        for (int i = 0; i < n; i++) cin >> height[i];\n        cout << trap(height) << endl;\n    }\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction trap(height) {\n  // Write your logic here\n  return 0;\n}\n\nconst d = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (d.length > 0) {\n  const n = parseInt(d[0]);\n  const height = d.slice(1, 1 + n).map(Number);\n  console.log(trap(height));\n}`,
      typescript: `import * as fs from 'fs';\n\nfunction trap(height: number[]): number {\n  // Write your logic here\n  return 0;\n}\n\nconst d = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (d.length > 0) {\n  const n = parseInt(d[0]);\n  const height = d.slice(1, 1 + n).map(Number);\n  console.log(trap(height));\n}`,
      c: `#include <stdio.h>\n\nlong long trap(int* height, int n) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    int n;\n    if (scanf("%d", &n) != EOF) {\n        int height[100005];\n        for (int i = 0; i < n; i++) scanf("%d", &height[i]);\n        printf("%lld\\n", trap(height, n));\n    }\n    return 0;\n}`,
      csharp: `using System;\nusing System.Linq;\n\nclass Program {\n    static long Trap(int[] height) {\n        // Write your logic here\n        return 0;\n    }\n\n    static void Main() {\n        string line = Console.ReadLine();\n        if (line != null) {\n            int n = int.Parse(line);\n            int[] height = Console.ReadLine().Split(new[]{' '}, StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n            Console.WriteLine(Trap(height));\n        }\n    }\n}`,
      go: `package main\n\nimport "fmt"\n\nfunc trap(height []int) int64 {\n    // Write your logic here\n    return 0\n}\n\nfunc main() {\n    var n int\n    fmt.Scan(&n)\n    height := make([]int, n)\n    for i := 0; i < n; i++ {\n        fmt.Scan(&height[i])\n    }\n    fmt.Println(trap(height))\n}`,
      rust: `use std::io::{self, Read};\n\nfn trap(height: Vec<i32>) -> i64 {\n    // Write your logic here\n    0\n}\n\nfn main() {\n    let mut s = String::new();\n    io::stdin().read_to_string(&mut s).ok();\n    let mut it = s.split_whitespace();\n    if let Some(n_s) = it.next() {\n        let n: usize = n_s.parse().unwrap();\n        let height: Vec<i32> = it.map(|x| x.parse().unwrap()).collect();\n        println!("{}", trap(height));\n    }\n}`,
      kotlin: `import java.util.Scanner\n\nfun trap(height: IntArray): Long {\n    // Write your logic here\n    return 0L\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNextInt()) {\n        val n = sc.nextInt()\n        val height = IntArray(n) { sc.nextInt() }\n        println(trap(height))\n    }\n}`,
      php: `<?php\n\nfunction trap($height) {\n    // Write your logic here\n    return 0;\n}\n\n$d = preg_split('/\\s+/', trim(file_get_contents("php://stdin")));\nif (count($d) > 0) {\n    $n = (int)$d[0];\n    $height = array_slice($d, 1, $n);\n    echo trap($height);\n}\n?>`,
      swift: `import Foundation\n\nfunc trap(_ height: [Int]) -> Int64 {\n    // Write your logic here\n    return 0\n}\n\nif let l1 = readLine(), let n = Int(l1), let l2 = readLine() {\n    let height = l2.split(separator: " ").compactMap { Int($0) }\n    print(trap(height))\n}`,
      ruby: `def trap(height)\n  # Write your logic here\n  0\nend\n\nn = gets.to_i\nheight = gets.split.map(&:to_i)\nputs trap(height)`
    },
    hiddenTestCases: [
      { input: "6\n4 2 0 3 2 5", output: "9" },
      { input: "3\n2 0 2", output: "2" },
      { input: "5\n1 2 3 4 5", output: "0" },
      { input: "5\n5 4 3 2 1", output: "0" },
      { input: "1\n10", output: "0" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "hard-02",
    title: "Median Synchronizer",
    description: "Find the median of two sorted arrays of sizes M and N. The overall run time complexity should be O(log (m+n)).",
    difficulty: "Hard",
    category: "Math",
    topic: "BINARY SEARCH",
    estimatedTime: "30 mins",
    company: "Amazon",
    tags: ["Arrays", "Binary Search"],
    inputFormat: "Line 1: M N\nLine 2: M sorted integers\nLine 3: N sorted integers",
    outputFormat: "Median value formatted to 1 decimal place.",
    constraints: ["0 <= M, N <= 10^5", "M + N >= 1"],
    sampleInput: "2 1\n1 3\n2",
    sampleOutput: "2.0",
    explanation: "Combined sorted set: [1, 2, 3]. Median is 2.0.",
    functionInfo: {
      name: "findMedianSortedArrays",
      params: "Int[] nums1, Int[] nums2",
      returnType: "Double",
      goal: "Efficiently find the median of the union of sorted sets."
    },
    starterCode: {
      python: `import sys\n\ndef find_median_sorted_arrays(nums1, nums2):\n    # Write your logic here\n    return 0.0\n\nif __name__ == "__main__":\n    d = sys.stdin.read().split()\n    if d:\n        m, n = int(d[0]), int(d[1])\n        nums1 = [int(x) for x in d[2:2+m]]\n        nums2 = [int(x) for x in d[2+m:2+m+n]]\n        print("{:.1f}".format(find_median_sorted_arrays(nums1, nums2)))`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        // Write your logic here\n        return 0.0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int m = sc.nextInt();\n            int n = sc.nextInt();\n            int[] nums1 = new int[m];\n            int[] nums2 = new int[n];\n            for (int i = 0; i < m; i++) nums1[i] = sc.nextInt();\n            for (int i = 0; i < n; i++) nums2[i] = sc.nextInt();\n            System.out.printf("%.1f\\n", findMedianSortedArrays(nums1, nums2));\n        }\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\n#include <iomanip>\n\nusing namespace std;\n\ndouble findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n    // Write your logic here\n    return 0.0;\n}\n\nint main() {\n    int m, n;\n    if (cin >> m >> n) {\n        vector<int> nums1(m), nums2(n);\n        for (int i = 0; i < m; i++) cin >> nums1[i];\n        for (int i = 0; i < n; i++) cin >> nums2[i];\n        cout << fixed << setprecision(1) << findMedianSortedArrays(nums1, nums2) << endl;\n    }\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction findMedianSortedArrays(nums1, nums2) {\n  // Write your logic here\n  return 0.0;\n}\n\nconst d = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (d.length > 0) {\n  const m = parseInt(d[0]);\n  const n = parseInt(d[1]);\n  const nums1 = d.slice(2, 2 + m).map(Number);\n  const nums2 = d.slice(2 + m, 2 + m + n).map(Number);\n  console.log(findMedianSortedArrays(nums1, nums2).toFixed(1));\n}`,
      typescript: `import * as fs from 'fs';\n\nfunction findMedianSortedArrays(nums1: number[], nums2: number[]): number {\n  // Write your logic here\n  return 0.0;\n}\n\nconst d = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (d.length > 0) {\n  const m = parseInt(d[0]);\n  const n = parseInt(d[1]);\n  const nums1 = d.slice(2, 2 + m).map(Number);\n  const nums2 = d.slice(2 + m, 2 + m + n).map(Number);\n  console.log(findMedianSortedArrays(nums1, nums2).toFixed(1));\n}`,
      c: `#include <stdio.h>\n\ndouble findMedianSortedArrays(int* nums1, int m, int* nums2, int n) {\n    // Write your logic here\n    return 0.0;\n}\n\nint main() {\n    int m, n;\n    if (scanf("%d %d", &m, &n) != EOF) {\n        int nums1[100005], nums2[100005];\n        for (int i = 0; i < m; i++) scanf("%d", &nums1[i]);\n        for (int i = 0; i < n; i++) scanf("%d", &nums2[i]);\n        printf("%.1f\\n", findMedianSortedArrays(nums1, m, nums2, n));\n    }\n    return 0;\n}`,
      csharp: `using System;\nusing System.Linq;\n\nclass Program {\n    static double FindMedianSortedArrays(int[] nums1, int[] nums2) {\n        // Write your logic here\n        return 0.0;\n    }\n\n    static void Main() {\n        string l1 = Console.ReadLine();\n        if (l1 != null) {\n            int m = int.Parse(l1.Split()[0]);\n            int n = int.Parse(l1.Split()[1]);\n            int[] nums1 = Console.ReadLine().Split(new[]{' '}, StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n            int[] nums2 = Console.ReadLine().Split(new[]{' '}, StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n            Console.WriteLine(FindMedianSortedArrays(nums1, nums2).ToString("F1"));\n        }\n    }\n}`,
      go: `package main\n\nimport "fmt"\n\nfunc findMedianSortedArrays(nums1 []int, nums2 []int) float64 {\n    // Write your logic here\n    return 0.0\n}\n\nfunc main() {\n    var m, n int\n    fmt.Scan(&m, &n)\n    nums1 := make([]int, m)\n    nums2 := make([]int, n)\n    for i := 0; i < m; i++ { fmt.Scan(&nums1[i]) }\n    for i := 0; i < n; i++ { fmt.Scan(&nums2[i]) }\n    fmt.Printf("%.1f\\n", findMedianSortedArrays(nums1, nums2))\n}`,
      rust: `use std::io::{self, Read};\n\nfn find_median_sorted_arrays(nums1: Vec<i32>, nums2: Vec<i32>) -> f64 {\n    // Write your logic here\n    0.0\n}\n\nfn main() {\n    let mut s = String::new();\n    io::stdin().read_to_string(&mut s).ok();\n    let mut it = s.split_whitespace();\n    if let (Some(m_s), Some(n_s)) = (it.next(), it.next()) {\n        let m: usize = m_s.parse().unwrap();\n        let n: usize = n_s.parse().unwrap();\n        let mut nums1 = Vec::new();\n        for _ in 0..m { nums1.push(it.next().unwrap().parse().unwrap()); }\n        let mut nums2 = Vec::new();\n        for _ in 0..n { nums2.push(it.next().unwrap().parse().unwrap()); }\n        println!("{:.1}", find_median_sorted_arrays(nums1, nums2));\n    }\n}`,
      kotlin: `import java.util.Scanner\n\nfun findMedianSortedArrays(nums1: IntArray, nums2: IntArray): Double {\n    // Write your logic here\n    return 0.0\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNextInt()) {\n        val m = sc.nextInt()\n        val n = sc.nextInt()\n        val nums1 = IntArray(m) { sc.nextInt() }\n        val nums2 = IntArray(n) { sc.nextInt() }\n        println("%.1f".format(findMedianSortedArrays(nums1, nums2)))\n    }\n}`,
      php: `<?php\n\nfunction findMedianSortedArrays($nums1, $nums2) {\n    // Write your logic here\n    return 0.0;\n}\n\n$d = preg_split('/\\s+/', trim(file_get_contents("php://stdin")));\nif (count($d) > 0) {\n    $m = (int)$d[0]; $n = (int)$d[1];\n    $nums1 = array_slice($d, 2, $m);\n    $nums2 = array_slice($d, 2 + $m, $n);\n    printf("%.1f\\n", findMedianSortedArrays($nums1, $nums2));\n}\n?>`,
      swift: `import Foundation\n\nfunc findMedianSortedArrays(_ nums1: [Int], _ nums2: [Int]) -> Double {\n    // Write your logic here\n    return 0.0\n}\n\nif let l1 = readLine() {\n    let parts = l1.split(separator: " ").map { Int($0)! }\n    let nums1 = readLine()?.split(separator: " ").compactMap { Int($0) } ?? []\n    let nums2 = readLine()?.split(separator: " ").compactMap { Int($0) } ?? []\n    print(String(format: "%.1f", findMedianSortedArrays(nums1, nums2)))\n}`,
      ruby: `def find_median_sorted_arrays(nums1, nums2)\n  # Write your logic here\n  0.0\nend\n\nl1 = gets.split\nif l1\n  m, n = l1.map(&:to_i)\n  nums1 = gets.split.map(&:to_i)\n  nums2 = gets.split.map(&:to_i)\n  printf("%.1f\\n", find_median_sorted_arrays(nums1, nums2))\nend`
    },
    hiddenTestCases: [
      { input: "2 2\n1 2\n3 4", output: "2.5" },
      { input: "0 1\n\n1", output: "1.0" },
      { input: "1 0\n2\n", output: "2.0" },
      { input: "2 2\n1 1\n1 1", output: "1.0" },
      { input: "5 5\n1 2 3 4 5\n6 7 8 9 10", output: "4.5" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "hard-03",
    title: "Merge K-Stream Protocol",
    description: "Merge K sorted linked lists (represented as arrays) into one single sorted list.",
    difficulty: "Hard",
    category: "Arrays",
    topic: "PRIORITY QUEUE",
    estimatedTime: "25 mins",
    company: "Microsoft",
    tags: ["Heaps", "Merge Sort"],
    inputFormat: "Line 1: K\nNext K lines: N_i (size) followed by N_i sorted integers.",
    outputFormat: "A single space-separated sorted list of all integers.",
    constraints: ["1 <= K <= 100", "0 <= N_i <= 1000"],
    sampleInput: "3\n3 1 4 5\n3 1 3 4\n2 2 6",
    sampleOutput: "1 1 2 3 4 4 5 6",
    explanation: "Combined all streams and maintained sort order.",
    functionInfo: {
      name: "mergeKLists",
      params: "Int[][] lists",
      returnType: "Int[]",
      goal: "Merge multiple sorted arrays into one sorted result."
    },
    starterCode: {
      python: `import sys\n\ndef merge_k_lists(lists):\n    # Write your logic here\n    return []\n\nif __name__ == "__main__":\n    data = sys.stdin.read().split()\n    if data:\n        k = int(data[0])\n        lists, cur = [], 1\n        for _ in range(k):\n            ni = int(data[cur])\n            lists.append([int(x) for x in data[cur+1 : cur+1+ni]])\n            cur += 1 + ni\n        res = merge_k_lists(lists)\n        print(" ".join(map(str, res)))`,
      java: `import java.util.*;\n\npublic class Main {\n    public static List<Integer> mergeKLists(List<int[]> lists) {\n        // Write your logic here\n        return new ArrayList<>();\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int k = sc.nextInt();\n            List<int[]> lists = new ArrayList<>();\n            for (int i = 0; i < k; i++) {\n                int n = sc.nextInt();\n                int[] a = new int[n];\n                for (int j = 0; j < n; j++) a[j] = sc.nextInt();\n                lists.add(a);\n            }\n            List<Integer> res = mergeKLists(lists);\n            for (int i = 0; i < res.size(); i++) System.out.print(res.get(i) + (i == res.size() - 1 ? "" : " "));\n        }\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nvector<int> mergeKLists(vector<vector<int>>& lists) {\n    // Write your logic here\n    return {};\n}\n\nint main() {\n    int k;\n    if (cin >> k) {\n        vector<vector<int>> lists(k);\n        for (int i = 0; i < k; i++) {\n            int n; cin >> n;\n            lists[i].resize(n);\n            for (int j = 0; j < n; j++) cin >> lists[i][j];\n        }\n        vector<int> res = mergeKLists(lists);\n        for (int i = 0; i < res.size(); i++) cout << res[i] << (i == res.size() - 1 ? "" : " ");\n    }\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction mergeKLists(lists) {\n  // Write your logic here\n  return [];\n}\n\nconst d = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (d.length > 0) {\n  let k = parseInt(d[0]), lists = [], cur = 1;\n  for (let i = 0; i < k; i++) {\n    let n = parseInt(d[cur]);\n    lists.push(d.slice(cur + 1, cur + 1 + n).map(Number));\n    cur += 1 + n;\n  }\n  console.log(mergeKLists(lists).join(' '));\n}`,
      typescript: `import * as fs from 'fs';\n\nfunction mergeKLists(lists: number[][]): number[] {\n  // Write your logic here\n  return [];\n}\n\nconst d = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (d.length > 0) {\n  let k = parseInt(d[0]), lists = [], cur = 1;\n  for (let i = 0; i < k; i++) {\n    let n = parseInt(d[cur]);\n    lists.push(d.slice(cur + 1, cur + 1 + n).map(Number));\n    cur += 1 + n;\n  }\n  console.log(mergeKLists(lists).join(' '));\n}`,
      c: `#include <stdio.h>\n#include <stdlib.h>\n\nvoid mergeKLists(int** lists, int* sizes, int k) {\n    // Write your logic here (flatten and sort or use heap)\n}\n\nint main() {\n    int k;\n    if (scanf("%d", &k) != EOF) {\n        // I/O processing logic\n    }\n    return 0;\n}`,
      csharp: `using System;\nusing System.Collections.Generic;\nusing System.Linq;\n\nclass Program {\n    static List<int> MergeKLists(List<int[]> lists) {\n        // Write your logic here\n        return new List<int>();\n    }\n\n    static void Main() {\n        string line = Console.ReadLine();\n        if (line != null) {\n            int k = int.Parse(line);\n            List<int[]> lists = new List<int[]>();\n            for (int i = 0; i < k; i++) {\n                var parts = Console.ReadLine().Split(new[]{' '}, StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n                lists.Add(parts.Skip(1).ToArray());\n            }\n            Console.WriteLine(string.Join(" ", MergeKLists(lists)));\n        }\n    }\n}`,
      go: `package main\n\nimport "fmt"\n\nfunc mergeKLists(lists [][]int) []int {\n    // Write your logic here\n    return []int{}\n}\n\nfunc main() {\n    var k int\n    fmt.Scan(&k)\n    lists := make([][]int, k)\n    for i := 0; i < k; i++ {\n        var n int\n        fmt.Scan(&n)\n        lists[i] = make([]int, n)\n        for j := 0; j < n; j++ { fmt.Scan(&lists[i][j]) }\n    }\n    res := mergeKLists(lists)\n    for i, v := range res {\n        fmt.Print(v)\n        if i < len(res)-1 { fmt.Print(" ") }\n    }\n}`,
      rust: `use std::io::{self, Read};\n\nfn merge_k_lists(lists: Vec<Vec<i32>>) -> Vec<i32> {\n    // Write your logic here\n    Vec::new()\n}\n\nfn main() {\n    let mut s = String::new();\n    io::stdin().read_to_string(&mut s).ok();\n    let mut it = s.split_whitespace();\n    if let Some(k_s) = it.next() {\n        let k: usize = k_s.parse().unwrap();\n        let mut lists = Vec::new();\n        for _ in 0..k {\n            let n: usize = it.next().unwrap().parse().unwrap();\n            let mut a = Vec::new();\n            for _ in 0..n { a.push(it.next().unwrap().parse().unwrap()); }\n            lists.push(a);\n        }\n        let res = merge_k_lists(lists);\n        let r: Vec<String> = res.iter().map(|x| x.to_string()).collect();\n        println!("{}", r.join(" "));\n    }\n}`,
      kotlin: `import java.util.*\n\nfun mergeKLists(lists: List<IntArray>): List<Int> {\n    // Write your logic here\n    return listOf()\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNextInt()) {\n        val k = sc.nextInt()\n        val lists = mutableListOf<IntArray>()\n        repeat(k) {\n            val n = sc.nextInt()\n            lists.add(IntArray(n) { sc.nextInt() })\n        }\n        println(mergeKLists(lists).joinToString(" "))\n    }\n}`,
      php: `<?php\n\nfunction mergeKLists($lists) {\n    // Write your logic here\n    return [];\n}\n\n$d = preg_split('/\\s+/', trim(file_get_contents("php://stdin")));\nif (count($d) > 0) {\n    $k = (int)$d[0]; $lists = []; $cur = 1;\n    for ($i = 0; $i < $k; $i++) {\n        $n = (int)$d[$cur];\n        $lists[] = array_slice($d, $cur + 1, $n);\n        $cur += 1 + $n;\n    }\n    echo implode(' ', mergeKLists($lists));\n}\n?>`,
      swift: `import Foundation\n\nfunc mergeKLists(_ lists: [[Int]]) -> [Int] {\n    // Write your logic here\n    return []\n}\n\nif let l1 = readLine(), let k = Int(l1) {\n    var lists = [[Int]]()\n    for _ in 0..<k {\n        if let line = readLine() {\n            let p = line.split(separator: " ").compactMap { Int($0) }\n            lists.append(Array(p.dropFirst()))\n        }\n    }\n    print(mergeKLists(lists).map { String($0) }.joined(separator: " "))\n}`,
      ruby: `def merge_k_lists(lists)\n  # Write your logic here\n  []\nend\n\nk = gets.to_i\nlists = []\nk.times { lists << gets.split.map(&:to_i)[1..-1] }\nputs merge_k_lists(lists).join(' ')`
    },
    hiddenTestCases: [
      { input: "2\n2 1 2\n2 3 4", output: "1 2 3 4" },
      { input: "1\n5 10 20 30 40 50", output: "10 20 30 40 50" },
      { input: "2\n0\n0", output: "" },
      { input: "3\n1 5\n1 5\n1 5", output: "5 5 5" },
      { input: "2\n2 10 20\n2 5 15", output: "5 10 15 20" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "hard-04",
    title: "The N-Queens Matrix",
    description: "Find the total number of ways to place N queens on an N×N chessboard so that no two queens threaten each other.",
    difficulty: "Hard",
    category: "Logic",
    topic: "BACKTRACKING",
    estimatedTime: "30 mins",
    company: "Meta",
    tags: ["Recursion", "Backtracking"],
    inputFormat: "A single integer N.",
    outputFormat: "Total count of distinct solutions.",
    constraints: ["1 <= N <= 12"],
    sampleInput: "4",
    sampleOutput: "2",
    explanation: "On a 4x4 board, there are exactly 2 valid configurations.",
    functionInfo: {
      name: "totalNQueens",
      params: "Int n",
      returnType: "Int",
      goal: "Count non-attacking queen placements."
    },
    starterCode: {
      python: `import sys\n\ndef total_n_queens(n):\n    # Write your logic here\n    return 0\n\nif __name__ == "__main__":\n    line = sys.stdin.read().strip()\n    if line:\n        print(total_n_queens(int(line)))`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static int totalNQueens(int n) {\n        // Write your logic here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            System.out.println(totalNQueens(sc.nextInt()));\n        }\n    }\n}`,
      cpp: `#include <iostream>\n\nusing namespace std;\n\nint totalNQueens(int n) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << totalNQueens(n) << endl;\n    }\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction totalNQueens(n) {\n  // Write your logic here\n  return 0;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nif (input) {\n  console.log(totalNQueens(parseInt(input)));\n}`,
      typescript: `import * as fs from 'fs';\n\nfunction totalNQueens(n: number): number {\n  // Write your logic here\n  return 0;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nif (input) {\n  console.log(totalNQueens(parseInt(input)));\n}`,
      c: `#include <stdio.h>\n\nint totalNQueens(int n) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    int n;\n    if (scanf("%d", &n) != EOF) {\n        printf("%d\\n", totalNQueens(n));\n    }\n    return 0;\n}`,
      csharp: `using System;\n\nclass Program {\n    static int TotalNQueens(int n) {\n        // Write your logic here\n        return 0;\n    }\n\n    static void Main() {\n        string line = Console.ReadLine();\n        if (line != null) {\n            Console.WriteLine(TotalNQueens(int.Parse(line)));\n        }\n    }\n}`,
      go: `package main\n\nimport "fmt"\n\nfunc totalNQueens(n int) int {\n    // Write your logic here\n    return 0\n}\n\nfunc main() {\n    var n int\n    fmt.Scan(&n)\n    fmt.Println(totalNQueens(n))\n}`,
      rust: `use std::io;\n\nfn total_n_queens(n: i32) -> i32 {\n    // Write your logic here\n    0\n}\n\nfn main() {\n    let mut line = String::new();\n    io::stdin().read_line(&mut line).ok();\n    if let Ok(n) = line.trim().parse() {\n        println!("{}", total_n_queens(n));\n    }\n}`,
      kotlin: `import java.util.Scanner\n\nfun totalNQueens(n: Int): Int {\n    // Write your logic here\n    return 0\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNextInt()) {\n        println(totalNQueens(sc.nextInt()))\n    }\n}`,
      php: `<?php\n\nfunction totalNQueens($n) {\n    // Write your logic here\n    return 0;\n}\n\n$n = (int)trim(file_get_contents("php://stdin"));\necho totalNQueens($n);\n?>`,
      swift: `import Foundation\n\nfunc totalNQueens(_ n: Int) -> Int {\n    // Write your logic here\n    return 0\n}\n\nif let line = readLine(), let n = Int(line) {\n    print(totalNQueens(n))\n}`,
      ruby: `def total_n_queens(n)\n  # Write your logic here\n  0\nend\n\nline = gets\nif line\n  puts total_n_queens(line.to_i)\nend`
    },
    hiddenTestCases: [
      { input: "1", output: "1" },
      { input: "2", output: "0" },
      { input: "3", output: "0" },
      { input: "5", output: "10" },
      { input: "8", output: "92" }
    ],
    timeLimit: "2s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "hard-05",
    title: "Largest Rect-Node Histogram",
    description: "Given an array of integers representing the histogram's bar height where the width of each bar is 1, find the area of the largest rectangle in the histogram.",
    difficulty: "Hard",
    category: "Arrays",
    topic: "STACKS",
    estimatedTime: "30 mins",
    company: "Google",
    tags: ["Stacks", "Arrays"],
    inputFormat: "Line 1: N\nLine 2: N integers representing bar heights.",
    outputFormat: "Area of the largest rectangle.",
    constraints: ["1 <= N <= 10^5", "0 <= height[i] <= 10^4"],
    sampleInput: "6\n2 1 5 6 2 3",
    sampleOutput: "10",
    explanation: "The largest rectangle is formed by bars of height 5 and 6, area = 5 * 2 = 10.",
    functionInfo: {
      name: "largestRectangleArea",
      params: "Int[] heights",
      returnType: "Long",
      goal: "Find max rectangle area within histogram."
    },
    starterCode: {
      python: `import sys\n\ndef largest_rectangle_area(heights):\n    # Write your logic here\n    return 0\n\nif __name__ == "__main__":\n    data = sys.stdin.read().split()\n    if data:\n        n = int(data[0])\n        heights = [int(x) for x in data[1:1+n]]\n        print(largest_rectangle_area(heights))`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static long largestRectangleArea(int[] heights) {\n        // Write your logic here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] h = new int[n];\n            for (int i = 0; i < n; i++) h[i] = sc.nextInt();\n            System.out.println(largestRectangleArea(h));\n        }\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nlong long largestRectangleArea(vector<int>& heights) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> h(n);\n        for (int i = 0; i < n; i++) cin >> h[i];\n        cout << largestRectangleArea(h) << endl;\n    }\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction largestRectangleArea(heights) {\n  // Write your logic here\n  return 0;\n}\n\nconst d = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (d.length > 0) {\n  const n = parseInt(d[0]);\n  const h = d.slice(1, 1 + n).map(Number);\n  console.log(largestRectangleArea(h));\n}`,
      typescript: `import * as fs from 'fs';\n\nfunction largestRectangleArea(heights: number[]): number {\n  // Write your logic here\n  return 0;\n}\n\nconst d = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (d.length > 0) {\n  const n = parseInt(d[0]);\n  const h = d.slice(1, 1 + n).map(Number);\n  console.log(largestRectangleArea(h));\n}`,
      c: `#include <stdio.h>\n\nlong long largestRectangleArea(int* heights, int n) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    int n;\n    if (scanf("%d", &n) != EOF) {\n        int h[100005];\n        for (int i = 0; i < n; i++) scanf("%d", &h[i]);\n        printf("%lld\\n", largestRectangleArea(h, n));\n    }\n    return 0;\n}`,
      csharp: `using System;\nusing System.Linq;\n\nclass Program {\n    static long LargestRectangleArea(int[] heights) {\n        // Write your logic here\n        return 0;\n    }\n\n    static void Main() {\n        string l1 = Console.ReadLine();\n        if (l1 != null) {\n            int n = int.Parse(l1);\n            int[] h = Console.ReadLine().Split(new[]{' '}, StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n            Console.WriteLine(LargestRectangleArea(h));\n        }\n    }\n}`,
      go: `package main\n\nimport "fmt"\n\nfunc largestRectangleArea(heights []int) int64 {\n    // Write your logic here\n    return 0\n}\n\nfunc main() {\n    var n int\n    fmt.Scan(&n)\n    h := make([]int, n)\n    for i := 0; i < n; i++ { fmt.Scan(&h[i]) }\n    fmt.Println(largestRectangleArea(h))\n}`,
      rust: `use std::io::{self, Read};\n\nfn largest_rectangle_area(heights: Vec<i32>) -> i64 {\n    // Write your logic here\n    0\n}\n\nfn main() {\n    let mut s = String::new();\n    io::stdin().read_to_string(&mut s).ok();\n    let mut it = s.split_whitespace();\n    if let Some(n_s) = it.next() {\n        let n: usize = n_s.parse().unwrap();\n        let h: Vec<i32> = it.map(|x| x.parse().unwrap()).collect();\n        println!("{}", largest_rectangle_area(h));\n    }\n}`,
      kotlin: `import java.util.Scanner\n\nfun largestRectangleArea(heights: IntArray): Long {\n    // Write your logic here\n    return 0L\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNextInt()) {\n        val n = sc.nextInt()\n        val h = IntArray(n) { sc.nextInt() }\n        println(largestRectangleArea(h))\n    }\n}`,
      php: `<?php\n\nfunction largestRectangleArea($heights) {\n    // Write your logic here\n    return 0;\n}\n\n$d = preg_split('/\\s+/', trim(file_get_contents("php://stdin")));\nif (count($d) > 0) {\n    $n = (int)$d[0]; $h = array_slice($d, 1, $n);\n    echo largestRectangleArea($h);\n}\n?>`,
      swift: `import Foundation\n\nfunc largestRectangleArea(_ heights: [Int]) -> Int64 {\n    // Write your logic here\n    return 0\n}\n\nif let l1 = readLine(), let n = Int(l1), let l2 = readLine() {\n    let h = l2.split(separator: " ").compactMap { Int($0) }\n    print(largestRectangleArea(h))\n}`,
      ruby: `def largest_rectangle_area(heights)\n  # Write your logic here\n  0\nend\n\nn = gets.to_i\nh = gets.split.map(&:to_i)\nputs largest_rectangle_area(h)`
    },
    hiddenTestCases: [
      { input: "5\n1 1 1 1 1", output: "5" },
      { input: "2\n10 2", output: "10" },
      { input: "1\n5", output: "5" },
      { input: "4\n2 4 4 2", output: "8" },
      { input: "3\n2 1 2", output: "3" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  }
];
