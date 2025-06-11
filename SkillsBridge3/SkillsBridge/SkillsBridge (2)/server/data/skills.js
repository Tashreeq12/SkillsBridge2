const skillDatabase = {
    // Technical/IT Skills
    technical: [
        "JavaScript", "Python", "SQL", "React", "Node.js", "Java", "C++", "C#", "Ruby", "PHP",
        "HTML", "CSS", "TypeScript", "Angular", "Vue.js", "Django", "Flask", "Spring Boot",
        "Data Analysis", "Machine Learning", "Artificial Intelligence", "Cloud Computing",
        "AWS", "Azure", "Google Cloud", "DevOps", "Docker", "Kubernetes", "Cybersecurity",
        "Network Administration", "UI/UX Design", "Web Development", "Mobile Development",
        "Blockchain", "Database Administration", "Big Data", "Hadoop", "Spark"
    ],
    // Soft Skills
    soft: [
        "Communication", "Leadership", "Project Management", "Teamwork", "Problem Solving",
        "Time Management", "Adaptability", "Critical Thinking", "Emotional Intelligence",
        "Collaboration", "Conflict Resolution", "Decision Making", "Negotiation",
        "Public Speaking", "Mentoring", "Creativity", "Work Ethic", "Resilience"
    ],
    // Education Skills
    education: [
        "Teaching", "Curriculum Design", "Educational Technology", "Classroom Management",
        "Pedagogy", "Instructional Design", "E-Learning", "Special Education", "Literacy Education",
        "STEM Education", "Assessment Design", "Student Counseling", "Educational Leadership",
        "Language Instruction", "Early Childhood Education", "Adult Education"
    ],
    // Management/Business Skills
    management: [
        "Strategic Planning", "Budgeting", "Team Leadership", "Change Management", "Risk Management",
        "Operations Management", "Human Resources", "Recruitment", "Performance Management",
        "Business Analysis", "Marketing Strategy", "Sales Management", "Customer Relationship Management",
        "Supply Chain Management", "Logistics", "Entrepreneurship", "Financial Planning",
        "Process Optimization", "Quality Assurance"
    ],
    // Creative Skills
    creative: [
        "Graphic Design", "Drawing", "Creative Writing", "Photography", "Video Editing", "Illustration",
        "Animation", "Motion Graphics", "3D Modeling", "Game Design", "Interior Design",
        "Fashion Design", "Music Production", "Audio Engineering", "Scriptwriting",
        "Art Direction", "Visual Storytelling", "Digital Art", "UX Writing"
    ],
    // Healthcare Skills
    healthcare: [
        "Nursing", "Patient Care", "Medical Diagnostics", "Surgery", "Pharmacology",
        "Physical Therapy", "Occupational Therapy", "Mental Health Counseling", "Public Health",
        "Health Informatics", "Emergency Medicine", "Clinical Research", "Medical Coding",
        "Nutrition", "Epidemiology", "Healthcare Administration", "Dental Hygiene"
    ],
    // Engineering Skills
    engineering: [
        "Mechanical Engineering", "Electrical Engineering", "Civil Engineering", "Chemical Engineering",
        "Structural Engineering", "Aerospace Engineering", "Robotics", "CAD Design",
        "Embedded Systems", "Control Systems", "Materials Science", "Environmental Engineering",
        "Industrial Engineering", "Systems Engineering", "Automotive Engineering"
    ],
    // Finance Skills
    finance: [
        "Accounting", "Financial Analysis", "Investment Management", "Tax Preparation",
        "Auditing", "Bookkeeping", "Corporate Finance", "Financial Modeling", "Risk Assessment",
        "Banking", "Insurance Underwriting", "Portfolio Management", "Cost Estimation",
        "Economic Analysis", "Cryptocurrency Trading", "Wealth Management"
    ],
    // Trades/Practical Skills
    trades: [
        "Carpentry", "Plumbing", "Electrical Wiring", "Welding", "HVAC Maintenance",
        "Automotive Repair", "Construction Management", "Masonry", "Landscaping",
        "Heavy Machinery Operation", "Painting", "Roofing", "Equipment Maintenance"
    ],
    // Legal Skills
    legal: [
        "Contract Law", "Criminal Law", "Corporate Law", "Litigation", "Legal Research",
        "Mediation", "Compliance", "Intellectual Property", "Family Law", "Environmental Law",
        "Paralegal Skills", "Courtroom Advocacy", "Legal Writing"
    ],
    // Miscellaneous Skills
    miscellaneous: [
        "Event Planning", "Customer Service", "Retail Management", "Hospitality",
        "Tourism Management", "Data Entry", "Technical Writing", "Translation",
        "Logistics Coordination", "Agricultural Science", "Veterinary Care", "Fitness Training"
    ]
};

