
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Question {
  id: string;
  category: string;
  text: string;
  answer: string;
  difficulty: Difficulty;
}

export const CATEGORIES = [
  "React", "Java", "Python", "JavaScript", "AWS", "DevOps", "Data Science", "Cybersecurity"
];

export const QUESTIONS: Question[] = [
  // React
  {
    id: 'react-1',
    category: 'React',
    difficulty: 'Medium',
    text: 'What is the Virtual DOM and how does React use it to optimize performance?',
    answer: 'The Virtual DOM is a lightweight copy of the actual DOM. When state changes, React creates a new Virtual DOM tree and compares it with the previous one (diffing). It then calculates the minimum number of changes needed and applies them to the real DOM (reconciliation), which is much faster than re-rendering the whole page.'
  },
  {
    id: 'react-2',
    category: 'React',
    difficulty: 'Hard',
    text: 'Explain the rules of Hooks and why they are necessary.',
    answer: 'Hooks must be called at the top level of a component (not inside loops or conditions) and only from React function components. These rules ensure that hooks are called in the same order on every render, allowing React to correctly preserve state between hook calls.'
  },
  // Java
  {
    id: 'java-1',
    category: 'Java',
    difficulty: 'Easy',
    text: 'What is the difference between JDK, JRE, and JVM?',
    answer: 'JVM (Java Virtual Machine) runs the bytecode. JRE (Java Runtime Environment) includes JVM plus libraries to run Java apps. JDK (Java Development Kit) includes JRE plus development tools like the compiler (javac).'
  },
  {
    id: 'java-2',
    category: 'Java',
    difficulty: 'Medium',
    text: 'What is the difference between a HashMap and a Hashtable?',
    answer: 'HashMap is non-synchronized and allows one null key and multiple null values. Hashtable is synchronized (thread-safe) and does not allow null keys or values.'
  },
  // Python
  {
    id: 'python-1',
    category: 'Python',
    difficulty: 'Medium',
    text: 'Explain the difference between deep copy and shallow copy in Python.',
    answer: 'A shallow copy creates a new object but inserts references into it to the objects found in the original. A deep copy creates a new object and recursively inserts copies of the objects found in the original.'
  },
  // JavaScript
  {
    id: 'js-1',
    category: 'JavaScript',
    difficulty: 'Hard',
    text: 'What is a closure in JavaScript and provide a use case.',
    answer: 'A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment). Closures allow a function to access variables from an outer scope even after the outer function has finished executing. Common use cases include data privacy (private variables) and factory functions.'
  },
  // AWS
  {
    id: 'aws-1',
    category: 'AWS',
    difficulty: 'Medium',
    text: 'What is the difference between S3 and EBS?',
    answer: 'S3 (Simple Storage Service) is object storage for high durability and scalability, accessible via URL. EBS (Elastic Block Store) is block storage designed for use with EC2 instances as virtual hard drives.'
  },
  // DevOps
  {
    id: 'devops-1',
    category: 'DevOps',
    difficulty: 'Hard',
    text: 'Explain Blue-Green Deployment strategy.',
    answer: 'It is a deployment technique that reduces downtime and risk by running two identical production environments, only one of which serves live traffic at any time. Blue is the current version, and Green is the new version. Once tested, traffic is switched to Green.'
  }
];
