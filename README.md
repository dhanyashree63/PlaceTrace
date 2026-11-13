# PlaceTrace — Intelligent Placement Tracking and Career Management Platform

**TRACK. PREPARE. GET PLACED.**

PlaceTrace is a complete, full-stack intelligent campus placement tracking and career management platform built with **React**, **Django REST Framework**, **FastAPI (ML Service)**, and **PostgreSQL / SQLite**.

---

## 1. Project Overview & Problem Statement

### Problem Statement
Campus placement preparation and recruitment drives are frequently fragmented across static spreadsheets, disconnected study lists, manual resume reviews, and ad-hoc email threads. Students lack a deterministic measure of their placement readiness and skill gaps against real job requirements, while Training & Placement Officers (TPOs) lack unified visibility into cohort eligibility, skill demand, and interview stage progression.

### Solution
**PlaceTrace** unifies student career preparation, ML-powered resume and skill-gap intelligence, automated academic eligibility verification, study planning, mock testing, and placement drive management into a cohesive, role-based platform.

---

## 2. Key Features

- **Deterministic Placement Readiness Engine**: Transparent 8-factor readiness calculation normalized across profile completion, resume score, verified technical skills, DSA roadmap progress, mock test performance, projects, applications, and interview preparation.
- **Interactive Placement Roadmap & Study Planner**: Database-backed curriculum milestones (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`) and categorized daily study tasks (`Coding Practice`, `Revision`, `Mock Tests`, `Interview Preparation`, `Project Work`).
- **Practice & Quizzes + Mock Test Dashboard**: Subject-wise MCQ and coding assessments across 10 core categories (`Java`, `DSA`, `SQL`, `Computer Networks`, `Operating Systems`, `DBMS`, `Aptitude`, `Web Development`, `Python`, `System Design`) with real-time scoring and Recharts topic performance analytics.
- **FastAPI ML Resume & Job Description Intelligence**:
  - **Resume Parsing & Scoring**: Extracts technical skills, evaluates section completeness and quantifiable impact metrics, and identifies strengths and improvement areas.
  - **JD Parsing & Skill Matching**: Combines `scikit-learn` TF-IDF cosine similarity with weighted required/preferred skill taxonomy matching.
  - **Skill Gap Analysis**: Categorizes skills into **You Have** (green), **You Need** (purple), and **High Priority** (amber) with actionable upskilling steps.
- **Automated Job Eligibility & Application Tracker**: Real-time verification of Degree, Branch, CGPA cutoffs, Active Backlogs, and Graduation Year, plus a 5-stage visual application timeline (`Applied` → `Assessment` → `Technical Interview` → `HR Interview` → `Selected / Rejected`).
- **TPO Portal**: Student cohort table (search, filter, sort, pagination), partner company management, job creation with ML JD skill extraction, and applicant stage progression that automatically records placements upon selection.
- **Admin Portal**: User & role management, TPO/Admin invite code generation, system statistics, brute-force lockout monitoring, and immutable security audit logs.
- **9 Real-Time Recharts Visualizations**: Placement trend, applications over time, branch-wise placement, company-wise selection, skill demand, cohort missing skills, application stages funnel, CGPA distribution, and placement rate breakdown.

---

## 3. User Roles (RBAC)

| Role | Capabilities |
| :--- | :--- |
| **STUDENT** | Manage own profile, skills, projects, and resume; run ML resume & skill-gap analysis; track study planner & roadmap; take quizzes/mock tests; apply to eligible jobs; track applications; export own placement data. |
| **TPO** | Access TPO Dashboard; search/filter/sort student profiles; update student placement status; create/edit partner companies; create/publish/close jobs; advance applicant interview stages; view campus analytics. |
| **ADMIN** | Full system administration; manage users and role assignments (with last-admin protection); generate role invite codes; monitor system security and audit logs. |

---

## 4. UI Architecture & Visual Design System

PlaceTrace strictly follows its custom reference design system:

- **Deep Navy**: `#111936` (Landing hero & authentication backdrop)
- **Sidebar Navy**: `#172044` (Persistent desktop sidebar & mobile drawer)
- **Primary Purple**: `#6555F5` (Active navigation, primary buttons, progress fills)
- **Bright Purple**: `#7C5CFF` (Hero accents & hover highlights)
- **Soft Lavender Workspace**: `#F4F5FF` (Main authenticated background)
- **Soft Purple Accent**: `#EEEAFE` (Badges, icon containers, secondary buttons)
- **Card Surface**: `#FFFFFF` with soft elevation shadows and rounded corners
- **Status Palette**: Success `#32B67A`, Warning `#F4B942`, Error `#E55353`
- **Typography**: `Inter` sans-serif with compact dashboard density
- **Icons**: `lucide-react`

---

## 5. Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Recharts, Lucide React, Vitest + React Testing Library
- **Backend**: Python 3.12, Django 5, Django REST Framework, SimpleJWT, django-filter
- **ML Service**: Python 3.12, FastAPI, Pydantic, scikit-learn (TF-IDF & cosine similarity), NumPy, Uvicorn
- **Database**: PostgreSQL 16 (with built-in SQLite support for quick local development)

---

## 6. Placement Readiness Algorithm

Implemented in [`backend/apps/students/readiness.py`](file:///c:/Users/HP/Desktop/PlaceTrace/backend/apps/students/readiness.py):

$$\text{Readiness} = \text{round}\Big(0.12 P_{\text{profile}} + 0.14 P_{\text{resume}} + 0.18 P_{\text{skills}} + 0.16 P_{\text{dsa}} + 0.14 P_{\text{mock}} + 0.12 P_{\text{projects}} + 0.07 P_{\text{apps}} + 0.07 P_{\text{interview}}\Big)$$

Each component $P_i \in [0, 100]$ is normalized deterministically from live PostgreSQL records and updated automatically whenever the student modifies their profile, skills, resume, roadmap, quizzes, projects, study tasks, or job applications.

---

## 7. Database Architecture

PostgreSQL schema organized across modular Django apps:

- `users`: `User`, `InviteCode`, `Notification`, `AuditLog`
- `students`: `StudentProfile`, `Skill`, `StudentSkill`, `Resume`, `ResumeSkill`, `ActivityLog`
- `companies`: `Company`
- `jobs`: `Job`, `JobSkill`, `SavedJob`
- `applications`: `Application`, `ApplicationTimeline`
- `placements`: `Placement`
- `study`: `Topic`, `StudentTopicProgress`, `StudyTask`
- `quizzes`: `Quiz`, `Question`, `QuizAttempt`
- `projects`: `Project`
- `resources`: `Resource`

---

## 8. API Documentation

| Prefix | Endpoints & Purpose |
| :--- | :--- |
| `/api/auth/` | `register/`, `login/`, `logout/`, `token/refresh/`, `verify-email/`, `resend-verification/`, `forgot-password/`, `reset-password/`, `me/`, `notifications/`, `export-data/`, `delete-account/`, `admin/users/`, `admin/invite-codes/`, `admin/audit-logs/` |
| `/api/students/` | `me/` (GET/PATCH), `me/skills/` (GET/POST/PATCH/DELETE), `me/resume/` (GET/POST), `` (TPO student list with search/filter/sort/pagination), `<id>/` |
| `/api/skills/` | `` (GET/POST skill catalog) |
| `/api/companies/` | `` (GET/POST), `<id>/` (GET/PATCH/DELETE) |
| `/api/jobs/` | `` (GET/POST with search, category, location, eligible_only filters), `recommended/`, `<id>/`, `<id>/bookmark/` |
| `/api/applications/` | `` (GET/POST with eligibility verification), `<id>/` (GET/PATCH stage & notes) |
| `/api/placements/` | `` (GET/POST placement offer records) |
| `/api/study/` | `roadmap/`, `roadmap/<id>/`, `tasks/`, `tasks/<id>/` |
| `/api/quizzes/` | ``, `dashboard/`, `<id>/`, `<id>/submit/` |
| `/api/projects/` | ``, `<id>/` |
| `/api/resources/` | `` (GET/POST categorized learning resources) |
| `/api/analytics/` | `` (9 Recharts datasets + TPO & Admin KPIs), `student-dashboard/` |
| `/api/ml/` | `analyze-resume/`, `parse-jd/`, `skill-gap/`, `job-compatibility/` |

---

## 9. Local Setup & Running the Application

### Option A: One-Click Local Full-Stack Runner (Windows)
Run `start-local.bat` or execute:
```bash
agy-node.cmd scripts/build-frontend.cjs
agy-node.cmd scripts/local-server.cjs
```
Then open `http://localhost:5173`.

### Option B: Multi-Service Local Setup

#### 1. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

#### 2. Backend (Django + PostgreSQL)
```bash
cd backend
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py seed_placetrace
python manage.py runserver 0.0.0.0:8000
```

#### 3. FastAPI ML Service
```bash
cd ml-service
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

#### 4. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

---

## 10. Testing

### Backend Tests
```bash
cd backend
pytest
```

### ML Service Tests
```bash
cd ml-service
PYTHONPATH=. pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

## 11. Security Controls

- **Authentication & Brute-Force Protection**: PBKDF2 password hashing, JWT access/refresh token rotation & blacklisting, and automatic 15-minute account lockout after 5 failed login attempts.
- **Scoped Rate Limiting**: Dedicated throttles on login, email verification, email resend, password reset, account deletion, data export, resume analysis, JD parsing, and skill-gap analysis.
- **File Upload Validation**: Strict validation of file extension (`.pdf`, `.docx`, `.txt`), MIME type, 5 MB max size, and safe filenames (`backend/apps/students/validators.py`). Never executes uploaded files.
- **Privacy & Last-Admin Protection**: Students can only access or export their own data; account deletion requires password confirmation and blocks deletion or demotion of the last active administrator.
