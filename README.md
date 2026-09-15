# AI Resume Analyzer & Technical Interview Workbench

![Next.js](https://img.shields.io/badge/Next.js-14.2.25-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue?style=flat&logo=typescript)
![NVIDIA AI](https://img.shields.io/badge/NVIDIA%20AI-Nemotron%203%20Super-76B900?style=flat&logo=nvidia)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.1-38B2AC?style=flat&logo=tailwind-css)
![Clerk](https://img.shields.io/badge/Clerk-Authentication-6C47FF?style=flat&logo=clerk)

A production-ready engineering workbench that benchmarks candidate resumes against target job specifications using large language models. Computes granular ATS scores (0–100), multi-vector sub-scores, and categorized skill taxonomies while generating targeted technical screening scenarios with live Web Speech API rehearsal.

---

## Capabilities & Engineering Architecture

### 1. High-Precision PDF Resume Ingestion
- Server-side byte extraction using `pdf-parse` with MIME and file-size validation (< 5MB).
- Zero client-side data leaks; extracts clean UTF-8 text streams for deterministic evaluation.
- Dedicated 1-click **Sample Resume Loader** (`Alex Mercer`, Senior Full-Stack Engineer) for immediate end-to-end testing.

### 2. Deep Inference ATS Diagnostic Engine (NVIDIA Nemotron 3 Super)
- Compares candidate experience directly against the target job description.
- Evaluates:
  - **ATS Score (0–100)**: Overall candidate alignment rating.
  - **Multi-Vector Sub-Scores**: Keyword Match Coverage, Experience Scope Alignment, Technical Depth Rating.
  - **Categorized Keyword Taxonomy**: Languages & Runtimes, Frameworks, Cloud & DevOps, Databases & Distributed Systems, Architecture.
  - **Identified Skill Gaps**: Specific architectural or tooling deficiencies.
  - **Core Strengths**: Verified technical competencies aligning with senior engineering standards.
  - **Executive Summary**: Objective diagnostic briefing.
- Validated server-side via **Zod schemas** to guarantee deterministic JSON output.

### 3. Technical Screening Rehearsal Terminal
- Formulates **5 scenario-based technical questions** directly targeting detected skill gaps.
- **Web Speech API**: Live speech-to-text voice recording directly into candidate notes.
- **Telemetry**: Real-time Words Per Minute (WPM) tracking and speaking pace calculator.
- **Integrated Stopwatch**: Millisecond-accurate practice timer.
- **Engineering Rubric**: Essential Concepts, Tradeoffs, and Anti-Patterns / Traps.

### 4. Senior Developer Ergonomics
- **Keyboard Shortcuts**: `1`/`2`/`3`/`4` for tab switching, `⌘ + Enter` to run analysis, and `Esc` to close modals.
- **Resume Match Buffer Inspector**: Interactive modal displaying the raw resume text with verified skill matches and missing terms side-by-side.
- **Multi-Format Reporting**: One-click export to Markdown (`.md`), structured JSON payload (`.json`), and clean print styling (`@media print` for browser Save as PDF).
- **Tactile Audio Feedback**: Synthesized Web Audio micro-interactions (`lib/sound.ts`) with top-bar toggle.

### 5. Zero-Cloud Local Disk Persistence
- Data is atomically persisted locally to `.data/db.json` with an ORM-compatible interface (`User`, `Resume`, `InterviewSession`).
- Resumes and generated interview sessions survive server restarts and browser reloads without external cloud database dependencies.
- Local resume PDFs are saved to `public/uploads/resumes/` with browser preview/download links.

---

## Architecture Dataflow

```text
Browser Client (Next.js 14 App Router)
   │
   ├── Clerk Authentication (User Profiles & Protected Session)
   │
   ▼
Next.js Server Layer
   │
   ├── Server Actions & Route Handlers (/api/upload, /api/analyze, /api/interview)
   │
   ├── PDF Text Extraction Pipeline (pdf-parse server-side byte buffer)
   │
   ├── Local File Storage Service (public/uploads/resumes/)
   │
   ├── Persistent LocalDB Engine (.data/db.json / Prisma ORM)
   │      ├── User Records
   │      ├── Resume Records (ATS scores, keywords, gaps)
   │      └── Interview Sessions (5 questions & rubrics)
   │
   └── NVIDIA Nemotron 3 Super Inference Engine
          ├── Model: nvidia/nemotron-3-super-120b-a12b
          ├── Base URL: https://integrate.api.nvidia.com/v1
          └── Structured JSON Enforcement & Zod Schema Validation
```

---

## Quickstart

### 1. Installation
```bash
git clone <repository-url>
cd meowmeow90
npm install
```

### 2. Environment Configuration
Verify that `.env.local` contains:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NVIDIA_API_KEY=nvapi-...
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=nvidia/nemotron-3-super-120b-a12b
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Production Build
```bash
npm run build
npm start
```
