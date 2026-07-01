/**
 * @fileOverview Standardized curriculum nodes for Nexvoro AI Career Tracks.
 */

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
}

export interface CareerRoadmap {
  id: string;
  title: string;
  description: string;
  steps: RoadmapStep[];
}

export const ROADMAP_DEFINITIONS: Record<string, CareerRoadmap> = {
  'data-analyst': {
    id: 'data-analyst',
    title: 'Data Analyst',
    description: 'Master the art of data storytelling and technical analysis.',
    steps: [
      { id: 'da-1', title: 'Data Foundations & Excel', description: 'Master pivot tables, VLOOKUPs, and advanced data cleaning techniques.' },
      { id: 'da-2', title: 'SQL Interrogation', description: 'Write complex queries, joins, and optimize database performance.' },
      { id: 'da-3', title: 'Statistical Analysis', description: 'Understand probability, hypothesis testing, and regression models.' },
      { id: 'da-4', title: 'Power BI / Tableau Mastery', description: 'Architect high-fidelity executive dashboards and live reporting.' },
      { id: 'da-5', title: 'Python for Analysis', description: 'Leverage Pandas, NumPy, and Matplotlib for automated intelligence.' }
    ]
  },
  'software-developer': {
    id: 'software-developer',
    title: 'Software Developer',
    description: 'Engineer modern, scalable software ecosystems.',
    steps: [
      { id: 'sd-1', title: 'Core Logic & Algorithms', description: 'Master DSA patterns, time complexity, and problem-solving architecture.' },
      { id: 'sd-2', title: 'Full Stack Integration', description: 'Bridge the gap between modern frontends and robust API layers.' },
      { id: 'sd-3', title: 'System Design Mastery', description: 'Learn scalability, load balancing, and microservices architecture.' },
      { id: 'sd-4', title: 'Testing & QA Protocols', description: 'Implement unit testing, integration tests, and TDD workflows.' },
      { id: 'sd-5', title: 'DevOps & CI/CD Deployment', description: 'Automate deployment pipelines and manage cloud-native environments.' }
    ]
  },
  'data-scientist': {
    id: 'data-scientist',
    title: 'Data Scientist',
    description: 'Harness the power of Machine Learning and Neural Networks.',
    steps: [
      { id: 'ds-1', title: 'Mathematical Core', description: 'Advanced calculus, linear algebra, and neural probability.' },
      { id: 'ds-2', title: 'Machine Learning Models', description: 'Supervised and unsupervised learning, trees, and clustering.' },
      { id: 'ds-3', title: 'Deep Learning & NLP', description: 'Architect neural networks and process natural language intelligence.' },
      { id: 'ds-4', title: 'MLOps & Scaling', description: 'Deploy models to production and manage data drift protocols.' },
      { id: 'ds-5', title: 'Generative AI Engineering', description: 'Master LLM orchestration and vector database integration.' }
    ]
  },
  'web-developer': {
    id: 'web-developer',
    title: 'Web Developer',
    description: 'Craft high-performance, cinematic web experiences.',
    steps: [
      { id: 'wd-1', title: 'Advanced React & Hooks', description: 'Master state management, performance optimization, and custom logic.' },
      { id: 'wd-2', title: 'Next.js 15 Framework', description: 'Implement server components, App Router, and dynamic rendering.' },
      { id: 'wd-3', title: 'Tailwind CSS Mastery', description: 'Design complex layouts and animations with utility-first protocols.' },
      { id: 'wd-4', title: 'Backend Integration', description: 'Connect with Firebase or custom APIs for dynamic data flow.' },
      { id: 'wd-5', title: 'Cloud Distribution', description: 'Optimize for Vercel, AWS, and global edge deployments.' }
    ]
  }
};
