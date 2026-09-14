import { OpenAI } from "openai";
import { env } from "@/lib/env";
import { z } from "zod";
import { InterviewQuestion } from "@/lib/types";
import { extractJsonFromResponse } from "./utils";

const openai = new OpenAI({
  apiKey: env.NVIDIA_API_KEY,
  baseURL: env.NVIDIA_BASE_URL,
});

const INTERVIEW_GENERATOR_SYSTEM_PROMPT = `You are a Principal Technical Interviewer and Staff Bar Raiser at a tier-1 technology company.
Your task is to generate exactly 5 high-signal, rigorous technical interview questions specifically designed to test the candidate's detected skill gaps for their target engineering position.

You must return ONLY a valid JSON object strictly matching this schema:
{
  "questions": [
    {
      "id": 1,
      "question": "Specific, scenario-based technical interview question",
      "category": "Topic area (e.g. Distributed Caching, GraphQL Schema Design, Kubernetes Ingress, Concurrency)",
      "difficulty": "Easy" | "Medium" | "Hard",
      "sampleAnswerKeyPoints": [
        "Core technical concept or principle",
        "Implementation approach or architecture tradeoff",
        "Edge-case, failure mode, or mitigation strategy"
      ],
      "rubric": {
        "mustCover": ["Essential concept 1", "Essential concept 2"],
        "tradeoffs": ["Tradeoff A vs B"],
        "pitfalls": ["Common mistake or anti-pattern to avoid"]
      }
    }
  ]
}

Rules:
1. Return exactly 5 questions numbered 1 through 5.
2. Formulate realistic engineering scenarios (e.g., handling cache stampedes, designing high-throughput resolvers, configuring rolling deployments).
3. "difficulty" must be strictly one of: "Easy", "Medium", "Hard".
4. "sampleAnswerKeyPoints" must contain 2 to 4 actionable, concrete technical takeaways.
5. Do not wrap in markdown fences. Return only raw JSON.`;

const rubricSchema = z.object({
  mustCover: z.array(z.string()).default([]),
  tradeoffs: z.array(z.string()).default([]),
  pitfalls: z.array(z.string()).default([]),
});

const questionItemSchema = z.object({
  id: z.coerce.number().int().default(1),
  question: z.string().min(5),
  category: z.string().min(2).default("Systems Engineering"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).default("Medium"),
  sampleAnswerKeyPoints: z.array(z.string()).min(1).default(["Comprehensive technical justification"]),
  rubric: rubricSchema.optional(),
});

const questionsEnvelopeSchema = z.object({
  questions: z.array(questionItemSchema).min(1),
});

function validateInterviewQuestionsResponse(rawContent: string): InterviewQuestion[] {
  const cleaned = extractJsonFromResponse(rawContent);
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error("JSON parse failure in interview generator response:", rawContent);
    throw new Error("AI engine returned malformed interview questions JSON.");
  }

  const envelope = Array.isArray(parsed) ? { questions: parsed } : parsed;
  const result = questionsEnvelopeSchema.safeParse(envelope);

  if (!result.success) {
    console.error("Zod validation failure on interview questions:", result.error.format());
    throw new Error("Interview questions did not match expected structural schema.");
  }

  const questions: InterviewQuestion[] = result.data.questions.slice(0, 5).map((q, idx) => ({
    id: idx + 1,
    question: q.question,
    category: q.category,
    difficulty: q.difficulty,
    sampleAnswerKeyPoints: q.sampleAnswerKeyPoints,
    rubric: q.rubric || {
      mustCover: q.sampleAnswerKeyPoints.slice(0, 2),
      tradeoffs: ["Performance vs Complexity tradeoffs"],
      pitfalls: ["Ignoring failure recovery and edge cases"],
    },
  }));

  // Pad to 5 if model produced fewer
  while (questions.length < 5) {
    const idx = questions.length + 1;
    questions.push({
      id: idx,
      question: `Explain your approach to monitoring, distributed tracing, and root cause analysis in production services.`,
      category: "Observability & SRE",
      difficulty: "Medium",
      sampleAnswerKeyPoints: [
        "OpenTelemetry trace propagation across microservices",
        "P99 latency anomaly detection and metric alerting",
        "Post-mortem analysis and preventative remediation",
      ],
      rubric: {
        mustCover: ["Trace context propagation", "Log correlation with Trace IDs"],
        tradeoffs: ["Sampling rate vs storage cost"],
        pitfalls: ["Over-alerting and metric noise"],
      },
    });
  }

  return questions;
}

export async function generateInterviewQuestions(
  skillGaps: string[],
  targetRole: string,
  modelName?: string
): Promise<InterviewQuestion[]> {
  const effectiveGaps = skillGaps?.length > 0
    ? skillGaps
    : ["Distributed Systems", "Database Optimization", "System Architecture"];
  const effectiveRole = targetRole?.trim() || "Senior Software Engineer";

  const skillGapsSummary = effectiveGaps.slice(0, 8).join(", ");
  const selectedModel = modelName?.trim() || env.NVIDIA_MODEL || "nvidia/nemotron-3-super-120b-a12b";

  try {
    const completion = await openai.chat.completions.create({
      model: selectedModel,
      messages: [
        {
          role: "system",
          content: INTERVIEW_GENERATOR_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `TARGET POSITION: ${effectiveRole}\nIDENTIFIED CANDIDATE SKILL GAPS: ${skillGapsSummary}\n\nGenerate exactly 5 rigorous technical interview questions addressing these areas.`,
        },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
      max_tokens: 1600,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response returned from NVIDIA interview generator.");
    }

    return validateInterviewQuestionsResponse(content);
  } catch (error) {
    console.error("Error calling interview generator service:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate interview questions"
    );
  }
}