# Portfolio Collection Website Requirements Document

## 1. Project Overview

The Portfolio Collection Website is a web application designed to allow users to register, create, edit, and showcase professional portfolios. The platform supports cross-user profile viewing, profile visit tracking, and PDF export functionality. It is built using **Next.js**, **Tailwind CSS**, **Redux/Redux Toolkit**, **Firebase**, and modern API fetching techniques to ensure scalability, performance, and a seamless user experience.

---

## 2. Functional Requirements

### 2.1 User Authentication

- **User Registration**: Register with email/password or Google OAuth via Firebase Authentication.
- **User Login/Logout**: Secure login with email/password or Google OAuth, and logout functionality.
- **Password Reset**: Email-based password reset.
- **Role-Based Access**:
  - **Regular Users**:
    - Create, edit, and view their own portfolios.
    - Request new `technicalSkills` categories, pending admin approval for public visibility.
    - View and filter other users’ portfolios by criteria (e.g., years of experience, skills, education, institution, projects) or keyword search.
  - **Admins**:
    - Approve, edit, or delete user-requested `technicalSkills` categories.
    - Add new `technicalSkills` categories directly.
    - Access all portfolio viewing and filtering features.

### 2.2 Portfolio Creation

- **Multi-Step Form**: A 4-step form for portfolio creation and editing, structured as follows:

#### Step 1: Personal Information, Summary, and References
- **Personal Information**:
  - **Employee Code**: Unique identifier (string).
  - **Designation**: Job title (string).
  - **Years of Experience**: Number of years (number).
  - **Nationality**: Employee's nationality (string).
  - **Language Proficiency**: List of languages (array of strings).
  - **Email**: Contact email (string).
  - **Mobile No**: Contact phone number (string).
  - **Profile Image**: Base64 string, <1 MB, stored in Firebase Firestore (string).
  - **Summary**: Professional summary (string).
- **References**:
  - **Name**: Reference’s name (string).
  - **Contact Info**: Email or phone (string).
  - **Relationship**: e.g., "Former Manager" (string).

#### Step 2: Education, Certifications, and Courses
- **Education**:
  - **Degree**: Academic degree (string).
  - **Institution**: Name of institution (string).
  - **Passing Year**: Year of completion (number or string).
- **Certifications**:
  - **Name**: Certification name (string).
  - **Issuing Organization**: Issuing body (string).
  - **Year**: Year obtained (number or string).
- **Courses**:
  - **Name**: Course name (string).
  - **Provider**: Course provider (string).
  - **Completion Date**: Date completed (string, e.g., "2023-05").

#### Step 3: Technical Skills and Work Experience
- **Technical Skills**:
  - Categorized skills with dynamic categories (e.g., "Programming Languages", "Frameworks/Library").
  - Users can select from approved categories or request new ones (pending admin approval).
  - Example categories and skills:
    - Programming Languages: JavaScript (ES6), TypeScript, Python, Node.
    - Database Management: MongoDB, SQLite3.
    - Frameworks/Library: jQuery, React-17/18, Next-13/14, React Native, Angular, Ionic, Cordova, Vue3, ExpressJS, CSS3, Bootstrap-3/4/5, Tailwind, SCSS.
    - Testing: (Placeholder for testing tools).
    - Tools: GIT, VS Code, Android Studio, Figma.
    - Others: OOP, Software Architecture, Agile Development, API Development & Integration, ERP, Agile/Scrum Methodologies, Problem Solving.
- **Work Experience**:
  - **Company**: Employer name (string).
  - **Role**: Job role (string).
  - **Duration**: Employment period (string, e.g., "Jan 2020 - Dec 2022").
  - **responsibilities**: List of responsibilities (array of strings).

#### Step 4: Projects
- **Projects**:
  - **Name**: Project name (string).
  - **Description**: Project details (string).
  - **Contribution**: User’s role/contribution (string).
  - **Technologies Used**: List of technologies (array of strings).

- **Form Validation**: Client-side and server-side validation for required fields, correct formats (e.g., valid email, date formats), and image size (<1 MB).

### 2.3 Technical Skills Category Management

- **User Requests**:
  - Users can submit new `technicalSkills` category requests (e.g., "Cloud Computing") with suggested skills via a form in the portfolio creation/editing process.
  - Requests are stored in a Firestore collection (`skillCategoryRequests`) with fields:
    - `userId`: Submitter’s ID (string).
    - `categoryName`: Proposed category (string).
    - `suggestedSkills`: Optional list of skills (array of strings).
    - `status`: "Pending", "Approved", or "Rejected" (string).
    - `createdAt`: Timestamp.
