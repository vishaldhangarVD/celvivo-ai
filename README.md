# Nexvoro AI - Neural Interview Preparation Platform

Nexvoro AI is an advanced, AI-powered interview preparation and career development ecosystem designed for elite IT professionals.

## Core Capabilities

- **Neural Interview Engine**: High-fidelity simulations powered by Gemini 2.5 Flash with real-time scoring.
- **Resume Intelligence**: Deep ATS blueprint auditing and optimization.
- **Growth Architecture**: Personalized 90-day roadmaps and skill gap analysis.
- **Deployment Tracker**: Integrated mission log for job applications.
- **Credential Vault**: Verified performance certificates for elite simulation results.
- **Resilience Layer**: Automatic AI retries and offline mock fallback protocols.

## Route Audit & Implementation Status

| Route | Classification | Status |
| :--- | :--- | :--- |
| `/` | Fully Functional | ✅ |
| `/login` / `/signup` | Fully Functional | ✅ |
| `/dashboard` | Fully Functional | ✅ |
| `/user-dashboard` | Fully Functional | ✅ |
| `/interview` | Fully Functional | ✅ |
| `/interview/[id]` | Fully Functional | ✅ |
| `/feedback/[id]` | Fully Functional | ✅ |
| `/resume` | Fully Functional | ✅ |
| `/skill-gap` | Fully Functional | ✅ |
| `/roadmap` | Fully Functional | ✅ |
| `/certificates` | Fully Functional | ✅ |
| `/job-tracker` | Fully Functional | ✅ |
| `/cover-letter` | Fully Functional | ✅ |
| `/daily-challenge` | Fully Functional | ✅ |
| `/question-bank` | Fully Functional | ✅ |
| `/settings` | Partially Functional | ⚠️ |
| `/admin` | UI Only | 🖼️ |
| `/pricing` | UI Only | 🖼️ |
| `/features` | UI Only | 🖼️ |
| `/about` | UI Only | 🖼️ |
| `/contact` | UI Only | 🖼️ |

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **AI**: Genkit 1.x + Gemini 2.5 Flash
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication (Google & Email)
- **UI**: Tailwind CSS + Framer Motion + ShadCN
- **Export**: jsPDF for Certificate Synthesis
