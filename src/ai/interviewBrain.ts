export type InterviewStage =
  | "INTRODUCTION"
  | "RESUME"
  | "PROJECT"
  | "TECHNICAL"
  | "SCENARIO"
  | "FOLLOW_UP"
  | "BEHAVIOR"
  | "RAPID_FIRE"
  | "CLOSING";

export function getNextStage(
  currentStage: InterviewStage,
  questionNumber: number
): InterviewStage {

  if (questionNumber <= 1) return "INTRODUCTION";

  switch (currentStage) {
    case "INTRODUCTION":
      return "RESUME";

    case "RESUME":
      return "PROJECT";

    case "PROJECT":
      return "TECHNICAL";

    case "TECHNICAL":
      return "SCENARIO";

    case "SCENARIO":
      return "FOLLOW_UP";

    case "FOLLOW_UP":
      return "BEHAVIOR";

    case "BEHAVIOR":
      return "RAPID_FIRE";

    default:
      return "CLOSING";
  }
}
export type Difficulty =
  | "EASY"
  | "MEDIUM"
  | "HARD";

export function getNextDifficulty(
  current: Difficulty,
  answerLength: number
): Difficulty {

  if (answerLength > 300) {
    if (current === "EASY") return "MEDIUM";
    if (current === "MEDIUM") return "HARD";
    return "HARD";
  }

  if (answerLength < 80) {
    if (current === "HARD") return "MEDIUM";
    if (current === "MEDIUM") return "EASY";
    return "EASY";
  }

  return current;
}
export function isQuestionRepeated(
    newQuestion: string,
    previousQuestions: string[]
  ): boolean {
  
    const normalizedNew = newQuestion
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .trim();
  
    return previousQuestions.some((q) => {
      const normalizedOld = q
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .trim();
  
      return (
        normalizedOld === normalizedNew ||
        normalizedOld.includes(normalizedNew) ||
        normalizedNew.includes(normalizedOld)
      );
    });
  }