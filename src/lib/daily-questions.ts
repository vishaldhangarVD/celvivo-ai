
export type ChallengeType = 'HR' | 'Technical' | 'Aptitude' | 'Behavioral';

export interface DailyQuestion {
  id: string;
  question: string;
  category: ChallengeType;
}

const QUESTIONS: DailyQuestion[] = [
  { id: '1', category: 'Behavioral', question: 'Describe a time you had to work with a difficult teammate. How did you handle it?' },
  { id: '2', category: 'Technical', question: 'Explain the difference between optimistic and pessimistic locking in database transactions.' },
  { id: '3', category: 'HR', question: 'Why should we hire you over other candidates with similar technical backgrounds?' },
  { id: '4', category: 'Aptitude', question: 'A clock shows 3:15. What is the angle between the hour and minute hands?' },
  { id: '5', category: 'Technical', question: 'What are the trade-offs of using a Microservices architecture versus a Monolith?' },
  { id: '6', category: 'Behavioral', question: 'Tell me about a time you failed. What did you learn and how did you improve?' },
  { id: '7', category: 'HR', question: 'Where do you see yourself professionally in the next 5 years?' },
  { id: '8', category: 'Technical', question: 'How does the Virtual DOM in React improve performance?' },
  { id: '9', category: 'Aptitude', question: 'If 5 machines can make 5 widgets in 5 minutes, how long does it take 100 machines to make 100 widgets?' },
  { id: '10', category: 'Behavioral', question: 'Describe a situation where you had to lead a project under a tight deadline.' }
];

export function getQuestionOfTheDay(): DailyQuestion {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return QUESTIONS[dayOfYear % QUESTIONS.length];
}
