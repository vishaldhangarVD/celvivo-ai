
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Question {
  id: string;
  category: string;
  company?: string;
  text: string;
  answer: string;
  difficulty: Difficulty;
  tips?: string[];
  mistakes?: string[];
  usage?: string;
}

export const CATEGORIES = [
  "React", "Java", "Python", "JavaScript", "AWS", "DevOps", "Data Science", "Cybersecurity"
];

export const COMPANIES = [
  "Google", "Amazon", "Microsoft", "Meta", "OpenAI", "TCS", "Infosys", "Wipro"
];

export const QUESTIONS: Question[] = [
  {
    id: 'react-1',
    category: 'React',
    company: 'Meta',
    difficulty: 'Medium',
    text: 'What is the Virtual DOM and how does React use it to optimize performance?',
    answer: 'The Virtual DOM is a lightweight copy of the actual DOM. When state changes, React creates a new Virtual DOM tree and compares it with the previous one (diffing). It then calculates the minimum number of changes needed and applies them to the real DOM (reconciliation), which is much faster than re-rendering the whole page.',
    tips: [
      "Mention the reconciliation algorithm.",
      "Explain that DOM operations are expensive.",
      "Highlight that React 18 uses fiber for even better performance."
    ],
    mistakes: [
      "Saying the Virtual DOM is faster than the DOM in all cases (it's the 'process' that is faster).",
      "Confusing Shadow DOM with Virtual DOM."
    ],
    usage: "Used in every React application to manage UI updates efficiently without full page refreshes."
  },
  {
    id: 'openai-1',
    category: 'Python',
    company: 'OpenAI',
    difficulty: 'Hard',
    text: 'How do you handle memory management in large-scale Python applications processing LLM tokens?',
    answer: 'Memory management involves using generators for streaming data, leveraging __slots__ in classes to reduce memory footprint, and explicitly calling the garbage collector for large objects. For LLM tokens, utilizing memory-mapped files or specialized data structures like NumPy arrays for embeddings is critical.',
    tips: [
      "Talk about the 'gc' module.",
      "Mention reference counting vs generational garbage collection.",
      "Explain memory leaks in long-running processes."
    ],
    mistakes: [
      "Forgetting that global variables stay in memory.",
      "Loading entire datasets into RAM instead of using iterators."
    ],
    usage: "Critical for AI engineers building inference pipelines where latency and cost are tied to memory efficiency."
  },
  {
    id: 'google-1',
    category: 'JavaScript',
    company: 'Google',
    difficulty: 'Hard',
    text: 'Explain the event loop and the difference between microtasks and macrotasks.',
    answer: 'The Event Loop is the mechanism that handles asynchronous callbacks. Macrotasks (setTimeout, setInterval, I/O) are handled in the task queue, while Microtasks (Promises, process.nextTick) are handled in a separate microtask queue. Microtasks are always processed fully before the next macrotask begins.',
    tips: [
      "Visualize the call stack, web APIs, and callback queue.",
      "Explain that microtasks can starve the event loop if too many are queued.",
      "Mention that UI rendering happens after the microtask queue is empty."
    ],
    mistakes: [
      "Thinking Promises and setTimeout have the same priority.",
      "Not knowing that microtasks execute after each macrotask completes."
    ],
    usage: "Foundational for building high-performance Node.js backends and complex web UIs."
  },
  {
    id: 'aws-1',
    category: 'AWS',
    company: 'Amazon',
    difficulty: 'Medium',
    text: 'What is the difference between S3 and EBS?',
    answer: 'S3 (Simple Storage Service) is object storage for high durability and scalability, accessible via URL. EBS (Elastic Block Store) is block storage designed for use with EC2 instances as virtual hard drives.',
    tips: [
      "S3 is for static files, backups, and data lakes.",
      "EBS is for databases and OS files needing low latency.",
      "Mention S3 storage classes for cost optimization."
    ],
    mistakes: [
      "Thinking S3 can be mounted as a standard drive easily like EBS.",
      "Using EBS for globally accessible static content."
    ],
    usage: "Standard architectural decision for cloud infrastructure design."
  }
];
