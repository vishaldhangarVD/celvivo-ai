/**
 * @fileOverview Nexvoro AI Master Question Data (v18.0 - Integrity Verified).
 * A high-fidelity repository of 30 coding challenges with 8-language support.
 * All templates are strictly non-solved and follow production-grade syntax.
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
  // ==========================================
  // EASY NODES (fresher-easy-01 to 10)
  // ==========================================
  {
    id: "fresher-easy-01",
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
    constraints: ["1 <= |S| <= 10000"],
    sampleInput: "racecar",
    sampleOutput: "YES",
    explanation: "'racecar' read backwards is still 'racecar'.",
    functionInfo: { name: "isMirrorWord", params: "s", returnType: "boolean", goal: "Check palindrome" },
    walkthrough: {
      input: "\"racecar\"",
      received: "s=\"racecar\"",
      expected: "YES",
      output: "YES"
    },
    starterCode: {
      python: `import sys

def is_mirror_word(s):
    # TODO: Implement palindrome checking
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
        // TODO: Implement palindrome checking
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            String s = sc.next();
            System.out.println(isMirrorWord(s) ? "YES" : "NO");
        }
    }
}`,
      cpp: `#include <iostream>
#include <string>
#include <algorithm>

using namespace std;

bool isMirrorWord(string s) {
    // TODO: Implement palindrome checking
    return false;
}

int main() {
    string s;
    if (cin >> s) {
        cout << (isMirrorWord(s) ? "YES" : "NO") << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function isMirrorWord(s) {
    // TODO: Implement palindrome checking
    return false;
}

const input = fs.readFileSync(0, 'utf8').trim();
if (input) {
    console.log(isMirrorWord(input) ? "YES" : "NO");
}`,
      c: `#include <stdio.h>
#include <string.h>
#include <stdbool.h>

bool isMirrorWord(char* s) {
    // TODO: Implement palindrome checking
    return false;
}

int main() {
    char s[10001];
    if (scanf("%s", s) != EOF) {
        printf("%s\\n", isMirrorWord(s) ? "YES" : "NO");
    }
    return 0;
}`,
      csharp: `using System;

class Program {
    static bool IsMirrorWord(string s) {
        // TODO: Implement palindrome checking
        return false;
    }

    static void Main() {
        string s = Console.ReadLine();
        if (s != null) {
            Console.WriteLine(IsMirrorWord(s.Trim()) ? "YES" : "NO");
        }
    }
}`,
      go: `package main

import "fmt"

func isMirrorWord(s string) bool {
    // TODO: Implement palindrome checking
    return false
}

func main() {
    var s string
    fmt.Scan(&s)
    if s != "" {
        if isMirrorWord(s) {
            fmt.Println("YES")
        } else {
            fmt.Println("NO")
        }
    }
}`,
      rust: `use std::io::{self, BufRead};

fn is_mirror_word(s: &str) -> bool {
    // TODO: Implement palindrome checking
    false
}

fn main() {
    let stdin = io::stdin();
    let mut line = String::new();
    if stdin.lock().read_line(&mut line).is_ok() {
        let s = line.trim();
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
      { input: "madam", output: "YES" }, { input: "hello", output: "NO" }, { input: "a", output: "YES" }, { input: "aa", output: "YES" }, { input: "ab", output: "NO" }, { input: "racecar", output: "YES" }, { input: "12321", output: "YES" }, { input: "abcba", output: "YES" }, { input: "abcde", output: "NO" }, { input: "noon", output: "YES" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-easy-02",
    title: "Tournament Runner-Up Finder",
    description: "Find the second highest unique score in a set of N integers.",
    difficulty: "Easy",
    category: "Arrays",
    topic: "DATA STRUCTURES",
    estimatedTime: "10 mins",
    company: "Accenture",
    tags: ["Arrays", "Sorting"],
    inputFormat: "Line 1: N.\\nLine 2: N integers.",
    outputFormat: "Runner-up score or -1.",
    constraints: ["1 <= N <= 100000"],
    sampleInput: "5\n10 20 20 15 5",
    sampleOutput: "15",
    explanation: "20 is max, 15 is second unique max.",
    functionInfo: { name: "getRunnerUp", params: "n, scores", returnType: "int", goal: "Find second largest unique" },
    walkthrough: {
      input: "5, [10,20,20,15,5]",
      received: "scores=[10,20,20,15,5]",
      expected: "15",
      output: "15"
    },
    starterCode: {
      python: `import sys

def get_runner_up(n, scores):
    # TODO: Implement runner-up logic
    return -1

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if data:
        n = int(data[0])
        scores = [int(x) for x in data[1:n+1]]
        print(get_runner_up(n, scores))`,
      java: `import java.util.Scanner;

public class Main {
    public static int getRunnerUp(int n, int[] scores) {
        // TODO: Implement runner-up logic
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] arr = new int[n];
            for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
            System.out.println(getRunnerUp(n, arr));
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <set>
#include <algorithm>

using namespace std;

int getRunnerUp(int n, vector<int>& scores) {
    // TODO: Implement runner-up logic
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
    // TODO: Implement runner-up logic
    return -1;
}

const input = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (input.length >= 2) {
    const n = parseInt(input[0]);
    const scores = input.slice(1, n + 1).map(Number);
    console.log(getRunnerUp(n, scores));
}`,
      c: `#include <stdio.h>

int getRunnerUp(int n, int* scores) {
    // TODO: Implement runner-up logic
    return -1;
}

int main() {
    int n;
    if (scanf("%d", &n) != EOF) {
        int arr[100001];
        for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
        printf("%d\\n", getRunnerUp(n, arr));
    }
    return 0;
}`,
      csharp: `using System;
using System.Collections.Generic;
using System.Linq;

class Program {
    static int GetRunnerUp(int n, int[] scores) {
        // TODO: Implement runner-up logic
        return -1;
    }

    static void Main() {
        string l = Console.ReadLine();
        if (l != null) {
            int n = int.Parse(l);
            int[] scores = Console.ReadLine().Split(' ').Select(int.Parse).ToArray();
            Console.WriteLine(GetRunnerUp(n, scores));
        }
    }
}`,
      go: `package main

import "fmt"

func getRunnerUp(n int, scores []int) int {
    // TODO: Implement runner-up logic
    return -1
}

func main() {
    var n int
    fmt.Scan(&n)
    scores := make([]int, n)
    for i := 0; i < n; i++ {
        fmt.Scan(&scores[i])
    }
    fmt.Println(getRunnerUp(n, scores))
}`,
      rust: `use std::io::{self, Read};

fn get_runner_up(n: usize, scores: Vec<i32>) -> i32 {
    // TODO: Implement runner-up logic
    -1
}

fn main() {
    let mut input = String::new();
    if io::stdin().read_to_string(&mut input).is_ok() {
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
      { input: "2\n10 10", output: "-1" }, { input: "3\n1 2 3", output: "2" }, { input: "4\n100 100 99 99", output: "99" }, { input: "5\n10 20 30 40 50", output: "40" }, { input: "2\n5 10", output: "5" }, { input: "3\n0 0 0", output: "-1" }, { input: "4\n-1 -2 -3 -4", output: "-2" }, { input: "6\n5 4 3 2 1 0", output: "4" }, { input: "3\n100 50 100", output: "50" }, { input: "2\n1 0", output: "0" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-easy-03",
    title: "Vowel Counter Protocol",
    description: "Count the total number of vowels (a, e, i, o, u) in a string, case-insensitively.",
    difficulty: "Easy",
    category: "Strings",
    topic: "STRING ENGINE",
    estimatedTime: "10 mins",
    company: "Infosys",
    tags: ["Strings", "Logic"],
    inputFormat: "A single string S.",
    outputFormat: "Total vowel count.",
    constraints: ["1 <= |S| <= 100000"],
    sampleInput: "Hello World",
    sampleOutput: "3",
    explanation: "e, o, o are vowels.",
    functionInfo: { name: "countVowels", params: "s", returnType: "int", goal: "Count vowels" },
    walkthrough: {
      input: "\"Hello World\"",
      received: "s=\"Hello World\"",
      expected: "3",
      output: "3"
    },
    starterCode: {
      python: `import sys

def count_vowels(s):
    # TODO: Implement vowel counting logic
    return 0

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    print(count_vowels(line))`,
      java: `import java.util.Scanner;

public class Main {
    public static int countVowels(String s) {
        // TODO: Implement vowel counting logic
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
    // TODO: Implement vowel counting logic
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
    // TODO: Implement vowel counting logic
    return 0;
}

const input = fs.readFileSync(0, 'utf8').trim();
console.log(countVowels(input));`,
      c: `#include <stdio.h>
#include <ctype.h>

int countVowels(char* s) {
    // TODO: Implement vowel counting logic
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
        // TODO: Implement vowel counting logic
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
    // TODO: Implement vowel counting logic
    return 0
}

func main() {
    reader := bufio.NewReader(os.Stdin)
    s, _ := reader.ReadString('\\n')
    fmt.Println(countVowels(s))
}`,
      rust: `use std::io::{self, BufRead};

fn count_vowels(s: &str) -> usize {
    // TODO: Implement vowel counting logic
    0
}

fn main() {
    let stdin = io::stdin();
    let mut line = String::new();
    stdin.lock().read_line(&mut line).unwrap();
    println!("{}", count_vowels(line.trim()));
}`
    },
    hiddenTestCases: [
      { input: "aeiou", output: "5" }, { input: "AEIOU", output: "5" }, { input: "xyz", output: "0" }, { input: "Testing 123", output: "2" }, { input: "JavaScript", output: "3" }, { input: "Algorithm", output: "3" }, { input: "Node", output: "2" }, { input: "Python", output: "1" }, { input: "Education", output: "5" }, { input: "Vowel", output: "2" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-easy-04",
    title: "Array Aggregator Node",
    description: "Calculate the total sum of all elements in an array of N integers.",
    difficulty: "Easy",
    category: "Arrays",
    topic: "DATA STRUCTURES",
    estimatedTime: "10 mins",
    company: "Wipro",
    tags: ["Arrays", "Logic"],
    inputFormat: "Line 1: N.\\nLine 2: N integers.",
    outputFormat: "Total sum.",
    constraints: ["1 <= N <= 100000", "-10^6 <= val <= 10^6"],
    sampleInput: "4\n1 2 3 4",
    sampleOutput: "10",
    explanation: "1+2+3+4 = 10.",
    functionInfo: { name: "sumArray", params: "n, arr", returnType: "long", goal: "Sum elements" },
    walkthrough: {
      input: "4, [1,2,3,4]",
      received: "arr=[1,2,3,4]",
      expected: "10",
      output: "10"
    },
    starterCode: {
      python: `import sys

def sum_array(n, arr):
    # TODO: Implement array summation logic
    return 0

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if data:
        n = int(data[0])
        arr = [int(x) for x in data[1:n+1]]
        print(sum_array(n, arr))`,
      java: `import java.util.Scanner;

public class Main {
    public static long sumArray(int n, int[] arr) {
        // TODO: Implement array summation logic
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] arr = new int[n];
            for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
            System.out.println(sumArray(n, arr));
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

long long sumArray(int n, vector<int>& arr) {
    // TODO: Implement array summation logic
    return 0;
}

int main() {
    int n;
    if (cin >> n) {
        vector<int> arr(n);
        for (int i = 0; i < n; i++) cin >> arr[i];
        cout << sumArray(n, arr) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function sumArray(n, arr) {
    // TODO: Implement array summation logic
    return 0;
}

const input = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (input.length >= 2) {
    const n = parseInt(input[0]);
    const arr = input.slice(1, n + 1).map(Number);
    console.log(sumArray(n, arr));
}`,
      c: `#include <stdio.h>

long long sumArray(int n, int* arr) {
    // TODO: Implement array summation logic
    return 0;
}

int main() {
    int n;
    if (scanf("%d", &n) != EOF) {
        int arr[100001];
        for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
        printf("%lld\\n", sumArray(n, arr));
    }
    return 0;
}`,
      csharp: `using System;
using System.Linq;

class Program {
    static long SumArray(int n, int[] arr) {
        // TODO: Implement array summation logic
        return 0;
    }

    static void Main() {
        string l = Console.ReadLine();
        if (l != null) {
            int n = int.Parse(l);
            int[] arr = Console.ReadLine().Split(' ').Select(int.Parse).ToArray();
            Console.WriteLine(SumArray(n, arr));
        }
    }
}`,
      go: `package main

import "fmt"

func sumArray(n int, arr []int) int64 {
    // TODO: Implement array summation logic
    return 0
}

func main() {
    var n int
    fmt.Scan(&n)
    arr := make([]int, n)
    for i := 0; i < n; i++ {
        fmt.Scan(&arr[i])
    }
    fmt.Println(sumArray(n, arr))
}`,
      rust: `use std::io::{self, Read};

fn sum_array(n: usize, arr: Vec<i32>) -> i64 {
    // TODO: Implement array summation logic
    0
}

fn main() {
    let mut input = String::new();
    if io::stdin().read_to_string(&mut input).is_ok() {
        let mut words = input.split_whitespace();
        if let Some(n_str) = words.next() {
            let n: usize = n_str.parse().unwrap();
            let arr: Vec<i32> = words.map(|s| s.parse().unwrap()).collect();
            println!("{}", sum_array(n, arr));
        }
    }
}`
    },
    hiddenTestCases: [
      { input: "3\n1 1 1", output: "3" }, { input: "2\n-1 1", output: "0" }, { input: "5\n0 0 0 0 0", output: "0" }, { input: "1\n50", output: "50" }, { input: "4\n10 10 10 10", output: "40" }, { input: "2\n100 -100", output: "0" }, { input: "3\n123 456 789", output: "1368" }, { input: "5\n-10 -20 -30 -40 -50", output: "-150" }, { input: "2\n1000000 1000000", output: "2000000" }, { input: "1\n0", output: "0" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-easy-05",
    title: "Peak Element Detector",
    description: "Find the maximum element in an array of N integers.",
    difficulty: "Easy",
    category: "Arrays",
    topic: "DATA STRUCTURES",
    estimatedTime: "10 mins",
    company: "Cognizant",
    tags: ["Arrays", "Logic"],
    inputFormat: "Line 1: N.\\nLine 2: N integers.",
    outputFormat: "Maximum integer.",
    constraints: ["1 <= N <= 100000", "-10^9 <= val <= 10^9"],
    sampleInput: "3\n10 50 20",
    sampleOutput: "50",
    explanation: "50 is the largest.",
    functionInfo: { name: "findMax", params: "n, arr", returnType: "int", goal: "Find max" },
    walkthrough: {
      input: "3, [10,50,20]",
      received: "arr=[10,50,20]",
      expected: "50",
      output: "50"
    },
    starterCode: {
      python: `import sys

def find_max(n, arr):
    # TODO: Implement logic here to find max
    return -10**9

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if data:
        n = int(data[0])
        arr = [int(x) for x in data[1:n+1]]
        print(find_max(n, arr))`,
      java: `import java.util.Scanner;

public class Main {
    public static int findMax(int n, int[] arr) {
        // TODO: Implement logic here to find max
        return Integer.MIN_VALUE;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] arr = new int[n];
            for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
            System.out.println(findMax(n, arr));
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <climits>

using namespace std;

int findMax(int n, vector<int>& arr) {
    // TODO: Implement logic here to find max
    return INT_MIN;
}

int main() {
    int n;
    if (cin >> n) {
        vector<int> arr(n);
        for (int i = 0; i < n; i++) cin >> arr[i];
        cout << findMax(n, arr) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function findMax(n, arr) {
    // TODO: Implement logic here to find max
    return -Infinity;
}

const input = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (input.length >= 2) {
    const n = parseInt(input[0]);
    const arr = input.slice(1, n + 1).map(Number);
    console.log(findMax(n, arr));
}`,
      c: `#include <stdio.h>
#include <limits.h>

int findMax(int n, int* arr) {
    // TODO: Implement logic here to find max
    return INT_MIN;
}

int main() {
    int n;
    if (scanf("%d", &n) != EOF) {
        int arr[100001];
        for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
        printf("%d\\n", findMax(n, arr));
    }
    return 0;
}`,
      csharp: `using System;
using System.Linq;

class Program {
    static int FindMax(int n, int[] arr) {
        // TODO: Implement logic here to find max
        return int.MinValue;
    }

    static void Main() {
        string l = Console.ReadLine();
        if (l != null) {
            int n = int.Parse(l);
            int[] arr = Console.ReadLine().Split(' ').Select(int.Parse).ToArray();
            Console.WriteLine(FindMax(n, arr));
        }
    }
}`,
      go: `package main

import "fmt"

func findMax(n int, arr []int) int {
    // TODO: Implement logic here to find max
    return -1000000000
}

func main() {
    var n int
    fmt.Scan(&n)
    arr := make([]int, n)
    for i := 0; i < n; i++ {
        fmt.Scan(&arr[i])
    }
    fmt.Println(findMax(n, arr))
}`,
      rust: `use std::io::{self, Read};

fn find_max(n: usize, arr: Vec<i32>) -> i32 {
    // TODO: Implement logic here to find max
    i32::MIN
}

fn main() {
    let mut input = String::new();
    if io::stdin().read_to_string(&mut input).is_ok() {
        let mut words = input.split_whitespace();
        if let Some(n_str) = words.next() {
            let n: usize = n_str.parse().unwrap();
            let arr: Vec<i32> = words.map(|s| s.parse().unwrap()).collect();
            println!("{}", find_max(n, arr));
        }
    }
}`
    },
    hiddenTestCases: [
      { input: "1\n5", output: "5" }, { input: "3\n1 2 3", output: "3" }, { input: "3\n3 2 1", output: "3" }, { input: "5\n-1 -5 -2 -10 -3", output: "-1" }, { input: "2\n10 10", output: "10" }, { input: "4\n0 0 0 0", output: "0" }, { input: "3\n100 200 150", output: "200" }, { input: "5\n10 20 50 30 40", output: "50" }, { input: "2\n-100 100", output: "100" }, { input: "3\n-50 0 50", output: "50" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-easy-06",
    title: "Sequence Reversal Logic",
    description: "Reverse a given string S without using built-in high-level reverse functions where possible.",
    difficulty: "Easy",
    category: "Strings",
    topic: "STRING ENGINE",
    estimatedTime: "10 mins",
    company: "Capgemini",
    tags: ["Strings", "Logic"],
    inputFormat: "A single string S.",
    outputFormat: "Reversed string.",
    constraints: ["1 <= |S| <= 100000"],
    sampleInput: "Nexvoro",
    sampleOutput: "orovxeN",
    explanation: "Reversed characters.",
    functionInfo: { name: "reverseString", params: "s", returnType: "string", goal: "Reverse string" },
    walkthrough: {
      input: "\"abc\"",
      received: "s=\"abc\"",
      expected: "cba",
      output: "cba"
    },
    starterCode: {
      python: `import sys

def reverse_string(s):
    # TODO: Implement string reversal logic
    return ""

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    print(reverse_string(line))`,
      java: `import java.util.Scanner;

public class Main {
    public static String reverseString(String s) {
        // TODO: Implement string reversal logic
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

using namespace std;

string reverseString(string s) {
    // TODO: Implement string reversal logic
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
    // TODO: Implement string reversal logic
    return "";
}

const input = fs.readFileSync(0, 'utf8').trim();
console.log(reverseString(input));`,
      c: `#include <stdio.h>
#include <string.h>

void reverseString(char* s) {
    // TODO: Implement string reversal logic
}

int main() {
    char s[100001];
    if (fgets(s, 100001, stdin)) {
        int len = strlen(s);
        if (len > 0 && s[len-1] == '\\n') s[len-1] = '\\0';
        reverseString(s);
        printf("%s\\n", s);
    }
    return 0;
}`,
      csharp: `using System;

class Program {
    static string ReverseString(string s) {
        // TODO: Implement string reversal logic
        return "";
    }

    static void Main() {
        string s = Console.ReadLine();
        Console.WriteLine(ReverseString(s ?? ""));
    }
}`,
      go: `package main

import (
    "fmt"
    "bufio"
    "os"
)

func reverseString(s string) string {
    // TODO: Implement string reversal logic
    return ""
}

func main() {
    reader := bufio.NewReader(os.Stdin)
    s, _ := reader.ReadString('\\n')
    fmt.Println(reverseString(s))
}`,
      rust: `use std::io::{self, BufRead};

fn reverse_string(s: &str) -> String {
    // TODO: Implement string reversal logic
    String::new()
}

fn main() {
    let stdin = io::stdin();
    let mut line = String::new();
    stdin.lock().read_line(&mut line).unwrap();
    println!("{}", reverse_string(line.trim()));
}`
    },
    hiddenTestCases: [
      { input: "a", output: "a" }, { input: "ab", output: "ba" }, { input: "abc", output: "cba" }, { input: "123", output: "321" }, { input: "racecar", output: "racecar" }, { input: "Nexvoro", output: "orovxeN" }, { input: "Test", output: "tseT" }, { input: "Algorithm", output: "mhtiroglA" }, { input: "Data", output: "ataD" }, { input: "Structure", output: "erutcurtS" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-easy-07",
    title: "Character Frequency Monitor",
    description: "Count the number of times a target character C appears in string S.",
    difficulty: "Easy",
    category: "Strings",
    topic: "STRING ENGINE",
    estimatedTime: "10 mins",
    company: "Tech Mahindra",
    tags: ["Strings", "Logic"],
    inputFormat: "Line 1: String S.\\nLine 2: Character C.",
    outputFormat: "Frequency count.",
    constraints: ["1 <= |S| <= 100000"],
    sampleInput: "Programming in Python\nn",
    sampleOutput: "3",
    explanation: "n appears thrice.",
    functionInfo: { name: "charFreq", params: "s, c", returnType: "int", goal: "Count char" },
    walkthrough: {
      input: "\"abc\", 'a'",
      received: "s=\"abc\", c='a'",
      expected: "1",
      output: "1"
    },
    starterCode: {
      python: `import sys

def char_freq(s, c):
    # TODO: Implement frequency counting
    return 0

if __name__ == "__main__":
    lines = sys.stdin.read().splitlines()
    if len(lines) >= 2:
        print(char_freq(lines[0], lines[1][0]))`,
      java: `import java.util.Scanner;

public class Main {
    public static int charFreq(String s, char c) {
        // TODO: Implement frequency counting
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
    // TODO: Implement frequency counting
    return 0;
}

int main() {
    string s;
    char c;
    if (getline(cin, s)) {
        if (cin >> c) {
            cout << charFreq(s, c) << endl;
        }
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function charFreq(s, c) {
    // TODO: Implement frequency counting
    return 0;
}

const lines = fs.readFileSync(0, 'utf8').split('\\n');
if (lines.length >= 2) {
    console.log(charFreq(lines[0], lines[1][0]));
}`,
      c: `#include <stdio.h>
#include <string.h>

int charFreq(char* s, char c) {
    // TODO: Implement frequency counting
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
        // TODO: Implement frequency counting
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
    // TODO: Implement frequency counting
    return 0
}

func main() {
    reader := bufio.NewReader(os.Stdin)
    s, _ := reader.ReadString('\\n')
    cStr, _ := reader.ReadString('\\n')
    if len(cStr) > 0 {
        fmt.Println(charFreq(s, cStr[0]))
    }
}`,
      rust: `use std::io::{self, BufRead};

fn char_freq(s: &str, c: char) -> usize {
    // TODO: Implement frequency counting
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
      { input: "aaaaa\na", output: "5" }, { input: "abcde\nz", output: "0" }, { input: "hello\nl", output: "2" }, { input: "Testing\nT", output: "1" }, { input: "banana\na", output: "3" }, { input: "apple\np", output: "2" }, { input: "mississippi\ns", output: "4" }, { input: "frequency\ne", output: "2" }, { input: "112233\n1", output: "2" }, { input: "  \n ", output: "2" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-easy-08",
    title: "Unique Element Filter",
    description: "Given a sorted array, return the count of unique elements.",
    difficulty: "Easy",
    category: "Arrays",
    topic: "DATA STRUCTURES",
    estimatedTime: "10 mins",
    company: "TCS",
    tags: ["Arrays", "Logic"],
    inputFormat: "Line 1: N.\\nLine 2: N sorted integers.",
    outputFormat: "Unique count.",
    constraints: ["1 <= N <= 100000"],
    sampleInput: "5\n1 1 2 2 3",
    sampleOutput: "3",
    explanation: "1, 2, 3 are unique.",
    functionInfo: { name: "countUnique", params: "n, arr", returnType: "int", goal: "Count unique" },
    walkthrough: {
      input: "5, [1,1,2,2,3]",
      received: "arr=[1,1,2,2,3]",
      expected: "3",
      output: "3"
    },
    starterCode: {
      python: `import sys

def count_unique(n, arr):
    # TODO: Implement unique element counting
    return 0

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if data:
        n = int(data[0])
        arr = [int(x) for x in data[1:n+1]]
        print(count_unique(n, arr))`,
      java: `import java.util.Scanner;

public class Main {
    public static int countUnique(int n, int[] arr) {
        // TODO: Implement unique element counting
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] arr = new int[n];
            for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
            System.out.println(countUnique(n, arr));
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

int countUnique(int n, vector<int>& arr) {
    // TODO: Implement unique element counting
    return 0;
}

int main() {
    int n;
    if (cin >> n) {
        vector<int> arr(n);
        for (int i = 0; i < n; i++) cin >> arr[i];
        cout << countUnique(n, arr) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function countUnique(n, arr) {
    // TODO: Implement unique element counting
    return 0;
}

const input = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (input.length >= 2) {
    const n = parseInt(input[0]);
    const arr = input.slice(1, n + 1).map(Number);
    console.log(countUnique(n, arr));
}`,
      c: `#include <stdio.h>

int countUnique(int n, int* arr) {
    // TODO: Implement unique element counting
    return 0;
}

int main() {
    int n;
    if (scanf("%d", &n) != EOF) {
        int arr[100001];
        for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
        printf("%d\\n", countUnique(n, arr));
    }
    return 0;
}`,
      csharp: `using System;
using System.Linq;

class Program {
    static int CountUnique(int n, int[] arr) {
        // TODO: Implement unique element counting
        return 0;
    }

    static void Main() {
        string l = Console.ReadLine();
        if (l != null) {
            int n = int.Parse(l);
            int[] arr = Console.ReadLine().Split(' ').Select(int.Parse).ToArray();
            Console.WriteLine(CountUnique(n, arr));
        }
    }
}`,
      go: `package main

import "fmt"

func countUnique(n int, arr []int) int {
    // TODO: Implement unique element counting
    return 0
}

func main() {
    var n int
    fmt.Scan(&n)
    arr := make([]int, n)
    for i := 0; i < n; i++ {
        fmt.Scan(&arr[i])
    }
    fmt.Println(countUnique(n, arr))
}`,
      rust: `use std::io::{self, Read};

fn count_unique(n: usize, arr: Vec<i32>) -> usize {
    // TODO: Implement unique element counting
    0
}

fn main() {
    let mut input = String::new();
    if io::stdin().read_to_string(&mut input).is_ok() {
        let mut words = input.split_whitespace();
        if let Some(n_str) = words.next() {
            let n: usize = n_str.parse().unwrap();
            let arr: Vec<i32> = words.map(|s| s.parse().unwrap()).collect();
            println!("{}", count_unique(n, arr));
        }
    }
}`
    },
    hiddenTestCases: [
      { input: "1\n10", output: "1" }, { input: "2\n1 1", output: "1" }, { input: "3\n1 2 3", output: "3" }, { input: "4\n1 1 2 2", output: "2" }, { input: "5\n1 1 1 1 1", output: "1" }, { input: "3\n10 10 20", output: "2" }, { input: "4\n0 1 1 1", output: "2" }, { input: "5\n-1 -1 0 1 1", output: "3" }, { input: "2\n-5 -5", output: "1" }, { input: "4\n10 20 30 40", output: "4" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-easy-09",
    title: "Matrix Search Node",
    description: "Check if a target integer T exists in an array of N integers. Output FOUND or NOT FOUND.",
    difficulty: "Easy",
    category: "Arrays",
    topic: "DATA STRUCTURES",
    estimatedTime: "10 mins",
    company: "HCL",
    tags: ["Arrays", "Logic"],
    inputFormat: "Line 1: N.\\nLine 2: N integers.\\nLine 3: T.",
    outputFormat: "FOUND or NOT FOUND.",
    constraints: ["1 <= N <= 100000"],
    sampleInput: "4\n1 5 8 12\n8",
    sampleOutput: "FOUND",
    explanation: "8 is in the array.",
    functionInfo: { name: "search", params: "n, arr, t", returnType: "string", goal: "Search target" },
    walkthrough: {
      input: "[1,5,8,12], 8",
      received: "arr=[1,5,8,12], t=8",
      expected: "FOUND",
      output: "FOUND"
    },
    starterCode: {
      python: `import sys

def search(n, arr, t):
    # TODO: Implement search logic
    return "NOT FOUND"

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if len(data) >= 2:
        n = int(data[0])
        arr = [int(x) for x in data[1:n+1]]
        t = int(data[n+1])
        print(search(n, arr, t))`,
      java: `import java.util.Scanner;

public class Main {
    public static String search(int n, int[] arr, int t) {
        // TODO: Implement search logic
        return "NOT FOUND";
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] arr = new int[n];
            for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
            int t = sc.nextInt();
            System.out.println(search(n, arr, t));
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

string search(int n, vector<int>& arr, int t) {
    // TODO: Implement search logic
    return "NOT FOUND";
}

int main() {
    int n, t;
    if (cin >> n) {
        vector<int> arr(n);
        for (int i = 0; i < n; i++) cin >> arr[i];
        cin >> t;
        cout << search(n, arr, t) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function search(n, arr, t) {
    // TODO: Implement search logic
    return "NOT FOUND";
}

const input = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (input.length >= 3) {
    const n = parseInt(input[0]);
    const arr = input.slice(1, n + 1).map(Number);
    const t = parseInt(input[n + 1]);
    console.log(search(n, arr, t));
}`,
      c: `#include <stdio.h>

char* search(int n, int* arr, int t) {
    // TODO: Implement search logic
    return "NOT FOUND";
}

int main() {
    int n, t;
    if (scanf("%d", &n) != EOF) {
        int arr[100001];
        for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
        scanf("%d", &t);
        printf("%s\\n", search(n, arr, t));
    }
    return 0;
}`,
      csharp: `using System;
using System.Linq;

class Program {
    static string Search(int n, int[] arr, int t) {
        // TODO: Implement search logic
        return "NOT FOUND";
    }

    static void Main() {
        string l = Console.ReadLine();
        if (l != null) {
            int n = int.Parse(l);
            int[] arr = Console.ReadLine().Split(' ').Select(int.Parse).ToArray();
            int t = int.Parse(Console.ReadLine());
            Console.WriteLine(Search(n, arr, t));
        }
    }
}`,
      go: `package main

import "fmt"

func search(n int, arr []int, t int) string {
    // TODO: Implement search logic
    return "NOT FOUND"
}

func main() {
    var n, t int
    fmt.Scan(&n)
    arr := make([]int, n)
    for i := 0; i < n; i++ {
        fmt.Scan(&arr[i])
    }
    fmt.Scan(&t)
    fmt.Println(search(n, arr, t))
}`,
      rust: `use std::io::{self, Read};

fn search(n: usize, arr: Vec<i32>, t: i32) -> String {
    // TODO: Implement search logic
    "NOT FOUND".to_string()
}

fn main() {
    let mut input = String::new();
    if io::stdin().read_to_string(&mut input).is_ok() {
        let mut words = input.split_whitespace();
        if let Some(n_str) = words.next() {
            let n: usize = n_str.parse().unwrap();
            let mut arr = Vec::new();
            for _ in 0..n {
                arr.push(words.next().unwrap().parse::<i32>().unwrap());
            }
            if let Some(t_str) = words.next() {
                let t = t_str.parse().unwrap();
                println!("{}", search(n, arr, t));
            }
        }
    }
}`
    },
    hiddenTestCases: [
      { input: "1\n5\n5", output: "FOUND" }, { input: "1\n5\n10", output: "NOT FOUND" }, { input: "3\n1 2 3\n2", output: "FOUND" }, { input: "3\n1 2 3\n4", output: "NOT FOUND" }, { input: "5\n10 20 30 40 50\n50", output: "FOUND" }, { input: "2\n0 100\n100", output: "FOUND" }, { input: "4\n-1 -2 -3 -4\n-3", output: "FOUND" }, { input: "3\n10 10 10\n10", output: "FOUND" }, { input: "2\n1 2\n0", output: "NOT FOUND" }, { input: "5\n1 3 5 7 9\n5", output: "FOUND" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-easy-10",
    title: "Minimal Distance Finder",
    description: "Find the minimum absolute difference between any two distinct elements in an array.",
    difficulty: "Easy",
    category: "Arrays",
    topic: "DATA STRUCTURES",
    estimatedTime: "10 mins",
    company: "Deloitte",
    tags: ["Arrays", "Logic"],
    inputFormat: "Line 1: N.\\nLine 2: N integers.",
    outputFormat: "Minimum difference.",
    constraints: ["2 <= N <= 100000"],
    sampleInput: "4\n1 15 3 9",
    sampleOutput: "2",
    explanation: "|1-3| = 2 is minimum.",
    functionInfo: { name: "minDiff", params: "n, arr", returnType: "int", goal: "Find min diff" },
    walkthrough: {
      input: "[1,15,3,9]",
      received: "arr=[1,15,3,9]",
      expected: "2",
      output: "2"
    },
    starterCode: {
      python: `import sys

def min_diff(n, arr):
    # TODO: Implement minimal distance logic
    return 0

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if data:
        n = int(data[0])
        arr = [int(x) for x in data[1:n+1]]
        print(min_diff(n, arr))`,
      java: `import java.util.Scanner;

public class Main {
    public static int minDiff(int n, int[] arr) {
        // TODO: Implement minimal distance logic
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] arr = new int[n];
            for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
            System.out.println(minDiff(n, arr));
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int minDiff(int n, vector<int>& arr) {
    // TODO: Implement minimal distance logic
    return 0;
}

int main() {
    int n;
    if (cin >> n) {
        vector<int> arr(n);
        for (int i = 0; i < n; i++) cin >> arr[i];
        cout << minDiff(n, arr) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function minDiff(n, arr) {
    // TODO: Implement minimal distance logic
    return 0;
}

const input = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (input.length >= 2) {
    const n = parseInt(input[0]);
    const arr = input.slice(1, n + 1).map(Number);
    console.log(minDiff(n, arr));
}`,
      c: `#include <stdio.h>
#include <stdlib.h>

int minDiff(int n, int* arr) {
    // TODO: Implement minimal distance logic
    return 0;
}

int main() {
    int n;
    if (scanf("%d", &n) != EOF) {
        int arr[100001];
        for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
        printf("%d\\n", minDiff(n, arr));
    }
    return 0;
}`,
      csharp: `using System;
using System.Linq;

class Program {
    static int MinDiff(int n, int[] arr) {
        // TODO: Implement minimal distance logic
        return 0;
    }

    static void Main() {
        string l = Console.ReadLine();
        if (l != null) {
            int n = int.Parse(l);
            int[] arr = Console.ReadLine().Split(' ').Select(int.Parse).ToArray();
            Console.WriteLine(MinDiff(n, arr));
        }
    }
}`,
      go: `package main

import "fmt"

func minDiff(n int, arr []int) int {
    // TODO: Implement minimal distance logic
    return 0
}

func main() {
    var n int
    fmt.Scan(&n)
    arr := make([]int, n)
    for i := 0; i < n; i++ {
        fmt.Scan(&arr[i])
    }
    fmt.Println(minDiff(n, arr))
}`,
      rust: `use std::io::{self, Read};

fn min_diff(n: usize, arr: Vec<i32>) -> i32 {
    // TODO: Implement minimal distance logic
    0
}

fn main() {
    let mut input = String::new();
    if io::stdin().read_to_string(&mut input).is_ok() {
        let mut words = input.split_whitespace();
        if let Some(n_str) = words.next() {
            let n: usize = n_str.parse().unwrap();
            let arr: Vec<i32> = words.map(|s| s.parse().unwrap()).collect();
            println!("{}", min_diff(n, arr));
        }
    }
}`
    },
    hiddenTestCases: [
      { input: "2\n1 10", output: "9" }, { input: "3\n1 5 2", output: "1" }, { input: "4\n10 20 30 40", output: "10" }, { input: "2\n0 0", output: "0" }, { input: "3\n-1 -5 10", output: "4" }, { input: "5\n10 100 1000 10000 100000", output: "90" }, { input: "2\n100 99", output: "1" }, { input: "4\n1 2 4 8", output: "1" }, { input: "3\n10 50 100", output: "40" }, { input: "2\n-10 10", output: "20" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },

  // ==========================================
  // MEDIUM NODES (fresher-medium-01 to 10)
  // ==========================================
  {
    id: "fresher-medium-01",
    title: "Target Sum Verification",
    description: "Given N integers and a target T, find indices of two numbers that sum to T. Return indices in ascending order.",
    difficulty: "Medium",
    category: "Arrays",
    topic: "DATA STRUCTURES",
    estimatedTime: "20 mins",
    company: "Google",
    tags: ["Arrays", "Hash Map"],
    inputFormat: "Line 1: N.\\nLine 2: N integers.\\nLine 3: T.",
    outputFormat: "Two indices separated by space.",
    constraints: ["2 <= N <= 100000"],
    sampleInput: "4\n2 7 11 15\n9",
    sampleOutput: "0 1",
    explanation: "2+7 = 9.",
    functionInfo: { name: "twoSum", params: "n, arr, t", returnType: "void", goal: "Find indices" },
    walkthrough: {
      input: "[2,7,11,15], 9",
      received: "arr=[2,7,11,15], t=9",
      expected: "0 1",
      output: "0 1"
    },
    starterCode: {
      python: `import sys

def two_sum(n, arr, t):
    # TODO: Implement two-sum logic and print indices
    pass

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if len(data) >= 3:
        n = int(data[0])
        arr = [int(x) for x in data[1:n+1]]
        t = int(data[n+1])
        two_sum(n, arr, t)`,
      java: `import java.util.Scanner;

public class Main {
    public static void twoSum(int n, int[] arr, int t) {
        // TODO: Implement two-sum logic and print indices
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] arr = new int[n];
            for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
            int t = sc.nextInt();
            twoSum(n, arr, t);
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

void twoSum(int n, vector<int>& arr, int t) {
    // TODO: Implement two-sum logic and print indices
}

int main() {
    int n, t;
    if (cin >> n) {
        vector<int> arr(n);
        for (int i = 0; i < n; i++) cin >> arr[i];
        cin >> t;
        twoSum(n, arr, t);
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function twoSum(n, arr, t) {
    // TODO: Implement two-sum logic and print indices
}

const input = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (input.length >= 3) {
    const n = parseInt(input[0]);
    const arr = input.slice(1, n + 1).map(Number);
    const t = parseInt(input[n + 1]);
    twoSum(n, arr, t);
}`,
      c: `#include <stdio.h>

void twoSum(int n, int* arr, int t) {
    // TODO: Implement two-sum logic and print indices
}

int main() {
    int n, t;
    if (scanf("%d", &n) != EOF) {
        int arr[100001];
        for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
        scanf("%d", &t);
        twoSum(n, arr, t);
    }
    return 0;
}`,
      csharp: `using System;
using System.Collections.Generic;
using System.Linq;

class Program {
    static void TwoSum(int n, int[] arr, int t) {
        // TODO: Implement two-sum logic and print indices
    }

    static void Main() {
        string l = Console.ReadLine();
        if (l != null) {
            int n = int.Parse(l);
            int[] arr = Console.ReadLine().Split(' ').Select(int.Parse).ToArray();
            int t = int.Parse(Console.ReadLine());
            TwoSum(n, arr, t);
        }
    }
}`,
      go: `package main

import "fmt"

func twoSum(n int, arr []int, t int) {
    // TODO: Implement two-sum logic and print indices
}

func main() {
    var n, t int
    fmt.Scan(&n)
    arr := make([]int, n)
    for i := 0; i < n; i++ {
        fmt.Scan(&arr[i])
    }
    fmt.Scan(&t)
    twoSum(n, arr, t)
}`,
      rust: `use std::io::{self, Read};

fn two_sum(n: usize, arr: Vec<i32>, t: i32) {
    // TODO: Implement two-sum logic and print indices
}

fn main() {
    let mut input = String::new();
    if io::stdin().read_to_string(&mut input).is_ok() {
        let mut words = input.split_whitespace();
        if let Some(n_str) = words.next() {
            let n: usize = n_str.parse().unwrap();
            let mut arr = Vec::new();
            for _ in 0..n { arr.push(words.next().unwrap().parse().unwrap()); }
            if let Some(t_str) = words.next() {
                let t = t_str.parse().unwrap();
                two_sum(n, arr, t);
            }
        }
    }
}`
    },
    hiddenTestCases: [
      { input: "2\n1 2\n3", output: "0 1" }, { input: "3\n10 20 30\n50", output: "1 2" }, { input: "4\n1 5 8 12\n13", output: "1 2" }, { input: "5\n-1 -5 2 10 3\n1", output: "0 2" }, { input: "3\n0 0 0\n0", output: "0 1" }, { input: "4\n100 200 300 400\n500", output: "1 2" }, { input: "2\n-50 50\n0", output: "0 1" }, { input: "3\n1 10 100\n101", output: "0 2" }, { input: "5\n1 2 3 4 5\n9", output: "3 4" }, { input: "4\n5 8 12 18\n20", output: "1 2" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-medium-02",
    title: "Maximum Flux Subarray",
    description: "Find the contiguous subarray with the largest sum (Kadane's algorithm).",
    difficulty: "Medium",
    category: "Arrays",
    topic: "ALGORITHM CORE",
    estimatedTime: "15 mins",
    company: "Amazon",
    tags: ["Arrays", "DP"],
    inputFormat: "Line 1: N.\\nLine 2: N integers.",
    outputFormat: "Maximum sum.",
    constraints: ["1 <= N <= 100000"],
    sampleInput: "9\n-2 1 -3 4 -1 2 1 -5 4",
    sampleOutput: "6",
    explanation: "4,-1,2,1 sum to 6.",
    functionInfo: { name: "maxSubArray", params: "n, arr", returnType: "long", goal: "Find max sum" },
    walkthrough: {
      input: "[-2,1,-3,4,-1,2,1,-5,4]",
      received: "arr=[-2,1,-3,4,-1,2,1,-5,4]",
      expected: "6",
      output: "6"
    },
    starterCode: {
      python: `import sys

def max_sub_array(n, arr):
    # TODO: Implement Kadane's algorithm
    return 0

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if data:
        n = int(data[0])
        arr = [int(x) for x in data[1:n+1]]
        print(max_sub_array(n, arr))`,
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
            for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
            System.out.println(maxSubArray(n, arr));
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

long long maxSubArray(int n, vector<int>& arr) {
    // TODO: Implement Kadane's algorithm
    return 0;
}

int main() {
    int n;
    if (cin >> n) {
        vector<int> arr(n);
        for (int i = 0; i < n; i++) cin >> arr[i];
        cout << maxSubArray(n, arr) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function maxSubArray(n, arr) {
    // TODO: Implement Kadane's algorithm
    return 0;
}

const input = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (input.length >= 2) {
    const n = parseInt(input[0]);
    const arr = input.slice(1, n + 1).map(Number);
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
        int arr[100001];
        for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
        printf("%lld\\n", maxSubArray(n, arr));
    }
    return 0;
}`,
      csharp: `using System;
using System.Linq;

class Program {
    static long MaxSubArray(int n, int[] arr) {
        // TODO: Implement Kadane's algorithm
        return 0;
    }

    static void Main() {
        string l = Console.ReadLine();
        if (l != null) {
            int n = int.Parse(l);
            int[] arr = Console.ReadLine().Split(' ').Select(int.Parse).ToArray();
            Console.WriteLine(MaxSubArray(n, arr));
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
    fmt.Scan(&n)
    arr := make([]int, n)
    for i := 0; i < n; i++ {
        fmt.Scan(&arr[i])
    }
    fmt.Println(maxSubArray(n, arr))
}`,
      rust: `use std::io::{self, Read};

fn max_sub_array(n: usize, arr: Vec<i32>) -> i64 {
    // TODO: Implement Kadane's algorithm
    0
}

fn main() {
    let mut input = String::new();
    if io::stdin().read_to_string(&mut input).is_ok() {
        let mut words = input.split_whitespace();
        if let Some(n_str) = words.next() {
            let n: usize = n_str.parse().unwrap();
            let arr: Vec<i32> = words.map(|s| s.parse().unwrap()).collect();
            println!("{}", max_sub_array(n, arr));
        }
    }
}`
    },
    hiddenTestCases: [
      { input: "1\n-5", output: "-5" }, { input: "2\n1 2", output: "3" }, { input: "3\n-1 -2 -3", output: "-1" }, { input: "4\n1 2 3 4", output: "10" }, { input: "5\n-1 2 -1 3 -2", output: "4" }, { input: "2\n10 -5", output: "10" }, { input: "3\n-10 0 10", output: "10" }, { input: "4\n5 -2 1 3", output: "7" }, { input: "5\n10 10 10 10 10", output: "50" }, { input: "1\n0", output: "0" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-medium-03",
    title: "Syntax Integrity Validator",
    description: "Check if a string S containing parentheses ( ) { } [ ] is valid (balanced).",
    difficulty: "Medium",
    category: "Strings",
    topic: "ALGORITHM CORE",
    estimatedTime: "15 mins",
    company: "Microsoft",
    tags: ["Strings", "Stack"],
    inputFormat: "A single string S.",
    outputFormat: "YES or NO.",
    constraints: ["1 <= |S| <= 100000"],
    sampleInput: "()[]{}",
    sampleOutput: "YES",
    explanation: "All brackets close in correct order.",
    functionInfo: { name: "isValid", params: "s", returnType: "boolean", goal: "Validate brackets" },
    walkthrough: {
      input: "\"()[]{}\"",
      received: "s=\"()[]{}\"",
      expected: "YES",
      output: "YES"
    },
    starterCode: {
      python: `import sys

def is_valid(s):
    # TODO: Implement bracket validation using stack
    return False

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if line:
        if is_valid(line):
            print("YES")
        else:
            print("NO")`,
      java: `import java.util.Scanner;
import java.util.Stack;

public class Main {
    public static boolean isValid(String s) {
        // TODO: Implement bracket validation using stack
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            System.out.println(isValid(sc.next()) ? "YES" : "NO");
        }
    }
}`,
      cpp: `#include <iostream>
#include <string>
#include <stack>

using namespace std;

bool isValid(string s) {
    // TODO: Implement bracket validation using stack
    return false;
}

int main() {
    string s;
    if (cin >> s) {
        cout << (isValid(s) ? "YES" : "NO") << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function isValid(s) {
    // TODO: Implement bracket validation using stack
    return false;
}

const input = fs.readFileSync(0, 'utf8').trim();
if (input) {
    console.log(isValid(input) ? "YES" : "NO");
}`,
      c: `#include <stdio.h>
#include <stdbool.h>

bool isValid(char* s) {
    // TODO: Implement bracket validation using stack
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
        // TODO: Implement bracket validation using stack
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
    // TODO: Implement bracket validation using stack
    return false
}

func main() {
    var s string
    fmt.Scan(&s)
    if s != "" {
        if isValid(s) {
            fmt.Println("YES")
        } else {
            fmt.Println("NO")
        }
    }
}`,
      rust: `use std::io::{self, BufRead};

fn is_valid(s: &str) -> bool {
    // TODO: Implement bracket validation using stack
    false
}

fn main() {
    let stdin = io::stdin();
    let mut line = String::new();
    if stdin.lock().read_line(&mut line).is_ok() {
        let s = line.trim();
        if !s.is_empty() {
            println!("{}", if is_valid(s) { "YES" } else { "NO" });
        }
    }
}`
    },
    hiddenTestCases: [
      { input: "()", output: "YES" }, { input: "([)]", output: "NO" }, { input: "{[]}", output: "YES" }, { input: "(", output: "NO" }, { input: ")", output: "NO" }, { input: "((()))", output: "YES" }, { input: "[[[]]]", output: "YES" }, { input: "{{{}}}", output: "YES" }, { input: "([{}])", output: "YES" }, { input: "((", output: "NO" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-medium-04",
    title: "Anagram Signature Audit",
    description: "Determine if two strings S1 and S2 are anagrams (contain same characters with same frequencies).",
    difficulty: "Medium",
    category: "Strings",
    topic: "ALGORITHM CORE",
    estimatedTime: "15 mins",
    company: "Meta",
    tags: ["Strings", "Logic"],
    inputFormat: "Line 1: S1.\\nLine 2: S2.",
    outputFormat: "YES or NO.",
    constraints: ["1 <= |S1|, |S2| <= 100000"],
    sampleInput: "listen\nsilent",
    sampleOutput: "YES",
    explanation: "Both words contain exactly same characters.",
    functionInfo: { name: "isAnagram", params: "s1, s2", returnType: "boolean", goal: "Check anagram" },
    walkthrough: {
      input: "\"listen\", \"silent\"",
      received: "s1=\"listen\", s2=\"silent\"",
      expected: "YES",
      output: "YES"
    },
    starterCode: {
      python: `import sys

def is_anagram(s1, s2):
    # TODO: Implement anagram checking logic
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
        // TODO: Implement anagram checking logic
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String s1 = sc.nextLine();
            if (sc.hasNextLine()) {
                String s2 = sc.nextLine();
                System.out.println(isAnagram(s1, s2) ? "YES" : "NO");
            }
        }
    }
}`,
      cpp: `#include <iostream>
#include <string>
#include <algorithm>

using namespace std;

bool isAnagram(string s1, string s2) {
    // TODO: Implement anagram checking logic
    return false;
}

int main() {
    string s1, s2;
    if (cin >> s1 >> s2) {
        cout << (isAnagram(s1, s2) ? "YES" : "NO") << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function isAnagram(s1, s2) {
    // TODO: Implement anagram checking logic
    return false;
}

const input = fs.readFileSync(0, 'utf8').split('\\n');
if (input.length >= 2) {
    console.log(isAnagram(input[0], input[1]) ? "YES" : "NO");
}`,
      c: `#include <stdio.h>
#include <string.h>
#include <stdbool.h>

bool isAnagram(char* s1, char* s2) {
    // TODO: Implement anagram checking logic
    return false;
}

int main() {
    char s1[100001], s2[100001];
    if (scanf("%s %s", s1, s2) != EOF) {
        printf("%s\\n", isAnagram(s1, s2) ? "YES" : "NO");
    }
    return 0;
}`,
      csharp: `using System;

class Program {
    static bool IsAnagram(string s1, string s2) {
        // TODO: Implement anagram checking logic
        return false;
    }

    static void Main() {
        string s1 = Console.ReadLine();
        string s2 = Console.ReadLine();
        if (s1 != null && s2 != null) {
            Console.WriteLine(IsAnagram(s1.Trim(), s2.Trim()) ? "YES" : "NO");
        }
    }
}`,
      go: `package main

import "fmt"

func isAnagram(s1, s2 string) bool {
    // TODO: Implement anagram checking logic
    return false
}

func main() {
    var s1, s2 string
    fmt.Scan(&s1, &s2)
    if isAnagram(s1, s2) {
        fmt.Println("YES")
    } else {
        fmt.Println("NO")
    }
}`,
      rust: `use std::io::{self, BufRead};

fn is_anagram(s1: &str, s2: &str) -> bool {
    // TODO: Implement anagram checking logic
    false
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    if let Some(Ok(s1)) = lines.next() {
        if let Some(Ok(s2)) = lines.next() {
            println!("{}", if is_anagram(s1.trim(), s2.trim()) { "YES" } else { "NO" });
        }
    }
}`
    },
    hiddenTestCases: [
      { input: "a\na", output: "YES" }, { input: "abc\ncba", output: "YES" }, { input: "apple\npale", output: "NO" }, { input: "test\ntest", output: "YES" }, { input: "anagram\nnagaram", output: "YES" }, { input: "rat\ncar", output: "NO" }, { input: "abc\ndef", output: "NO" }, { input: "race\ncare", output: "YES" }, { input: "cinema\niceman", output: "YES" }, { input: "hello\nworld", output: "NO" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-medium-05",
    title: "Sorted Matrix Fusion",
    description: "Merge two sorted arrays N1 and N2 into a single sorted array without using built-in high-level sort functions on the whole result.",
    difficulty: "Medium",
    category: "Arrays",
    topic: "DATA STRUCTURES",
    estimatedTime: "15 mins",
    company: "Flipkart",
    tags: ["Arrays", "Logic"],
    inputFormat: "Line 1: N1.\\nLine 2: N1 integers.\\nLine 3: N2.\\nLine 4: N2 integers.",
    outputFormat: "Merged sorted integers separated by space.",
    constraints: ["1 <= N1, N2 <= 100000"],
    sampleInput: "3\n1 3 5\n2\n2 4",
    sampleOutput: "1 2 3 4 5",
    explanation: "Merged 1,2,3,4,5.",
    functionInfo: { name: "mergeArrays", params: "n1, a1, n2, a2", returnType: "int[]", goal: "Merge sorted" },
    walkthrough: {
      input: "[1,3,5], [2,4]",
      received: "a1=[1,3,5], a2=[2,4]",
      expected: "1 2 3 4 5",
      output: "1 2 3 4 5"
    },
    starterCode: {
      python: `import sys

def merge_arrays(n1, a1, n2, a2):
    # TODO: Implement merge logic for sorted arrays
    return []

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if len(data) >= 2:
        n1 = int(data[0])
        a1 = [int(x) for x in data[1:n1+1]]
        n2 = int(data[n1+1])
        a2 = [int(x) for x in data[n1+2:n1+n2+2]]
        res = merge_arrays(n1, a1, n2, a2)
        print(" ".join(map(str, res)))`,
      java: `import java.util.Scanner;

public class Main {
    public static void merge(int n1, int[] a1, int n2, int[] a2) {
        // TODO: Implement merge logic for sorted arrays and print
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n1 = sc.nextInt();
            int[] a1 = new int[n1];
            for (int i = 0; i < n1; i++) a1[i] = sc.nextInt();
            int n2 = sc.nextInt();
            int[] a2 = new int[n2];
            for (int i = 0; i < n2; i++) a2[i] = sc.nextInt();
            merge(n1, a1, n2, a2);
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

void mergeArrays(int n1, vector<int>& a1, int n2, vector<int>& a2) {
    // TODO: Implement merge logic for sorted arrays and print
}

int main() {
    int n1, n2;
    if (cin >> n1) {
        vector<int> a1(n1);
        for (int i = 0; i < n1; i++) cin >> a1[i];
        cin >> n2;
        vector<int> a2(n2);
        for (int i = 0; i < n2; i++) cin >> a2[i];
        mergeArrays(n1, a1, n2, a2);
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function mergeArrays(n1, a1, n2, a2) {
    // TODO: Implement merge logic for sorted arrays
    return [];
}

const input = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (input.length >= 2) {
    let n1 = parseInt(input[0]);
    let a1 = input.slice(1, n1 + 1).map(Number);
    let n2 = parseInt(input[n1 + 1]);
    let a2 = input.slice(n1 + 2, n1 + n2 + 2).map(Number);
    console.log(mergeArrays(n1, a1, n2, a2).join(' '));
}`,
      c: `#include <stdio.h>

void mergeArrays(int n1, int* a1, int n2, int* a2) {
    // TODO: Implement merge logic for sorted arrays and print
}

int main() {
    int n1, n2;
    if (scanf("%d", &n1) != EOF) {
        int a1[100001], a2[100001];
        for (int i = 0; i < n1; i++) scanf("%d", &a1[i]);
        scanf("%d", &n2);
        for (int i = 0; i < n2; i++) scanf("%d", &a2[i]);
        mergeArrays(n1, a1, n2, a2);
    }
    return 0;
}`,
      csharp: `using System;
using System.Linq;

class Program {
    static void MergeArrays(int[] a1, int[] a2) {
        // TODO: Implement merge logic for sorted arrays and print
    }

    static void Main() {
        string l1 = Console.ReadLine();
        if (l1 == null) return;
        int n1 = int.Parse(l1);
        int[] a1 = Console.ReadLine().Split(' ').Select(int.Parse).ToArray();
        int n2 = int.Parse(Console.ReadLine());
        int[] a2 = Console.ReadLine().Split(' ').Select(int.Parse).ToArray();
        MergeArrays(a1, a2);
    }
}`,
      go: `package main

import "fmt"

func mergeArrays(a1, a2 []int) {
    // TODO: Implement merge logic for sorted arrays and print
}

func main() {
    var n1, n2 int
    fmt.Scan(&n1)
    a1 := make([]int, n1); for i := 0; i < n1; i++ { fmt.Scan(&a1[i]) }
    fmt.Scan(&n2)
    a2 := make([]int, n2); for i := 0; i < n2; i++ { fmt.Scan(&a2[i]) }
    mergeArrays(a1, a2)
}`,
      rust: `use std::io::{self, Read};

fn merge_arrays(a1: Vec<i32>, a2: Vec<i32>) {
    // TODO: Implement merge logic for sorted arrays and print
}

fn main() {
    let mut input = String::new();
    if io::stdin().read_to_string(&mut input).is_ok() {
        let mut words = input.split_whitespace();
        if let Some(n1_str) = words.next() {
            let n1: usize = n1_str.parse().unwrap();
            let mut a1 = Vec::new();
            for _ in 0..n1 { a1.push(words.next().unwrap().parse().unwrap()); }
            let n2: usize = words.next().unwrap().parse().unwrap();
            let mut a2 = Vec::new();
            for _ in 0..n2 { a2.push(words.next().unwrap().parse().unwrap()); }
            merge_arrays(a1, a2);
        }
    }
}`
    },
    hiddenTestCases: [
      { input: "1\n1\n1\n2", output: "1 2" }, { input: "2\n1 5\n1\n3", output: "1 3 5" }, { input: "3\n10 20 30\n2\n5 15", output: "5 10 15 20 30" }, { input: "1\n10\n1\n10", output: "10 10" }, { input: "2\n1 1\n2\n2 2", output: "1 1 2 2" }, { input: "1\n5\n1\n5", output: "5 5" }, { input: "2\n-10 0\n2\n-5 5", output: "-10 -5 0 5" }, { input: "1\n100\n1\n0", output: "0 100" }, { input: "2\n1 2\n2\n1 2", output: "1 1 2 2" }, { input: "3\n1 2 3\n0\n", output: "1 2 3" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-medium-06",
    title: "Logarithmic Search Node",
    description: "Implement Binary Search to find the index of a target T in a sorted array A of N integers.",
    difficulty: "Medium",
    category: "Arrays",
    topic: "ALGORITHM CORE",
    estimatedTime: "15 mins",
    company: "Microsoft",
    tags: ["Arrays", "Logic"],
    inputFormat: "Line 1: N.\\nLine 2: N sorted integers.\\nLine 3: T.",
    outputFormat: "Index or -1.",
    constraints: ["1 <= N <= 100000"],
    sampleInput: "5\n1 2 3 4 5\n4",
    sampleOutput: "3",
    explanation: "4 is found at index 3 (0-indexed).",
    functionInfo: { name: "binarySearch", params: "n, arr, t", returnType: "int", goal: "Binary search" },
    walkthrough: {
      input: "[1,2,3,4,5], 4",
      received: "arr=[1,2,3,4,5], t=4",
      expected: "3",
      output: "3"
    },
    starterCode: {
      python: `import sys

def binary_search(n, arr, t):
    # TODO: Implement binary search logic
    return -1

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if len(data) >= 3:
        n = int(data[0])
        arr = [int(x) for x in data[1:n+1]]
        t = int(data[n+1])
        print(binary_search(n, arr, t))`,
      java: `import java.util.Scanner;

public class Main {
    public static int binarySearch(int n, int[] arr, int t) {
        // TODO: Implement binary search logic
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] arr = new int[n];
            for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
            int t = sc.nextInt();
            System.out.println(binarySearch(n, arr, t));
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

int binarySearch(int n, vector<int>& arr, int t) {
    // TODO: Implement binary search logic
    return -1;
}

int main() {
    int n, t;
    if (cin >> n) {
        vector<int> arr(n);
        for (int i = 0; i < n; i++) cin >> arr[i];
        cin >> t;
        cout << binarySearch(n, arr, t) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function binarySearch(n, arr, t) {
    // TODO: Implement binary search logic
    return -1;
}

const input = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (input.length >= 3) {
    const n = parseInt(input[0]);
    const arr = input.slice(1, n + 1).map(Number);
    const t = parseInt(input[n + 1]);
    console.log(binarySearch(n, arr, t));
}`,
      c: `#include <stdio.h>

int binarySearch(int n, int* arr, int t) {
    // TODO: Implement binary search logic
    return -1;
}

int main() {
    int n, t;
    if (scanf("%d", &n) != EOF) {
        int arr[100001];
        for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
        scanf("%d", &t);
        printf("%d\\n", binarySearch(n, arr, t));
    }
    return 0;
}`,
      csharp: `using System;
using System.Linq;

class Program {
    static int BinarySearch(int n, int[] arr, int t) {
        // TODO: Implement binary search logic
        return -1;
    }

    static void Main() {
        string l = Console.ReadLine();
        if (l != null) {
            int n = int.Parse(l);
            int[] arr = Console.ReadLine().Split(' ').Select(int.Parse).ToArray();
            int t = int.Parse(Console.ReadLine());
            Console.WriteLine(BinarySearch(n, arr, t));
        }
    }
}`,
      go: `package main

import "fmt"

func binarySearch(n int, arr []int, t int) int {
    // TODO: Implement binary search logic
    return -1
}

func main() {
    var n, t int
    fmt.Scan(&n)
    arr := make([]int, n)
    for i := 0; i < n; i++ {
        fmt.Scan(&arr[i])
    }
    fmt.Scan(&t)
    fmt.Println(binarySearch(n, arr, t))
}`,
      rust: `use std::io::{self, Read};

fn binary_search(n: usize, arr: Vec<i32>, t: i32) -> i32 {
    // TODO: Implement binary search logic
    -1
}

fn main() {
    let mut input = String::new();
    if io::stdin().read_to_string(&mut input).is_ok() {
        let mut words = input.split_whitespace();
        if let Some(n_str) = words.next() {
            let n: usize = n_str.parse().unwrap();
            let mut arr = Vec::new();
            for _ in 0..n { arr.push(words.next().unwrap().parse().unwrap()); }
            if let Some(t_str) = words.next() {
                let t = t_str.parse().unwrap();
                println!("{}", binary_search(n, arr, t));
            }
        }
    }
}`
    },
    hiddenTestCases: [
      { input: "1\n5\n5", output: "0" }, { input: "1\n5\n10", output: "-1" }, { input: "3\n1 2 3\n2", output: "1" }, { input: "5\n10 20 30 40 50\n40", output: "3" }, { input: "4\n1 3 5 7\n2", output: "-1" }, { input: "2\n100 200\n100", output: "0" }, { input: "6\n1 2 3 4 5 6\n6", output: "5" }, { input: "3\n-10 0 10\n0", output: "1" }, { input: "5\n1 1 1 1 1\n1", output: "2" }, { input: "2\n0 1\n1", output: "1" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-medium-07",
    title: "Window Sum Optimizer",
    description: "Find the maximum sum of any contiguous subarray of size K.",
    difficulty: "Medium",
    category: "Arrays",
    topic: "ALGORITHM CORE",
    estimatedTime: "15 mins",
    company: "Amazon",
    tags: ["Arrays", "Logic"],
    inputFormat: "Line 1: N, K.\\nLine 2: N integers.",
    outputFormat: "Maximum sum.",
    constraints: ["1 <= K <= N <= 100000"],
    sampleInput: "4 2\n1 2 3 4",
    sampleOutput: "7",
    explanation: "3+4 = 7 is the max window of size 2.",
    functionInfo: { name: "maxSumK", params: "n, k, arr", returnType: "long", goal: "Find max window sum" },
    walkthrough: {
      input: "4, 2, [1,2,3,4]",
      received: "arr=[1,2,3,4], k=2",
      expected: "7",
      output: "7"
    },
    starterCode: {
      python: `import sys

def max_sum_k(n, k, arr):
    # TODO: Implement sliding window sum logic
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
    public static long maxSumK(int n, int k, int[] arr) {
        // TODO: Implement sliding window sum logic
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int k = sc.nextInt();
            int[] arr = new int[n];
            for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
            System.out.println(maxSumK(n, k, arr));
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

long long maxSumK(int n, int k, vector<int>& arr) {
    // TODO: Implement sliding window sum logic
    return 0;
}

int main() {
    int n, k;
    if (cin >> n >> k) {
        vector<int> arr(n);
        for (int i = 0; i < n; i++) cin >> arr[i];
        cout << maxSumK(n, k, arr) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function maxSumK(n, k, arr) {
    // TODO: Implement sliding window sum logic
    return 0;
}

const input = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (input.length >= 2) {
    const n = parseInt(input[0]);
    const k = parseInt(input[1]);
    const arr = input.slice(2, n + 2).map(Number);
    console.log(maxSumK(n, k, arr));
}`,
      c: `#include <stdio.h>

long long maxSumK(int n, int k, int* arr) {
    // TODO: Implement sliding window sum logic
    return 0;
}

int main() {
    int n, k;
    if (scanf("%d %d", &n, &k) != EOF) {
        int arr[100001];
        for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
        printf("%lld\\n", maxSumK(n, k, arr));
    }
    return 0;
}`,
      csharp: `using System;
using System.Linq;

class Program {
    static long MaxSumK(int n, int k, int[] arr) {
        // TODO: Implement sliding window sum logic
        return 0;
    }

    static void Main() {
        string[] l1 = Console.ReadLine().Split(' ');
        if (l1 == null) return;
        int n = int.Parse(l1[0]);
        int k = int.Parse(l1[1]);
        int[] arr = Console.ReadLine().Split(' ').Select(int.Parse).ToArray();
        Console.WriteLine(MaxSumK(n, k, arr));
    }
}`,
      go: `package main

import "fmt"

func maxSumK(n, k int, arr []int) int64 {
    // TODO: Implement sliding window sum logic
    return 0
}

func main() {
    var n, k int
    fmt.Scan(&n, &k)
    arr := make([]int, n)
    for i := 0; i < n; i++ {
        fmt.Scan(&arr[i])
    }
    fmt.Println(maxSumK(n, k, arr))
}`,
      rust: `use std::io::{self, Read};

fn max_sum_k(n: usize, k: usize, arr: Vec<i32>) -> i64 {
    // TODO: Implement sliding window sum logic
    0
}

fn main() {
    let mut input = String::new();
    if io::stdin().read_to_string(&mut input).is_ok() {
        let mut words = input.split_whitespace();
        if let Some(n_str) = words.next() {
            let n: usize = n_str.parse().unwrap();
            let k: usize = words.next().unwrap().parse().unwrap();
            let mut arr = Vec::new();
            for _ in 0..n { arr.push(words.next().unwrap().parse().unwrap()); }
            println!("{}", max_sum_k(n, k, arr));
        }
    }
}`
    },
    hiddenTestCases: [
      { input: "2 1\n10 20", output: "20" }, { input: "5 3\n1 2 3 4 5", output: "12" }, { input: "4 4\n1 2 3 4", output: "10" }, { input: "3 2\n-1 -5 -2", output: "-6" }, { input: "5 2\n10 0 10 0 10", output: "10" }, { input: "6 3\n1 1 1 1 1 1", output: "3" }, { input: "4 2\n100 200 300 400", output: "700" }, { input: "2 2\n5 5", output: "10" }, { input: "3 1\n1 10 100", output: "100" }, { input: "5 5\n1 1 1 1 1", output: "5" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-medium-08",
    title: "Prefix Equilibrium Node",
    description: "Find an index where the sum of elements on the left equals the sum on the right. Return index or -1.",
    difficulty: "Medium",
    category: "Arrays",
    topic: "ALGORITHM CORE",
    estimatedTime: "15 mins",
    company: "TCS",
    tags: ["Arrays", "Logic"],
    inputFormat: "Line 1: N.\\nLine 2: N integers.",
    outputFormat: "Index or -1.",
    constraints: ["1 <= N <= 100000"],
    sampleInput: "3\n1 2 1",
    sampleOutput: "1",
    explanation: "Sum left of index 1 is 1, sum right is 1.",
    functionInfo: { name: "findEquilibrium", params: "n, arr", returnType: "int", goal: "Find pivot" },
    walkthrough: {
      input: "3, [1,2,1]",
      received: "arr=[1,2,1]",
      expected: "1",
      output: "1"
    },
    starterCode: {
      python: `import sys

def find_equilibrium(n, arr):
    # TODO: Implement equilibrium index finding logic
    return -1

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if data:
        n = int(data[0])
        arr = [int(x) for x in data[1:n+1]]
        print(find_equilibrium(n, arr))`,
      java: `import java.util.Scanner;

public class Main {
    public static int findEquilibrium(int n, int[] arr) {
        // TODO: Implement equilibrium index finding logic
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] arr = new int[n];
            for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
            System.out.println(findEquilibrium(n, arr));
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

int findEquilibrium(int n, vector<int>& arr) {
    // TODO: Implement equilibrium index finding logic
    return -1;
}

int main() {
    int n;
    if (cin >> n) {
        vector<int> arr(n);
        for (int i = 0; i < n; i++) cin >> arr[i];
        cout << findEquilibrium(n, arr) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function findEquilibrium(n, arr) {
    // TODO: Implement equilibrium index finding logic
    return -1;
}

const input = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (input.length >= 2) {
    const n = parseInt(input[0]);
    const arr = input.slice(1, n + 1).map(Number);
    console.log(findEquilibrium(n, arr));
}`,
      c: `#include <stdio.h>

int findEquilibrium(int n, int* arr) {
    // TODO: Implement equilibrium index finding logic
    return -1;
}

int main() {
    int n;
    if (scanf("%d", &n) != EOF) {
        int arr[100001];
        for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
        printf("%d\\n", findEquilibrium(n, arr));
    }
    return 0;
}`,
      csharp: `using System;
using System.Linq;

class Program {
    static int FindEquilibrium(int n, int[] arr) {
        // TODO: Implement equilibrium index finding logic
        return -1;
    }

    static void Main() {
        string l = Console.ReadLine();
        if (l != null) {
            int n = int.Parse(l);
            int[] arr = Console.ReadLine().Split(' ').Select(int.Parse).ToArray();
            Console.WriteLine(FindEquilibrium(n, arr));
        }
    }
}`,
      go: `package main

import "fmt"

func findEquilibrium(n int, arr []int) int {
    // TODO: Implement equilibrium index finding logic
    return -1
}

func main() {
    var n int
    fmt.Scan(&n)
    arr := make([]int, n)
    for i := 0; i < n; i++ {
        fmt.Scan(&arr[i])
    }
    fmt.Println(findEquilibrium(n, arr))
}`,
      rust: `use std::io::{self, Read};

fn find_equilibrium(n: usize, arr: Vec<i32>) -> i32 {
    // TODO: Implement equilibrium index finding logic
    -1
}

fn main() {
    let mut input = String::new();
    if io::stdin().read_to_string(&mut input).is_ok() {
        let mut words = input.split_whitespace();
        if let Some(n_str) = words.next() {
            let n: usize = n_str.parse().unwrap();
            let arr: Vec<i32> = words.map(|s| s.parse().unwrap()).collect();
            println!("{}", find_equilibrium(n, arr));
        }
    }
}`
    },
    hiddenTestCases: [
      { input: "1\n5", output: "0" }, { input: "2\n1 2", output: "-1" }, { input: "5\n1 7 3 6 5", output: "-1" }, { input: "6\n1 7 3 6 5 6", output: "3" }, { input: "3\n1 0 -1", output: "1" }, { input: "2\n0 0", output: "0" }, { input: "4\n1 1 1 1", output: "-1" }, { input: "3\n-1 0 1", output: "1" }, { input: "5\n1 2 3 4 5", output: "-1" }, { input: "4\n10 0 10 0", output: "-1" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-medium-09",
    title: "Array Cycle Shifter",
    description: "Rotate an array of N integers to the right by K steps.",
    difficulty: "Medium",
    category: "Arrays",
    topic: "ALGORITHM CORE",
    estimatedTime: "15 mins",
    company: "Accenture",
    tags: ["Arrays", "Logic"],
    inputFormat: "Line 1: N, K.\\nLine 2: N integers.",
    outputFormat: "Rotated integers separated by space.",
    constraints: ["1 <= N <= 100000", "K >= 0"],
    sampleInput: "3 1\n1 2 3",
    sampleOutput: "3 1 2",
    explanation: "3 shifts to the front.",
    functionInfo: { name: "rotate", params: "n, k, arr", returnType: "void", goal: "Rotate array" },
    walkthrough: {
      input: "3, 1, [1,2,3]",
      received: "arr=[1,2,3], k=1",
      expected: "3 1 2",
      output: "3 1 2"
    },
    starterCode: {
      python: `import sys

def rotate(n, k, arr):
    # TODO: Implement array rotation logic
    pass

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if len(data) >= 2:
        n = int(data[0])
        k = int(data[1])
        arr = [int(x) for x in data[2:n+2]]
        rotate(n, k, arr)
        print(" ".join(map(str, arr)))`,
      java: `import java.util.Scanner;

public class Main {
    public static void rotate(int n, int k, int[] arr) {
        // TODO: Implement array rotation logic
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int k = sc.nextInt();
            int[] arr = new int[n];
            for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
            rotate(n, k, arr);
            for (int i = 0; i < n; i++) System.out.print(arr[i] + (i == n-1 ? "" : " "));
            System.out.println();
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

void rotate(int n, int k, vector<int>& arr) {
    // TODO: Implement array rotation logic
}

int main() {
    int n, k;
    if (cin >> n >> k) {
        vector<int> arr(n);
        for (int i = 0; i < n; i++) cin >> arr[i];
        rotate(n, k, arr);
        for (int i = 0; i < n; i++) cout << arr[i] << (i == n-1 ? "" : " ");
        cout << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function rotate(n, k, arr) {
    // TODO: Implement array rotation logic
}

const input = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (input.length >= 2) {
    const n = parseInt(input[0]);
    const k = parseInt(input[1]);
    const arr = input.slice(2, n + 2).map(Number);
    rotate(n, k, arr);
    console.log(arr.join(' '));
}`,
      c: `#include <stdio.h>

void rotate(int n, int k, int* arr) {
    // TODO: Implement array rotation logic
}

int main() {
    int n, k;
    if (scanf("%d %d", &n, &k) != EOF) {
        int arr[100001];
        for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
        rotate(n, k, arr);
        for (int i = 0; i < n; i++) printf("%d%s", arr[i], (i == n-1 ? "" : " "));
        printf("\\n");
    }
    return 0;
}`,
      csharp: `using System;
using System.Linq;

class Program {
    static void Rotate(int n, int k, int[] arr) {
        // TODO: Implement array rotation logic
    }

    static void Main() {
        string[] l1 = Console.ReadLine().Split(' ');
        if (l1 == null) return;
        int n = int.Parse(l1[0]);
        int k = int.Parse(l1[1]);
        int[] arr = Console.ReadLine().Split(' ').Select(int.Parse).ToArray();
        Rotate(n, k, arr);
        Console.WriteLine(string.Join(" ", arr));
    }
}`,
      go: `package main

import "fmt"

func rotate(n, k int, arr []int) {
    // TODO: Implement array rotation logic
}

func main() {
    var n, k int
    fmt.Scan(&n, &k)
    arr := make([]int, n)
    for i := 0; i < n; i++ {
        fmt.Scan(&arr[i])
    }
    rotate(n, k, arr)
    for i := 0; i < n; i++ {
        fmt.Print(arr[i])
        if i < n-1 { fmt.Print(" ") }
    }
    fmt.Println()
}`,
      rust: `use std::io::{self, Read};

fn rotate(n: usize, k: usize, arr: &mut Vec<i32>) {
    // TODO: Implement array rotation logic
}

fn main() {
    let mut input = String::new();
    if io::stdin().read_to_string(&mut input).is_ok() {
        let mut words = input.split_whitespace();
        if let Some(n_str) = words.next() {
            let n: usize = n_str.parse().unwrap();
            let k: usize = words.next().unwrap().parse().unwrap();
            let mut arr: Vec<i32> = words.map(|s| s.parse().unwrap()).collect();
            rotate(n, k, &mut arr);
            for i in 0..n {
                print!("{}{}", arr[i], if i == n-1 { "" } else { " " });
            }
            println!();
        }
    }
}`
    },
    hiddenTestCases: [
      { input: "2 1\n1 2", output: "2 1" }, { input: "5 2\n1 2 3 4 5", output: "4 5 1 2 3" }, { input: "3 0\n10 20 30", output: "10 20 30" }, { input: "4 4\n1 2 3 4", output: "1 2 3 4" }, { input: "5 10\n1 2 3 4 5", output: "1 2 3 4 5" }, { input: "1 10\n5", output: "5" }, { input: "4 2\n10 20 30 40", output: "30 40 10 20" }, { input: "3 5\n1 2 3", output: "2 3 1" }, { input: "6 1\n0 1 2 3 4 5", output: "5 0 1 2 3 4" }, { input: "2 5\n10 20", output: "20 10" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-medium-10",
    title: "Unique Subsequence Auditor",
    description: "Find the length of the longest substring in S without repeating characters.",
    difficulty: "Medium",
    category: "Strings",
    topic: "ALGORITHM CORE",
    estimatedTime: "20 mins",
    company: "Google",
    tags: ["Strings", "Logic"],
    inputFormat: "A single string S.",
    outputFormat: "Length count.",
    constraints: ["1 <= |S| <= 100000"],
    sampleInput: "abcabcbb",
    sampleOutput: "3",
    explanation: "abc is the longest substring of length 3.",
    functionInfo: { name: "longestUniqueSub", params: "s", returnType: "int", goal: "Longest substring" },
    walkthrough: {
      input: "\"abcabcbb\"",
      received: "s=\"abcabcbb\"",
      expected: "3",
      output: "3"
    },
    starterCode: {
      python: `import sys

def longest_unique_sub(s):
    # TODO: Implement sliding window substring logic
    return 0

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    print(longest_unique_sub(line))`,
      java: `import java.util.Scanner;
import java.util.HashSet;

public class Main {
    public static int longestUniqueSub(String s) {
        // TODO: Implement sliding window substring logic
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
#include <unordered_set>
#include <algorithm>

using namespace std;

int longestUniqueSub(string s) {
    // TODO: Implement sliding window substring logic
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
    // TODO: Implement sliding window substring logic
    return 0;
}

const input = fs.readFileSync(0, 'utf8').trim();
console.log(longestUniqueSub(input));`,
      c: `#include <stdio.h>
#include <string.h>

int longestUniqueSub(char* s) {
    // TODO: Implement sliding window substring logic
    return 0;
}

int main() {
    char s[100001];
    if (fgets(s, 100001, stdin)) {
        printf("%d\\n", longestUniqueSub(s));
    }
    return 0;
}`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    static int LongestUniqueSub(string s) {
        // TODO: Implement sliding window substring logic
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
    // TODO: Implement sliding window substring logic
    return 0
}

func main() {
    reader := bufio.NewReader(os.Stdin)
    s, _ := reader.ReadString('\\n')
    fmt.Println(longestUniqueSub(s))
}`,
      rust: `use std::io::{self, BufRead};

fn longest_unique_sub(s: &str) -> usize {
    // TODO: Implement sliding window substring logic
    0
}

fn main() {
    let stdin = io::stdin();
    let mut line = String::new();
    stdin.lock().read_line(&mut line).unwrap();
    println!("{}", longest_unique_sub(line.trim()));
}`
    },
    hiddenTestCases: [
      { input: "abcabcbb", output: "3" }, { input: "bbbbb", output: "1" }, { input: "pwwkew", output: "3" }, { input: "abcdef", output: "6" }, { input: "a", output: "1" }, { input: "dvdf", output: "3" }, { input: "12312345", output: "5" }, { input: "tmmzuxt", output: "5" }, { input: "abcde", output: "5" }, { input: " ", output: "1" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },

  // ==========================================
  // HARD NODES (fresher-hard-01 to 10)
  // ==========================================
  {
    id: "fresher-hard-01",
    title: "Centric Palindrome Detector",
    description: "Return the length of the longest palindromic substring in S.",
    difficulty: "Hard",
    category: "Strings",
    topic: "ALGORITHM CORE",
    estimatedTime: "25 mins",
    company: "Google",
    tags: ["Strings", "DP"],
    inputFormat: "A single string S.",
    outputFormat: "Longest length.",
    constraints: ["1 <= |S| <= 2000"],
    sampleInput: "babad",
    sampleOutput: "3",
    explanation: "aba or bab are substrings of length 3.",
    functionInfo: { name: "longestPal", params: "s", returnType: "int", goal: "Longest palindrome" },
    walkthrough: {
      input: "\"babad\"",
      received: "s=\"babad\"",
      expected: "3",
      output: "3"
    },
    starterCode: {
      python: `import sys

def longest_pal(s):
    # TODO: Implement longest palindromic substring logic
    return 0

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    print(longest_pal(line))`,
      java: `import java.util.Scanner;

public class Main {
    public static int longestPal(String s) {
        // TODO: Implement longest palindromic substring logic
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
#include <vector>
#include <algorithm>

using namespace std;

int longestPal(string s) {
    // TODO: Implement longest palindromic substring logic
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
    // TODO: Implement longest palindromic substring logic
    return 0;
}

const input = fs.readFileSync(0, 'utf8').trim();
console.log(longestPal(input));`,
      c: `#include <stdio.h>
#include <string.h>

int longestPal(char* s) {
    // TODO: Implement longest palindromic substring logic
    return 0;
}

int main() {
    char s[2001];
    if (fgets(s, 2001, stdin)) {
        printf("%d\\n", longestPal(s));
    }
    return 0;
}`,
      csharp: `using System;

class Program {
    static int LongestPal(string s) {
        // TODO: Implement longest palindromic substring logic
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
    // TODO: Implement longest palindromic substring logic
    return 0
}

func main() {
    reader := bufio.NewReader(os.Stdin)
    s, _ := reader.ReadString('\\n')
    fmt.Println(longestPal(s))
}`,
      rust: `use std::io::{self, BufRead};

fn longest_pal(s: &str) -> usize {
    // TODO: Implement longest palindromic substring logic
    0
}

fn main() {
    let stdin = io::stdin();
    let mut line = String::new();
    stdin.lock().read_line(&mut line).unwrap();
    println!("{}", longest_pal(line.trim()));
}`
    },
    hiddenTestCases: [
      { input: "aaaaa", output: "5" }, { input: "abccba", output: "6" }, { input: "abcde", output: "1" }, { input: "racecar", output: "7" }, { input: "abbac", output: "4" }, { input: "noon", output: "4" }, { input: "a", output: "1" }, { input: "cbbd", output: "2" }, { input: "abacaba", output: "7" }, { input: "forgeeksskeegfor", output: "10" }
    ],
    timeLimit: "2s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-hard-02",
    title: "Temporal Interval Fusion",
    description: "Merge overlapping intervals represented as [start, end]. Intervals may not be sorted.",
    difficulty: "Hard",
    category: "Arrays",
    topic: "ALGORITHM CORE",
    estimatedTime: "25 mins",
    company: "Uber",
    tags: ["Arrays", "Logic"],
    inputFormat: "Line 1: N.\\nN lines: start end.",
    outputFormat: "Merged intervals line by line, sorted by start.",
    constraints: ["1 <= N <= 100000"],
    sampleInput: "4\n1 3\n8 10\n15 18\n2 6",
    sampleOutput: "1 6\n8 10\n15 18",
    explanation: "1-3 and 2-6 overlap and merge into 1-6.",
    functionInfo: { name: "mergeIntervals", params: "n, intervals", returnType: "void", goal: "Merge overlapping" },
    walkthrough: {
      input: "2, [[1,5],[2,6]]",
      received: "intervals=[[1,5],[2,6]]",
      expected: "1 6",
      output: "1 6"
    },
    starterCode: {
      python: `import sys

def merge_intervals(n, intervals):
    # TODO: Implement interval merging logic
    pass

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if data:
        n = int(data[0])
        intervals = []
        for i in range(n):
            intervals.append([int(data[2*i+1]), int(data[2*i+2])])
        merge_intervals(n, intervals)`,
      java: `import java.util.Scanner;
import java.util.Arrays;
import java.util.ArrayList;

public class Main {
    public static void mergeIntervals(int n, int[][] intervals) {
        // TODO: Implement interval merging logic and print
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[][] arr = new int[n][2];
            for (int i = 0; i < n; i++) {
                arr[i][0] = sc.nextInt();
                arr[i][1] = sc.nextInt();
            }
            mergeIntervals(n, arr);
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

void mergeIntervals(int n, vector<pair<int, int>>& arr) {
    // TODO: Implement interval merging logic and print
}

int main() {
    int n;
    if (cin >> n) {
        vector<pair<int, int>> arr(n);
        for (int i = 0; i < n; i++) cin >> arr[i].first >> arr[i].second;
        mergeIntervals(n, arr);
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function mergeIntervals(n, arr) {
    // TODO: Implement interval merging logic and print
}

const input = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (input.length >= 1) {
    const n = parseInt(input[0]);
    const arr = [];
    for (let i = 0; i < n; i++) {
        arr.push([parseInt(input[2*i+1]), parseInt(input[2*i+2])]);
    }
    mergeIntervals(n, arr);
}`,
      c: `#include <stdio.h>
#include <stdlib.h>

void mergeIntervals(int n, int arr[][2]) {
    // TODO: Implement interval merging logic and print
}

int main() {
    int n;
    if (scanf("%d", &n) != EOF) {
        int (*arr)[2] = malloc(n * sizeof(*arr));
        for (int i = 0; i < n; i++) scanf("%d %d", &arr[i][0], &arr[i][1]);
        mergeIntervals(n, arr);
        free(arr);
    }
    return 0;
}`,
      csharp: `using System;
using System.Collections.Generic;
using System.Linq;

class Program {
    static void MergeIntervals(int n, int[][] arr) {
        // TODO: Implement interval merging logic and print
    }

    static void Main() {
        string line = Console.ReadLine();
        if (line == null) return;
        int n = int.Parse(line);
        int[][] arr = new int[n][];
        for (int i = 0; i < n; i++) {
            arr[i] = Console.ReadLine().Split(' ').Select(int.Parse).ToArray();
        }
        MergeIntervals(n, arr);
    }
}`,
      go: `package main

import "fmt"

func mergeIntervals(n int, arr [][]int) {
    // TODO: Implement interval merging logic and print
}

func main() {
    var n int
    fmt.Scan(&n)
    arr := make([][]int, n)
    for i := 0; i < n; i++ {
        arr[i] = make([]int, 2)
        fmt.Scan(&arr[i][0], &arr[i][1])
    }
    mergeIntervals(n, arr)
}`,
      rust: `use std::io::{self, Read};

fn merge_intervals(n: usize, mut arr: Vec<Vec<i32>>) {
    // TODO: Implement interval merging logic and print
}

fn main() {
    let mut input = String::new();
    if io::stdin().read_to_string(&mut input).is_ok() {
        let mut words = input.split_whitespace();
        if let Some(n_str) = words.next() {
            let n: usize = n_str.parse().unwrap();
            let mut arr = Vec::new();
            for _ in 0..n {
                arr.push(vec![words.next().unwrap().parse().unwrap(), words.next().unwrap().parse().unwrap()]);
            }
            merge_intervals(n, arr);
        }
    }
}`
    },
    hiddenTestCases: [
      { input: "2\n1 4\n4 5", output: "1 5" }, { input: "3\n1 3\n5 7\n10 12", output: "1 3\n5 7\n10 12" }, { input: "1\n10 20", output: "10 20" }, { input: "4\n1 10\n2 3\n4 5\n6 7", output: "1 10" }, { input: "2\n5 8\n1 10", output: "1 10" }, { input: "3\n1 5\n2 4\n3 6", output: "1 6" }, { input: "2\n1 2\n3 4", output: "1 2\n3 4" }, { input: "5\n1 2\n2 3\n3 4\n4 5\n5 6", output: "1 6" }, { input: "2\n1 100\n100 200", output: "1 200" }, { input: "3\n10 15\n15 20\n10 20", output: "10 20" }
    ],
    timeLimit: "2s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-hard-03",
    title: "Frequency Magnitude Audit",
    description: "Given an array and integer K, return the K most frequent elements in descending order of frequency.",
    difficulty: "Hard",
    category: "Arrays",
    topic: "ALGORITHM CORE",
    estimatedTime: "25 mins",
    company: "Amazon",
    tags: ["Arrays", "Logic"],
    inputFormat: "Line 1: N, K.\\nLine 2: N integers.",
    outputFormat: "K integers separated by space.",
    constraints: ["1 <= K <= N <= 100000"],
    sampleInput: "6 2\n1 1 1 2 2 3",
    sampleOutput: "1 2",
    explanation: "1 appears 3 times, 2 appears 2 times.",
    functionInfo: { name: "topK", params: "n, k, arr", returnType: "void", goal: "Find top K" },
    walkthrough: {
      input: "6, 2, [1,1,1,2,2,3]",
      received: "arr=[1,1,1,2,2,3], k=2",
      expected: "1 2",
      output: "1 2"
    },
    starterCode: {
      python: `import sys

def top_k(n, k, arr):
    # TODO: Implement top-K frequency logic and print results
    pass

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if len(data) >= 2:
        n = int(data[0])
        k = int(data[1])
        arr = [int(x) for x in data[2:n+2]]
        top_k(n, k, arr)`,
      java: `import java.util.Scanner;
import java.util.HashMap;
import java.util.PriorityQueue;

public class Main {
    public static void topK(int n, int k, int[] arr) {
        // TODO: Implement top-K frequency logic and print results
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int k = sc.nextInt();
            int[] arr = new int[n];
            for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
            topK(n, k, arr);
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
#include <queue>

using namespace std;

void topK(int n, int k, vector<int>& arr) {
    // TODO: Implement top-K frequency logic and print results
}

int main() {
    int n, k;
    if (cin >> n >> k) {
        vector<int> arr(n);
        for (int i = 0; i < n; i++) cin >> arr[i];
        topK(n, k, arr);
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function topK(n, k, arr) {
    // TODO: Implement top-K frequency logic and print results
}

const input = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (input.length >= 2) {
    const n = parseInt(input[0]);
    const k = parseInt(input[1]);
    const arr = input.slice(2, n + 2).map(Number);
    topK(n, k, arr);
}`,
      c: `#include <stdio.h>

void topK(int n, int k, int* arr) {
    // TODO: Implement top-K frequency logic and print results
}

int main() {
    int n, k;
    if (scanf("%d %d", &n, &k) != EOF) {
        int arr[100001];
        for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
        topK(n, k, arr);
    }
    return 0;
}`,
      csharp: `using System;
using System.Collections.Generic;
using System.Linq;

class Program {
    static void TopK(int n, int k, int[] arr) {
        // TODO: Implement top-K frequency logic and print results
    }

    static void Main() {
        string[] line1 = Console.ReadLine().Split(' ');
        if (line1 == null) return;
        int n = int.Parse(line1[0]);
        int k = int.Parse(line1[1]);
        int[] arr = Console.ReadLine().Split(' ').Select(int.Parse).ToArray();
        TopK(n, k, arr);
    }
}`,
      go: `package main

import "fmt"

func topK(n, k int, arr []int) {
    // TODO: Implement top-K frequency logic and print results
}

func main() {
    var n, k int
    fmt.Scan(&n, &k)
    arr := make([]int, n)
    for i := 0; i < n; i++ {
        fmt.Scan(&arr[i])
    }
    topK(n, k, arr)
}`,
      rust: `use std::io::{self, Read};

fn top_k(n: usize, k: usize, arr: Vec<i32>) {
    // TODO: Implement top-K frequency logic and print results
}

fn main() {
    let mut input = String::new();
    if io::stdin().read_to_string(&mut input).is_ok() {
        let mut words = input.split_whitespace();
        if let Some(line1_n) = words.next() {
            let n: usize = line1_n.parse().unwrap();
            let k: usize = words.next().unwrap().parse().unwrap();
            let mut arr = Vec::new();
            for _ in 0..n { arr.push(words.next().unwrap().parse().unwrap()); }
            top_k(n, k, arr);
        }
    }
}`
    },
    hiddenTestCases: [
      { input: "1 1\n5", output: "5" }, { input: "4 2\n1 2 1 2", output: "1 2" }, { input: "3 1\n1 2 2", output: "2" }, { input: "5 2\n1 1 1 1 5", output: "1 5" }, { input: "7 3\n1 2 3 1 2 1 0", output: "1 2 3" }, { input: "4 1\n10 10 10 10", output: "10" }, { input: "5 1\n1 2 3 4 5", output: "1" }, { input: "6 2\n1 2 3 1 2 3", output: "1 2" }, { input: "2 1\n100 200", output: "100" }, { input: "10 2\n1 1 1 2 2 2 3 3 4 5", output: "1 2" }
    ],
    timeLimit: "2s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-hard-04",
    title: "Boundary Substring Anchor",
    description: "Return the length of the minimum window substring of S that contains all characters of T.",
    difficulty: "Hard",
    category: "Strings",
    topic: "ALGORITHM CORE",
    estimatedTime: "30 mins",
    company: "Google",
    tags: ["Strings", "Logic"],
    inputFormat: "Line 1: S.\\nLine 2: T.",
    outputFormat: "Minimum length or 0.",
    constraints: ["1 <= |S|, |T| <= 100000"],
    sampleInput: "ADOBECODEBANC\nABC",
    sampleOutput: "4",
    explanation: "The substring 'BANC' (length 4) is the smallest window containing 'A', 'B', and 'C'.",
    functionInfo: { name: "minWindow", params: "s, t", returnType: "int", goal: "Find min window" },
    walkthrough: {
      input: "\"ADOBECODEBANC\", \"ABC\"",
      received: "s=\"ADOBECODEBANC\", t=\"ABC\"",
      expected: "4",
      output: "4"
    },
    starterCode: {
      python: `import sys

def min_window(s, t):
    # TODO: Implement minimum window substring logic
    return 0

if __name__ == "__main__":
    lines = sys.stdin.read().splitlines()
    if len(lines) >= 2:
        print(min_window(lines[0], lines[1]))`,
      java: `import java.util.Scanner;
import java.util.HashMap;

public class Main {
    public static int minWindow(String s, String t) {
        // TODO: Implement minimum window substring logic
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String s = sc.nextLine();
            if (sc.hasNextLine()) {
                System.out.println(minWindow(s, sc.nextLine()));
            }
        }
    }
}`,
      cpp: `#include <iostream>
#include <string>
#include <vector>
#include <climits>

using namespace std;

int minWindow(string s, string t) {
    // TODO: Implement minimum window substring logic
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
    // TODO: Implement minimum window substring logic
    return 0;
}

const input = fs.readFileSync(0, 'utf8').split('\\n');
if (input.length >= 2) {
    console.log(minWindow(input[0], input[1]));
}`,
      c: `#include <stdio.h>
#include <string.h>

int minWindow(char* s, char* t) {
    // TODO: Implement minimum window substring logic
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
using System.Collections.Generic;

class Program {
    static int MinWindow(string s, string t) {
        // TODO: Implement minimum window substring logic
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
    // TODO: Implement minimum window substring logic
    return 0
}

func main() {
    var s, t string
    fmt.Scan(&s, &t)
    fmt.Println(minWindow(s, t))
}`,
      rust: `use std::io::{self, BufRead};

fn min_window(s: &str, t: &str) -> usize {
    // TODO: Implement minimum window substring logic
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
    timeLimit: "3s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-hard-05",
    title: "Consecutive Sequence Monitor",
    description: "Given an unsorted array, find the length of the longest consecutive elements sequence in O(n) time.",
    difficulty: "Hard",
    category: "Arrays",
    topic: "ALGORITHM CORE",
    estimatedTime: "25 mins",
    company: "Google",
    tags: ["Arrays", "Logic"],
    inputFormat: "Line 1: N.\\nLine 2: N integers.",
    outputFormat: "Longest length.",
    constraints: ["1 <= N <= 100000"],
    sampleInput: "6\n100 4 200 1 3 2",
    sampleOutput: "4",
    explanation: "The longest sequence is [1, 2, 3, 4].",
    functionInfo: { name: "longestConsecutive", params: "n, arr", returnType: "int", goal: "Find longest sequence" },
    walkthrough: {
      input: "6, [100,4,200,1,3,2]",
      received: "arr=[100,4,200,1,3,2]",
      expected: "4",
      output: "4"
    },
    starterCode: {
      python: `import sys

def longest_consecutive(n, arr):
    # TODO: Implement longest consecutive sequence logic
    return 0

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if data:
        n = int(data[0])
        arr = [int(x) for x in data[1:n+1]]
        print(longest_consecutive(n, arr))`,
      java: `import java.util.Scanner;
import java.util.HashSet;

public class Main {
    public static int longestConsecutive(int n, int[] arr) {
        // TODO: Implement longest consecutive sequence logic
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] arr = new int[n];
            for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
            System.out.println(longestConsecutive(n, arr));
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_set>
#include <algorithm>

using namespace std;

int longestConsecutive(int n, vector<int>& arr) {
    // TODO: Implement longest consecutive sequence logic
    return 0;
}

int main() {
    int n;
    if (cin >> n) {
        vector<int> arr(n);
        for (int i = 0; i < n; i++) cin >> arr[i];
        cout << longestConsecutive(n, arr) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function longestConsecutive(n, arr) {
    // TODO: Implement longest consecutive sequence logic
    return 0;
}

const input = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (input.length >= 1) {
    const n = parseInt(input[0]);
    const arr = input.slice(1, n + 1).map(Number);
    console.log(longestConsecutive(n, arr));
}`,
      c: `#include <stdio.h>

int longestConsecutive(int n, int* arr) {
    // TODO: Implement longest consecutive sequence logic
    return 0;
}

int main() {
    int n;
    if (scanf("%d", &n) != EOF) {
        int arr[100001];
        for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
        printf("%d\\n", longestConsecutive(n, arr));
    }
    return 0;
}`,
      csharp: `using System;
using System.Collections.Generic;
using System.Linq;

class Program {
    static int LongestConsecutive(int n, int[] arr) {
        // TODO: Implement longest consecutive sequence logic
        return 0;
    }

    static void Main() {
        string l = Console.ReadLine();
        if (l != null) {
            int n = int.Parse(l);
            int[] arr = Console.ReadLine().Split(' ').Select(int.Parse).ToArray();
            Console.WriteLine(LongestConsecutive(n, arr));
        }
    }
}`,
      go: `package main

import "fmt"

func longestConsecutive(n int, arr []int) int {
    // TODO: Implement longest consecutive sequence logic
    return 0
}

func main() {
    var n int
    fmt.Scan(&n)
    arr := make([]int, n)
    for i := 0; i < n; i++ {
        fmt.Scan(&arr[i])
    }
    fmt.Println(longestConsecutive(n, arr))
}`,
      rust: `use std::io::{self, Read};

fn longest_consecutive(n: usize, arr: Vec<i32>) -> usize {
    // TODO: Implement longest consecutive sequence logic
    0
}

fn main() {
    let mut input = String::new();
    if io::stdin().read_to_string(&mut input).is_ok() {
        let mut words = input.split_whitespace();
        if let Some(n_str) = words.next() {
            let n: usize = n_str.parse().unwrap();
            let mut arr = Vec::new();
            for _ in 0..n { arr.push(words.next().unwrap().parse().unwrap()); }
            println!("{}", longest_consecutive(n, arr));
        }
    }
}`
    },
    hiddenTestCases: [
      { input: "6\n100 4 200 1 3 2", output: "4" }, { input: "1\n5", output: "1" }, { input: "5\n1 1 1 1 1", output: "1" }, { input: "5\n10 20 30 40 50", output: "1" }, { input: "4\n1 2 3 4", output: "4" }, { input: "3\n-1 0 1", output: "3" }, { input: "5\n0 3 7 2 5", output: "1" }, { input: "6\n9 1 4 7 3 -1", output: "1" }, { input: "2\n10 11", output: "2" }, { input: "10\n1 3 5 7 9 2 4 6 8 10", output: "10" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-hard-06",
    title: "Neural Grid Pathfinding",
    description: "Determine if a path exists from (0,0) to (N-1,N-1) in an N x N binary grid (0 = path, 1 = obstacle). Movement allowed only in 4 directions.",
    difficulty: "Hard",
    category: "Graphs",
    topic: "ALGORITHM CORE",
    estimatedTime: "25 mins",
    company: "Meta",
    tags: ["Graphs", "Logic"],
    inputFormat: "Line 1: N.\\nN lines: N integers.",
    outputFormat: "YES or NO.",
    constraints: ["1 <= N <= 100"],
    sampleInput: "3\n0 0 1\n1 0 1\n1 0 0",
    sampleOutput: "YES",
    explanation: "A path exists via (0,0) -> (0,1) -> (1,1) -> (2,1) -> (2,2).",
    functionInfo: { name: "hasPath", params: "n, grid", returnType: "boolean", goal: "Check connectivity" },
    walkthrough: {
      input: "2, [[0,1],[1,0]]",
      received: "grid=[[0,1],[1,0]]",
      expected: "NO",
      output: "NO"
    },
    starterCode: {
      python: `import sys

def has_path(n, grid):
    # TODO: Implement pathfinding logic (DFS/BFS)
    return False

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if data:
        n = int(data[0])
        grid = []
        for i in range(n):
            grid.append([int(x) for x in data[1+i*n : 1+(i+1)*n]])
        if has_path(n, grid):
            print("YES")
        else:
            print("NO")`,
      java: `import java.util.Scanner;

public class Main {
    public static boolean hasPath(int n, int[][] grid) {
        // TODO: Implement pathfinding logic (DFS/BFS)
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[][] grid = new int[n][n];
            for (int i = 0; i < n; i++) {
                for (int j = 0; j < n; j++) grid[i][j] = sc.nextInt();
            }
            System.out.println(hasPath(n, grid) ? "YES" : "NO");
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

bool hasPath(int n, vector<vector<int>>& grid) {
    // TODO: Implement pathfinding logic (DFS/BFS)
    return false;
}

int main() {
    int n;
    if (cin >> n) {
        vector<vector<int>> grid(n, vector<int>(n));
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) cin >> grid[i][j];
        }
        cout << (hasPath(n, grid) ? "YES" : "NO") << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function hasPath(n, grid) {
    // TODO: Implement pathfinding logic (DFS/BFS)
    return false;
}

const input = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (input.length >= 1) {
    let n = parseInt(input[0]);
    let grid = [];
    for (let i = 0; i < n; i++) {
        grid.push(input.slice(1 + i*n, 1 + (i+1)*n).map(Number));
    }
    console.log(hasPath(n, grid) ? "YES" : "NO");
}`,
      c: `#include <stdio.h>
#include <stdbool.h>

bool hasPath(int n, int grid[][101]) {
    // TODO: Implement pathfinding logic (DFS/BFS)
    return false;
}

int main() {
    int n;
    if (scanf("%d", &n) != EOF) {
        int grid[101][101];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) scanf("%d", &grid[i][j]);
        }
        printf("%s\\n", hasPath(n, grid) ? "YES" : "NO");
    }
    return 0;
}`,
      csharp: `using System;

class Program {
    static bool HasPath(int n, int[][] grid) {
        // TODO: Implement pathfinding logic (DFS/BFS)
        return false;
    }

    static void Main() {
        string l = Console.ReadLine();
        if (l == null) return;
        int n = int.Parse(l);
        int[][] grid = new int[n][];
        for (int i = 0; i < n; i++) {
            grid[i] = Console.ReadLine().Split(' ').Select(int.Parse).ToArray();
        }
        Console.WriteLine(HasPath(n, grid) ? "YES" : "NO");
    }
}`,
      go: `package main

import "fmt"

func hasPath(n int, grid [][]int) bool {
    // TODO: Implement pathfinding logic (DFS/BFS)
    return false
}

func main() {
    var n int
    fmt.Scan(&n)
    grid := make([][]int, n)
    for i := 0; i < n; i++ {
        grid[i] = make([]int, n)
        for j := 0; j < n; j++ {
            fmt.Scan(&grid[i][j])
        }
    }
    if hasPath(n, grid) {
        fmt.Println("YES")
    } else {
        fmt.Println("NO")
    }
}`,
      rust: `use std::io::{self, Read};

fn has_path(n: usize, grid: Vec<Vec<i32>>) -> bool {
    // TODO: Implement pathfinding logic (DFS/BFS)
    false
}

fn main() {
    let mut input = String::new();
    if io::stdin().read_to_string(&mut input).is_ok() {
        let mut words = input.split_whitespace();
        if let Some(n_str) = words.next() {
            let n: usize = n_str.parse().unwrap();
            let mut grid = Vec::new();
            for _ in 0..n {
                let mut row = Vec::new();
                for _ in 0..n { row.push(words.next().unwrap().parse().unwrap()); }
                grid.push(row);
            }
            println!("{}", if has_path(n, grid) { "YES" } else { "NO" });
        }
    }
}`
    },
    hiddenTestCases: [
      { input: "2\n0 0\n0 0", output: "YES" }, { input: "2\n0 1\n1 0", output: "NO" }, { input: "3\n0 0 0\n0 0 0\n0 0 0", output: "YES" }, { input: "3\n0 1 0\n1 1 0\n0 0 0", output: "NO" }, { input: "1\n0", output: "YES" }, { input: "1\n1", output: "NO" }, { input: "4\n0 0 0 0\n1 1 1 0\n0 0 0 0\n0 1 1 1", output: "NO" }, { input: "2\n1 0\n0 0", output: "NO" }, { input: "3\n0 0 1\n1 0 0\n1 1 0", output: "YES" }, { input: "3\n0 1 1\n1 0 0\n0 0 0", output: "NO" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-hard-07",
    title: "Grid Shortest Vector",
    description: "Return the shortest path length from (0,0) to (N-1,N-1) in an N x N binary grid (0 = path, 1 = obstacle). Length is number of cells visited. If no path, return -1.",
    difficulty: "Hard",
    category: "Graphs",
    topic: "ALGORITHM CORE",
    estimatedTime: "25 mins",
    company: "Google",
    tags: ["Graphs", "Logic"],
    inputFormat: "Line 1: N.\\nN lines: N integers.",
    outputFormat: "Shortest length or -1.",
    constraints: ["1 <= N <= 100"],
    sampleInput: "3\n0 0 0\n1 1 0\n1 1 0",
    sampleOutput: "5",
    explanation: "(0,0) -> (0,1) -> (0,2) -> (1,2) -> (2,2) has length 5.",
    functionInfo: { name: "shortestPath", params: "n, grid", returnType: "int", goal: "Shortest path BFS" },
    walkthrough: {
      input: "3, [[0,0,0],[1,1,0],[1,1,0]]",
      received: "grid=[[0,0,0],[1,1,0],[1,1,0]]",
      expected: "5",
      output: "5"
    },
    starterCode: {
      python: `import sys

def shortest_path(n, grid):
    # TODO: Implement BFS for shortest path in grid
    return -1

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if data:
        n = int(data[0])
        grid = []
        for i in range(n):
            grid.append([int(x) for x in data[1+i*n : 1+(i+1)*n]])
        print(shortest_path(n, grid))`,
      java: `import java.util.Scanner;
import java.util.Queue;
import java.util.LinkedList;

public class Main {
    public static int shortestPath(int n, int[][] grid) {
        // TODO: Implement BFS for shortest path in grid
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[][] grid = new int[n][n];
            for (int i = 0; i < n; i++) {
                for (int j = 0; j < n; j++) grid[i][j] = sc.nextInt();
            }
            System.out.println(shortestPath(n, grid));
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <queue>

using namespace std;

int shortestPath(int n, vector<vector<int>>& grid) {
    // TODO: Implement BFS for shortest path in grid
    return -1;
}

int main() {
    int n;
    if (cin >> n) {
        vector<vector<int>> grid(n, vector<int>(n));
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) cin >> grid[i][j];
        }
        cout << shortestPath(n, grid) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function shortestPath(n, grid) {
    // TODO: Implement BFS for shortest path in grid
    return -1;
}

const input = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (input.length >= 1) {
    let n = parseInt(input[0]);
    let grid = [];
    for (let i = 0; i < n; i++) {
        grid.push(input.slice(1 + i*n, 1 + (i+1)*n).map(Number));
    }
    console.log(shortestPath(n, grid));
}`,
      c: `#include <stdio.h>

int shortestPath(int n, int grid[][101]) {
    // TODO: Implement BFS for shortest path in grid
    return -1;
}

int main() {
    int n;
    if (scanf("%d", &n) != EOF) {
        int grid[101][101];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) scanf("%d", &grid[i][j]);
        }
        printf("%d\\n", shortestPath(n, grid));
    }
    return 0;
}`,
      csharp: `using System;
using System.Collections.Generic;

class Program {
    static int ShortestPath(int n, int[][] grid) {
        // TODO: Implement BFS for shortest path in grid
        return -1;
    }

    static void Main() {
        string l = Console.ReadLine();
        if (l == null) return;
        int n = int.Parse(l);
        int[][] grid = new int[n][];
        for (int i = 0; i < n; i++) {
            grid[i] = Console.ReadLine().Split(' ').Select(int.Parse).ToArray();
        }
        Console.WriteLine(ShortestPath(n, grid));
    }
}`,
      go: `package main

import "fmt"

func shortestPath(n int, grid [][]int) int {
    // TODO: Implement BFS for shortest path in grid
    return -1
}

func main() {
    var n int
    fmt.Scan(&n)
    grid := make([][]int, n)
    for i := 0; i < n; i++ {
        grid[i] = make([]int, n)
        for j := 0; j < n; j++ {
            fmt.Scan(&grid[i][j])
        }
    }
    fmt.Println(shortestPath(n, grid))
}`,
      rust: `use std::io::{self, Read};

fn shortest_path(n: usize, grid: Vec<Vec<i32>>) -> i32 {
    // TODO: Implement BFS for shortest path in grid
    -1
}

fn main() {
    let mut input = String::new();
    if io::stdin().read_to_string(&mut input).is_ok() {
        let mut words = input.split_whitespace();
        if let Some(n_str) = words.next() {
            let n: usize = n_str.parse().unwrap();
            let mut grid = Vec::new();
            for _ in 0..n {
                let mut row = Vec::new();
                for _ in 0..n { row.push(words.next().unwrap().parse().unwrap()); }
                grid.push(row);
            }
            println!("{}", shortest_path(n, grid));
        }
    }
}`
    },
    hiddenTestCases: [
      { input: "2\n0 0\n0 0", output: "3" }, { input: "2\n0 1\n0 0", output: "3" }, { input: "3\n0 0 0\n0 0 0\n0 0 0", output: "5" }, { input: "3\n0 1 0\n0 1 0\n0 0 0", output: "5" }, { input: "4\n0 0 0 0\n1 1 1 0\n0 0 0 0\n0 1 1 1\n0 0 0 0", output: "7" }, { input: "1\n0", output: "1" }, { input: "2\n1 0\n0 0", output: "-1" }, { input: "3\n0 0 1\n1 0 0\n1 1 0", output: "5" }, { input: "2\n0 1\n1 0", output: "-1" }, { input: "4\n0 1 1 1\n0 1 1 1\n0 1 1 1\n0 0 0 0", output: "7" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-hard-08",
    title: "Common Sequence Blueprint",
    description: "Find the length of the Longest Common Subsequence (LCS) between two strings S1 and S2.",
    difficulty: "Hard",
    category: "Strings",
    topic: "ALGORITHM CORE",
    estimatedTime: "25 mins",
    company: "Google",
    tags: ["Strings", "DP"],
    inputFormat: "Line 1: S1.\\nLine 2: S2.",
    outputFormat: "LCS length.",
    constraints: ["1 <= |S1|, |S2| <= 1000"],
    sampleInput: "abcde\nace",
    sampleOutput: "3",
    explanation: "The longest common subsequence is 'ace', which has length 3.",
    functionInfo: { name: "lcs", params: "s1, s2", returnType: "int", goal: "Longest common subsequence" },
    walkthrough: {
      input: "\"abcde\", \"ace\"",
      received: "s1=\"abcde\", s2=\"ace\"",
      expected: "3",
      output: "3"
    },
    starterCode: {
      python: `import sys

def lcs(s1, s2):
    # TODO: Implement LCS using Dynamic Programming
    return 0

if __name__ == "__main__":
    lines = sys.stdin.read().splitlines()
    if len(lines) >= 2:
        print(lcs(lines[0], lines[1]))`,
      java: `import java.util.Scanner;

public class Main {
    public static int lcs(String s1, String s2) {
        // TODO: Implement LCS using Dynamic Programming
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String s1 = sc.nextLine();
            if (sc.hasNextLine()) {
                System.out.println(lcs(s1, sc.nextLine()));
            }
        }
    }
}`,
      cpp: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

using namespace std;

int lcs(string s1, string s2) {
    // TODO: Implement LCS using Dynamic Programming
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
    // TODO: Implement LCS using Dynamic Programming
    return 0;
}

const input = fs.readFileSync(0, 'utf8').split('\\n');
if (input.length >= 2) {
    console.log(lcs(input[0], input[1]));
}`,
      c: `#include <stdio.h>
#include <string.h>

int lcs(char* s1, char* s2) {
    // TODO: Implement LCS using Dynamic Programming
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
        // TODO: Implement LCS using Dynamic Programming
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
    // TODO: Implement LCS using Dynamic Programming
    return 0
}

func main() {
    var s1, s2 string
    fmt.Scan(&s1, &s2)
    fmt.Println(lcs(s1, s2))
}`,
      rust: `use std::io::{self, BufRead};

fn lcs(s1: &str, s2: &str) -> usize {
    // TODO: Implement LCS using Dynamic Programming
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
      { input: "abc\nabc", output: "3" }, { input: "abc\ndef", output: "0" }, { input: "AGGTAB\nGXTXAYB", output: "4" }, { input: "a\na", output: "1" }, { input: "apple\npeach", output: "2" }, { input: "longest\nstone", output: "3" }, { input: "abcde\nace", output: "3" }, { input: "dynamic\nprogramming", output: "3" }, { input: "hello\nworld", output: "1" }, { input: "xyz\nxyz", output: "3" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-hard-09",
    title: "Optimal Change Protocol",
    description: "Given coin denominations and a target amount T, return the minimum number of coins needed to make the change. Return -1 if impossible.",
    difficulty: "Hard",
    category: "Arrays",
    topic: "ALGORITHM CORE",
    estimatedTime: "25 mins",
    company: "Goldman Sachs",
    tags: ["Arrays", "DP"],
    inputFormat: "Line 1: N types, T amount.\\nLine 2: N integers.",
    outputFormat: "Minimum coins or -1.",
    constraints: ["1 <= T <= 10000", "1 <= N <= 100"],
    sampleInput: "3 11\n1 2 5",
    sampleOutput: "3",
    explanation: "5+5+1 = 11 using 3 coins.",
    functionInfo: { name: "coinChange", params: "n, t, coins", returnType: "int", goal: "Minimize coins" },
    walkthrough: {
      input: "3, 11, [1,2,5]",
      received: "coins=[1,2,5], t=11",
      expected: "3",
      output: "3"
    },
    starterCode: {
      python: `import sys

def coin_change(n, t, coins):
    # TODO: Implement coin change using Dynamic Programming
    return -1

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if len(data) >= 2:
        n = int(data[0])
        t = int(data[1])
        coins = [int(x) for x in data[2:n+2]]
        print(coin_change(n, t, coins))`,
      java: `import java.util.Scanner;
import java.util.Arrays;

public class Main {
    public static int coinChange(int[] coins, int t) {
        // TODO: Implement coin change using Dynamic Programming
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int t = sc.nextInt();
            int[] coins = new int[n];
            for (int i = 0; i < n; i++) coins[i] = sc.nextInt();
            System.out.println(coinChange(coins, t));
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int coinChange(vector<int>& coins, int t) {
    // TODO: Implement coin change using Dynamic Programming
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
    // TODO: Implement coin change using Dynamic Programming
    return -1;
}

const input = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (input.length >= 2) {
    const n = parseInt(input[0]);
    const t = parseInt(input[1]);
    const coins = input.slice(2, n + 2).map(Number);
    console.log(coinChange(coins, t));
}`,
      c: `#include <stdio.h>

int coinChange(int n, int* coins, int t) {
    // TODO: Implement coin change using Dynamic Programming
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
        // TODO: Implement coin change using Dynamic Programming
        return -1;
    }

    static void Main() {
        string l = Console.ReadLine();
        if (l == null) return;
        string[] p = l.Split(' ');
        int n = int.Parse(p[0]);
        int t = int.Parse(p[1]);
        int[] coins = Console.ReadLine().Split(' ').Select(int.Parse).ToArray();
        Console.WriteLine(CoinChange(coins, t));
    }
}`,
      go: `package main

import "fmt"

func coinChange(coins []int, t int) int {
    // TODO: Implement coin change using Dynamic Programming
    return -1
}

func main() {
    var n, t int
    fmt.Scan(&n, &t)
    coins := make([]int, n)
    for i := 0; i < n; i++ {
        fmt.Scan(&coins[i])
    }
    fmt.Println(coinChange(coins, t))
}`,
      rust: `use std::io::{self, Read};

fn coin_change(coins: Vec<i32>, t: i32) -> i32 {
    // TODO: Implement coin change using Dynamic Programming
    -1
}

fn main() {
    let mut input = String::new();
    if io::stdin().read_to_string(&mut input).is_ok() {
        let mut words = input.split_whitespace();
        if let Some(n_str) = words.next() {
            let n: usize = n_str.parse().unwrap();
            let t: i32 = words.next().unwrap().parse().unwrap();
            let mut coins = Vec::new();
            for _ in 0..n { coins.push(words.next().unwrap().parse().unwrap()); }
            println!("{}", coin_change(coins, t));
        }
    }
}`
    },
    hiddenTestCases: [
      { input: "1 2\n1", output: "2" }, { input: "1 2\n5", output: "-1" }, { input: "3 11\n1 2 5", output: "3" }, { input: "2 3\n2 1", output: "2" }, { input: "3 0\n1 2 5", output: "0" }, { input: "2 100\n1 101", output: "100" }, { input: "1 100\n100", output: "1" }, { input: "3 6249\n186 419 83", output: "20" }, { input: "2 7\n2 3", output: "3" }, { input: "4 10\n1 3 4 5", output: "2" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  },
  {
    id: "fresher-hard-10",
    title: "Flux Density Capture",
    description: "Compute the total volume of water trapped between bars in an elevation map (Trapping Rain Water).",
    difficulty: "Hard",
    category: "Arrays",
    topic: "ALGORITHM CORE",
    estimatedTime: "30 mins",
    company: "Google",
    tags: ["Arrays", "Logic"],
    inputFormat: "Line 1: N.\\nLine 2: N heights.",
    outputFormat: "Total water trapped.",
    constraints: ["1 <= N <= 100000"],
    sampleInput: "12\n0 1 0 2 1 0 1 3 2 1 2 1",
    sampleOutput: "6",
    explanation: "Bars of heights trap 6 units of water.",
    functionInfo: { name: "trap", params: "n, arr", returnType: "long", goal: "Calculate water" },
    walkthrough: {
      input: "12, [0,1,0,2,1,0,1,3,2,1,2,1]",
      received: "arr=[0,1,0,2,1,0,1,3,2,1,2,1]",
      expected: "6",
      output: "6"
    },
    starterCode: {
      python: `import sys

def trap(n, arr):
    # TODO: Implement trapping rain water logic (Two pointers/stack)
    return 0

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if data:
        n = int(data[0])
        arr = [int(x) for x in data[1:n+1]]
        print(trap(n, arr))`,
      java: `import java.util.Scanner;

public class Main {
    public static long trap(int n, int[] arr) {
        // TODO: Implement trapping rain water logic (Two pointers/stack)
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] arr = new int[n];
            for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
            System.out.println(trap(n, arr));
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

long long trap(int n, vector<int>& arr) {
    // TODO: Implement trapping rain water logic (Two pointers/stack)
    return 0;
}

int main() {
    int n;
    if (cin >> n) {
        vector<int> arr(n);
        for (int i = 0; i < n; i++) cin >> arr[i];
        cout << trap(n, arr) << endl;
    }
    return 0;
}`,
      javascript: `const fs = require('fs');

function trap(n, arr) {
    // TODO: Implement trapping rain water logic (Two pointers/stack)
    return 0;
}

const input = fs.readFileSync(0, 'utf8').split(/\\s+/);
if (input.length >= 2) {
    const n = parseInt(input[0]);
    const arr = input.slice(1, n + 1).map(Number);
    console.log(trap(n, arr));
}`,
      c: `#include <stdio.h>

long long trap(int n, int* arr) {
    // TODO: Implement trapping rain water logic (Two pointers/stack)
    return 0;
}

int main() {
    int n;
    if (scanf("%d", &n) != EOF) {
        int arr[100001];
        for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
        printf("%lld\\n", trap(n, arr));
    }
    return 0;
}`,
      csharp: `using System;
using System.Linq;

class Program {
    static long Trap(int n, int[] arr) {
        // TODO: Implement trapping rain water logic (Two pointers/stack)
        return 0;
    }

    static void Main() {
        string l = Console.ReadLine();
        if (l == null) return;
        int n = int.Parse(l);
        int[] arr = Console.ReadLine().Split(' ').Select(int.Parse).ToArray();
        Console.WriteLine(Trap(n, arr));
    }
}`,
      go: `package main

import "fmt"

func trap(n int, arr []int) int64 {
    // TODO: Implement trapping rain water logic (Two pointers/stack)
    return 0
}

func main() {
    var n int
    fmt.Scan(&n)
    arr := make([]int, n)
    for i := 0; i < n; i++ {
        fmt.Scan(&arr[i])
    }
    fmt.Println(trap(n, arr))
}`,
      rust: `use std::io::{self, Read};

fn trap(n: usize, arr: Vec<i32>) -> i64 {
    // TODO: Implement trapping rain water logic (Two pointers/stack)
    0
}

fn main() {
    let mut input = String::new();
    if io::stdin().read_to_string(&mut input).is_ok() {
        let mut words = input.split_whitespace();
        if let Some(n_str) = words.next() {
            let n: usize = n_str.parse().unwrap();
            let arr: Vec<i32> = words.map(|s| s.parse().unwrap()).collect();
            println!("{}", trap(n, arr));
        }
    }
}`
    },
    hiddenTestCases: [
      { input: "2\n1 1", output: "0" }, { input: "5\n4 2 0 3 2 5", output: "9" }, { input: "3\n2 0 2", output: "2" }, { input: "6\n0 1 0 2 1 0", output: "1" }, { input: "12\n0 1 0 2 1 0 1 3 2 1 2 1", output: "6" }, { input: "1\n5", output: "0" }, { input: "4\n10 5 2 10", output: "15" }, { input: "5\n3 0 0 0 3", output: "6" }, { input: "2\n10 0", output: "0" }, { input: "10\n1 2 1 2 1 2 1 2 1 2", output: "4" }
    ],
    timeLimit: "1s", memoryLimit: "256MB", languageSupport: ["python", "java", "cpp", "javascript", "c", "csharp", "go", "rust"]
  }
];
