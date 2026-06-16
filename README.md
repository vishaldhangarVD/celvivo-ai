# Nexvoro AI - Neural Interview Preparation Platform

Nexvoro AI is an advanced, AI-powered interview preparation and career development ecosystem designed for elite IT professionals.

## Core Capabilities

- **Neural Interview Engine**: High-fidelity simulations powered by Gemini 2.5 Flash with real-time scoring.
- **Resume Intelligence**: Deep ATS blueprint auditing and optimization.
- **Growth Architecture**: Personalized 90-day roadmaps and skill gap analysis.
- **Deployment Tracker**: Integrated mission log for job applications.
- **Credential Vault**: Verified performance certificates for elite simulation results.
- **Resilience Layer**: Automatic AI retries and offline mock fallback protocols.

## Neural Integrity Matrix (Audit v1.2)

| Route | Real Backend (Firestore) | Real AI Flow | Mock Data Remaining | Status |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `users` | `test-gemini.ts` | Onboarding Wizard simulated file | ✅ Fully Functional |
| `/login` / `/signup` | `users` | N/A | None | ✅ Fully Functional |
| `/dashboard` | `users`, `interviews`, `resumes`, `job_apps` | N/A | None | ✅ Fully Functional |
| `/user-dashboard` | `interviews`, `resumes` | N/A | None | ✅ Fully Functional |
| `/interview` | N/A | N/A | Role selection list | ✅ Fully Functional |
| `/interview/[id]` | `interviews` | `ai-mock-interview.ts` | Offline Mock Fallback Bank | ✅ Fully Functional |
| `/feedback/[id]` | `interviews`, `users` | `ai-interview-feedback.ts` | None | ✅ Fully Functional |
| `/resume` | `resumes`, `users` | `ai-resume-analysis.ts` | None | ✅ Fully Functional |
| `/skill-gap` | `skill_gap` | `ai-skill-gap-analysis.ts` | Role dropdown repository | ✅ Fully Functional |
| `/roadmap` | `roadmaps` | `ai-learning-roadmap.ts` | None | ✅ Fully Functional |
| `/certificates` | `interviews` | N/A | Verification ID (Random) | ✅ Fully Functional |
| `/job-tracker` | `job_applications` | N/A | None | ✅ Fully Functional |
| `/cover-letter` | `cover_letters` | `ai-cover-letter.ts` | None | ✅ Fully Functional |
| `/daily-challenge` | `users`, `daily_challenges` | `ai-daily-challenge-eval.ts` | Local Question Pool | ✅ Fully Functional |
| `/question-bank` | `favorite_questions` | N/A | Local Question Repository | ✅ Fully Functional |
| `/settings` | `users` | N/A | Billing & Advanced Security stubs | ⚠️ Partially Functional |
| `/admin` | N/A | N/A | System health and global metrics | 🖼️ UI Only |

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **AI**: Genkit 1.x + Gemini 2.5 Flash (Primary) / 2.0 Flash (Fallback)
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication (Google & Email)
- **UI**: Tailwind CSS + Framer Motion + ShadCN
- **Export**: jsPDF for Certificate Synthesis
