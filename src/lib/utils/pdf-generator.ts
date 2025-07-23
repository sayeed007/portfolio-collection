// src/lib/utils/pdf-generator.ts

import { Portfolio } from "../types/portfolio";
import { formatDate, formatExperience, formatList } from "./formatters";
import { getJobDuration } from './helpers';

// PDF generation using html2pdf.js
// Note: Make sure to install html2pdf.js: npm install html2pdf.js @types/html2pdf.js

interface PDFOptions {
  filename?: string;
  format?: "a4" | "letter";
  orientation?: "portrait" | "landscape";
  margin?: number | [number, number, number, number];
  quality?: number;
}

// Create HTML template for PDF
export const createPortfolioHTML = (
  portfolio: Portfolio,
  allCategories: { value: string; label: string }[],
  allSkills: { value: string; label: string }[]
): string => {
  const {
    employeeCode,
    designation,
    yearsOfExperience,
    nationality,
    languageProficiency,
    summary,
    education,
    certifications,
    courses,
    technicalSkills,
    workExperience,
    projects,
    references,
  } = portfolio;
  const { email, mobileNo, profileImage, } = portfolio?.personalInfo;
  console.log(references);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Portfolio - ${employeeCode}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background: #fff;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          text-align: center;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .profile-image {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          margin: 0 auto 15px;
          border: 4px solid #e5e7eb;
        }
        
        .name {
          font-size: 28px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 5px;
        }
        
        .designation {
          font-size: 18px;
          color: #6b7280;
          margin-bottom: 10px;
        }
        
        .contact-info {
          display: flex;
          justify-content: center;
          gap: 20px;
          font-size: 14px;
          color: #4b5563;
          flex-wrap: wrap;
        }
        
        .section {
          margin-bottom: 25px;
        }
        
        .section-title {
          font-size: 20px;
          font-weight: bold;
          color: #1f2937;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
        
        .summary {
          font-size: 14px;
          line-height: 1.8;
          text-align: justify;
          color: #374151;
        }
        
        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 15px;
        }
        
        .card h4 {
          font-size: 16px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 8px;
        }
        
        .card p {
          font-size: 14px;
          color: #4b5563;
          margin-bottom: 5px;
        }
        
        .card .meta {
          font-size: 12px;
          color: #6b7280;
          font-style: italic;
        }
        
        .skills-category {
          margin-bottom: 15px;
        }
        
        .skills-category h4 {
          font-size: 16px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 8px;
        }
        
        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .skill-tag {
          background: #dbeafe;
          color: #1e40af;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .responsibilities {
          list-style: none;
          padding-left: 0;
        }
        
        .responsibilities li {
          position: relative;
          padding-left: 20px;
          margin-bottom: 5px;
          font-size: 14px;
          color: #4b5563;
        }
        
        .responsibilities li:before {
          content: "•";
          color: #2563eb;
          font-weight: bold;
          position: absolute;
          left: 0;
        }
        
        .technologies {
          font-size: 12px;
          color: #6b7280;
          font-style: italic;
          margin-top: 8px;
        }
        
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
        }
        
        @media print {
          body { -webkit-print-color-adjust: exact; }
          .container { padding: 10px; }
          .section { page-break-inside: avoid; }
          .card { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header Section -->
        <div class="header">
          ${profileImage
      ? `<img src="${profileImage}" alt="Profile" class="profile-image">`
      : ""
    }
          <div class="name">Employee ID: ${employeeCode}</div>
          <div class="designation">${designation}</div>
          <div class="contact-info">
            <span>📧 ${email}</span>
            <span>📱 ${mobileNo}</span>
            <span>🌍 ${nationality}</span>
            <span>💼 ${formatExperience(yearsOfExperience)}</span>
          </div>
        </div>

        <!-- Summary Section -->
        ${summary
      ? `
        <div class="section">
          <h2 class="section-title">Professional Summary</h2>
          <div class="summary">${summary}</div>
        </div>
        `
      : ""
    }

        <!-- Languages Section -->
        ${languageProficiency && languageProficiency.length > 0
      ? `
        <div class="section">
          <h2 class="section-title">Language Proficiency</h2>
          <p>${formatList(languageProficiency.map(lang => `${lang.language} (${lang.proficiency})`))}</p>
        </div>
        `
      : ""
    }

        <!-- Technical Skills Section -->
        ${technicalSkills && technicalSkills.length > 0
      ? `
        <div class="section">
          <h2 class="section-title">Technical Skills</h2>
          ${technicalSkills
        .map(
          (skillCategory) => `
            <div class="skills-category">
              <h4>${allCategories?.filter(category => category?.value === skillCategory.category)?.[0]?.label}</h4>
              <div class="skills-list">
                ${skillCategory.skills
              .map((skill) => `<span class="skill-tag">${allSkills?.filter(a_skill => a_skill?.value === skill.skillId)?.[0]?.label}(${skill.proficiency}))</span>`)
              .join("")}
              </div>
            </div>
          `
        )
        .join("")}
        </div>
        `
      : ""
    }

        <!-- Work Experience Section -->
        ${workExperience && workExperience.length > 0
      ? `
        <div class="section">
          <h2 class="section-title">Work Experience</h2>
          ${workExperience
        .map(
          (exp) => `
            <div class="card">
              <h4>${exp.position}</h4>
              <p><strong>${exp.company}</strong></p>
              <p class="meta">${getJobDuration(exp)} (${exp.startDate} - ${exp.endDate || 'Present'})</p>
              ${exp.responsibilities && exp.responsibilities.length > 0
              ? `
                <ul class="responsibilities">
                  ${exp.responsibilities
                .map((resp) => `<li>${resp}</li>`)
                .join("")}
                </ul>
              `
              : ""
            }
            </div>
          `
        )
        .join("")}
        </div>
        `
      : ""
    }

        <!-- Projects Section -->
        ${projects && projects.length > 0
      ? `
        <div class="section">
          <h2 class="section-title">Projects</h2>
          ${projects
        .map(
          (project) => `
            <div class="card">
              <h4>${project.name}</h4>
              <p>${project.description}</p>
              <p><strong>Contribution:</strong> ${project.contribution}</p>
              ${project.technologies && project.technologies.length > 0
              ? `
                <div class="technologies">
                  <strong>Technologies:</strong> ${formatList(
                project.technologies
              )}
                </div>
              `
              : ""
            }
            </div>
          `
        )
        .join("")}
        </div>
        `
      : ""
    }

        <!-- Education Section -->
        ${education && education.length > 0
      ? `
        <div class="section">
          <h2 class="section-title">Education</h2>
          ${education
        .map(
          (edu) => `
            <div class="card">
              <h4>${edu.degree}</h4>
              <p><strong>${edu.institution}</strong></p>
              <p class="meta">Graduated: ${edu.passingYear}</p>
            </div>
          `
        )
        .join("")}
        </div>
        `
      : ""
    }

        <!-- Certifications Section -->
        ${certifications && certifications.length > 0
      ? `
        <div class="section">
          <h2 class="section-title">Certifications</h2>
          ${certifications
        .map(
          (cert) => `
            <div class="card">
              <h4>${cert.name}</h4>
              <p><strong>${cert.issuingOrganization}</strong></p>
              <p class="meta">Year: ${cert.year}</p>
            </div>
          `
        )
        .join("")}
        </div>
        `
      : ""
    }

        <!-- Courses Section -->
        ${courses && courses.length > 0
      ? `
        <div class="section">
          <h2 class="section-title">Courses & Training</h2>
          ${courses
        .map(
          (course) => `
            <div class="card">
              <h4>${course.name}</h4>
              <p><strong>${course.provider}</strong></p>
              <p class="meta">Completed: ${course.completionDate}</p>
            </div>
          `
        )
        .join("")}
        </div>
        `
      : ""
    }

        <!-- References Section -->
        ${references && references.length > 0 && references?.[0]?.name
      ? `
        <div class="section">
          <h2 class="section-title">References</h2>
          <div class="grid">
            ${references
        .map(
          (ref) => `
              <div class="card">
                <h4>${ref.name}</h4>
                <p><strong>${ref.relationship}</strong></p>
                <p>${ref.contactInfo}</p>
              </div>
            `
        )
        .join("")}
          </div>
        </div>
        `
      : ""
    }

        <!-- Footer -->
        <div class="footer">
          Generated on ${formatDate(new Date())} | Portfolio Collection System
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate PDF using html2pdf.js
export const generatePortfolioPDF = async (
  portfolio: Portfolio,
  allCategories: { value: string; label: string }[],
  allSkills: { value: string; label: string }[],
  options: PDFOptions = {}
): Promise<void> => {
  try {
    // Dynamic import to avoid SSR issues
    const html2pdf = (await import("html2pdf.js")).default;

    const defaultOptions = {
      filename: `portfolio-${portfolio.employeeCode}.pdf`,
      format: "a4" as const,
      orientation: "portrait" as const,
      margin: [10, 10, 10, 10],
      quality: 2,
    };

    const pdfOptions = { ...defaultOptions, ...options };

    // Create HTML content
    const htmlContent = createPortfolioHTML(portfolio, allCategories, allSkills);

    // Create temporary element
    const element = document.createElement("div");
    element.innerHTML = htmlContent;
    element.style.width = "210mm"; // A4 width
    document.body.appendChild(element);

    // Configure html2pdf options
    const config = {
      margin: pdfOptions.margin,
      filename: pdfOptions.filename,
      image: { type: "jpeg", quality: pdfOptions.quality },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
      },
      jsPDF: {
        unit: "mm",
        format: pdfOptions.format,
        orientation: pdfOptions.orientation,
        compress: true,
      },
    };

    // Generate and download PDF
    await html2pdf().set(config).from(element).save();

    // Clean up
    document.body.removeChild(element);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF. Please try again.");
  }
};

// Preview portfolio HTML (for testing)
export const previewPortfolioHTML = (
  portfolio: Portfolio,
  allCategories: { value: string; label: string }[],
  allSkills: { value: string; label: string }[]
): void => {
  const htmlContent = createPortfolioHTML(portfolio, allCategories, allSkills);
  const newWindow = window.open("", "_blank");
  if (newWindow) {
    newWindow.document.write(htmlContent);
    newWindow.document.close();
  }
};

// Generate PDF blob (for server-side processing if needed)
export const generatePortfolioPDFBlob = async (
  portfolio: Portfolio,
  allCategories: { value: string; label: string }[],
  allSkills: { value: string; label: string }[],
  options: PDFOptions = {}
): Promise<Blob> => {
  try {
    const html2pdf = (await import("html2pdf.js")).default;

    const defaultOptions = {
      format: "a4" as const,
      orientation: "portrait" as const,
      margin: [10, 10, 10, 10],
      quality: 2,
    };

    const pdfOptions = { ...defaultOptions, ...options };

    const htmlContent = createPortfolioHTML(portfolio, allCategories, allSkills);

    const element = document.createElement("div");
    element.innerHTML = htmlContent;
    element.style.width = "210mm";
    document.body.appendChild(element);

    const config = {
      margin: pdfOptions.margin,
      image: { type: "jpeg", quality: pdfOptions.quality },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      },
      jsPDF: {
        unit: "mm",
        format: pdfOptions.format,
        orientation: pdfOptions.orientation,
      },
    };

    const pdfBlob = await html2pdf()
      .set(config)
      .from(element)
      .output("blob");

    document.body.removeChild(element);

    return pdfBlob;
  } catch (error) {
    console.error("Error generating PDF blob:", error);
    throw new Error("Failed to generate PDF blob.");
  }
};

// Utility to check if PDF generation is supported
export const isPDFGenerationSupported = (): boolean => {
  try {
    return (
      typeof window !== "undefined" &&
      typeof document !== "undefined" &&
      typeof HTMLCanvasElement !== "undefined"
    );
  } catch {
    return false;
  }
};
