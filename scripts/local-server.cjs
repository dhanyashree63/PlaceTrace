const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { DatabaseSync } = require("node:sqlite");

const ROOT_DIR = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "frontend", "dist");
const DB_PATH = path.join(ROOT_DIR, "backend", "placetrace_local.sqlite3");

const db = new DatabaseSync(DB_PATH);

function hashPassword(password) {
  return crypto.createHash("sha256").update(`placetrace_salt_${password}`).digest("hex");
}

function createToken(user) {
  const payload = Buffer.from(
    JSON.stringify({ id: user.id, email: user.email, role: user.role, ts: Date.now() })
  ).toString("base64url");
  const sig = crypto
    .createHmac("sha256", "placetrace-local-jwt-secret")
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

function verifyToken(token) {
  if (!token || !token.includes(".")) return null;
  try {
    const [payload] = token.split(".");
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

// Initialize & Seed SQLite Database
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'STUDENT',
      avatar_url TEXT DEFAULT '',
      is_active INTEGER DEFAULT 1,
      is_email_verified INTEGER DEFAULT 1,
      verification_token TEXT DEFAULT '',
      reset_password_token TEXT DEFAULT '',
      failed_login_attempts INTEGER DEFAULT 0,
      locked_until TEXT DEFAULT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS invite_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL DEFAULT 'TPO',
      department TEXT DEFAULT 'Placement Cell',
      is_used INTEGER DEFAULT 0,
      used_by_email TEXT DEFAULT '',
      created_by_email TEXT DEFAULT 'admin@placetrace.edu',
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      notification_type TEXT DEFAULT 'SYSTEM',
      link TEXT DEFAULT '/dashboard',
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_email TEXT NOT NULL,
      action TEXT NOT NULL,
      target_model TEXT DEFAULT '',
      target_id TEXT DEFAULT '',
      details TEXT DEFAULT '{}',
      ip_address TEXT DEFAULT '127.0.0.1',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      category TEXT DEFAULT 'PROGRAMMING'
    );

    CREATE TABLE IF NOT EXISTS student_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT UNIQUE NOT NULL,
      usn TEXT UNIQUE NOT NULL,
      college_name TEXT DEFAULT 'RNSIT',
      branch TEXT DEFAULT 'CSE',
      cgpa REAL DEFAULT 8.50,
      active_backlogs INTEGER DEFAULT 0,
      graduation_year INTEGER DEFAULT 2027,
      phone TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      linkedin_url TEXT DEFAULT '',
      github_url TEXT DEFAULT '',
      portfolio_url TEXT DEFAULT '',
      preferred_roles TEXT DEFAULT '[]',
      preferred_locations TEXT DEFAULT '[]',
      placement_status TEXT DEFAULT 'UNPLACED',
      readiness_score INTEGER DEFAULT 78,
      readiness_trend INTEGER DEFAULT 5,
      readiness_breakdown TEXT DEFAULT '{}',
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS student_skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      skill_id INTEGER NOT NULL,
      proficiency TEXT DEFAULT 'INTERMEDIATE',
      is_verified INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, skill_id)
    );

    CREATE TABLE IF NOT EXISTS resumes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      file_size INTEGER DEFAULT 240000,
      mime_type TEXT DEFAULT 'application/pdf',
      raw_text TEXT DEFAULT '',
      status TEXT DEFAULT 'ANALYZED',
      resume_score INTEGER DEFAULT 82,
      strengths TEXT DEFAULT '[]',
      improvement_areas TEXT DEFAULT '[]',
      section_scores TEXT DEFAULT '{}',
      extracted_skills_json TEXT DEFAULT '[]',
      is_current INTEGER DEFAULT 1,
      uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
      analyzed_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      activity_type TEXT DEFAULT 'PROFILE',
      title TEXT NOT NULL,
      metadata TEXT DEFAULT '{}',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      industry TEXT DEFAULT 'Enterprise Software',
      website TEXT DEFAULT '',
      careers_url TEXT DEFAULT '',
      headquarters TEXT DEFAULT 'Bengaluru',
      description TEXT DEFAULT '',
      logo_color TEXT DEFAULT '#6555F5',
      status TEXT DEFAULT 'ACTIVE',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      category TEXT DEFAULT 'SOFTWARE_DEVELOPMENT',
      location TEXT DEFAULT 'Bengaluru',
      employment_type TEXT DEFAULT 'Full Time',
      ctc_lpa REAL DEFAULT 18.0,
      about_role TEXT DEFAULT '',
      description TEXT DEFAULT '',
      responsibilities TEXT DEFAULT '[]',
      syllabus TEXT DEFAULT '[]',
      interview_tips TEXT DEFAULT '[]',
      allowed_degrees TEXT DEFAULT '["B.E / B.Tech"]',
      allowed_branches TEXT DEFAULT '["CSE","ISE","ECE"]',
      min_cgpa REAL DEFAULT 7.0,
      max_active_backlogs INTEGER DEFAULT 0,
      graduation_year INTEGER DEFAULT 2027,
      deadline TEXT DEFAULT '2026-12-15',
      apply_link TEXT DEFAULT '',
      required_skills_json TEXT DEFAULT '[]',
      preferred_skills_json TEXT DEFAULT '[]',
      status TEXT DEFAULT 'PUBLISHED',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS saved_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      job_id INTEGER NOT NULL,
      UNIQUE(student_id, job_id)
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      job_id INTEGER NOT NULL,
      stage TEXT DEFAULT 'APPLIED',
      match_score INTEGER DEFAULT 82,
      is_eligible_at_apply INTEGER DEFAULT 1,
      notes TEXT DEFAULT '',
      applied_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, job_id)
    );

    CREATE TABLE IF NOT EXISTS placements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      company_id INTEGER NOT NULL,
      job_id INTEGER,
      role_offered TEXT NOT NULL,
      package_lpa REAL DEFAULT 12.0,
      status TEXT DEFAULT 'ACCEPTED',
      placed_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT UNIQUE NOT NULL,
      category TEXT DEFAULT 'Core Curriculum',
      description TEXT DEFAULT '',
      topic_order INTEGER DEFAULT 1,
      estimated_hours INTEGER DEFAULT 16
    );

    CREATE TABLE IF NOT EXISTS student_topic_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      topic_id INTEGER NOT NULL,
      status TEXT DEFAULT 'NOT_STARTED',
      completed_at TEXT DEFAULT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, topic_id)
    );

    CREATE TABLE IF NOT EXISTS study_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      category TEXT DEFAULT 'Coding Practice',
      scheduled_date TEXT NOT NULL,
      scheduled_time TEXT DEFAULT '7:00 PM',
      priority TEXT DEFAULT 'HIGH',
      status TEXT DEFAULT 'PENDING',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT UNIQUE NOT NULL,
      category TEXT DEFAULT 'DSA',
      quiz_type TEXT DEFAULT 'MOCK_TEST',
      difficulty TEXT DEFAULT 'Intermediate',
      duration_minutes INTEGER DEFAULT 20,
      description TEXT DEFAULT '',
      questions_json TEXT DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      quiz_id INTEGER NOT NULL,
      score INTEGER DEFAULT 0,
      total_questions INTEGER DEFAULT 3,
      percentage INTEGER DEFAULT 0,
      answers_submitted TEXT DEFAULT '{}',
      is_completed INTEGER DEFAULT 1,
      attempted_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      technologies TEXT DEFAULT '[]',
      github_url TEXT DEFAULT '',
      live_url TEXT DEFAULT '',
      role TEXT DEFAULT 'Full Stack Developer',
      status TEXT DEFAULT 'COMPLETED',
      start_date TEXT DEFAULT '2026-08-01',
      completion_date TEXT DEFAULT '2026-11-10',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      resource_type TEXT DEFAULT 'Handbook',
      external_link TEXT NOT NULL,
      difficulty TEXT DEFAULT 'Intermediate',
      category TEXT DEFAULT 'DSA',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const existingUsers = db.prepare("SELECT COUNT(*) as cnt FROM users").get().cnt;
  if (existingUsers > 0) return;

  console.log("Seeding local SQLite database with PlaceTrace demo data...");

  // 1. Skills
  const skillSeed = [
    ["Java", "PROGRAMMING"],
    ["DSA", "CORE_CS"],
    ["Problem Solving", "CORE_CS"],
    ["System Design", "CORE_CS"],
    ["HTML", "FRONTEND"],
    ["CSS", "FRONTEND"],
    ["JavaScript", "PROGRAMMING"],
    ["TypeScript", "PROGRAMMING"],
    ["React", "FRONTEND"],
    ["Python", "PROGRAMMING"],
    ["Django", "BACKEND"],
    ["FastAPI", "BACKEND"],
    ["SQL", "DATABASE"],
    ["PostgreSQL", "DATABASE"],
    ["Git", "TOOLS"],
    ["Docker", "DEVOPS"],
    ["Linux", "DEVOPS"],
    ["AWS", "DEVOPS"],
    ["Operating Systems", "CORE_CS"],
    ["DBMS", "CORE_CS"],
    ["Computer Networks", "CORE_CS"],
    ["Machine Learning", "DATA_SCIENCE"],
  ];
  const insertSkill = db.prepare("INSERT OR IGNORE INTO skills (name, category) VALUES (?, ?)");
  for (const [n, c] of skillSeed) insertSkill.run(n, c);

  // 2. Topics
  const topicSeed = [
    [1, "Java Fundamentals", "Core Programming", "OOPs, Collections, Exception Handling, Streams & JVM internals", 16],
    [2, "Java DSA", "Data Structures & Algorithms", "Arrays, Linked Lists, Trees, Graphs, Dynamic Programming & Sliding Window", 40],
    [3, "Full Stack Development", "Web Engineering", "React UI architecture, Django REST APIs, JWT Auth & state management", 35],
    [4, "SQL & Databases", "Database Systems", "Complex joins, indexing, query optimization, ACID transactions & PostgreSQL", 18],
    [5, "Git, Docker & Deployment", "DevOps & Cloud", "Git workflows, multi-container Docker Compose, Nginx & Caddy HTTPS", 14],
    [6, "Operating Systems & DBMS", "CS Fundamentals", "Process scheduling, deadlocks, virtual memory & normalization", 20],
    [7, "Computer Networks", "CS Fundamentals", "OSI layers, TCP/IP handshake, DNS, HTTP/2 & TLS security", 14],
    [8, "System Design & Interviews", "Architecture", "Load balancing, caching, rate limiting, sharding & mock interviews", 22],
  ];
  const insertTopic = db.prepare(
    "INSERT OR IGNORE INTO topics (topic_order, title, category, description, estimated_hours) VALUES (?, ?, ?, ?, ?)"
  );
  for (const t of topicSeed) insertTopic.run(...t);

  // 3. Users
  const insertUser = db.prepare(
    "INSERT INTO users (id, email, full_name, password_hash, role, is_email_verified) VALUES (?, ?, ?, ?, ?, 1)"
  );
  const studentId = "usr-dhanyashree-01";
  const tpoId = "usr-tpo-01";
  const adminId = "usr-admin-01";

  insertUser.run(studentId, "dhanyashree@placetrace.edu", "Dhanyashree N", hashPassword("Student@12345"), "STUDENT");
  insertUser.run(tpoId, "tpo@placetrace.edu", "Prof. Meenakshi Sundaram", hashPassword("Tpo@12345"), "TPO");
  insertUser.run(adminId, "admin@placetrace.edu", "Dr. Rajeshwar Rao", hashPassword("Admin@12345"), "ADMIN");

  // Main Student Profile
  db.prepare(`
    INSERT INTO student_profiles (
      user_id, usn, college_name, branch, cgpa, active_backlogs, graduation_year,
      phone, bio, github_url, linkedin_url, portfolio_url, preferred_roles, preferred_locations, placement_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    studentId,
    "1RN23CS042",
    "RNSIT",
    "CSE",
    9.35,
    0,
    2027,
    "+91 98450 12345",
    "Final-year Computer Science student passionate about Full-Stack Engineering, Java DSA, and scalable distributed systems.",
    "https://github.com/dhanyashree-n",
    "https://linkedin.com/in/dhanyashree-n",
    "https://dhanyashree.dev",
    JSON.stringify(["Software Development Engineer", "Full Stack Engineer"]),
    JSON.stringify(["Bengaluru", "Hyderabad"]),
    "UNPLACED"
  );

  const mainProfileId = db.prepare("SELECT id FROM student_profiles WHERE user_id = ?").get(studentId).id;

  // Assign skills to Dhanyashree
  const dhanyaSkills = [
    ["Java", "EXPERT"],
    ["DSA", "ADVANCED"],
    ["HTML", "ADVANCED"],
    ["CSS", "ADVANCED"],
    ["JavaScript", "ADVANCED"],
    ["React", "ADVANCED"],
    ["Python", "ADVANCED"],
    ["Django", "ADVANCED"],
    ["SQL", "ADVANCED"],
    ["Git", "ADVANCED"],
    ["Linux", "INTERMEDIATE"],
    ["Problem Solving", "ADVANCED"],
  ];
  for (const [sName, prof] of dhanyaSkills) {
    const sk = db.prepare("SELECT id FROM skills WHERE name = ?").get(sName);
    if (sk) {
      db.prepare("INSERT OR IGNORE INTO student_skills (student_id, skill_id, proficiency) VALUES (?, ?, ?)").run(
        mainProfileId,
        sk.id,
        prof
      );
    }
  }

  // Roadmap progress
  const allTopics = db.prepare("SELECT id, topic_order FROM topics ORDER BY topic_order").all();
  for (const t of allTopics) {
    let st = "NOT_STARTED";
    if ([1, 2, 6, 7].includes(t.topic_order)) st = "COMPLETED";
    else if (t.topic_order === 3) st = "IN_PROGRESS";
    db.prepare("INSERT OR IGNORE INTO student_topic_progress (student_id, topic_id, status) VALUES (?, ?, ?)").run(
      mainProfileId,
      t.id,
      st
    );
  }

  // Peer students for TPO table & Analytics
  const peers = [
    ["usr-peer-1", "arjun@placetrace.edu", "Arjun Sharma", "1RN23CS018", "CSE", 9.12, "PLACED", ["Java", "DSA", "SQL", "Docker"]],
    ["usr-peer-2", "priya@placetrace.edu", "Priya Nair", "1RN23IS029", "ISE", 8.85, "PLACED", ["Python", "Machine Learning", "SQL", "FastAPI"]],
    ["usr-peer-3", "rohan@placetrace.edu", "Rohan Kulkarni", "1RN23EC051", "ECE", 8.40, "INTERNSHIP", ["DSA", "Python", "Linux"]],
    ["usr-peer-4", "sneha@placetrace.edu", "Sneha Verma", "1RN23AI011", "AIML", 9.05, "PLACED", ["Python", "Machine Learning", "SQL", "React", "AWS"]],
    ["usr-peer-5", "karthik@placetrace.edu", "Karthik Hegde", "1RN23CS077", "CSE", 7.82, "UNPLACED", ["Java", "HTML", "CSS", "SQL"]],
  ];
  for (const [uid, em, fn, usn, br, cg, pst, skList] of peers) {
    insertUser.run(uid, em, fn, hashPassword("Student@12345"), "STUDENT");
    db.prepare(
      "INSERT INTO student_profiles (user_id, usn, college_name, branch, cgpa, placement_status, readiness_score) VALUES (?, ?, 'RNSIT', ?, ?, ?, ?)"
    ).run(uid, usn, br, cg, pst, pst === "PLACED" ? 84 : 70);
    const pid = db.prepare("SELECT id FROM student_profiles WHERE user_id = ?").get(uid).id;
    for (const sName of skList) {
      const sk = db.prepare("SELECT id FROM skills WHERE name = ?").get(sName);
      if (sk) {
        db.prepare("INSERT OR IGNORE INTO student_skills (student_id, skill_id, proficiency) VALUES (?, ?, 'INTERMEDIATE')").run(
          pid,
          sk.id
        );
      }
    }
  }

  // 4. Companies & Jobs
  const companiesSeed = [
    ["Oracle", "Cloud & Database Systems", "https://www.oracle.com", "Bengaluru", "#C74634", "Global leader in enterprise cloud infrastructure and relational database engines."],
    ["Google", "Internet & Cloud Platforms", "https://careers.google.com", "Bengaluru", "#4285F4", "Organizing the world's information and building planetary-scale distributed systems."],
    ["Atlassian", "Developer Collaboration Tools", "https://www.atlassian.com", "Bengaluru", "#0052CC", "Creators of Jira, Confluence, Bitbucket, and modern agile engineering tools."],
    ["Microsoft", "Cloud & AI Platforms", "https://careers.microsoft.com", "Hyderabad", "#00A4EF", "Empowering every developer and enterprise with Azure and AI."],
    ["Stripe", "Financial Infrastructure", "https://stripe.com", "Bengaluru", "#635BFF", "Economic infrastructure and payment APIs for the internet."],
    ["TCS", "IT Services & Consulting", "https://www.tcs.com", "Bengaluru", "#6555F5", "Global leader in digital transformation and enterprise engineering."],
  ];
  for (const [name, ind, web, hq, col, desc] of companiesSeed) {
    db.prepare(
      "INSERT INTO companies (name, industry, website, careers_url, headquarters, logo_color, description) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(name, ind, web, web, hq, col, desc);
  }

  const getCompId = (name) => db.prepare("SELECT id FROM companies WHERE name = ?").get(name).id;

  const jobsSeed = [
    {
      company_id: getCompId("Oracle"),
      title: "Software Development Engineer",
      category: "SOFTWARE_DEVELOPMENT",
      location: "Bengaluru",
      employment_type: "Full Time",
      ctc_lpa: 19.5,
      min_cgpa: 7.0,
      allowed_branches: ["CSE", "ISE", "ECE"],
      about_role: "Join Oracle Cloud Infrastructure (OCI) to architect and scale high-throughput distributed services and database engines.",
      description: "Design resilient backend microservices in Java and Python, optimize SQL query execution plans, and collaborate on cloud-native deployments using Docker.",
      responsibilities: [
        "Design, implement, and maintain low-latency backend services in Java and Python.",
        "Write clean, well-tested code and participate in architecture & system design reviews.",
        "Optimize relational database schemas and SQL queries for high concurrency.",
        "Collaborate with cross-functional engineering teams on CI/CD and containerization.",
      ],
      syllabus: [
        "Round 1: Online Coding & DSA Assessment (Arrays, Trees, Graphs, DP, SQL Queries)",
        "Round 2: Core Technical Interview (Java Internals, OOPs, DBMS, Operating Systems)",
        "Round 3: System Design & Architecture (Microservices, Caching, Rate Limiting)",
        "Round 4: Managerial & HR Fit Discussion",
      ],
      interview_tips: [
        "Revise Java concurrency, HashMap internals, and SQL indexing strategies.",
        "Practice medium-to-hard graph and dynamic programming problems.",
        "Be ready to walk through the architecture of your full-stack projects.",
      ],
      req: ["Java", "DSA", "Problem Solving", "SQL", "React", "Git"],
      pref: ["Docker", "System Design", "AWS"],
    },
    {
      company_id: getCompId("Google"),
      title: "Software Engineer - University Graduate",
      category: "SOFTWARE_DEVELOPMENT",
      location: "Bengaluru",
      employment_type: "Full Time",
      ctc_lpa: 32.0,
      min_cgpa: 8.0,
      allowed_branches: ["CSE", "ISE", "AIML"],
      about_role: "Build next-generation distributed search, cloud, and AI infrastructure serving billions of users.",
      description: "Solve large-scale algorithmic and systems engineering challenges using Java, Python, and distributed systems.",
      responsibilities: [
        "Develop scalable backend systems and algorithms for high-availability services.",
        "Analyze time/space complexity and optimize distributed data pipelines.",
      ],
      syllabus: [
        "Online Coding Challenge (2 Advanced DSA problems in 60 minutes)",
        "Technical Interviews 1 & 2 (Algorithms, Graphs, Trees, Dynamic Programming)",
        "Googliness & Leadership Interview",
      ],
      interview_tips: [
        "Communicate time and space complexity clearly before writing code.",
      ],
      req: ["Java", "DSA", "Problem Solving", "Python", "Operating Systems"],
      pref: ["System Design", "Docker", "Linux"],
    },
    {
      company_id: getCompId("Atlassian"),
      title: "Full Stack Software Engineer",
      category: "SOFTWARE_DEVELOPMENT",
      location: "Bengaluru",
      employment_type: "Full Time",
      ctc_lpa: 26.5,
      min_cgpa: 7.5,
      allowed_branches: ["CSE", "ISE", "ECE", "AIML"],
      about_role: "Build rich, responsive web experiences and resilient APIs for millions of agile software teams worldwide.",
      description: "Work across React, JavaScript, Java/Django REST APIs, and PostgreSQL to ship high-impact product features.",
      responsibilities: [
        "Build accessible, high-performance frontend components in React and JavaScript.",
        "Design RESTful APIs and optimize PostgreSQL queries.",
      ],
      syllabus: [
        "Browser Coding & UI Architecture Round (React, State Management)",
        "DSA & Code Design Round",
        "System Design & Values Interview",
      ],
      interview_tips: ["Focus on modular code organization and clean API boundaries."],
      req: ["React", "JavaScript", "HTML", "CSS", "Java", "SQL", "Git"],
      pref: ["Docker", "AWS", "System Design"],
    },
    {
      company_id: getCompId("Microsoft"),
      title: "Data & Applied Scientist",
      category: "DATA_SCIENCE",
      location: "Hyderabad",
      employment_type: "Full Time",
      ctc_lpa: 28.0,
      min_cgpa: 8.0,
      allowed_branches: ["CSE", "ISE", "AIML"],
      about_role: "Develop intelligent ML models, NLP pipelines, and analytical systems powering Azure & Copilot experiences.",
      description: "Combine Python, Machine Learning, SQL, and FastAPI microservices to deploy production inference pipelines.",
      responsibilities: [
        "Train, evaluate, and deploy NLP and classification models using Python & scikit-learn.",
        "Expose low-latency ML inference services via FastAPI.",
      ],
      syllabus: [
        "Coding & ML Fundamentals Assessment",
        "Applied ML & NLP System Design Round",
        "Leadership Round",
      ],
      interview_tips: ["Understand TF-IDF, cosine similarity, and evaluation metrics."],
      req: ["Python", "Machine Learning", "SQL", "DSA", "FastAPI"],
      pref: ["Docker", "AWS", "PostgreSQL"],
    },
    {
      company_id: getCompId("Stripe"),
      title: "Associate Product Manager",
      category: "PRODUCT",
      location: "Bengaluru",
      employment_type: "Full Time",
      ctc_lpa: 24.0,
      min_cgpa: 7.5,
      allowed_branches: ["CSE", "ISE", "ECE", "AIML"],
      about_role: "Shape developer-first payment APIs and global checkout products.",
      description: "Partner with engineering and design teams to define product roadmaps and analyze funnel metrics in SQL.",
      responsibilities: ["Define product specifications and developer API ergonomics."],
      syllabus: ["Product Sense Case Study", "SQL & Analytical Thinking Round"],
      interview_tips: ["Demonstrate empathy for developers and strong analytical rigor."],
      req: ["SQL", "Problem Solving", "Python", "Git"],
      pref: ["System Design", "React"],
    },
    {
      company_id: getCompId("TCS"),
      title: "Digital Systems & Analytics Engineer",
      category: "ANALYTICS",
      location: "Bengaluru",
      employment_type: "Full Time",
      ctc_lpa: 9.0,
      min_cgpa: 6.5,
      allowed_branches: ["CSE", "ISE", "ECE", "AIML", "EEE", "MECH"],
      about_role: "Build enterprise analytics dashboards, data pipelines, and full-stack business portals.",
      description: "Develop modern web applications and enterprise SQL analytics solutions for global clients.",
      responsibilities: ["Develop full-stack modules in Java, Python, React, and SQL."],
      syllabus: ["TCS NQT", "Technical Interview", "HR Interview"],
      interview_tips: ["Be thorough with SQL joins, normalization, and your final-year project."],
      req: ["Java", "Python", "SQL", "HTML", "CSS", "DSA"],
      pref: ["React", "Django", "Git"],
    },
  ];

  for (const j of jobsSeed) {
    db.prepare(`
      INSERT INTO jobs (
        company_id, title, category, location, employment_type, ctc_lpa,
        about_role, description, responsibilities, syllabus, interview_tips,
        allowed_branches, min_cgpa, deadline, apply_link, required_skills_json, preferred_skills_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '2026-12-15', 'https://careers.example.com', ?, ?)
    `).run(
      j.company_id,
      j.title,
      j.category,
      j.location,
      j.employment_type,
      j.ctc_lpa,
      j.about_role,
      j.description,
      JSON.stringify(j.responsibilities),
      JSON.stringify(j.syllabus),
      JSON.stringify(j.interview_tips),
      JSON.stringify(j.allowed_branches),
      j.min_cgpa,
      JSON.stringify(j.req),
      JSON.stringify(j.pref)
    );
  }

  // 5. Projects
  const projectsSeed = [
    [
      "PlaceTrace",
      "Intelligent placement tracking and career management platform with ML resume parsing, skill-gap analysis, and real-time readiness analytics.",
      ["React", "Django", "PostgreSQL", "FastAPI", "Docker"],
      "https://github.com/dhanyashree-n/placetrace",
      "https://placetrace.edu",
      "Lead Full Stack Developer",
    ],
    [
      "CloudSync Distributed Cache",
      "High-throughput LRU caching service in Java with consistent hashing, TCP socket protocol, and latency monitoring.",
      ["Java", "DSA", "Linux", "Docker", "Git"],
      "https://github.com/dhanyashree-n/cloudsync-cache",
      "https://cloudsync-demo.dev",
      "Backend Systems Developer",
    ],
    [
      "DevPulse Code Reviewer",
      "Automated pull-request static analyzer using Python, Django REST Framework, and React dashboard reducing review turnaround by 40%.",
      ["Python", "Django", "React", "SQL", "Git"],
      "https://github.com/dhanyashree-n/devpulse",
      "https://devpulse.dev",
      "Full Stack Engineer",
    ],
  ];
  for (const [title, desc, techs, gh, live, role] of projectsSeed) {
    db.prepare(
      "INSERT INTO projects (student_id, title, description, technologies, github_url, live_url, role) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(mainProfileId, title, desc, JSON.stringify(techs), gh, live, role);
  }

  // 6. Resume
  db.prepare(`
    INSERT INTO resumes (
      student_id, file_name, raw_text, status, resume_score, strengths, improvement_areas, section_scores, extracted_skills_json
    ) VALUES (?, ?, ?, 'ANALYZED', 82, ?, ?, ?, ?)
  `).run(
    mainProfileId,
    "Dhanyashree_N_Resume_2026.pdf",
    "Dhanyashree N\nB.E in Computer Science & Engineering, RNSIT | CGPA: 9.35\nSkills: Java, Python, SQL, React, Django, DSA, Git\nProjects: PlaceTrace, CloudSync Distributed Cache, DevPulse.",
    JSON.stringify([
      "Strong Java knowledge",
      "Good project experience",
      "Solid full-stack skill coverage (Java, Python, SQL, React, Django)",
    ]),
    JSON.stringify([
      "Add measurable project impact",
      "Improve system-design section",
      "Highlight cloud deployment & containerization tools (Docker, AWS)",
    ]),
    JSON.stringify({ skills: 88, projects: 86, impact: 78, experience: 76, education: 95 }),
    JSON.stringify(["Java", "Python", "SQL", "React", "Django", "DSA", "Git"])
  );

  // 7. Study Tasks
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const dayAfterStr = new Date(Date.now() + 172800000).toISOString().split("T")[0];
  const tasksSeed = [
    ["DSA Practice", "Coding Practice", todayStr, "7:00 PM", "HIGH", "PENDING"],
    ["React Basics Revision", "Revision Tasks", tomorrowStr, "8:00 AM", "MEDIUM", "PENDING"],
    ["Take Mock Test #2", "Mock Tests", dayAfterStr, "10:00 AM", "HIGH", "PENDING"],
    ["SQL Indexing Deep Dive", "Study Tasks", todayStr, "5:00 PM", "MEDIUM", "COMPLETED"],
  ];
  for (const [title, cat, dt, tm, prio, st] of tasksSeed) {
    db.prepare(
      "INSERT INTO study_tasks (student_id, title, category, scheduled_date, scheduled_time, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(mainProfileId, title, cat, dt, tm, prio, st);
  }

  // 8. Quizzes & Attempts
  const quizzesSeed = [
    [
      "Java Core & Multithreading Mock Test",
      "Java",
      "MOCK_TEST",
      "Intermediate",
      20,
      "Assess your command of JVM memory model, Collections, Streams, and concurrency.",
      [
        {
          id: 1,
          prompt: "Which collection in Java guarantees O(1) average lookup and preserves insertion order?",
          options: ["HashMap", "LinkedHashMap", "TreeMap", "ConcurrentSkipListMap"],
          correct_index: 1,
          explanation: "LinkedHashMap maintains a doubly-linked list across entries while providing O(1) hash lookup.",
        },
        {
          id: 2,
          prompt: "Which keyword ensures visibility of variable changes across threads in Java?",
          options: ["transient", "volatile", "serializable", "native"],
          correct_index: 1,
          explanation: "The volatile keyword guarantees reads and writes go directly to main memory.",
        },
      ],
      90,
    ],
    [
      "DSA Trees, Graphs & DP Challenge",
      "DSA",
      "CODING",
      "Advanced",
      30,
      "Core algorithmic problem solving covering shortest paths, tree traversals, and dynamic programming.",
      [
        {
          id: 10,
          prompt: "What is the time complexity of Dijkstra's algorithm using a binary min-heap on V vertices and E edges?",
          options: ["O(V^2)", "O((V + E) log V)", "O(V * E)", "O(E log E + V^2)"],
          correct_index: 1,
          explanation: "With an adjacency list and min-priority queue, Dijkstra runs in O((V + E) log V).",
        },
        {
          id: 11,
          prompt: "Which traversal of a Binary Search Tree (BST) produces elements in sorted ascending order?",
          options: ["Pre-order", "In-order", "Post-order", "Level-order"],
          correct_index: 1,
          explanation: "In-order traversal visits Left -> Root -> Right, yielding sorted order for any BST.",
        },
      ],
      85,
    ],
    [
      "SQL & PostgreSQL Optimization Quiz",
      "SQL",
      "MCQ",
      "Intermediate",
      15,
      "Test your mastery of window functions, B-tree indexes, ACID properties, and query plans.",
      [
        {
          id: 20,
          prompt: "Which SQL clause filters groups created by GROUP BY?",
          options: ["WHERE", "HAVING", "QUALIFY", "DISTINCT"],
          correct_index: 1,
          explanation: "HAVING filters aggregated groups after GROUP BY.",
        },
      ],
      92,
    ],
    [
      "System Design & Scalable Architecture",
      "System Design",
      "MOCK_TEST",
      "Advanced",
      25,
      "Load balancers, consistent hashing, CAP theorem, rate limiting, and database sharding.",
      [
        {
          id: 30,
          prompt: "In the CAP theorem, during a network partition (P), a distributed store must choose between:",
          options: ["Latency & Throughput", "Consistency & Availability", "Sharding & Replication", "SQL & NoSQL"],
          correct_index: 1,
          explanation: "During a partition, a distributed system trades off Consistency (C) vs Availability (A).",
        },
      ],
      80,
    ],
  ];

  for (const [title, cat, qType, diff, dur, desc, qs, scorePct] of quizzesSeed) {
    const info = db
      .prepare(
        "INSERT INTO quizzes (title, category, quiz_type, difficulty, duration_minutes, description, questions_json) VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
      .run(title, cat, qType, diff, dur, desc, JSON.stringify(qs));
    db.prepare(
      "INSERT INTO quiz_attempts (student_id, quiz_id, score, total_questions, percentage) VALUES (?, ?, ?, ?, ?)"
    ).run(mainProfileId, info.lastInsertRowid, qs.length, qs.length, scorePct);
  }

  // 9. Resources
  const resourcesSeed = [
    ["Java & JVM Deep Dive Handbook", "Comprehensive guide to Java 21, Collections, Concurrency, and JVM garbage collection.", "Handbook", "https://dev.java/learn/", "Intermediate", "Java"],
    ["Striver's A2Z DSA Placement Sheet", "Structured 150-problem roadmap covering arrays, graphs, trees, and dynamic programming.", "Practice Sheet", "https://takeuforward.org/", "Intermediate", "DSA"],
    ["PostgreSQL Indexing & Query Tuning", "Practical reference on B-Tree indexes, EXPLAIN ANALYZE, joins, and transactions.", "Documentation", "https://www.postgresql.org/docs/", "Intermediate", "SQL"],
    ["Full-Stack React & Django Architecture", "End-to-end production guide for building JWT-authenticated React + Django REST applications.", "Guide", "https://www.django-rest-framework.org/", "Intermediate", "Web Development"],
    ["System Design Primer for Placements", "Visual walkthrough of load balancers, caching, message queues, and rate limiters.", "Handbook", "https://github.com/donnemartin/system-design-primer", "Advanced", "Interview Preparation"],
    ["Operating Systems Three Easy Pieces", "Core concepts in virtualization, concurrency, deadlocks, and persistence.", "Handbook", "https://pages.cs.wisc.edu/~remzi/OSTEP/", "Intermediate", "Operating Systems"],
  ];
  for (const r of resourcesSeed) {
    db.prepare(
      "INSERT INTO resources (title, description, resource_type, external_link, difficulty, category) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(...r);
  }

  // 10. Applications & Activity & Notifications
  const allJobs = db.prepare("SELECT id, company_id, title, ctc_lpa FROM jobs").all();
  db.prepare(
    "INSERT INTO applications (student_id, job_id, stage, match_score, notes) VALUES (?, ?, 'TECHNICAL_INTERVIEW', 82, 'Cleared Online Assessment (3/3). Preparing Java concurrency & System Design.')"
  ).run(mainProfileId, allJobs[0].id);
  db.prepare(
    "INSERT INTO applications (student_id, job_id, stage, match_score, notes) VALUES (?, ?, 'ASSESSMENT', 85, 'Coding test scheduled for Saturday.')"
  ).run(mainProfileId, allJobs[2].id);

  const actSeed = [
    ["RESUME", "Resume updated & analyzed (82/100)"],
    ["SKILL", "Skill added: React & Django"],
    ["APPLICATION", "Applied to Oracle (Software Development Engineer)"],
    ["TOPIC", "Completed Java DSA roadmap milestone"],
    ["QUIZ", "Completed Java Core & Multithreading Mock Test (90%)"],
    ["PROJECT", "Updated project: PlaceTrace"],
  ];
  for (const [at, title] of actSeed) {
    db.prepare("INSERT INTO activity_logs (student_id, activity_type, title) VALUES (?, ?, ?)").run(
      mainProfileId,
      at,
      title
    );
  }

  db.prepare(
    "INSERT INTO notifications (user_id, title, message, notification_type, link) VALUES (?, ?, ?, 'INTERVIEW', '/applications')"
  ).run(
    studentId,
    "Technical Interview Shortlist: Oracle",
    "Congratulations! You cleared the Assessment round for Software Development Engineer at Oracle."
  );
  db.prepare(
    "INSERT INTO notifications (user_id, title, message, notification_type, link) VALUES (?, ?, ?, 'JOB_MATCH', '/jobs')"
  ).run(
    studentId,
    "New High-Match Drive: Atlassian",
    "Atlassian is hiring Full Stack Software Engineers (85% skill match with your profile)."
  );

  db.prepare(
    "INSERT INTO invite_codes (code, role, department, expires_at) VALUES ('PT-TPO2026', 'TPO', 'Placement Cell', '2027-12-31T23:59:59Z')"
  ).run();

  db.prepare(
    "INSERT INTO audit_logs (actor_email, action, target_model, target_id, details) VALUES ('admin@placetrace.edu', 'SYSTEM_INITIALIZED', 'System', '1', '{\"status\":\"seeded\"}')"
  ).run();
  db.prepare(
    "INSERT INTO audit_logs (actor_email, action, target_model, target_id, details) VALUES ('tpo@placetrace.edu', 'JOB_CREATED', 'Job', '1', '{\"company\":\"Oracle\"}')"
  ).run();
}

initDatabase();

// Deterministic Placement Readiness Calculator
function recomputeReadiness(studentId) {
  const profile = db.prepare("SELECT * FROM student_profiles WHERE id = ?").get(studentId);
  if (!profile) return { score: 78, breakdown: {} };

  const skillsCnt = db
    .prepare("SELECT COUNT(*) as c FROM student_skills WHERE student_id = ?")
    .get(studentId).c;
  const resume = db
    .prepare("SELECT resume_score FROM resumes WHERE student_id = ? ORDER BY id DESC LIMIT 1")
    .get(studentId);
  const topics = db
    .prepare("SELECT status FROM student_topic_progress WHERE student_id = ?")
    .all(studentId);
  const attempts = db
    .prepare("SELECT percentage FROM quiz_attempts WHERE student_id = ?")
    .all(studentId);
  const projectsCnt = db
    .prepare("SELECT COUNT(*) as c FROM projects WHERE student_id = ?")
    .get(studentId).c;
  const appsCnt = db
    .prepare("SELECT COUNT(*) as c FROM applications WHERE student_id = ?")
    .get(studentId).c;
  const tasksDone = db
    .prepare("SELECT COUNT(*) as c FROM study_tasks WHERE student_id = ? AND status = 'COMPLETED'")
    .get(studentId).c;

  const profile_completion = profile.bio && profile.github_url ? 95 : 80;
  const resume_readiness = resume ? resume.resume_score : 0;
  const technical_skills = Math.min(100, Math.round((skillsCnt / 10) * 100));
  const completedTopics = topics.filter((t) => t.status === "COMPLETED").length;
  const inProgTopics = topics.filter((t) => t.status === "IN_PROGRESS").length;
  const dsa_and_roadmap = topics.length
    ? Math.min(100, Math.round(((completedTopics + inProgTopics * 0.4) / topics.length) * 100))
    : 50;
  const mock_test_performance = attempts.length
    ? Math.round(attempts.reduce((a, b) => a + b.percentage, 0) / attempts.length)
    : 0;
  const projects_score = Math.min(100, projectsCnt * 34);
  const applications_activity = Math.min(100, Math.round((Math.min(appsCnt, 3) / 3) * 100));
  const interview_prep = Math.min(100, 65 + tasksDone * 12);

  const score = Math.round(
    0.12 * profile_completion +
      0.14 * resume_readiness +
      0.18 * technical_skills +
      0.16 * dsa_and_roadmap +
      0.14 * mock_test_performance +
      0.12 * projects_score +
      0.07 * applications_activity +
      0.07 * interview_prep
  );

  const breakdown = {
    profile_completion,
    resume_readiness,
    technical_skills,
    dsa_and_roadmap,
    mock_test_performance,
    projects_score,
    applications_activity,
    interview_prep,
  };

  db.prepare(
    "UPDATE student_profiles SET readiness_score = ?, readiness_breakdown = ? WHERE id = ?"
  ).run(score, JSON.stringify(breakdown), studentId);

  return { score, breakdown };
}

function getStudentFullPayload(userId) {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  let profile = db.prepare("SELECT * FROM student_profiles WHERE user_id = ?").get(userId);
  if (!profile) {
    db.prepare(
      "INSERT INTO student_profiles (user_id, usn, college_name, branch, cgpa) VALUES (?, ?, 'RNSIT', 'CSE', 8.5)"
    ).run(userId, `1RN23CS${String(Date.now()).slice(-3)}`);
    profile = db.prepare("SELECT * FROM student_profiles WHERE user_id = ?").get(userId);
  }

  const { score, breakdown } = recomputeReadiness(profile.id);

  const skills = db
    .prepare(`
      SELECT ss.id, ss.skill_id as skill, s.name as skill_name, s.category, ss.proficiency, ss.is_verified
      FROM student_skills ss JOIN skills s ON ss.skill_id = s.id
      WHERE ss.student_id = ?
      ORDER BY s.name
    `)
    .all(profile.id);

  const resumeRow = db
    .prepare("SELECT * FROM resumes WHERE student_id = ? ORDER BY id DESC LIMIT 1")
    .get(profile.id);

  let current_resume = null;
  if (resumeRow) {
    const extSkills = JSON.parse(resumeRow.extracted_skills_json || "[]").map((name, idx) => ({
      id: idx + 1,
      skill_name: name,
      confidence: 0.94,
    }));
    current_resume = {
      id: resumeRow.id,
      file_name: resumeRow.file_name,
      file_size: resumeRow.file_size,
      mime_type: resumeRow.mime_type,
      raw_text: resumeRow.raw_text,
      status: resumeRow.status,
      resume_score: resumeRow.resume_score,
      strengths: JSON.parse(resumeRow.strengths || "[]"),
      improvement_areas: JSON.parse(resumeRow.improvement_areas || "[]"),
      section_scores: JSON.parse(resumeRow.section_scores || "{}"),
      uploaded_at: resumeRow.uploaded_at,
      analyzed_at: resumeRow.analyzed_at,
      extracted_skills: extSkills,
    };
  }

  const activities = db
    .prepare("SELECT * FROM activity_logs WHERE student_id = ? ORDER BY id DESC LIMIT 15")
    .all(profile.id);

  const topicsCompleted = db
    .prepare("SELECT COUNT(*) as c FROM student_topic_progress WHERE student_id = ? AND status = 'COMPLETED'")
    .get(profile.id).c;
  const totalTopics = db.prepare("SELECT COUNT(*) as c FROM topics").get().c;
  const mockTestsCount = db
    .prepare("SELECT COUNT(*) as c FROM quiz_attempts WHERE student_id = ?")
    .get(profile.id).c;
  const projectsCount = db
    .prepare("SELECT COUNT(*) as c FROM projects WHERE student_id = ?")
    .get(profile.id).c;
  const applicationsCount = db
    .prepare("SELECT COUNT(*) as c FROM applications WHERE student_id = ?")
    .get(profile.id).c;

  return {
    id: profile.id,
    user: user.id,
    full_name: user.full_name,
    email: user.email,
    avatar_url: user.avatar_url || "",
    usn: profile.usn,
    college_name: profile.college_name,
    branch: profile.branch,
    cgpa: Number(profile.cgpa).toFixed(2),
    active_backlogs: profile.active_backlogs,
    graduation_year: profile.graduation_year,
    phone: profile.phone,
    bio: profile.bio,
    linkedin_url: profile.linkedin_url,
    github_url: profile.github_url,
    portfolio_url: profile.portfolio_url,
    placement_status: profile.placement_status,
    readiness_score: score,
    readiness_trend: profile.readiness_trend || 5,
    readiness_breakdown: breakdown,
    student_skills: skills,
    current_resume,
    activities,
    kpis: {
      readiness_score: score,
      readiness_trend: 5,
      topics_completed: topicsCompleted,
      total_topics: totalTopics,
      mock_tests_count: mockTestsCount,
      mock_tests_trend: 1,
      projects_count: projectsCount,
      applications_count: applicationsCount,
    },
  };
}

function enrichJobForStudent(jobRow, studentProfile) {
  const company = db.prepare("SELECT * FROM companies WHERE id = ?").get(jobRow.company_id) || {};
  const reqSkills = JSON.parse(jobRow.required_skills_json || "[]");
  const prefSkills = JSON.parse(jobRow.preferred_skills_json || "[]");
  const allowedBranches = JSON.parse(jobRow.allowed_branches || '["CSE","ISE","ECE"]');

  const stuSkills = studentProfile
    ? db
        .prepare(
          "SELECT s.name FROM student_skills ss JOIN skills s ON ss.skill_id = s.id WHERE ss.student_id = ?"
        )
        .all(studentProfile.id)
        .map((r) => r.name)
    : ["Java", "DSA", "SQL", "React"];

  const stuSet = new Set(stuSkills.map((s) => s.toLowerCase()));
  const matching_skills = [];
  const missing_skills = [];
  const high_priority_missing = [];

  let totalW = 0;
  let matchedW = 0;
  for (const r of reqSkills) {
    totalW += 1.0;
    if (stuSet.has(r.toLowerCase())) {
      matchedW += 1.0;
      matching_skills.push(r);
    } else {
      missing_skills.push(r);
      high_priority_missing.push(r);
    }
  }
  for (const p of prefSkills) {
    totalW += 0.5;
    if (stuSet.has(p.toLowerCase())) {
      matchedW += 0.5;
      matching_skills.push(p);
    } else {
      missing_skills.push(p);
    }
  }

  const match_percentage = totalW > 0 ? Math.round((matchedW / totalW) * 100) : 82;

  const branchOk = !studentProfile || allowedBranches.includes(studentProfile.branch);
  const cgpaOk = !studentProfile || Number(studentProfile.cgpa) >= Number(jobRow.min_cgpa);
  const backlogsOk = !studentProfile || Number(studentProfile.active_backlogs) <= Number(jobRow.max_active_backlogs);
  const is_eligible = branchOk && cgpaOk && backlogsOk;

  const checks = [
    { key: "degree", label: "B.E / B.Tech", passed: true, student_value: "B.E / B.Tech" },
    {
      key: "branch",
      label: allowedBranches.join(" / "),
      passed: branchOk,
      student_value: studentProfile?.branch || "CSE",
    },
    {
      key: "cgpa",
      label: `CGPA: ${Number(jobRow.min_cgpa).toFixed(1)}+`,
      passed: cgpaOk,
      student_value: `CGPA: ${studentProfile?.cgpa || "9.35"}`,
    },
    {
      key: "backlogs",
      label: "No active backlogs",
      passed: backlogsOk,
      student_value: `${studentProfile?.active_backlogs || 0} active backlogs`,
    },
  ];

  const is_saved = studentProfile
    ? Boolean(
        db
          .prepare("SELECT 1 FROM saved_jobs WHERE student_id = ? AND job_id = ?")
          .get(studentProfile.id, jobRow.id)
      )
    : false;

  const has_applied = studentProfile
    ? Boolean(
        db
          .prepare("SELECT 1 FROM applications WHERE student_id = ? AND job_id = ?")
          .get(studentProfile.id, jobRow.id)
      )
    : false;

  const applicants_count = db
    .prepare("SELECT COUNT(*) as c FROM applications WHERE job_id = ?")
    .get(jobRow.id).c;

  const recommendation_reasons = [];
  if (is_eligible) {
    recommendation_reasons.push(
      `Meets academic criteria (${studentProfile?.branch || "CSE"}, CGPA ${
        studentProfile?.cgpa || 9.35
      } >= ${jobRow.min_cgpa})`
    );
  }
  if (matching_skills.length > 0) {
    recommendation_reasons.push(
      `Matches your skills in ${matching_skills.slice(0, 4).join(", ")} (${match_percentage}% match)`
    );
  }

  return {
    id: jobRow.id,
    company: jobRow.company_id,
    company_name: company.name || "Oracle",
    company_logo_color: company.logo_color || "#6555F5",
    company_website: company.website || "https://www.oracle.com",
    company_industry: company.industry || "Cloud & Software",
    company_description: company.description || "",
    title: jobRow.title,
    category: jobRow.category,
    location: jobRow.location,
    employment_type: jobRow.employment_type,
    ctc_lpa: Number(jobRow.ctc_lpa).toFixed(2),
    about_role: jobRow.about_role,
    description: jobRow.description,
    responsibilities: JSON.parse(jobRow.responsibilities || "[]"),
    syllabus: JSON.parse(jobRow.syllabus || "[]"),
    interview_tips: JSON.parse(jobRow.interview_tips || "[]"),
    allowed_branches: allowedBranches,
    min_cgpa: Number(jobRow.min_cgpa).toFixed(2),
    graduation_year: jobRow.graduation_year,
    deadline: jobRow.deadline,
    apply_link: jobRow.apply_link || company.website,
    status: jobRow.status,
    posted_ago: "3 days ago",
    eligibility: { is_eligible, status_label: is_eligible ? "Eligible" : "Not Eligible", checks },
    match_data: {
      match_percentage,
      matching_skills,
      missing_skills,
      high_priority_missing,
      required_skills: reqSkills,
      preferred_skills: prefSkills,
    },
    recommendation_reasons,
    is_saved,
    has_applied,
    applicants_count,
  };
}

function buildApplicationTimeline(stage) {
  const orderMap = {
    APPLIED: 1,
    ASSESSMENT: 2,
    TECHNICAL_INTERVIEW: 3,
    HR_INTERVIEW: 4,
    SELECTED: 5,
    REJECTED: 5,
  };
  const currentIdx = orderMap[stage] || 1;
  const steps = [
    [1, "Applied"],
    [2, "Assessment"],
    [3, "Technical Interview"],
    [4, "HR Interview"],
    [5, stage === "SELECTED" ? "Selected" : stage === "REJECTED" ? "Rejected" : "Final Decision"],
  ];
  return steps.map(([order, name]) => {
    let state = "UPCOMING";
    let event_date = null;
    if (order < currentIdx || (order === currentIdx && (stage === "SELECTED" || stage === "REJECTED"))) {
      state = "COMPLETED";
      event_date = "2026-11-12T10:00:00Z";
    } else if (order === currentIdx) {
      state = "CURRENT";
    }
    return { id: order, stage_name: name, order, state, event_date };
  });
}

function getAuthenticatedUser(req) {
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) {
    const decoded = verifyToken(auth.slice(7).trim());
    if (decoded?.id) {
      const u = db.prepare("SELECT * FROM users WHERE id = ?").get(decoded.id);
      if (u) return u;
    }
  }
  return db.prepare("SELECT * FROM users WHERE email = 'dhanyashree@placetrace.edu'").get();
}

function readJsonBody(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(JSON.stringify(data));
}

async function handleApiRequest(req, res, pathname, searchParams) {
  if (req.method === "OPTIONS") {
    return sendJson(res, 200, {});
  }

  // Health Check
  if (pathname === "/api/health/") {
    return sendJson(res, 200, { status: "healthy", service: "placetrace-local-server" });
  }

  // Auth: Login
  if (pathname === "/api/auth/login/" && req.method === "POST") {
    const body = await readJsonBody(req);
    const email = (body.email || "").toLowerCase().trim();
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user || user.password_hash !== hashPassword(body.password || "")) {
      return sendJson(res, 401, { detail: "Invalid email or password." });
    }
    const token = createToken(user);
    return sendJson(res, 200, {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_active: Boolean(user.is_active),
        is_email_verified: Boolean(user.is_email_verified),
      },
      tokens: { access: token, refresh: token },
    });
  }

  // Auth: Register
  if (pathname === "/api/auth/register/" && req.method === "POST") {
    const body = await readJsonBody(req);
    const email = (body.email || "").toLowerCase().trim();
    if (!email || !body.full_name || !body.password) {
      return sendJson(res, 400, { detail: "Name, email, and password are required." });
    }
    const existing = db.prepare("SELECT 1 FROM users WHERE email = ?").get(email);
    if (existing) {
      return sendJson(res, 400, { detail: "A user with this email already exists." });
    }
    const id = `usr-${Date.now()}`;
    const role = body.role || "STUDENT";
    db.prepare(
      "INSERT INTO users (id, email, full_name, password_hash, role, is_email_verified) VALUES (?, ?, ?, ?, ?, 1)"
    ).run(id, email, body.full_name, hashPassword(body.password), role);

    if (role === "STUDENT") {
      db.prepare(
        "INSERT INTO student_profiles (user_id, usn, college_name, branch, cgpa, graduation_year) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(
        id,
        body.usn || `1RN23CS${String(Date.now()).slice(-3)}`,
        body.college_name || "RNSIT",
        body.branch || "CSE",
        Number(body.cgpa || 8.5),
        Number(body.graduation_year || 2027)
      );
      const pid = db.prepare("SELECT id FROM student_profiles WHERE user_id = ?").get(id).id;
      const topics = db.prepare("SELECT id FROM topics").all();
      for (const t of topics) {
        db.prepare("INSERT OR IGNORE INTO student_topic_progress (student_id, topic_id, status) VALUES (?, ?, 'NOT_STARTED')").run(
          pid,
          t.id
        );
      }
    }

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    const token = createToken(user);
    return sendJson(res, 201, {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_active: true,
        is_email_verified: true,
      },
      tokens: { access: token, refresh: token },
    });
  }

  // Auth: Logout
  if (pathname === "/api/auth/logout/" && req.method === "POST") {
    return sendJson(res, 200, { detail: "Successfully logged out." });
  }

  const currentUser = getAuthenticatedUser(req);

  // Auth: Me
  if (pathname === "/api/auth/me/") {
    return sendJson(res, 200, {
      id: currentUser.id,
      email: currentUser.email,
      full_name: currentUser.full_name,
      role: currentUser.role,
      is_active: Boolean(currentUser.is_active),
      is_email_verified: Boolean(currentUser.is_email_verified),
    });
  }

  // Notifications
  if (pathname === "/api/auth/notifications/" && req.method === "GET") {
    const list = db
      .prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC")
      .all(currentUser.id)
      .map((n) => ({ ...n, is_read: Boolean(n.is_read) }));
    return sendJson(res, 200, list);
  }
  if (pathname.startsWith("/api/auth/notifications/") && req.method === "POST") {
    db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").run(currentUser.id);
    return sendJson(res, 200, { detail: "Notifications marked as read." });
  }

  // Export Data
  if (pathname === "/api/auth/export-data/" && req.method === "GET") {
    const studentPayload = getStudentFullPayload(currentUser.id);
    return sendJson(res, 200, {
      exported_at: new Date().toISOString(),
      user: { email: currentUser.email, full_name: currentUser.full_name, role: currentUser.role },
      student_profile: studentPayload,
    });
  }

  // Delete Account
  if (pathname === "/api/auth/delete-account/" && req.method === "POST") {
    const body = await readJsonBody(req);
    if (currentUser.password_hash !== hashPassword(body.password || "")) {
      return sendJson(res, 400, { detail: "Password confirmation failed." });
    }
    if (currentUser.role === "ADMIN") {
      const adminsCount = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'ADMIN'").get().c;
      if (adminsCount <= 1) {
        return sendJson(res, 400, { detail: "Cannot delete the last active administrator account." });
      }
    }
    return sendJson(res, 200, { detail: "Account deleted." });
  }

  // Admin Endpoints
  if (pathname === "/api/auth/admin/users/" && req.method === "GET") {
    const allUsers = db
      .prepare("SELECT id, email, full_name, role, is_active, is_email_verified, created_at FROM users")
      .all()
      .map((u) => ({
        ...u,
        is_active: Boolean(u.is_active),
        is_email_verified: Boolean(u.is_email_verified),
      }));
    return sendJson(res, 200, allUsers);
  }
  if (pathname.startsWith("/api/auth/admin/users/") && req.method === "PATCH") {
    const targetId = pathname.split("/").filter(Boolean).pop();
    const body = await readJsonBody(req);
    if (body.role) {
      db.prepare("UPDATE users SET role = ? WHERE id = ?").run(body.role, targetId);
    }
    if (body.is_active !== undefined) {
      db.prepare("UPDATE users SET is_active = ? WHERE id = ?").run(body.is_active ? 1 : 0, targetId);
    }
    const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(targetId);
    return sendJson(res, 200, updated);
  }
  if (pathname === "/api/auth/admin/invite-codes/") {
    if (req.method === "POST") {
      const body = await readJsonBody(req);
      const code = `PT-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
      db.prepare(
        "INSERT INTO invite_codes (code, role, department, expires_at) VALUES (?, ?, ?, ?)"
      ).run(code, body.role || "TPO", body.department || "Placement Cell", "2027-12-31T23:59:59Z");
      return sendJson(res, 201, { code, role: body.role || "TPO" });
    }
    const codes = db.prepare("SELECT * FROM invite_codes ORDER BY id DESC").all();
    return sendJson(res, 200, codes);
  }
  if (pathname === "/api/auth/admin/audit-logs/") {
    const logs = db.prepare("SELECT * FROM audit_logs ORDER BY id DESC LIMIT 50").all().map((l) => ({
      ...l,
      details: JSON.parse(l.details || "{}"),
    }));
    return sendJson(res, 200, logs);
  }

  // Student Profile & Skills & Resume
  if (pathname === "/api/students/me/") {
    if (req.method === "PATCH") {
      const body = await readJsonBody(req);
      if (body.full_name) {
        db.prepare("UPDATE users SET full_name = ? WHERE id = ?").run(body.full_name, currentUser.id);
      }
      db.prepare(`
        UPDATE student_profiles
        SET college_name = COALESCE(?, college_name),
            branch = COALESCE(?, branch),
            cgpa = COALESCE(?, cgpa),
            bio = COALESCE(?, bio),
            github_url = COALESCE(?, github_url),
            linkedin_url = COALESCE(?, linkedin_url)
        WHERE user_id = ?
      `).run(
        body.college_name || null,
        body.branch || null,
        body.cgpa !== undefined ? Number(body.cgpa) : null,
        body.bio !== undefined ? body.bio : null,
        body.github_url !== undefined ? body.github_url : null,
        body.linkedin_url !== undefined ? body.linkedin_url : null,
        currentUser.id
      );
    }
    return sendJson(res, 200, getStudentFullPayload(currentUser.id));
  }

  const studentPayload = getStudentFullPayload(currentUser.id);

  if (pathname === "/api/students/me/skills/") {
    if (req.method === "GET") {
      return sendJson(res, 200, studentPayload.student_skills);
    }
    if (req.method === "POST") {
      const body = await readJsonBody(req);
      const sName = (body.skill_name || "").trim();
      const cat = body.category || "PROGRAMMING";
      const prof = body.proficiency || "INTERMEDIATE";
      db.prepare("INSERT OR IGNORE INTO skills (name, category) VALUES (?, ?)").run(sName, cat);
      const sk = db.prepare("SELECT * FROM skills WHERE LOWER(name) = LOWER(?)").get(sName);
      if (sk) {
        db.prepare(
          "INSERT OR REPLACE INTO student_skills (student_id, skill_id, proficiency) VALUES (?, ?, ?)"
        ).run(studentPayload.id, sk.id, prof);
        db.prepare("INSERT INTO activity_logs (student_id, activity_type, title) VALUES (?, 'SKILL', ?)").run(
          studentPayload.id,
          `Skill added: ${sk.name}`
        );
      }
      return sendJson(res, 201, getStudentFullPayload(currentUser.id).student_skills);
    }
  }

  if (pathname.startsWith("/api/students/me/skills/")) {
    const skLinkId = Number(pathname.split("/").filter(Boolean).pop());
    if (req.method === "DELETE") {
      db.prepare("DELETE FROM student_skills WHERE id = ? AND student_id = ?").run(
        skLinkId,
        studentPayload.id
      );
      return sendJson(res, 204, null);
    }
    if (req.method === "PATCH") {
      const body = await readJsonBody(req);
      if (body.proficiency) {
        db.prepare("UPDATE student_skills SET proficiency = ? WHERE id = ?").run(
          body.proficiency,
          skLinkId
        );
      }
      return sendJson(res, 200, { id: skLinkId, proficiency: body.proficiency });
    }
  }

  // Resume Upload & Analysis
  if (pathname === "/api/students/me/resume/") {
    if (req.method === "GET") {
      return sendJson(res, 200, {
        current_resume: studentPayload.current_resume,
        history: studentPayload.current_resume ? [studentPayload.current_resume] : [],
      });
    }
    if (req.method === "POST") {
      const body = await readJsonBody(req);
      const rawText =
        body.raw_text ||
        studentPayload.current_resume?.raw_text ||
        "Java, Python, SQL, React, Django, DSA, Git, Docker";
      const fileName = body.file_name || "Updated_Resume_2026.pdf";
      const knownSkills = db.prepare("SELECT name, category FROM skills").all();
      const extracted = knownSkills
        .filter((k) => rawText.toLowerCase().includes(k.name.toLowerCase()))
        .map((k) => k.name);
      const finalExtracted = extracted.length
        ? extracted
        : ["Java", "Python", "SQL", "React", "Django"];
      const score = Math.min(96, 68 + finalExtracted.length * 3);

      db.prepare(`
        INSERT INTO resumes (
          student_id, file_name, raw_text, status, resume_score, strengths, improvement_areas, section_scores, extracted_skills_json
        ) VALUES (?, ?, ?, 'ANALYZED', ?, ?, ?, ?, ?)
      `).run(
        studentPayload.id,
        fileName,
        rawText,
        score,
        JSON.stringify([
          "Strong Java & full-stack engineering foundation",
          `Extracted ${finalExtracted.length} verified technical skills`,
          "Good practical project architecture",
        ]),
        JSON.stringify([
          "Add measurable project impact (e.g., latency reduced by 30%)",
          "Improve system-design section",
        ]),
        JSON.stringify({ skills: 90, projects: 86, impact: 80, experience: 78, education: 95 }),
        JSON.stringify(finalExtracted)
      );

      db.prepare("INSERT INTO activity_logs (student_id, activity_type, title) VALUES (?, 'RESUME', ?)").run(
        studentPayload.id,
        `Resume updated & analyzed (${score}/100)`
      );
      return sendJson(res, 201, getStudentFullPayload(currentUser.id).current_resume);
    }
  }

  // TPO Student List & Status Update
  if (pathname === "/api/students/" && req.method === "GET") {
    const search = (searchParams.get("search") || "").toLowerCase();
    const branch = searchParams.get("branch") || "";
    const pStatus = searchParams.get("placement_status") || "";

    const rows = db
      .prepare(`
        SELECT sp.*, u.full_name, u.email
        FROM student_profiles sp JOIN users u ON sp.user_id = u.id
        ORDER BY sp.cgpa DESC
      `)
      .all();

    const results = rows
      .map((r) => {
        const sks = db
          .prepare(
            "SELECT s.name FROM student_skills ss JOIN skills s ON ss.skill_id = s.id WHERE ss.student_id = ?"
          )
          .all(r.id)
          .map((x) => x.name);
        const appCnt = db
          .prepare("SELECT COUNT(*) as c FROM applications WHERE student_id = ?")
          .get(r.id).c;
        return {
          id: r.id,
          full_name: r.full_name,
          email: r.email,
          usn: r.usn,
          branch: r.branch,
          cgpa: Number(r.cgpa).toFixed(2),
          placement_status: r.placement_status,
          readiness_score: r.readiness_score,
          skills: sks,
          applications_count: appCnt,
        };
      })
      .filter((item) => {
        if (branch && item.branch !== branch) return false;
        if (pStatus && item.placement_status !== pStatus) return false;
        if (
          search &&
          !item.full_name.toLowerCase().includes(search) &&
          !item.usn.toLowerCase().includes(search) &&
          !item.skills.some((s) => s.toLowerCase().includes(search))
        ) {
          return false;
        }
        return true;
      });

    return sendJson(res, 200, { results, count: results.length, current_page: 1, total_pages: 1 });
  }

  if (pathname.startsWith("/api/students/") && req.method === "PATCH") {
    const stuId = Number(pathname.split("/").filter(Boolean).pop());
    const body = await readJsonBody(req);
    if (body.placement_status) {
      db.prepare("UPDATE student_profiles SET placement_status = ? WHERE id = ?").run(
        body.placement_status,
        stuId
      );
    }
    return sendJson(res, 200, { id: stuId, placement_status: body.placement_status });
  }

  // Companies
  if (pathname === "/api/companies/") {
    if (req.method === "POST") {
      const body = await readJsonBody(req);
      const info = db
        .prepare(
          "INSERT INTO companies (name, industry, headquarters, website, status) VALUES (?, ?, ?, ?, ?)"
        )
        .run(
          body.name,
          body.industry || "Software",
          body.headquarters || "Bengaluru",
          body.website || "",
          body.status || "ACTIVE"
        );
      return sendJson(res, 201, { id: info.lastInsertRowid, ...body });
    }
    const comps = db.prepare("SELECT * FROM companies ORDER BY name").all().map((c) => ({
      ...c,
      open_jobs_count: db
        .prepare("SELECT COUNT(*) as cnt FROM jobs WHERE company_id = ? AND status = 'PUBLISHED'")
        .get(c.id).cnt,
      applications_count: db
        .prepare(
          "SELECT COUNT(*) as cnt FROM applications a JOIN jobs j ON a.job_id = j.id WHERE j.company_id = ?"
        )
        .get(c.id).cnt,
      selections_count: db
        .prepare(
          "SELECT COUNT(*) as cnt FROM applications a JOIN jobs j ON a.job_id = j.id WHERE j.company_id = ? AND a.stage = 'SELECTED'"
        )
        .get(c.id).cnt,
    }));
    return sendJson(res, 200, comps);
  }

  // Jobs
  if (pathname === "/api/jobs/recommended/" && req.method === "GET") {
    const jobs = db
      .prepare("SELECT * FROM jobs WHERE status = 'PUBLISHED' ORDER BY id DESC")
      .all()
      .map((j) => enrichJobForStudent(j, studentPayload));
    return sendJson(res, 200, jobs.slice(0, 4));
  }

  if (pathname === "/api/jobs/") {
    if (req.method === "POST") {
      const body = await readJsonBody(req);
      const info = db
        .prepare(`
          INSERT INTO jobs (
            company_id, title, category, location, employment_type, ctc_lpa,
            min_cgpa, allowed_branches, graduation_year, deadline, about_role, description,
            required_skills_json, preferred_skills_json, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          Number(body.company || 1),
          body.title,
          body.category || "SOFTWARE_DEVELOPMENT",
          body.location || "Bengaluru",
          body.employment_type || "Full Time",
          Number(body.ctc_lpa || 15),
          Number(body.min_cgpa || 7.0),
          JSON.stringify(body.allowed_branches || ["CSE", "ISE"]),
          Number(body.graduation_year || 2027),
          body.deadline || "2026-12-20",
          body.about_role || body.description || "",
          body.description || "",
          JSON.stringify(body.required_skill_names || ["Java", "DSA"]),
          JSON.stringify(body.preferred_skill_names || ["Docker"]),
          body.status || "PUBLISHED"
        );
      const created = db.prepare("SELECT * FROM jobs WHERE id = ?").get(info.lastInsertRowid);
      return sendJson(res, 201, enrichJobForStudent(created, studentPayload));
    }

    const search = (searchParams.get("search") || "").toLowerCase();
    const category = searchParams.get("category") || "ALL";
    const eligibleOnly = searchParams.get("eligible_only") === "true";
    const savedOnly = searchParams.get("saved_only") === "true";
    const locFilter = (searchParams.get("location") || "").toLowerCase();

    const allJobs = db
      .prepare("SELECT * FROM jobs ORDER BY id DESC")
      .all()
      .map((j) => enrichJobForStudent(j, studentPayload))
      .filter((j) => {
        if (category !== "ALL" && j.category !== category) return false;
        if (eligibleOnly && !j.eligibility.is_eligible) return false;
        if (savedOnly && !j.is_saved) return false;
        if (locFilter && !j.location.toLowerCase().includes(locFilter)) return false;
        if (
          search &&
          !j.title.toLowerCase().includes(search) &&
          !j.company_name.toLowerCase().includes(search) &&
          !j.location.toLowerCase().includes(search) &&
          !j.match_data.required_skills.some((s) => s.toLowerCase().includes(search))
        ) {
          return false;
        }
        return true;
      });

    return sendJson(res, 200, {
      results: allJobs,
      count: allJobs.length,
      total_pages: 1,
      current_page: 1,
    });
  }

  if (pathname.match(/^\/api\/jobs\/\d+\/bookmark\/$/) && req.method === "POST") {
    const jobId = Number(pathname.split("/")[3]);
    const existing = db
      .prepare("SELECT id FROM saved_jobs WHERE student_id = ? AND job_id = ?")
      .get(studentPayload.id, jobId);
    if (existing) {
      db.prepare("DELETE FROM saved_jobs WHERE id = ?").run(existing.id);
      return sendJson(res, 200, { saved: false, detail: "Removed job from saved list." });
    }
    db.prepare("INSERT INTO saved_jobs (student_id, job_id) VALUES (?, ?)").run(
      studentPayload.id,
      jobId
    );
    return sendJson(res, 201, { saved: true, detail: "Job bookmarked." });
  }

  if (pathname.match(/^\/api\/jobs\/\d+\/$/)) {
    const jobId = Number(pathname.split("/")[3]);
    if (req.method === "PATCH") {
      const body = await readJsonBody(req);
      if (body.status) {
        db.prepare("UPDATE jobs SET status = ? WHERE id = ?").run(body.status, jobId);
      }
      if (body.title) {
        db.prepare("UPDATE jobs SET title = ?, location = ?, ctc_lpa = ? WHERE id = ?").run(
          body.title,
          body.location || "Bengaluru",
          Number(body.ctc_lpa || 18),
          jobId
        );
      }
    }
    const jobRow = db.prepare("SELECT * FROM jobs WHERE id = ?").get(jobId);
    if (!jobRow) return sendJson(res, 404, { detail: "Job not found." });
    return sendJson(res, 200, enrichJobForStudent(jobRow, studentPayload));
  }

  // Applications
  if (pathname === "/api/applications/") {
    if (req.method === "POST") {
      const body = await readJsonBody(req);
      const jobId = Number(body.job);
      const jobRow = db.prepare("SELECT * FROM jobs WHERE id = ?").get(jobId);
      if (!jobRow) return sendJson(res, 404, { detail: "Job not found." });
      const enriched = enrichJobForStudent(jobRow, studentPayload);
      if (!enriched.eligibility.is_eligible) {
        return sendJson(res, 400, { detail: "You do not meet the eligibility criteria for this job." });
      }
      const exists = db
        .prepare("SELECT id FROM applications WHERE student_id = ? AND job_id = ?")
        .get(studentPayload.id, jobId);
      if (exists) {
        return sendJson(res, 400, { detail: "You have already applied for this job." });
      }
      const info = db
        .prepare(
          "INSERT INTO applications (student_id, job_id, stage, match_score, notes) VALUES (?, ?, 'APPLIED', ?, ?)"
        )
        .run(
          studentPayload.id,
          jobId,
          enriched.match_data.match_percentage,
          body.notes || ""
        );
      db.prepare("INSERT INTO activity_logs (student_id, activity_type, title) VALUES (?, 'APPLICATION', ?)").run(
        studentPayload.id,
        `Applied to ${enriched.company_name} (${enriched.title})`
      );
      return sendJson(res, 201, { id: info.lastInsertRowid, stage: "APPLIED" });
    }

    const stageLabels = {
      APPLIED: "Applied",
      ASSESSMENT: "Assessment",
      TECHNICAL_INTERVIEW: "Technical Interview",
      HR_INTERVIEW: "HR Interview",
      SELECTED: "Selected",
      REJECTED: "Rejected",
    };

    const rows = db
      .prepare(`
        SELECT a.*, j.title as job_title, j.location as job_location, j.ctc_lpa as job_ctc,
               c.name as company_name, c.logo_color as company_logo_color,
               sp.usn as student_usn, sp.branch as student_branch, sp.cgpa as student_cgpa,
               u.full_name as student_name
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN companies c ON j.company_id = c.id
        JOIN student_profiles sp ON a.student_id = sp.id
        JOIN users u ON sp.user_id = u.id
        ORDER BY a.id DESC
      `)
      .all()
      .map((r) => ({
        ...r,
        status_label: stageLabels[r.stage] || r.stage,
        timeline: buildApplicationTimeline(r.stage),
      }));

    return sendJson(res, 200, rows);
  }

  if (pathname.match(/^\/api\/applications\/\d+\/$/) && req.method === "PATCH") {
    const appId = Number(pathname.split("/")[3]);
    const body = await readJsonBody(req);
    if (body.notes !== undefined) {
      db.prepare("UPDATE applications SET notes = ? WHERE id = ?").run(body.notes, appId);
    }
    if (body.stage) {
      db.prepare("UPDATE applications SET stage = ? WHERE id = ?").run(body.stage, appId);
      if (body.stage === "SELECTED") {
        const appRow = db.prepare("SELECT * FROM applications WHERE id = ?").get(appId);
        if (appRow) {
          db.prepare("UPDATE student_profiles SET placement_status = 'PLACED' WHERE id = ?").run(
            appRow.student_id
          );
        }
      }
    }
    const updated = db.prepare("SELECT * FROM applications WHERE id = ?").get(appId);
    return sendJson(res, 200, {
      ...updated,
      status_label: updated.stage,
      timeline: buildApplicationTimeline(updated.stage),
    });
  }

  // Study Planner & Roadmap
  if (pathname === "/api/study/roadmap/" && req.method === "GET") {
    const rows = db
      .prepare(`
        SELECT stp.id, t.id as topic_id, t.title, t.category, t.description,
               t.topic_order as 'order', t.estimated_hours, stp.status, stp.completed_at
        FROM student_topic_progress stp
        JOIN topics t ON stp.topic_id = t.id
        WHERE stp.student_id = ?
        ORDER BY t.topic_order
      `)
      .all(studentPayload.id);
    return sendJson(res, 200, rows);
  }

  if (pathname.match(/^\/api\/study\/roadmap\/\d+\/$/) && req.method === "PATCH") {
    const progId = Number(pathname.split("/")[4]);
    const body = await readJsonBody(req);
    db.prepare("UPDATE student_topic_progress SET status = ? WHERE id = ?").run(
      body.status || "COMPLETED",
      progId
    );
    return sendJson(res, 200, { id: progId, status: body.status });
  }

  if (pathname === "/api/study/tasks/") {
    if (req.method === "POST") {
      const body = await readJsonBody(req);
      const info = db
        .prepare(
          "INSERT INTO study_tasks (student_id, title, category, scheduled_date, scheduled_time, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)"
        )
        .run(
          studentPayload.id,
          body.title,
          body.category || "Coding Practice",
          body.scheduled_date || new Date().toISOString().split("T")[0],
          body.scheduled_time || "7:00 PM",
          body.priority || "HIGH",
          body.status || "PENDING"
        );
      return sendJson(res, 201, { id: info.lastInsertRowid, ...body });
    }
    const tasks = db
      .prepare("SELECT * FROM study_tasks WHERE student_id = ? ORDER BY scheduled_date, id")
      .all(studentPayload.id);
    return sendJson(res, 200, tasks);
  }

  if (pathname.match(/^\/api\/study\/tasks\/\d+\/$/)) {
    const taskId = Number(pathname.split("/")[4]);
    if (req.method === "DELETE") {
      db.prepare("DELETE FROM study_tasks WHERE id = ?").run(taskId);
      return sendJson(res, 204, null);
    }
    if (req.method === "PATCH") {
      const body = await readJsonBody(req);
      if (body.status) {
        db.prepare("UPDATE study_tasks SET status = ? WHERE id = ?").run(body.status, taskId);
      }
      return sendJson(res, 200, { id: taskId, status: body.status });
    }
  }

  // Quizzes & Mock Test Dashboard
  if (pathname === "/api/quizzes/" && req.method === "GET") {
    const list = db
      .prepare("SELECT * FROM quizzes ORDER BY id")
      .all()
      .map((q) => {
        const qs = JSON.parse(q.questions_json || "[]");
        const bestRow = db
          .prepare(
            "SELECT MAX(percentage) as best FROM quiz_attempts WHERE student_id = ? AND quiz_id = ?"
          )
          .get(studentPayload.id, q.id);
        return {
          id: q.id,
          title: q.title,
          category: q.category,
          quiz_type: q.quiz_type,
          difficulty: q.difficulty,
          duration_minutes: q.duration_minutes,
          description: q.description,
          questions_count: qs.length,
          best_percentage: bestRow?.best ?? null,
          questions: qs,
        };
      });
    return sendJson(res, 200, list);
  }

  if (pathname === "/api/quizzes/dashboard/" && req.method === "GET") {
    const total_tests = db.prepare("SELECT COUNT(*) as c FROM quizzes").get().c;
    const attempts = db
      .prepare(`
        SELECT qa.*, q.title as quiz_title, q.category, q.quiz_type
        FROM quiz_attempts qa JOIN quizzes q ON qa.quiz_id = q.id
        WHERE qa.student_id = ?
        ORDER BY qa.id DESC
      `)
      .all(studentPayload.id);

    const avg = attempts.length
      ? Math.round(attempts.reduce((a, b) => a + b.percentage, 0) / attempts.length)
      : 0;
    const best = attempts.length ? Math.max(...attempts.map((a) => a.percentage)) : 0;

    const byTopic = {};
    for (const a of attempts) {
      byTopic[a.category] = byTopic[a.category] || [];
      byTopic[a.category].push(a.percentage);
    }
    const topic_performance = Object.entries(byTopic).map(([topic, arr]) => ({
      topic,
      average_score: Math.round(arr.reduce((x, y) => x + y, 0) / arr.length),
      attempts: arr.length,
      best_score: Math.max(...arr),
    }));

    return sendJson(res, 200, {
      total_tests,
      completed_tests: attempts.length,
      average_score: avg,
      best_score: best,
      topic_performance,
      recent_attempts: attempts,
    });
  }

  if (pathname.match(/^\/api\/quizzes\/\d+\/submit\/$/) && req.method === "POST") {
    const quizId = Number(pathname.split("/")[3]);
    const body = await readJsonBody(req);
    const answers = body.answers || {};
    const quizRow = db.prepare("SELECT * FROM quizzes WHERE id = ?").get(quizId);
    const qs = JSON.parse(quizRow.questions_json || "[]");
    let correct = 0;
    const feedback = qs.map((q) => {
      const sel = answers[q.id];
      const isRight = sel !== undefined && Number(sel) === Number(q.correct_index);
      if (isRight) correct += 1;
      return {
        question_id: q.id,
        selected_index: sel,
        correct_index: q.correct_index,
        is_correct: isRight,
        explanation: q.explanation,
      };
    });
    const pct = Math.round((correct / Math.max(qs.length, 1)) * 100);
    db.prepare(
      "INSERT INTO quiz_attempts (student_id, quiz_id, score, total_questions, percentage) VALUES (?, ?, ?, ?, ?)"
    ).run(studentPayload.id, quizId, correct, qs.length, pct);

    return sendJson(res, 201, {
      attempt: { score: correct, total_questions: qs.length, percentage: pct },
      feedback,
    });
  }

  // Projects
  if (pathname === "/api/projects/") {
    if (req.method === "POST") {
      const body = await readJsonBody(req);
      const info = db
        .prepare(
          "INSERT INTO projects (student_id, title, description, technologies, github_url, live_url, role, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .run(
          studentPayload.id,
          body.title,
          body.description || "",
          JSON.stringify(body.technologies || []),
          body.github_url || "",
          body.live_url || "",
          body.role || "Full Stack Developer",
          body.status || "COMPLETED"
        );
      return sendJson(res, 201, { id: info.lastInsertRowid, ...body });
    }
    const projs = db
      .prepare("SELECT * FROM projects WHERE student_id = ? ORDER BY id DESC")
      .all(studentPayload.id)
      .map((p) => ({ ...p, technologies: JSON.parse(p.technologies || "[]") }));
    return sendJson(res, 200, projs);
  }

  if (pathname.match(/^\/api\/projects\/\d+\/$/)) {
    const projId = Number(pathname.split("/")[3]);
    if (req.method === "DELETE") {
      db.prepare("DELETE FROM projects WHERE id = ?").run(projId);
      return sendJson(res, 204, null);
    }
    if (req.method === "PATCH") {
      const body = await readJsonBody(req);
      db.prepare(
        "UPDATE projects SET title = ?, description = ?, technologies = ?, github_url = ?, live_url = ?, role = ?, status = ? WHERE id = ?"
      ).run(
        body.title,
        body.description,
        JSON.stringify(body.technologies || []),
        body.github_url || "",
        body.live_url || "",
        body.role || "Full Stack Developer",
        body.status || "COMPLETED",
        projId
      );
      return sendJson(res, 200, { id: projId, ...body });
    }
  }

  // Resources
  if (pathname === "/api/resources/" && req.method === "GET") {
    const list = db.prepare("SELECT * FROM resources ORDER BY category, title").all();
    return sendJson(res, 200, list);
  }

  // ML Endpoints
  if (pathname === "/api/ml/job-compatibility/" && req.method === "GET") {
    const jobs = db
      .prepare("SELECT * FROM jobs WHERE status = 'PUBLISHED'")
      .all()
      .map((j) => {
        const en = enrichJobForStudent(j, studentPayload);
        return {
          job_id: en.id,
          company_name: en.company_name,
          job_title: en.title,
          location: en.location,
          match_percentage: en.match_data.match_percentage,
          matching_skills: en.match_data.matching_skills,
          missing_skills: en.match_data.missing_skills,
          is_eligible: en.eligibility.is_eligible,
        };
      });
    return sendJson(res, 200, jobs);
  }

  if (pathname === "/api/ml/skill-gap/") {
    const body = req.method === "POST" ? await readJsonBody(req) : {};
    const jobId = Number(body.job_id || searchParams.get("job_id") || 1);
    const jobRow =
      db.prepare("SELECT * FROM jobs WHERE id = ?").get(jobId) ||
      db.prepare("SELECT * FROM jobs LIMIT 1").get();
    const enriched = enrichJobForStudent(jobRow, studentPayload);
    const yourSkills = studentPayload.student_skills.map((s) => s.skill_name);
    const youHave = enriched.match_data.matching_skills;
    const youNeed = enriched.match_data.missing_skills;
    const highPriority = enriched.match_data.high_priority_missing;

    return sendJson(res, 200, {
      job: {
        id: enriched.id,
        title: enriched.title,
        company_name: enriched.company_name,
        location: enriched.location,
        ctc_lpa: enriched.ctc_lpa,
      },
      eligibility: enriched.eligibility,
      match_percentage: enriched.match_data.match_percentage,
      required_skills: [
        ...enriched.match_data.required_skills,
        ...enriched.match_data.preferred_skills,
      ],
      your_skills: yourSkills,
      you_have: youHave,
      you_need: youNeed,
      high_priority: highPriority,
      action_plan: youNeed.map(
        (sk) =>
          `Complete hands-on practice in ${sk} and integrate it into a portfolio project to boost your match score.`
      ),
    });
  }

  if (pathname === "/api/ml/parse-jd/" && req.method === "POST") {
    const body = await readJsonBody(req);
    const jdText = (body.jd_text || "").toLowerCase();
    const allSkills = db.prepare("SELECT name FROM skills").all();
    const detected = allSkills
      .filter((s) => jdText.includes(s.name.toLowerCase()))
      .map((s) => s.name);
    return sendJson(res, 200, {
      required_skills: detected.length ? detected.slice(0, 5) : ["Java", "DSA", "SQL"],
      preferred_skills: detected.slice(5),
    });
  }

  // Analytics: Student Dashboard
  if (pathname === "/api/analytics/student-dashboard/" && req.method === "GET") {
    const roadmap = db
      .prepare(`
        SELECT stp.id, t.id as topic_id, t.title, t.category, t.description,
               t.topic_order as 'order', t.estimated_hours, stp.status
        FROM student_topic_progress stp
        JOIN topics t ON stp.topic_id = t.id
        WHERE stp.student_id = ?
        ORDER BY t.topic_order
      `)
      .all(studentPayload.id);

    const upcoming_tasks = db
      .prepare(
        "SELECT * FROM study_tasks WHERE student_id = ? AND status != 'COMPLETED' ORDER BY scheduled_date, id LIMIT 5"
      )
      .all(studentPayload.id);

    const recommended_jobs = db
      .prepare("SELECT * FROM jobs WHERE status = 'PUBLISHED' ORDER BY id LIMIT 4")
      .all()
      .map((j) => enrichJobForStudent(j, studentPayload));

    return sendJson(res, 200, {
      profile: studentPayload,
      roadmap,
      upcoming_tasks,
      recommended_jobs,
    });
  }

  // Analytics: Platform & 9 Recharts Datasets
  if (pathname === "/api/analytics/" && req.method === "GET") {
    const totalStudents = db.prepare("SELECT COUNT(*) as c FROM student_profiles").get().c;
    const activeJobs = db
      .prepare("SELECT COUNT(*) as c FROM jobs WHERE status = 'PUBLISHED'")
      .get().c;
    const totalApps = db.prepare("SELECT COUNT(*) as c FROM applications").get().c;
    const placedStudents = db
      .prepare("SELECT COUNT(*) as c FROM student_profiles WHERE placement_status = 'PLACED'")
      .get().c;
    const internStudents = db
      .prepare("SELECT COUNT(*) as c FROM student_profiles WHERE placement_status = 'INTERNSHIP'")
      .get().c;
    const unplacedStudents = Math.max(0, totalStudents - placedStudents - internStudents);
    const totalCompanies = db.prepare("SELECT COUNT(*) as c FROM companies").get().c;
    const placementRate = Math.round((placedStudents / Math.max(totalStudents, 1)) * 100);

    return sendJson(res, 200, {
      kpis: {
        total_students: totalStudents,
        active_jobs: activeJobs,
        applications: totalApps,
        placed_students: placedStudents,
        placement_rate: placementRate,
        companies: totalCompanies,
      },
      admin_stats: {
        total_users: db.prepare("SELECT COUNT(*) as c FROM users").get().c,
        students_count: totalStudents,
        tpos_count: 1,
        admins_count: 1,
        active_invite_codes: db
          .prepare("SELECT COUNT(*) as c FROM invite_codes WHERE is_used = 0")
          .get().c,
        audit_events_count: db.prepare("SELECT COUNT(*) as c FROM audit_logs").get().c,
        locked_accounts: 0,
      },
      charts: {
        placement_trend: [
          { month: "Jul", placed: 1 },
          { month: "Aug", placed: 2 },
          { month: "Sep", placed: 2 },
          { month: "Oct", placed: 3 },
          { month: "Nov", placed: placedStudents },
        ],
        applications_over_time: [
          { month: "Jul", applications: 4 },
          { month: "Aug", applications: 9 },
          { month: "Sep", applications: 14 },
          { month: "Oct", applications: 21 },
          { month: "Nov", applications: Math.max(totalApps, 26) },
        ],
        branch_wise_placement: [
          { branch: "CSE", total: 3, placed: 1 },
          { branch: "ISE", total: 1, placed: 1 },
          { branch: "ECE", total: 1, placed: 0 },
          { branch: "AIML", total: 1, placed: 1 },
        ],
        company_wise_selection: [
          { company: "Oracle", applications: 4, selections: 1 },
          { company: "Google", applications: 3, selections: 1 },
          { company: "Atlassian", applications: 3, selections: 1 },
          { company: "Microsoft", applications: 2, selections: 1 },
          { company: "TCS", applications: 5, selections: 2 },
        ],
        skill_demand: [
          { skill: "Java", jobs: 4 },
          { skill: "SQL", jobs: 6 },
          { skill: "DSA", jobs: 5 },
          { skill: "Python", jobs: 4 },
          { skill: "React", jobs: 3 },
          { skill: "Docker", jobs: 4 },
        ],
        missing_skills: [
          { skill: "System Design", gap_percentage: 68 },
          { skill: "Docker", gap_percentage: 55 },
          { skill: "AWS", gap_percentage: 62 },
          { skill: "FastAPI", gap_percentage: 48 },
        ],
        application_stages: [
          { stage: "Applied", count: 5 },
          { stage: "Assessment", count: 4 },
          { stage: "Tech Interview", count: 3 },
          { stage: "HR Interview", count: 2 },
          { stage: "Selected", count: 3 },
        ],
        cgpa_distribution: [
          { range: "9.0 - 10.0", students: 3 },
          { range: "8.0 - 8.99", students: 2 },
          { range: "7.0 - 7.99", students: 1 },
        ],
        placement_rate: [
          { name: "Placed", value: placedStudents, color: "#32B67A" },
          { name: "Internship", value: internStudents, color: "#6555F5" },
          { name: "Preparing", value: unplacedStudents, color: "#F4B942" },
        ],
      },
    });
  }

  return sendJson(res, 404, { detail: `Endpoint ${pathname} not found.` });
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

function requestListener(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname;

  if (pathname.startsWith("/api/")) {
    return handleApiRequest(req, res, pathname, parsedUrl.searchParams);
  }

  let filePath = path.join(DIST_DIR, pathname === "/" ? "index.html" : pathname);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, "index.html");
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  res.writeHead(200, { "Content-Type": contentType });
  fs.createReadStream(filePath).pipe(res);
}

const PORT = Number(process.env.PORT || 5173);
const server = http.createServer(requestListener);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`========================================================`);
  console.log(`  PlaceTrace Full-Stack Server Running Locally!`);
  console.log(`  App & API URL:  http://localhost:${PORT}`);
  console.log(`  Database:       ${DB_PATH}`);
  console.log(`========================================================`);
});
