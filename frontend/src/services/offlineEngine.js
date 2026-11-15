const STORAGE_KEY = "placetrace_browser_db_v1";

function getInitialDb() {
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const dayAfterStr = new Date(Date.now() + 172800000).toISOString().split("T")[0];

  return {
    users: [
      {
        id: "usr-dhanyashree-01",
        email: "dhanyashree@placetrace.edu",
        full_name: "Dhanyashree N",
        passwords: ["Student@12345", "Password@123"],
        role: "STUDENT",
        is_active: true,
        is_email_verified: true,
        created_at: "2026-11-01T10:00:00Z",
      },
      {
        id: "usr-rahul-01",
        email: "rahul@college.edu",
        full_name: "Rahul Sharma",
        passwords: ["Password@123", "Student@12345"],
        role: "STUDENT",
        is_active: true,
        is_email_verified: true,
        created_at: "2026-11-01T10:00:00Z",
      },
      {
        id: "usr-tpo-01",
        email: "tpo@placetrace.edu",
        full_name: "Prof. Meenakshi Sundaram",
        passwords: ["Tpo@12345", "Password@123"],
        role: "TPO",
        is_active: true,
        is_email_verified: true,
        created_at: "2026-11-01T10:00:00Z",
      },
      {
        id: "usr-tpo-02",
        email: "tpo@college.edu",
        full_name: "Prof. Meenakshi Sundaram",
        passwords: ["Password@123", "Tpo@12345"],
        role: "TPO",
        is_active: true,
        is_email_verified: true,
        created_at: "2026-11-01T10:00:00Z",
      },
      {
        id: "usr-admin-01",
        email: "admin@placetrace.edu",
        full_name: "Dr. Rajeshwar Rao",
        passwords: ["Admin@12345", "Password@123"],
        role: "ADMIN",
        is_active: true,
        is_email_verified: true,
        created_at: "2026-11-01T10:00:00Z",
      },
      {
        id: "usr-peer-1",
        email: "arjun@placetrace.edu",
        full_name: "Arjun Sharma",
        passwords: ["Student@12345", "Password@123"],
        role: "STUDENT",
        is_active: true,
        is_email_verified: true,
        created_at: "2026-11-02T10:00:00Z",
      },
      {
        id: "usr-peer-2",
        email: "priya@placetrace.edu",
        full_name: "Priya Nair",
        passwords: ["Student@12345", "Password@123"],
        role: "STUDENT",
        is_active: true,
        is_email_verified: true,
        created_at: "2026-11-03T10:00:00Z",
      },
      {
        id: "usr-peer-3",
        email: "rohan@placetrace.edu",
        full_name: "Rohan Kulkarni",
        passwords: ["Student@12345", "Password@123"],
        role: "STUDENT",
        is_active: true,
        is_email_verified: true,
        created_at: "2026-11-04T10:00:00Z",
      },
      {
        id: "usr-peer-4",
        email: "sneha@placetrace.edu",
        full_name: "Sneha Verma",
        passwords: ["Student@12345", "Password@123"],
        role: "STUDENT",
        is_active: true,
        is_email_verified: true,
        created_at: "2026-11-05T10:00:00Z",
      },
    ],
    skills: [
      { id: 1, name: "Java", category: "PROGRAMMING" },
      { id: 2, name: "DSA", category: "CORE_CS" },
      { id: 3, name: "Problem Solving", category: "CORE_CS" },
      { id: 4, name: "System Design", category: "CORE_CS" },
      { id: 5, name: "HTML", category: "FRONTEND" },
      { id: 6, name: "CSS", category: "FRONTEND" },
      { id: 7, name: "JavaScript", category: "PROGRAMMING" },
      { id: 8, name: "TypeScript", category: "PROGRAMMING" },
      { id: 9, name: "React", category: "FRONTEND" },
      { id: 10, name: "Python", category: "PROGRAMMING" },
      { id: 11, name: "Django", category: "BACKEND" },
      { id: 12, name: "FastAPI", category: "BACKEND" },
      { id: 13, name: "SQL", category: "DATABASE" },
      { id: 14, name: "PostgreSQL", category: "DATABASE" },
      { id: 15, name: "Git", category: "TOOLS" },
      { id: 16, name: "Docker", category: "DEVOPS" },
      { id: 17, name: "Linux", category: "DEVOPS" },
      { id: 18, name: "AWS", category: "DEVOPS" },
      { id: 19, name: "Operating Systems", category: "CORE_CS" },
      { id: 20, name: "DBMS", category: "CORE_CS" },
      { id: 21, name: "Computer Networks", category: "CORE_CS" },
      { id: 22, name: "Machine Learning", category: "DATA_SCIENCE" },
    ],
    student_profiles: [
      {
        id: 1,
        user_id: "usr-dhanyashree-01",
        usn: "1RN23CS042",
        college_name: "RNSIT",
        branch: "CSE",
        cgpa: 9.35,
        active_backlogs: 0,
        graduation_year: 2027,
        phone: "+91 98450 12345",
        bio: "Final-year Computer Science student passionate about Full-Stack Engineering, Java DSA, and scalable distributed systems.",
        github_url: "https://github.com/dhanyashree63",
        linkedin_url: "https://linkedin.com/in/dhanyashree-n",
        portfolio_url: "https://dhanyashree.dev",
        placement_status: "UNPLACED",
        readiness_score: 82,
        readiness_trend: 5,
      },
      {
        id: 2,
        user_id: "usr-rahul-01",
        usn: "1RN23CS088",
        college_name: "RNSIT",
        branch: "CSE",
        cgpa: 8.95,
        active_backlogs: 0,
        graduation_year: 2027,
        phone: "+91 98450 99999",
        bio: "Full-Stack & AI Engineer focused on React, Django, FastAPI, and cloud-native systems.",
        github_url: "https://github.com/dhanyashree63",
        linkedin_url: "https://linkedin.com/in/rahul-sharma",
        portfolio_url: "https://placetrace.edu",
        placement_status: "UNPLACED",
        readiness_score: 80,
        readiness_trend: 5,
      },
      {
        id: 3,
        user_id: "usr-peer-1",
        usn: "1RN23CS018",
        college_name: "RNSIT",
        branch: "CSE",
        cgpa: 9.12,
        active_backlogs: 0,
        graduation_year: 2027,
        placement_status: "PLACED",
        readiness_score: 86,
        skills_list: ["Java", "DSA", "SQL", "Docker"],
      },
      {
        id: 4,
        user_id: "usr-peer-2",
        usn: "1RN23IS029",
        college_name: "RNSIT",
        branch: "ISE",
        cgpa: 8.85,
        active_backlogs: 0,
        graduation_year: 2027,
        placement_status: "PLACED",
        readiness_score: 84,
        skills_list: ["Python", "Machine Learning", "SQL", "FastAPI"],
      },
      {
        id: 5,
        user_id: "usr-peer-3",
        usn: "1RN23EC051",
        college_name: "RNSIT",
        branch: "ECE",
        cgpa: 8.4,
        active_backlogs: 0,
        graduation_year: 2027,
        placement_status: "INTERNSHIP",
        readiness_score: 74,
        skills_list: ["DSA", "Python", "Linux"],
      },
      {
        id: 6,
        user_id: "usr-peer-4",
        usn: "1RN23AI011",
        college_name: "RNSIT",
        branch: "AIML",
        cgpa: 9.05,
        active_backlogs: 0,
        graduation_year: 2027,
        placement_status: "PLACED",
        readiness_score: 88,
        skills_list: ["Python", "Machine Learning", "SQL", "React", "AWS"],
      },
    ],
    student_skills: [
      { id: 1, student_id: 1, skill: 1, skill_name: "Java", category: "PROGRAMMING", proficiency: "EXPERT", is_verified: true },
      { id: 2, student_id: 1, skill: 2, skill_name: "DSA", category: "CORE_CS", proficiency: "ADVANCED", is_verified: true },
      { id: 3, student_id: 1, skill: 5, skill_name: "HTML", category: "FRONTEND", proficiency: "ADVANCED", is_verified: true },
      { id: 4, student_id: 1, skill: 6, skill_name: "CSS", category: "FRONTEND", proficiency: "ADVANCED", is_verified: true },
      { id: 5, student_id: 1, skill: 7, skill_name: "JavaScript", category: "PROGRAMMING", proficiency: "ADVANCED", is_verified: true },
      { id: 6, student_id: 1, skill: 9, skill_name: "React", category: "FRONTEND", proficiency: "ADVANCED", is_verified: true },
      { id: 7, student_id: 1, skill: 10, skill_name: "Python", category: "PROGRAMMING", proficiency: "ADVANCED", is_verified: true },
      { id: 8, student_id: 1, skill: 11, skill_name: "Django", category: "BACKEND", proficiency: "ADVANCED", is_verified: true },
      { id: 9, student_id: 1, skill: 13, skill_name: "SQL", category: "DATABASE", proficiency: "ADVANCED", is_verified: true },
      { id: 10, student_id: 1, skill: 15, skill_name: "Git", category: "TOOLS", proficiency: "ADVANCED", is_verified: true },
      { id: 11, student_id: 1, skill: 17, skill_name: "Linux", category: "DEVOPS", proficiency: "INTERMEDIATE", is_verified: true },
      { id: 12, student_id: 1, skill: 3, skill_name: "Problem Solving", category: "CORE_CS", proficiency: "ADVANCED", is_verified: true },
    ],
    roadmap: [
      { id: 1, topic_id: 1, order: 1, title: "Java Fundamentals", category: "Core Programming", description: "OOPs, Collections, Exception Handling, Streams & JVM internals", estimated_hours: 16, status: "COMPLETED" },
      { id: 2, topic_id: 2, order: 2, title: "Java DSA", category: "Data Structures & Algorithms", description: "Arrays, Linked Lists, Trees, Graphs, Dynamic Programming & Sliding Window", estimated_hours: 40, status: "COMPLETED" },
      { id: 3, topic_id: 3, order: 3, title: "Full Stack Development", category: "Web Engineering", description: "React UI architecture, Django REST APIs, JWT Auth & state management", estimated_hours: 35, status: "IN_PROGRESS" },
      { id: 4, topic_id: 4, order: 4, title: "SQL & Databases", category: "Database Systems", description: "Complex joins, indexing, query optimization, ACID transactions & PostgreSQL", estimated_hours: 18, status: "NOT_STARTED" },
      { id: 5, topic_id: 5, order: 5, title: "Git, Docker & Deployment", category: "DevOps & Cloud", description: "Git workflows, multi-container Docker Compose, Nginx & Caddy HTTPS", estimated_hours: 14, status: "NOT_STARTED" },
      { id: 6, topic_id: 6, order: 6, title: "Operating Systems & DBMS", category: "CS Fundamentals", description: "Process scheduling, deadlocks, virtual memory & normalization", estimated_hours: 20, status: "COMPLETED" },
      { id: 7, topic_id: 7, order: 7, title: "Computer Networks", category: "CS Fundamentals", description: "OSI layers, TCP/IP handshake, DNS, HTTP/2 & TLS security", estimated_hours: 14, status: "COMPLETED" },
      { id: 8, topic_id: 8, order: 8, title: "System Design & Interviews", category: "Architecture", description: "Load balancing, caching, rate limiting, sharding & mock interviews", estimated_hours: 22, status: "NOT_STARTED" },
    ],
    study_tasks: [
      { id: 1, title: "DSA Practice", category: "Coding Practice", scheduled_date: todayStr, scheduled_time: "7:00 PM", priority: "HIGH", status: "PENDING" },
      { id: 2, title: "React Basics Revision", category: "Revision Tasks", scheduled_date: tomorrowStr, scheduled_time: "8:00 AM", priority: "MEDIUM", status: "PENDING" },
      { id: 3, title: "Take Mock Test #2", category: "Mock Tests", scheduled_date: dayAfterStr, scheduled_time: "10:00 AM", priority: "HIGH", status: "PENDING" },
      { id: 4, title: "SQL Indexing Deep Dive", category: "Study Tasks", scheduled_date: todayStr, scheduled_time: "5:00 PM", priority: "MEDIUM", status: "COMPLETED" },
    ],
    companies: [
      { id: 1, name: "Oracle", industry: "Cloud & Database Systems", website: "https://www.oracle.com", headquarters: "Bengaluru", logo_color: "#C74634", status: "ACTIVE", description: "Global leader in enterprise cloud infrastructure and relational database engines." },
      { id: 2, name: "Google", industry: "Internet & Cloud Platforms", website: "https://careers.google.com", headquarters: "Bengaluru", logo_color: "#4285F4", status: "ACTIVE", description: "Organizing the world's information and building planetary-scale distributed systems." },
      { id: 3, name: "Atlassian", industry: "Developer Collaboration Tools", website: "https://www.atlassian.com", headquarters: "Bengaluru", logo_color: "#0052CC", status: "ACTIVE", description: "Creators of Jira, Confluence, Bitbucket, and modern agile engineering tools." },
      { id: 4, name: "Microsoft", industry: "Cloud & AI Platforms", website: "https://careers.microsoft.com", headquarters: "Hyderabad", logo_color: "#00A4EF", status: "ACTIVE", description: "Empowering every developer and enterprise with Azure and AI." },
      { id: 5, name: "Stripe", industry: "Financial Infrastructure", website: "https://stripe.com", headquarters: "Bengaluru", logo_color: "#635BFF", status: "ACTIVE", description: "Economic infrastructure and payment APIs for the internet." },
      { id: 6, name: "TCS", industry: "IT Services & Consulting", website: "https://www.tcs.com", headquarters: "Bengaluru", logo_color: "#6555F5", status: "ACTIVE", description: "Global leader in digital transformation and enterprise engineering." },
    ],
    jobs: [
      {
        id: 1,
        company_id: 1,
        title: "Software Development Engineer",
        category: "SOFTWARE_DEVELOPMENT",
        location: "Bengaluru",
        employment_type: "Full Time",
        ctc_lpa: 19.5,
        min_cgpa: 7.0,
        allowed_branches: ["CSE", "ISE", "ECE"],
        graduation_year: 2027,
        deadline: "2026-12-15",
        status: "PUBLISHED",
        about_role: "Join Oracle Cloud Infrastructure (OCI) to architect and scale high-throughput distributed services and database engines.",
        description: "Design resilient backend microservices in Java and Python, optimize SQL query execution plans, and collaborate on cloud-native deployments using Docker.",
        responsibilities: [
          "Design, implement, and maintain low-latency backend services in Java and Python.",
          "Write clean, well-tested code and participate in architecture & system design reviews.",
          "Optimize relational database schemas and SQL queries for high concurrency.",
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
        ],
        req: ["Java", "DSA", "Problem Solving", "SQL", "React", "Git"],
        pref: ["Docker", "System Design", "AWS"],
      },
      {
        id: 2,
        company_id: 2,
        title: "Software Engineer - University Graduate",
        category: "SOFTWARE_DEVELOPMENT",
        location: "Bengaluru",
        employment_type: "Full Time",
        ctc_lpa: 32.0,
        min_cgpa: 8.0,
        allowed_branches: ["CSE", "ISE", "AIML"],
        graduation_year: 2027,
        deadline: "2026-12-20",
        status: "PUBLISHED",
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
        interview_tips: ["Communicate time and space complexity clearly before writing code."],
        req: ["Java", "DSA", "Problem Solving", "Python", "Operating Systems"],
        pref: ["System Design", "Docker", "Linux"],
      },
      {
        id: 3,
        company_id: 3,
        title: "Full Stack Software Engineer",
        category: "SOFTWARE_DEVELOPMENT",
        location: "Bengaluru",
        employment_type: "Full Time",
        ctc_lpa: 26.5,
        min_cgpa: 7.5,
        allowed_branches: ["CSE", "ISE", "ECE", "AIML"],
        graduation_year: 2027,
        deadline: "2026-12-18",
        status: "PUBLISHED",
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
        id: 4,
        company_id: 4,
        title: "Data & Applied Scientist",
        category: "DATA_SCIENCE",
        location: "Hyderabad",
        employment_type: "Full Time",
        ctc_lpa: 28.0,
        min_cgpa: 8.0,
        allowed_branches: ["CSE", "ISE", "AIML"],
        graduation_year: 2027,
        deadline: "2026-12-22",
        status: "PUBLISHED",
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
    ],
    saved_job_ids: [],
    applications: [
      {
        id: 1,
        student_id: 1,
        job_id: 1,
        stage: "TECHNICAL_INTERVIEW",
        match_score: 82,
        notes: "Cleared Online Assessment (3/3). Preparing Java concurrency & System Design.",
        applied_at: "2026-11-12T10:00:00Z",
      },
      {
        id: 2,
        student_id: 1,
        job_id: 3,
        stage: "ASSESSMENT",
        match_score: 85,
        notes: "Coding test scheduled for Saturday.",
        applied_at: "2026-11-13T14:30:00Z",
      },
    ],
    projects: [
      {
        id: 1,
        title: "PlaceTrace",
        description: "Intelligent placement tracking and career management platform with ML resume parsing, skill-gap analysis, and real-time readiness analytics.",
        technologies: ["React", "Django", "PostgreSQL", "FastAPI", "Docker"],
        github_url: "https://github.com/dhanyashree63/Placement-Trace",
        live_url: "https://placetrace.edu",
        role: "Lead Full Stack Developer",
        status: "COMPLETED",
      },
      {
        id: 2,
        title: "CloudSync Distributed Cache",
        description: "High-throughput LRU caching service in Java with consistent hashing, TCP socket protocol, and latency monitoring.",
        technologies: ["Java", "DSA", "Linux", "Docker", "Git"],
        github_url: "https://github.com/dhanyashree63/cloudsync-cache",
        live_url: "https://cloudsync-demo.dev",
        role: "Backend Systems Developer",
        status: "COMPLETED",
      },
      {
        id: 3,
        title: "DevPulse Code Reviewer",
        description: "Automated pull-request static analyzer using Python, Django REST Framework, and React dashboard reducing review turnaround by 40%.",
        technologies: ["Python", "Django", "React", "SQL", "Git"],
        github_url: "https://github.com/dhanyashree63/devpulse",
        live_url: "https://devpulse.dev",
        role: "Full Stack Engineer",
        status: "COMPLETED",
      },
    ],
    current_resume: {
      id: 1,
      file_name: "Dhanyashree_N_Resume_2026.pdf",
      file_size: 240000,
      mime_type: "application/pdf",
      raw_text: "Dhanyashree N\nB.E in Computer Science & Engineering, RNSIT | CGPA: 9.35\nSkills: Java, Python, SQL, React, Django, DSA, Git\nProjects: PlaceTrace, CloudSync Distributed Cache, DevPulse.",
      status: "ANALYZED",
      resume_score: 82,
      strengths: [
        "Strong Java knowledge",
        "Good project experience",
        "Solid full-stack skill coverage (Java, Python, SQL, React, Django)",
      ],
      improvement_areas: [
        "Add measurable project impact",
        "Improve system-design section",
        "Highlight cloud deployment & containerization tools (Docker, AWS)",
      ],
      section_scores: { skills: 88, projects: 86, impact: 78, experience: 76, education: 95 },
      uploaded_at: "2026-11-12T09:00:00Z",
      analyzed_at: "2026-11-12T09:00:05Z",
      extracted_skills: [
        { id: 1, skill_name: "Java", confidence: 0.96 },
        { id: 2, skill_name: "Python", confidence: 0.94 },
        { id: 3, skill_name: "SQL", confidence: 0.94 },
        { id: 4, skill_name: "React", confidence: 0.92 },
        { id: 5, skill_name: "Django", confidence: 0.92 },
        { id: 6, skill_name: "DSA", confidence: 0.95 },
        { id: 7, skill_name: "Git", confidence: 0.90 },
      ],
    },
    activities: [
      { id: 1, activity_type: "RESUME", title: "Resume updated & analyzed (82/100)", created_at: "2026-11-14T10:00:00Z" },
      { id: 2, activity_type: "SKILL", title: "Skill added: React & Django", created_at: "2026-11-14T09:00:00Z" },
      { id: 3, activity_type: "APPLICATION", title: "Applied to Oracle (Software Development Engineer)", created_at: "2026-11-13T18:00:00Z" },
      { id: 4, activity_type: "TOPIC", title: "Completed Java DSA roadmap milestone", created_at: "2026-11-13T15:00:00Z" },
      { id: 5, activity_type: "QUIZ", title: "Completed Java Core & Multithreading Mock Test (90%)", created_at: "2026-11-12T11:00:00Z" },
    ],
    notifications: [
      {
        id: 1,
        title: "Technical Interview Shortlist: Oracle",
        message: "Congratulations! You cleared the Assessment round for Software Development Engineer at Oracle.",
        notification_type: "INTERVIEW",
        link: "/applications",
        is_read: false,
        created_at: "2026-11-14T12:00:00Z",
      },
      {
        id: 2,
        title: "New High-Match Drive: Atlassian",
        message: "Atlassian is hiring Full Stack Software Engineers (85% skill match with your profile).",
        notification_type: "JOB_MATCH",
        link: "/jobs",
        is_read: false,
        created_at: "2026-11-13T16:00:00Z",
      },
    ],
    quizzes: [
      {
        id: 1,
        title: "Java Core & Multithreading Mock Test",
        category: "Java",
        quiz_type: "MOCK_TEST",
        difficulty: "Intermediate",
        duration_minutes: 20,
        description: "Assess your command of JVM memory model, Collections, Streams, and concurrency.",
        best_percentage: 90,
        questions: [
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
      },
      {
        id: 2,
        title: "DSA Trees, Graphs & DP Challenge",
        category: "DSA",
        quiz_type: "CODING",
        difficulty: "Advanced",
        duration_minutes: 30,
        description: "Core algorithmic problem solving covering shortest paths, tree traversals, and dynamic programming.",
        best_percentage: 85,
        questions: [
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
      },
      {
        id: 3,
        title: "SQL & PostgreSQL Optimization Quiz",
        category: "SQL",
        quiz_type: "MCQ",
        difficulty: "Intermediate",
        duration_minutes: 15,
        description: "Test your mastery of window functions, B-tree indexes, ACID properties, and query plans.",
        best_percentage: 92,
        questions: [
          {
            id: 20,
            prompt: "Which SQL clause filters groups created by GROUP BY?",
            options: ["WHERE", "HAVING", "QUALIFY", "DISTINCT"],
            correct_index: 1,
            explanation: "HAVING filters aggregated groups after GROUP BY.",
          },
        ],
      },
      {
        id: 4,
        title: "System Design & Scalable Architecture",
        category: "System Design",
        quiz_type: "MOCK_TEST",
        difficulty: "Advanced",
        duration_minutes: 25,
        description: "Load balancers, consistent hashing, CAP theorem, rate limiting, and database sharding.",
        best_percentage: 80,
        questions: [
          {
            id: 30,
            prompt: "In the CAP theorem, during a network partition (P), a distributed store must choose between:",
            options: ["Latency & Throughput", "Consistency & Availability", "Sharding & Replication", "SQL & NoSQL"],
            correct_index: 1,
            explanation: "During a partition, a distributed system trades off Consistency (C) vs Availability (A).",
          },
        ],
      },
    ],
    quiz_attempts: [
      { id: 1, quiz_id: 1, quiz_title: "Java Core & Multithreading Mock Test", category: "Java", quiz_type: "MOCK_TEST", score: 2, total_questions: 2, percentage: 90, attempted_at: "2026-11-12T10:00:00Z" },
      { id: 2, quiz_id: 2, quiz_title: "DSA Trees, Graphs & DP Challenge", category: "DSA", quiz_type: "CODING", score: 2, total_questions: 2, percentage: 85, attempted_at: "2026-11-11T10:00:00Z" },
      { id: 3, quiz_id: 3, quiz_title: "SQL & PostgreSQL Optimization Quiz", category: "SQL", quiz_type: "MCQ", score: 1, total_questions: 1, percentage: 92, attempted_at: "2026-11-10T10:00:00Z" },
      { id: 4, quiz_id: 4, quiz_title: "System Design & Scalable Architecture", category: "System Design", quiz_type: "MOCK_TEST", score: 1, total_questions: 1, percentage: 80, attempted_at: "2026-11-09T10:00:00Z" },
    ],
    resources: [
      { id: 1, title: "Java & JVM Deep Dive Handbook", description: "Comprehensive guide to Java 21, Collections, Concurrency, and JVM garbage collection.", resource_type: "Handbook", external_link: "https://dev.java/learn/", difficulty: "Intermediate", category: "Java" },
      { id: 2, title: "Striver's A2Z DSA Placement Sheet", description: "Structured 150-problem roadmap covering arrays, graphs, trees, and dynamic programming.", resource_type: "Practice Sheet", external_link: "https://takeuforward.org/", difficulty: "Intermediate", category: "DSA" },
      { id: 3, title: "PostgreSQL Indexing & Query Tuning", description: "Practical reference on B-Tree indexes, EXPLAIN ANALYZE, joins, and transactions.", resource_type: "Documentation", external_link: "https://www.postgresql.org/docs/", difficulty: "Intermediate", category: "SQL" },
      { id: 4, title: "Full-Stack React & Django Architecture", description: "End-to-end production guide for building JWT-authenticated React + Django REST applications.", resource_type: "Guide", external_link: "https://www.django-rest-framework.org/", difficulty: "Intermediate", category: "Web Development" },
      { id: 5, title: "System Design Primer for Placements", description: "Visual walkthrough of load balancers, caching, message queues, and rate limiters.", resource_type: "Handbook", external_link: "https://github.com/donnemartin/system-design-primer", difficulty: "Advanced", category: "Interview Preparation" },
      { id: 6, title: "Operating Systems Three Easy Pieces", description: "Core concepts in virtualization, concurrency, deadlocks, and persistence.", resource_type: "Handbook", external_link: "https://pages.cs.wisc.edu/~remzi/OSTEP/", difficulty: "Intermediate", category: "Operating Systems" },
    ],
    invite_codes: [
      { id: 1, code: "PT-TPO2026", role: "TPO", department: "Placement Cell", is_used: 0, expires_at: "2027-12-31T23:59:59Z" },
    ],
    audit_logs: [
      { id: 1, actor_email: "admin@placetrace.edu", action: "SYSTEM_INITIALIZED", target_model: "System", target_id: "1", details: { status: "seeded" }, ip_address: "127.0.0.1", created_at: "2026-11-13T10:00:00Z" },
      { id: 2, actor_email: "tpo@placetrace.edu", action: "JOB_CREATED", target_model: "Job", target_id: "1", details: { company: "Oracle" }, ip_address: "127.0.0.1", created_at: "2026-11-14T10:00:00Z" },
    ],
  };
}

function loadDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  const initial = getInitialDb();
  saveDb(initial);
  return initial;
}

function saveDb(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // ignore
  }
}

function getCurrentUser(db) {
  try {
    const raw = localStorage.getItem("placetrace_tokens");
    if (raw) {
      const parsed = JSON.parse(raw);
      const uid = parsed?.user_id || "usr-dhanyashree-01";
      const found = db.users.find((u) => u.id === uid);
      if (found) return found;
    }
  } catch {
    // ignore
  }
  return db.users[0];
}

function buildStudentPayload(db, user) {
  const profile = db.student_profiles.find((p) => p.user_id === user.id) || db.student_profiles[0];
  const skillsCnt = db.student_skills.length;
  const resumeScore = db.current_resume?.resume_score || 82;
  const completedTopics = db.roadmap.filter((t) => t.status === "COMPLETED").length;
  const inProgTopics = db.roadmap.filter((t) => t.status === "IN_PROGRESS").length;
  const tasksDone = db.study_tasks.filter((t) => t.status === "COMPLETED").length;

  const breakdown = {
    profile_completion: 95,
    resume_readiness: resumeScore,
    technical_skills: Math.min(100, Math.round((skillsCnt / 10) * 100)),
    dsa_and_roadmap: Math.min(100, Math.round(((completedTopics + inProgTopics * 0.4) / db.roadmap.length) * 100)),
    mock_test_performance: db.quiz_attempts.length
      ? Math.round(db.quiz_attempts.reduce((a, b) => a + b.percentage, 0) / db.quiz_attempts.length)
      : 85,
    projects_score: Math.min(100, db.projects.length * 34),
    applications_activity: Math.min(100, Math.round((Math.min(db.applications.length, 3) / 3) * 100)),
    interview_prep: Math.min(100, 65 + tasksDone * 12),
  };

  const score = Math.round(
    0.12 * breakdown.profile_completion +
      0.14 * breakdown.resume_readiness +
      0.18 * breakdown.technical_skills +
      0.16 * breakdown.dsa_and_roadmap +
      0.14 * breakdown.mock_test_performance +
      0.12 * breakdown.projects_score +
      0.07 * breakdown.applications_activity +
      0.07 * breakdown.interview_prep
  );

  profile.readiness_score = score;

  return {
    id: profile.id,
    user: user.id,
    full_name: user.full_name,
    email: user.email,
    usn: profile.usn,
    college_name: profile.college_name,
    branch: profile.branch,
    cgpa: Number(profile.cgpa).toFixed(2),
    active_backlogs: profile.active_backlogs || 0,
    graduation_year: profile.graduation_year || 2027,
    phone: profile.phone || "+91 98450 12345",
    bio: profile.bio || "",
    linkedin_url: profile.linkedin_url || "",
    github_url: profile.github_url || "",
    portfolio_url: profile.portfolio_url || "",
    placement_status: profile.placement_status || "UNPLACED",
    readiness_score: score,
    readiness_trend: 5,
    readiness_breakdown: breakdown,
    student_skills: db.student_skills,
    current_resume: db.current_resume,
    activities: db.activities,
    kpis: {
      readiness_score: score,
      readiness_trend: 5,
      topics_completed: completedTopics,
      total_topics: db.roadmap.length,
      mock_tests_count: db.quiz_attempts.length,
      mock_tests_trend: 1,
      projects_count: db.projects.length,
      applications_count: db.applications.length,
    },
  };
}

function enrichJob(db, job, studentPayload) {
  const company = db.companies.find((c) => c.id === job.company_id) || db.companies[0];
  const stuSet = new Set(studentPayload.student_skills.map((s) => s.skill_name.toLowerCase()));
  const reqSkills = job.req || ["Java", "DSA", "SQL"];
  const prefSkills = job.pref || ["Docker"];

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
  const allowedBranches = job.allowed_branches || ["CSE", "ISE", "ECE"];
  const branchOk = allowedBranches.includes(studentPayload.branch);
  const cgpaOk = Number(studentPayload.cgpa) >= Number(job.min_cgpa || 7.0);
  const backlogsOk = Number(studentPayload.active_backlogs || 0) <= 0;
  const is_eligible = branchOk && cgpaOk && backlogsOk;

  const checks = [
    { key: "degree", label: "B.E / B.Tech", passed: true, student_value: "B.E / B.Tech" },
    { key: "branch", label: allowedBranches.join(" / "), passed: branchOk, student_value: studentPayload.branch },
    { key: "cgpa", label: `CGPA: ${Number(job.min_cgpa).toFixed(1)}+`, passed: cgpaOk, student_value: `CGPA: ${studentPayload.cgpa}` },
    { key: "backlogs", label: "No active backlogs", passed: backlogsOk, student_value: "0 active backlogs" },
  ];

  return {
    id: job.id,
    company: company.id,
    company_name: company.name,
    company_logo_color: company.logo_color,
    company_website: company.website,
    company_industry: company.industry,
    company_description: company.description,
    title: job.title,
    category: job.category,
    location: job.location,
    employment_type: job.employment_type,
    ctc_lpa: Number(job.ctc_lpa).toFixed(2),
    about_role: job.about_role,
    description: job.description,
    responsibilities: job.responsibilities || [],
    syllabus: job.syllabus || [],
    interview_tips: job.interview_tips || [],
    allowed_branches: allowedBranches,
    min_cgpa: Number(job.min_cgpa).toFixed(2),
    graduation_year: job.graduation_year || 2027,
    deadline: job.deadline || "2026-12-15",
    apply_link: company.website,
    status: job.status || "PUBLISHED",
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
    recommendation_reasons: [
      `Meets academic criteria (${studentPayload.branch}, CGPA ${studentPayload.cgpa} >= ${job.min_cgpa})`,
      `Matches your skills in ${matching_skills.slice(0, 4).join(", ")} (${match_percentage}% match)`,
    ],
    is_saved: db.saved_job_ids.includes(job.id),
    has_applied: db.applications.some((a) => a.job_id === job.id),
    applicants_count: db.applications.filter((a) => a.job_id === job.id).length + 2,
  };
}

function buildTimeline(stage) {
  const orderMap = { APPLIED: 1, ASSESSMENT: 2, TECHNICAL_INTERVIEW: 3, HR_INTERVIEW: 4, SELECTED: 5, REJECTED: 5 };
  const currentIdx = orderMap[stage] || 1;
  const steps = [
    [1, "Applied"],
    [2, "Assessment"],
    [3, "Technical Interview"],
    [4, "HR Interview"],
    [5, stage === "SELECTED" ? "Selected" : stage === "REJECTED" ? "Rejected" : "Final Decision"],
  ];
  return steps.map(([order, name]) => ({
    id: order,
    stage_name: name,
    order,
    state:
      order < currentIdx || (order === currentIdx && (stage === "SELECTED" || stage === "REJECTED"))
        ? "COMPLETED"
        : order === currentIdx
        ? "CURRENT"
        : "UPCOMING",
    event_date: order <= currentIdx ? "2026-11-12T10:00:00Z" : null,
  }));
}

export async function handleOfflineApi(endpoint, options = {}) {
  const db = loadDb();
  const method = (options.method || "GET").toUpperCase();
  let body = {};
  if (options.body && typeof options.body === "string") {
    try {
      body = JSON.parse(options.body);
    } catch {
      body = {};
    }
  }

  const [rawPath, queryStr = ""] = endpoint.split("?");
  const pathname = rawPath.startsWith("/api") ? rawPath : `/api${rawPath}`;
  const searchParams = new URLSearchParams(queryStr);

  // Auth: Login
  if (pathname === "/api/auth/login/" && method === "POST") {
    const email = (body.email || "").toLowerCase().trim();
    const pwd = body.password || "";
    const user = db.users.find((u) => u.email.toLowerCase() === email);
    if (!user || (user.passwords && !user.passwords.includes(pwd) && pwd !== "Password@123")) {
      const err = new Error("Invalid email or password.");
      err.status = 401;
      throw err;
    }
    const tokens = { access: `tok-${user.id}`, refresh: `ref-${user.id}`, user_id: user.id };
    return { user, tokens };
  }

  // Auth: Register
  if (pathname === "/api/auth/register/" && method === "POST") {
    const email = (body.email || "").toLowerCase().trim();
    const id = `usr-${Date.now()}`;
    const newUser = {
      id,
      email,
      full_name: body.full_name || "New Student",
      passwords: [body.password || "Student@12345"],
      role: body.role || "STUDENT",
      is_active: true,
      is_email_verified: true,
      created_at: new Date().toISOString(),
    };
    db.users.push(newUser);
    db.student_profiles.push({
      id: db.student_profiles.length + 1,
      user_id: id,
      usn: body.usn || `1RN23CS${String(Date.now()).slice(-3)}`,
      college_name: body.college_name || "RNSIT",
      branch: body.branch || "CSE",
      cgpa: Number(body.cgpa || 8.5),
      active_backlogs: 0,
      graduation_year: Number(body.graduation_year || 2027),
      placement_status: "UNPLACED",
      readiness_score: 78,
    });
    saveDb(db);
    const tokens = { access: `tok-${id}`, refresh: `ref-${id}`, user_id: id };
    return { user: newUser, tokens };
  }

  if (pathname === "/api/auth/logout/") return { detail: "Logged out." };
  if (pathname === "/api/auth/verify-email/" || pathname === "/api/auth/resend-verification/" || pathname === "/api/auth/forgot-password/" || pathname === "/api/auth/reset-password/") {
    return { detail: "Success" };
  }

  const currentUser = getCurrentUser(db);
  const studentPayload = buildStudentPayload(db, currentUser);

  if (pathname === "/api/auth/me/") {
    if (method === "PATCH") {
      if (body.full_name) currentUser.full_name = body.full_name;
      saveDb(db);
    }
    return currentUser;
  }

  if (pathname === "/api/auth/notifications/") {
    return db.notifications;
  }
  if (pathname.startsWith("/api/auth/notifications/") && method === "POST") {
    db.notifications.forEach((n) => (n.is_read = true));
    saveDb(db);
    return { detail: "Marked read" };
  }

  if (pathname === "/api/auth/export-data/") {
    return { exported_at: new Date().toISOString(), user: currentUser, student_profile: studentPayload };
  }

  if (pathname === "/api/auth/delete-account/") {
    return { detail: "Account deleted." };
  }

  if (pathname === "/api/auth/admin/users/") {
    return db.users;
  }
  if (pathname.startsWith("/api/auth/admin/users/") && method === "PATCH") {
    const uid = pathname.split("/").filter(Boolean).pop();
    const target = db.users.find((u) => String(u.id) === String(uid));
    if (target) {
      if (body.role) target.role = body.role;
      if (body.is_active !== undefined) target.is_active = Boolean(body.is_active);
      saveDb(db);
    }
    return target || {};
  }
  if (pathname === "/api/auth/admin/invite-codes/") {
    if (method === "POST") {
      const codeObj = {
        id: db.invite_codes.length + 1,
        code: `PT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        role: body.role || "TPO",
        department: body.department || "Placement Cell",
        is_used: 0,
        expires_at: "2027-12-31T23:59:59Z",
      };
      db.invite_codes.unshift(codeObj);
      saveDb(db);
      return codeObj;
    }
    return db.invite_codes;
  }
  if (pathname === "/api/auth/admin/audit-logs/") {
    return db.audit_logs;
  }

  if (pathname === "/api/students/me/") {
    if (method === "PATCH") {
      const profile = db.student_profiles.find((p) => p.user_id === currentUser.id) || db.student_profiles[0];
      if (body.full_name) currentUser.full_name = body.full_name;
      Object.assign(profile, body);
      saveDb(db);
      return buildStudentPayload(db, currentUser);
    }
    return studentPayload;
  }

  if (pathname === "/api/students/me/skills/") {
    if (method === "POST") {
      const sName = (body.skill_name || "Docker").trim();
      const newSk = {
        id: Date.now(),
        student_id: 1,
        skill: Date.now(),
        skill_name: sName,
        category: body.category || "PROGRAMMING",
        proficiency: body.proficiency || "INTERMEDIATE",
        is_verified: true,
      };
      db.student_skills.push(newSk);
      saveDb(db);
      return db.student_skills;
    }
    return db.student_skills;
  }

  if (pathname.startsWith("/api/students/me/skills/")) {
    const id = Number(pathname.split("/").filter(Boolean).pop());
    if (method === "DELETE") {
      db.student_skills = db.student_skills.filter((s) => s.id !== id);
      saveDb(db);
      return null;
    }
  }

  if (pathname === "/api/students/me/resume/") {
    if (method === "POST") {
      const rawText = body.raw_text || db.current_resume.raw_text;
      const matched = db.skills.filter((s) => rawText.toLowerCase().includes(s.name.toLowerCase()));
      const extNames = matched.length ? matched.map((m) => m.name) : ["Java", "Python", "SQL", "React", "Django"];
      const score = Math.min(96, 68 + extNames.length * 3);
      db.current_resume = {
        ...db.current_resume,
        raw_text: rawText,
        resume_score: score,
        analyzed_at: new Date().toISOString(),
        extracted_skills: extNames.map((n, i) => ({ id: i + 1, skill_name: n, confidence: 0.94 })),
      };
      saveDb(db);
      return db.current_resume;
    }
    return { current_resume: db.current_resume, history: [db.current_resume] };
  }

  if (pathname === "/api/students/") {
    const search = (searchParams.get("search") || "").toLowerCase();
    const branch = searchParams.get("branch") || "";
    const pStatus = searchParams.get("placement_status") || "";

    const results = db.student_profiles
      .map((p) => {
        const u = db.users.find((x) => x.id === p.user_id) || { full_name: "Student", email: "student@placetrace.edu" };
        const skills = p.skills_list || db.student_skills.map((s) => s.skill_name);
        return {
          id: p.id,
          full_name: u.full_name,
          email: u.email,
          usn: p.usn,
          branch: p.branch,
          cgpa: Number(p.cgpa).toFixed(2),
          placement_status: p.placement_status,
          readiness_score: p.readiness_score || 80,
          skills,
          applications_count: 2,
        };
      })
      .filter((item) => {
        if (branch && item.branch !== branch) return false;
        if (pStatus && item.placement_status !== pStatus) return false;
        if (search && !item.full_name.toLowerCase().includes(search) && !item.usn.toLowerCase().includes(search)) return false;
        return true;
      });
    return { results, count: results.length, current_page: 1, total_pages: 1 };
  }

  if (pathname.startsWith("/api/students/") && method === "PATCH") {
    const sid = Number(pathname.split("/").filter(Boolean).pop());
    const prof = db.student_profiles.find((p) => p.id === sid);
    if (prof && body.placement_status) {
      prof.placement_status = body.placement_status;
      saveDb(db);
    }
    return prof || {};
  }

  if (pathname === "/api/skills/") return db.skills;

  if (pathname === "/api/companies/") {
    if (method === "POST") {
      const comp = { id: db.companies.length + 1, status: "ACTIVE", logo_color: "#6555F5", ...body };
      db.companies.push(comp);
      saveDb(db);
      return comp;
    }
    return db.companies.map((c) => ({
      ...c,
      open_jobs_count: db.jobs.filter((j) => j.company_id === c.id).length,
      applications_count: 3,
      selections_count: 1,
    }));
  }

  if (pathname === "/api/jobs/recommended/") {
    return db.jobs.map((j) => enrichJob(db, j, studentPayload)).slice(0, 4);
  }

  if (pathname === "/api/jobs/") {
    if (method === "POST") {
      const created = {
        id: db.jobs.length + 1,
        company_id: Number(body.company || 1),
        title: body.title || "Software Engineer",
        category: body.category || "SOFTWARE_DEVELOPMENT",
        location: body.location || "Bengaluru",
        employment_type: body.employment_type || "Full Time",
        ctc_lpa: Number(body.ctc_lpa || 18),
        min_cgpa: Number(body.min_cgpa || 7.0),
        allowed_branches: body.allowed_branches || ["CSE", "ISE"],
        graduation_year: 2027,
        deadline: body.deadline || "2026-12-20",
        about_role: body.about_role || body.description || "",
        description: body.description || "",
        req: body.required_skill_names || ["Java", "DSA", "SQL"],
        pref: body.preferred_skill_names || ["Docker"],
        status: "PUBLISHED",
      };
      db.jobs.unshift(created);
      saveDb(db);
      return enrichJob(db, created, studentPayload);
    }

    const search = (searchParams.get("search") || "").toLowerCase();
    const category = searchParams.get("category") || "ALL";
    const eligibleOnly = searchParams.get("eligible_only") === "true";
    const savedOnly = searchParams.get("saved_only") === "true";

    const list = db.jobs
      .map((j) => enrichJob(db, j, studentPayload))
      .filter((j) => {
        if (category !== "ALL" && j.category !== category) return false;
        if (eligibleOnly && !j.eligibility.is_eligible) return false;
        if (savedOnly && !j.is_saved) return false;
        if (search && !j.title.toLowerCase().includes(search) && !j.company_name.toLowerCase().includes(search)) return false;
        return true;
      });
    return { results: list, count: list.length, total_pages: 1, current_page: 1 };
  }

  if (pathname.match(/^\/api\/jobs\/\d+\/bookmark\/$/)) {
    const jobId = Number(pathname.split("/")[3]);
    if (db.saved_job_ids.includes(jobId)) {
      db.saved_job_ids = db.saved_job_ids.filter((id) => id !== jobId);
      saveDb(db);
      return { saved: false };
    }
    db.saved_job_ids.push(jobId);
    saveDb(db);
    return { saved: true };
  }

  if (pathname.match(/^\/api\/jobs\/\d+\/$/)) {
    const jobId = Number(pathname.split("/")[3]);
    const job = db.jobs.find((j) => j.id === jobId) || db.jobs[0];
    if (method === "PATCH") {
      Object.assign(job, body);
      saveDb(db);
    }
    return enrichJob(db, job, studentPayload);
  }

  if (pathname === "/api/applications/") {
    if (method === "POST") {
      const jobId = Number(body.job);
      const job = db.jobs.find((j) => j.id === jobId) || db.jobs[0];
      const enriched = enrichJob(db, job, studentPayload);
      const appObj = {
        id: db.applications.length + 1,
        student_id: 1,
        job_id: jobId,
        stage: "APPLIED",
        match_score: enriched.match_data.match_percentage,
        notes: body.notes || "",
        applied_at: new Date().toISOString(),
      };
      db.applications.unshift(appObj);
      saveDb(db);
      return appObj;
    }

    const stageLabels = {
      APPLIED: "Applied",
      ASSESSMENT: "Assessment",
      TECHNICAL_INTERVIEW: "Technical Interview",
      HR_INTERVIEW: "HR Interview",
      SELECTED: "Selected",
      REJECTED: "Rejected",
    };

    return db.applications.map((a) => {
      const job = db.jobs.find((j) => j.id === a.job_id) || db.jobs[0];
      const comp = db.companies.find((c) => c.id === job.company_id) || db.companies[0];
      return {
        ...a,
        job_title: job.title,
        job_location: job.location,
        job_ctc: job.ctc_lpa,
        company_name: comp.name,
        company_logo_color: comp.logo_color,
        student_name: studentPayload.full_name,
        student_usn: studentPayload.usn,
        student_branch: studentPayload.branch,
        student_cgpa: studentPayload.cgpa,
        status_label: stageLabels[a.stage] || a.stage,
        timeline: buildTimeline(a.stage),
      };
    });
  }

  if (pathname.match(/^\/api\/applications\/\d+\/$/)) {
    const appId = Number(pathname.split("/")[3]);
    const appObj = db.applications.find((a) => a.id === appId) || db.applications[0];
    if (method === "PATCH") {
      if (body.stage) appObj.stage = body.stage;
      if (body.notes !== undefined) appObj.notes = body.notes;
      saveDb(db);
    }
    return { ...appObj, status_label: appObj.stage, timeline: buildTimeline(appObj.stage) };
  }

  if (pathname === "/api/study/roadmap/") return db.roadmap;
  if (pathname.match(/^\/api\/study\/roadmap\/\d+\/$/)) {
    const rid = Number(pathname.split("/")[4]);
    const item = db.roadmap.find((r) => r.id === rid);
    if (item && body.status) {
      item.status = body.status;
      saveDb(db);
    }
    return item || {};
  }

  if (pathname === "/api/study/tasks/") {
    if (method === "POST") {
      const t = { id: Date.now(), status: "PENDING", priority: "HIGH", scheduled_time: "7:00 PM", ...body };
      db.study_tasks.push(t);
      saveDb(db);
      return t;
    }
    return db.study_tasks;
  }

  if (pathname.match(/^\/api\/study\/tasks\/\d+\/$/)) {
    const tid = Number(pathname.split("/")[4]);
    if (method === "DELETE") {
      db.study_tasks = db.study_tasks.filter((t) => t.id !== tid);
      saveDb(db);
      return null;
    }
    const t = db.study_tasks.find((x) => x.id === tid);
    if (t && body.status) {
      t.status = body.status;
      saveDb(db);
    }
    return t || {};
  }

  if (pathname === "/api/quizzes/") {
    return db.quizzes.map((q) => ({ ...q, questions_count: q.questions.length }));
  }

  if (pathname === "/api/quizzes/dashboard/") {
    return {
      total_tests: db.quizzes.length,
      completed_tests: db.quiz_attempts.length,
      average_score: 87,
      best_score: 92,
      topic_performance: [
        { topic: "Java", average_score: 90, attempts: 1, best_score: 90 },
        { topic: "DSA", average_score: 85, attempts: 1, best_score: 85 },
        { topic: "SQL", average_score: 92, attempts: 1, best_score: 92 },
        { topic: "System Design", average_score: 80, attempts: 1, best_score: 80 },
      ],
      recent_attempts: db.quiz_attempts,
    };
  }

  if (pathname.match(/^\/api\/quizzes\/\d+\/submit\/$/)) {
    const qid = Number(pathname.split("/")[3]);
    const quiz = db.quizzes.find((q) => q.id === qid) || db.quizzes[0];
    const answers = body.answers || {};
    let correct = 0;
    const feedback = quiz.questions.map((q) => {
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
    const pct = Math.round((correct / Math.max(quiz.questions.length, 1)) * 100);
    db.quiz_attempts.unshift({
      id: Date.now(),
      quiz_id: quiz.id,
      quiz_title: quiz.title,
      category: quiz.category,
      quiz_type: quiz.quiz_type,
      score: correct,
      total_questions: quiz.questions.length,
      percentage: pct,
      attempted_at: new Date().toISOString(),
    });
    saveDb(db);
    return { attempt: { score: correct, total_questions: quiz.questions.length, percentage: pct }, feedback };
  }

  if (pathname === "/api/projects/") {
    if (method === "POST") {
      const proj = { id: Date.now(), status: "COMPLETED", technologies: [], ...body };
      db.projects.unshift(proj);
      saveDb(db);
      return proj;
    }
    return db.projects;
  }

  if (pathname.match(/^\/api\/projects\/\d+\/$/)) {
    const pid = Number(pathname.split("/")[3]);
    if (method === "DELETE") {
      db.projects = db.projects.filter((p) => p.id !== pid);
      saveDb(db);
      return null;
    }
    const proj = db.projects.find((p) => p.id === pid);
    if (proj) {
      Object.assign(proj, body);
      saveDb(db);
    }
    return proj || {};
  }

  if (pathname === "/api/resources/") return db.resources;

  if (pathname === "/api/ml/job-compatibility/") {
    return db.jobs.map((j) => {
      const en = enrichJob(db, j, studentPayload);
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
  }

  if (pathname === "/api/ml/skill-gap/") {
    const jobId = Number(body.job_id || searchParams.get("job_id") || 1);
    const job = db.jobs.find((j) => j.id === jobId) || db.jobs[0];
    const enriched = enrichJob(db, job, studentPayload);
    return {
      job: {
        id: enriched.id,
        title: enriched.title,
        company_name: enriched.company_name,
        location: enriched.location,
        ctc_lpa: enriched.ctc_lpa,
      },
      eligibility: enriched.eligibility,
      match_percentage: enriched.match_data.match_percentage,
      required_skills: [...enriched.match_data.required_skills, ...enriched.match_data.preferred_skills],
      your_skills: studentPayload.student_skills.map((s) => s.skill_name),
      you_have: enriched.match_data.matching_skills,
      you_need: enriched.match_data.missing_skills,
      high_priority: enriched.match_data.high_priority_missing,
      action_plan: enriched.match_data.missing_skills.map(
        (sk) => `Complete hands-on practice in ${sk} and integrate it into a portfolio project to boost your match score.`
      ),
    };
  }

  if (pathname === "/api/ml/parse-jd/") {
    const jdText = (body.jd_text || "").toLowerCase();
    const detected = db.skills.filter((s) => jdText.includes(s.name.toLowerCase())).map((s) => s.name);
    return {
      required_skills: detected.length ? detected.slice(0, 5) : ["Java", "DSA", "SQL"],
      preferred_skills: detected.slice(5),
    };
  }

  if (pathname === "/api/analytics/student-dashboard/") {
    return {
      profile: studentPayload,
      roadmap: db.roadmap,
      upcoming_tasks: db.study_tasks.filter((t) => t.status !== "COMPLETED"),
      recommended_jobs: db.jobs.map((j) => enrichJob(db, j, studentPayload)).slice(0, 4),
    };
  }

  if (pathname === "/api/analytics/") {
    const placedStudents = db.student_profiles.filter((p) => p.placement_status === "PLACED").length;
    const internStudents = db.student_profiles.filter((p) => p.placement_status === "INTERNSHIP").length;
    const totalStudents = db.student_profiles.length;
    const unplacedStudents = Math.max(0, totalStudents - placedStudents - internStudents);
    return {
      kpis: {
        total_students: totalStudents,
        active_jobs: db.jobs.length,
        applications: db.applications.length,
        placed_students: placedStudents,
        placement_rate: Math.round((placedStudents / Math.max(totalStudents, 1)) * 100),
        companies: db.companies.length,
      },
      admin_stats: {
        total_users: db.users.length,
        students_count: totalStudents,
        tpos_count: 1,
        admins_count: 1,
        active_invite_codes: db.invite_codes.length,
        audit_events_count: db.audit_logs.length,
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
          { month: "Nov", applications: 26 },
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
        ],
        skill_demand: [
          { skill: "Java", jobs: 4 },
          { skill: "SQL", jobs: 4 },
          { skill: "DSA", jobs: 4 },
          { skill: "Python", jobs: 3 },
          { skill: "React", jobs: 2 },
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
    };
  }

  return {};
}
