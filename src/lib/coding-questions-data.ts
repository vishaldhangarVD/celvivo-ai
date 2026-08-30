/**
 * @fileOverview Nexvoro AI Master Question Data (v30.0 - 30 Audited Nodes, 13 Languages).
 * A high-fidelity repository of coding challenges across all difficulty tiers.
 * Every node provides full runnable boilerplates for 13 languages with optimized I/O.
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
  // EASY NODES (01-10)
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
  {
    id: "easy-06",
    title: "Peak Element Finder",
    description: "Find the maximum element in an array of integers.",
    difficulty: "Easy",
    category: "Arrays",
    topic: "SEARCHING",
    estimatedTime: "5 mins",
    company: "TCS",
    tags: ["Arrays", "Basics"],
    inputFormat: "Line 1: N\nLine 2: N space-separated integers.",
    outputFormat: "The maximum value.",
    constraints: ["1 <= N <= 1000", "-10^9 <= arr[i] <= 10^9"],
    sampleInput: "5\n1 9 3 7 5",
    sampleOutput: "9",
    explanation: "9 is the largest element in the set.",
    functionInfo: {
      name: "findMax",
      params: "Int[] arr",
      returnType: "Int",
      goal: "Return the largest integer in the array."
    },
    starterCode: {
      python: `import sys\n\ndef find_max(arr):\n    # Write your logic here\n    return 0\n\nif __name__ == "__main__":\n    data = sys.stdin.read().split()\n    if data:\n        n = int(data[0])\n        arr = [int(x) for x in data[1:1+n]]\n        print(find_max(arr))`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static int findMax(int[] arr) {\n        // Write your logic here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] arr = new int[n];\n            for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n            System.out.println(findMax(arr));\n        }\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nint findMax(vector<int>& arr) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> arr(n);\n        for (int i = 0; i < n; i++) cin >> arr[i];\n        cout << findMax(arr) << endl;\n    }\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction findMax(arr) {\n  // Write your logic here\n  return 0;\n}\n\nconst input = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (input.length > 1) {\n  const n = parseInt(input[0]);\n  const arr = input.slice(1, n + 1).map(Number);\n  console.log(findMax(arr));\n}`,
      typescript: `import * as fs from 'fs';\n\nfunction findMax(arr: number[]): number {\n  // Write your logic here\n  return 0;\n}\n\nconst input = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (input.length > 1) {\n  const n = parseInt(input[0]);\n  const arr = input.slice(1, n + 1).map(Number);\n  console.log(findMax(arr));\n}`,
      c: `#include <stdio.h>\n\nint findMax(int* arr, int n) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    int n;\n    if (scanf("%d", &n) != EOF) {\n        int arr[1005];\n        for (int i = 0; i < n; i++) scanf("%d", &arr[i]);\n        printf("%d\\n", findMax(arr, n));\n    }\n    return 0;\n}`,
      csharp: `using System;\nusing System.Linq;\n\nclass Program {\n    static int FindMax(int[] arr) {\n        // Write your logic here\n        return 0;\n    }\n\n    static void Main() {\n        string l1 = Console.ReadLine();\n        if (l1 != null) {\n            int n = int.Parse(l1);\n            int[] arr = Console.ReadLine().Split().Select(int.Parse).ToArray();\n            Console.WriteLine(FindMax(arr));\n        }\n    }\n}`,
      go: `package main\n\nimport "fmt"\n\nfunc findMax(arr []int) int {\n    // Write your logic here\n    return 0\n}\n\nfunc main() {\n    var n int\n    fmt.Scan(&n)\n    arr := make([]int, n)\n    for i := 0; i < n; i++ { fmt.Scan(&arr[i]) }\n    fmt.Println(findMax(arr))\n}`,
      rust: `use std::io::{self, Read};\n\nfn find_max(arr: Vec<i32>) -> i32 {\n    // Write your logic here\n    0\n}\n\nfn main() {\n    let mut s = String::new();\n    io::stdin().read_to_string(&mut s).ok();\n    let mut it = s.split_whitespace();\n    if let Some(n_s) = it.next() {\n        let arr: Vec<i32> = it.map(|x| x.parse().unwrap()).collect();\n        println!("{}", find_max(arr));\n    }\n}`,
      kotlin: `import java.util.Scanner\n\nfun findMax(arr: IntArray): Int {\n    // Write your logic here\n    return 0\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNextInt()) {\n        val n = sc.nextInt()\n        val arr = IntArray(n) { sc.nextInt() }\n        println(findMax(arr))\n    }\n}`,
      php: `<?php\n\nfunction findMax($arr) {\n    // Write your logic here\n    return 0;\n}\n\n$d = preg_split('/\\s+/', trim(file_get_contents("php://stdin")));\nif (count($d) > 1) {\n    $n = (int)$d[0]; $arr = array_slice($d, 1, $n);\n    echo findMax($arr);\n}\n?>`,
      swift: `import Foundation\n\nfunc findMax(_ arr: [Int]) -> Int {\n    // Write your logic here\n    return 0\n}\n\nif let l1 = readLine(), let n = Int(l1), let l2 = readLine() {\n    let arr = l2.split(separator: " ").compactMap { Int($0) }\n    print(findMax(arr))\n}`,
      ruby: `def find_max(arr)\n  # Write your logic here\n  0\nend\n\nn = gets.to_i\narr = gets.split.map(&:to_i)\nputs find_max(arr)`
    },
    hiddenTestCases: [
      { input: "3\n-5 -1 -10", output: "-1" },
      { input: "1\n100", output: "100" },
      { input: "5\n0 0 0 0 0", output: "0" },
      { input: "4\n1 2 3 4", output: "4" },
      { input: "2\n10 5", output: "10" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "easy-07",
    title: "Cipher Reversal",
    description: "Reverse a given string S.",
    difficulty: "Easy",
    category: "Strings",
    topic: "BASIC MANIPULATION",
    estimatedTime: "5 mins",
    company: "Infosys",
    tags: ["Strings"],
    inputFormat: "A single string S.",
    outputFormat: "The reversed string.",
    constraints: ["1 <= |S| <= 1000"],
    sampleInput: "nexvoro",
    sampleOutput: "orovxen",
    explanation: "Self-explanatory reversal.",
    functionInfo: {
      name: "reverseString",
      params: "String s",
      returnType: "String",
      goal: "Reverse the string s."
    },
    starterCode: {
      python: `import sys\n\ndef reverse_string(s):\n    # Write your logic here\n    return ""\n\nif __name__ == "__main__":\n    s = sys.stdin.read().strip()\n    print(reverse_string(s))`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static String reverseString(String s) {\n        // Write your logic here\n        return "";\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            System.out.println(reverseString(sc.nextLine()));\n        }\n    }\n}`,
      cpp: `#include <iostream>\n#include <string>\n#include <algorithm>\n\nusing namespace std;\n\nstring reverseString(string s) {\n    // Write your logic here\n    return "";\n}\n\nint main() {\n    string s;\n    getline(cin, s);\n    cout << reverseString(s) << endl;\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction reverseString(s) {\n  // Write your logic here\n  return "";\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nconsole.log(reverseString(input));`,
      typescript: `import * as fs from 'fs';\n\nfunction reverseString(s: string): string {\n  // Write your logic here\n  return "";\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nconsole.log(reverseString(input));`,
      c: `#include <stdio.h>\n#include <string.h>\n\nvoid reverseString(char* s) {\n    // Write your logic here (modify s or print reverse)\n}\n\nint main() {\n    char s[1005];\n    if (scanf("%s", s) != EOF) {\n        reverseString(s);\n        printf("%s\\n", s);\n    }\n    return 0;\n}`,
      csharp: `using System;\nusing System.Linq;\n\nclass Program {\n    static string ReverseString(string s) {\n        // Write your logic here\n        return "";\n    }\n\n    static void Main() {\n        string s = Console.ReadLine();\n        if (s != null) {\n            Console.WriteLine(ReverseString(s.Trim()));\n        }\n    }\n}`,
      go: `package main\n\nimport "fmt"\n\nfunc reverseString(s string) string {\n    // Write your logic here\n    return ""\n}\n\nfunc main() {\n    var s string\n    fmt.Scan(&s)\n    fmt.Println(reverseString(s))\n}`,
      rust: `use std::io;\n\nfn reverse_string(s: &str) -> String {\n    // Write your logic here\n    String::new()\n}\n\nfn main() {\n    let mut line = String::new();\n    io::stdin().read_line(&mut line).ok();\n    println!("{}", reverse_string(line.trim()));\n}`,
      kotlin: `import java.util.Scanner\n\nfun reverseString(s: String): String {\n    // Write your logic here\n    return ""\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNextLine()) {\n        println(reverseString(sc.nextLine()))\n    }\n}`,
      php: `<?php\n\nfunction reverseString($s) {\n    // Write your logic here\n    return "";\n}\n\n$s = trim(file_get_contents("php://stdin"));\necho reverseString($s);\n?>`,
      swift: `import Foundation\n\nfunc reverseString(_ s: String) -> String {\n    // Write your logic here\n    return ""\n}\n\nif let s = readLine() {\n    print(reverseString(s))\n}`,
      ruby: `def reverse_string(s)\n  # Write your logic here\n  ""\nend\n\ns = STDIN.read.strip\nputs reverse_string(s)`
    },
    hiddenTestCases: [
      { input: "abc", output: "cba" },
      { input: "123", output: "321" },
      { input: "A", output: "A" },
      { input: "racecar", output: "racecar" },
      { input: "hello world", output: "dlrow olleh" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "easy-08",
    title: "Prime Neural Check",
    description: "Determine if a number N is prime.",
    difficulty: "Easy",
    category: "Math",
    topic: "NUMERIC LOGIC",
    estimatedTime: "5 mins",
    company: "Wipro",
    tags: ["Math", "Primes"],
    inputFormat: "A single integer N.",
    outputFormat: "YES or NO.",
    constraints: ["1 <= N <= 10^9"],
    sampleInput: "7",
    sampleOutput: "YES",
    explanation: "7 is only divisible by 1 and itself.",
    functionInfo: {
      name: "isPrime",
      params: "Int n",
      returnType: "Boolean",
      goal: "Check if n is prime."
    },
    starterCode: {
      python: `import sys\n\ndef is_prime(n):\n    # Write your logic here\n    return False\n\nif __name__ == "__main__":\n    line = sys.stdin.read().strip()\n    if line:\n        if is_prime(int(line)):\n            print("YES")\n        else:\n            print("NO")`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static boolean isPrime(int n) {\n        // Write your logic here\n        return false;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            System.out.println(isPrime(sc.nextInt()) ? "YES" : "NO");\n        }\n    }\n}`,
      cpp: `#include <iostream>\n\nusing namespace std;\n\nbool isPrime(int n) {\n    // Write your logic here\n    return false;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << (isPrime(n) ? "YES" : "NO") << endl;\n    }\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction isPrime(n) {\n  // Write your logic here\n  return false;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nif (input) {\n  console.log(isPrime(parseInt(input)) ? "YES" : "NO");\n}`,
      typescript: `import * as fs from 'fs';\n\nfunction isPrime(n: number): boolean {\n  // Write your logic here\n  return false;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nif (input) {\n  console.log(isPrime(parseInt(input)) ? "YES" : "NO");\n}`,
      c: `#include <stdio.h>\n#include <stdbool.h>\n\nbool isPrime(int n) {\n    // Write your logic here\n    return false;\n}\n\nint main() {\n    int n;\n    if (scanf("%d", &n) != EOF) {\n        printf("%s\\n", isPrime(n) ? "YES" : "NO");\n    }\n    return 0;\n}`,
      csharp: `using System;\n\nclass Program {\n    static bool IsPrime(int n) {\n        // Write your logic here\n        return false;\n    }\n\n    static void Main() {\n        string line = Console.ReadLine();\n        if (line != null) {\n            Console.WriteLine(IsPrime(int.Parse(line)) ? "YES" : "NO");\n        }\n    }\n}`,
      go: `package main\n\nimport "fmt"\n\nfunc isPrime(n int) bool {\n    // Write your logic here\n    return false\n}\n\nfunc main() {\n    var n int\n    fmt.Scan(&n)\n    if isPrime(n) { fmt.Println("YES") } else { fmt.Println("NO") }\n}`,
      rust: `use std::io;\n\nfn is_prime(n: i32) -> bool {\n    // Write your logic here\n    false\n}\n\nfn main() {\n    let mut line = String::new();\n    io::stdin().read_line(&mut line).ok();\n    if let Ok(n) = line.trim().parse() {\n        println!("{}", if is_prime(n) { "YES" } else { "NO" });\n    }\n}`,
      kotlin: `import java.util.Scanner\n\nfun isPrime(n: Int): Boolean {\n    // Write your logic here\n    return false\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNextInt()) {\n        println(if (isPrime(sc.nextInt())) "YES" else "NO")\n    }\n}`,
      php: `<?php\n\nfunction isPrime($n) {\n    // Write your logic here\n    return false;\n}\n\n$n = (int)trim(file_get_contents("php://stdin"));\necho isPrime($n) ? "YES" : "NO";\n?>`,
      swift: `import Foundation\n\nfunc isPrime(_ n: Int) -> Bool {\n    // Write your logic here\n    return false\n}\n\nif let line = readLine(), let n = Int(line) {\n    print(isPrime(n) ? "YES" : "NO")\n}`,
      ruby: `def is_prime(n)\n  # Write your logic here\n  false\nend\n\nline = gets\nif line\n  puts is_prime(line.to_i) ? "YES" : "NO"\nend`
    },
    hiddenTestCases: [
      { input: "1", output: "NO" },
      { input: "2", output: "YES" },
      { input: "4", output: "NO" },
      { input: "13", output: "YES" },
      { input: "25", output: "NO" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "easy-09",
    title: "Lexical Node Counter",
    description: "Count the number of words in a sentence. Words are separated by spaces.",
    difficulty: "Easy",
    category: "Strings",
    topic: "TEXT PARSING",
    estimatedTime: "5 mins",
    company: "Cognizant",
    tags: ["Strings", "Parsing"],
    inputFormat: "A string S.",
    outputFormat: "Total word count.",
    constraints: ["1 <= |S| <= 1000"],
    sampleInput: "The quick brown fox",
    sampleOutput: "4",
    explanation: "There are four distinct words.",
    functionInfo: {
      name: "countWords",
      params: "String s",
      returnType: "Int",
      goal: "Count the number of tokens in the sentence."
    },
    starterCode: {
      python: `import sys\n\ndef count_words(s):\n    # Write your logic here\n    return 0\n\nif __name__ == "__main__":\n    s = sys.stdin.read().strip()\n    print(count_words(s))`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static int countWords(String s) {\n        // Write your logic here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            System.out.println(countWords(sc.nextLine()));\n        }\n    }\n}`,
      cpp: `#include <iostream>\n#include <string>\n#include <sstream>\n\nusing namespace std;\n\nint countWords(string s) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    string s;\n    getline(cin, s);\n    cout << countWords(s) << endl;\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction countWords(s) {\n  // Write your logic here\n  return 0;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nconsole.log(countWords(input));`,
      typescript: `import * as fs from 'fs';\n\nfunction countWords(s: string): number {\n  // Write your logic here\n  return 0;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nconsole.log(countWords(input));`,
      c: `#include <stdio.h>\n#include <string.h>\n\nint countWords(char* s) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    char s[1005];\n    if (fgets(s, 1005, stdin)) {\n        printf("%d\\n", countWords(s));\n    }\n    return 0;\n}`,
      csharp: `using System;\n\nclass Program {\n    static int CountWords(string s) {\n        // Write your logic here\n        return 0;\n    }\n\n    static void Main() {\n        string s = Console.ReadLine();\n        if (s != null) {\n            Console.WriteLine(CountWords(s));\n        }\n    }\n}`,
      go: `package main\n\nimport ("fmt"; "bufio"; "os"; "strings")\n\nfunc countWords(s string) int {\n    // Write your logic here\n    return 0\n}\n\nfunc main() {\n    scanner := bufio.NewScanner(os.Stdin)\n    if scanner.Scan() {\n        fmt.Println(countWords(scanner.Text()))\n    }\n}`,
      rust: `use std::io::{self, Read};\n\nfn count_words(s: &str) -> usize {\n    // Write your logic here\n    0\n}\n\nfn main() {\n    let mut s = String::new();\n    io::stdin().read_to_string(&mut s).ok();\n    println!("{}", count_words(s.trim()));\n}`,
      kotlin: `import java.util.Scanner\n\nfun countWords(s: String): Int {\n    // Write your logic here\n    return 0\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNextLine()) {\n        println(countWords(sc.nextLine()))\n    }\n}`,
      php: `<?php\n\nfunction countWords($s) {\n    // Write your logic here\n    return 0;\n}\n\n$s = trim(file_get_contents("php://stdin"));\necho countWords($s);\n?>`,
      swift: `import Foundation\n\nfunc countWords(_ s: String) -> Int {\n    // Write your logic here\n    return 0\n}\n\nif let s = readLine() {\n    print(countWords(s))\n}`,
      ruby: `def count_words(s)\n  # Write your logic here\n  0\nend\n\ns = STDIN.read.strip\nputs count_words(s)`
    },
    hiddenTestCases: [
      { input: "Hello", output: "1" },
      { input: "One two three", output: "3" },
      { input: "A b c d e", output: "5" },
      { input: "Software Engineer at Google", output: "4" },
      { input: " ", output: "0" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "easy-10",
    title: "Thermal Scalar Convert",
    description: "Convert Celsius to Fahrenheit.",
    difficulty: "Easy",
    category: "Math",
    topic: "SCALAR MATH",
    estimatedTime: "5 mins",
    company: "Amazon",
    tags: ["Math"],
    inputFormat: "A single float C.",
    outputFormat: "A single float F (rounded to 1 decimal).",
    constraints: ["-273 <= C <= 1000"],
    sampleInput: "0",
    sampleOutput: "32.0",
    explanation: "(0 * 9/5) + 32 = 32.0.",
    functionInfo: {
      name: "cToF",
      params: "Double c",
      returnType: "Double",
      goal: "Convert c to fahrenheit."
    },
    starterCode: {
      python: `import sys\n\ndef c_to_f(c):\n    # Write your logic here\n    return 0.0\n\nif __name__ == "__main__":\n    line = sys.stdin.read().strip()\n    if line:\n        print("{:.1f}".format(c_to_f(float(line))))`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static double cToF(double c) {\n        // Write your logic here\n        return 0.0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextDouble()) {\n            System.out.printf("%.1f\\n", cToF(sc.nextDouble()));\n        }\n    }\n}`,
      cpp: `#include <iostream>\n#include <iomanip>\n\nusing namespace std;\n\ndouble cToF(double c) {\n    // Write your logic here\n    return 0.0;\n}\n\nint main() {\n    double c;\n    if (cin >> c) {\n        cout << fixed << setprecision(1) << cToF(c) << endl;\n    }\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction cToF(c) {\n  // Write your logic here\n  return 0.0;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nif (input) {\n  console.log(cToF(parseFloat(input)).toFixed(1));\n}`,
      typescript: `import * as fs from 'fs';\n\nfunction cToF(c: number): number {\n  // Write your logic here\n  return 0.0;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nif (input) {\n  console.log(cToF(parseFloat(input)).toFixed(1));\n}`,
      c: `#include <stdio.h>\n\ndouble cToF(double c) {\n    // Write your logic here\n    return 0.0;\n}\n\nint main() {\n    double c;\n    if (scanf("%lf", &c) != EOF) {\n        printf("%.1f\\n", cToF(c));\n    }\n    return 0;\n}`,
      csharp: `using System;\n\nclass Program {\n    static double CToF(double c) {\n        // Write your logic here\n        return 0.0;\n    }\n\n    static void Main() {\n        string line = Console.ReadLine();\n        if (line != null) {\n            Console.WriteLine(CToF(double.Parse(line)).ToString("F1"));\n        }\n    }\n}`,
      go: `package main\n\nimport "fmt"\n\nfunc cToF(c float64) float64 {\n    // Write your logic here\n    return 0.0\n}\n\nfunc main() {\n    var c float64\n    fmt.Scan(&c)\n    fmt.Printf("%.1f\\n", cToF(c))\n}`,
      rust: `use std::io;\n\nfn c_to_f(c: f64) -> f64 {\n    // Write your logic here\n    0.0\n}\n\nfn main() {\n    let mut line = String::new();\n    io::stdin().read_line(&mut line).ok();\n    if let Ok(c) = line.trim().parse() {\n        println!("{:.1}", c_to_f(c));\n    }\n}`,
      kotlin: `import java.util.Scanner\n\nfun cToF(c: Double): Double {\n    // Write your logic here\n    return 0.0\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNextDouble()) {\n        println("%.1f".format(cToF(sc.nextDouble())))\n    }\n}`,
      php: `<?php\n\nfunction cToF($c) {\n    // Write your logic here\n    return 0.0;\n}\n\n$c = (float)trim(file_get_contents("php://stdin"));\nprintf("%.1f", cToF($c));\n?>`,
      swift: `import Foundation\n\nfunc cToF(_ c: Double) -> Double {\n    // Write your logic here\n    return 0.0\n}\n\nif let line = readLine(), let c = Double(line) {\n    print(String(format: "%.1f", cToF(c)))\n}`,
      ruby: `def c_to_f(c)\n  # Write your logic here\n  0.0\nend\n\nline = gets\nif line\n  printf("%.1f\\n", c_to_f(line.to_f))\nend`
    },
    hiddenTestCases: [
      { input: "100", output: "212.0" },
      { input: "-40", output: "-40.0" },
      { input: "37", output: "98.6" },
      { input: "25", output: "77.0" },
      { input: "-273", output: "-459.4" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },

  // ==========================================
  // MEDIUM NODES (01-10)
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
      typescript: `import * as fs from 'fs';\n\nfunction isAnagram(s1: string, s2: string): boolean {\n  // Write your logic here\n  return false;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim().split(/\\s+/);\nif (input.length >= 2) {\n  console.log(isAnagram(input[0], input[1]) ? "YES" : "NO");\n}`,
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
  {
    id: "medium-06",
    title: "Distinct Stream Window",
    description: "Find the length of the longest substring of S that contains only unique characters.",
    difficulty: "Medium",
    category: "Strings",
    topic: "SLIDING WINDOW",
    estimatedTime: "15 mins",
    company: "Google",
    tags: ["Strings", "Hashing", "Two Pointers"],
    inputFormat: "A single string S.",
    outputFormat: "Length of the longest unique substring.",
    constraints: ["0 <= |S| <= 10^5"],
    sampleInput: "abcabcbb",
    sampleOutput: "3",
    explanation: "The answer is 'abc', with length 3.",
    functionInfo: {
      name: "longestUniqueSub",
      params: "String s",
      returnType: "Int",
      goal: "Find max length of substring with no repeated chars."
    },
    starterCode: {
      python: `import sys\n\ndef longest_unique_sub(s):\n    # Write your logic here\n    return 0\n\nif __name__ == "__main__":\n    s = sys.stdin.read().strip()\n    print(longest_unique_sub(s))`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static int longestUniqueSub(String s) {\n        // Write your logic here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            System.out.println(longestUniqueSub(sc.nextLine()));\n        } else { System.out.println(0); }\n    }\n}`,
      cpp: `#include <iostream>\n#include <string>\n#include <unordered_map>\n\nusing namespace std;\n\nint longestUniqueSub(string s) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    string s;\n    getline(cin, s);\n    cout << longestUniqueSub(s) << endl;\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction longestUniqueSub(s) {\n  // Write your logic here\n  return 0;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nconsole.log(longestUniqueSub(input));`,
      typescript: `import * as fs from 'fs';\n\nfunction longestUniqueSub(s: string): number {\n  // Write your logic here\n  return 0;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nconsole.log(longestUniqueSub(input));`,
      c: `#include <stdio.h>\n#include <string.h>\n\nint longestUniqueSub(char* s) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    char s[100005];\n    if (scanf("%s", s) != EOF) {\n        printf("%d\\n", longestUniqueSub(s));\n    } else { printf("0\\n"); }\n    return 0;\n}`,
      csharp: `using System;\n\nclass Program {\n    static int LongestUniqueSub(string s) {\n        // Write your logic here\n        return 0;\n    }\n\n    static void Main() {\n        string s = Console.ReadLine();\n        Console.WriteLine(LongestUniqueSub(s ?? ""));\n    }\n}`,
      go: `package main\n\nimport ("fmt"; "bufio"; "os")\n\nfunc longestUniqueSub(s string) int {\n    // Write your logic here\n    return 0\n}\n\nfunc main() {\n    scanner := bufio.NewScanner(os.Stdin)\n    if scanner.Scan() {\n        fmt.Println(longestUniqueSub(scanner.Text()))\n    } else { fmt.Println(0) }\n}`,
      rust: `use std::io::{self, Read};\n\nfn longest_unique_sub(s: &str) -> usize {\n    // Write your logic here\n    0\n}\n\nfn main() {\n    let mut s = String::new();\n    io::stdin().read_to_string(&mut s).ok();\n    println!("{}", longest_unique_sub(s.trim()));\n}`,
      kotlin: `import java.util.Scanner\n\nfun longestUniqueSub(s: String): Int {\n    // Write your logic here\n    return 0\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNextLine()) {\n        println(longestUniqueSub(sc.nextLine()))\n    } else { println(0) }\n}`,
      php: `<?php\n\nfunction longestUniqueSub($s) {\n    // Write your logic here\n    return 0;\n}\n\n$s = trim(file_get_contents("php://stdin"));\necho longestUniqueSub($s);\n?>`,
      swift: `import Foundation\n\nfunc longestUniqueSub(_ s: String) -> Int {\n    // Write your logic here\n    return 0\n}\n\nprint(longestUniqueSub(readLine() ?? ""))`,
      ruby: `def longest_unique_sub(s)\n  # Write your logic here\n  0\nend\n\nputs longest_unique_sub(gets.to_s.strip)`
    },
    hiddenTestCases: [
      { input: "bbbbb", output: "1" },
      { input: "pwwkew", output: "3" },
      { input: "", output: "0" },
      { input: "abcdef", output: "6" },
      { input: "aab", output: "2" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "medium-07",
    title: "Ancestral Node Sync",
    description: "Given a level-order array representation of a Binary Search Tree (BST) and two values P and Q, find the Lowest Common Ancestor (LCA) of P and Q.",
    difficulty: "Medium",
    category: "Trees",
    topic: "BST PROPERTIES",
    estimatedTime: "15 mins",
    company: "Microsoft",
    tags: ["Trees", "Recursion"],
    inputFormat: "Line 1: N (array size)\nLine 2: N integers (level-order traversal, -1 for null)\nLine 3: P Q",
    outputFormat: "Value of the LCA node.",
    constraints: ["2 <= N <= 10^5", "All node values are unique."],
    sampleInput: "7\n6 2 8 0 4 7 9\n2 4",
    sampleOutput: "2",
    explanation: "The LCA of 2 and 4 in the sample BST is 2.",
    functionInfo: {
      name: "findLCA",
      params: "Int[] bst, Int p, Int q",
      returnType: "Int",
      goal: "Find LCA in a BST using iterative or recursive traversal."
    },
    starterCode: {
      python: `import sys\n\ndef find_lca(bst, p, q):\n    # Write your logic here\n    return 0\n\nif __name__ == "__main__":\n    d = sys.stdin.read().split()\n    if d:\n        n = int(d[0])\n        bst = [int(x) for x in d[1:1+n]]\n        p, q = int(d[1+n]), int(d[2+n])\n        print(find_lca(bst, p, q))`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static int findLCA(int[] bst, int p, int q) {\n        // Write your logic here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] bst = new int[n];\n            for (int i = 0; i < n; i++) bst[i] = sc.nextInt();\n            int p = sc.nextInt(), q = sc.nextInt();\n            System.out.println(findLCA(bst, p, q));\n        }\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nint findLCA(vector<int>& bst, int p, int q) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> bst(n);\n        for (int i = 0; i < n; i++) cin >> bst[i];\n        int p, q; cin >> p >> q;\n        cout << findLCA(bst, p, q) << endl;\n    }\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction findLCA(bst, p, q) {\n  // Write your logic here\n  return 0;\n}\n\nconst d = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (d.length > 2) {\n  const n = parseInt(d[0]);\n  const bst = d.slice(1, 1 + n).map(Number);\n  const p = parseInt(d[1 + n]), q = parseInt(d[2 + n]);\n  console.log(findLCA(bst, p, q));\n}`,
      typescript: `import * as fs from 'fs';\n\nfunction findLCA(bst: number[], p: number, q: number): number {\n  // Write your logic here\n  return 0;\n}\n\nconst d = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (d.length > 2) {\n  const n = parseInt(d[0]);\n  const bst = d.slice(1, 1 + n).map(Number);\n  const p = parseInt(d[1 + n]), q = parseInt(d[2 + n]);\n  console.log(findLCA(bst, p, q));\n}`,
      c: `#include <stdio.h>\n\nint findLCA(int* bst, int n, int p, int q) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    int n;\n    if (scanf("%d", &n) != EOF) {\n        int bst[100005];\n        for (int i = 0; i < n; i++) scanf("%d", &bst[i]);\n        int p, q; scanf("%d %d", &p, &q);\n        printf("%d\\n", findLCA(bst, n, p, q));\n    }\n    return 0;\n}`,
      csharp: `using System;\nusing System.Linq;\n\nclass Program {\n    static int FindLCA(int[] bst, int p, int q) {\n        // Write your logic here\n        return 0;\n    }\n\n    static void Main() {\n        string l1 = Console.ReadLine();\n        if (l1 != null) {\n            int n = int.Parse(l1);\n            int[] bst = Console.ReadLine().Split().Select(int.Parse).ToArray();\n            string[] pq = Console.ReadLine().Split();\n            Console.WriteLine(FindLCA(bst, int.Parse(pq[0]), int.Parse(pq[1])));\n        }\n    }\n}`,
      go: `package main\n\nimport "fmt"\n\nfunc findLCA(bst []int, p, q int) int {\n    // Write your logic here\n    return 0\n}\n\nfunc main() {\n    var n int\n    fmt.Scan(&n)\n    bst := make([]int, n)\n    for i := 0; i < n; i++ { fmt.Scan(&bst[i]) }\n    var p, q int\n    fmt.Scan(&p, &q)\n    fmt.Println(findLCA(bst, p, q))\n}`,
      rust: `use std::io::{self, Read};\n\nfn find_lca(bst: Vec<i32>, p: i32, q: i32) -> i32 {\n    // Write your logic here\n    0\n}\n\nfn main() {\n    let mut s = String::new();\n    io::stdin().read_to_string(&mut s).ok();\n    let mut it = s.split_whitespace();\n    if let Some(n_s) = it.next() {\n        let n: usize = n_s.parse().unwrap();\n        let mut bst = Vec::new();\n        for _ in 0..n { bst.push(it.next().unwrap().parse().unwrap()); }\n        let p: i32 = it.next().unwrap().parse().unwrap();\n        let q: i32 = it.next().unwrap().parse().unwrap();\n        println!("{}", find_lca(bst, p, q));\n    }\n}`,
      kotlin: `import java.util.Scanner\n\nfun findLCA(bst: IntArray, p: Int, q: Int): Int {\n    // Write your logic here\n    return 0\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNextInt()) {\n        val n = sc.nextInt()\n        val bst = IntArray(n) { sc.nextInt() }\n        val p = sc.nextInt()\n        val q = sc.nextInt()\n        println(findLCA(bst, p, q))\n    }\n}`,
      php: `<?php\n\nfunction findLCA($bst, $p, $q) {\n    // Write your logic here\n    return 0;\n}\n\n$d = preg_split('/\\s+/', trim(file_get_contents("php://stdin")));\nif (count($d) > 3) {\n    $n = (int)$d[0];\n    $bst = array_slice($d, 1, $n);\n    echo findLCA($bst, $d[1+$n], $d[2+$n]);\n}\n?>`,
      swift: `import Foundation\n\nfunc findLCA(_ bst: [Int], _ p: Int, _ q: Int) -> Int {\n    // Write your logic here\n    return 0\n}\n\nif let l1 = readLine(), let n = Int(l1) {\n    let bst = readLine()?.split(separator: " ").compactMap { Int($0) } ?? []\n    let pq = readLine()?.split(separator: " ").compactMap { Int($0) } ?? []\n    print(findLCA(bst, pq[0], pq[1]))\n}`,
      ruby: `def find_lca(bst, p, q)\n  # Write your logic here\n  0\nend\n\nn = gets.to_i\nbst = gets.split.map(&:to_i)\np, q = gets.split.map(&:to_i)\nputs find_lca(bst, p, q)`
    },
    hiddenTestCases: [
      { input: "2\n2 1\n2 1", output: "2" },
      { input: "7\n6 2 8 0 4 7 9\n7 9", output: "8" },
      { input: "7\n6 2 8 0 4 7 9\n0 2", output: "2" },
      { input: "3\n2 1 3\n1 3", output: "2" },
      { input: "7\n6 2 8 0 4 7 9\n6 9", output: "6" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "medium-08",
    title: "Logical Leap Strategy",
    description: "Given an array of non-negative integers where each element represents your maximum jump length at that position, determine if you can reach the last index.",
    difficulty: "Medium",
    category: "Greedy",
    topic: "STATE TRAVERSAL",
    estimatedTime: "10 mins",
    company: "Amazon",
    tags: ["Greedy", "Arrays"],
    inputFormat: "Line 1: N\nLine 2: N space-separated integers.",
    outputFormat: "YES or NO.",
    constraints: ["1 <= N <= 10^5", "0 <= arr[i] <= 10^5"],
    sampleInput: "5\n2 3 1 1 4",
    sampleOutput: "YES",
    explanation: "Jump 1 step from 0 to 1, then 3 steps to the end.",
    functionInfo: {
      name: "canJump",
      params: "Int[] nums",
      returnType: "Boolean",
      goal: "Determine if destination is reachable from start."
    },
    starterCode: {
      python: `import sys\n\ndef can_jump(nums):\n    # Write your logic here\n    return False\n\nif __name__ == "__main__":\n    data = sys.stdin.read().split()\n    if data:\n        n = int(data[0])\n        nums = [int(x) for x in data[1:1+n]]\n        print("YES" if can_jump(nums) else "NO")`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static boolean canJump(int[] nums) {\n        // Write your logic here\n        return false;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] nums = new int[n];\n            for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n            System.out.println(canJump(nums) ? "YES" : "NO");\n        }\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nbool canJump(vector<int>& nums) {\n    // Write your logic here\n    return false;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> nums(n);\n        for (int i = 0; i < n; i++) cin >> nums[i];\n        cout << (canJump(nums) ? "YES" : "NO") << endl;\n    }\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction canJump(nums) {\n  // Write your logic here\n  return false;\n}\n\nconst d = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (d.length > 0) {\n  const n = parseInt(d[0]);\n  const nums = d.slice(1, 1 + n).map(Number);\n  console.log(canJump(nums) ? "YES" : "NO");\n}`,
      typescript: `import * as fs from 'fs';\n\nfunction canJump(nums: number[]): boolean {\n  // Write your logic here\n  return false;\n}\n\nconst d = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (d.length > 0) {\n  const n = parseInt(d[0]);\n  const nums = d.slice(1, 1 + n).map(Number);\n  console.log(canJump(nums) ? "YES" : "NO");\n}`,
      c: `#include <stdio.h>\n#include <stdbool.h>\n\nbool canJump(int* nums, int n) {\n    // Write your logic here\n    return false;\n}\n\nint main() {\n    int n;\n    if (scanf("%d", &n) != EOF) {\n        int nums[100005];\n        for (int i = 0; i < n; i++) scanf("%d", &nums[i]);\n        printf("%s\\n", canJump(nums, n) ? "YES" : "NO");\n    }\n    return 0;\n}`,
      csharp: `using System;\nusing System.Linq;\n\nclass Program {\n    static bool CanJump(int[] nums) {\n        // Write your logic here\n        return false;\n    }\n\n    static void Main() {\n        string line = Console.ReadLine();\n        if (line != null) {\n            int n = int.Parse(line);\n            int[] nums = Console.ReadLine().Split().Select(int.Parse).ToArray();\n            Console.WriteLine(CanJump(nums) ? "YES" : "NO");\n        }\n    }\n}`,
      go: `package main\n\nimport "fmt"\n\nfunc canJump(nums []int) bool {\n    // Write your logic here\n    return false\n}\n\nfunc main() {\n    var n int\n    fmt.Scan(&n)\n    nums := make([]int, n)\n    for i := 0; i < n; i++ { fmt.Scan(&nums[i]) }\n    if canJump(nums) { fmt.Println("YES") } else { fmt.Println("NO") }\n}`,
      rust: `use std::io::{self, Read};\n\nfn can_jump(nums: Vec<i32>) -> bool {\n    // Write your logic here\n    false\n}\n\nfn main() {\n    let mut s = String::new();\n    io::stdin().read_to_string(&mut s).ok();\n    let mut it = s.split_whitespace();\n    if let Some(n_s) = it.next() {\n        let nums: Vec<i32> = it.map(|x| x.parse().unwrap()).collect();\n        println!("{}", if can_jump(nums) { "YES" } else { "NO" });\n    }\n}`,
      kotlin: `import java.util.Scanner\n\nfun canJump(nums: IntArray): Boolean {\n    // Write your logic here\n    return false\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNextInt()) {\n        val n = sc.nextInt()\n        val nums = IntArray(n) { sc.nextInt() }\n        println(if (canJump(nums)) "YES" else "NO")\n    }\n}`,
      php: `<?php\n\nfunction canJump($nums) {\n    // Write your logic here\n    return false;\n}\n\n$d = preg_split('/\\s+/', trim(file_get_contents("php://stdin")));\nif (count($d) > 1) {\n    $n = (int)$d[0]; $nums = array_slice($d, 1, $n);\n    echo canJump($nums) ? "YES" : "NO";\n}\n?>`,
      swift: `import Foundation\n\nfunc canJump(_ nums: [Int]) -> Bool {\n    // Write your logic here\n    return false\n}\n\nif let l1 = readLine(), let n = Int(l1), let l2 = readLine() {\n    let nums = l2.split(separator: " ").compactMap { Int($0) }\n    print(canJump(nums) ? "YES" : "NO")\n}`,
      ruby: `def can_jump(nums)\n  # Write your logic here\n  false\nend\n\nn = gets.to_i\nnums = gets.split.map(&:to_i)\nputs can_jump(nums) ? "YES" : "NO"`
    },
    hiddenTestCases: [
      { input: "5\n3 2 1 0 4", output: "NO" },
      { input: "1\n0", output: "YES" },
      { input: "2\n0 1", output: "NO" },
      { input: "2\n1 0", output: "YES" },
      { input: "3\n1 1 1", output: "YES" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "medium-09",
    title: "Circular Node Tracer",
    description: "Given the head of a linked list (provided as an array of values where each value points to the next, and a pos indicating if the tail connects to a node at that index), determine if the list has a cycle.",
    difficulty: "Medium",
    category: "Linked Lists",
    topic: "CYCLE DETECTION",
    estimatedTime: "10 mins",
    company: "Google",
    tags: ["Linked Lists", "Hashing", "Two Pointers"],
    inputFormat: "Line 1: N pos (pos is index tail points to, -1 for no cycle)\nLine 2: N integers",
    outputFormat: "YES or NO.",
    constraints: ["1 <= N <= 10^5", "-1 <= pos < N"],
    sampleInput: "4 1\n3 2 0 -4",
    sampleOutput: "YES",
    explanation: "Tail points to index 1, creating a loop.",
    functionInfo: {
      name: "hasCycle",
      params: "Int[] list, Int pos",
      returnType: "Boolean",
      goal: "Detect loop in the abstract linked structure."
    },
    starterCode: {
      python: `import sys\n\ndef has_cycle(arr, pos):\n    # Write your logic here\n    return False\n\nif __name__ == "__main__":\n    d = sys.stdin.read().split()\n    if len(d) >= 2:\n        n, pos = int(d[0]), int(d[1])\n        arr = [int(x) for x in d[2:2+n]]\n        print("YES" if has_cycle(arr, pos) else "NO")`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static boolean hasCycle(int[] arr, int pos) {\n        // Write your logic here\n        return false;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int pos = sc.nextInt();\n            int[] arr = new int[n];\n            for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n            System.out.println(hasCycle(arr, pos) ? "YES" : "NO");\n        }\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nbool hasCycle(vector<int>& arr, int pos) {\n    // Write your logic here\n    return false;\n}\n\nint main() {\n    int n, pos;\n    if (cin >> n >> pos) {\n        vector<int> arr(n);\n        for (int i = 0; i < n; i++) cin >> arr[i];\n        cout << (hasCycle(arr, pos) ? "YES" : "NO") << endl;\n    }\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction hasCycle(arr, pos) {\n  // Write your logic here\n  return false;\n}\n\nconst d = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (d.length > 1) {\n  const n = parseInt(d[0]);\n  const pos = parseInt(d[1]);\n  const arr = d.slice(2, 2 + n).map(Number);\n  console.log(hasCycle(arr, pos) ? "YES" : "NO");\n}`,
      typescript: `import * as fs from 'fs';\n\nfunction hasCycle(arr: number[], pos: number): boolean {\n  // Write your logic here\n  return false;\n}\n\nconst d = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (d.length > 1) {\n  const n = parseInt(d[0]);\n  const pos = parseInt(d[1]);\n  const arr = d.slice(2, 2 + n).map(Number);\n  console.log(hasCycle(arr, pos) ? "YES" : "NO");\n}`,
      c: `#include <stdio.h>\n#include <stdbool.h>\n\nbool hasCycle(int* arr, int n, int pos) {\n    // Write your logic here\n    return false;\n}\n\nint main() {\n    int n, pos;\n    if (scanf("%d %d", &n, &pos) != EOF) {\n        int arr[100005];\n        for (int i = 0; i < n; i++) scanf("%d", &arr[i]);\n        printf("%s\\n", hasCycle(arr, n, pos) ? "YES" : "NO");\n    }\n    return 0;\n}`,
      csharp: `using System;\nusing System.Linq;\n\nclass Program {\n    static bool HasCycle(int[] arr, int pos) {\n        // Write your logic here\n        return false;\n    }\n\n    static void Main() {\n        string l1 = Console.ReadLine();\n        if (l1 != null) {\n            int n = int.Parse(l1.Split()[0]);\n            int pos = int.Parse(l1.Split()[1]);\n            int[] arr = Console.ReadLine().Split().Select(int.Parse).ToArray();\n            Console.WriteLine(HasCycle(arr, pos) ? "YES" : "NO");\n        }\n    }\n}`,
      go: `package main\n\nimport "fmt"\n\nfunc hasCycle(arr []int, pos int) bool {\n    // Write your logic here\n    return false\n}\n\nfunc main() {\n    var n, pos int\n    fmt.Scan(&n, &pos)\n    arr := make([]int, n)\n    for i := 0; i < n; i++ { fmt.Scan(&arr[i]) }\n    if hasCycle(arr, pos) { fmt.Println("YES") } else { fmt.Println("NO") }\n}`,
      rust: `use std::io::{self, Read};\n\nfn has_cycle(arr: Vec<i32>, pos: i32) -> bool {\n    // Write your logic here\n    false\n}\n\nfn main() {\n    let mut s = String::new();\n    io::stdin().read_to_string(&mut s).ok();\n    let mut it = s.split_whitespace();\n    if let (Some(n_s), Some(p_s)) = (it.next(), it.next()) {\n        let n: usize = n_s.parse().unwrap();\n        let pos: i32 = p_s.parse().unwrap();\n        let arr: Vec<i32> = it.map(|x| x.parse().unwrap()).collect();\n        println!("{}", if has_cycle(arr, pos) { "YES" } else { "NO" });\n    }\n}`,
      kotlin: `import java.util.Scanner\n\nfun hasCycle(arr: IntArray, pos: Int): Boolean {\n    // Write your logic here\n    return false\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNextInt()) {\n        val n = sc.nextInt()\n        val pos = sc.nextInt()\n        val arr = IntArray(n) { sc.nextInt() }\n        println(if (hasCycle(arr, pos)) "YES" else "NO")\n    }\n}`,
      php: `<?php\n\nfunction hasCycle($arr, $pos) {\n    // Write your logic here\n    return false;\n}\n\n$d = preg_split('/\\s+/', trim(file_get_contents("php://stdin")));\nif (count($d) > 1) {\n    $n = (int)$d[0]; $pos = (int)$d[1]; $arr = array_slice($d, 2, $n);\n    echo hasCycle($arr, $pos) ? "YES" : "NO";\n}\n?>`,
      swift: `import Foundation\n\nfunc hasCycle(_ arr: [Int], _ pos: Int) -> Bool {\n    // Write your logic here\n    return false\n}\n\nif let l1 = readLine() {\n    let p = l1.split(separator: " ").map { Int($0)! }\n    let arr = readLine()?.split(separator: " ").compactMap { Int($0) } ?? []\n    print(hasCycle(arr, p[1]) ? "YES" : "NO")\n}`,
      ruby: `def has_cycle(arr, pos)\n  # Write your logic here\n  false\nend\n\nl1 = gets\nif l1\n  n, pos = l1.split.map(&:to_i)\n  arr = gets.split.map(&:to_i)\n  puts has_cycle(arr, pos) ? "YES" : "NO"\nend`
    },
    hiddenTestCases: [
      { input: "1 -1\n1", output: "NO" },
      { input: "2 0\n1 2", output: "YES" },
      { input: "3 -1\n1 2 3", output: "NO" },
      { input: "4 2\n1 2 3 4", output: "YES" },
      { input: "5 0\n1 2 3 4 5", output: "YES" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "medium-10",
    title: "Token Denom Optimizer",
    description: "Given a set of denominations (coins) and a total amount, find the minimum number of coins needed to make that amount.",
    difficulty: "Medium",
    category: "Dynamic Programming",
    topic: "OPTIMIZATION",
    estimatedTime: "20 mins",
    company: "Meta",
    tags: ["DP", "Greedy"],
    inputFormat: "Line 1: N (denominations) Amount\nLine 2: N space-separated denominations.",
    outputFormat: "Minimum count, or -1 if impossible.",
    constraints: ["1 <= N <= 100", "0 <= Amount <= 10^4"],
    sampleInput: "3 11\n1 2 5",
    sampleOutput: "3",
    explanation: "11 = 5 + 5 + 1 (3 coins).",
    functionInfo: {
      name: "coinChange",
      params: "Int[] coins, Int amount",
      returnType: "Int",
      goal: "Use DP to find min coins for amount."
    },
    starterCode: {
      python: `import sys\n\ndef coin_change(coins, amount):\n    # Write your logic here\n    return -1\n\nif __name__ == "__main__":\n    d = sys.stdin.read().split()\n    if len(d) >= 2:\n        n, amount = int(d[0]), int(d[1])\n        coins = [int(x) for x in d[2:2+n]]\n        print(coin_change(coins, amount))`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static int coinChange(int[] coins, int amount) {\n        // Write your logic here\n        return -1;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int amount = sc.nextInt();\n            int[] coins = new int[n];\n            for (int i = 0; i < n; i++) coins[i] = sc.nextInt();\n            System.out.println(coinChange(coins, amount));\n        }\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nint coinChange(vector<int>& coins, int amount) {\n    // Write your logic here\n    return -1;\n}\n\nint main() {\n    int n, amount;\n    if (cin >> n >> amount) {\n        vector<int> coins(n);\n        for (int i = 0; i < n; i++) cin >> coins[i];\n        cout << coinChange(coins, amount) << endl;\n    }\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction coinChange(coins, amount) {\n  // Write your logic here\n  return -1;\n}\n\nconst d = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (d.length > 1) {\n  const n = parseInt(d[0]);\n  const amount = parseInt(d[1]);\n  const coins = d.slice(2, 2 + n).map(Number);\n  console.log(coinChange(coins, amount));\n}`,
      typescript: `import * as fs from 'fs';\n\nfunction coinChange(coins: number[], amount: number): number {\n  // Write your logic here\n  return -1;\n}\n\nconst d = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (d.length > 1) {\n  const n = parseInt(d[0]);\n  const amount = parseInt(d[1]);\n  const coins = d.slice(2, 2 + n).map(Number);\n  console.log(coinChange(coins, amount));\n}`,
      c: `#include <stdio.h>\n\nint coinChange(int* coins, int n, int amount) {\n    // Write your logic here\n    return -1;\n}\n\nint main() {\n    int n, amount;\n    if (scanf("%d %d", &n, &amount) != EOF) {\n        int coins[105];\n        for (int i = 0; i < n; i++) scanf("%d", &coins[i]);\n        printf("%d\\n", coinChange(coins, n, amount));\n    }\n    return 0;\n}`,
      csharp: `using System;\nusing System.Linq;\n\nclass Program {\n    static int CoinChange(int[] coins, int amount) {\n        // Write your logic here\n        return -1;\n    }\n\n    static void Main() {\n        string l1 = Console.ReadLine();\n        if (l1 != null) {\n            int n = int.Parse(l1.Split()[0]);\n            int amount = int.Parse(l1.Split()[1]);\n            int[] coins = Console.ReadLine().Split().Select(int.Parse).ToArray();\n            Console.WriteLine(CoinChange(coins, amount));\n        }\n    }\n}`,
      go: `package main\n\nimport "fmt"\n\nfunc coinChange(coins []int, amount int) int {\n    // Write your logic here\n    return -1\n}\n\nfunc main() {\n    var n, amount int\n    fmt.Scan(&n, &amount)\n    coins := make([]int, n)\n    for i := 0; i < n; i++ { fmt.Scan(&coins[i]) }\n    fmt.Println(coinChange(coins, amount))\n}`,
      rust: `use std::io::{self, Read};\n\nfn coin_change(coins: Vec<i32>, amount: i32) -> i32 {\n    // Write your logic here\n    -1\n}\n\nfn main() {\n    let mut s = String::new();\n    io::stdin().read_to_string(&mut s).ok();\n    let mut it = s.split_whitespace();\n    if let (Some(n_s), Some(a_s)) = (it.next(), it.next()) {\n        let amount: i32 = a_s.parse().unwrap();\n        let coins: Vec<i32> = it.map(|x| x.parse().unwrap()).collect();\n        println!("{}", coin_change(coins, amount));\n    }\n}`,
      kotlin: `import java.util.Scanner\n\nfun coinChange(coins: IntArray, amount: Int): Int {\n    // Write your logic here\n    return -1\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNextInt()) {\n        val n = sc.nextInt()\n        val amount = sc.nextInt()\n        val coins = IntArray(n) { sc.nextInt() }\n        println(coinChange(coins, amount))\n    }\n}`,
      php: `<?php\n\nfunction coinChange($coins, $amount) {\n    // Write your logic here\n    return -1;\n}\n\n$d = preg_split('/\\s+/', trim(file_get_contents("php://stdin")));\nif (count($d) > 1) {\n    $n = (int)$d[0]; $amount = (int)$d[1]; $coins = array_slice($d, 2, $n);\n    echo coinChange($coins, $amount);\n}\n?>`,
      swift: `import Foundation\n\nfunc coinChange(_ coins: [Int], _ amount: Int) -> Int {\n    // Write your logic here\n    return -1\n}\n\nif let l1 = readLine() {\n    let p = l1.split(separator: " ").map { Int($0)! }\n    let coins = readLine()?.split(separator: " ").compactMap { Int($0) } ?? []\n    print(coinChange(coins, p[1]))\n}`,
      ruby: `def coin_change(coins, amount)\n  # Write your logic here\n  -1\nend\n\nn, amount = gets.split.map(&:to_i)\ncoins = gets.split.map(&:to_i)\nputs coin_change(coins, amount)`
    },
    hiddenTestCases: [
      { input: "1 0\n1", output: "0" },
      { input: "1 3\n2", output: "-1" },
      { input: "2 3\n1 2", output: "2" },
      { input: "3 11\n1 5 10", output: "2" },
      { input: "4 12\n1 2 5 10", output: "2" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },

  // ==========================================
  // HARD NODES (01-10)
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
      c: `#include <stdio.h>\n#include <stdlib.h>\n\nvoid mergeKLists(int k, int* sizes, int** lists) {\n    // Write your logic here\n}\n\nint main() {\n    int k;\n    if (scanf("%d", &k) != EOF) {\n        int* sizes = (int*)malloc(k * sizeof(int));\n        int** lists = (int**)malloc(k * sizeof(int*));\n        for (int i = 0; i < k; i++) {\n            int n;\n            if (scanf("%d", &n) != EOF) {\n                sizes[i] = n;\n                lists[i] = (int*)malloc(n * sizeof(int));\n                for (int j = 0; j < n; j++) {\n                    scanf("%d", &lists[i][j]);\n                }\n            }\n        }\n        mergeKLists(k, sizes, lists);\n    }\n    return 0;\n}`,
      csharp: `using System;\nusing System.Collections.Generic;\nusing System.Linq;\n\nclass Program {\n    static List<int> MergeKLists(List<int[]> lists) {\n        // Write your logic here\n        return new List<int>();\n    }\n\n    static void Main() {\n        string line = Console.ReadLine();\n        if (line != null) {\n            int k = int.Parse(line);\n            List<int[]> lists = new List<int[]>();\n            for (int i = 0; i < k; i++) {\n                var parts = Console.ReadLine().Split(new[]{' '}, StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n                lists.Add(parts.Skip(1).ToArray());\n            }\n            Console.WriteLine(string.Join(" ", MergeKLists(lists)));\n        }\n    }\n}`,
      go: `package main\n\nimport "fmt"\n\nfunc mergeKLists(lists [][]int) []int {\n    // Write your logic here\n    return []int{}\n}\n\nfunc main() {\n    var k int\n    fmt.Scan(&k)\n    lists := make([][]int, k)\n    for i := 0; i < k; i++ {\n        var n int\n        fmt.Scan(&n)\n        lists[i] = make([]int, n)\n        for j := 0; j < n; j++ { fmt.Scan(&lists[i][j]) }\n    }\n    res := mergeKLists(lists)\n    for i, v := range res {\n        fmt.Print(v)\n        if i < len(res)-1 { fmt.Print(" ") }\n    }\n}`,
      rust: `use std::io::{self, Read};\n\nfn merge_k_lists(lists: Vec<Vec<i32>>) -> Vec<i32> {\n    // Write your logic here\n    Vec::new()\n}\n\nfn main() {\n    let mut s = String::new();\n    io::stdin().read_to_string(&mut s).ok();\n    let mut it = s.split_whitespace();\n    if let Some(k_s) = it.next() {\n        let k: usize = k_s.parse().unwrap();\n        let mut lists = Vec::new();\n        for _ in 0..k {\n            let n: usize = it.next().unwrap().parse().unwrap();\n            let mut a = Vec::new();\n            for _ in 0..n { a.push(it.next().unwrap().parse().unwrap()); }\n            lists.push(a);\n        }\n        let res = merge_k_lists(lists);\n        let r: Vec<String> = res.iter().map(|x| x.to_string()).collect();\n        println!("{}", r.join(" "));\n    }\n}`,
      kotlin: `import java.util.Scanner\n\nfun mergeKLists(lists: List<IntArray>): List<Int> {\n    // Write your logic here\n    return listOf()\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNextInt()) {\n        val k = sc.nextInt()\n        val lists = mutableListOf<IntArray>()\n        repeat(k) {\n            val n = sc.nextInt()\n            lists.add(IntArray(n) { sc.nextInt() })\n        }\n        println(mergeKLists(lists).joinToString(" "))\n    }\n}`,
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
  },
  {
    id: "hard-06",
    title: "Maximal Rect-Node Grid",
    description: "Given a 2D binary matrix filled with 0's and 1's, find the largest rectangle containing only 1's and return its area.",
    difficulty: "Hard",
    category: "Dynamic Programming",
    topic: "GRID OPTIMIZATION",
    estimatedTime: "30 mins",
    company: "Microsoft",
    tags: ["DP", "Stacks", "Matrix"],
    inputFormat: "Line 1: R C (Rows, Cols)\nNext R lines: C integers (0 or 1)",
    outputFormat: "Area of the maximal rectangle.",
    constraints: ["0 <= R, C <= 200"],
    sampleInput: "4 5\n1 0 1 0 0\n1 0 1 1 1\n1 1 1 1 1\n1 0 0 1 0",
    sampleOutput: "6",
    explanation: "The maximal rectangle is from (1,2) to (2,4) with area 6.",
    functionInfo: {
      name: "maximalRectangle",
      params: "Int[][] matrix",
      returnType: "Int",
      goal: "Use a modified histogram approach per row to find the global max."
    },
    starterCode: {
      python: `import sys\n\ndef maximal_rectangle(matrix):\n    # Write your logic here\n    return 0\n\nif __name__ == "__main__":\n    d = sys.stdin.read().split()\n    if d:\n        r, c = int(d[0]), int(d[1])\n        matrix = []\n        for i in range(r):\n            matrix.append([int(x) for x in d[2 + i*c : 2 + (i+1)*c]])\n        print(maximal_rectangle(matrix))`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static int maximalRectangle(int[][] matrix) {\n        // Write your logic here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int r = sc.nextInt();\n            int c = sc.nextInt();\n            int[][] matrix = new int[r][c];\n            for (int i = 0; i < r; i++)\n                for (int j = 0; j < c; j++) matrix[i][j] = sc.nextInt();\n            System.out.println(maximalRectangle(matrix));\n        }\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nint maximalRectangle(vector<vector<int>>& matrix) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    int r, c;\n    if (cin >> r >> c) {\n        vector<vector<int>> matrix(r, vector<int>(c));\n        for (int i = 0; i < r; i++)\n            for (int j = 0; j < c; j++) cin >> matrix[i][j];\n        cout << maximalRectangle(matrix) << endl;\n    }\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction maximalRectangle(matrix) {\n  // Write your logic here\n  return 0;\n}\n\nconst d = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (d.length > 1) {\n  const r = parseInt(d[0]), c = parseInt(d[1]);\n  const matrix = [];\n  for (let i = 0; i < r; i++) {\n    matrix.push(d.slice(2 + i*c, 2 + (i+1)*c).map(Number));\n  }\n  console.log(maximalRectangle(matrix));\n}`,
      typescript: `import * as fs from 'fs';\n\nfunction maximalRectangle(matrix: number[][]): number {\n  // Write your logic here\n  return 0;\n}\n\nconst d = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (d.length > 1) {\n  const r = parseInt(d[0]), c = parseInt(d[1]);\n  const matrix = [];\n  for (let i = 0; i < r; i++) {\n    matrix.push(d.slice(2 + i*c, 2 + (i+1)*c).map(Number));\n  }\n  console.log(maximalRectangle(matrix));\n}`,
      c: `#include <stdio.h>\n#include <stdlib.h>\n\nint maximalRectangle(int** matrix, int r, int c) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    int r, c;\n    if (scanf("%d %d", &r, &c) != EOF) {\n        int** matrix = (int**)malloc(r * sizeof(int*));\n        for (int i = 0; i < r; i++) {\n            matrix[i] = (int*)malloc(c * sizeof(int));\n            for (int j = 0; j < c; j++) scanf("%d", &matrix[i][j]);\n        }\n        printf("%d\\n", maximalRectangle(matrix, r, c));\n    }\n    return 0;\n}`,
      csharp: `using System;\nusing System.Linq;\n\nclass Program {\n    static int MaximalRectangle(int[][] matrix) {\n        // Write your logic here\n        return 0;\n    }\n\n    static void Main() {\n        string l1 = Console.ReadLine();\n        if (l1 != null) {\n            int r = int.Parse(l1.Split()[0]);\n            int c = int.Parse(l1.Split()[1]);\n            int[][] matrix = new int[r][];\n            for (int i = 0; i < r; i++) \n                matrix[i] = Console.ReadLine().Split(new[]{' '}, StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();\n            Console.WriteLine(MaximalRectangle(matrix));\n        }\n    }\n}`,
      go: `package main\n\nimport "fmt"\n\nfunc maximalRectangle(matrix [][]int) int {\n    // Write your logic here\n    return 0\n}\n\nfunc main() {\n    var r, c int\n    fmt.Scan(&r, &c)\n    matrix := make([][]int, r)\n    for i := 0; i < r; i++ {\n        matrix[i] = make([]int, c)\n        for j := 0; j < c; j++ { fmt.Scan(&matrix[i][j]) }\n    }\n    fmt.Println(maximalRectangle(matrix))\n}`,
      rust: `use std::io::{self, Read};\n\nfn maximal_rectangle(matrix: Vec<Vec<i32>>) -> i32 {\n    // Write your logic here\n    0\n}\n\nfn main() {\n    let mut s = String::new();\n    io::stdin().read_to_string(&mut s).ok();\n    let mut it = s.split_whitespace();\n    if let (Some(r_s), Some(c_s)) = (it.next(), it.next()) {\n        let r: usize = r_s.parse().unwrap();\n        let c: usize = c_s.parse().unwrap();\n        let mut matrix = Vec::new();\n        for _ in 0..r {\n            let mut row = Vec::new();\n            for _ in 0..c { row.push(it.next().unwrap().parse().unwrap()); }\n            matrix.push(row);\n        }\n        println!("{}", maximal_rectangle(matrix));\n    }\n}`,
      kotlin: `import java.util.Scanner\n\nfun maximalRectangle(matrix: Array<IntArray>): Int {\n    // Write your logic here\n    return 0\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNextInt()) {\n        val r = sc.nextInt(); val c = sc.nextInt()\n        val matrix = Array(r) { IntArray(c) { sc.nextInt() } }\n        println(maximalRectangle(matrix))\n    }\n}`,
      php: `<?php\n\nfunction maximalRectangle($matrix) {\n    // Write your logic here\n    return 0;\n}\n\n$d = preg_split('/\\s+/', trim(file_get_contents("php://stdin")));\nif (count($d) > 1) {\n    $r = (int)$d[0]; $c = (int)$d[1]; $matrix = [];\n    for ($i = 0; $i < $r; $i++) {\n        $matrix[] = array_slice($d, 2 + $i*$c, $c);\n    }\n    echo maximalRectangle($matrix);\n}\n?>`,
      swift: `import Foundation\n\nfunc maximalRectangle(_ matrix: [[Int]]) -> Int {\n    // Write your logic here\n    return 0\n}\n\nif let l1 = readLine() {\n    let p = l1.split(separator: " ").map { Int($0)! }\n    var mat = [[Int]]()\n    for _ in 0..<p[0] {\n        mat.append(readLine()?.split(separator: " ").map { Int($0)! } ?? [])\n    }\n    print(maximalRectangle(mat))\n}`,
      ruby: `def maximal_rectangle(matrix)\n  # Write your logic here\n  0\nend\n\nr, c = gets.split.map(&:to_i)\nmatrix = []\nr.times { matrix << gets.split.map(&:to_i) }\nputs maximal_rectangle(matrix)`
    },
    hiddenTestCases: [
      { input: "1 1\n1", output: "1" },
      { input: "1 1\n0", output: "0" },
      { input: "2 2\n1 1\n1 1", output: "4" },
      { input: "2 2\n1 0\n0 1", output: "1" },
      { input: "3 3\n0 0 0\n0 0 0\n0 0 0", output: "0" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "hard-07",
    title: "The Word Chain Path",
    description: "Given two words (beginWord and endWord) and a dictionary, find the length of the shortest transformation sequence from beginWord to endWord such that only one letter can be changed at a time and each intermediate word must exist in the dictionary.",
    difficulty: "Hard",
    category: "Graphs",
    topic: "BFS TRAVERSAL",
    estimatedTime: "25 mins",
    company: "Amazon",
    tags: ["BFS", "Graphs", "Hashing"],
    inputFormat: "Line 1: beginWord\nLine 2: endWord\nLine 3: N (Dictionary size)\nNext N lines: dictionary words",
    outputFormat: "Length of the shortest path, or 0.",
    constraints: ["1 <= beginWord.length <= 10", "Dictionary size <= 5000"],
    sampleInput: "hit\ncog\n5\nhot\ndot\ndog\nlot\nlog",
    sampleOutput: "5",
    explanation: "hit -> hot -> dot -> dog -> cog is length 5.",
    functionInfo: {
      name: "ladderLength",
      params: "String start, String end, String[] dict",
      returnType: "Int",
      goal: "Implement BFS to find minimum steps in word ladder."
    },
    starterCode: {
      python: `import sys\n\ndef ladder_length(start, end, word_list):\n    # Write your logic here\n    return 0\n\nif __name__ == "__main__":\n    d = sys.stdin.read().split()\n    if len(d) >= 3:\n        start, end = d[0], d[1]\n        n = int(d[2])\n        word_list = d[3:3+n]\n        print(ladder_length(start, end, word_list))`,
      java: `import java.util.*;\n\npublic class Main {\n    public static int ladderLength(String start, String end, List<String> wordList) {\n        // Write your logic here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String start = sc.next();\n            String end = sc.next();\n            int n = sc.nextInt();\n            List<String> list = new ArrayList<>();\n            for (int i = 0; i < n; i++) list.add(sc.next());\n            System.out.println(ladderLength(start, end, list));\n        }\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\n#include <string>\n#include <unordered_set>\n#include <queue>\n\nusing namespace std;\n\nint ladderLength(string start, string end, vector<string>& wordList) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    string start, end;\n    int n;\n    if (cin >> start >> end >> n) {\n        vector<string> list(n);\n        for (int i = 0; i < n; i++) cin >> list[i];\n        cout << ladderLength(start, end, list) << endl;\n    }\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction ladderLength(start, end, wordList) {\n  // Write your logic here\n  return 0;\n}\n\nconst d = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (d.length >= 3) {\n  const start = d[0], end = d[1], n = parseInt(d[2]);\n  const wordList = d.slice(3, 3 + n);\n  console.log(ladderLength(start, end, wordList));\n}`,
      typescript: `import * as fs from 'fs';\n\nfunction ladderLength(start: string, end: string, wordList: string[]): number {\n  // Write your logic here\n  return 0;\n}\n\nconst d = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (d.length >= 3) {\n  const start = d[0], end = d[1], n = parseInt(d[2]);\n  const wordList = d.slice(3, 3 + n);\n  console.log(ladderLength(start, end, wordList));\n}`,
      c: `#include <stdio.h>\n#include <string.h>\n\nint ladderLength(char* start, char* end, char** wordList, int n) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    char start[15], end[15];\n    int n;\n    if (scanf("%s %s %d", start, end, &n) != EOF) {\n        char** wordList = malloc(n * sizeof(char*));\n        for (int i = 0; i < n; i++) {\n            wordList[i] = malloc(15 * sizeof(char));\n            scanf("%s", wordList[i]);\n        }\n        printf("%d\\n", ladderLength(start, end, wordList, n));\n    }\n    return 0;\n}`,
      csharp: `using System;\nusing System.Collections.Generic;\nusing System.Linq;\n\nclass Program {\n    static int LadderLength(string start, string end, List<string> wordList) {\n        // Write your logic here\n        return 0;\n    }\n\n    static void Main() {\n        string start = Console.ReadLine();\n        string end = Console.ReadLine();\n        int n = int.Parse(Console.ReadLine() ?? "0");\n        List<string> list = new List<string>();\n        for (int i = 0; i < n; i++) list.Add(Console.ReadLine());\n        Console.WriteLine(LadderLength(start, end, list));\n    }\n}`,
      go: `package main\n\nimport "fmt"\n\nfunc ladderLength(start, end string, wordList []string) int {\n    // Write your logic here\n    return 0\n}\n\nfunc main() {\n    var start, end string\n    var n int\n    fmt.Scan(&start, &end, &n)\n    list := make([]string, n)\n    for i := 0; i < n; i++ { fmt.Scan(&list[i]) }\n    fmt.Println(ladderLength(start, end, list))\n}`,
      rust: `use std::io::{self, Read};\n\nfn ladder_length(start: String, end: String, word_list: Vec<String>) -> i32 {\n    // Write your logic here\n    0\n}\n\nfn main() {\n    let mut s = String::new();\n    io::stdin().read_to_string(&mut s).ok();\n    let mut it = s.split_whitespace();\n    if let (Some(s_w), Some(e_w), Some(n_s)) = (it.next(), it.next(), it.next()) {\n        let n: usize = n_s.parse().unwrap();\n        let mut list = Vec::new();\n        for _ in 0..n { list.push(it.next().unwrap().to_string()); }\n        println!("{}", ladder_length(s_w.to_string(), e_w.to_string(), list));\n    }\n}`,
      kotlin: `import java.util.Scanner\n\nfun ladderLength(start: String, end: String, wordList: List<String>): Int {\n    // Write your logic here\n    return 0\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNext()) {\n        val start = sc.next(); val end = sc.next(); val n = sc.nextInt()\n        val list = List(n) { sc.next() }\n        println(ladderLength(start, end, list))\n    }\n}`,
      php: `<?php\n\nfunction ladderLength($start, $end, $wordList) {\n    // Write your logic here\n    return 0;\n}\n\n$d = preg_split('/\\s+/', trim(file_get_contents("php://stdin")));\nif (count($d) >= 3) {\n    $start = $d[0]; $end = $d[1]; $n = (int)$d[2];\n    $list = array_slice($d, 3, $n);\n    echo ladderLength($start, $end, $list);\n}\n?>`,
      swift: `import Foundation\n\nfunc ladderLength(_ start: String, _ end: String, _ wordList: [String]) -> Int {\n    // Write your logic here\n    return 0\n}\n\nif let s = readLine(), let e = readLine(), let l = readLine(), let n = Int(l) {\n    var list = [String]()\n    for _ in 0..<n { list.append(readLine() ?? "") }\n    print(ladderLength(s, e, list))\n}`,
      ruby: `def ladder_length(start, end, word_list)\n  # Write your logic here\n  0\nend\n\nstart = gets.strip\nend = gets.strip\nn = gets.to_i\nlist = []\nn.times { list << gets.strip }\nputs ladder_length(start, end, list)`
    },
    hiddenTestCases: [
      { input: "a\nc\n3\na\nb\nc", output: "2" },
      { input: "hot\ndog\n3\nhot\ndot\ndog", output: "3" },
      { input: "talk\ntail\n2\ntalk\ntail", output: "2" },
      { input: "lost\ncost\n1\nmost", output: "0" },
      { input: "hit\ncog\n4\nhot\ndot\nlot\nlog", output: "0" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "hard-08",
    title: "Binary Logic Stream",
    description: "Design an algorithm to serialize and deserialize a binary tree. Serialization is the process of converting a tree data structure into a string (level-order, with # for null) so it can be stored. Deserialization is the reverse.",
    difficulty: "Hard",
    category: "Trees",
    topic: "SYSTEM DESIGN",
    estimatedTime: "30 mins",
    company: "Google",
    tags: ["Trees", "BFS", "Serialization"],
    inputFormat: "A level-order string representation of a tree (e.g. 1 2 3 # # 4 5)",
    outputFormat: "The same level-order string after processing.",
    constraints: ["Nodes count <= 1000"],
    sampleInput: "1 2 3 # # 4 5",
    sampleOutput: "1 2 3 # # 4 5",
    explanation: "The tree is processed through serialize/deserialize loops.",
    functionInfo: {
      name: "codecNode",
      params: "String data",
      returnType: "String",
      goal: "Implement tree serialization logic."
    },
    starterCode: {
      python: `import sys\n\ndef codec_node(data):\n    # Write your logic here\n    return data\n\nif __name__ == "__main__":\n    line = sys.stdin.read().strip()\n    print(codec_node(line))`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static String codecNode(String data) {\n        // Write your logic here\n        return data;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            System.out.println(codecNode(sc.nextLine()));\n        }\n    }\n}`,
      cpp: `#include <iostream>\n#include <string>\n\nusing namespace std;\n\nstring codecNode(string data) {\n    // Write your logic here\n    return data;\n}\n\nint main() {\n    string line;\n    getline(cin, line);\n    cout << codecNode(line) << endl;\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction codecNode(data) {\n  // Write your logic here\n  return data;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nconsole.log(codecNode(input));`,
      typescript: `import * as fs from 'fs';\n\nfunction codecNode(data: string): string {\n  // Write your logic here\n  return data;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nconsole.log(codecNode(input));`,
      c: `#include <stdio.h>\n#include <string.h>\n\nvoid codecNode(char* data) {\n    // Write your logic here\n}\n\nint main() {\n    char data[4000];\n    if (fgets(data, 4000, stdin)) {\n        char* p = strchr(data, '\\n'); if(p) *p = 0;\n        codecNode(data);\n        printf("%s\\n", data);\n    }\n    return 0;\n}`,
      csharp: `using System;\n\nclass Program {\n    static string CodecNode(string data) {\n        // Write your logic here\n        return data;\n    }\n\n    static void Main() {\n        string line = Console.ReadLine();\n        Console.WriteLine(CodecNode(line ?? ""));\n    }\n}`,
      go: `package main\n\nimport ("fmt"; "bufio"; "os")\n\nfunc codecNode(data string) string {\n    // Write your logic here\n    return data\n}\n\nfunc main() {\n    scanner := bufio.NewScanner(os.Stdin)\n    if scanner.Scan() {\n        fmt.Println(codecNode(scanner.Text()))\n    }\n}`,
      rust: `use std::io::{self, Read};\n\nfn codec_node(data: &str) -> String {\n    // Write your logic here\n    data.to_string()\n}\n\nfn main() {\n    let mut s = String::new();\n    io::stdin().read_to_string(&mut s).ok();\n    println!("{}", codec_node(s.trim()));\n}`,
      kotlin: `import java.util.Scanner\n\nfun codecNode(data: String): String {\n    // Write your logic here\n    return data\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNextLine()) {\n        println(codecNode(sc.nextLine()))\n    }\n}`,
      php: `<?php\n\nfunction codecNode($data) {\n    // Write your logic here\n    return $data;\n}\n\necho codecNode(trim(file_get_contents("php://stdin")));\n?>`,
      swift: `import Foundation\n\nfunc codecNode(_ data: String) -> String {\n    // Write your logic here\n    return data\n}\n\nprint(codecNode(readLine() ?? ""))`,
      ruby: `def codec_node(data)\n  # Write your logic here\n  data\nend\n\nputs codec_node(gets.to_s.strip)`
    },
    hiddenTestCases: [
      { input: "1 # 2", output: "1 # 2" },
      { input: "#", output: "#" },
      { input: "1 2 3", output: "1 2 3" },
      { input: "10 20 # 30 40", output: "10 20 # 30 40" },
      { input: "1 2 # # 3 4 5", output: "1 2 # # 3 4 5" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "hard-09",
    title: "The Palindrome Partition",
    description: "Given a string S, partition S such that every substring of the partition is a palindrome. Return the minimum cuts needed for such a partition.",
    difficulty: "Hard",
    category: "Dynamic Programming",
    topic: "MIN-CUT LOGIC",
    estimatedTime: "25 mins",
    company: "Meta",
    tags: ["DP", "Strings"],
    inputFormat: "A single string S.",
    outputFormat: "Minimum cuts (integer).",
    constraints: ["1 <= |S| <= 2000"],
    sampleInput: "aab",
    sampleOutput: "1",
    explanation: "Partition 'aa' | 'b' requires 1 cut.",
    functionInfo: {
      name: "minCut",
      params: "String s",
      returnType: "Int",
      goal: "Use DP to calculate minimum partitions required."
    },
    starterCode: {
      python: `import sys\n\ndef min_cut(s):\n    # Write your logic here\n    return 0\n\nif __name__ == "__main__":\n    s = sys.stdin.read().strip()\n    if s:\n        print(min_cut(s))`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static int minCut(String s) {\n        // Write your logic here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            System.out.println(minCut(sc.next()));\n        }\n    }\n}`,
      cpp: `#include <iostream>\n#include <string>\n#include <vector>\n\nusing namespace std;\n\nint minCut(string s) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    string s;\n    if (cin >> s) {\n        cout << minCut(s) << endl;\n    }\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction minCut(s) {\n  // Write your logic here\n  return 0;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nif (input) {\n  console.log(minCut(input));\n}`,
      typescript: `import * as fs from 'fs';\n\nfunction minCut(s: string): number {\n  // Write your logic here\n  return 0;\n}\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nif (input) {\n  console.log(minCut(input));\n}`,
      c: `#include <stdio.h>\n#include <string.h>\n\nint minCut(char* s) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    char s[2005];\n    if (scanf("%s", s) != EOF) {\n        printf("%d\\n", minCut(s));\n    }\n    return 0;\n}`,
      csharp: `using System;\n\nclass Program {\n    static int MinCut(string s) {\n        // Write your logic here\n        return 0;\n    }\n\n    static void Main() {\n        string line = Console.ReadLine();\n        if (line != null) {\n            Console.WriteLine(MinCut(line.Trim()));\n        }\n    }\n}`,
      go: `package main\n\nimport "fmt"\n\nfunc minCut(s string) int {\n    // Write your logic here\n    return 0\n}\n\nfunc main() {\n    var s string\n    fmt.Scan(&s)\n    if s != "" {\n        fmt.Println(minCut(s))\n    }\n}`,
      rust: `use std::io;\n\nfn min_cut(s: &str) -> i32 {\n    // Write your logic here\n    0\n}\n\nfn main() {\n    let mut s = String::new();\n    io::stdin().read_line(&mut s).ok();\n    let res = s.trim();\n    if !res.is_empty() {\n        println!("{}", min_cut(res));\n    }\n}`,
      kotlin: `import java.util.Scanner\n\nfun minCut(s: String): Int {\n    // Write your logic here\n    return 0\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNext()) {\n        println(minCut(sc.next()))\n    }\n}`,
      php: `<?php\n\nfunction minCut($s) {\n    // Write your logic here\n    return 0;\n}\n\n$s = trim(file_get_contents("php://stdin"));\nif ($s) echo minCut($s);\n?>`,
      swift: `import Foundation\n\nfunc minCut(_ s: String) -> Int {\n    // Write your logic here\n    return 0\n}\n\nif let s = readLine() {\n    print(minCut(s))\n}`,
      ruby: `def min_cut(s)\n  # Write your logic here\n  0\nend\n\ns = gets.to_s.strip\nputs min_cut(s) if !s.empty?`
    },
    hiddenTestCases: [
      { input: "a", output: "0" },
      { input: "ab", output: "1" },
      { input: "aba", output: "0" },
      { input: "racecar", output: "0" },
      { input: "apap", output: "1" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  },
  {
    id: "hard-10",
    title: "Path Sum Node Max",
    description: "Given a level-order array representation of a Binary Tree, find the maximum path sum. A path can start and end at any node in the tree.",
    difficulty: "Hard",
    category: "Trees",
    topic: "RECURSIVE SUM",
    estimatedTime: "30 mins",
    company: "Google",
    tags: ["Trees", "Recursion", "DFS"],
    inputFormat: "A level-order array representation (e.g. 1 2 3)",
    outputFormat: "Maximum path sum.",
    constraints: ["Nodes count <= 10^5", "-1000 <= node.val <= 1000"],
    sampleInput: "1 2 3",
    sampleOutput: "6",
    explanation: "The path 2 -> 1 -> 3 has sum 6.",
    functionInfo: {
      name: "maxPathSum",
      params: "Int[] tree",
      returnType: "Int",
      goal: "Calculate the max path sum considering all branches."
    },
    starterCode: {
      python: `import sys\n\ndef max_path_sum(tree):\n    # Write your logic here\n    return 0\n\nif __name__ == "__main__":\n    d = sys.stdin.read().split()\n    if d:\n        tree = [int(x) if x != "#" else None for x in d]\n        print(max_path_sum(tree))`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static int maxPathSum(String[] tree) {\n        // Write your logic here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            String[] tree = sc.nextLine().split("\\\\s+");\n            System.out.println(maxPathSum(tree));\n        }\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\n#include <string>\n\nusing namespace std;\n\nint maxPathSum(vector<string>& tree) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    string s;\n    vector<string> tree;\n    while (cin >> s) tree.push_back(s);\n    cout << maxPathSum(tree) << endl;\n    return 0;\n}`,
      javascript: `const fs = require('fs');\n\nfunction maxPathSum(tree) {\n  // Write your logic here\n  return 0;\n}\n\nconst input = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (input.length > 0) {\n  console.log(maxPathSum(input));\n}`,
      typescript: `import * as fs from 'fs';\n\nfunction maxPathSum(tree: string[]): number {\n  // Write your logic here\n  return 0;\n}\n\nconst input = fs.readFileSync(0, 'utf8').split(/\\s+/);\nif (input.length > 0) {\n  console.log(maxPathSum(input));\n}`,
      c: `#include <stdio.h>\n#include <stdlib.h>\n\nint maxPathSum(char** tree, int n) {\n    // Write your logic here\n    return 0;\n}\n\nint main() {\n    char* tree[10000];\n    int n = 0;\n    char buf[100];\n    while (scanf("%s", buf) != EOF) {\n        tree[n] = malloc(100);\n        strcpy(tree[n++], buf);\n    }\n    printf("%d\\n", maxPathSum(tree, n));\n    return 0;\n}`,
      csharp: `using System;\n\nclass Program {\n    static int MaxPathSum(string[] tree) {\n        // Write your logic here\n        return 0;\n    }\n\n    static void Main() {\n        string line = Console.ReadLine();\n        if (line != null) {\n            Console.WriteLine(MaxPathSum(line.Split()));\n        }\n    }\n}`,
      go: `package main\n\nimport ("fmt"; "bufio"; "os"; "strings")\n\nfunc maxPathSum(tree []string) int {\n    // Write your logic here\n    return 0\n}\n\nfunc main() {\n    scanner := bufio.NewScanner(os.Stdin)\n    if scanner.Scan() {\n        fmt.Println(maxPathSum(strings.Fields(scanner.Text())))\n    }\n}`,
      rust: `use std::io::{self, Read};\n\nfn max_path_sum(tree: Vec<String>) -> i32 {\n    // Write your logic here\n    0\n}\n\nfn main() {\n    let mut s = String::new();\n    io::stdin().read_to_string(&mut s).ok();\n    let tree: Vec<String> = s.split_whitespace().map(|x| x.to_string()).collect();\n    println!("{}", max_path_sum(tree));\n}`,
      kotlin: `import java.util.Scanner\n\nfun maxPathSum(tree: Array<String>): Int {\n    // Write your logic here\n    return 0\n}\n\nfun main() {\n    val sc = Scanner(System.\`in\`)\n    if (sc.hasNextLine()) {\n        println(maxPathSum(sc.nextLine().split("\\\\s+".toRegex()).toTypedArray()))\n    }\n}`,
      php: `<?php\n\nfunction maxPathSum($tree) {\n    // Write your logic here\n    return 0;\n}\n\n$tree = preg_split('/\\s+/', trim(file_get_contents("php://stdin")));\necho maxPathSum($tree);\n?>`,
      swift: `import Foundation\n\nfunc maxPathSum(_ tree: [String]) -> Int {\n    // Write your logic here\n    return 0\n}\n\nif let line = readLine() {\n    print(maxPathSum(line.split(separator: " ").map { String($0) }))\n}`,
      ruby: `def max_path_sum(tree)\n  # Write your logic here\n  0\nend\n\nputs max_path_sum(gets.to_s.split)`
    },
    hiddenTestCases: [
      { input: "-10 9 20 # # 15 7", output: "42" },
      { input: "-3", output: "-3" },
      { input: "1 2", output: "3" },
      { input: "2 -1", output: "2" },
      { input: "5 4 8 11 # 13 4 7 2 # # # 1", output: "48" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "typescript", "c", "csharp", "go", "rust", "kotlin", "php", "swift", "ruby"]
  }
];
