# منصة سُمُوّ - Sumou Platform

## Overview
Sumou Platform is an Arabic digital platform connecting professional freelancers with digital product owners. Its core purpose is to facilitate application, website, and system testing, provide authentic reviews, and enhance social media engagement. The platform aims to be a robust marketplace for digital product quality assurance and improvement, with a vision to become a leading hub for digital product enhancement services in the Arabic-speaking world.

## User Preferences
I prefer the AI to maintain a professional yet approachable tone. When suggesting code changes, provide clear, concise explanations for the rationale behind the changes. Prioritize iterative development, presenting changes in manageable chunks. For significant architectural decisions or major code overhauls, please ask for confirmation before proceeding. Ensure all communication is clear and directly addresses the task at hand. I prefer to maintain the existing file structure and naming conventions unless a strong, justified reason for alteration is presented.

## System Architecture
The platform is built with a modern web stack, featuring a modular project structure with `client/`, `server/`, and `shared/` directories.

**UI/UX Decisions:**
- **Design Language:** Modern SaaS aesthetic with soft shadows, rounded edges, and a clean layout (inspired by Figma, Notion).
- **Color Scheme:** Primary deep blue (#002e62 - HSL: 212, 100%, 31%), white background (#FAFAFA). Updated to professional deep blue color for trustworthy, stable brand identity.
- **Typography:** Tajawal Bold/Thick (Arabic), Inter (English).
- **Responsiveness & RTL:** Fully responsive design with comprehensive Right-to-Left (RTL) support.
- **Interactive Elements:** Hover effects, 3D elevations, and Framer Motion animations for icons and card elements.
- **Component Library:** Shadcn UI for consistent and rapid development.

**Technical Implementations & Feature Specifications:**
- **Frontend:** React with TypeScript, Wouter for routing, Tailwind CSS, Shadcn UI, React Hook Form with Zod for validation, and TanStack Query for data management.
- **Backend:** Express.js, with PostgreSQL database (Neon) for production, In-Memory Storage for testing.
- **Forms:** Multi-step forms for registration (Freelancer and Product Owner) with robust validation. Fixed infinite render loop issue by using `field.value` instead of `form.watch` in checkbox components.
- **User Authentication:** Login system with JWT-based sessions and role-based authorization. Navbar synchronizes immediately after signup/login via custom "userLoggedIn" event - no page reload required. Profile page shows graceful error state when user data is missing instead of infinite loading spinner.
- **Dashboards:** 
  - **Freelancer Dashboard:** Real-time statistics (active, submitted, completed tasks, earnings), tabbed task views, search/filter for available tasks, task cards with details, and task management (accept, start, submit with report).
  - **Product Owner Dashboard:** Real-time statistics (active campaigns, submitted/completed tasks, total spent), three tabs (Submitted for Review, All Campaigns, All Tasks), task review dialog with approve/reject functionality, comprehensive campaign overview cards.
- **Campaign Management:** Full CRUD operations including delete functionality for product owners to manage campaigns.
- **Task Management:** Complete workflow from available → assigned → in_progress → submitted → approved/rejected. Product owners can review, approve, or reject submitted tasks with feedback. Approval updates freelancer wallet and creates notifications.
- **Freelancer Listing:** `/freelancers` page with search, filter, and detailed freelancer cards.
- **API Endpoints:** 
  - Comprehensive CRUD APIs for freelancers, product owners, and campaigns
  - Task management: GET /api/tasks/available, /api/tasks/my-tasks, /api/tasks/owner
  - Task actions: POST /api/tasks/:id/accept, PATCH /api/tasks/:id/start, /api/tasks/:id/submit, /api/tasks/:id/approve, /api/tasks/:id/reject
  - Campaign deletion: DELETE /api/campaigns/:id
  - All secured by authentication and authorization middleware
- **File Uploads:** System for profile images and ID verification using `multer`.
- **Service Offerings:** Defined packages (Basic, Pro, Growth) and services (app testing, Google Maps reviews, UX/UI reviews, social media engagement).
- **SEO & Social Media Integration:** Comprehensive SEO-optimized content for the homepage and a dedicated social media interaction service to boost engagement across platforms (Facebook, Instagram, Twitter, LinkedIn).
- **Homepage Motion Graphics:** Utilizes Framer Motion for professional animations including 3D transforms (rotateX/rotateY), floating animations on horizontal "سُمُوّ" card, perspective effects, animated background particles, floating decorative icons, and interactive hover effects on service cards. Each service card has unique animated icons, background particles, and color gradients.
- **Testing Infrastructure:** Comprehensive data-testid attributes on all interactive elements for end-to-end testing with Playwright.

**System Design Choices:**
- **Data Schemas:** Shared TypeScript data models for consistency across the stack.

## External Dependencies
- **OpenAI (via Replit AI Integrations):** For AI-powered suggestions (e.g., bio, product descriptions).
- **Object Storage:** Planned for file uploads (e.g., profile pictures, ID verifications).
- **PostgreSQL:** Planned for persistent data storage in production.