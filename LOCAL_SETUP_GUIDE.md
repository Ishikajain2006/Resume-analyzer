# Local-Only Setup Guide

This guide explains how to run the AI Resume Analyzer & Interview Preparation application using only local resources (no external databases or storage services required).

## What Changes Were Made for Local-Only Operation

1. **Replaced Supabase Storage** with local file storage in `/app/local-storage/`
2. **Replaced PostgreSQL/Prisma** with a simple JSON-file based storage system
3. **Kept Clerk Authentication** (still requires the provided keys, but no additional setup)
4. **Kept AI Services** (still requires NVIDIA/OpenRouter API key for full functionality)

## Local Storage Structure

The application will use:
```
/app/local-storage/
├── resumes/              # Uploaded PDF files
│   ├── {userId}/
│   │   ├── {resumeId}.pdf
│   │   └── metadata.json
│   └── ...
└── metadata/
    ├── users.json
    ├── resumes.json
    └── interview-sessions.json
```

## Environment Variables

You still need to configure these in `.env.local`:

```env
# Clerk Authentication (REQUIRED)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Z2l2aW5nLWxlbW1pbmctNDU0Mi5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_muh2Q8WftJIIJbI5YuWDa5idsiWO1CU1ODeK00UeGH

# AI Provider (REQUIRED for full functionality)
NVIDIA_API_KEY=your_nvidia_or_openrouter_api_key_here
NVIDIA_BASE_URL=https://api.nvidia.com/v1  # or https://openrouter.ai/api/v1 for OpenRouter
NVIDIA_MODEL=nvidia/nemotron-3-super-120b-a12b

# Local Storage Configuration (OPTIONAL - defaults work fine)
LOCAL_STORAGE_PATH=./app/local-storage
```

## Installation & Running

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to: http://localhost:3000

## What Works Locally

✅ User authentication with Clerk (using your provided keys)
✅ Resume upload and storage (files saved locally)
✅ PDF text extraction (using pdf-parse)
✅ ATS analysis (using NVIDIA/OpenRouter AI)
✅ Interview question generation (using NVIDIA/OpenRouter AI)
✅ Data persistence (using local JSON files)
✅ All UI components and functionality

## What You Still Need

1. **Clerk Keys**: Already provided in the conversation
2. **NVIDIA/OpenRouter API Key**: Required for AI features to work
3. **Local Storage Space**: The app will create directories as needed

## Limitations of Local-Only Mode

- Data is stored only on the local machine (not shared between devices or sessions if you clear storage)
- No automatic backups
- Concurrent access limitations (designed for single-user development/testing)
- Performance may vary based on local disk speed

## To Reset Local Data

Simply delete the `/app/local-storage/` directory and restart the application.

## Deployment Note

This local-only version is designed for development and testing. For production deployment, you would want to revert to the Supabase/PostgreSQL version for scalability and reliability.