- **Admin Approval**:
  - Admins review requests in the admin panel, approving or rejecting them.
  - Approved categories are added to a `skillCategories` Firestore collection, making them available for all users to select.
  - Rejected requests include an optional admin comment (stored in `skillCategoryRequests`).
- **Admin Category Management**:
  - Admins can directly add, edit, or delete categories in the `skillCategories` collection.
  - Categories are stored as:
    ```json
    {
      "categoryId": "string",
      "name": "string",
      "approved": true,
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
    ```

### 2.4 Portfolio Management

- **Edit Portfolio**: Update all fields via the multi-step form.
- **Delete Portfolio**: Delete with confirmation prompt.
- **View Portfolio**: Display portfolio with sections for personal info, education, certifications, courses, technical skills, summary, projects, work experience, and references, styled with Tailwind CSS.
- **Data Storage**: Store in Firestore under `users/{userId}/portfolio` with the following schema:

```json
{
  "userId": "string",
  "employeeCode": "string",
  "designation": "string",
  "yearsOfExperience": "number",
  "nationality": "string",
  "languageProficiency": ["string"],
  "email": "string",
  "mobileNo": "string",
  "profileImage": "string", // Base64, <1 MB
  "summary": "string",
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "passingYear": "string | number"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuingOrganization": "string",
      "year": "string | number"
    }
  ],
  "courses": [
    {
      "name": "string",
      "provider": "string",
      "completionDate": "string"
    }
  ],
  "technicalSkills": [
    {
      "category": "string",
      "skills": ["string"]
    }
  ],
  "workExperience": [
    {
      "company": "string",
      "role": "string",
      "duration": "string",
      "responsibilities": ["string"]
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "contribution": "string",
      "technologies": ["string"]
    }
  ],
  "references": [
    {
      "name": "string",
      "contactInfo": "string",
      "relationship": "string"
    }
  ],
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "visitCount": "number"
}
```

### 2.5 Cross-User Profile Viewing

- **Public Profiles**: Users can browse or search portfolios by name, employee code, or filters (e.g., skills, experience, education).
- **Visit Tracking**: Increment `visitCount` in Firestore per view, visible only to the profile owner.
- **Privacy Controls**: Toggle profile visibility (public or private).

### 2.6 PDF Export

- **Export**: Generate a PDF of the portfolio with all sections, styled consistently with the web view.
- **Implementation**: Use `jsPDF` or `html2pdf.js` for client-side PDF generation, compatible with Tailwind CSS.

### 2.7 State Management

- **Redux/Redux Toolkit**: Manage:
  - Authentication state (user details, admin status).
  - Form data (portfolio creation/editing).
  - Portfolio data from Firestore.
  - Skill categories and user requests.
- **Slices**: `auth`, `portfolio`, `ui`, `skillCategories`, `categoryRequests`.

### 2.8 API Fetching

- **Firebase SDK**: Handle authentication, Firestore operations, and storage.
- **Custom Hooks**: `useAuth`, `usePortfolio`, `useSkillCategories`, `useCategoryRequests` for data fetching.
- **Real-Time Updates**: Firestore listeners for portfolios, skill categories, and requests.
- **Error Handling**: Handle API failures gracefully (e.g., network errors, permissions).

### 2.9 User Interface

- **Responsive Design**: Tailwind CSS for mobile, tablet, and desktop.
- **Components**:
  - **Navigation Bar**: Home, Profile, Portfolio Directory, Admin Panel (for admins), Logout.
  - **Multi-Step Form**: Wizard-style with progress indicators, supporting dynamic skill categories.
  - **Portfolio View**: Card-based directory, detailed view with all sections.
  - **Admin Panel**: Manage skill categories and user requests (approve/reject).
  - **Visit Counter**: Display on user dashboard.
- **Accessibility**: WCAG 2.1 compliance (keyboard navigation, ARIA labels).

---

## 3. Non-Functional Requirements

### 3.1 Performance

- **Page Load**: Initial load under 2 seconds (Next.js SSR/SSG).
- **Data Fetching**: Optimized Firestore queries with indexing.
- **Scalability**: Handle thousands of users and portfolios.

### 3.2 Security

- **Authentication**: Firebase Authentication with admin role checks.
- **Data Privacy**: Secure storage of sensitive data (e.g., references) with Firestore rules.
- **Input Sanitization**: Prevent XSS/injection by sanitizing inputs.
- **Firestore Rules**: Restrict access to authenticated users’ data and public profiles; admin-only for `skillCategories` and `categoryRequests`.

