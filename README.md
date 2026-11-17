# PlaceTrace 🚀

> **Intelligent Campus Placement & Career Management Platform**  
> *Track readiness. Bridge skill gaps. Land dream offers.*

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Tailwind-6555F5?logo=react&logoColor=white)](https://react.dev/)
[![Django](https://img.shields.io/badge/Backend-Django%205%20REST-092E20?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![FastAPI](https://img.shields.io/badge/ML%20Service-FastAPI%20%2B%20scikit--learn-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-32B67A)](LICENSE)

---

## 📌 Overview

**PlaceTrace** is a full-stack, AI-assisted platform designed to streamline campus placements for colleges. It replaces scattered spreadsheets and manual tracking with:

- **Students:** Deterministic 8-factor Placement Readiness Score, ML-powered resume & job-description match analysis, and structured DSA/full-stack study roadmaps.
- **TPOs (Placement Cell):** Automated 5-point academic eligibility verification, company drive management, applicant pipeline tracking, and live campus hiring analytics.
- **Administrators:** Role-based governance (RBAC), invite codes, and security audit logs.

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| 🎯 **Placement Readiness Engine** | Deterministic score (0–100%) normalized across profile, resume, DSA progress, mock test scores, and project portfolio. |
| 📄 **ML Resume & Skill-Gap Analysis** | TF-IDF bigram similarity + 36-skill taxonomy extraction. Automatically highlights *You Have*, *You Need*, and *High-Priority* skills for any Job Description. |
| ✅ **Automated Eligibility Checks** | Real-time verification of Degree, Branch, CGPA cutoff, Active Backlogs, and Batch Year before application submission. |
| 📊 **5-Stage Application Pipeline** | Transparent visual progression: `Applied` ➔ `Assessment` ➔ `Technical Interview` ➔ `HR Round` ➔ `Offer Accepted`. |
| 📈 **Real-Time Campus Analytics** | 9 interactive Recharts visualizations: placement rates, CTC distribution, branch trends, and in-demand skills. |
| 🔒 **Enterprise Security** | JWT token rotation, PBKDF2 hashing, 5-attempt/15-min brute-force lockout, and scoped API rate limiting. |

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Core Backend:** Python 3.12, Django 5, Django REST Framework, SimpleJWT
- **ML & NLP Microservice:** FastAPI, scikit-learn (TF-IDF & Cosine Similarity), NumPy, Pydantic
- **Database:** PostgreSQL 16 (production) / SQLite (zero-config local development)

---

## 🚀 Quick Start (Run Locally)

### Option 1: One-Click Local Full-Stack Runner (Windows)
```bash
# 1. Clone repository
git clone https://github.com/dhanyashree63/PlaceTrace.git
cd PlaceTrace

# 2. Run local bundle & server
start-local.bat
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

### Option 2: Standard Multi-Service Setup

#### 1. Backend (Django API)
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

#### 2. ML Microservice (FastAPI)
```bash
cd ml-service
pip install -r requirements.txt
uvicorn app.main:app --port 8001 --reload
```

#### 3. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Demo Login Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Student** | `dhanyashree@placetrace.edu` *(or `rahul@college.edu`)* | `Student@12345` *(or `Password@123`)* |
| **TPO (Placement Officer)** | `tpo@placetrace.edu` *(or `tpo@college.edu`)* | `Tpo@12345` *(or `Password@123`)* |
| **Administrator** | `admin@placetrace.edu` | `Admin@12345` *(or `Password@123`)* |

---

## 🏗️ Architecture

```
[ React 18 Frontend ] ──( HTTPS / JWT )──> [ Django 5 REST Backend ] ──> [ PostgreSQL / SQLite ]
                                                     │
                                            ( Internal API Key )
                                                     ▼
                                          [ FastAPI ML Microservice ]
                                          ( TF-IDF & Skill Taxonomy )
```

---

## 👩‍💻 Author & Contribution

Developed by **Dhanyashree N**  
- **GitHub:** [@dhanyashree63](https://github.com/dhanyashree63)
- **Project Repository:** [PlaceTrace](https://github.com/dhanyashree63/PlaceTrace)
