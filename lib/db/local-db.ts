import fs from "fs";
import path from "path";

export interface UserRecord {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResumeRecord {
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

export interface InterviewSessionRecord {
  id: string;
  userId: string;
  resumeId: string;
  targetRole: string;
  questions: any[];
  createdAt: Date;
  updatedAt: Date;
}

interface DatabaseSchema {
  users: UserRecord[];
  resumes: ResumeRecord[];
  interviewSessions: InterviewSessionRecord[];
}

const DB_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DB_DIR, "db.json");

function ensureDbFile(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialData: DatabaseSchema = {
        users: [],
        resumes: [],
        interviewSessions: [],
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
      return initialData;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const data = JSON.parse(raw);
    return {
      users: (data.users || []).map((u: any) => ({
        ...u,
        createdAt: new Date(u.createdAt),
        updatedAt: new Date(u.updatedAt),
      })),
      resumes: (data.resumes || []).map((r: any) => ({
        ...r,
        createdAt: new Date(r.createdAt),
        updatedAt: new Date(r.updatedAt),
      })),
      interviewSessions: (data.interviewSessions || []).map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
      })),
    };
  } catch (err) {
    console.error("LocalDB initialization error:", err);
    return { users: [], resumes: [], interviewSessions: [] };
  }
}

function saveDb(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("LocalDB write error:", err);
  }
}

function matchesWhere(item: any, where: any): boolean {
  if (!where) return true;
  for (const [key, filter] of Object.entries(where)) {
    const val = item[key];
    if (filter && typeof filter === "object" && !Array.isArray(filter) && !(filter instanceof Date)) {
      if ("not" in filter) {
        if (filter.not === null && (val === null || val === undefined)) return false;
        if (filter.not !== null && val === filter.not) return false;
      }
    } else if (val !== filter) {
      return false;
    }
  }
  return true;
}

function sortItems<T>(items: T[], orderBy: any): T[] {
  if (!orderBy) return items;
  const [field, direction] = Object.entries(orderBy)[0] as [string, string];
  return [...items].sort((a: any, b: any) => {
    const valA = a[field] instanceof Date ? a[field].getTime() : a[field];
    const valB = b[field] instanceof Date ? b[field].getTime() : b[field];
    if (valA < valB) return direction?.toLowerCase() === "desc" ? 1 : -1;
    if (valA > valB) return direction?.toLowerCase() === "desc" ? -1 : 1;
    return 0;
  });
}

export class LocalDB {
  static user = {
    async findUnique({ where }: { where: { clerkId?: string; id?: string } }): Promise<UserRecord | null> {
      const db = ensureDbFile();
      if (where.clerkId) {
        return db.users.find((u) => u.clerkId === where.clerkId) || null;
      }
      if (where.id) {
        return db.users.find((u) => u.id === where.id) || null;
      }
      return null;
    },

    async findFirst({ where }: { where?: any } = {}): Promise<UserRecord | null> {
      const db = ensureDbFile();
      return db.users.find((u) => matchesWhere(u, where)) || null;
    },

    async create(args: { data?: any; [key: string]: any }): Promise<UserRecord> {
      const payload = args.data || args;
      const db = ensureDbFile();
      const existing = db.users.find((u) => u.clerkId === payload.clerkId);
      if (existing) {
        return existing;
      }
      const newUser: UserRecord = {
        id: "usr_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        clerkId: payload.clerkId,
        email: payload.email || "",
        name: payload.name || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.users.push(newUser);
      saveDb(db);
      return newUser;
    },
  };

  static resume = {
    async findUnique({ where }: { where: { id: string } }): Promise<ResumeRecord | null> {
      const db = ensureDbFile();
      return db.resumes.find((r) => r.id === where.id) || null;
    },

    async findFirst({ where, orderBy }: { where?: any; orderBy?: any } = {}): Promise<ResumeRecord | null> {
      const db = ensureDbFile();
      let matched = db.resumes.filter((r) => matchesWhere(r, where));
      matched = sortItems(matched, orderBy);
      return matched[0] || null;
    },

    async findMany({ where, orderBy }: { where?: any; orderBy?: any } = {}): Promise<ResumeRecord[]> {
      const db = ensureDbFile();
      let matched = db.resumes.filter((r) => matchesWhere(r, where));
      return sortItems(matched, orderBy);
    },

    async create(args: { data?: any; [key: string]: any }): Promise<ResumeRecord> {
      const payload = args.data || args;
      const db = ensureDbFile();
      const newResume: ResumeRecord = {
        id: "res_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        userId: payload.userId,
        parsedText: payload.parsedText || null,
        fileUrl: payload.fileUrl || null,
        atsScore: typeof payload.atsScore === "number" ? payload.atsScore : null,
        matchingKeywords: Array.isArray(payload.matchingKeywords) ? payload.matchingKeywords : [],
        missingKeywords: Array.isArray(payload.missingKeywords) ? payload.missingKeywords : [],
        skillGaps: Array.isArray(payload.skillGaps) ? payload.skillGaps : [],
        strengths: Array.isArray(payload.strengths) ? payload.strengths : [],
        summary: payload.summary || null,
        jobDescription: payload.jobDescription || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.resumes.unshift(newResume);
      saveDb(db);
      return newResume;
    },

    async update({ where, data }: { where: { id: string }; data: any }): Promise<ResumeRecord> {
      const db = ensureDbFile();
      const index = db.resumes.findIndex((r) => r.id === where.id);
      if (index === -1) {
        throw new Error(`Resume with ID ${where.id} not found`);
      }
      const existing = db.resumes[index];
      const updated: ResumeRecord = {
        ...existing,
        ...data,
        updatedAt: new Date(),
      };
      db.resumes[index] = updated;
      saveDb(db);
      return updated;
    },

    async delete({ where }: { where: { id: string } }): Promise<{ count: number }> {
      const db = ensureDbFile();
      const prevCount = db.resumes.length;
      db.resumes = db.resumes.filter((r) => r.id !== where.id);
      db.interviewSessions = db.interviewSessions.filter((s) => s.resumeId !== where.id);
      saveDb(db);
      return { count: prevCount - db.resumes.length };
    },
  };

  static interviewSession = {
    async findUnique({ where }: { where: { id: string } }): Promise<InterviewSessionRecord | null> {
      const db = ensureDbFile();
      return db.interviewSessions.find((s) => s.id === where.id) || null;
    },

    async findFirst({ where, orderBy }: { where?: any; orderBy?: any } = {}): Promise<InterviewSessionRecord | null> {
      const db = ensureDbFile();
      let matched = db.interviewSessions.filter((s) => matchesWhere(s, where));
      matched = sortItems(matched, orderBy);
      return matched[0] || null;
    },

    async findMany({ where, orderBy }: { where?: any; orderBy?: any } = {}): Promise<InterviewSessionRecord[]> {
      const db = ensureDbFile();
      let matched = db.interviewSessions.filter((s) => matchesWhere(s, where));
      return sortItems(matched, orderBy);
    },

    async create(args: { data?: any; [key: string]: any }): Promise<InterviewSessionRecord> {
      const payload = args.data || args;
      const db = ensureDbFile();
      const newSession: InterviewSessionRecord = {
        id: "int_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        userId: payload.userId,
        resumeId: payload.resumeId,
        targetRole: payload.targetRole || "Software Engineer",
        questions: Array.isArray(payload.questions) ? payload.questions : [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.interviewSessions.unshift(newSession);
      saveDb(db);
      return newSession;
    },
  };
}

export const prisma = LocalDB;