### 3.3 Maintainability

- **Code Structure**: Modular Next.js project with reusable components and hooks.
- **Documentation**: Inline comments, README for setup.
- **Testing**: Jest for unit tests (Redux slices, hooks), integration tests for Firebase.

### 3.4 Compatibility

- **Browsers**: Chrome, Firefox, Safari, Edge (latest versions).
- **Devices**: Responsive for mobile, tablet, desktop.

---

## 4. System Architecture

### 4.1 Technology Stack

- **Frontend**: Next.js, Tailwind CSS, Redux/Redux Toolkit.
- **Backend**: Firebase (Authentication, Firestore).
- **PDF Generation**: `jsPDF` or `html2pdf.js`.

### 4.2 Data Flow

1. **Authentication**: Firebase Authentication assigns `userId` and admin status.
2. **Portfolio Creation**: Multi-step form data validated and stored in Firestore.
3. **Skill Category Management**:
   - Users submit category requests to `categoryRequests`.
   - Admins approve/reject requests, updating `skillCategories`.
4. **Portfolio Viewing**: Query Firestore for public portfolios; increment `visitCount`.
5. **PDF Export**: Render portfolio as HTML, convert to PDF client-side.

### 4.3 Firestore Collections

- `users/{userId}/portfolio`: Portfolio data (see schema in Section 2.4).
- `skillCategories`: Approved categories (`categoryId`, `name`, `approved`, `createdAt`, `updatedAt`).
- `categoryRequests`: User-submitted requests (`userId`, `categoryName`, `suggestedSkills`, `status`, `createdAt`).

---

## 5. Key Features and User Flow

### 5.1 User Flow

1. **Home Page**: Welcome message, login/register, portfolio directory.
2. **Authentication**: Register/login via Firebase; admins access admin panel.
3. **Dashboard**: View/edit portfolio, see visit count, request new skill categories.
4. **Portfolio Creation**: Multi-step form with dynamic skill category selection.
5. **Category Management**: Users request categories; admins approve/reject via admin panel.
6. **Portfolio Directory**: Browse/search portfolios with filters.
7. **Profile View**: Detailed portfolio view with all sections.
8. **PDF Export**: Download portfolio as PDF.

### 5.2 Key Features

- **Multi-Step Form**: Streamlined, validated, with dynamic skill categories.
- **Category Requests**: Users request categories; admins approve for public use.
- **Cross-User Viewing**: Browse portfolios with filters and visit tracking.
- **PDF Export**: Professional PDF with all portfolio sections.
- **Real-Time Updates**: Firestore listeners for portfolios and categories.
- **Responsive UI**: Tailwind CSS for consistent design.

---

## 6. Assumptions and Constraints

- **Assumptions**:
  - Users manually enter accurate portfolio data.
  - Firebase free tier suffices for initial development.
  - Admin roles assigned manually in Firestore.
- **Constraints**:
  - Firestore query limitations (e.g., no native full-text search).
  - Client-side PDF generation due to serverless architecture.

---

## 7. Future Enhancements

- **Advanced Search**: Integrate Algolia for full-text search.
- **Analytics**: Track detailed profile visit metrics.
- **Templates**: Offer multiple portfolio layouts for web and PDF.
- **Sharing**: Social media/email sharing for portfolios.

---

## 8. Development Roadmap

1. **Phase 1: Setup and Authentication** (1-2 weeks):
   - Set up Next.js, Tailwind CSS, Redux Toolkit, Firebase.
   - Implement authentication and admin role setup.
2. **Phase 2: Portfolio Creation and Management** (2-3 weeks):
   - Build multi-step form with validation and Firestore integration.
3. **Phase 3: Category Management and Viewing** (1-2 weeks):
   - Implement user category requests and admin approval workflow.
   - Build portfolio directory and view with visit tracking.
4. **Phase 4: PDF Export and Testing** (1-2 weeks):
   - Add PDF export with `jsPDF`.
   - Write unit and integration tests.
5. **Phase 5: Deployment** (1 week):
   - Deploy to Vercel, optimize performance, ensure accessibility.

---

## 9. Deliverables

- Next.js application hosted on Vercel.
- Firebase project with Authentication and Firestore.
- Source code with documentation and tests.
- User guide for portfolio creation, category requests, and admin tasks.

---

## 10. Success Criteria

- Seamless portfolio creation, editing, and viewing.
- Robust user-requested skill category approval process.
- Functional cross-user profile viewing with visit tracking.
- Professional PDF export with all sections.
- Responsive, accessible, and performant application.
- Maintainable codebase with documentation and tests.