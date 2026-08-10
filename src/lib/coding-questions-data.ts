/**
 * @fileOverview Nexvoro AI Master Question Data (v15.0 - Syntax Optimized).
 * Every starterCode template is audited for perfect indentation and syntax.
 * Python templates use strictly 4-space indentation with standardized main entry points.
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
      python: `import sys

def is_mirror_word(s):
    # TODO: Implement the logic to check if 's' is a palindrome
    return False

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if line:
        if is_mirror_word(line):
            print("YES")
        else:
            print("NO")`,
      java: `import java.util.Scanner;

public class Main {
    public static boolean isMirrorWord(String s) {
        // TODO: Implement the logic to check if 's' is a palindrome
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            String s = sc.next();
            if (isMirrorWord(s)) {
                System.out.println("YES");
            } else {
                System.out.println("NO");
            }
        }
    }
}`,
      cpp: `#include <iostream>
#include <string>
#include <algorithm>

using namespace std;

bool isMirrorWord(string s) {
    // TODO: Implement mirror word logic
    return false;
}

int main() {
    string s;
    if (cin >> s) {
        if (isMirrorWord(s)) {
            cout << "YES" << endl;
        } else {
            cout << "NO" << endl;
        }
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function isMirrorWord(s) {
    // TODO: Implement mirror word logic
    return false;
}

const input = fs.readFileSync(0, 'utf8').trim();
if (input) {
    console.log(isMirrorWord(input) ? 'YES' : 'NO');
}`,
      c: `#include <stdio.h>
#include <string.h>
#include <stdbool.h>

bool isMirrorWord(char* s) {
    // TODO: Implement mirror word logic
    return false;
}

int main() {
    char s[10001];
    if (scanf("%s", s) != EOF) {
        if (isMirrorWord(s)) {
            printf("YES\\n");
        } else {
            printf("NO\\n");
        }
    }
    return 0;
}`,
      csharp: `using System;

class Program {
    static bool IsMirrorWord(string s) {
        // TODO: Implement mirror word logic
        return false;
    }

    static void Main() {
        string s = Console.ReadLine();
        if (s != null) {
            if (IsMirrorWord(s.Trim())) {
                Console.WriteLine("YES");
            } else {
                Console.WriteLine("NO");
            }
        }
    }
}`,
      go: `package main

import "fmt"

func isMirrorWord(s string) bool {
    // TODO: Implement mirror word logic
    return false
}

func main() {
    var s string
    fmt.Scanln(&s)
    if s != "" {
        if isMirrorWord(s) {
            fmt.Println("YES")
        } else {
            fmt.Println("NO")
        }
    }
}`,
      rust: `use std::io;

fn is_mirror_word(s: &str) -> bool {
    // TODO: Implement mirror word logic
    false
}

fn main() {
    let mut input = String::new();
    if let Ok(_) = io::stdin().read_line(&mut input) {
        let s = input.trim();
        if !s.is_empty() {
            if is_mirror_word(s) {
                println!("YES");
            } else {
                println!("NO");
            }
        }
    }
}`
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
    inputFormat: "Line 1: Integer N (Number of players).\\nLine 2: N space-separated integers (Scores).",
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
    walkthrough: { input: "5\\n10 20 20 15 5", received: "scores = [10, 20, 20, 15, 5]", expected: "15", output: "15" },
    starterCode: {
      python: `import sys

def get_runner_up(n, scores):
    # TODO: Find the strictly second-largest unique element
    return -1

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if len(data) >= 2:
        n = int(data[0])
        scores = [int(x) for x in data[1:n+1]]
        print(get_runner_up(n, scores))`,
      java: `import java.util.Scanner;

public class Main {
    public static int getRunnerUp(int n, int[] scores) {
        // TODO: Find the strictly second-largest unique element
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] scores = new int[n];
            for (int i = 0; i < n; i++) {
                if (sc.hasNextInt()) scores[i] = sc.nextInt();
            }
            System.out.println(getRunnerUp(n, scores));
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int getRunnerUp(int n, vector<int>& scores) {
    // TODO: Find the strictly second-largest unique element
    return -1;
}

int main() {
    int n;
    if (cin >> n) {
        vector<int> scores(n);
        for (int i = 0; i < n; i++) cin >> scores[i];
        cout << getRunnerUp(n, scores) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function getRunnerUp(n, scores) {
    // TODO: Find the strictly second-largest unique element
    return -1;
}

const input = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (input.length >= 2) {
    const n = parseInt(input[0]);
    const scores = input.slice(1, n + 1).filter(x => x !== '').map(Number);
    console.log(getRunnerUp(n, scores));
}`,
      c: `#include <stdio.h>

int getRunnerUp(int n, int* scores) {
    // TODO: Find the strictly second-largest unique element
    return -1;
}

int main() {
    int n;
    if (scanf("%d", &n) != EOF) {
        int scores[100001];
        for (int i = 0; i < n; i++) scanf("%d", &scores[i]);
        printf("%d\\n", getRunnerUp(n, scores));
    }
    return 0;
}`,
      csharp: `using System;
using System.Collections.Generic;
using System.Linq;

class Program {
    static int GetRunnerUp(int n, int[] scores) {
        // TODO: Find the strictly second-largest unique element
        return -1;
    }

    static void Main() {
        string line1 = Console.ReadLine();
        if (line1 != null) {
            int n = int.Parse(line1);
            string line2 = Console.ReadLine();
            if (line2 != null) {
                string[] parts = line2.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                int[] scores = Array.ConvertAll(parts, int.Parse);
                Console.WriteLine(GetRunnerUp(n, scores));
            }
        }
    }
}`,
      go: `package main

import "fmt"

func getRunnerUp(n int, scores []int) int {
    // TODO: Find the strictly second-largest unique element
    return -1
}

func main() {
    var n int
    if _, err := fmt.Scan(&n); err == nil {
        scores := make([]int, n)
        for i := 0; i < n; i++ {
            fmt.Scan(&scores[i])
        }
        fmt.Println(getRunnerUp(n, scores))
    }
}`,
      rust: `use std::io::{self, Read};

fn get_runner_up(n: usize, scores: Vec<i32>) -> i32 {
    // TODO: Find the strictly second-largest unique element
    -1
}

fn main() {
    let mut input = String::new();
    if let Ok(_) = io::stdin().read_to_string(&mut input) {
        let mut words = input.split_whitespace();
        if let Some(n_str) = words.next() {
            let n: usize = n_str.parse().unwrap();
            let scores: Vec<i32> = words.map(|s| s.parse().unwrap()).collect();
            println!("{}", get_runner_up(n, scores));
        }
    }
}`
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
      python: `import sys

def count_vowels(s):
    # TODO: Count vowels (a, e, i, o, u) case-insensitively
    return 0

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    print(count_vowels(line))`,
      java: `import java.util.Scanner;

public class Main {
    public static int countVowels(String s) {
        // TODO: Count vowels (a, e, i, o, u) case-insensitively
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            System.out.println(countVowels(sc.nextLine()));
        }
    }
}`,
      cpp: `#include <iostream>
#include <string>

using namespace std;

int countVowels(string s) {
    // TODO: Count vowels (a, e, i, o, u) case-insensitively
    return 0;
}

int main() {
    string s;
    if (getline(cin, s)) {
        cout << countVowels(s) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function countVowels(s) {
    // TODO: Count vowels (a, e, i, o, u) case-insensitively
    return 0;
}

const input = fs.readFileSync(0, 'utf8').trim();
console.log(countVowels(input));`,
      c: `#include <stdio.h>
#include <ctype.h>
#include <string.h>

int countVowels(char* s) {
    // TODO: Count vowels (a, e, i, o, u) case-insensitively
    return 0;
}

int main() {
    char s[100001];
    if (fgets(s, 100001, stdin)) {
        printf("%d\\n", countVowels(s));
    }
    return 0;
}`,
      csharp: `using System;

class Program {
    static int CountVowels(string s) {
        // TODO: Count vowels (a, e, i, o, u) case-insensitively
        return 0;
    }

    static void Main() {
        string s = Console.ReadLine();
        Console.WriteLine(CountVowels(s ?? ""));
    }
}`,
      go: `package main

import (
    "fmt"
    "bufio"
    "os"
)

func countVowels(s string) int {
    // TODO: Count vowels (a, e, i, o, u) case-insensitively
    return 0
}

func main() {
    reader := bufio.NewReader(os.Stdin)
    s, _ := reader.ReadString('\\n')
    fmt.Println(countVowels(s))
}`,
      rust: `use std::io::{self, BufRead};

fn count_vowels(s: &str) -> usize {
    // TODO: Count vowels (a, e, i, o, u) case-insensitively
    0
}

fn main() {
    let stdin = io::stdin();
    let mut line = String::new();
    if let Ok(_) = stdin.lock().read_line(&mut line) {
        println!("{}", count_vowels(line.trim()));
    }
}`
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
    inputFormat: "Line 1: Integer N.\\nLine 2: N space-separated integers.",
    outputFormat: "A single integer representing the total sum.",
    constraints: ["- 1 <= N <= 10^5", "- -10^6 <= element <= 10^6"],
    sampleInput: "4\n1 2 3 4",
    sampleOutput: "10",
    explanation: "1 + 2 + 3 + 4 = 10.",
    functionInfo: { name: "sumArray(n, arr)", params: "n: int, arr: int[]", returnType: "long", goal: "Sum elements of an array." },
    walkthrough: { input: "4, [1, 2, 3, 4]", received: "arr=[1,2,3,4]", expected: "10", output: "10" },
    starterCode: {
      python: `import sys

def sum_array(n, arr):
    # TODO: Return total sum of array elements
    return 0

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if len(data) >= 1:
        n = int(data[0])
        arr = [int(x) for x in data[1:n+1]]
        print(sum_array(n, arr))`,
      java: `import java.util.Scanner;

public class Main {
    public static long sumArray(int n, int[] arr) {
        // TODO: Return total sum of array elements
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] arr = new int[n];
            for (int i = 0; i < n; i++) {
                if (sc.hasNextInt()) arr[i] = sc.nextInt();
            }
            System.out.println(sumArray(n, arr));
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

long long sumArray(int n, vector<int>& a) {
    // TODO: Return total sum of array elements
    return 0;
}

int main() {
    int n;
    if (cin >> n) {
        vector<int> a(n);
        for (int i = 0; i < n; i++) cin >> a[i];
        cout << sumArray(n, a) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function sumArray(n, arr) {
    // TODO: Return total sum of array elements
    return 0;
}

const input = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (input.length > 1) {
    const n = parseInt(input[0]);
    const arr = input.slice(1, n + 1).filter(x => x !== '').map(Number);
    console.log(sumArray(n, arr).toString());
}`,
      c: `#include <stdio.h>

long long sumArray(int n, int* arr) {
    // TODO: Return total sum of array elements
    return 0;
}

int main() {
    int n;
    if (scanf("%d", &n) != EOF) {
        int a[100001];
        for (int i = 0; i < n; i++) scanf("%d", &a[i]);
        printf("%lld\\n", sumArray(n, a));
    }
    return 0;
}`,
      csharp: `using System;

class Program {
    static long SumArray(int n, int[] arr) {
        // TODO: Return total sum of array elements
        return 0;
    }

    static void Main() {
        string l1 = Console.ReadLine();
        if (l1 != null) {
            int n = int.Parse(l1);
            string l2 = Console.ReadLine();
            if (l2 != null) {
                int[] arr = Array.ConvertAll(l2.Split(' ', StringSplitOptions.RemoveEmptyEntries), int.Parse);
                Console.WriteLine(SumArray(n, arr));
            }
        }
    }
}`,
      go: `package main

import "fmt"

func sumArray(n int, arr []int) int64 {
    // TODO: Return total sum of array elements
    return 0
}

func main() {
    var n int
    if _, err := fmt.Scan(&n); err == nil {
        a := make([]int, n)
        for i := 0; i < n; i++ {
            fmt.Scan(&a[i])
        }
        fmt.Println(sumArray(n, a))
    }
}`,
      rust: `use std::io::{self, BufRead};

fn sum_array(arr: &[i64]) -> i64 {
    // TODO: Return total sum of array elements
    0
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    if let Some(Ok(l1)) = lines.next() {
        if let Some(Ok(l2)) = lines.next() {
            let a: Vec<i64> = l2.split_whitespace().map(|x| x.parse::<i64>().unwrap()).collect();
            println!("{}", sum_array(&a));
        }
    }
}`
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
    inputFormat: "Line 1: Integer N.\\nLine 2: N integers.",
    outputFormat: "The largest integer in the array.",
    constraints: ["- 1 <= N <= 10^5", "- -10^9 <= element <= 10^9"],
    sampleInput: "3\n10 50 20",
    sampleOutput: "50",
    explanation: "50 is the largest node in [10, 50, 20].",
    functionInfo: { name: "findMax(n, arr)", params: "n: int, arr: int[]", returnType: "int", goal: "Find maximum value in array." },
    walkthrough: { input: "3, [10, 50, 20]", received: "arr=[10,50,20]", expected: "50", output: "50" },
    starterCode: {
      python: `import sys

def find_max(n, arr):
    # TODO: Find maximum element in array
    return -10**10

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if len(data) >= 1:
        n = int(data[0])
        arr = [int(x) for x in data[1:n+1]]
        print(find_max(n, arr))`,
      java: `import java.util.Scanner;

public class Main {
    public static long findMax(int n, int[] arr) {
        // TODO: Find maximum element in array
        return Long.MIN_VALUE;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] a = new int[n];
            for (int i = 0; i < n; i++) {
                if (sc.hasNextInt()) a[i] = sc.nextInt();
            }
            System.out.println(findMax(n, a));
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <climits>

using namespace std;

long long findMax(int n, vector<int>& a) {
    // TODO: Find maximum element in array
    return LLONG_MIN;
}

int main() {
    int n;
    if (cin >> n) {
        vector<int> a(n);
        for (int i = 0; i < n; i++) cin >> a[i];
        cout << findMax(n, a) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function findMax(n, arr) {
    // TODO: Find maximum element in array
    return -Infinity;
}

const input = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (input.length > 1) {
    const n = parseInt(input[0]);
    const arr = input.slice(1, n + 1).filter(x => x !== '').map(Number);
    console.log(findMax(n, arr));
}`,
      c: `#include <stdio.h>
#include <limits.h>

long long findMax(int n, int* arr) {
    // TODO: Find maximum element in array
    return -2147483648LL;
}

int main() {
    int n;
    if (scanf("%d", &n) != EOF) {
        int a[100001];
        for (int i = 0; i < n; i++) scanf("%d", &a[i]);
        printf("%lld\\n", findMax(n, a));
    }
    return 0;
}`,
      csharp: `using System;

class Program {
    static long FindMax(int n, int[] arr) {
        // TODO: Find maximum element in array
        return long.MinValue;
    }

    static void Main() {
        string l1 = Console.ReadLine();
        if (l1 != null) {
            int n = int.Parse(l1);
            string l2 = Console.ReadLine();
            if (l2 != null) {
                int[] arr = Array.ConvertAll(l2.Split(' ', StringSplitOptions.RemoveEmptyEntries), int.Parse);
                Console.WriteLine(FindMax(n, arr));
            }
        }
    }
}`,
      go: `package main

import "fmt"

func findMax(n int, arr []int) int64 {
    // TODO: Find maximum element in array
    return -9223372036854775808
}

func main() {
    var n int
    if _, err := fmt.Scan(&n); err == nil {
        a := make([]int, n)
        for i := 0; i < n; i++ {
            fmt.Scan(&a[i])
        }
        fmt.Println(findMax(n, a))
    }
}`,
      rust: `use std::io::{self, BufRead};

fn find_max(arr: &[i64]) -> i64 {
    // TODO: Find maximum element in array
    i64::MIN
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    if let Some(Ok(l1)) = lines.next() {
        if let Some(Ok(l2)) = lines.next() {
            let a: Vec<i64> = l2.split_whitespace().map(|x| x.parse::<i64>().unwrap()).collect();
            println!("{}", find_max(&a));
        }
    }
}`
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
      python: `import sys

def reverse_s(s):
    # TODO: Return reversed version of 's'
    return ""

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    print(reverse_s(line))`,
      java: `import java.util.Scanner;

public class Main {
    public static String reverseString(String s) {
        // TODO: Return reversed version of 's'
        return "";
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            System.out.println(reverseString(sc.nextLine()));
        }
    }
}`,
      cpp: `#include <iostream>
#include <string>
#include <algorithm>

using namespace std;

string reverseString(string s) {
    // TODO: Return reversed version of 's'
    return "";
}

int main() {
    string s;
    if (getline(cin, s)) {
        cout << reverseString(s) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function reverseString(s) {
    // TODO: Return reversed version of 's'
    return "";
}

const input = fs.readFileSync(0, 'utf8').trim();
console.log(reverseString(input));`,
      c: `#include <stdio.h>
#include <string.h>

void reverseString(char* s) {
    // TODO: Invert the character sequence in 's'
}

int main() {
    char s[100001];
    if (fgets(s, 100001, stdin)) {
        int l = strlen(s);
        if (l > 0 && s[l - 1] == '\\n') s[--l] = '\\0';
        reverseString(s);
        printf("%s\\n", s);
    }
    return 0;
}`,
      csharp: `using System;

class Program {
    static string ReverseString(string s) {
        // TODO: Return reversed version of 's'
        return "";
    }

    static void Main() {
        string s = Console.ReadLine();
        if (s != null) {
            Console.WriteLine(ReverseString(s));
        }
    }
}`,
      go: `package main

import (
    "fmt"
    "bufio"
    "os"
)

func reverseString(s string) string {
    // TODO: Return reversed version of 's'
    return ""
}

func main() {
    reader := bufio.NewReader(os.Stdin)
    s, _ := reader.ReadString('\\n')
    fmt.Println(reverseString(s))
}`,
      rust: `use std::io::{self, BufRead};

fn reverse_string(s: &str) -> String {
    // TODO: Return reversed version of 's'
    String::new()
}

fn main() {
    let mut line = String::new();
    if let Ok(_) = io::stdin().lock().read_line(&mut line) {
        println!("{}", reverse_string(line.trim()));
    }
}`
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
    inputFormat: "Line 1: A string S.\\nLine 2: A character C.",
    outputFormat: "A single integer count.",
    constraints: ["- 1 <= |S| <= 10^5", "- S contains alphanumeric characters and spaces."],
    sampleInput: "Programming in Python\nn",
    sampleOutput: "3",
    explanation: "'n' appears 3 times in 'Programming in Python'.",
    functionInfo: { name: "charFreq(s, c)", params: "s: string, c: char", returnType: "int", goal: "Count occurrences of char in string." },
    walkthrough: { input: "\\"abc\\", 'a'", received: "s=\"abc\", c='a'", expected: "1", output: "1" },
    starterCode: {
      python: `import sys

def char_freq(s, c):
    # TODO: Return frequency of character 'c' in string 's'
    return 0

if __name__ == "__main__":
    lines = sys.stdin.read().splitlines()
    if len(lines) >= 2:
        print(char_freq(lines[0], lines[1][0]))`,
      java: `import java.util.Scanner;

public class Main {
    public static int charFreq(String s, char c) {
        // TODO: Return frequency of character 'c' in string 's'
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String s = sc.nextLine();
            if (sc.hasNextLine()) {
                String cLine = sc.nextLine();
                if (cLine.length() > 0) {
                    System.out.println(charFreq(s, cLine.charAt(0)));
                }
            }
        }
    }
}`,
      cpp: `#include <iostream>
#include <string>

using namespace std;

int charFreq(string s, char c) {
    // TODO: Return frequency of character 'c' in string 's'
    return 0;
}

int main() {
    string s;
    if (getline(cin, s)) {
        char c;
        if (cin >> c) {
            cout << charFreq(s, c) << endl;
        }
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function charFreq(s, c) {
    // TODO: Return frequency of character 'c' in string 's'
    return 0;
}

const lines = fs.readFileSync(0, 'utf8').split('\\n');
if (lines.length >= 2) {
    console.log(charFreq(lines[0], lines[1][0]));
}`,
      c: `#include <stdio.h>
#include <string.h>

int charFreq(char* s, char c) {
    // TODO: Return frequency of character 'c' in string 's'
    return 0;
}

int main() {
    char s[100001], c;
    if (fgets(s, 100001, stdin)) {
        if (scanf(" %c", &c) != EOF) {
            printf("%d\\n", charFreq(s, c));
        }
    }
    return 0;
}`,
      csharp: `using System;

class Program {
    static int CharFreq(string s, char c) {
        // TODO: Return frequency of character 'c' in string 's'
        return 0;
    }

    static void Main() {
        string s = Console.ReadLine();
        string cLine = Console.ReadLine();
        if (s != null && cLine != null && cLine.Length > 0) {
            Console.WriteLine(CharFreq(s, cLine[0]));
        }
    }
}`,
      go: `package main

import (
    "fmt"
    "bufio"
    "os"
)

func charFreq(s string, c byte) int {
    // TODO: Return frequency of character 'c' in string 's'
    return 0
}

func main() {
    reader := bufio.NewReader(os.Stdin)
    s, _ := reader.ReadString('\\n')
    cLine, _ := reader.ReadString('\\n')
    if len(cLine) > 0 {
        fmt.Println(charFreq(s, cLine[0]))
    }
}`,
      rust: `use std::io::{self, BufRead};

fn char_freq(s: &str, c: char) -> usize {
    // TODO: Return frequency of character 'c' in string 's'
    0
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    if let Some(Ok(s)) = lines.next() {
        if let Some(Ok(c_line)) = lines.next() {
            if let Some(c) = c_line.chars().next() {
                println!("{}", char_freq(&s, c));
            }
        }
    }
}`
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
    inputFormat: "Line 1: Integer N.\\nLine 2: N sorted integers.",
    outputFormat: "The number of unique elements.",
    constraints: ["- 1 <= N <= 10^5", "- Array is sorted in non-decreasing order."],
    sampleInput: "5\n1 1 2 2 3",
    sampleOutput: "3",
    explanation: "Unique elements are 1, 2, 3. Count is 3.",
    functionInfo: { name: "countUnique(n, arr)", params: "n: int, arr: int[]", returnType: "int", goal: "Count unique elements in sorted array." },
    walkthrough: { input: "5, [1,1,2,2,3]", received: "arr=[1,1,2,2,3]", expected: "3", output: "3" },
    starterCode: {
      python: `import sys

def count_unique(n, arr):
    # TODO: Count unique elements in a sorted array
    return 0

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if len(data) >= 1:
        n = int(data[0])
        arr = [int(x) for x in data[1:n+1]]
        print(count_unique(n, arr))`,
      java: `import java.util.Scanner;

public class Main {
    public static int countUnique(int n, int[] arr) {
        // TODO: Count unique elements in a sorted array
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] arr = new int[n];
            for (int i = 0; i < n; i++) {
                if (sc.hasNextInt()) arr[i] = sc.nextInt();
            }
            System.out.println(countUnique(n, arr));
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

int countUnique(int n, vector<int>& a) {
    // TODO: Count unique elements in a sorted array
    return 0;
}

int main() {
    int n;
    if (cin >> n) {
        vector<int> a(n);
        for (int i = 0; i < n; i++) cin >> a[i];
        cout << countUnique(n, a) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function countUnique(n, arr) {
    // TODO: Count unique elements in a sorted array
    return 0;
}

const tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (tokens.length > 1) {
    const n = parseInt(tokens[0]);
    const arr = tokens.slice(1, n + 1).filter(x => x !== '').map(Number);
    console.log(countUnique(n, arr));
}`,
      c: `#include <stdio.h>

int countUnique(int n, int* arr) {
    // TODO: Count unique elements in a sorted array
    return 0;
}

int main() {
    int n;
    if (scanf("%d", &n) != EOF) {
        int a[100001];
        for (int i = 0; i < n; i++) scanf("%d", &a[i]);
        printf("%d\\n", countUnique(n, a));
    }
    return 0;
}`,
      csharp: `using System;

class Program {
    static int CountUnique(int n, int[] arr) {
        // TODO: Count unique elements in a sorted array
        return 0;
    }

    static void Main() {
        string l1 = Console.ReadLine();
        if (l1 != null) {
            int n = int.Parse(l1);
            string l2 = Console.ReadLine();
            if (l2 != null) {
                int[] arr = Array.ConvertAll(l2.Split(' ', StringSplitOptions.RemoveEmptyEntries), int.Parse);
                Console.WriteLine(CountUnique(n, arr));
            }
        }
    }
}`,
      go: `package main

import "fmt"

func countUnique(n int, arr []int) int {
    // TODO: Count unique elements in a sorted array
    return 0
}

func main() {
    var n int
    if _, err := fmt.Scan(&n); err == nil {
        a := make([]int, n)
        for i := 0; i < n; i++ {
            fmt.Scan(&a[i])
        }
        fmt.Println(countUnique(n, a))
    }
}`,
      rust: `use std::io::{self, BufRead};

fn count_unique(arr: &[i32]) -> usize {
    // TODO: Count unique elements in a sorted array
    0
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    if let Some(Ok(l1)) = lines.next() {
        if let Ok(n) = l1.trim().parse::<usize>() {
            if let Some(Ok(l2)) = lines.next() {
                let a: Vec<i32> = l2.split_whitespace().map(|x| x.parse().unwrap()).collect();
                println!("{}", count_unique(&a));
            }
        }
    }
}`
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
    inputFormat: "Line 1: Integer N.\\nLine 2: N integers.\\nLine 3: Target integer T.",
    outputFormat: "FOUND or NOT FOUND.",
    constraints: ["- 1 <= N <= 10^5", "- -10^9 <= element, T <= 10^9"],
    sampleInput: "4\n1 5 8 12\n8",
    sampleOutput: "FOUND",
    explanation: "8 exists in the array.",
    functionInfo: { name: "search(n, arr, t)", params: "n: int, arr: int[], t: int", returnType: "string", goal: "Find target in array." },
    walkthrough: { input: "[1,2,3], 2", received: "arr=[1,2,3], t=2", expected: "FOUND", output: "FOUND" },
    starterCode: {
      python: `import sys

def search(n, arr, t):
    # TODO: Check if 't' exists in 'arr'
    return "NOT FOUND"

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if len(data) >= 3:
        n = int(data[0])
        arr = [int(x) for x in data[1:n+1]]
        t = int(data[n+1])
        print(search(n, arr, t))`,
      java: `import java.util.Scanner;

public class Main {
    public static String search(int n, int[] a, int t) {
        // TODO: Check if 't' exists in 'a'
        return "NOT FOUND";
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] a = new int[n];
            for (int i = 0; i < n; i++) {
                if (sc.hasNextInt()) a[i] = sc.nextInt();
            }
            if (sc.hasNextInt()) {
                int t = sc.nextInt();
                System.out.println(search(n, a, t));
            }
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

string search(int n, vector<int>& a, int t) {
    // TODO: Check if 't' exists in 'a'
    return "NOT FOUND";
}

int main() {
    int n, t;
    if (cin >> n) {
        vector<int> a(n);
        for (int i = 0; i < n; i++) cin >> a[i];
        if (cin >> t) {
            cout << search(n, a, t) << endl;
        }
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function search(n, a, t) {
    // TODO: Check if 't' exists in 'a'
    return "NOT FOUND";
}

const tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (tokens.length >= 3) {
    const n = parseInt(tokens[0]);
    const a = tokens.slice(1, n + 1).filter(x => x !== '').map(Number);
    const t = parseInt(tokens[n + 1]);
    console.log(search(n, a, t));
}`,
      c: `#include <stdio.h>

char* search(int n, int* a, int t) {
    // TODO: Check if 't' exists in 'a'
    return "NOT FOUND";
}

int main() {
    int n, t;
    if (scanf("%d", &n) != EOF) {
        int a[100001];
        for (int i = 0; i < n; i++) scanf("%d", &a[i]);
        if (scanf("%d", &t) != EOF) {
            printf("%s\\n", search(n, a, t));
        }
    }
    return 0;
}`,
      csharp: `using System;
using System.Linq;

class Program {
    static string Search(int n, int[] a, int t) {
        // TODO: Check if 't' exists in 'a'
        return "NOT FOUND";
    }

    static void Main() {
        string l1 = Console.ReadLine();
        if (l1 != null) {
            int n = int.Parse(l1);
            string l2 = Console.ReadLine();
            if (l2 != null) {
                int[] a = l2.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();
                string l3 = Console.ReadLine();
                if (l3 != null) {
                    int t = int.Parse(l3);
                    Console.WriteLine(Search(n, a, t));
                }
            }
        }
    }
}`,
      go: `package main

import "fmt"

func search(n int, arr []int, t int) string {
    // TODO: Check if 't' exists in 'arr'
    return "NOT FOUND"
}

func main() {
    var n int
    if _, err := fmt.Scan(&n); err == nil {
        a := make([]int, n)
        for i := 0; i < n; i++ {
            fmt.Scan(&a[i])
        }
        var t int
        fmt.Scan(&t)
        fmt.Println(search(n, a, t))
    }
}`,
      rust: `use std::io::{self, BufRead};

fn search(a: &[i32], t: i32) -> String {
    // TODO: Check if 't' exists in 'a'
    "NOT FOUND".to_string()
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    if let Some(Ok(l1)) = lines.next() {
        if let Ok(n) = l1.trim().parse::<usize>() {
            if let Some(Ok(l2)) = lines.next() {
                let a: Vec<i32> = l2.split_whitespace().map(|x| x.parse().unwrap()).collect();
                if let Some(Ok(l3)) = lines.next() {
                    if let Ok(t) = l3.trim().parse::<i32>() {
                        println!("{}", search(&a, t));
                    }
                }
            }
        }
    }
}`
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
    inputFormat: "Line 1: Integer N.\\nLine 2: N integers.",
    outputFormat: "A single integer representing the minimum difference.",
    constraints: ["- 2 <= N <= 10^5", "- -10^9 <= element <= 10^9"],
    sampleInput: "4\n1 15 3 9",
    sampleOutput: "2",
    explanation: "Min diff is between 1 and 3: |1-3| = 2.",
    functionInfo: { name: "minDiff(n, arr)", params: "n: int, arr: int[]", returnType: "int", goal: "Find minimum absolute difference." },
    walkthrough: { input: "[1,5,3]", received: "arr=[1,5,3]", expected: "2", output: "2" },
    starterCode: {
      python: `import sys

def min_diff(n, arr):
    # TODO: Find the minimum absolute difference between any two elements
    return 0

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if len(data) >= 1:
        n = int(data[0])
        arr = [int(x) for x in data[1:n+1]]
        print(min_diff(n, arr))`,
      java: `import java.util.Scanner;

public class Main {
    public static long minDiff(int n, long[] a) {
        // TODO: Find the minimum absolute difference between any two elements
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            long[] a = new long[n];
            for (int i = 0; i < n; i++) {
                if (sc.hasNextLong()) a[i] = sc.nextLong();
            }
            System.out.println(minDiff(n, a));
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

long long minDiff(int n, vector<long long>& a) {
    // TODO: Find the minimum absolute difference between any two elements
    return 0;
}

int main() {
    int n;
    if (cin >> n) {
        vector<long long> a(n);
        for (int i = 0; i < n; i++) cin >> a[i];
        cout << minDiff(n, a) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function minDiff(n, a) {
    // TODO: Find the minimum absolute difference between any two elements
    return 0;
}

const tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (tokens.length > 1) {
    const n = parseInt(tokens[0]);
    const a = tokens.slice(1, n + 1).filter(x => x !== '').map(Number);
    console.log(minDiff(n, a));
}`,
      c: `#include <stdio.h>
#include <stdlib.h>
#include <limits.h>

long long minDiff(int n, int* a) {
    // TODO: Find the minimum absolute difference between any two elements
    return 0;
}

int main() {
    int n;
    if (scanf("%d", &n) != EOF) {
        int a[100001];
        for (int i = 0; i < n; i++) scanf("%d", &a[i]);
        printf("%lld\\n", minDiff(n, a));
    }
    return 0;
}`,
      csharp: `using System;
using System.Linq;

class Program {
    static long MinDiff(int n, long[] a) {
        // TODO: Find the minimum absolute difference between any two elements
        return 0;
    }

    static void Main() {
        string l1 = Console.ReadLine();
        if (l1 != null) {
            int n = int.Parse(l1);
            string l2 = Console.ReadLine();
            if (l2 != null) {
                long[] a = l2.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(long.Parse).ToArray();
                Console.WriteLine(MinDiff(n, a));
            }
        }
    }
}`,
      go: `package main

import (
    "fmt"
    "sort"
)

func minDiff(n int, arr []int) int {
    // TODO: Find the minimum absolute difference between any two elements
    return 0
}

func main() {
    var n int
    if _, err := fmt.Scan(&n); err == nil {
        a := make([]int, n)
        for i := 0; i < n; i++ {
            fmt.Scan(&a[i])
        }
        fmt.Println(minDiff(n, a))
    }
}`,
      rust: `use std::io::{self, BufRead};

fn min_diff(a: &mut [i64]) -> i64 {
    // TODO: Find the minimum absolute difference between any two elements
    0
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    if let Some(Ok(l1)) = lines.next() {
        if let Ok(n) = l1.trim().parse::<usize>() {
            if let Some(Ok(l2)) = lines.next() {
                let mut a: Vec<i64> = l2.split_whitespace().map(|x| x.parse().unwrap()).collect();
                println!("{}", min_diff(&mut a));
            }
        }
    }
}`
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
    inputFormat: "Line 1: Integer N.\\nLine 2: N integers.\\nLine 3: Target T.",
    outputFormat: "Two space-separated indices.",
    constraints: ["- 2 <= N <= 10^5", "- -10^9 <= element, T <= 10^9"],
    sampleInput: "4\n2 7 11 15\n9",
    sampleOutput: "0 1",
    explanation: "Find two numbers whose sum equals the target and print their indices.",
    functionInfo: { name: "twoSum(n, arr, t)", params: "n: int, arr: int[], t: int", returnType: "int[]", goal: "Find indices of two numbers that sum to target." },
    walkthrough: { input: "[2,7], 9", received: "arr=[2,7], t=9", expected: "0 1", output: "0 1" },
    starterCode: {
      python: `import sys

def two_sum(n, arr, t):
    # TODO: Find indices of two elements that sum to 't'
    return "0 0"

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if len(data) >= 3:
        n = int(data[0])
        arr = [int(x) for x in data[1:n+1]]
        t = int(data[n+1])
        print(two_sum(n, arr, t))`,
      java: `import java.util.Scanner;

public class Main {
    public static void solve(int n, int[] a, int t) {
        // TODO: Find indices of two elements that sum to 't' and print them separated by space
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] a = new int[n];
            for (int i = 0; i < n; i++) {
                if (sc.hasNextInt()) a[i] = sc.nextInt();
            }
            if (sc.hasNextInt()) {
                int t = sc.nextInt();
                solve(n, a, t);
            }
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

void solve(int n, vector<int>& a, int t) {
    // TODO: Find indices of two elements that sum to 't' and print them separated by space
}

int main() {
    int n;
    if (cin >> n) {
        vector<int> a(n);
        for (int i = 0; i < n; i++) cin >> a[i];
        int t;
        if (cin >> t) {
            solve(n, a, t);
        }
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function solve(n, a, t) {
    // TODO: Find indices of two elements that sum to 't' and log them
}

const tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (tokens.length >= 3) {
    const n = parseInt(tokens[0]);
    const arr = tokens.slice(1, n + 1).filter(x => x !== '').map(Number);
    const t = parseInt(tokens[n + 1]);
    solve(n, arr, t);
}`,
      c: `#include <stdio.h>

void solve(int n, int* a, int t) {
    // TODO: Find indices of two elements that sum to 't' and print them
}

int main() {
    int n, t;
    if (scanf("%d", &n) != EOF) {
        int a[100001];
        for (int i = 0; i < n; i++) scanf("%d", &a[i]);
        if (scanf("%d", &t) != EOF) {
            solve(n, a, t);
        }
    }
    return 0;
}`,
      csharp: `using System;
using System.Linq;

class Program {
    static void Solve(int n, int[] a, int t) {
        // TODO: Find indices of two elements that sum to 't' and print them
    }

    static void Main() {
        string l1 = Console.ReadLine();
        if (l1 != null) {
            int n = int.Parse(l1);
            string l2 = Console.ReadLine();
            if (l2 != null) {
                int[] a = l2.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();
                string l3 = Console.ReadLine();
                if (l3 != null) {
                    int t = int.Parse(l3);
                    Solve(n, a, t);
                }
            }
        }
    }
}`,
      go: `package main

import "fmt"

func solve(n int, arr []int, t int) {
    // TODO: Find indices of two elements that sum to 't' and print them
}

func main() {
    var n int
    if _, err := fmt.Scan(&n); err == nil {
        a := make([]int, n)
        for i := 0; i < n; i++ {
            fmt.Scan(&a[i])
        }
        var t int
        fmt.Scan(&t)
        solve(n, a, t)
    }
}`,
      rust: `use std::io::{self, BufRead};

fn solve(a: &[i32], t: i32) {
    // TODO: Find indices of two elements that sum to 't' and print them
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    if let Some(Ok(l1)) = lines.next() {
        if let Ok(n) = l1.trim().parse::<usize>() {
            if let Some(Ok(l2)) = lines.next() {
                let a: Vec<i32> = l2.split_whitespace().map(|x| x.parse().unwrap()).collect();
                if let Some(Ok(l3)) = lines.next() {
                    if let Ok(t) = l3.trim().parse::<i32>() {
                        solve(&a, t);
                    }
                }
            }
        }
    }
}`
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
    inputFormat: "Line 1: Integer N.\\nLine 2: N space-separated integers.",
    outputFormat: "A single integer representing the maximum sum.",
    constraints: ["- 1 <= N <= 10^5", "- -10^4 <= element <= 10^4"],
    sampleInput: "9\n-2 1 -3 4 -1 2 1 -5 4",
    sampleOutput: "6",
    explanation: "Implement Kadane's algorithm to find the maximum contiguous subarray sum.",
    functionInfo: { name: "maxSubArray(n, arr)", params: "n: int, arr: int[]", returnType: "int", goal: "Find maximum subarray sum." },
    walkthrough: { input: "[1,-2,3]", received: "arr=[1,-2,3]", expected: "3", output: "3" },
    starterCode: {
      python: `import sys

def max_subarray(n, arr):
    # TODO: Implement Kadane's algorithm
    return 0

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if len(data) >= 1:
        n = int(data[0])
        arr = [int(x) for x in data[1:n+1]]
        print(max_subarray(n, arr))`,
      java: `import java.util.Scanner;

public class Main {
    public static long maxSubArray(int n, int[] arr) {
        // TODO: Implement Kadane's algorithm
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] arr = new int[n];
            for (int i = 0; i < n; i++) {
                if (sc.hasNextInt()) arr[i] = sc.nextInt();
            }
            System.out.println(maxSubArray(n, arr));
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

long long maxSubArray(int n, vector<int>& a) {
    // TODO: Implement Kadane's algorithm
    return 0;
}

int main() {
    int n;
    if (cin >> n) {
        vector<int> a(n);
        for (int i = 0; i < n; i++) cin >> a[i];
        cout << maxSubArray(n, a) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function maxSubArray(n, a) {
    // TODO: Implement Kadane's algorithm
    return 0;
}

const tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (tokens.length > 1) {
    const n = parseInt(tokens[0]);
    const arr = tokens.slice(1, n + 1).filter(x => x !== '').map(Number);
    console.log(maxSubArray(n, arr));
}`,
      c: `#include <stdio.h>

long long maxSubArray(int n, int* arr) {
    // TODO: Implement Kadane's algorithm
    return 0;
}

int main() {
    int n;
    if (scanf("%d", &n) != EOF) {
        int a[100001];
        for (int i = 0; i < n; i++) scanf("%d", &a[i]);
        printf("%lld\\n", maxSubArray(n, a));
    }
    return 0;
}`,
      csharp: `using System;

class Program {
    static long MaxSubArray(int n, int[] arr) {
        // TODO: Implement Kadane's algorithm
        return 0;
    }

    static void Main() {
        string l1 = Console.ReadLine();
        if (l1 != null) {
            int n = int.Parse(l1);
            string l2 = Console.ReadLine();
            if (l2 != null) {
                int[] a = Array.ConvertAll(l2.Split(' ', StringSplitOptions.RemoveEmptyEntries), int.Parse);
                Console.WriteLine(MaxSubArray(n, a));
            }
        }
    }
}`,
      go: `package main

import "fmt"

func maxSubArray(n int, arr []int) int64 {
    // TODO: Implement Kadane's algorithm
    return 0
}

func main() {
    var n int
    if _, err := fmt.Scan(&n); err == nil {
        a := make([]int, n)
        for i := 0; i < n; i++ {
            fmt.Scan(&a[i])
        }
        fmt.Println(maxSubArray(n, a))
    }
}`,
      rust: `use std::io::{self, BufRead};

fn max_subarray(a: &[i64]) -> i64 {
    // TODO: Implement Kadane's algorithm
    0
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    if let Some(Ok(l1)) = lines.next() {
        if let Ok(n) = l1.trim().parse::<usize>() {
            if let Some(Ok(l2)) = lines.next() {
                let a: Vec<i64> = l2.split_whitespace().map(|x| x.parse().unwrap()).collect();
                println!("{}", max_subarray(&a));
            }
        }
    }
}`
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
    walkthrough: { input: "\\"{}\\"", received: "s=\"{}\"", expected: "YES", output: "YES" },
    starterCode: {
      python: `import sys

def is_valid(s):
    # TODO: Validate bracket balance using a stack
    return False

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if is_valid(line):
        print("YES")
    else:
        print("NO")`,
      java: `import java.util.Scanner;

public class Main {
    public static boolean isValid(String s) {
        // TODO: Validate bracket balance using a stack
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            String s = sc.next();
            if (isValid(s)) {
                System.out.println("YES");
            } else {
                System.out.println("NO");
            }
        }
    }
}`,
      cpp: `#include <iostream>
#include <stack>
#include <string>

using namespace std;

bool isValid(string s) {
    // TODO: Validate bracket balance using a stack
    return false;
}

int main() {
    string s;
    if (cin >> s) {
        if (isValid(s)) {
            cout << "YES" << endl;
        } else {
            cout << "NO" << endl;
        }
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function isValid(s) {
    // TODO: Validate bracket balance using a stack
    return false;
}

const input = fs.readFileSync(0, 'utf8').trim();
console.log(isValid(input) ? "YES" : "NO");`,
      c: `#include <stdio.h>
#include <stdbool.h>

bool isValid(char* s) {
    // TODO: Validate bracket balance using a stack
    return false;
}

int main() {
    char s[100001];
    if (scanf("%s", s) != EOF) {
        printf("%s\\n", isValid(s) ? "YES" : "NO");
    }
    return 0;
}`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    static bool IsValid(string s) {
        // TODO: Validate bracket balance using a stack
        return false;
    }

    static void Main() {
        string s = Console.ReadLine();
        if (s != null) {
            Console.WriteLine(IsValid(s.Trim()) ? "YES" : "NO");
        }
    }
}`,
      go: `package main

import "fmt"

func isValid(s string) bool {
    // TODO: Validate bracket balance using a stack
    return false
}

func main() {
    var s string
    fmt.Scan(&s)
    if isValid(s) {
        fmt.Println("YES")
    } else {
        fmt.Println("NO")
    }
}`,
      rust: `use std::io::{self, BufRead};

fn is_valid(s: &str) -> bool {
    // TODO: Validate bracket balance using a stack
    false
}

fn main() {
    let mut line = String::new();
    if let Ok(_) = io::stdin().lock().read_line(&mut line) {
        let s = line.trim();
        println!("{}", if is_valid(s) { "YES" } else { "NO" });
    }
}`
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
    inputFormat: "Line 1: String S1.\\nLine 2: String S2.",
    outputFormat: "YES or NO.",
    constraints: ["- 1 <= |S1|, |S2| <= 10^5"],
    sampleInput: "listen\nsilent",
    sampleOutput: "YES",
    explanation: "Two strings are anagrams if they have the same frequency of every character.",
    functionInfo: { name: "isAnagram(s1, s2)", params: "s1: string, s2: string", returnType: "boolean", goal: "Detect if two strings are anagrams." },
    walkthrough: { input: "\\"a\\", \\"a\\"", received: "s1=\"a\", s2=\"a\"", expected: "YES", output: "YES" },
    starterCode: {
      python: `import sys

def is_anagram(s1, s2):
    # TODO: Determine if 's1' and 's2' are anagrams
    return False

if __name__ == "__main__":
    lines = sys.stdin.read().splitlines()
    if len(lines) >= 2:
        if is_anagram(lines[0], lines[1]):
            print("YES")
        else:
            print("NO")`,
      java: `import java.util.Scanner;

public class Main {
    public static boolean isAnagram(String s1, String s2) {
        // TODO: Determine if 's1' and 's2' are anagrams
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            String s1 = sc.next();
            if (sc.hasNext()) {
                String s2 = sc.next();
                if (isAnagram(s1, s2)) {
                    System.out.println("YES");
                } else {
                    System.out.println("NO");
                }
            }
        }
    }
}`,
      cpp: `#include <iostream>
#include <string>

using namespace std;

bool isAnagram(string s1, string s2) {
    // TODO: Determine if 's1' and 's2' are anagrams
    return false;
}

int main() {
    string s1, s2;
    if (cin >> s1 >> s2) {
        if (isAnagram(s1, s2)) {
            cout << "YES" << endl;
        } else {
            cout << "NO" << endl;
        }
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function isAnagram(s1, s2) {
    // TODO: Determine if 's1' and 's2' are anagrams
    return false;
}

const tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (tokens.length >= 2) {
    console.log(isAnagram(tokens[0], tokens[1]) ? "YES" : "NO");
}`,
      c: `#include <stdio.h>
#include <string.h>
#include <stdbool.h>

bool isAnagram(char* s1, char* s2) {
    // TODO: Determine if 's1' and 's2' are anagrams
    return false;
}

int main() {
    char s1[100001], s2[100001];
    if (scanf("%s %s", s1, s2) != EOF) {
        if (isAnagram(s1, s2)) {
            printf("YES\\n");
        } else {
            printf("NO\\n");
        }
    }
    return 0;
}`,
      csharp: `using System;

class Program {
    static bool IsAnagram(string s1, string s2) {
        // TODO: Determine if 's1' and 's2' are anagrams
        return false;
    }

    static void Main() {
        string s1 = Console.ReadLine();
        string s2 = Console.ReadLine();
        if (s1 != null && s2 != null) {
            if (IsAnagram(s1.Trim(), s2.Trim())) {
                Console.WriteLine("YES");
            } else {
                Console.WriteLine("NO");
            }
        }
    }
}`,
      go: `package main

import "fmt"

func isAnagram(s1, s2 string) bool {
    // TODO: Determine if 's1' and 's2' are anagrams
    return false
}

func main() {
    var s1, s2 string
    if _, err := fmt.Scan(&s1, &s2); err == nil {
        if isAnagram(s1, s2) {
            fmt.Println("YES")
        } else {
            fmt.Println("NO")
        }
    }
}`,
      rust: `use std::io::{self, BufRead};

fn is_anagram(s1: &str, s2: &str) -> bool {
    // TODO: Determine if 's1' and 's2' are anagrams
    false
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    if let Some(Ok(s1)) = lines.next() {
        if let Some(Ok(s2)) = lines.next() {
            let res = is_anagram(s1.trim(), s2.trim());
            println!("{}", if res { "YES" } else { "NO" });
        }
    }
}`
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
    inputFormat: "Line 1: N1 (Size of A1).\\nLine 2: N1 sorted integers.\\nLine 3: N2 (Size of A2).\\nLine 4: N2 sorted integers.",
    outputFormat: "Merged space-separated sorted integers.",
    constraints: ["- 1 <= N1, N2 <= 10^5", "- Array elements are sorted."],
    sampleInput: "3\n1 3 5\n2\n2 4",
    sampleOutput: "1 2 3 4 5",
    explanation: "Merge the two sorted arrays into one while maintaining the sorted order.",
    functionInfo: { name: "merge(n1, a1, n2, a2)", params: "n1: int, a1: int[], n2: int, a2: int[]", returnType: "int[]", goal: "Merge two sorted arrays." },
    walkthrough: { input: "[1], [2]", received: "a1=[1], a2=[2]", expected: "1 2", output: "1 2" },
    starterCode: {
      python: `import sys

def merge(n1, a1, n2, a2):
    # TODO: Merge two sorted arrays into a new sorted array
    # Return the merged list
    return []

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if len(data) >= 2:
        idx = 0
        n1 = int(data[idx]); idx += 1
        a1 = [int(x) for x in data[idx:idx+n1]]; idx += n1
        n2 = int(data[idx]); idx += 1
        a2 = [int(x) for x in data[idx:idx+n2]]
        res = merge(n1, a1, n2, a2)
        print(" ".join(map(str, res)))`,
      java: `import java.util.Scanner;

public class Main {
    public static void merge(int n1, int[] a1, int n2, int[] a2) {
        // TODO: Merge and print the combined sorted elements separated by space
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n1 = sc.nextInt();
            int[] a1 = new int[n1];
            for (int i = 0; i < n1; i++) if (sc.hasNextInt()) a1[i] = sc.nextInt();
            if (sc.hasNextInt()) {
                int n2 = sc.nextInt();
                int[] a2 = new int[n2];
                for (int i = 0; i < n2; i++) if (sc.hasNextInt()) a2[i] = sc.nextInt();
                merge(n1, a1, n2, a2);
            }
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

void mergeSorted(int n1, vector<int>& a1, int n2, vector<int>& a2) {
    // TODO: Merge and print the combined sorted elements separated by space
}

int main() {
    int n1, n2;
    if (cin >> n1) {
        vector<int> a1(n1);
        for (int i = 0; i < n1; i++) cin >> a1[i];
        if (cin >> n2) {
            vector<int> a2(n2);
            for (int i = 0; i < n2; i++) cin >> a2[i];
            mergeSorted(n1, a1, n2, a2);
        }
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function merge(n1, a1, n2, a2) {
    // TODO: Merge two sorted arrays into a new sorted array and return it
    return [];
}

const tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (tokens.length > 1) {
    let idx = 0;
    const n1 = parseInt(tokens[idx++]);
    const a1 = tokens.slice(idx, idx + n1).filter(x => x !== '').map(Number); idx += n1;
    const n2 = parseInt(tokens[idx++]);
    const a2 = tokens.slice(idx, idx + n2).filter(x => x !== '').map(Number);
    console.log(merge(n1, a1, n2, a2).join(' '));
}`,
      c: `#include <stdio.h>

void merge(int n1, int* a1, int n2, int* a2) {
    // TODO: Merge and print the combined sorted elements separated by space
}

int main() {
    int n1, n2;
    if (scanf("%d", &n1) != EOF) {
        int a1[100001], a2[100001];
        for (int i = 0; i < n1; i++) scanf("%d", &a1[i]);
        if (scanf("%d", &n2) != EOF) {
            for (int i = 0; i < n2; i++) scanf("%d", &a2[i]);
            merge(n1, a1, n2, a2);
        }
    }
    return 0;
}`,
      csharp: `using System;
using System.Collections.Generic;
using System.Linq;

class Program {
    static void Merge(int[] a1, int[] a2) {
        // TODO: Merge and print the combined sorted elements separated by space
    }

    static void Main() {
        string s1 = Console.ReadLine();
        if (s1 == null) return;
        int n1 = int.Parse(s1);
        int[] a1 = Console.ReadLine().Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();
        string s2 = Console.ReadLine();
        if (s2 == null) return;
        int n2 = int.Parse(s2);
        int[] a2 = Console.ReadLine().Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();
        Merge(a1, a2);
    }
}`,
      go: `package main

import "fmt"

func merge(a1, a2 []int) []int {
    // TODO: Merge two sorted arrays into a new sorted array
    return []int{}
}

func main() {
    var n1, n2 int
    fmt.Scan(&n1)
    a1 := make([]int, n1); for i := 0; i < n1; i++ { fmt.Scan(&a1[i]) }
    fmt.Scan(&n2)
    a2 := make([]int, n2); for i := 0; i < n2; i++ { fmt.Scan(&a2[i]) }
    res := merge(a1, a2)
    for i, v := range res {
        fmt.Print(v)
        if i < len(res)-1 { fmt.Print(" ") }
    }
    fmt.Println()
}`,
      rust: `use std::io::{self, BufRead};

fn merge(a1: &[i32], a2: &[i32]) -> Vec<i32> {
    // TODO: Merge two sorted arrays into a new sorted array
    Vec::new()
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    if let Some(Ok(l1)) = lines.next() {
        if let Ok(n1) = l1.trim().parse::<usize>() {
            if let Some(Ok(l2)) = lines.next() {
                let a1: Vec<i32> = l2.split_whitespace().map(|x| x.parse().unwrap()).collect();
                if let Some(Ok(l3)) = lines.next() {
                    if let Ok(n2) = l3.trim().parse::<usize>() {
                        if let Some(Ok(l4)) = lines.next() {
                            let a2: Vec<i32> = l4.split_whitespace().map(|x| x.parse().unwrap()).collect();
                            let res = merge(&a1, &a2);
                            let output: Vec<String> = res.iter().map(|x| x.to_string()).collect();
                            println!("{}", output.join(" "));
                        }
                    }
                }
            }
        }
    }
}`
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
    inputFormat: "Line 1: N.\\nLine 2: N sorted integers.\\nLine 3: Target T.",
    outputFormat: "Index or -1.",
    constraints: ["- 1 <= N <= 10^5", "- Sorted array.", "- -10^9 <= element, T <= 10^9"],
    sampleInput: "5\n1 2 3 4 5\n4",
    sampleOutput: "3",
    explanation: "Implement an efficient search that runs in logarithmic time.",
    functionInfo: { name: "binarySearch(n, arr, t)", params: "n: int, arr: int[], t: int", returnType: "int", goal: "Implement binary search." },
    walkthrough: { input: "[1,2,3], 3", received: "arr=[1,2,3], t=3", expected: "2", output: "2" },
    starterCode: {
      python: `import sys

def bin_search(n, arr, t):
    # TODO: Implement binary search to find 't' in sorted 'arr'
    return -1

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if len(data) >= 3:
        n = int(data[0])
        arr = [int(x) for x in data[1:n+1]]
        t = int(data[n+1])
        print(bin_search(n, arr, t))`,
      java: `import java.util.Scanner;

public class Main {
    public static int binarySearch(int n, int[] a, int t) {
        // TODO: Implement binary search to find 't' in sorted 'a'
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] a = new int[n];
            for (int i = 0; i < n; i++) if (sc.hasNextInt()) a[i] = sc.nextInt();
            if (sc.hasNextInt()) {
                int t = sc.nextInt();
                System.out.println(binarySearch(n, a, t));
            }
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

int binarySearch(int n, vector<int>& a, int t) {
    // TODO: Implement binary search to find 't' in sorted 'a'
    return -1;
}

int main() {
    int n, t;
    if (cin >> n) {
        vector<int> a(n);
        for (int i = 0; i < n; i++) cin >> a[i];
        if (cin >> t) {
            cout << binarySearch(n, a, t) << endl;
        }
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function binarySearch(n, a, t) {
    // TODO: Implement binary search to find 't' in sorted 'a'
    return -1;
}

const tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (tokens.length >= 3) {
    const n = parseInt(tokens[0]);
    const arr = tokens.slice(1, n + 1).filter(x => x !== '').map(Number);
    const t = parseInt(tokens[n + 1]);
    console.log(binarySearch(n, arr, t));
}`,
      c: `#include <stdio.h>

int binarySearch(int n, int* a, int t) {
    // TODO: Implement binary search to find 't' in sorted 'a'
    return -1;
}

int main() {
    int n, t;
    if (scanf("%d", &n) != EOF) {
        int a[100001];
        for (int i = 0; i < n; i++) scanf("%d", &a[i]);
        if (scanf("%d", &t) != EOF) {
            printf("%d\\n", binarySearch(n, a, t));
        }
    }
    return 0;
}`,
      csharp: `using System;
using System.Linq;

class Program {
    static int BinarySearch(int n, int[] a, int t) {
        // TODO: Implement binary search to find 't' in sorted 'a'
        return -1;
    }

    static void Main() {
        string l1 = Console.ReadLine();
        if (l1 != null) {
            int n = int.Parse(l1);
            string l2 = Console.ReadLine();
            if (l2 != null) {
                int[] a = l2.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();
                string l3 = Console.ReadLine();
                if (l3 != null) {
                    int t = int.Parse(l3);
                    Console.WriteLine(BinarySearch(n, a, t));
                }
            }
        }
    }
}`,
      go: `package main

import "fmt"

func binarySearch(n int, arr []int, t int) int {
    // TODO: Implement binary search to find 't' in sorted 'arr'
    return -1
}

func main() {
    var n int
    if _, err := fmt.Scan(&n); err == nil {
        a := make([]int, n)
        for i := 0; i < n; i++ {
            fmt.Scan(&a[i])
        }
        var t int
        fmt.Scan(&t)
        fmt.Println(binarySearch(n, a, t))
    }
}`,
      rust: `use std::io::{self, BufRead};

fn binary_search(a: &[i32], t: i32) -> i32 {
    // TODO: Implement binary search to find 't' in sorted 'a'
    -1
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    if let Some(Ok(l1)) = lines.next() {
        if let Ok(n) = l1.trim().parse::<usize>() {
            if let Some(Ok(l2)) = lines.next() {
                let a: Vec<i32> = l2.split_whitespace().map(|x| x.parse().unwrap()).collect();
                if let Some(Ok(l3)) = lines.next() {
                    if let Ok(t) = l3.trim().parse::<i32>() {
                        println!("{}", binary_search(&a, t));
                    }
                }
            }
        }
    }
}`
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
    inputFormat: "Line 1: N, K.\\nLine 2: N integers.",
    outputFormat: "The maximum sum.",
    constraints: ["- 1 <= K <= N <= 10^5", "- -10^4 <= element <= 10^4"],
    sampleInput: "4 2\n1 2 3 4",
    sampleOutput: "7",
    explanation: "Calculate the sum of every sliding window of size K and return the maximum value.",
    functionInfo: { name: "maxSumK(n, k, arr)", params: "n: int, k: int, arr: int[]", returnType: "long", goal: "Find max sum of subarray size K." },
    walkthrough: { input: "[1,2,3], 2", received: "arr=[1,2,3], k=2", expected: "5", output: "5" },
    starterCode: {
      python: `import sys

def max_sum_k(n, k, arr):
    # TODO: Find maximum sum of a contiguous subarray of size 'k'
    return 0

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if len(data) >= 2:
        n = int(data[0])
        k = int(data[1])
        arr = [int(x) for x in data[2:n+2]]
        print(max_sum_k(n, k, arr))`,
      java: `import java.util.Scanner;

public class Main {
    public static long maxSumK(int n, int k, int[] a) {
        // TODO: Find maximum sum of a contiguous subarray of size 'k'
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            if (sc.hasNextInt()) {
                int k = sc.nextInt();
                int[] a = new int[n];
                for (int i = 0; i < n; i++) if (sc.hasNextInt()) a[i] = sc.nextInt();
                System.out.println(maxSumK(n, k, a));
            }
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

long long maxSumK(int n, int k, vector<int>& a) {
    // TODO: Find maximum sum of a contiguous subarray of size 'k'
    return 0;
}

int main() {
    int n, k;
    if (cin >> n >> k) {
        vector<int> a(n);
        for (int i = 0; i < n; i++) cin >> a[i];
        cout << maxSumK(n, k, a) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function maxSumK(n, k, a) {
    // TODO: Find maximum sum of a contiguous subarray of size 'k'
    return 0;
}

const tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (tokens.length >= 2) {
    const n = parseInt(tokens[0]);
    const k = parseInt(tokens[1]);
    const arr = tokens.slice(2, n + 2).filter(x => x !== '').map(Number);
    console.log(maxSumK(n, k, arr).toString());
}`,
      c: `#include <stdio.h>

long long maxSumK(int n, int k, int* a) {
    // TODO: Find maximum sum of a contiguous subarray of size 'k'
    return 0;
}

int main() {
    int n, k;
    if (scanf("%d %d", &n, &k) != EOF) {
        int a[100001];
        for (int i = 0; i < n; i++) scanf("%d", &a[i]);
        printf("%lld\\n", maxSumK(n, k, a));
    }
    return 0;
}`,
      csharp: `using System;
using System.Linq;

class Program {
    static long MaxSumK(int n, int k, int[] a) {
        // TODO: Find maximum sum of a contiguous subarray of size 'k'
        return 0;
    }

    static void Main() {
        string line1 = Console.ReadLine();
        if (line1 != null) {
            string[] parts = line1.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length >= 2) {
                int n = int.Parse(parts[0]);
                int k = int.Parse(parts[1]);
                string line2 = Console.ReadLine();
                if (line2 != null) {
                    int[] a = line2.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();
                    Console.WriteLine(MaxSumK(n, k, a));
                }
            }
        }
    }
}`,
      go: `package main

import "fmt"

func maxSumK(n, k int, arr []int) int64 {
    // TODO: Find maximum sum of a contiguous subarray of size 'k'
    return 0
}

func main() {
    var n, k int
    if _, err := fmt.Scan(&n, &k); err == nil {
        a := make([]int, n)
        for i := 0; i < n; i++ {
            fmt.Scan(&a[i])
        }
        fmt.Println(maxSumK(n, k, a))
    }
}`,
      rust: `use std::io::{self, BufRead};

fn max_sum_k(a: &[i64], k: usize) -> i64 {
    // TODO: Find maximum sum of a contiguous subarray of size 'k'
    0
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    if let Some(Ok(l1)) = lines.next() {
        let v: Vec<usize> = l1.split_whitespace().map(|x| x.parse().unwrap()).collect();
        if v.len() >= 2 {
            let (_n, k) = (v[0], v[1]);
            if let Some(Ok(l2)) = lines.next() {
                let a: Vec<i64> = l2.split_whitespace().map(|x| x.parse().unwrap()).collect();
                println!("{}", max_sum_k(&a, k));
            }
        }
    }
}`
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
    inputFormat: "Line 1: N.\\nLine 2: N integers.",
    outputFormat: "The index or -1.",
    constraints: ["- 1 <= N <= 10^5", "- -10^5 <= element <= 10^5"],
    sampleInput: "3\n1 2 1",
    sampleOutput: "1",
    explanation: "The pivot point where the left-side sum equals the right-side sum.",
    functionInfo: { name: "findEquilibrium(n, arr)", params: "n: int, arr: int[]", returnType: "int", goal: "Find pivot index." },
    walkthrough: { input: "[1,7,3,6,5,6]", received: "arr=[1,7,3,6,5,6]", expected: "3", output: "3" },
    starterCode: {
      python: `import sys

def find_equilibrium(n, arr):
    # TODO: Find the equilibrium index (sum left == sum right)
    return -1

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if len(data) >= 1:
        n = int(data[0])
        arr = [int(x) for x in data[1:n+1]]
        print(find_equilibrium(n, arr))`,
      java: `import java.util.Scanner;

public class Main {
    public static int findEquilibrium(int n, int[] a) {
        // TODO: Find the equilibrium index (sum left == sum right)
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] a = new int[n];
            for (int i = 0; i < n; i++) if (sc.hasNextInt()) a[i] = sc.nextInt();
            System.out.println(findEquilibrium(n, a));
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

int findEquilibrium(int n, vector<int>& a) {
    // TODO: Find the equilibrium index (sum left == sum right)
    return -1;
}

int main() {
    int n;
    if (cin >> n) {
        vector<int> a(n);
        for (int i = 0; i < n; i++) cin >> a[i];
        cout << findEquilibrium(n, a) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function findEquilibrium(n, a) {
    // TODO: Find the equilibrium index (sum left == sum right)
    return -1;
}

const tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (tokens.length > 1) {
    const n = parseInt(tokens[0]);
    const arr = tokens.slice(1, n + 1).filter(x => x !== '').map(Number);
    console.log(findEquilibrium(n, arr));
}`,
      c: `#include <stdio.h>

int findEquilibrium(int n, int* a) {
    // TODO: Find the equilibrium index (sum left == sum right)
    return -1;
}

int main() {
    int n;
    if (scanf("%d", &n) != EOF) {
        int a[100001];
        for (int i = 0; i < n; i++) scanf("%d", &a[i]);
        printf("%d\\n", findEquilibrium(n, a));
    }
    return 0;
}`,
      csharp: `using System;
using System.Linq;

class Program {
    static int FindEquilibrium(int n, int[] a) {
        // TODO: Find the equilibrium index (sum left == sum right)
        return -1;
    }

    static void Main() {
        string l1 = Console.ReadLine();
        if (l1 != null) {
            int n = int.Parse(l1);
            string l2 = Console.ReadLine();
            if (l2 != null) {
                int[] a = l2.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();
                Console.WriteLine(FindEquilibrium(n, a));
            }
        }
    }
}`,
      go: `package main

import "fmt"

func findEquilibrium(n int, arr []int) int {
    // TODO: Find the equilibrium index (sum left == sum right)
    return -1
}

func main() {
    var n int
    if _, err := fmt.Scan(&n); err == nil {
        a := make([]int, n)
        for i := 0; i < n; i++ {
            fmt.Scan(&a[i])
        }
        fmt.Println(findEquilibrium(n, a))
    }
}`,
      rust: `use std::io::{self, BufRead};

fn find_equilibrium(a: &[i32]) -> i32 {
    // TODO: Find the equilibrium index (sum left == sum right)
    -1
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    if let Some(Ok(l1)) = lines.next() {
        if let Ok(n) = l1.trim().parse::<usize>() {
            if let Some(Ok(l2)) = lines.next() {
                let a: Vec<i32> = l2.split_whitespace().map(|x| x.parse().unwrap()).collect();
                println!("{}", find_equilibrium(&a));
            }
        }
    }
}`
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
    inputFormat: "Line 1: N, K.\\nLine 2: N integers.",
    outputFormat: "Space-separated rotated array integers.",
    constraints: ["- 1 <= N <= 10^5", "- 0 <= K <= 10^9"],
    sampleInput: "3 1\n1 2 3",
    sampleOutput: "3 1 2",
    explanation: "Move every element K positions to the right, wrapping around to the beginning.",
    functionInfo: { name: "rotate(n, k, arr)", params: "n: int, k: int, arr: int[]", returnType: "int[]", goal: "Rotate array by K positions." },
    walkthrough: { input: "[1,2], 1", received: "arr=[1,2], k=1", expected: "2 1", output: "2 1" },
    starterCode: {
      python: `import sys

def rotate(n, k, arr):
    # TODO: Rotate array 'arr' to the right by 'k' steps
    # Return the rotated list
    return []

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if len(data) >= 2:
        n = int(data[0])
        k = int(data[1])
        arr = [int(x) for x in data[2:n+2]]
        res = rotate(n, k, arr)
        print(" ".join(map(str, res)))`,
      java: `import java.util.Scanner;

public class Main {
    public static void rotate(int n, int k, int[] a) {
        // TODO: Rotate array 'a' to the right by 'k' steps and print separated by space
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            if (sc.hasNextInt()) {
                int k = sc.nextInt();
                int[] a = new int[n];
                for (int i = 0; i < n; i++) if (sc.hasNextInt()) a[i] = sc.nextInt();
                rotate(n, k, a);
            }
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

void rotateArray(int n, int k, vector<int>& a) {
    // TODO: Rotate array 'a' to the right by 'k' steps and print separated by space
}

int main() {
    int n, k;
    if (cin >> n >> k) {
        vector<int> a(n);
        for (int i = 0; i < n; i++) cin >> a[i];
        rotateArray(n, k, a);
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function rotateArray(n, k, a) {
    // TODO: Rotate array 'a' to the right by 'k' steps and return it as array
    return [];
}

const tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (tokens.length >= 2) {
    const n = parseInt(tokens[0]);
    const k = parseInt(tokens[1]);
    const arr = tokens.slice(2, n + 2).filter(x => x !== '').map(Number);
    console.log(rotateArray(n, k, arr).join(' '));
}`,
      c: `#include <stdio.h>

void rotateArray(int n, int k, int* a) {
    // TODO: Rotate array 'a' to the right by 'k' steps and print separated by space
}

int main() {
    int n, k;
    if (scanf("%d %d", &n, &k) != EOF) {
        int a[100001];
        for (int i = 0; i < n; i++) scanf("%d", &a[i]);
        rotateArray(n, k, a);
    }
    return 0;
}`,
      csharp: `using System;
using System.Linq;

class Program {
    static void Rotate(int n, int k, int[] a) {
        // TODO: Rotate array 'a' to the right by 'k' steps and print separated by space
    }

    static void Main() {
        string line1 = Console.ReadLine();
        if (line1 != null) {
            string[] parts = line1.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length >= 2) {
                int n = int.Parse(parts[0]);
                int k = int.Parse(parts[1]);
                string line2 = Console.ReadLine();
                if (line2 != null) {
                    int[] a = line2.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();
                    Rotate(n, k, a);
                }
            }
        }
    }
}`,
      go: `package main

import "fmt"

func rotate(n, k int, arr []int) []int {
    // TODO: Rotate array 'arr' to the right by 'k' steps
    return []int{}
}

func main() {
    var n, k int
    if _, err := fmt.Scan(&n, &k); err == nil {
        a := make([]int, n)
        for i := 0; i < n; i++ {
            fmt.Scan(&a[i])
        }
        res := rotate(n, k, a)
        for i, v := range res {
            fmt.Print(v)
            if i < len(res)-1 { fmt.Print(" ") }
        }
        fmt.Println()
    }
}`,
      rust: `use std::io::{self, BufRead};

fn rotate(a: &[i32], k: usize) -> Vec<i32> {
    // TODO: Rotate array 'a' to the right by 'k' steps
    Vec::new()
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    if let Some(Ok(l1)) = lines.next() {
        let v: Vec<usize> = l1.split_whitespace().map(|x| x.parse().unwrap()).collect();
        if v.len() >= 2 {
            let (n, k) = (v[0], v[1]);
            if let Some(Ok(l2)) = lines.next() {
                let a: Vec<i32> = l2.split_whitespace().map(|x| x.parse().unwrap()).collect();
                let res = rotate(&a, k);
                let output: Vec<String> = res.iter().map(|x| x.to_string()).collect();
                println!("{}", output.join(" "));
            }
        }
    }
}`
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
    walkthrough: { input: "\\"bbbbb\\"", received: "s=\"bbbbb\"", expected: "1", output: "1" },
    starterCode: {
      python: `import sys

def longest_unique(s):
    # TODO: Find length of longest substring without repeating characters
    return 0

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    print(longest_unique(line))`,
      java: `import java.util.Scanner;

public class Main {
    public static int longestUniqueSub(String s) {
        // TODO: Find length of longest substring without repeating characters
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            System.out.println(longestUniqueSub(sc.nextLine()));
        }
    }
}`,
      cpp: `#include <iostream>
#include <string>

using namespace std;

int longestUniqueSub(string s) {
    // TODO: Find length of longest substring without repeating characters
    return 0;
}

int main() {
    string s;
    if (getline(cin, s)) {
        cout << longestUniqueSub(s) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function longestUniqueSub(s) {
    // TODO: Find length of longest substring without repeating characters
    return 0;
}

const input = fs.readFileSync(0, 'utf8').trim();
console.log(longestUniqueSub(input));`,
      c: `#include <stdio.h>
#include <string.h>

int longestUniqueSub(char* s) {
    // TODO: Find length of longest substring without repeating characters
    return 0;
}

int main() {
    char s[100001];
    if (fgets(s, 100001, stdin)) {
        int l = strlen(s);
        if (l > 0 && s[l - 1] == '\\n') s[--l] = '\\0';
        printf("%d\\n", longestUniqueSub(s));
    }
    return 0;
}`,
      csharp: `using System;

class Program {
    static int LongestUniqueSub(string s) {
        // TODO: Find length of longest substring without repeating characters
        return 0;
    }

    static void Main() {
        string s = Console.ReadLine();
        Console.WriteLine(LongestUniqueSub(s ?? ""));
    }
}`,
      go: `package main

import (
    "fmt"
    "bufio"
    "os"
)

func longestUniqueSub(s string) int {
    // TODO: Find length of longest substring without repeating characters
    return 0
}

func main() {
    reader := bufio.NewReader(os.Stdin)
    s, _ := reader.ReadString('\\n')
    fmt.Println(longestUniqueSub(s))
}`,
      rust: `use std::io::{self, BufRead};

fn longest_unique_sub(s: &str) -> usize {
    // TODO: Find length of longest substring without repeating characters
    0
}

fn main() {
    let mut line = String::new();
    if let Ok(_) = io::stdin().lock().read_line(&mut line) {
        println!("{}", longest_unique_sub(line.trim()));
    }
}`
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
    walkthrough: { input: "\\"abacaba\\"", received: "s=\"abacaba\"", expected: "7", output: "7" },
    starterCode: {
      python: `import sys

def longest_pal(s):
    # TODO: Find the length of the longest palindromic substring
    return 0

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    print(longest_pal(line))`,
      java: `import java.util.Scanner;

public class Main {
    public static int longestPal(String s) {
        // TODO: Find the length of the longest palindromic substring
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            System.out.println(longestPal(sc.nextLine()));
        }
    }
}`,
      cpp: `#include <iostream>
#include <string>

using namespace std;

int longestPal(string s) {
    // TODO: Find the length of the longest palindromic substring
    return 0;
}

int main() {
    string s;
    if (getline(cin, s)) {
        cout << longestPal(s) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function longestPal(s) {
    // TODO: Find the length of the longest palindromic substring
    return 0;
}

const input = fs.readFileSync(0, 'utf8').trim();
console.log(longestPal(input));`,
      c: `#include <stdio.h>
#include <string.h>

int longestPal(char* s) {
    // TODO: Find the length of the longest palindromic substring
    return 0;
}

int main() {
    char s[2001];
    if (fgets(s, 2001, stdin)) {
        int l = strlen(s);
        if (l > 0 && s[l - 1] == '\\n') s[--l] = '\\0';
        printf("%d\\n", longestPal(s));
    }
    return 0;
}`,
      csharp: `using System;

class Program {
    static int LongestPal(string s) {
        // TODO: Find the length of the longest palindromic substring
        return 0;
    }

    static void Main() {
        string s = Console.ReadLine();
        Console.WriteLine(LongestPal(s ?? ""));
    }
}`,
      go: `package main

import (
    "fmt"
    "bufio"
    "os"
)

func longestPal(s string) int {
    // TODO: Find the length of the longest palindromic substring
    return 0
}

func main() {
    reader := bufio.NewReader(os.Stdin)
    s, _ := reader.ReadString('\\n')
    fmt.Println(longestPal(s))
}`,
      rust: `use std::io::{self, BufRead};

fn longest_pal(s: &str) -> usize {
    // TODO: Find the length of the longest palindromic substring
    0
}

fn main() {
    let mut line = String::new();
    if let Ok(_) = io::stdin().lock().read_line(&mut line) {
        println!("{}", longest_pal(line.trim()));
    }
}`
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
    inputFormat: "Line 1: N.\\nFollowing N lines: Two integers start, end.",
    outputFormat: "Each merged interval on a new line.",
    constraints: ["- 1 <= N <= 10^5", "- 0 <= start <= end <= 10^6"],
    sampleInput: "4\n1 3\n2 6\n8 10\n15 18",
    sampleOutput: "1 6\n8 10\n15 18",
    explanation: "Identify intervals that overlap and fuse them into single continuous ranges.",
    functionInfo: { name: "mergeIntervals(n, intervals)", params: "n: int, intervals: int[][]", returnType: "int[][]", goal: "Combine overlapping intervals." },
    walkthrough: { input: "2, [1,5], [2,6]", received: "intv=[[1,5],[2,6]]", expected: "1 6", output: "1 6" },
    starterCode: {
      python: `import sys

def merge_intervals(n, intervals):
    # TODO: Merge overlapping intervals and print results line by line
    # Output each merged interval as "start end" on a new line
    pass

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if len(data) >= 1:
        n = int(data[0])
        intervals = []
        for i in range(n):
            intervals.append([int(data[2*i+1]), int(data[2*i+2])])
        merge_intervals(n, intervals)`,
      java: `import java.util.Scanner;

public class Main {
    public static void mergeIntervals(int n, int[][] intervals) {
        // TODO: Merge overlapping intervals and print results line by line
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[][] a = new int[n][2];
            for (int i = 0; i < n; i++) {
                if (sc.hasNextInt()) a[i][0] = sc.nextInt();
                if (sc.hasNextInt()) a[i][1] = sc.nextInt();
            }
            mergeIntervals(n, a);
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

void mergeIntervals(int n, vector<pair<int, int>>& a) {
    // TODO: Merge overlapping intervals and print results line by line
}

int main() {
    int n;
    if (cin >> n) {
        vector<pair<int, int>> a(n);
        for (int i = 0; i < n; i++) cin >> a[i].first >> a[i].second;
        mergeIntervals(n, a);
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function mergeIntervals(n, a) {
    // TODO: Merge overlapping intervals and log results line by line
}

const tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (tokens.length > 1) {
    const n = parseInt(tokens[0]);
    const a = [];
    for (let i = 0; i < n; i++) {
        a.push([parseInt(tokens[2 * i + 1]), parseInt(tokens[2 * i + 2])]);
    }
    mergeIntervals(n, a);
}`,
      c: `#include <stdio.h>

void mergeIntervals(int n, int a[][2]) {
    // TODO: Merge overlapping intervals and print results line by line
}

int main() {
    int n;
    if (scanf("%d", &n) != EOF) {
        int a[100001][2];
        for (int i = 0; i < n; i++) scanf("%d %d", &a[i][0], &a[i][1]);
        mergeIntervals(n, a);
    }
    return 0;
}`,
      csharp: `using System;
using System.Collections.Generic;
using System.Linq;

class Program {
    static void MergeIntervals(int n, int[][] a) {
        // TODO: Merge overlapping intervals and print results line by line
    }

    static void Main() {
        string line = Console.ReadLine();
        if (line != null) {
            int n = int.Parse(line);
            int[][] a = new int[n][];
            for (int i = 0; i < n; i++) {
                string row = Console.ReadLine();
                if (row != null) {
                    a[i] = row.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();
                }
            }
            MergeIntervals(n, a);
        }
    }
}`,
      go: `package main

import (
    "fmt"
    "sort"
)

func mergeIntervals(n int, a [][]int) {
    // TODO: Merge overlapping intervals and print results line by line
}

func main() {
    var n int
    if _, err := fmt.Scan(&n); err == nil {
        a := make([][]int, n)
        for i := 0; i < n; i++ {
            a[i] = make([]int, 2)
            fmt.Scan(&a[i][0], &a[i][1])
        }
        mergeIntervals(n, a)
    }
}`,
      rust: `use std::io::{self, BufRead};

fn merge_intervals(a: Vec<Vec<i32>>) {
    // TODO: Merge overlapping intervals and print results line by line
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    if let Some(Ok(l1)) = lines.next() {
        if let Ok(n) = l1.trim().parse::<usize>() {
            let mut g = Vec::new();
            for _ in 0..n {
                if let Some(Ok(ln)) = lines.next() {
                    let v: Vec<i32> = ln.split_whitespace().map(|x| x.parse().unwrap()).collect();
                    g.push(v);
                }
            }
            merge_intervals(g);
        }
    }
}`
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
    inputFormat: "Line 1: N, K.\\nLine 2: N integers.",
    outputFormat: "K space-separated most frequent integers.",
    constraints: ["- 1 <= N <= 10^5", "- 1 <= K <= number of unique elements"],
    sampleInput: "6 2\n1 1 1 2 2 3",
    sampleOutput: "1 2",
    explanation: "Count the occurrence of each integer and return the K elements with the highest counts.",
    functionInfo: { name: "topK(n, k, arr)", params: "n: int, k: int, arr: int[]", returnType: "int[]", goal: "Find K most frequent elements." },
    walkthrough: { input: "[1,1,2], 1", received: "arr=[1,1,2], k=1", expected: "1", output: "1" },
    starterCode: {
      python: `import sys

def top_k(n, k, arr):
    # TODO: Find K most frequent elements and return the list
    return []

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if len(data) >= 2:
        n = int(data[0])
        k = int(data[1])
        arr = [int(x) for x in data[2:n+2]]
        res = top_k(n, k, arr)
        print(" ".join(map(str, res)))`,
      java: `import java.util.Scanner;

public class Main {
    public static void topK(int n, int k, int[] arr) {
        // TODO: Find and print K most frequent elements separated by space
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            if (sc.hasNextInt()) {
                int k = sc.nextInt();
                int[] arr = new int[n];
                for (int i = 0; i < n; i++) if (sc.hasNextInt()) arr[i] = sc.nextInt();
                topK(n, k, arr);
            }
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

void topK(int n, int k, vector<int>& a) {
    // TODO: Find and print K most frequent elements separated by space
}

int main() {
    int n, k;
    if (cin >> n >> k) {
        vector<int> a(n);
        for (int i = 0; i < n; i++) cin >> a[i];
        topK(n, k, a);
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function topK(n, k, a) {
    // TODO: Find K most frequent elements and return them as an array
    return [];
}

const tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (tokens.length >= 2) {
    const n = parseInt(tokens[0]);
    const k = parseInt(tokens[1]);
    const arr = tokens.slice(2, n + 2).filter(x => x !== '').map(Number);
    console.log(topK(n, k, arr).join(' '));
}`,
      c: `#include <stdio.h>

void topK(int n, int k, int* a) {
    // TODO: Find and print K most frequent elements separated by space
}

int main() {
    int n, k;
    if (scanf("%d %d", &n, &k) != EOF) {
        int a[100001];
        for (int i = 0; i < n; i++) scanf("%d", &a[i]);
        topK(n, k, a);
    }
    return 0;
}`,
      csharp: `using System;
using System.Collections.Generic;
using System.Linq;

class Program {
    static void TopK(int n, int k, int[] a) {
        // TODO: Find and print K most frequent elements separated by space
    }

    static void Main() {
        string line1 = Console.ReadLine();
        if (line1 != null) {
            string[] parts = line1.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length >= 2) {
                int n = int.Parse(parts[0]);
                int k = int.Parse(parts[1]);
                string line2 = Console.ReadLine();
                if (line2 != null) {
                    int[] a = line2.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();
                    TopK(n, k, a);
                }
            }
        }
    }
}`,
      go: `package main

import "fmt"

func topK(n, k int, arr []int) []int {
    // TODO: Find K most frequent elements
    return []int{}
}

func main() {
    var n, k int
    if _, err := fmt.Scan(&n, &k); err == nil {
        a := make([]int, n)
        for i := 0; i < n; i++ {
            fmt.Scan(&a[i])
        }
        res := topK(n, k, a)
        for i, v := range res {
            fmt.Print(v)
            if i < len(res)-1 { fmt.Print(" ") }
        }
        fmt.Println()
    }
}`,
      rust: `use std::io::{self, BufRead};

fn top_k(a: &[i32], k: usize) -> Vec<i32> {
    // TODO: Find K most frequent elements
    Vec::new()
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    if let Some(Ok(l1)) = lines.next() {
        let v: Vec<usize> = l1.split_whitespace().map(|x| x.parse().unwrap()).collect();
        if v.len() >= 2 {
            let (n, k) = (v[0], v[1]);
            if let Some(Ok(l2)) = lines.next() {
                let a: Vec<i32> = l2.split_whitespace().map(|x| x.parse().unwrap()).collect();
                let res = top_k(&a, k);
                let output: Vec<String> = res.iter().map(|x| x.to_string()).collect();
                println!("{}", output.join(" "));
            }
        }
    }
}`
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
    inputFormat: "Line 1: String S.\\nLine 2: String T.",
    outputFormat: "The integer length of the minimum window. If no window exists, return 0.",
    constraints: ["- 1 <= |S|, |T| <= 10^5"],
    sampleInput: "ADOBECODEBANC\nABC",
    sampleOutput: "4",
    explanation: "Find the smallest contiguous sequence in S that contains all the letters in T.",
    functionInfo: { name: "minWindow(s, t)", params: "s: string, t: string", returnType: "int", goal: "Find min window substring length." },
    walkthrough: { input: "\\"a\\", \\"a\\"", received: "s=\"a\", t=\"a\"", expected: "1", output: "1" },
    starterCode: {
      python: `import sys

def min_window(s, t):
    # TODO: Find length of the smallest window in 's' containing all characters of 't'
    return 0

if __name__ == "__main__":
    lines = sys.stdin.read().splitlines()
    if len(lines) >= 2:
        print(min_window(lines[0], lines[1]))`,
      java: `import java.util.Scanner;

public class Main {
    public static int minWindow(String s, String t) {
        // TODO: Find length of the smallest window in 's' containing all characters of 't'
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String s = sc.nextLine();
            if (sc.hasNextLine()) {
                String t = sc.nextLine();
                System.out.println(minWindow(s, t));
            }
        }
    }
}`,
      cpp: `#include <iostream>
#include <string>

using namespace std;

int minWindow(string s, string t) {
    // TODO: Find length of the smallest window in 's' containing all characters of 't'
    return 0;
}

int main() {
    string s, t;
    if (cin >> s >> t) {
        cout << minWindow(s, t) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function minWindow(s, t) {
    // TODO: Find length of the smallest window in 's' containing all characters of 't'
    return 0;
}

const tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (tokens.length >= 2) {
    console.log(minWindow(tokens[0], tokens[1]));
}`,
      c: `#include <stdio.h>
#include <string.h>

int minWindow(char* s, char* t) {
    // TODO: Find length of the smallest window in 's' containing all characters of 't'
    return 0;
}

int main() {
    char s[100001], t[100001];
    if (scanf("%s %s", s, t) != EOF) {
        printf("%d\\n", minWindow(s, t));
    }
    return 0;
}`,
      csharp: `using System;

class Program {
    static int MinWindow(string s, string t) {
        // TODO: Find length of the smallest window in 's' containing all characters of 't'
        return 0;
    }

    static void Main() {
        string s = Console.ReadLine();
        string t = Console.ReadLine();
        if (s != null && t != null) {
            Console.WriteLine(MinWindow(s.Trim(), t.Trim()));
        }
    }
}`,
      go: `package main

import "fmt"

func minWindow(s, t string) int {
    // TODO: Find length of the smallest window in 's' containing all characters of 't'
    return 0
}

func main() {
    var s, t string
    if _, err := fmt.Scan(&s, &t); err == nil {
        fmt.Println(minWindow(s, t))
    }
}`,
      rust: `use std::io::{self, BufRead};

fn min_window(s: &str, t: &str) -> usize {
    // TODO: Find length of the smallest window in 's' containing all characters of 't'
    0
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    if let Some(Ok(s)) = lines.next() {
        if let Some(Ok(t)) = lines.next() {
            println!("{}", min_window(s.trim(), t.trim()));
        }
    }
}`
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
    inputFormat: "Line 1: Integer N.\\nLine 2: N integers.",
    outputFormat: "Length of the longest consecutive sequence.",
    constraints: ["- 1 <= N <= 10^5", "- -10^9 <= element <= 10^9"],
    sampleInput: "6\n100 4 200 1 3 2",
    sampleOutput: "4",
    explanation: "Find the longest sequence of integers that are consecutive (e.g., 1, 2, 3, 4) in the array.",
    functionInfo: { name: "longestConsecutive(n, arr)", params: "n: int, arr: int[]", returnType: "int", goal: "Find longest consecutive chain length." },
    walkthrough: { input: "[10, 5, 11, 6]", received: "arr=[10,5,11,6]", expected: "2", output: "2" },
    starterCode: {
      python: `import sys

def longest_consecutive(n, arr):
    # TODO: Find length of the longest consecutive sequence in O(n) time
    return 0

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if len(data) >= 1:
        n = int(data[0])
        arr = [int(x) for x in data[1:n+1]]
        print(longest_consecutive(n, arr))`,
      java: `import java.util.Scanner;

public class Main {
    public static int longestConsecutive(int n, int[] arr) {
        // TODO: Find length of the longest consecutive sequence in O(n) time
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] a = new int[n];
            for (int i = 0; i < n; i++) if (sc.hasNextInt()) a[i] = sc.nextInt();
            System.out.println(longestConsecutive(n, a));
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

int longestConsecutive(int n, vector<int>& a) {
    // TODO: Find length of the longest consecutive sequence in O(n) time
    return 0;
}

int main() {
    int n;
    if (cin >> n) {
        vector<int> a(n);
        for (int i = 0; i < n; i++) cin >> a[i];
        cout << longestConsecutive(n, a) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function longestConsecutive(n, a) {
    // TODO: Find length of the longest consecutive sequence in O(n) time
    return 0;
}

const tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (tokens.length > 1) {
    const n = parseInt(tokens[0]);
    const arr = tokens.slice(1, n + 1).filter(x => x !== '').map(Number);
    console.log(longestConsecutive(n, arr));
}`,
      c: `#include <stdio.h>

int longestConsecutive(int n, int* arr) {
    // TODO: Find length of the longest consecutive sequence in O(n) time
    return 0;
}

int main() {
    int n;
    if (scanf("%d", &n) != EOF) {
        int a[100001];
        for (int i = 0; i < n; i++) scanf("%d", &a[i]);
        printf("%d\\n", longestConsecutive(n, a));
    }
    return 0;
}`,
      csharp: `using System;
using System.Linq;

class Program {
    static int LongestConsecutive(int n, int[] arr) {
        // TODO: Find length of the longest consecutive sequence in O(n) time
        return 0;
    }

    static void Main() {
        string l1 = Console.ReadLine();
        if (l1 != null) {
            int n = int.Parse(l1);
            string l2 = Console.ReadLine();
            if (l2 != null) {
                int[] a = l2.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();
                Console.WriteLine(LongestConsecutive(n, a));
            }
        }
    }
}`,
      go: `package main

import "fmt"

func longestConsecutive(n int, arr []int) int {
    // TODO: Find length of the longest consecutive sequence in O(n) time
    return 0
}

func main() {
    var n int
    if _, err := fmt.Scan(&n); err == nil {
        a := make([]int, n)
        for i := 0; i < n; i++ {
            fmt.Scan(&a[i])
        }
        fmt.Println(longestConsecutive(n, a))
    }
}`,
      rust: `use std::io::{self, BufRead};

fn longest_consecutive(arr: &[i32]) -> usize {
    // TODO: Find length of the longest consecutive sequence in O(n) time
    0
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    if let Some(Ok(l1)) = lines.next() {
        if let Ok(n) = l1.trim().parse::<usize>() {
            if let Some(Ok(l2)) = lines.next() {
                let a: Vec<i32> = l2.split_whitespace().map(|x| x.parse().unwrap()).collect();
                println!("{}", longest_consecutive(&a));
            }
        }
    }
}`
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
    inputFormat: "Line 1: N.\\nFollowing N lines: N space-separated integers (0 or 1).",
    outputFormat: "YES or NO.",
    constraints: ["- 1 <= N <= 100"],
    sampleInput: "3\n0 0 1\n1 0 1\n1 0 0",
    sampleOutput: "YES",
    explanation: "Determine if a continuous path of 0s exists between the top-left and bottom-right corners.",
    functionInfo: { name: "hasPath(n, grid)", params: "n: int, grid: int[][]", returnType: "boolean", goal: "Find if exit is reachable from start." },
    walkthrough: { input: "2, [[0,1],[1,0]]", received: "grid=[[0,1],[1,0]]", expected: "NO", output: "NO" },
    starterCode: {
      python: `import sys

def has_path(n, grid):
    # TODO: Return True if a path exists from (0,0) to (n-1, n-1)
    return False

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if len(data) >= 1:
        n = int(data[0])
        grid = []
        for i in range(n):
            row = [int(x) for x in data[1 + i*n : 1 + (i+1)*n]]
            grid.append(row)
        if has_path(n, grid):
            print("YES")
        else:
            print("NO")`,
      java: `import java.util.Scanner;

public class Main {
    public static boolean hasPath(int n, int[][] g) {
        // TODO: Return true if a path exists from (0,0) to (n-1, n-1)
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[][] g = new int[n][n];
            for (int i = 0; i < n; i++) {
                for (int j = 0; j < n; j++) if (sc.hasNextInt()) g[i][j] = sc.nextInt();
            }
            if (hasPath(n, g)) {
                System.out.println("YES");
            } else {
                System.out.println("NO");
            }
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

bool hasPath(int n, vector<vector<int>>& g) {
    // TODO: Return true if a path exists from (0,0) to (n-1, n-1)
    return false;
}

int main() {
    int n;
    if (cin >> n) {
        vector<vector<int>> g(n, vector<int>(n));
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) cin >> g[i][j];
        }
        if (hasPath(n, g)) {
            cout << "YES" << endl;
        } else {
            cout << "NO" << endl;
        }
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function hasPath(n, g) {
    // TODO: Return true if a path exists from (0,0) to (n-1, n-1)
    return false;
}

const tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (tokens.length > 1) {
    const n = parseInt(tokens[0]);
    const g = [];
    for (let i = 0; i < n; i++) {
        g.push(tokens.slice(1 + i * n, 1 + (i + 1) * n).map(Number));
    }
    console.log(hasPath(n, g) ? "YES" : "NO");
}`,
      c: `#include <stdio.h>
#include <stdbool.h>

bool hasPath(int n, int g[][101]) {
    // TODO: Return true if a path exists from (0,0) to (n-1, n-1)
    return false;
}

int main() {
    int n;
    if (scanf("%d", &n) != EOF) {
        int g[101][101];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) scanf("%d", &g[i][j]);
        }
        printf("%s\\n", hasPath(n, g) ? "YES" : "NO");
    }
    return 0;
}`,
      csharp: `using System;

class Program {
    static bool HasPath(int n, int[][] g) {
        // TODO: Return true if a path exists from (0,0) to (n-1, n-1)
        return false;
    }

    static void Main() {
        string l = Console.ReadLine();
        if (l != null) {
            int n = int.Parse(l);
            int[][] g = new int[n][];
            for (int i = 0; i < n; i++) {
                string row = Console.ReadLine();
                if (row != null) {
                    g[i] = Array.ConvertAll(row.Split(' ', StringSplitOptions.RemoveEmptyEntries), int.Parse);
                }
            }
            Console.WriteLine(HasPath(n, g) ? "YES" : "NO");
        }
    }
}`,
      go: `package main

import "fmt"

func hasPath(n int, g [][]int) bool {
    // TODO: Return true if a path exists from (0,0) to (n-1, n-1)
    return false
}

func main() {
    var n int
    if _, err := fmt.Scan(&n); err == nil {
        g := make([][]int, n)
        for i := 0; i < n; i++ {
            g[i] = make([]int, n)
            for j := 0; j < n; j++ {
                fmt.Scan(&g[i][j])
            }
        }
        if hasPath(n, g) {
            fmt.Println("YES")
        } else {
            fmt.Println("NO")
        }
    }
}`,
      rust: `use std::io::{self, BufRead};

fn has_path(n: usize, g: Vec<Vec<i32>>) -> bool {
    // TODO: Return true if a path exists from (0,0) to (n-1, n-1)
    false
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    if let Some(Ok(l1)) = lines.next() {
        if let Ok(n) = l1.trim().parse::<usize>() {
            let mut g = Vec::new();
            for _ in 0..n {
                if let Some(Ok(ln)) = lines.next() {
                    let row: Vec<i32> = ln.split_whitespace().map(|x| x.parse().unwrap()).collect();
                    g.push(row);
                }
            }
            println!("{}", if has_path(n, g) { "YES" } else { "NO" });
        }
    }
}`
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
    inputFormat: "Line 1: N.\\nFollowing N lines: N integers.",
    outputFormat: "Shortest path length or -1.",
    constraints: ["- 1 <= N <= 100"],
    sampleInput: "3\n0 0 0\n1 1 0\n1 1 0",
    sampleOutput: "5",
    explanation: "Use Breadth-First Search (BFS) to find the minimum number of steps to reach the exit.",
    functionInfo: { name: "shortestPath(n, matrix)", params: "n: int, matrix: int[][]", returnType: "int", goal: "Find BFS distance in matrix." },
    walkthrough: { input: "2, [[0,0],[0,0]]", received: "grid=[[0,0],[0,0]]", expected: "3", output: "3" },
    starterCode: {
      python: `import sys

def shortest_path(n, grid):
    # TODO: Find shortest path from (0,0) to (n-1, n-1) using BFS
    return -1

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if len(data) >= 1:
        n = int(data[0])
        grid = []
        for i in range(n):
            row = [int(x) for x in data[1 + i*n : 1 + (i+1)*n]]
            grid.append(row)
        print(shortest_path(n, grid))`,
      java: `import java.util.Scanner;

public class Main {
    public static int shortestPath(int n, int[][] g) {
        // TODO: Find shortest path from (0,0) to (n-1, n-1) using BFS
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[][] g = new int[n][n];
            for (int i = 0; i < n; i++) {
                for (int j = 0; j < n; j++) if (sc.hasNextInt()) g[i][j] = sc.nextInt();
            }
            System.out.println(shortestPath(n, g));
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <queue>

using namespace std;

int shortestPath(int n, vector<vector<int>>& g) {
    // TODO: Find shortest path from (0,0) to (n-1, n-1) using BFS
    return -1;
}

int main() {
    int n;
    if (cin >> n) {
        vector<vector<int>> g(n, vector<int>(n));
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) cin >> g[i][j];
        }
        cout << shortestPath(n, g) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function shortestPath(n, g) {
    // TODO: Find shortest path from (0,0) to (n-1, n-1) using BFS
    return -1;
}

const tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (tokens.length > 1) {
    const n = parseInt(tokens[0]);
    const g = [];
    for (let i = 0; i < n; i++) {
        g.push(tokens.slice(1 + i * n, 1 + (i + 1) * n).map(Number));
    }
    console.log(shortestPath(n, g));
}`,
      c: `#include <stdio.h>

int shortestPath(int n, int g[][101]) {
    // TODO: Find shortest path from (0,0) to (n-1, n-1) using BFS
    return -1;
}

int main() {
    int n;
    if (scanf("%d", &n) != EOF) {
        int g[101][101];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) scanf("%d", &g[i][j]);
        }
        printf("%d\\n", shortestPath(n, g));
    }
    return 0;
}`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    static int ShortestPath(int n, int[][] g) {
        // TODO: Find shortest path from (0,0) to (n-1, n-1) using BFS
        return -1;
    }

    static void Main() {
        string l = Console.ReadLine();
        if (l != null) {
            int n = int.Parse(l);
            int[][] g = new int[n][];
            for (int i = 0; i < n; i++) {
                string row = Console.ReadLine();
                if (row != null) {
                    g[i] = Array.ConvertAll(row.Split(' ', StringSplitOptions.RemoveEmptyEntries), int.Parse);
                }
            }
            Console.WriteLine(ShortestPath(n, g));
        }
    }
}`,
      go: `package main

import "fmt"

func shortestPath(n int, g [][]int) int {
    // TODO: Find shortest path from (0,0) to (n-1, n-1) using BFS
    return -1
}

func main() {
    var n int
    if _, err := fmt.Scan(&n); err == nil {
        g := make([][]int, n)
        for i := 0; i < n; i++ {
            g[i] = make([]int, n)
            for j := 0; j < n; j++ {
                fmt.Scan(&g[i][j])
            }
        }
        fmt.Println(shortestPath(n, g))
    }
}`,
      rust: `use std::io::{self, BufRead};

fn shortest_path(n: usize, g: Vec<Vec<i32>>) -> i32 {
    // TODO: Find shortest path from (0,0) to (n-1, n-1) using BFS
    -1
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    if let Some(Ok(l1)) = lines.next() {
        if let Ok(n) = l1.trim().parse::<usize>() {
            let mut g = Vec::new();
            for _ in 0..n {
                if let Some(Ok(ln)) = lines.next() {
                    let row: Vec<i32> = ln.split_whitespace().map(|x| x.parse().unwrap()).collect();
                    g.push(row);
                }
            }
            println!("{}", shortest_path(n, g));
        }
    }
}`
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
    inputFormat: "Line 1: String S1.\\nLine 2: String S2.",
    outputFormat: "The length of LCS.",
    constraints: ["- 1 <= |S1|, |S2| <= 1000"],
    sampleInput: "abcde\nace",
    sampleOutput: "3",
    explanation: "Determine the length of the longest subsequence present in both strings using Dynamic Programming.",
    functionInfo: { name: "lcs(s1, s2)", params: "s1: string, s2: string", returnType: "int", goal: "Find length of LCS." },
    walkthrough: { input: "\\"abc\\", \\"abc\\"", received: "s1=\"abc\", s2=\"abc\"", expected: "3", output: "3" },
    starterCode: {
      python: `import sys

def lcs(s1, s2):
    # TODO: Find the length of the longest common subsequence
    return 0

if __name__ == "__main__":
    lines = sys.stdin.read().splitlines()
    if len(lines) >= 2:
        print(lcs(lines[0], lines[1]))`,
      java: `import java.util.Scanner;

public class Main {
    public static int lcs(String s1, String s2) {
        // TODO: Find the length of the longest common subsequence
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            String s1 = sc.next();
            if (sc.hasNext()) {
                String s2 = sc.next();
                System.out.println(lcs(s1, s2));
            }
        }
    }
}`,
      cpp: `#include <iostream>
#include <string>

using namespace std;

int lcs(string s1, string s2) {
    // TODO: Find the length of the longest common subsequence
    return 0;
}

int main() {
    string s1, s2;
    if (cin >> s1 >> s2) {
        cout << lcs(s1, s2) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function lcs(s1, s2) {
    // TODO: Find the length of the longest common subsequence
    return 0;
}

const tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (tokens.length >= 2) {
    console.log(lcs(tokens[0], tokens[1]));
}`,
      c: `#include <stdio.h>
#include <string.h>

int lcs(char* s1, char* s2) {
    // TODO: Find the length of the longest common subsequence
    return 0;
}

int main() {
    char s1[1001], s2[1001];
    if (scanf("%s %s", s1, s2) != EOF) {
        printf("%d\\n", lcs(s1, s2));
    }
    return 0;
}`,
      csharp: `using System;

class Program {
    static int Lcs(string s1, string s2) {
        // TODO: Find the length of the longest common subsequence
        return 0;
    }

    static void Main() {
        string s1 = Console.ReadLine();
        string s2 = Console.ReadLine();
        if (s1 != null && s2 != null) {
            Console.WriteLine(Lcs(s1.Trim(), s2.Trim()));
        }
    }
}`,
      go: `package main

import "fmt"

func lcs(s1, s2 string) int {
    // TODO: Find the length of the longest common subsequence
    return 0
}

func main() {
    var s1, s2 string
    if _, err := fmt.Scan(&s1, &s2); err == nil {
        fmt.Println(lcs(s1, s2))
    }
}`,
      rust: `use std::io::{self, BufRead};

fn lcs(s1: &str, s2: &str) -> usize {
    // TODO: Find the length of the longest common subsequence
    0
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    if let Some(Ok(s1)) = lines.next() {
        if let Some(Ok(s2)) = lines.next() {
            println!("{}", lcs(s1.trim(), s2.trim()));
        }
    }
}`
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
    inputFormat: "Line 1: N (Number of coin types), T (Target amount).\\nLine 2: N coin denominations.",
    outputFormat: "Minimum number of coins or -1.",
    constraints: ["- 1 <= N <= 100", "- 1 <= T <= 10^4", "- 1 <= coin <= 1000"],
    sampleInput: "3 11\n1 2 5",
    sampleOutput: "3",
    explanation: "Calculate the minimum number of coins required to achieve the exact target sum.",
    functionInfo: { name: "coinChange(coins, t)", params: "coins: int[], t: int", returnType: "int", goal: "Minimize coins for target sum." },
    walkthrough: { input: "[1,2,5], 11", received: "coins=[1,2,5], t=11", expected: "3", output: "3" },
    starterCode: {
      python: `import sys

def coin_change(n, t, coins):
    # TODO: Find the minimum number of coins needed to make amount 't'
    return -1

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if len(data) >= 2:
        n = int(data[0])
        t = int(data[1])
        coins = [int(x) for x in data[2:n+2]]
        print(coin_change(n, t, coins))`,
      java: `import java.util.Scanner;

public class Main {
    public static int coinChange(int[] coins, int t) {
        // TODO: Find the minimum number of coins needed to make amount 't'
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            if (sc.hasNextInt()) {
                int t = sc.nextInt();
                int[] coins = new int[n];
                for (int i = 0; i < n; i++) if (sc.hasNextInt()) coins[i] = sc.nextInt();
                System.out.println(coinChange(coins, t));
            }
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int coinChange(vector<int>& coins, int t) {
    // TODO: Find the minimum number of coins needed to make amount 't'
    return -1;
}

int main() {
    int n, t;
    if (cin >> n >> t) {
        vector<int> coins(n);
        for (int i = 0; i < n; i++) cin >> coins[i];
        cout << coinChange(coins, t) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function coinChange(coins, t) {
    // TODO: Find the minimum number of coins needed to make amount 't'
    return -1;
}

const tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (tokens.length >= 2) {
    const n = parseInt(tokens[0]);
    const t = parseInt(tokens[1]);
    const coins = tokens.slice(2, n + 2).filter(x => x !== '').map(Number);
    console.log(coinChange(coins, t));
}`,
      c: `#include <stdio.h>

int coinChange(int n, int* coins, int t) {
    // TODO: Find the minimum number of coins needed to make amount 't'
    return -1;
}

int main() {
    int n, t;
    if (scanf("%d %d", &n, &t) != EOF) {
        int coins[101];
        for (int i = 0; i < n; i++) scanf("%d", &coins[i]);
        printf("%d\\n", coinChange(n, coins, t));
    }
    return 0;
}`,
      csharp: `using System;
using System.Linq;

class Program {
    static int CoinChange(int[] coins, int t) {
        // TODO: Find the minimum number of coins needed to make amount 't'
        return -1;
    }

    static void Main() {
        string line1 = Console.ReadLine();
        if (line1 != null) {
            string[] parts = line1.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length >= 2) {
                int n = int.Parse(parts[0]);
                int t = int.Parse(parts[1]);
                string line2 = Console.ReadLine();
                if (line2 != null) {
                    int[] coins = line2.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();
                    Console.WriteLine(CoinChange(coins, t));
                }
            }
        }
    }
}`,
      go: `package main

import "fmt"

func coinChange(coins []int, t int) int {
    // TODO: Find the minimum number of coins needed to make amount 't'
    return -1
}

func main() {
    var n, t int
    if _, err := fmt.Scan(&n, &t); err == nil {
        coins := make([]int, n)
        for i := 0; i < n; i++ {
            fmt.Scan(&coins[i])
        }
        fmt.Println(coinChange(coins, t))
    }
}`,
      rust: `use std::io::{self, BufRead};

fn coin_change(coins: &[i32], t: i32) -> i32 {
    // TODO: Find the minimum number of coins needed to make amount 't'
    -1
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    if let Some(Ok(l1)) = lines.next() {
        let v: Vec<i32> = l1.split_whitespace().map(|x| x.parse().unwrap()).collect();
        if v.len() >= 2 {
            let (_n, t) = (v[0], v[1]);
            if let Some(Ok(l2)) = lines.next() {
                let coins: Vec<i32> = l2.split_whitespace().map(|x| x.parse().unwrap()).collect();
                println!("{}", coin_change(&coins, t));
            }
        }
    }
}`
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
    inputFormat: "Line 1: Integer N.\\nLine 2: N elevation heights.",
    outputFormat: "Total water trapped (integer).",
    constraints: ["- 1 <= N <= 10^5", "- 0 <= height <= 10^5"],
    sampleInput: "12\n0 1 0 2 1 0 1 3 2 1 2 1",
    sampleOutput: "6",
    explanation: "Compute the total volume of water trapped between the elevation bars using the two-pointer or DP approach.",
    functionInfo: { name: "trap(n, arr)", params: "n: int, arr: int[]", returnType: "int", goal: "Calculate volume of trapped water." },
    walkthrough: { input: "[4,2,0,3,2,5]", received: "heights=[4,2,0,3,2,5]", expected: "9", output: "9" },
    starterCode: {
      python: `import sys

def trap(n, arr):
    # TODO: Calculate how much water can be trapped after rain
    return 0

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if len(data) >= 1:
        n = int(data[0])
        arr = [int(x) for x in data[1:n+1]]
        print(trap(n, arr))`,
      java: `import java.util.Scanner;

public class Main {
    public static long trap(int n, int[] a) {
        // TODO: Calculate how much water can be trapped after rain
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] a = new int[n];
            for (int i = 0; i < n; i++) if (sc.hasNextInt()) a[i] = sc.nextInt();
            System.out.println(trap(n, a));
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

long long trap(int n, vector<int>& a) {
    // TODO: Calculate how much water can be trapped after rain
    return 0;
}

int main() {
    int n;
    if (cin >> n) {
        vector<int> a(n);
        for (int i = 0; i < n; i++) cin >> a[i];
        cout << trap(n, a) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function trap(n, a) {
    // TODO: Calculate how much water can be trapped after rain
    return 0;
}

const tokens = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (tokens.length > 1) {
    const n = parseInt(tokens[0]);
    const arr = tokens.slice(1, n + 1).filter(x => x !== '').map(Number);
    console.log(trap(n, arr));
}`,
      c: `#include <stdio.h>

long long trap(int n, int* a) {
    // TODO: Calculate how much water can be trapped after rain
    return 0;
}

int main() {
    int n;
    if (scanf("%d", &n) != EOF) {
        int a[100001];
        for (int i = 0; i < n; i++) scanf("%d", &a[i]);
        printf("%lld\\n", trap(n, a));
    }
    return 0;
}`,
      csharp: `using System;
using System.Linq;

class Program {
    static long Trap(int n, int[] a) {
        // TODO: Calculate how much water can be trapped after rain
        return 0;
    }

    static void Main() {
        string l1 = Console.ReadLine();
        if (l1 != null) {
            int n = int.Parse(l1);
            string l2 = Console.ReadLine();
            if (l2 != null) {
                int[] a = l2.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();
                Console.WriteLine(Trap(n, a));
            }
        }
    }
}`,
      go: `package main

import "fmt"

func trap(n int, arr []int) int64 {
    // TODO: Calculate how much water can be trapped after rain
    return 0
}

func main() {
    var n int
    if _, err := fmt.Scan(&n); err == nil {
        a := make([]int, n)
        for i := 0; i < n; i++ {
            fmt.Scan(&a[i])
        }
        fmt.Println(trap(n, a))
    }
}`,
      rust: `use std::io::{self, BufRead};

fn trap(a: &[i32]) -> i64 {
    // TODO: Calculate how much water can be trapped after rain
    0
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    if let Some(Ok(l1)) = lines.next() {
        if let Ok(n) = l1.trim().parse::<usize>() {
            if let Some(Ok(l2)) = lines.next() {
                let a: Vec<i32> = l2.split_whitespace().map(|x| x.parse().unwrap()).collect();
                println!("{}", trap(&a));
            }
        }
    }
}`
    },
    hiddenTestCases: [
      { input: "1\n5", output: "0" }, { input: "2\n1 1", output: "0" }, { input: "3\n1 2 1", output: "0" }, { input: "5\n4 2 0 3 2 5", output: "9" }, { input: "6\n0 1 0 2 1 0", output: "1" }, { input: "3\n2 0 2", output: "2" }, { input: "5\n3 0 0 0 3", output: "6" }, { input: "2\n10 0", output: "0" }, { input: "4\n10 5 2 10", output: "15" }, { input: "10\n1 2 1 2 1 2 1 2 1 2", output: "4" }
    ],
    timeLimit: "3s",
    memoryLimit: "256MB",
    languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  }
];
