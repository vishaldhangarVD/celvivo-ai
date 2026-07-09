export type InterviewStage =
  | "INTRODUCTION"
  | "RESUME"
  | "PROJECT"
  | "TECHNICAL"
  | "SCENARIO"
  | "FOLLOW UP"
  | "BEHAVIOUR"
  | "RAPID FIRE"
  | "CLOSING";

export function getNextStage(
  currentStage: InterviewStage,
  questionNumber: number
): InterviewStage {
  const stages: InterviewStage[] = [
    "INTRODUCTION",
    "RESUME",
    "PROJECT",
    "TECHNICAL",
    "SCENARIO",
    "FOLLOW UP",
    "BEHAVIOUR",
    "RAPID FIRE",
    "CLOSING"
  ];
  
  if (questionNumber < 1) return "INTRODUCTION";
  if (questionNumber >= stages.length) return "CLOSING";
  
  return stages[questionNumber];
}

export type Difficulty =
  | "EASY"
  | "MEDIUM" | "HARD";

/**
 * Progression logic for difficulty.
 * Strong answer -> Harder
 * Average answer -> Maintain
 * Weak answer -> Easier
 */
export function calculateNextDifficulty(
  current: Difficulty,
  adjustment: "Easier" | "Harder" | "Maintain" = "Maintain"
): Difficulty {
  if (adjustment === "Maintain") return current;

  if (adjustment === "Harder") {
    if (current === "EASY") return "MEDIUM";
    if (current === "MEDIUM") return "HARD";
    return "HARD";
  }

  if (adjustment === "Easier") {
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
