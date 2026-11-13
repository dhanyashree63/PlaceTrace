from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.applications.models import Application
from apps.applications.serializers import sync_application_timeline
from apps.companies.models import Company
from apps.jobs.models import Job, JobSkill
from apps.placements.models import Placement
from apps.projects.models import Project
from apps.quizzes.models import Question, Quiz, QuizAttempt
from apps.resources.models import Resource
from apps.students.models import (
    ActivityLog,
    Resume,
    ResumeSkill,
    Skill,
    StudentProfile,
    StudentSkill,
)
from apps.students.readiness import compute_placement_readiness
from apps.study.models import StudentTopicProgress, StudyTask, Topic
from apps.users.models import InviteCode, Notification, User, log_audit_event


class Command(BaseCommand):
    help = "Seeds PostgreSQL with explicit development/demo data for PlaceTrace."

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write("Seeding PlaceTrace database (Development Seed Data)...")

        # 1. Skills Catalog
        skill_defs = [
            ("Java", Skill.Category.PROGRAMMING),
            ("DSA", Skill.Category.CORE_CS),
            ("Problem Solving", Skill.Category.CORE_CS),
            ("System Design", Skill.Category.CORE_CS),
            ("HTML", Skill.Category.FRONTEND),
            ("CSS", Skill.Category.FRONTEND),
            ("JavaScript", Skill.Category.PROGRAMMING),
            ("TypeScript", Skill.Category.PROGRAMMING),
            ("React", Skill.Category.FRONTEND),
            ("Python", Skill.Category.PROGRAMMING),
            ("Django", Skill.Category.BACKEND),
            ("FastAPI", Skill.Category.BACKEND),
            ("SQL", Skill.Category.DATABASE),
            ("PostgreSQL", Skill.Category.DATABASE),
            ("Git", Skill.Category.TOOLS),
            ("Docker", Skill.Category.DEVOPS),
            ("Linux", Skill.Category.DEVOPS),
            ("AWS", Skill.Category.DEVOPS),
            ("Operating Systems", Skill.Category.CORE_CS),
            ("DBMS", Skill.Category.CORE_CS),
            ("Computer Networks", Skill.Category.CORE_CS),
            ("Machine Learning", Skill.Category.DATA_SCIENCE),
        ]
        skills_map = {}
        for name, cat in skill_defs:
            sk, _ = Skill.objects.get_or_create(name=name, defaults={"category": cat})
            skills_map[name] = sk

        # 2. Roadmap Topics
        roadmap_defs = [
            (1, "Java Fundamentals", "Core Programming", "OOPs, Collections, Exception Handling, Streams & JVM internals", 16),
            (2, "Java DSA", "Data Structures & Algorithms", "Arrays, Linked Lists, Trees, Graphs, Dynamic Programming & Sliding Window", 40),
            (3, "Full Stack Development", "Web Engineering", "React UI architecture, Django REST APIs, JWT Auth & state management", 35),
            (4, "SQL & Databases", "Database Systems", "Complex joins, indexing, query optimization, ACID transactions & PostgreSQL", 18),
            (5, "Git, Docker & Deployment", "DevOps & Cloud", "Git workflows, multi-container Docker Compose, Nginx & Caddy HTTPS", 14),
            (6, "Operating Systems & DBMS", "CS Fundamentals", "Process scheduling, deadlocks, virtual memory & normalization", 20),
            (7, "Computer Networks", "CS Fundamentals", "OSI layers, TCP/IP handshake, DNS, HTTP/2 & TLS security", 14),
            (8, "System Design & Interviews", "Architecture", "Load balancing, caching, rate limiting, sharding & mock interviews", 22),
        ]
        topics_list = []
        for order, title, cat, desc, hrs in roadmap_defs:
            t, _ = Topic.objects.get_or_create(
                title=title,
                defaults={
                    "order": order,
                    "category": cat,
                    "description": desc,
                    "estimated_hours": hrs,
                    "is_core_roadmap": order <= 5,
                },
            )
            topics_list.append(t)

        # 3. Users (Admin, TPO, Students)
        admin_user, _ = User.objects.get_or_create(
            email="admin@placetrace.edu",
            defaults={
                "full_name": "Dr. Rajeshwar Rao (Admin)",
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True,
                "is_email_verified": True,
            },
        )
        admin_user.set_password("Admin@12345")
        admin_user.save()

        tpo_user, _ = User.objects.get_or_create(
            email="tpo@placetrace.edu",
            defaults={
                "full_name": "Prof. Meenakshi Sundaram (TPO)",
                "role": User.Role.TPO,
                "is_email_verified": True,
            },
        )
        tpo_user.set_password("Tpo@12345")
        tpo_user.save()

        student_user, _ = User.objects.get_or_create(
            email="dhanyashree@placetrace.edu",
            defaults={
                "full_name": "Dhanyashree N",
                "role": User.Role.STUDENT,
                "is_email_verified": True,
            },
        )
        student_user.set_password("Student@12345")
        student_user.save()

        profile, _ = StudentProfile.objects.get_or_create(
            user=student_user,
            defaults={
                "usn": "1RN23CS042",
                "college_name": "RNSIT",
                "branch": "CSE",
                "cgpa": 9.35,
                "active_backlogs": 0,
                "graduation_year": 2027,
                "phone": "+91 98450 12345",
                "bio": "Final-year Computer Science student passionate about Full-Stack Engineering, Java DSA, and scalable distributed systems.",
                "github_url": "https://github.com/dhanyashree-n",
                "linkedin_url": "https://linkedin.com/in/dhanyashree-n",
                "portfolio_url": "https://dhanyashree.dev",
                "preferred_roles": ["Software Development Engineer", "Full Stack Engineer", "Backend Engineer"],
                "preferred_locations": ["Bengaluru", "Hyderabad"],
            },
        )

        # Assign skills to student
        student_skill_names = [
            ("Java", StudentSkill.Proficiency.EXPERT),
            ("DSA", StudentSkill.Proficiency.ADVANCED),
            ("HTML", StudentSkill.Proficiency.ADVANCED),
            ("CSS", StudentSkill.Proficiency.ADVANCED),
            ("JavaScript", StudentSkill.Proficiency.ADVANCED),
            ("React", StudentSkill.Proficiency.ADVANCED),
            ("Python", StudentSkill.Proficiency.ADVANCED),
            ("Django", StudentSkill.Proficiency.ADVANCED),
            ("SQL", StudentSkill.Proficiency.ADVANCED),
            ("Git", StudentSkill.Proficiency.ADVANCED),
            ("Linux", StudentSkill.Proficiency.INTERMEDIATE),
            ("Problem Solving", StudentSkill.Proficiency.ADVANCED),
        ]
        for s_name, prof in student_skill_names:
            StudentSkill.objects.get_or_create(
                student=profile,
                skill=skills_map[s_name],
                defaults={"proficiency": prof, "is_verified": True},
            )

        # Set Roadmap Progress
        for idx, t in enumerate(topics_list):
            st_status = StudentTopicProgress.Status.NOT_STARTED
            if idx in (0, 1, 5, 6):
                st_status = StudentTopicProgress.Status.COMPLETED
            elif idx == 2:
                st_status = StudentTopicProgress.Status.IN_PROGRESS
            StudentTopicProgress.objects.update_or_create(
                student=profile,
                topic=t,
                defaults={
                    "status": st_status,
                    "completed_at": timezone.now() if st_status == "COMPLETED" else None,
                },
            )

        # Create additional students for realistic TPO table & analytics
        peer_defs = [
            ("arjun@placetrace.edu", "Arjun Sharma", "1RN23CS018", "CSE", 9.12, "PLACED", ["Java", "DSA", "Spring Boot", "SQL", "Docker"]),
            ("priya@placetrace.edu", "Priya Nair", "1RN23IS029", "ISE", 8.85, "PLACED", ["Python", "Machine Learning", "SQL", "FastAPI"]),
            ("rohan@placetrace.edu", "Rohan Kulkarni", "1RN23EC051", "ECE", 8.40, "INTERNSHIP", ["C++", "DSA", "Python", "Linux"]),
            ("sneha@placetrace.edu", "Sneha Verma", "1RN23AI011", "AIML", 9.05, "PLACED", ["Python", "Machine Learning", "SQL", "React", "AWS"]),
            ("karthik@placetrace.edu", "Karthik Hegde", "1RN23CS077", "CSE", 7.82, "UNPLACED", ["Java", "HTML", "CSS", "SQL"]),
        ]
        peer_profiles = []
        for email, name, usn, branch, cgpa, p_status, p_skills in peer_defs:
            u, _ = User.objects.get_or_create(
                email=email,
                defaults={"full_name": name, "role": User.Role.STUDENT, "is_email_verified": True},
            )
            u.set_password("Student@12345")
            u.save()
            sp, _ = StudentProfile.objects.get_or_create(
                user=u,
                defaults={
                    "usn": usn,
                    "college_name": "RNSIT",
                    "branch": branch,
                    "cgpa": cgpa,
                    "placement_status": p_status,
                    "readiness_score": 82 if p_status == "PLACED" else 68,
                },
            )
            for s_name in p_skills:
                if s_name in skills_map:
                    StudentSkill.objects.get_or_create(student=sp, skill=skills_map[s_name])
            peer_profiles.append(sp)

        # 4. Companies & Jobs
        companies_data = [
            ("Oracle", "Cloud & Database Systems", "https://www.oracle.com", "Bengaluru", "#C74634", "Global leader in enterprise cloud infrastructure and database management systems."),
            ("Google", "Internet & Cloud Platforms", "https://careers.google.com", "Bengaluru", "#4285F4", "Builds products and cloud infrastructure that organize the world's information."),
            ("TCS", "IT Services & Consulting", "https://www.tcs.com", "Bengaluru", "#6555F5", "Global leader in IT services, consulting, and digital transformation."),
            ("Atlassian", "Developer Collaboration Tools", "https://www.atlassian.com", "Bengaluru", "#0052CC", "Creators of Jira, Confluence, Bitbucket, and modern engineering productivity tools."),
            ("Microsoft", "Cloud & Enterprise Software", "https://careers.microsoft.com", "Hyderabad", "#00A4EF", "Empowering every person and organization on the planet to achieve more."),
            ("Stripe", "Financial Infrastructure", "https://stripe.com", "Bengaluru", "#635BFF", "Financial infrastructure platform for the internet."),
        ]
        company_objs = {}
        for c_name, ind, web, hq, col, desc in companies_data:
            comp, _ = Company.objects.get_or_create(
                name=c_name,
                defaults={
                    "industry": ind,
                    "website": web,
                    "careers_url": web,
                    "headquarters": hq,
                    "logo_color": col,
                    "description": desc,
                },
            )
            company_objs[c_name] = comp

        jobs_data = [
            {
                "company": company_objs["Oracle"],
                "title": "Software Development Engineer",
                "category": Job.Category.SOFTWARE_DEVELOPMENT,
                "location": "Bengaluru",
                "employment_type": Job.EmploymentType.FULL_TIME,
                "ctc_lpa": 19.50,
                "min_cgpa": 7.00,
                "allowed_branches": ["CSE", "ISE", "ECE"],
                "about_role": "Join Oracle Cloud Infrastructure (OCI) to architect and scale high-throughput distributed services and database cloud engines.",
                "description": "Design resilient backend microservices in Java and Python, optimize SQL query execution plans, and collaborate on cloud-native deployments using Docker.",
                "responsibilities": [
                    "Design, implement, and maintain low-latency backend services in Java and Python.",
                    "Write clean, well-tested code and participate in architecture & system design reviews.",
                    "Optimize relational database schemas and SQL queries for high concurrency.",
                    "Collaborate with cross-functional engineering teams on CI/CD and containerization.",
                ],
                "syllabus": [
                    "Round 1: Online Coding & DSA Assessment (Arrays, Trees, Graphs, DP, SQL Queries)",
                    "Round 2: Core Technical Interview (Java Internals, OOPs, DBMS, Operating Systems)",
                    "Round 3: System Design & Architecture (Microservices, Caching, Rate Limiting)",
                    "Round 4: Managerial & HR Fit Discussion",
                ],
                "interview_tips": [
                    "Revise Java concurrency, HashMap internals, and SQL indexing strategies.",
                    "Practice medium-to-hard graph and dynamic programming problems.",
                    "Be ready to walk through the architecture of your full-stack projects.",
                ],
                "req_skills": ["Java", "DSA", "Problem Solving", "SQL", "React", "Git"],
                "pref_skills": ["Docker", "System Design", "AWS"],
            },
            {
                "company": company_objs["Google"],
                "title": "Software Engineer - University Graduate",
                "category": Job.Category.SOFTWARE_DEVELOPMENT,
                "location": "Bengaluru",
                "employment_type": Job.EmploymentType.FULL_TIME,
                "ctc_lpa": 32.00,
                "min_cgpa": 8.00,
                "allowed_branches": ["CSE", "ISE", "AIML"],
                "about_role": "Build next-generation distributed search, cloud, and AI infrastructure serving billions of users.",
                "description": "Solve large-scale algorithmic and systems engineering challenges using Java, Python, C++, and modern distributed systems.",
                "responsibilities": [
                    "Develop scalable backend systems and algorithms for high-availability services.",
                    "Analyze time/space complexity and optimize distributed data pipelines.",
                    "Contribute to design docs and automated testing frameworks.",
                ],
                "syllabus": [
                    "Online Coding Challenge (2 Advanced DSA problems in 60 minutes)",
                    "Technical Interviews 1 & 2 (Algorithms, Graphs, Trees, Dynamic Programming)",
                    "Googliness & Leadership Interview",
                ],
                "interview_tips": [
                    "Communicate time and space complexity clearly before writing code.",
                    "Handle edge cases and dry-run your solution methodically.",
                ],
                "req_skills": ["Java", "DSA", "Problem Solving", "Python", "Operating Systems"],
                "pref_skills": ["System Design", "Docker", "Linux"],
            },
            {
                "company": company_objs["Atlassian"],
                "title": "Full Stack Software Engineer",
                "category": Job.Category.SOFTWARE_DEVELOPMENT,
                "location": "Bengaluru",
                "employment_type": Job.EmploymentType.FULL_TIME,
                "ctc_lpa": 26.50,
                "min_cgpa": 7.50,
                "allowed_branches": ["CSE", "ISE", "ECE", "AIML"],
                "about_role": "Build rich, responsive web experiences and resilient APIs for millions of agile software teams worldwide.",
                "description": "Work across React, TypeScript, Java/Django REST APIs, and PostgreSQL to ship high-impact product features.",
                "responsibilities": [
                    "Build accessible, high-performance frontend components in React and JavaScript.",
                    "Design RESTful APIs and optimize PostgreSQL queries.",
                    "Implement automated unit and integration tests.",
                ],
                "syllabus": [
                    "Browser Coding & UI Architecture Round (React, State Management)",
                    "DSA & Code Design Round",
                    "System Design & Values Interview",
                ],
                "interview_tips": [
                    "Focus on modular code organization and clean API boundaries in the coding round.",
                ],
                "req_skills": ["React", "JavaScript", "HTML", "CSS", "Java", "SQL", "Git"],
                "pref_skills": ["Docker", "AWS", "System Design"],
            },
            {
                "company": company_objs["Microsoft"],
                "title": "Data & Applied Scientist",
                "category": Job.Category.DATA_SCIENCE,
                "location": "Hyderabad",
                "employment_type": Job.EmploymentType.FULL_TIME,
                "ctc_lpa": 28.00,
                "min_cgpa": 8.00,
                "allowed_branches": ["CSE", "ISE", "AIML"],
                "about_role": "Develop intelligent ML models, NLP pipelines, and analytical systems powering Azure & Copilot experiences.",
                "description": "Combine Python, Machine Learning, SQL, and FastAPI microservices to deploy production inference pipelines.",
                "responsibilities": [
                    "Train, evaluate, and deploy NLP and classification models using Python & scikit-learn.",
                    "Expose low-latency ML inference services via FastAPI.",
                    "Partner with product teams to measure model precision and recall.",
                ],
                "syllabus": [
                    "Coding & ML Fundamentals Assessment",
                    "Applied ML & NLP System Design Round",
                    "AA (As Appropriate) Leadership Round",
                ],
                "interview_tips": [
                    "Understand bias-variance tradeoff, TF-IDF, evaluation metrics, and production latency.",
                ],
                "req_skills": ["Python", "Machine Learning", "SQL", "DSA", "FastAPI"],
                "pref_skills": ["Docker", "AWS", "PostgreSQL"],
            },
            {
                "company": company_objs["Stripe"],
                "title": "Associate Product Manager",
                "category": Job.Category.PRODUCT,
                "location": "Bengaluru",
                "employment_type": Job.EmploymentType.FULL_TIME,
                "ctc_lpa": 24.00,
                "min_cgpa": 7.50,
                "allowed_branches": ["CSE", "ISE", "ECE", "AIML"],
                "about_role": "Shape developer-first payment APIs and global checkout products.",
                "description": "Work closely with engineering and design teams to define product roadmaps, analyze funnel metrics in SQL, and launch developer tools.",
                "responsibilities": [
                    "Define product specifications and developer API ergonomics.",
                    "Query product adoption metrics using SQL and PostgreSQL.",
                ],
                "syllabus": [
                    "Product Sense & API Design Case Study",
                    "SQL & Analytical Thinking Interview",
                    "Cross-Functional Engineering Collaboration Round",
                ],
                "interview_tips": [
                    "Demonstrate empathy for developers and strong analytical rigor.",
                ],
                "req_skills": ["SQL", "Problem Solving", "Python", "Git"],
                "pref_skills": ["System Design", "React"],
            },
            {
                "company": company_objs["TCS"],
                "title": "Digital Systems & Analytics Engineer",
                "category": Job.Category.ANALYTICS,
                "location": "Bengaluru",
                "employment_type": Job.EmploymentType.FULL_TIME,
                "ctc_lpa": 9.00,
                "min_cgpa": 6.50,
                "allowed_branches": ["CSE", "ISE", "ECE", "AIML", "EEE", "MECH"],
                "about_role": "Build enterprise analytics dashboards, data pipelines, and full-stack business portals.",
                "description": "Develop modern web applications and enterprise SQL analytics solutions for global clients.",
                "responsibilities": [
                    "Develop full-stack modules in Java, Python, React, and SQL.",
                    "Maintain relational databases and build automated reporting workflows.",
                ],
                "syllabus": [
                    "TCS NQT (Aptitude, Verbal, Advanced Coding)",
                    "Technical Interview (Java, Python, DBMS, SQL)",
                    "Managerial & HR Interview",
                ],
                "interview_tips": [
                    "Be thorough with SQL joins, normalization, and your final-year project.",
                ],
                "req_skills": ["Java", "Python", "SQL", "HTML", "CSS", "DSA"],
                "pref_skills": ["React", "Django", "Git"],
            },
        ]

        created_jobs = []
        for jd in jobs_data:
            req_s = jd.pop("req_skills")
            pref_s = jd.pop("pref_skills")
            job, _ = Job.objects.get_or_create(
                company=jd["company"],
                title=jd["title"],
                defaults={
                    **jd,
                    "allowed_degrees": ["B.E / B.Tech"],
                    "graduation_year": 2027,
                    "deadline": date.today() + timedelta(days=21),
                    "apply_link": jd["company"].website,
                    "status": Job.Status.PUBLISHED,
                    "created_by": tpo_user,
                },
            )
            for s_name in req_s:
                JobSkill.objects.get_or_create(
                    job=job,
                    skill=skills_map[s_name],
                    defaults={"is_mandatory": True, "priority": JobSkill.Priority.HIGH},
                )
            for s_name in pref_s:
                JobSkill.objects.get_or_create(
                    job=job,
                    skill=skills_map[s_name],
                    defaults={"is_mandatory": False, "priority": JobSkill.Priority.LOW},
                )
            created_jobs.append(job)

        # 5. Projects for Student
        projects_data = [
            {
                "title": "PlaceTrace",
                "description": "Intelligent placement tracking and career management platform with ML resume parsing, skill-gap analysis, and real-time readiness analytics.",
                "technologies": ["React", "Django", "PostgreSQL", "FastAPI", "Docker"],
                "github_url": "https://github.com/dhanyashree-n/placetrace",
                "live_url": "https://placetrace.edu",
                "role": "Lead Full Stack Developer",
                "status": Project.Status.COMPLETED,
                "start_date": date(2026, 8, 1),
                "completion_date": date(2026, 11, 10),
            },
            {
                "title": "CloudSync Distributed Cache",
                "description": "High-throughput LRU caching service in Java with consistent hashing, TCP socket protocol, and latency monitoring.",
                "technologies": ["Java", "DSA", "Linux", "Docker", "Git"],
                "github_url": "https://github.com/dhanyashree-n/cloudsync-cache",
                "live_url": "https://cloudsync-demo.dev",
                "role": "Backend Systems Developer",
                "status": Project.Status.COMPLETED,
                "start_date": date(2026, 5, 10),
                "completion_date": date(2026, 7, 20),
            },
            {
                "title": "DevPulse Code Reviewer",
                "description": "Automated pull-request static analyzer using Python, Django REST Framework, and React dashboard reducing review turnaround by 40%.",
                "technologies": ["Python", "Django", "React", "SQL", "Git"],
                "github_url": "https://github.com/dhanyashree-n/devpulse",
                "live_url": "https://devpulse.dev",
                "role": "Full Stack Engineer",
                "status": Project.Status.COMPLETED,
                "start_date": date(2026, 2, 1),
                "completion_date": date(2026, 4, 25),
            },
        ]
        for pd in projects_data:
            Project.objects.get_or_create(
                student=profile,
                title=pd["title"],
                defaults=pd,
            )

        # 6. Resume for Student
        resume_text = (
            "Dhanyashree N\n"
            "B.E in Computer Science & Engineering, RNSIT | CGPA: 9.35\n"
            "Technical Skills: Java, DSA, Problem Solving, HTML, CSS, JavaScript, React, Python, Django, SQL, PostgreSQL, Git, Linux\n"
            "Projects:\n"
            "1. PlaceTrace - Engineered intelligent placement tracking platform using React, Django, PostgreSQL, and FastAPI, improving student readiness visibility for 500+ users.\n"
            "2. CloudSync Distributed Cache - Built concurrent Java cache service reducing read latency by 35%.\n"
            "3. DevPulse - Developed automated code review platform cutting review time by 40%.\n"
            "Experience & Achievements: Solved 350+ DSA problems on LeetCode; Finalist at Smart India Hackathon."
        )
        resume, _ = Resume.objects.get_or_create(
            student=profile,
            file_name="Dhanyashree_N_Resume_2026.pdf",
            defaults={
                "file_size": 248500,
                "mime_type": "application/pdf",
                "raw_text": resume_text,
                "status": Resume.Status.ANALYZED,
                "resume_score": 82,
                "strengths": [
                    "Strong Java knowledge",
                    "Good project experience",
                    "Solid full-stack skill coverage (Java, Python, SQL, React, Django)",
                ],
                "improvement_areas": [
                    "Add measurable project impact",
                    "Improve system-design section",
                    "Highlight cloud deployment & containerization tools (Docker, AWS)",
                ],
                "section_scores": {
                    "skills": 88,
                    "projects": 86,
                    "impact": 78,
                    "experience": 76,
                    "education": 95,
                },
                "is_current": True,
                "analyzed_at": timezone.now(),
            },
        )
        for s_name in ["Java", "Python", "SQL", "React", "Django", "DSA", "Git"]:
            ResumeSkill.objects.get_or_create(resume=resume, skill=skills_map[s_name], defaults={"confidence": 0.95})

        # 7. Study Tasks
        today = date.today()
        study_tasks_data = [
            ("DSA Practice", StudyTask.Category.CODING, today, "7:00 PM", StudyTask.Priority.HIGH, StudyTask.Status.PENDING),
            ("React Basics Revision", StudyTask.Category.REVISION, today + timedelta(days=1), "8:00 AM", StudyTask.Priority.MEDIUM, StudyTask.Status.PENDING),
            ("Take Mock Test #2", StudyTask.Category.MOCK_TEST, today + timedelta(days=2), "10:00 AM", StudyTask.Priority.HIGH, StudyTask.Status.PENDING),
            ("SQL Indexing & Joins Deep Dive", StudyTask.Category.STUDY, today - timedelta(days=1), "6:00 PM", StudyTask.Priority.MEDIUM, StudyTask.Status.COMPLETED),
            ("Oracle Technical Interview Prep", StudyTask.Category.INTERVIEW, today - timedelta(days=2), "5:00 PM", StudyTask.Priority.HIGH, StudyTask.Status.COMPLETED),
        ]
        for t_title, t_cat, t_date, t_time, t_prio, t_stat in study_tasks_data:
            StudyTask.objects.get_or_create(
                student=profile,
                title=t_title,
                defaults={
                    "category": t_cat,
                    "scheduled_date": t_date,
                    "scheduled_time": t_time,
                    "priority": t_prio,
                    "status": t_stat,
                },
            )

        # 8. Quizzes & Mock Tests across categories
        quiz_defs = [
            (
                "Java Core & Multithreading Mock Test",
                Quiz.Category.JAVA,
                Quiz.QuizType.MOCK_TEST,
                "Intermediate",
                20,
                "Assess your command of JVM memory model, Collections, Streams, and concurrency.",
                [
                    ("Which collection in Java guarantees O(1) average time complexity for lookup and preserves insertion order?", ["HashMap", "LinkedHashMap", "TreeMap", "ConcurrentSkipListMap"], 1, "LinkedHashMap maintains a doubly-linked list running through all entries while providing O(1) hash lookup."),
                    ("What happens when two objects have the same hashCode() in a Java HashMap?", ["An exception is thrown", "The old value is always overwritten", "equals() is invoked to check key equality in the bucket", "The entry is rejected"], 2, "HashMap uses hashCode() to find the bucket and equals() to distinguish keys within the bucket."),
                    ("Which keyword ensures visibility of changes to variables across threads in Java?", ["transient", "volatile", "serializable", "native"], 1, "The volatile keyword guarantees that reads and writes go directly to main memory."),
                ],
                90,
            ),
            (
                "DSA Trees, Graphs & DP Challenge",
                Quiz.Category.DSA,
                Quiz.QuizType.CODING,
                "Advanced",
                30,
                "Core algorithmic problem solving covering shortest paths, tree traversals, and dynamic programming.",
                [
                    ("What is the time complexity of Dijkstra's algorithm using a binary min-heap on a graph with V vertices and E edges?", ["O(V^2)", "O((V + E) log V)", "O(V * E)", "O(E log E + V^2)"], 1, "With an adjacency list and min-priority queue, Dijkstra runs in O((V + E) log V)."),
                    ("Which traversal of a Binary Search Tree (BST) produces elements in sorted ascending order?", ["Pre-order", "In-order", "Post-order", "Level-order"], 1, "In-order traversal visits Left -> Root -> Right, yielding sorted order for any BST."),
                    ("Which technique is optimal for finding the longest substring without repeating characters?", ["Divide and Conquer", "Sliding Window with Hash Map", "Bellman-Ford", "Floyd-Warshall"], 1, "A sliding window with a character index map solves it in O(N) time."),
                ],
                85,
            ),
            (
                "SQL & PostgreSQL Optimization Quiz",
                Quiz.Category.SQL,
                Quiz.QuizType.MCQ,
                "Intermediate",
                15,
                "Test your mastery of window functions, B-tree indexes, ACID properties, and query execution plans.",
                [
                    ("Which SQL clause is used to filter groups created by a GROUP BY clause?", ["WHERE", "HAVING", "QUALIFY", "DISTINCT"], 1, "HAVING filters aggregated groups after GROUP BY, whereas WHERE filters individual rows before grouping."),
                    ("Which isolation level prevents dirty reads and non-repeatable reads in PostgreSQL?", ["Read Uncommitted", "Read Committed", "Repeatable Read", "None"], 2, "Repeatable Read guarantees that re-reading a row within the same transaction returns the same snapshot."),
                ],
                92,
            ),
            (
                "Operating Systems & DBMS Fundamentals",
                Quiz.Category.OS,
                Quiz.QuizType.MOCK_TEST,
                "Intermediate",
                20,
                "Covers process synchronization, paging, deadlocks, and relational normalization.",
                [
                    ("Which condition is NOT one of Coffman's four necessary conditions for a deadlock?", ["Mutual Exclusion", "Hold and Wait", "Preemption", "Circular Wait"], 2, "No Preemption (not Preemption) is one of the four Coffman deadlock conditions."),
                    ("A relation is in 3NF if it is in 2NF and has no:", ["Partial dependencies", "Multi-valued dependencies", "Transitive dependencies", "Candidate keys"], 2, "3NF eliminates transitive functional dependencies of non-prime attributes on superkeys."),
                ],
                80,
            ),
            (
                "Computer Networks & Protocols Quiz",
                Quiz.Category.CN,
                Quiz.QuizType.MCQ,
                "Intermediate",
                15,
                "TCP/IP, TLS handshake, DNS resolution, HTTP status codes, and subnetting.",
                [
                    ("Which transport layer protocol provides reliable, ordered, and congestion-controlled byte-stream delivery?", ["UDP", "ICMP", "TCP", "ARP"], 2, "TCP provides reliable, connection-oriented transport with flow and congestion control."),
                    ("What port number does HTTPS use by default?", ["80", "443", "8080", "22"], 1, "HTTPS uses TCP port 443 over TLS."),
                ],
                88,
            ),
            (
                "System Design & Scalable Architecture",
                Quiz.Category.SYSTEM_DESIGN,
                Quiz.QuizType.MOCK_TEST,
                "Advanced",
                25,
                "Load balancers, consistent hashing, CAP theorem, rate limiting, and database sharding.",
                [
                    ("In the CAP theorem, during a network partition (P), a distributed data store must choose between:", ["Latency and Throughput", "Consistency and Availability", "Sharding and Replication", "SQL and NoSQL"], 1, "When a network partition occurs, a system must trade off between Consistency (C) and Availability (A)."),
                    ("Which algorithm is commonly used for API rate limiting with burst tolerance?", ["Token Bucket", "Bubble Sort", "Kruskal's Algorithm", "Two-Phase Commit"], 0, "Token Bucket allows controlled bursts while enforcing an average request rate."),
                ],
                78,
            ),
        ]

        for q_title, q_cat, q_type, diff, dur, desc, qs, sample_score in quiz_defs:
            quiz, _ = Quiz.objects.get_or_create(
                title=q_title,
                defaults={
                    "category": q_cat,
                    "quiz_type": q_type,
                    "difficulty": diff,
                    "duration_minutes": dur,
                    "description": desc,
                },
            )
            for idx, (prompt, opts, corr, expl) in enumerate(qs, start=1):
                Question.objects.get_or_create(
                    quiz=quiz,
                    order=idx,
                    defaults={
                        "prompt": prompt,
                        "options": opts,
                        "correct_index": corr,
                        "explanation": expl,
                    },
                )
            if not QuizAttempt.objects.filter(student=profile, quiz=quiz).exists():
                QuizAttempt.objects.create(
                    student=profile,
                    quiz=quiz,
                    score=len(qs),
                    total_questions=len(qs),
                    percentage=sample_score,
                    is_completed=True,
                )

        # 9. Learning Resources
        resources_data = [
            ("Java & JVM Deep Dive Handbook", "Comprehensive guide to Java 21, Collections, Concurrency, and JVM garbage collection for interviews.", "Handbook", "https://dev.java/learn/", "Intermediate", Resource.Category.JAVA),
            ("Striver's A2Z DSA Placement Sheet", "Structured 150-problem roadmap covering arrays, graphs, trees, and dynamic programming.", "Practice Sheet", "https://takeuforward.org/", "Intermediate", Resource.Category.DSA),
            ("PostgreSQL Indexing & Query Tuning", "Practical reference on B-Tree indexes, EXPLAIN ANALYZE, joins, and transactions.", "Documentation", "https://www.postgresql.org/docs/", "Intermediate", Resource.Category.SQL),
            ("Full-Stack React & Django Architecture", "End-to-end production guide for building JWT-authenticated React + Django REST applications.", "Guide", "https://www.django-rest-framework.org/", "Intermediate", Resource.Category.WEB_DEV),
            ("System Design Primer for Campus Placements", "Visual walkthrough of load balancers, caching, message queues, and rate limiters.", "Handbook", "https://github.com/donnemartin/system-design-primer", "Advanced", Resource.Category.INTERVIEW),
            ("Operating Systems Three Easy Pieces", "Core concepts in virtualization, concurrency, deadlocks, and persistence.", "Handbook", "https://pages.cs.wisc.edu/~remzi/OSTEP/", "Intermediate", Resource.Category.OS),
            ("DBMS Normalization & ACID Mastery", "Quick revision notes on ER diagrams, 1NF-BCNF normalization, and transaction schedules.", "Guide", "https://www.postgresql.org/docs/current/tutorial.html", "Beginner", Resource.Category.DBMS),
            ("Computer Networks Top-Down Reference", "OSI model, TCP congestion control, DNS, HTTP/3, and TLS security notes.", "Guide", "https://developer.mozilla.org/en-US/docs/Web/HTTP", "Intermediate", Resource.Category.CN),
            ("Python for Data Science & FastAPI", "Async APIs with FastAPI, Pydantic validation, and scikit-learn NLP pipelines.", "Documentation", "https://fastapi.tiangolo.com/", "Intermediate", Resource.Category.PYTHON),
            ("Quantitative Aptitude & Logical Reasoning", "Time & work, permutations, probability, and data interpretation practice sets.", "Practice Sheet", "https://www.indiabix.com/", "Beginner", Resource.Category.APTITUDE),
        ]
        for r_title, r_desc, r_type, r_link, r_diff, r_cat in resources_data:
            Resource.objects.get_or_create(
                title=r_title,
                defaults={
                    "description": r_desc,
                    "resource_type": r_type,
                    "external_link": r_link,
                    "difficulty": r_diff,
                    "category": r_cat,
                },
            )

        # 10. Applications & Placements
        oracle_job = created_jobs[0]
        atlassian_job = created_jobs[2]
        tcs_job = created_jobs[5]

        app1, _ = Application.objects.get_or_create(
            student=profile,
            job=oracle_job,
            defaults={
                "stage": Application.Stage.TECHNICAL_INTERVIEW,
                "match_score": 82,
                "is_eligible_at_apply": True,
                "notes": "Cleared Online Coding Assessment (3/3 test cases). Preparing Java concurrency & System Design for Round 2.",
            },
        )
        sync_application_timeline(app1)

        app2, _ = Application.objects.get_or_create(
            student=profile,
            job=atlassian_job,
            defaults={
                "stage": Application.Stage.ASSESSMENT,
                "match_score": 85,
                "is_eligible_at_apply": True,
                "notes": "Browser coding assessment scheduled for this weekend.",
            },
        )
        sync_application_timeline(app2)

        app3, _ = Application.objects.get_or_create(
            student=profile,
            job=tcs_job,
            defaults={
                "stage": Application.Stage.SELECTED,
                "match_score": 94,
                "is_eligible_at_apply": True,
                "notes": "Received Digital offer letter.",
            },
        )
        sync_application_timeline(app3)

        # Peer applications & placements for rich analytics charts
        for idx, sp in enumerate(peer_profiles):
            target_job = created_jobs[idx % len(created_jobs)]
            st_stage = Application.Stage.SELECTED if sp.placement_status == "PLACED" else Application.Stage.ASSESSMENT
            pa, _ = Application.objects.get_or_create(
                student=sp,
                job=target_job,
                defaults={
                    "stage": st_stage,
                    "match_score": 84,
                    "is_eligible_at_apply": True,
                },
            )
            sync_application_timeline(pa)
            if sp.placement_status == "PLACED":
                Placement.objects.get_or_create(
                    student=sp,
                    company=target_job.company,
                    job=target_job,
                    defaults={
                        "role_offered": target_job.title,
                        "package_lpa": target_job.ctc_lpa,
                        "status": Placement.OfferStatus.ACCEPTED,
                    },
                )

        # 11. Activity Timeline & Notifications for Dhanyashree
        if profile.activities.count() < 4:
            activities = [
                (ActivityLog.ActivityType.RESUME, "Resume updated & analyzed (82/100)"),
                (ActivityLog.ActivityType.SKILL, "Skill added: React & Django"),
                (ActivityLog.ActivityType.APPLICATION, "Applied to Oracle (Software Development Engineer)"),
                (ActivityLog.ActivityType.TOPIC, "Completed Java DSA topic"),
                (ActivityLog.ActivityType.QUIZ, "Completed Java Core & Multithreading Mock Test (90%)"),
                (ActivityLog.ActivityType.PROJECT, "Updated project: PlaceTrace"),
            ]
            for a_type, a_title in activities:
                ActivityLog.objects.create(student=profile, activity_type=a_type, title=a_title)

        if student_user.notifications.count() < 3:
            Notification.objects.create(
                user=student_user,
                title="Technical Interview Shortlist: Oracle",
                message="Congratulations! You cleared the Assessment round for Software Development Engineer at Oracle.",
                notification_type=Notification.Type.INTERVIEW,
                link="/applications",
            )
            Notification.objects.create(
                user=student_user,
                title="New High-Match Job: Atlassian",
                message="Atlassian is hiring Full Stack Software Engineers (85% skill match with your profile).",
                notification_type=Notification.Type.JOB_MATCH,
                link="/jobs",
            )

        # 12. Invite Code & Audit Logs
        InviteCode.objects.get_or_create(
            code="PT-TPO2026",
            defaults={
                "role": User.Role.TPO,
                "department": "Placement Cell",
                "created_by": admin_user,
                "expires_at": timezone.now() + timedelta(days=90),
            },
        )
        if AuditLog.objects.count() < 3:
            log_audit_event(admin_user, "ADMIN_SEEDED_SYSTEM", "System", "1", {"note": "Initial seed"})
            log_audit_event(tpo_user, "JOB_CREATED", "Job", oracle_job.id, {"company": "Oracle", "title": oracle_job.title})
            log_audit_event(student_user, "STUDENT_APPLIED_FOR_JOB", "Application", app1.id, {"company": "Oracle"})

        # Compute deterministic readiness score
        compute_placement_readiness(profile, save=True)
        self.stdout.write(self.style.SUCCESS(f"Successfully seeded PlaceTrace! Student readiness: {profile.readiness_score}%"))
