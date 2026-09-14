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

function generateHeuristicInterviewQuestions(skillGaps: string[], targetRole: string): InterviewQuestion[] {
  const gaps = skillGaps?.length > 0 ? skillGaps : ["Distributed Systems", "API Performance", "Database Optimization", "Reliability"];
  const role = targetRole || "Senior Software Engineer";

  return [
    {
      id: 1,
      question: `For a ${role} position, how would you design and implement low-latency caching and data invalidation when working with ${gaps[0] || "distributed state"}?`,
      category: gaps[0] || "Architecture & Systems",
      difficulty: "Hard",
      sampleAnswerKeyPoints: [
        "Cache-aside pattern vs write-through strategies",
        "Handling thundering herd and stampede prevention with mutex leases",
        "Event-driven invalidation via CDC or Pub/Sub queues"
      ],
      rubric: {
        mustCover: ["Cache invalidation latency", "Consistency vs Availability tradeoffs"],
        tradeoffs: ["P99 latency improvement vs stale read window"],
        pitfalls: ["Unbounded TTLs causing memory leaks"]
      }
    },
    {
      id: 2,
      question: `In your production experience, what strategies do you employ to diagnose and resolve P99 latency spikes and database connection pooling bottlenecks under high concurrency?`,
      category: "Performance & Reliability",
      difficulty: "Medium",
      sampleAnswerKeyPoints: [
        "Connection pool sizing (HikariCP/Prisma/pgpool) formulas",
        "Index optimization, slow-query log profiling, and query plan analysis",
        "Circuit breakers and graceful degradation during pool exhaustion"
      ],
      rubric: {
        mustCover: ["Connection pool sizing", "EXPLAIN ANALYZE interpretation"],
        tradeoffs: ["Aggressive timeouts vs dropping valid user requests"],
        pitfalls: ["Starving the pool with long-running transactions"]
      }
    },
    {
      id: 3,
      question: `Describe how you structure resilient end-to-end type safety, validation, and error boundaries across modern full-stack TypeScript applications.`,
      category: "Frontend & API Architecture",
      difficulty: "Medium",
      sampleAnswerKeyPoints: [
        "Runtime schema validation using Zod/Valibot at network boundaries",
        "Discriminated union response modeling for deterministic client error handling",
        "Next.js App Router error boundaries and progressive hydration"
      ],
      rubric: {
        mustCover: ["Network boundary validation", "Shared client-server types"],
        tradeoffs: ["Payload parsing overhead vs runtime crash safety"],
        pitfalls: ["Blindly trusting `as Type` assertions in production code"]
      }
    },
    {
      id: 4,
      question: `How would you architect a fault-tolerant asynchronous background worker queue to handle bursty document parsing and AI model inference?`,
      category: "Cloud & Asynchronous Architecture",
      difficulty: "Hard",
      sampleAnswerKeyPoints: [
        "Message queues (BullMQ/SQS) with dead-letter queues and exponential backoff",
        "Worker concurrency control and backpressure handling",
        "Idempotency keys to guarantee at-least-once or exactly-once delivery"
      ],
      rubric: {
        mustCover: ["Dead-letter queues", "Idempotent processing logic"],
        tradeoffs: ["Polling intervals vs long-polling network overhead"],
        pitfalls: ["Missing timeout termination for zombie inference tasks"]
      }
    },
    {
      id: 5,
      question: `Explain your approach to monitoring, distributed tracing, and root cause analysis in modern containerized microservices.`,
      category: "Observability & SRE",
      difficulty: "Easy",
      sampleAnswerKeyPoints: [
        "OpenTelemetry trace propagation across HTTP/gRPC boundaries",
        "P99 latency anomaly detection and high-cardinality metric alerting",
        "Post-mortem blameless culture and preventative remediation"
      ],
      rubric: {
        mustCover: ["Trace context propagation", "Log correlation with Trace IDs"],
        tradeoffs: ["Sampling rate vs storage cost"],
        pitfalls: ["Over-alerting and metric noise during deployments"]
      }
    }
  ];
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
      return generateHeuristicInterviewQuestions(effectiveGaps, effectiveRole);
    }

    return validateInterviewQuestionsResponse(content);
  } catch (error) {
    console.warn("Interview generator fallback triggered:", error);
    return generateHeuristicInterviewQuestions(effectiveGaps, effectiveRole);
  }
}