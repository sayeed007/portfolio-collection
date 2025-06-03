// src/lib/utils/constants.ts

// Application routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  PORTFOLIO_CREATE: "/portfolio/create",
  PORTFOLIO_EDIT: "/portfolio/edit",
  PORTFOLIO_VIEW: "/portfolio",
  DIRECTORY: "/directory",
  ADMIN: "/admin",
  ADMIN_CATEGORIES: "/admin/categories",
  ADMIN_REQUESTS: "/admin/requests",
} as const;

// Firebase collections
export const COLLECTIONS = {
  USERS: "users",
  PORTFOLIOS: "portfolios",
  SKILL_CATEGORIES: "skillCategories",
  CATEGORY_REQUESTS: "categoryRequests",
} as const;

// Portfolio form steps
export const FORM_STEPS = {
  PERSONAL_INFO: 1,
  EDUCATION: 2,
  SKILLS_EXPERIENCE: 3,
  PROJECTS: 4,
} as const;

export const FORM_STEP_NAMES = {
  [FORM_STEPS.PERSONAL_INFO]: "Personal Information",
  [FORM_STEPS.EDUCATION]: "Education & Certifications",
  [FORM_STEPS.SKILLS_EXPERIENCE]: "Skills & Experience",
  [FORM_STEPS.PROJECTS]: "Projects",
} as const;

// Request statuses
export const REQUEST_STATUS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
} as const;

// User roles
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const;

// Default skill categories
export const DEFAULT_SKILL_CATEGORIES = [
  {
    name: "Programming Languages",
    skills: [
      "JavaScript (ES6)",
      "TypeScript",
      "Python",
      "Java",
      "C#",
      "PHP",
      "Ruby",
      "Go",
      "Rust",
      "Kotlin",
    ],
  },
  {
    name: "Frontend Technologies",
    skills: [
      "React",
      "Vue.js",
      "Angular",
      "Next.js",
      "Nuxt.js",
      "Svelte",
      "HTML5",
      "CSS3",
      "SCSS/SASS",
    ],
  },
  {
    name: "Backend Technologies",
    skills: [
      "Node.js",
      "Express.js",
      "Django",
      "Flask",
      "Spring Boot",
      "Laravel",
      "Ruby on Rails",
      "ASP.NET",
    ],
  },
  {
    name: "Database Management",
    skills: [
      "MongoDB",
      "PostgreSQL",
      "MySQL",
      "SQLite",
      "Redis",
      "Elasticsearch",
      "Firebase Firestore",
      "Oracle",
    ],
  },
  {
    name: "Mobile Development",
    skills: [
      "React Native",
      "Flutter",
      "Ionic",
      "Cordova",
      "Swift",
      "Kotlin",
      "Xamarin",
    ],
  },
  {
    name: "CSS Frameworks",
    skills: [
      "Tailwind CSS",
      "Bootstrap",
      "Material-UI",
      "Ant Design",
      "Chakra UI",
      "Bulma",
    ],
  },
  {
    name: "State Management",
    skills: ["Redux", "Zustand", "MobX", "Vuex", "Pinia", "Context API"],
  },
  {
    name: "Testing",
    skills: [
      "Jest",
      "Cypress",
      "Selenium",
      "Mocha",
      "Chai",
      "React Testing Library",
      "Puppeteer",
    ],
  },
  {
    name: "DevOps & Deployment",
    skills: [
      "Docker",
      "Kubernetes",
      "AWS",
      "Azure",
      "Google Cloud",
      "Vercel",
      "Netlify",
      "GitHub Actions",
    ],
  },
  {
    name: "Version Control",
    skills: ["Git", "GitHub", "GitLab", "Bitbucket", "SVN"],
  },
  {
    name: "Development Tools",
    skills: [
      "VS Code",
      "WebStorm",
      "IntelliJ IDEA",
      "Android Studio",
      "Xcode",
      "Figma",
      "Adobe XD",
    ],
  },
  {
    name: "Methodologies",
    skills: [
      "Agile",
      "Scrum",
      "Kanban",
      "TDD",
      "BDD",
      "DevOps",
      "Microservices",
      "REST API",
      "GraphQL",
    ],
  },
];

// Common languages for language proficiency
export const COMMON_LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Chinese (Mandarin)",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Bengali",
  "Urdu",
  "Tamil",
  "Telugu",
  "Marathi",
  "Gujarati",
  "Punjabi",
  "Dutch",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
];

// Common nationalities
export const COMMON_NATIONALITIES = [
  "American",
  "British",
  "Canadian",
  "Australian",
  "German",
  "French",
  "Spanish",
  "Italian",
  "Dutch",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Indian",
  "Bangladeshi",
  "Pakistani",
  "Chinese",
  "Japanese",
  "Korean",
  "Brazilian",
  "Mexican",
  "Argentinian",
  "Russian",
  "Ukrainian",
  "Polish",
  "Czech",
  "Hungarian",
  "Romanian",
  "Bulgarian",
  "Serbian",
  "Croatian",
  "Slovenian",
  "Slovakian",
  "Estonian",
  "Latvian",
  "Lithuanian",
];

// File size limits
export const FILE_LIMITS = {
  PROFILE_IMAGE_MAX_SIZE: 1048576, // 1MB in bytes
  SUPPORTED_IMAGE_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
} as const;

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: "This field is required",
  INVALID_EMAIL: "Please enter a valid email address",
  INVALID_PHONE: "Please enter a valid phone number",
  INVALID_YEAR: "Please enter a valid year",
  INVALID_IMAGE: "Please select a valid image file",
  IMAGE_TOO_LARGE: "Image size must be less than 1MB",
  PASSWORD_TOO_SHORT: "Password must be at least 6 characters long",
  PASSWORD_REQUIREMENTS:
    "Password must contain at least one uppercase letter, one lowercase letter, and one number",
} as const;

// Portfolio privacy options
export const PRIVACY_OPTIONS = {
  PUBLIC: "public",
  PRIVATE: "private",
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
} as const;

// Search filters
export const SEARCH_FILTERS = {
  EXPERIENCE_RANGES: [
    { label: "0-2 years", min: 0, max: 2 },
    { label: "3-5 years", min: 3, max: 5 },
    { label: "6-10 years", min: 6, max: 10 },
    { label: "10+ years", min: 10, max: 999 },
  ],
  SORT_OPTIONS: [
    { label: "Name (A-Z)", value: "name_asc" },
    { label: "Name (Z-A)", value: "name_desc" },
    { label: "Experience (Low to High)", value: "experience_asc" },
    { label: "Experience (High to Low)", value: "experience_desc" },
    { label: "Recently Updated", value: "updated_desc" },
    { label: "Most Visited", value: "visits_desc" },
  ],
} as const;

// Toast notification types
export const TOAST_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  PORTFOLIO_DRAFT: "portfolio_draft",
  USER_PREFERENCES: "user_preferences",
  THEME: "theme",
} as const;

// Theme options
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
} as const;

// Animation durations (in milliseconds)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Breakpoints for responsive design
export const BREAKPOINTS = {
  SM: "640px",
  MD: "768px",
  LG: "1024px",
  XL: "1280px",
  "2XL": "1536px",
} as const;
