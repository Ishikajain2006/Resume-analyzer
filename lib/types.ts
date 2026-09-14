// Shared TypeScript Domain Types

export interface CategorizedKeywordGroup {
  category: string;
  matching: string[];
  missing: string[];
}

export interface AtsSubScores {
  keywordCoverage: number;
  experienceAlignment: number;
  technicalDepth: number;
}

export interface AtsAnalysisResult {
  resumeId?: string;
  atsScore: number;
  matchingKeywords: string[];
  missingKeywords: string[];
  skillGaps: string[];
  strengths: string[];
  summary: string;
  subScores?: AtsSubScores;
  categorizedKeywords?: CategorizedKeywordGroup[];
}

export interface InterviewRubric {
  mustCover: string[];
  tradeoffs: string[];
  pitfalls: string[];
}

export interface InterviewQuestion {
  id: number;
  question: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  sampleAnswerKeyPoints: string[];
  rubric?: InterviewRubric;
}

export interface InterviewSession {
  id: string;
  userId: string;
  resumeId: string;
  targetRole: string;
  questions: InterviewQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Resume {
  id: string;
  userId: string;
  parsedText: string | null;
  fileUrl: string | null;
  atsScore: number | null;
  matchingKeywords: string[];
  missingKeywords: string[];
  skillGaps: string[];
  strengths: string[];
  summary: string | null;
  jobDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}