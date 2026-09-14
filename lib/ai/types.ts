// AI service types
export interface AiProvider {
  analyzeResumeAgainstJob: (
    resumeText: string,
    jobDescription: string
  ) => Promise<{
    atsScore: number;
    matchingKeywords: string[];
    missingKeywords: string[];
    skillGaps: string[];
    strengths: string[];
    summary: string;
  }>;

  generateInterviewQuestions: (
    skillGaps: string[],
    targetRole: string
  ) => Promise<Array<{
    id: number;
    question: string;
    category: string;
    difficulty: "Easy" | "Medium" | "Hard";
    sampleAnswerKeyPoints: string[];
  }>>;
}