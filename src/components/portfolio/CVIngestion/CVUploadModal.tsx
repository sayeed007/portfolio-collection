'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';
import { ingestCV, CVIngestionResult } from '@/lib/cv-ingestion';
import { DatabaseEntityResolver } from '@/lib/cv-ingestion/services/entity-resolver';

interface CVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: CVIngestionResult) => void;
  entityResolver?: DatabaseEntityResolver;
}

// Constants moved outside component to avoid dependency issues
const ACCEPTED_FILE_TYPES = ['.pdf', '.docx', '.doc', '.txt'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function CVUploadModal({
  isOpen,
  onClose,
  onSuccess,
  entityResolver,
}: CVUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [useLLM, setUseLLM] = useState(true);
  const [llmProvider, setLlmProvider] = useState<'openai' | 'anthropic' | 'gemini'>('gemini');
  const [apiKey, setApiKey] = useState(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    setError(null);

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_FILE_TYPES.includes(fileExtension)) {
      setError(
        `Unsupported file type. Please upload ${ACCEPTED_FILE_TYPES.join(', ')} files only.`
      );
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.`);
      return;
    }

    setSelectedFile(file);
  }, []);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Process CV
  const handleProcessCV = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await ingestCV({
        file: selectedFile,
        config: {
          useLLM,
          apiKey: useLLM ? apiKey : undefined,
          llmProvider: useLLM ? llmProvider : undefined,
          fallbackToDeterministic: true,
          enableOCR: false,
          confidenceThreshold: 0.7,
          debugMode: false,
        },
        entityResolver,
      });

      clearInterval(progressInterval);
      setProgress(100);

      // const result = {
      //   "success": true,
      //   "parsedCV": {
      //     "personalInfo": {
      //       "fullName": "Sayeed Hossen Bappy",
      //       "email": "bappy143081@gmail.com",
      //       "phone": "+8801934939844",
      //       "location": "House 14/C, Kamini RUAP,Uttara,Dhaka",
      //       "summary": "Innovative Frontend Engineer with 4.5+ years of experience developing scalable, data-driven web and mobile applications using React, Next.js, TypeScript, and Node.js. Skilled in architecting modern UI systems, integrating RESTful APIs, and optimizing performance for enterprise-grade platforms like HRM-ERP and government-backed projects such as Sufal. Adept at leading teams, mentoring developers, and collaborating with global clients to translate complex business needs into elegant technical solutions. Passionate about clean architecture, user-centric design, and delivering reliable software that drives measurable impact.",
      //       "linkedIn": "linkedin.com/in/sayeed-hossen-bappy-844675196",
      //       "github": "github.com/sayeed007"
      //     },
      //     "education": [
      //       {
      //         "degree": "B.Sc. - CSE",
      //         "institution": "Rajshahi University of Engineering & Technology",
      //         "graduationYear": 2022,
      //         "grade": "2.89",
      //         "fieldOfStudy": "Computer Science and Engineering",
      //         "confidence": 0.85
      //       },
      //       {
      //         "degree": "H.S.C - Science",
      //         "institution": "Akij Collegiate School, Jessore",
      //         "graduationYear": 2014,
      //         "grade": "5.00",
      //         "confidence": 0.85
      //       },
      //       {
      //         "degree": "S.S.C - Science",
      //         "institution": "Sheikh Akijuddin High School, Jessore",
      //         "graduationYear": 2012,
      //         "grade": "5.00",
      //         "confidence": 0.85
      //       }
      //     ],
      //     "certifications": [
      //       {
      //         "name": "Certification of Completion",
      //         "issuer": "Learn With Sumit",
      //         "issueDate": "Jun 2024",
      //         "confidence": 0.8
      //       }
      //     ],
      //     "courses": [],
      //     "skills": {
      //       "categories": [
      //         {
      //           "categoryName": "Frontend",
      //           "skills": [
      //             {
      //               "name": "React",
      //               "confidence": 0.85
      //             },
      //             {
      //               "name": "Next.js",
      //               "confidence": 0.85
      //             },
      //             {
      //               "name": "React Native",
      //               "confidence": 0.85
      //             },
      //             {
      //               "name": "TypeScript",
      //               "confidence": 0.85
      //             },
      //             {
      //               "name": "JavaScript (ES6)",
      //               "confidence": 0.85
      //             },
      //             {
      //               "name": "Angular",
      //               "confidence": 0.85
      //             }
      //           ],
      //           "confidence": 0.85
      //         },
      //         {
      //           "categoryName": "Backend",
      //           "skills": [
      //             {
      //               "name": "Node",
      //               "confidence": 0.85
      //             },
      //             {
      //               "name": "Express",
      //               "confidence": 0.85
      //             },
      //             {
      //               "name": "Firebase",
      //               "confidence": 0.85
      //             },
      //             {
      //               "name": "Supabase",
      //               "confidence": 0.85
      //             }
      //           ],
      //           "confidence": 0.85
      //         },
      //         {
      //           "categoryName": "Database",
      //           "skills": [
      //             {
      //               "name": "MongoDB",
      //               "confidence": 0.85
      //             },
      //             {
      //               "name": "PostgreSQL",
      //               "confidence": 0.85
      //             }
      //           ],
      //           "confidence": 0.85
      //         },
      //         {
      //           "categoryName": "Libraries & Frameworks",
      //           "skills": [
      //             {
      //               "name": "jQuery",
      //               "confidence": 0.85
      //             },
      //             {
      //               "name": "Redux",
      //               "confidence": 0.85
      //             },
      //             {
      //               "name": "Redux-Toolkit",
      //               "confidence": 0.85
      //             },
      //             {
      //               "name": "Redux-Thunk",
      //               "confidence": 0.85
      //             },
      //             {
      //               "name": "React Hook Form",
      //               "confidence": 0.85
      //             },
      //             {
      //               "name": "Formik",
      //               "confidence": 0.85
      //             },
      //             {
      //               "name": "Zustand",
      //               "confidence": 0.85
      //             },
      //             {
      //               "name": "Yup",
      //               "confidence": 0.85
      //             },
      //             {
      //               "name": "Ionic",
      //               "confidence": 0.85
      //             },
      //             {
      //               "name": "Cordova",
      //               "confidence": 0.85
      //             }
      //           ],
      //           "confidence": 0.85
      //         },
      //         {
      //           "categoryName": "Design",
      //           "skills": [
      //             {
      //               "name": "Tailwind",
      //               "confidence": 0.85
      //             },
      //             {
      //               "name": "Bootstrap",
      //               "confidence": 0.85
      //             },
      //             {
      //               "name": "SCSS",
      //               "confidence": 0.85
      //             },
      //             {
      //               "name": "CSS3",
      //               "confidence": 0.85
      //             },
      //             {
      //               "name": "ShadCN",
      //               "confidence": 0.85
      //             },
      //             {
      //               "name": "React Native Paper",
      //               "confidence": 0.85
      //             }
      //           ],
      //           "confidence": 0.85
      //         },
      //         {
      //           "categoryName": "Data Visualization",
      //           "skills": [
      //             {
      //               "name": "AmCharts-4",
      //               "confidence": 0.85
      //             },
      //             {
      //               "name": "plotly-js",
      //               "confidence": 0.85
      //             },
      //             {
      //               "name": "Excel",
      //               "confidence": 0.85
      //             }
      //           ],
      //           "confidence": 0.85
      //         },
      //         {
      //           "categoryName": "Version Control",
      //           "skills": [
      //             {
      //               "name": "Git-(Github/Gitlab/Bitbucket)",
      //               "confidence": 0.85
      //             }
      //           ],
      //           "confidence": 0.85
      //         },
      //         {
      //           "categoryName": "Soft Skills",
      //           "skills": [
      //             {
      //               "name": "Client Communication",
      //               "confidence": 0.85
      //             },
      //             {
      //               "name": "Team Mentoring",
      //               "confidence": 0.85
      //             },
      //             {
      //               "name": "Time Management",
      //               "confidence": 0.85
      //             }
      //           ],
      //           "confidence": 0.85
      //         }
      //       ],
      //       "raw": []
      //     },
      //     "workExperience": [
      //       {
      //         "company": "Neural Semiconductor Limited",
      //         "position": "Sr. Engineer",
      //         "startDate": "Jul 2024",
      //         "endDate": null,
      //         "isCurrentRole": true,
      //         "responsibilities": [
      //           "Expanded expertise in additional tech stacks, including Angular and app development with React Native using Expo and Ionic-Cordova, successfully delivering app functionality with Angular-Ionic-Cordova.",
      //           "Advanced backend development skills by creating APIs and backend services with Next.js, MongoDB, and Mongoose. Completed two demo projects (E-commerce and Simple Portfolio) with full authentication and authorization."
      //         ],
      //         "technologies": [
      //           "Angular",
      //           "React Native",
      //           "Expo",
      //           "Ionic-Cordova",
      //           "Next.js",
      //           "MongoDB",
      //           "Mongoose"
      //         ],
      //         "confidence": 0.85
      //       },
      //       {
      //         "company": "Neural Semiconductor Limited",
      //         "position": "Software Engineer III",
      //         "startDate": "Jul 2023",
      //         "endDate": "Jun 2024",
      //         "isCurrentRole": false,
      //         "responsibilities": [
      //           "Communicated with clients to understand business logic, translated it into functional requirements, and managed the entire development and delivery timeline.",
      //           "Selected tech stacks for projects, developed proficiency in Next.js, and completed projects like Retailer Campaign Management, Marketing Tracker, and Asset Management."
      //         ],
      //         "technologies": [
      //           "Next.js"
      //         ],
      //         "confidence": 0.85
      //       },
      //       {
      //         "company": "Neural Semiconductor Limited",
      //         "position": "Software Engineer II",
      //         "startDate": "Jul 2022",
      //         "endDate": "Jun 2023",
      //         "isCurrentRole": false,
      //         "responsibilities": [
      //           "Began mentoring junior developers (initially 4 now 12), guiding them in becoming proficient front-end developers.",
      //           "Took full responsibility for requirements, time estimation, development, and delivery of specific features such as the Help Desk functionality."
      //         ],
      //         "technologies": [],
      //         "confidence": 0.85
      //       },
      //       {
      //         "company": "Neural Semiconductor Limited",
      //         "position": "Software Engineer I & Associate",
      //         "startDate": "Apr 2021",
      //         "endDate": "Jun 2022",
      //         "isCurrentRole": false,
      //         "responsibilities": [
      //           "Mastered React, TypeScript, and Redux, contributing to HRM-ERP and Smart Search projects.",
      //           "Acquired advanced knowledge in React, Hooks, Postman for REST APIs, Formik and Yup for form validation, React Router, npm for third-party packages, and Redux for state management.",
      //           "Contributed significantly to HRM development and other client projects like Smart Search.",
      //           "Worked closely with senior developers to learn best practices, clean code principles, and participated as a tester for functionality and requirements.",
      //           "Began my development career by learning HTML5, CSS3, Bootstrap (versions 3, 4, and 5), and jQuery.",
      //           "Developed single-page web applications with jQuery based on client requirements."
      //         ],
      //         "technologies": [
      //           "React",
      //           "TypeScript",
      //           "Redux",
      //           "Hooks",
      //           "Postman",
      //           "REST APIs",
      //           "Formik",
      //           "Yup",
      //           "React Router",
      //           "npm",
      //           "HTML5",
      //           "CSS3",
      //           "Bootstrap",
      //           "jQuery"
      //         ],
      //         "confidence": 0.85
      //       }
      //     ],
      //     "projects": [
      //       {
      //         "name": "Asset Management System (C&F Tracker)",
      //         "description": "Asset tracking system for monitoring shipments and office inventory from warehouse to end user. Implemented advanced inventory filtering; oversaw project development and UI/UX consistency.",
      //         "contribution": "Asset tracking system for monitoring shipments and office inventory from warehouse to end user. Implemented advanced inventory filtering; oversaw project development and UI/UX consistency.",
      //         "technologies": [
      //           "Next 14",
      //           "Tailwind",
      //           "Next-Auth"
      //         ],
      //         "startDate": "Jan 2024",
      //         "endDate": null,
      //         "confidence": 0.8
      //       },
      //       {
      //         "name": "Learning Management System",
      //         "description": "Developed a full-featured Learning Management System with advanced course creation, assignments, and quiz management, integrated with a question bank for reusable content. Implemented article posting, user role management, and dashboard analytics to support both learners and instructors.",
      //         "contribution": "Developed a full-featured Learning Management System with advanced course creation, assignments, and quiz management, integrated with a question bank for reusable content. Implemented article posting, user role management, and dashboard analytics to support both learners and instructors.",
      //         "technologies": [
      //           "Next 14",
      //           "TypeScript",
      //           "ShadCN",
      //           "Redux-Toolkit",
      //           "Node",
      //           "Express",
      //           "REST Architecture",
      //           "MongoDB"
      //         ],
      //         "startDate": "Mar 2025",
      //         "endDate": null,
      //         "confidence": 0.8
      //       },
      //       {
      //         "name": "HRM-ERP (Web)",
      //         "description": "Enterprise-grade HRM system supporting complete employee lifecycle: onboarding, leave, payroll, benefits, loans, and exit processes. Serving as the frontend lead—developing new features, maintaining UI consistency, and reviewing code across the platform.",
      //         "contribution": "Enterprise-grade HRM system supporting complete employee lifecycle: onboarding, leave, payroll, benefits, loans, and exit processes. Serving as the frontend lead—developing new features, maintaining UI consistency, and reviewing code across the platform.",
      //         "technologies": [
      //           "React",
      //           "CoreUI 3",
      //           "am4charts"
      //         ],
      //         "startDate": "Jul 2021",
      //         "endDate": null,
      //         "confidence": 0.8
      //       },
      //       {
      //         "name": "HRM-ERP - App",
      //         "description": "Cross-platform mobile version of the HRM-ERP system, allowing employees to manage HR-related activities from their mobile devices. Features include attendance tracking, leave applications, payroll viewing, and internal communication tools. Built with Tailwind for consistent UI/UX design and Expo for easy deployment across Android and iOS.",
      //         "contribution": "Cross-platform mobile version of the HRM-ERP system, allowing employees to manage HR-related activities from their mobile devices. Features include attendance tracking, leave applications, payroll viewing, and internal communication tools. Built with Tailwind for consistent UI/UX design and Expo for easy deployment across Android and iOS.",
      //         "technologies": [
      //           "React Native",
      //           "Tailwind",
      //           "Expo",
      //           "TypeScript"
      //         ],
      //         "startDate": "2024",
      //         "endDate": "2025",
      //         "confidence": 0.8
      //       },
      //       {
      //         "name": "Sufal (Sustainable Forests & Livelihoods)",
      //         "description": "A government project under the Ministry of Forest, Bangladesh, designed to support sustainable forest monitoring and management. Enables forest officers to enter and calculate forest area data via GPS, digitizing workflows from the web version ssp.bforest.gov.bd.",
      //         "contribution": "A government project under the Ministry of Forest, Bangladesh, designed to support sustainable forest monitoring and management. Enables forest officers to enter and calculate forest area data via GPS, digitizing workflows from the web version ssp.bforest.gov.bd.",
      //         "technologies": [
      //           "React Native CLI",
      //           "React Native Paper",
      //           "TypeScript",
      //           "PHP",
      //           "REST Architecture"
      //         ],
      //         "startDate": "2025",
      //         "endDate": null,
      //         "confidence": 0.8
      //       },
      //       {
      //         "name": "Carplounge V4 Autopilot",
      //         "description": "Cross-platform mobile app developed for a German fishing tech company, integrating sensors and real-time data for optimized fishing. Worked on the premium \"Catch Book\" module to allow users to log, view, and analyze their catch history with environmental context.",
      //         "contribution": "Cross-platform mobile app developed for a German fishing tech company, integrating sensors and real-time data for optimized fishing. Worked on the premium \"Catch Book\" module to allow users to log, view, and analyze their catch history with environmental context.",
      //         "technologies": [
      //           "Angular",
      //           "Ionic",
      //           "Cordova",
      //           "IndexedDB",
      //           "SCSS"
      //         ],
      //         "startDate": "Mar 2024",
      //         "endDate": "Jun 2024",
      //         "confidence": 0.8
      //       }
      //     ],
      //     "metadata": {
      //       "fileName": "Sayeed_Hossen_Bappy.pdf",
      //       "fileType": "pdf",
      //       "fileSize": 311345,
      //       "uploadedAt": "2025-11-03T10:28:15.850Z",
      //       "parsingMethod": "llm",
      //       "parsingDuration": 35305,
      //       "totalConfidence": 0.85,
      //       "warnings": [],
      //       "errors": []
      //     }
      //   },
      //   "normalizationResult": {
      //     "formData": {
      //       "email": "bappy143081@gmail.com",
      //       "mobileNo": "+8801934939844",
      //       "nationality": "Unknown",
      //       "yearsOfExperience": 4,
      //       "designation": "Sr. Engineer",
      //       "summary": "Innovative Frontend Engineer with 4.5+ years of experience developing scalable, data-driven web and mobile applications using React, Next.js, TypeScript, and Node.js. Skilled in architecting modern UI systems, integrating RESTful APIs, and optimizing performance for enterprise-grade platforms like HRM-ERP and government-backed projects such as Sufal. Adept at leading teams, mentoring developers, and collaborating with global clients to translate complex business needs into elegant technical solutions. Passionate about clean architecture, user-centric design, and delivering reliable software that drives measurable impact.",
      //       "employeeCode": "",
      //       "languageProficiency": [
      //         {
      //           "language": "English",
      //           "proficiency": "professional"
      //         }
      //       ],
      //       "education": [
      //         {
      //           "degree": "B.Sc. - CSE",
      //           "institution": "Rajshahi University of Engineering & Technology",
      //           "passingYear": 2022,
      //           "grade": "2.89"
      //         },
      //         {
      //           "degree": "H.S.C - Science",
      //           "institution": "Akij Collegiate School, Jessore",
      //           "passingYear": 2014,
      //           "grade": "5.00"
      //         },
      //         {
      //           "degree": "S.S.C - Science",
      //           "institution": "Sheikh Akijuddin High School, Jessore",
      //           "passingYear": 2012,
      //           "grade": "5.00"
      //         }
      //       ],
      //       "certifications": [
      //         {
      //           "name": "Certification of Completion",
      //           "issuer": "Learn With Sumit",
      //           "date": "Jun 2024",
      //           "issuingOrganization": "Learn With Sumit",
      //           "year": "2024"
      //         }
      //       ],
      //       "courses": [],
      //       "technicalSkills": [
      //         {
      //           "category": "__UNMAPPED__Frontend",
      //           "skills": [
      //             {
      //               "skillId": "__UNMAPPED__React",
      //               "proficiency": "Intermediate"
      //             },
      //             {
      //               "skillId": "__UNMAPPED__Next.js",
      //               "proficiency": "Intermediate"
      //             },
      //             {
      //               "skillId": "__UNMAPPED__React Native",
      //               "proficiency": "Intermediate"
      //             },
      //             {
      //               "skillId": "__UNMAPPED__TypeScript",
      //               "proficiency": "Intermediate"
      //             },
      //             {
      //               "skillId": "__UNMAPPED__JavaScript (ES6)",
      //               "proficiency": "Intermediate"
      //             },
      //             {
      //               "skillId": "__UNMAPPED__Angular",
      //               "proficiency": "Intermediate"
      //             }
      //           ]
      //         },
      //         {
      //           "category": "__UNMAPPED__Backend",
      //           "skills": [
      //             {
      //               "skillId": "__UNMAPPED__Node",
      //               "proficiency": "Intermediate"
      //             },
      //             {
      //               "skillId": "__UNMAPPED__Express",
      //               "proficiency": "Intermediate"
      //             },
      //             {
      //               "skillId": "__UNMAPPED__Firebase",
      //               "proficiency": "Intermediate"
      //             },
      //             {
      //               "skillId": "__UNMAPPED__Supabase",
      //               "proficiency": "Intermediate"
      //             }
      //           ]
      //         },
      //         {
      //           "category": "__UNMAPPED__Database",
      //           "skills": [
      //             {
      //               "skillId": "__UNMAPPED__MongoDB",
      //               "proficiency": "Intermediate"
      //             },
      //             {
      //               "skillId": "__UNMAPPED__PostgreSQL",
      //               "proficiency": "Intermediate"
      //             }
      //           ]
      //         },
      //         {
      //           "category": "__UNMAPPED__Libraries & Frameworks",
      //           "skills": [
      //             {
      //               "skillId": "__UNMAPPED__jQuery",
      //               "proficiency": "Intermediate"
      //             },
      //             {
      //               "skillId": "__UNMAPPED__Redux",
      //               "proficiency": "Intermediate"
      //             },
      //             {
      //               "skillId": "__UNMAPPED__Redux-Toolkit",
      //               "proficiency": "Intermediate"
      //             },
      //             {
      //               "skillId": "__UNMAPPED__Redux-Thunk",
      //               "proficiency": "Intermediate"
      //             },
      //             {
      //               "skillId": "__UNMAPPED__React Hook Form",
      //               "proficiency": "Intermediate"
      //             },
      //             {
      //               "skillId": "__UNMAPPED__Formik",
      //               "proficiency": "Intermediate"
      //             },
      //             {
      //               "skillId": "__UNMAPPED__Zustand",
      //               "proficiency": "Intermediate"
      //             },
      //             {
      //               "skillId": "__UNMAPPED__Yup",
      //               "proficiency": "Intermediate"
      //             },
      //             {
      //               "skillId": "__UNMAPPED__Ionic",
      //               "proficiency": "Intermediate"
      //             },
      //             {
      //               "skillId": "__UNMAPPED__Cordova",
      //               "proficiency": "Intermediate"
      //             }
      //           ]
      //         },
      //         {
      //           "category": "__UNMAPPED__Design",
      //           "skills": [
      //             {
      //               "skillId": "__UNMAPPED__Tailwind",
      //               "proficiency": "Intermediate"
      //             },
      //             {
      //               "skillId": "__UNMAPPED__Bootstrap",
      //               "proficiency": "Intermediate"
      //             },
      //             {
      //               "skillId": "__UNMAPPED__SCSS",
      //               "proficiency": "Intermediate"
      //             },
      //             {
      //               "skillId": "__UNMAPPED__CSS3",
      //               "proficiency": "Intermediate"
      //             },
      //             {
      //               "skillId": "__UNMAPPED__ShadCN",
      //               "proficiency": "Intermediate"
      //             },
      //             {
      //               "skillId": "__UNMAPPED__React Native Paper",
      //               "proficiency": "Intermediate"
      //             }
      //           ]
      //         },
      //         {
      //           "category": "__UNMAPPED__Data Visualization",
      //           "skills": [
      //             {
      //               "skillId": "__UNMAPPED__AmCharts-4",
      //               "proficiency": "Intermediate"
      //             },
      //             {
      //               "skillId": "__UNMAPPED__plotly-js",
      //               "proficiency": "Intermediate"
      //             },
      //             {
      //               "skillId": "__UNMAPPED__Excel",
      //               "proficiency": "Intermediate"
      //             }
      //           ]
      //         },
      //         {
      //           "category": "__UNMAPPED__Version Control",
      //           "skills": [
      //             {
      //               "skillId": "__UNMAPPED__Git-(Github/Gitlab/Bitbucket)",
      //               "proficiency": "Intermediate"
      //             }
      //           ]
      //         },
      //         {
      //           "category": "__UNMAPPED__Soft Skills",
      //           "skills": [
      //             {
      //               "skillId": "__UNMAPPED__Client Communication",
      //               "proficiency": "Intermediate"
      //             },
      //             {
      //               "skillId": "__UNMAPPED__Team Mentoring",
      //               "proficiency": "Intermediate"
      //             },
      //             {
      //               "skillId": "__UNMAPPED__Time Management",
      //               "proficiency": "Intermediate"
      //             }
      //           ]
      //         }
      //       ],
      //       "workExperience": [
      //         {
      //           "company": "Neural Semiconductor Limited",
      //           "position": "Sr. Engineer",
      //           "startDate": "Jul 2024",
      //           "endDate": null,
      //           "isCurrentRole": true,
      //           "responsibilities": [
      //             "Expanded expertise in additional tech stacks, including Angular and app development with React Native using Expo and Ionic-Cordova, successfully delivering app functionality with Angular-Ionic-Cordova.",
      //             "Advanced backend development skills by creating APIs and backend services with Next.js, MongoDB, and Mongoose. Completed two demo projects (E-commerce and Simple Portfolio) with full authentication and authorization."
      //           ],
      //           "technologies": [
      //             "Angular",
      //             "React Native",
      //             "Expo",
      //             "Ionic-Cordova",
      //             "Next.js",
      //             "MongoDB",
      //             "Mongoose"
      //           ]
      //         },
      //         {
      //           "company": "Neural Semiconductor Limited",
      //           "position": "Software Engineer III",
      //           "startDate": "Jul 2023",
      //           "endDate": "Jun 2024",
      //           "isCurrentRole": false,
      //           "responsibilities": [
      //             "Communicated with clients to understand business logic, translated it into functional requirements, and managed the entire development and delivery timeline.",
      //             "Selected tech stacks for projects, developed proficiency in Next.js, and completed projects like Retailer Campaign Management, Marketing Tracker, and Asset Management."
      //           ],
      //           "technologies": [
      //             "Next.js"
      //           ]
      //         },
      //         {
      //           "company": "Neural Semiconductor Limited",
      //           "position": "Software Engineer II",
      //           "startDate": "Jul 2022",
      //           "endDate": "Jun 2023",
      //           "isCurrentRole": false,
      //           "responsibilities": [
      //             "Began mentoring junior developers (initially 4 now 12), guiding them in becoming proficient front-end developers.",
      //             "Took full responsibility for requirements, time estimation, development, and delivery of specific features such as the Help Desk functionality."
      //           ],
      //           "technologies": []
      //         },
      //         {
      //           "company": "Neural Semiconductor Limited",
      //           "position": "Software Engineer I & Associate",
      //           "startDate": "Apr 2021",
      //           "endDate": "Jun 2022",
      //           "isCurrentRole": false,
      //           "responsibilities": [
      //             "Mastered React, TypeScript, and Redux, contributing to HRM-ERP and Smart Search projects.",
      //             "Acquired advanced knowledge in React, Hooks, Postman for REST APIs, Formik and Yup for form validation, React Router, npm for third-party packages, and Redux for state management.",
      //             "Contributed significantly to HRM development and other client projects like Smart Search.",
      //             "Worked closely with senior developers to learn best practices, clean code principles, and participated as a tester for functionality and requirements.",
      //             "Began my development career by learning HTML5, CSS3, Bootstrap (versions 3, 4, and 5), and jQuery.",
      //             "Developed single-page web applications with jQuery based on client requirements."
      //           ],
      //           "technologies": [
      //             "React",
      //             "TypeScript",
      //             "Redux",
      //             "Hooks",
      //             "Postman",
      //             "REST APIs",
      //             "Formik",
      //             "Yup",
      //             "React Router",
      //             "npm",
      //             "HTML5",
      //             "CSS3",
      //             "Bootstrap",
      //             "jQuery"
      //           ]
      //         }
      //       ],
      //       "projects": [
      //         {
      //           "name": "Asset Management System (C&F Tracker)",
      //           "description": "Asset tracking system for monitoring shipments and office inventory from warehouse to end user. Implemented advanced inventory filtering; oversaw project development and UI/UX consistency.",
      //           "contribution": "Asset tracking system for monitoring shipments and office inventory from warehouse to end user. Implemented advanced inventory filtering; oversaw project development and UI/UX consistency.",
      //           "technologies": [
      //             "Next 14",
      //             "Tailwind",
      //             "Next-Auth"
      //           ],
      //           "startDate": "Jan 2024",
      //           "endDate": null
      //         },
      //         {
      //           "name": "Learning Management System",
      //           "description": "Developed a full-featured Learning Management System with advanced course creation, assignments, and quiz management, integrated with a question bank for reusable content. Implemented article posting, user role management, and dashboard analytics to support both learners and instructors.",
      //           "contribution": "Developed a full-featured Learning Management System with advanced course creation, assignments, and quiz management, integrated with a question bank for reusable content. Implemented article posting, user role management, and dashboard analytics to support both learners and instructors.",
      //           "technologies": [
      //             "Next 14",
      //             "TypeScript",
      //             "ShadCN",
      //             "Redux-Toolkit",
      //             "Node",
      //             "Express",
      //             "REST Architecture",
      //             "MongoDB"
      //           ],
      //           "startDate": "Mar 2025",
      //           "endDate": null
      //         },
      //         {
      //           "name": "HRM-ERP (Web)",
      //           "description": "Enterprise-grade HRM system supporting complete employee lifecycle: onboarding, leave, payroll, benefits, loans, and exit processes. Serving as the frontend lead—developing new features, maintaining UI consistency, and reviewing code across the platform.",
      //           "contribution": "Enterprise-grade HRM system supporting complete employee lifecycle: onboarding, leave, payroll, benefits, loans, and exit processes. Serving as the frontend lead—developing new features, maintaining UI consistency, and reviewing code across the platform.",
      //           "technologies": [
      //             "React",
      //             "CoreUI 3",
      //             "am4charts"
      //           ],
      //           "startDate": "Jul 2021",
      //           "endDate": null
      //         },
      //         {
      //           "name": "HRM-ERP - App",
      //           "description": "Cross-platform mobile version of the HRM-ERP system, allowing employees to manage HR-related activities from their mobile devices. Features include attendance tracking, leave applications, payroll viewing, and internal communication tools. Built with Tailwind for consistent UI/UX design and Expo for easy deployment across Android and iOS.",
      //           "contribution": "Cross-platform mobile version of the HRM-ERP system, allowing employees to manage HR-related activities from their mobile devices. Features include attendance tracking, leave applications, payroll viewing, and internal communication tools. Built with Tailwind for consistent UI/UX design and Expo for easy deployment across Android and iOS.",
      //           "technologies": [
      //             "React Native",
      //             "Tailwind",
      //             "Expo",
      //             "TypeScript"
      //           ],
      //           "startDate": "2024",
      //           "endDate": "2025"
      //         },
      //         {
      //           "name": "Sufal (Sustainable Forests & Livelihoods)",
      //           "description": "A government project under the Ministry of Forest, Bangladesh, designed to support sustainable forest monitoring and management. Enables forest officers to enter and calculate forest area data via GPS, digitizing workflows from the web version ssp.bforest.gov.bd.",
      //           "contribution": "A government project under the Ministry of Forest, Bangladesh, designed to support sustainable forest monitoring and management. Enables forest officers to enter and calculate forest area data via GPS, digitizing workflows from the web version ssp.bforest.gov.bd.",
      //           "technologies": [
      //             "React Native CLI",
      //             "React Native Paper",
      //             "TypeScript",
      //             "PHP",
      //             "REST Architecture"
      //           ],
      //           "startDate": "2025",
      //           "endDate": null
      //         },
      //         {
      //           "name": "Carplounge V4 Autopilot",
      //           "description": "Cross-platform mobile app developed for a German fishing tech company, integrating sensors and real-time data for optimized fishing. Worked on the premium \"Catch Book\" module to allow users to log, view, and analyze their catch history with environmental context.",
      //           "contribution": "Cross-platform mobile app developed for a German fishing tech company, integrating sensors and real-time data for optimized fishing. Worked on the premium \"Catch Book\" module to allow users to log, view, and analyze their catch history with environmental context.",
      //           "technologies": [
      //             "Angular",
      //             "Ionic",
      //             "Cordova",
      //             "IndexedDB",
      //             "SCSS"
      //           ],
      //           "startDate": "Mar 2024",
      //           "endDate": "Jun 2024"
      //         }
      //       ],
      //       "references": []
      //     },
      //     "unmappedFields": {
      //       "skills": [],
      //       "institutions": [],
      //       "degrees": []
      //     },
      //     "warnings": []
      //   },
      //   "validation": {
      //     "isValid": true,
      //     "errors": [],
      //     "warnings": [],
      //     "completeness": 86,
      //     "qualityScore": 100
      //   }
      // };

      if (result.success) {
        setTimeout(() => {
          onSuccess(result);
        }, 500);
      } else {
        setError(result.error?.message || 'Failed to process CV');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upload Your CV</h2>
            <p className="text-sm text-gray-500 mt-1">
              {"We'll automatically extract your information"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={isProcessing}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* File Upload Area */}
          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-xl p-12 text-center transition-all
                ${isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              <Upload
                className={`w-16 h-16 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'
                  }`}
              />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isDragging ? 'Drop your CV here' : 'Drag & drop your CV'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                or click to browse from your computer
              </p>

              <label className="inline-block">
                <input
                  type="file"
                  accept={ACCEPTED_FILE_TYPES.join(',')}
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <span className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-block">
                  Choose File
                </span>
              </label>

              <p className="text-xs text-gray-400 mt-4">
                Supported formats: PDF, DOCX, DOC, TXT (Max 10MB)
              </p>
            </div>
          ) : (
            // Selected File Preview
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{selectedFile.name}</h4>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                {!isProcessing && (
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                )}
              </div>

              {/* Processing Progress */}
              {isProcessing && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Processing...</span>
                    <span className="text-sm text-gray-500">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LLM Option (Advanced) */}
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                id="use-llm"
                checked={useLLM}
                onChange={e => setUseLLM(e.target.checked)}
                disabled={isProcessing}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="use-llm" className="font-medium text-gray-900">
                Use AI Enhancement (Optional)
              </label>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Enable AI-powered parsing for better accuracy with complex CVs
            </p>

            {useLLM && (
              <div className="space-y-3">
                <div>
                  <label htmlFor="llm-provider" className="block text-sm font-medium text-gray-700 mb-2">
                    AI Provider
                  </label>
                  <select
                    id="llm-provider"
                    value={llmProvider}
                    onChange={e => setLlmProvider(e.target.value as 'openai' | 'anthropic' | 'gemini')}
                    disabled={isProcessing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="gemini">Google Gemini (Recommended)</option>
                    <option value="openai">OpenAI GPT</option>
                    <option value="anthropic">Anthropic Claude</option>
                  </select>
                </div>
                <input
                  type="password"
                  placeholder={
                    llmProvider === 'gemini'
                      ? 'Google Gemini API Key'
                      : llmProvider === 'openai'
                        ? 'OpenAI API Key'
                        : 'Anthropic API Key'
                  }
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  disabled={isProcessing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900">Error</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Info Message */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Privacy First</h4>
              <p className="text-sm text-blue-700 mt-1">
                Your CV is processed securely and never stored on our servers.
                {useLLM
                  ? ' AI processing uses your API key for enhanced privacy.'
                  : ' All parsing happens locally in your browser.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleProcessCV}
            disabled={!selectedFile || isProcessing || (useLLM && !apiKey)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Process CV'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