const jobContexts = {
    // IT/Tech Roles
    "Web Developer": ["JavaScript", "React", "Node.js", "UI/UX Design", "HTML", "CSS", "Communication"],
    "Data Analyst": ["Python", "SQL", "Data Analysis", "Problem Solving", "Communication"],
    "Software Engineer": ["Java", "Python", "C++", "Cloud Computing", "Project Management", "Teamwork"],
    "DevOps Engineer": ["AWS", "Docker", "Kubernetes", "DevOps", "Linux", "Problem Solving"],
    "Cybersecurity Analyst": ["Cybersecurity", "Network Administration", "Risk Assessment", "Critical Thinking"],
    "Machine Learning Engineer": ["Machine Learning", "Python", "Data Analysis", "Mathematics", "Problem Solving"],

    // Education Roles
    "Teacher": ["Teaching", "Communication", "Curriculum Design", "Classroom Management", "Pedagogy"],
    "Instructional Designer": ["Instructional Design", "Educational Technology", "E-Learning", "Creativity", "Communication"],
    "School Counselor": ["Student Counseling", "Emotional Intelligence", "Communication", "Conflict Resolution"],
    "Educational Administrator": ["Educational Leadership", "Strategic Planning", "Team Leadership", "Budgeting"],

    // Management/Business Roles
    "Project Manager": ["Project Management", "Leadership", "Communication", "Teamwork", "Risk Management"],
    "Business Analyst": ["Business Analysis", "Data Analysis", "Problem Solving", "Communication"],
    "HR Manager": ["Human Resources", "Recruitment", "Performance Management", "Conflict Resolution"],
    "Marketing Manager": ["Marketing Strategy", "Creative Writing", "Communication", "Customer Relationship Management"],
    "Operations Manager": ["Operations Management", "Logistics", "Process Optimization", "Team Leadership"],

    // Creative Roles
    "Graphic Designer": ["Graphic Design", "UI/UX Design", "Creativity", "Illustration", "Communication"],
    "Video Editor": ["Video Editing", "Motion Graphics", "Creativity", "Technical Skills"],
    "Creative Director": ["Creative Writing", "Graphic Design", "Leadership", "Teamwork", "Art Direction"],
    "Game Designer": ["Game Design", "3D Modeling", "Creativity", "Problem Solving", "Teamwork"],

    // Healthcare Roles
    "Nurse": ["Nursing", "Patient Care", "Medical Diagnostics", "Communication", "Emotional Intelligence"],
    "Physical Therapist": ["Physical Therapy", "Patient Care", "Anatomy", "Problem Solving"],
    "Healthcare Administrator": ["Healthcare Administration", "Budgeting", "Leadership", "Compliance"],
    "Clinical Researcher": ["Clinical Research", "Data Analysis", "Medical Diagnostics", "Critical Thinking"],

    // Engineering Roles
    "Mechanical Engineer": ["Mechanical Engineering", "CAD Design", "Problem Solving", "Materials Science"],
    "Civil Engineer": ["Civil Engineering", "Structural Engineering", "Project Management", "Risk Assessment"],
    "Electrical Engineer": ["Electrical Engineering", "Embedded Systems", "Problem Solving", "Control Systems"],

    // Finance Roles
    "Accountant": ["Accounting", "Financial Analysis", "Bookkeeping", "Attention to Detail"],
    "Financial Analyst": ["Financial Analysis", "Financial Modeling", "Risk Assessment", "Data Analysis"],
    "Investment Manager": ["Investment Management", "Portfolio Management", "Economic Analysis", "Decision Making"],

    // Trades Roles
    "Carpenter": ["Carpentry", "Construction Management", "Problem Solving", "Attention to Detail"],
    "Electrician": ["Electrical Wiring", "Problem Solving", "Safety Procedures", "Technical Skills"],
    "Plumber": ["Plumbing", "Problem Solving", "Equipment Maintenance", "Customer Service"],

    // Legal Roles
    "Lawyer": ["Contract Law", "Litigation", "Legal Research", "Communication", "Critical Thinking"],
    "Paralegal": ["Paralegal Skills", "Legal Writing", "Compliance", "Attention to Detail"],

    // Miscellaneous Roles
    "Event Planner": ["Event Planning", "Customer Service", "Time Management", "Creativity"],
    "Customer Service Representative": ["Customer Service", "Communication", "Problem Solving", "Patience"],
    "Fitness Trainer": ["Fitness Training", "Nutrition", "Communication", "Motivation"]
};

module.exports = { skillDatabase, jobContexts };