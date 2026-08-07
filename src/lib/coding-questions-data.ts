/**
 * @fileOverview Nexvoro AI Master Question Data (v2.0 - Fresher Friendly).
 * Curated list of 30 "Service-Firm" style coding challenges with 8-language support.
 * Focuses on Arrays, Strings, and Math logic common in TCS, Infosys, and Accenture.
 */

export interface CodingQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  company: string;
  tags: string[];
  constraints: string[];
  sampleInput: string;
  sampleOutput: string;
  starterCode: Record<string, string>;
  hiddenTestCases: { input: string; output: string }[];
  timeLimit: string;
  memoryLimit: string;
  languageSupport: string[];
}

export const MASTER_QUESTIONS: CodingQuestion[] = [
  // EASY QUESTIONS (1-10)
  {
    id: "easy-f-01",
    title: "Sum of Two Numbers",
    description: "Write a program that takes two integers as input and returns their sum.",
    difficulty: "Easy",
    category: "Basic Math",
    company: "TCS",
    tags: ["Math", "Beginner"],
    constraints: ["-10^9 <= a, b <= 10^9"],
    sampleInput: "5\n10",
    sampleOutput: "15",
    starterCode: {
      python: "def solve():\n    a = int(input())\n    b = int(input())\n    print(a + b)\n\nsolve()",
      java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        System.out.println(a + b);\n    }\n}",
      cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}",
      javascript: "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8').split('\\n');\nconst a = parseInt(input[0]);\nconst b = parseInt(input[1]);\nconsole.log(a + b);",
      c: "#include <stdio.h>\n\nint main() {\n    int a, b;\n    scanf(\"%d %d\", &a, &b);\n    printf(\"%d\\n\", a + b);\n    return 0;\n}",
      csharp: "using System;\n\npublic class Solution {\n    public static void Main() {\n        int a = int.Parse(Console.ReadLine());\n        int b = int.Parse(Console.ReadLine());\n        Console.WriteLine(a + b);\n    }\n}",
      go: "package main\nimport \"fmt\"\n\nfunc main() {\n    var a, b int\n    fmt.Scan(&a, &b)\n    fmt.Println(a + b)\n}",
      rust: "use std::io;\n\nfn main() {\n    let mut input = String::new();\n    io::stdin().read_line(&mut input).unwrap();\n    let a: i32 = input.trim().parse().unwrap();\n    input.clear();\n    io::stdin().read_line(&mut input).unwrap();\n    let b: i32 = input.trim().parse().unwrap();\n    println!(\"{}\", a + b);\n}"
    },
    hiddenTestCases: [
      { input: "0\n0", output: "0" },
      { input: "-5\n5", output: "0" },
      { input: "100\n200", output: "300" },
      { input: "-10\n-20", output: "-30" },
      { input: "9999\n1", output: "10000" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "easy-f-02",
    title: "Check Even or Odd",
    description: "Given an integer N, determine if it is Even or Odd.",
    difficulty: "Easy",
    category: "Basic Math",
    company: "Infosys",
    tags: ["Math", "Conditionals"],
    constraints: ["-10^18 <= N <= 10^18"],
    sampleInput: "42",
    sampleOutput: "Even",
    starterCode: {
      python: "n = int(input())\nprint('Even' if n % 2 == 0 else 'Odd')",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long n = sc.nextLong();\n        System.out.println(n % 2 == 0 ? \"Even\" : \"Odd\");\n    }\n}",
      cpp: "#include <iostream>\nusing namespace std;\nint main() {\n    long long n;\n    cin >> n;\n    if (n % 2 == 0) cout << \"Even\" << endl;\n    else cout << \"Odd\" << endl;\n    return 0;\n}",
      javascript: "const fs = require('fs');\nconst n = BigInt(fs.readFileSync(0, 'utf8').trim());\nconsole.log(n % 2n === 0n ? 'Even' : 'Odd');",
      c: "#include <stdio.h>\nint main() {\n    long long n;\n    scanf(\"%lld\", &n);\n    if (n % 2 == 0) printf(\"Even\\n\");\n    else printf(\"Odd\\n\");\n    return 0;\n}",
      csharp: "using System;\nclass Program { static void Main() { long n = long.Parse(Console.ReadLine()); Console.WriteLine(n % 2 == 0 ? \"Even\" : \"Odd\"); } }",
      go: "package main\nimport \"fmt\"\nfunc main() { var n int64; fmt.Scan(&n); if n%2==0 { fmt.Println(\"Even\") } else { fmt.Println(\"Odd\") } }",
      rust: "fn main() { let mut s = String::new(); std::io::stdin().read_line(&mut s).unwrap(); let n: i64 = s.trim().parse().unwrap(); println!(\"{}\", if n % 2 == 0 { \"Even\" } else { \"Odd\" }); }"
    },
    hiddenTestCases: [
      { input: "7", output: "Odd" },
      { input: "0", output: "Even" },
      { input: "-2", output: "Even" },
      { input: "1000001", output: "Odd" },
      { input: "2", output: "Even" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "easy-f-03",
    title: "Reverse a String",
    description: "Write a function that reverses a given string.",
    difficulty: "Easy",
    category: "Strings",
    company: "Accenture",
    tags: ["Strings", "Fundamentals"],
    constraints: ["1 <= s.length <= 10^5"],
    sampleInput: "hello",
    sampleOutput: "olleh",
    starterCode: {
      python: "s = input()\nprint(s[::-1])",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        System.out.println(new StringBuilder(s).reverse().toString());\n    }\n}",
      cpp: "#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\nint main() {\n    string s;\n    getline(cin, s);\n    reverse(s.begin(), s.end());\n    cout << s << endl;\n    return 0;\n}",
      javascript: "const fs = require('fs');\nconst s = fs.readFileSync(0, 'utf8').trim();\nconsole.log(s.split('').reverse().join(''));",
      c: "#include <stdio.h>\n#include <string.h>\nint main() {\n    char s[100001];\n    scanf(\"%s\", s);\n    int n = strlen(s);\n    for(int i=n-1; i>=0; i--) printf(\"%c\", s[i]);\n    printf(\"\\n\");\n    return 0;\n}",
      csharp: "using System;\nclass Program { static void Main() { char[] charArray = Console.ReadLine().ToCharArray(); Array.Reverse(charArray); Console.WriteLine(new string(charArray)); } }",
      go: "package main\nimport (\"fmt\"; \"bufio\"; \"os\")\nfunc main() { scanner := bufio.NewScanner(os.Stdin); scanner.Scan(); s := scanner.Text(); r := []rune(s); for i, j := 0, len(r)-1; i < j; i, j = i+1, j-1 { r[i], r[j] = r[j], r[i] }; fmt.Println(string(r)) }",
      rust: "fn main() { let mut s = String::new(); std::io::stdin().read_line(&mut s).unwrap(); println!(\"{}\", s.trim().chars().rev().collect::<String>()); }"
    },
    hiddenTestCases: [
      { input: "world", output: "dlrow" },
      { input: "a", output: "a" },
      { input: "12345", output: "54321" },
      { input: "Racecar", output: "racecaR" },
      { input: "abc", output: "cba" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "easy-f-04",
    title: "Factorial Calculation",
    description: "Given a non-negative integer N, return its factorial (N!).",
    difficulty: "Easy",
    category: "Math",
    company: "Cognizant",
    tags: ["Math", "Recursion", "Loops"],
    constraints: ["0 <= N <= 20"],
    sampleInput: "5",
    sampleOutput: "120",
    starterCode: {
      python: "def fact(n):\n    res = 1\n    for i in range(2, n + 1): res *= i\n    return res\nn = int(input())\nprint(fact(n))",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        long res = 1;\n        for(int i=2; i<=n; i++) res *= i;\n        System.out.println(res);\n    }\n}",
      cpp: "#include <iostream>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    long long res = 1;\n    for(int i=2; i<=n; i++) res *= i;\n    cout << res << endl;\n    return 0;\n}",
      javascript: "const fs = require('fs');\nconst n = parseInt(fs.readFileSync(0, 'utf8').trim());\nlet res = 1n;\nfor(let i=2n; i<=BigInt(n); i++) res *= i;\nconsole.log(res.toString());",
      c: "#include <stdio.h>\nint main() {\n    int n; scanf(\"%d\", &n);\n    long long res = 1;\n    for(int i=2; i<=n; i++) res *= i;\n    printf(\"%lld\\n\", res);\n    return 0;\n}",
      csharp: "using System; class Program { static void Main() { int n = int.Parse(Console.ReadLine()); long res = 1; for(int i=2; i<=n; i++) res *= i; Console.WriteLine(res); } }",
      go: "package main\nimport \"fmt\"\nfunc main() { var n int; fmt.Scan(&n); res := int64(1); for i:=2; i<=n; i++ { res *= int64(i) }; fmt.Println(res) }",
      rust: "fn main() { let mut s = String::new(); std::io::stdin().read_line(&mut s).unwrap(); let n: u64 = s.trim().parse().unwrap(); let mut res: u64 = 1; for i in 2..=n { res *= i; } println!(\"{}\", res); }"
    },
    hiddenTestCases: [
      { input: "0", output: "1" },
      { input: "1", output: "1" },
      { input: "10", output: "3628800" },
      { input: "3", output: "6" },
      { input: "6", output: "720" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "easy-f-05",
    title: "Palindrome Check",
    description: "Check if a given string is a palindrome (reads the same forwards and backwards).",
    difficulty: "Easy",
    category: "Strings",
    company: "Wipro",
    tags: ["Strings", "Logic"],
    constraints: ["1 <= s.length <= 10^4"],
    sampleInput: "madam",
    sampleOutput: "YES",
    starterCode: {
      python: "s = input()\nprint('YES' if s == s[::-1] else 'NO')",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        String r = new StringBuilder(s).reverse().toString();\n        System.out.println(s.equals(r) ? \"YES\" : \"NO\");\n    }\n}",
      cpp: "#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\nint main() {\n    string s; cin >> s;\n    string r = s; reverse(r.begin(), r.end());\n    cout << (s == r ? \"YES\" : \"NO\") << endl;\n    return 0;\n}",
      javascript: "const fs = require('fs');\nconst s = fs.readFileSync(0, 'utf8').trim();\nconst r = s.split('').reverse().join('');\nconsole.log(s === r ? 'YES' : 'NO');",
      c: "#include <stdio.h>\n#include <string.h>\nint main() {\n    char s[10001]; scanf(\"%s\", s);\n    int n = strlen(s), p = 1;\n    for(int i=0; i<n/2; i++) if(s[i] != s[n-1-i]) p = 0;\n    printf(\"%s\\n\", p ? \"YES\" : \"NO\");\n    return 0;\n}",
      csharp: "using System; class Program { static void Main() { string s = Console.ReadLine(); char[] arr = s.ToCharArray(); Array.Reverse(arr); string r = new string(arr); Console.WriteLine(s == r ? \"YES\" : \"NO\"); } }",
      go: "package main\nimport \"fmt\"\nfunc main() { var s string; fmt.Scan(&s); r := \"\"; for _, v := range s { r = string(v) + r }; if s == r { fmt.Println(\"YES\") } else { fmt.Println(\"NO\") } }",
      rust: "fn main() { let mut s = String::new(); std::io::stdin().read_line(&mut s).unwrap(); let s = s.trim(); let r: String = s.chars().rev().collect(); println!(\"{}\", if s == r { \"YES\" } else { \"NO\" }); }"
    },
    hiddenTestCases: [
      { input: "racecar", output: "YES" },
      { input: "hello", output: "NO" },
      { input: "121", output: "YES" },
      { input: "aba", output: "YES" },
      { input: "abcd", output: "NO" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },

  // MEDIUM QUESTIONS (Q11-Q30)
  {
    id: "medium-f-01",
    title: "Fibonacci N-th Term",
    description: "Given a number N, find the N-th Fibonacci number. (Sequence: 0, 1, 1, 2, 3, 5, 8, ...)",
    difficulty: "Medium",
    category: "Math",
    company: "TCS",
    tags: ["Math", "Loops"],
    constraints: ["1 <= N <= 50"],
    sampleInput: "6",
    sampleOutput: "5",
    starterCode: {
      python: "n = int(input())\nif n == 1: print(0)\nelif n == 2: print(1)\nelse:\n    a, b = 0, 1\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    print(b)",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        if(n == 1) { System.out.println(0); return; }\n        if(n == 2) { System.out.println(1); return; }\n        long a = 0, b = 1;\n        for(int i=3; i<=n; i++) {\n            long t = a + b; a = b; b = t;\n        }\n        System.out.println(b);\n    }\n}",
      cpp: "#include <iostream>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    if(n == 1) { cout << 0 << endl; return 0; }\n    if(n == 2) { cout << 1 << endl; return 0; }\n    long long a = 0, b = 1;\n    for(int i=3; i<=n; i++) {\n        long long t = a + b; a = b; b = t;\n    }\n    cout << b << endl; return 0;\n}",
      javascript: "const fs = require('fs');\nconst n = parseInt(fs.readFileSync(0, 'utf8').trim());\nif(n === 1) console.log(0);\nelse if(n === 2) console.log(1);\nelse {\n    let a = 0n, b = 1n;\n    for(let i=3; i<=n; i++) {\n        let t = a + b; a = b; b = t;\n    }\n    console.log(b.toString());\n}",
      c: "#include <stdio.h>\nint main() {\n    int n; scanf(\"%d\", &n);\n    if(n == 1) { printf(\"0\\n\"); return 0; }\n    if(n == 2) { printf(\"1\\n\"); return 0; }\n    long long a = 0, b = 1;\n    for(int i=3; i<=n; i++) {\n        long long t = a + b; a = b; b = t;\n    }\n    printf(\"%lld\\n\", b); return 0;\n}",
      csharp: "using System; class Program { static void Main() { int n = int.Parse(Console.ReadLine()); if(n == 1) { Console.WriteLine(0); return; } if(n == 2) { Console.WriteLine(1); return; } long a = 0, b = 1; for(int i=3; i<=n; i++) { long t = a + b; a = b; b = t; } Console.WriteLine(b); } }",
      go: "package main\nimport \"fmt\"\nfunc main() { var n int; fmt.Scan(&n); if n == 1 { fmt.Println(0); return }; if n == 2 { fmt.Println(1); return }; a, b := int64(0), int64(1); for i:=3; i<=n; i++ { a, b = b, a + b }; fmt.Println(b) }",
      rust: "fn main() { let mut s = String::new(); std::io::stdin().read_line(&mut s).unwrap(); let n: u64 = s.trim().parse().unwrap(); if n == 1 { println!(\"0\"); } else if n == 2 { println!(\"1\"); } else { let (mut a, mut b) = (0u64, 1u64); for _ in 3..=n { let t = a + b; a = b; b = t; } println!(\"{}\", b); } }"
    },
    hiddenTestCases: [
      { input: "1", output: "0" },
      { input: "2", output: "1" },
      { input: "3", output: "1" },
      { input: "10", output: "34" },
      { input: "20", output: "4181" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "medium-f-02",
    title: "Prime Number Check",
    description: "Write a program to check whether a given number N is Prime or not.",
    difficulty: "Medium",
    category: "Math",
    company: "Infosys",
    tags: ["Math", "Optimization"],
    constraints: ["1 <= N <= 10^9"],
    sampleInput: "17",
    sampleOutput: "PRIME",
    starterCode: {
      python: "import math\nn = int(input())\nif n < 2: print('NOT PRIME')\nelse:\n    is_p = True\n    for i in range(2, int(math.sqrt(n)) + 1):\n        if n % i == 0: is_p = False; break\n    print('PRIME' if is_p else 'NOT PRIME')",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long n = sc.nextLong();\n        if(n < 2) { System.out.println(\"NOT PRIME\"); return; }\n        for(long i=2; i*i<=n; i++) {\n            if(n % i == 0) { System.out.println(\"NOT PRIME\"); return; }\n        }\n        System.out.println(\"PRIME\");\n    }\n}",
      cpp: "#include <iostream>\nusing namespace std;\nint main() {\n    long long n; cin >> n;\n    if(n < 2) { cout << \"NOT PRIME\" << endl; return 0; }\n    for(long long i=2; i*i<=n; i++) {\n        if(n % i == 0) { cout << \"NOT PRIME\" << endl; return 0; }\n    }\n    cout << \"PRIME\" << endl; return 0;\n}",
      javascript: "const fs = require('fs');\nconst n = parseInt(fs.readFileSync(0, 'utf8').trim());\nif(n < 2) console.log('NOT PRIME');\nelse {\n    let isP = true;\n    for(let i=2; i*i<=n; i++) {\n        if(n % i === 0) { isP = false; break; }\n    }\n    console.log(isP ? 'PRIME' : 'NOT PRIME');\n}",
      c: "#include <stdio.h>\nint main() {\n    long long n; scanf(\"%lld\", &n);\n    if(n < 2) { printf(\"NOT PRIME\\n\"); return 0; }\n    for(long long i=2; i*i<=n; i++) {\n        if(n % i == 0) { printf(\"NOT PRIME\\n\"); return 0; }\n    }\n    printf(\"PRIME\\n\"); return 0;\n}",
      csharp: "using System; class Program { static void Main() { long n = long.Parse(Console.ReadLine()); if(n < 2) { Console.WriteLine(\"NOT PRIME\"); return; } for(long i=2; i*i<=n; i++) { if(n % i == 0) { Console.WriteLine(\"NOT PRIME\"); return; } } Console.WriteLine(\"PRIME\"); } }",
      go: "package main\nimport \"fmt\"\nfunc main() { var n int64; fmt.Scan(&n); if n < 2 { fmt.Println(\"NOT PRIME\"); return }; for i:=int64(2); i*i<=n; i++ { if n%i==0 { fmt.Println(\"NOT PRIME\"); return } }; fmt.Println(\"PRIME\") }",
      rust: "fn main() { let mut s = String::new(); std::io::stdin().read_line(&mut s).unwrap(); let n: i64 = s.trim().parse().unwrap(); if n < 2 { println!(\"NOT PRIME\"); } else { let mut is_p = true; let mut i = 2; while i * i <= n { if n % i == 0 { is_p = false; break; } i += 1; } println!(\"{}\", if is_p { \"PRIME\" } else { \"NOT PRIME\" }); } }"
    },
    hiddenTestCases: [
      { input: "2", output: "PRIME" },
      { input: "4", output: "NOT PRIME" },
      { input: "97", output: "PRIME" },
      { input: "1", output: "NOT PRIME" },
      { input: "100", output: "NOT PRIME" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "medium-f-03",
    title: "Second Largest Element",
    description: "Given an array of integers, find the second largest element in the array.",
    difficulty: "Medium",
    category: "Arrays",
    company: "Capgemini",
    tags: ["Arrays", "Logic"],
    constraints: ["2 <= N <= 10^5", "-10^9 <= arr[i] <= 10^9"],
    sampleInput: "5\n10 20 4 45 99",
    sampleOutput: "45",
    starterCode: {
      python: "n = int(input())\narr = list(map(int, input().split()))\nfirst = second = -float('inf')\nfor x in arr:\n    if x > first: second = first; first = x\n    elif x > second and x != first: second = x\nprint(second)",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        long first = Long.MIN_VALUE, second = Long.MIN_VALUE;\n        for(int i=0; i<n; i++) {\n            long x = sc.nextLong();\n            if(x > first) { second = first; first = x; }\n            else if(x > second && x != first) { second = x; }\n        }\n        System.out.println(second);\n    }\n}",
      cpp: "#include <iostream>\n#include <vector>\n#include <climits>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    long long first = LLONG_MIN, second = LLONG_MIN;\n    for(int i=0; i<n; i++) {\n        long long x; cin >> x;\n        if(x > first) { second = first; first = x; }\n        else if(x > second && x != first) { second = x; }\n    }\n    cout << second << endl; return 0;\n}",
      javascript: "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8').split(/\\s+/);\nconst n = parseInt(input[0]);\nlet first = -Infinity, second = -Infinity;\nfor(let i=1; i<=n; i++) {\n    let x = parseInt(input[i]);\n    if(x > first) { second = first; first = x; }\n    else if(x > second && x !== first) { second = x; }\n}\nconsole.log(second);",
      c: "#include <stdio.h>\n#include <limits.h>\nint main() {\n    int n; scanf(\"%d\", &n);\n    long long first = LLONG_MIN, second = LLONG_MIN;\n    for(int i=0; i<n; i++) {\n        long long x; scanf(\"%lld\", &x);\n        if(x > first) { second = first; first = x; }\n        else if(x > second && x != first) { second = x; }\n    }\n    printf(\"%lld\\n\", second); return 0;\n}",
      csharp: "using System; class Program { static void Main() { int n = int.Parse(Console.ReadLine()); string[] parts = Console.ReadLine().Split(' '); long first = long.MinValue, second = long.MinValue; for(int i=0; i<n; i++) { long x = long.Parse(parts[i]); if(x > first) { second = first; first = x; } else if(x > second && x != first) { second = x; } } Console.WriteLine(second); } }",
      go: "package main\nimport \"fmt\"\nfunc main() { var n int; fmt.Scan(&n); var first, second int64 = -1e18, -1e18; for i:=0; i<n; i++ { var x int64; fmt.Scan(&x); if x > first { second, first = first, x } else if x > second && x != first { second = x } }; fmt.Println(second) }",
      rust: "fn main() { let mut s = String::new(); std::io::stdin().read_line(&mut s).unwrap(); let mut s2 = String::new(); std::io::stdin().read_line(&mut s2).unwrap(); let arr: Vec<i64> = s2.trim().split_whitespace().map(|x| x.parse().unwrap()).collect(); let (mut first, mut second) = (i64::MIN, i64::MIN); for &x in &arr { if x > first { second = first; first = x; } else if x > second && x != first { second = x; } } println!(\"{}\", second); }"
    },
    hiddenTestCases: [
      { input: "3\n1 2 3", output: "2" },
      { input: "4\n10 10 9 8", output: "9" },
      { input: "5\n-1 -2 -3 -4 -5", output: "-2" },
      { input: "2\n100 200", output: "100" },
      { input: "6\n5 4 3 2 1 6", output: "5" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "medium-f-04",
    title: "Armstrong Number Check",
    description: "A number is Armstrong if the sum of cubes of its digits is equal to the number itself (for 3-digit numbers). Generally, for an n-digit number, it is the sum of n-th power of digits.",
    difficulty: "Medium",
    category: "Math",
    company: "Cognizant",
    tags: ["Math", "Logic"],
    constraints: ["1 <= N <= 10^6"],
    sampleInput: "153",
    sampleOutput: "YES",
    starterCode: {
      python: "s = input()\nn = len(s)\nnum = int(s)\nsum_v = sum(int(d)**n for d in s)\nprint('YES' if sum_v == num else 'NO')",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.next();\n        int n = s.length();\n        long num = Long.parseLong(s), sum = 0;\n        for(char d : s.toCharArray()) sum += Math.pow(Character.getNumericValue(d), n);\n        System.out.println(sum == num ? \"YES\" : \"NO\");\n    }\n}",
      cpp: "#include <iostream>\n#include <string>\n#include <cmath>\nusing namespace std;\nint main() {\n    string s; cin >> s;\n    int n = s.length();\n    long long num = stoll(s), sum = 0;\n    for(char d : s) sum += pow(d - '0', n);\n    cout << (sum == num ? \"YES\" : \"NO\") << endl; return 0;\n}",
      javascript: "const fs = require('fs');\nconst s = fs.readFileSync(0, 'utf8').trim();\nconst n = s.length;\nconst num = BigInt(s);\nlet sum = 0n;\nfor(let d of s) sum += BigInt(d) ** BigInt(n);\nconsole.log(sum === num ? 'YES' : 'NO');",
      c: "#include <stdio.h>\n#include <string.h>\n#include <math.h>\nint main() {\n    char s[20]; scanf(\"%s\", s);\n    int n = strlen(s);\n    long long num = 0, sum = 0;\n    for(int i=0; i<n; i++) num = num * 10 + (s[i] - '0');\n    for(int i=0; i<n; i++) sum += pow(s[i] - '0', n);\n    printf(\"%s\\n\", sum == num ? \"YES\" : \"NO\"); return 0;\n}",
      csharp: "using System; class Program { static void Main() { string s = Console.ReadLine(); int n = s.Length; long num = long.Parse(s), sum = 0; foreach(char d in s) sum += (long)Math.Pow(int.Parse(d.ToString()), n); Console.WriteLine(sum == num ? \"YES\" : \"NO\"); } }",
      go: "package main\nimport (\"fmt\"; \"math\"; \"strconv\")\nfunc main() { var s string; fmt.Scan(&s); n := len(s); num, _ := strconv.ParseInt(s, 10, 64); var sum float64; for _, d := range s { val, _ := strconv.Atoi(string(d)); sum += math.Pow(float64(val), float64(n)) }; if int64(sum) == num { fmt.Println(\"YES\") } else { fmt.Println(\"NO\") } }",
      rust: "fn main() { let mut s = String::new(); std::io::stdin().read_line(&mut s).unwrap(); let s = s.trim(); let n = s.len() as u32; let num: u64 = s.parse().unwrap(); let mut sum: u64 = 0; for d in s.chars() { sum += (d.to_digit(10).unwrap() as u64).pow(n); } println!(\"{}\", if sum == num { \"YES\" } else { \"NO\" }); }"
    },
    hiddenTestCases: [
      { input: "370", output: "YES" },
      { input: "371", output: "YES" },
      { input: "9474", output: "YES" },
      { input: "123", output: "NO" },
      { input: "1", output: "YES" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "medium-f-05",
    title: "Anagram Check",
    description: "Two strings are anagrams if they contain the same characters in the same frequency, but in a different order.",
    difficulty: "Medium",
    category: "Strings",
    company: "Accenture",
    tags: ["Strings", "Hashing"],
    constraints: ["1 <= s1, s2 <= 10^5"],
    sampleInput: "listen\nsilent",
    sampleOutput: "YES",
    starterCode: {
      python: "s1 = sorted(input().strip())\ns2 = sorted(input().strip())\nprint('YES' if s1 == s2 else 'NO')",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        char[] c1 = sc.next().toCharArray();\n        char[] c2 = sc.next().toCharArray();\n        Arrays.sort(c1); Arrays.sort(c2);\n        System.out.println(Arrays.equals(c1, c2) ? \"YES\" : \"NO\");\n    }\n}",
      cpp: "#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\nint main() {\n    string s1, s2; cin >> s1 >> s2;\n    sort(s1.begin(), s1.end()); sort(s2.begin(), s2.end());\n    cout << (s1 == s2 ? \"YES\" : \"NO\") << endl; return 0;\n}",
      javascript: "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8').split(/\\s+/);\nconst s1 = input[0].split('').sort().join('');\nconst s2 = input[1].split('').sort().join('');\nconsole.log(s1 === s2 ? 'YES' : 'NO');",
      c: "#include <stdio.h>\n#include <string.h>\n#include <stdlib.h>\nint cmp(const void* a, const void* b) { return *(char*)a - *(char*)b; }\nint main() {\n    char s1[100001], s2[100001]; scanf(\"%s %s\", s1, s2);\n    if(strlen(s1) != strlen(s2)) { printf(\"NO\\n\"); return 0; }\n    qsort(s1, strlen(s1), 1, cmp); qsort(s2, strlen(s2), 1, cmp);\n    printf(\"%s\\n\", strcmp(s1, s2) == 0 ? \"YES\" : \"NO\"); return 0;\n}",
      csharp: "using System; class Program { static void Main() { char[] c1 = Console.ReadLine().ToCharArray(); char[] c2 = Console.ReadLine().ToCharArray(); Array.Sort(c1); Array.Sort(c2); Console.WriteLine(new string(c1) == new string(c2) ? \"YES\" : \"NO\"); } }",
      go: "package main\nimport (\"fmt\"; \"sort\"; \"strings\")\nfunc main() { var s1, s2 string; fmt.Scan(&s1, &s2); a1 := strings.Split(s1, \"\"); a2 := strings.Split(s2, \"\"); sort.Strings(a1); sort.Strings(a2); if strings.Join(a1, \"\") == strings.Join(a2, \"\") { fmt.Println(\"YES\") } else { fmt.Println(\"NO\") } }",
      rust: "fn main() { let mut s1 = String::new(); std::io::stdin().read_line(&mut s1).unwrap(); let mut s2 = String::new(); std::io::stdin().read_line(&mut s2).unwrap(); let mut c1: Vec<char> = s1.trim().chars().collect(); let mut c2: Vec<char> = s2.trim().chars().collect(); c1.sort(); c2.sort(); println!(\"{}\", if c1 == c2 { \"YES\" } else { \"NO\" }); }"
    },
    hiddenTestCases: [
      { input: "heart\nearth", output: "YES" },
      { input: "abc\ndef", output: "NO" },
      { input: "triangles\nintegral", output: "NO" },
      { input: "race\ncare", output: "YES" },
      { input: "a\na", output: "YES" }
    ],
    timeLimit: "1s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  }
];
