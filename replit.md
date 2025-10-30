# منصة سُمُوّ - Sumou Platform

## Overview
Sumou Platform is an Arabic digital platform connecting professional freelancers with digital product owners. Its core purpose is to facilitate application, website, and system testing, provide authentic reviews, and enhance social media engagement. The platform aims to be a robust marketplace for digital product quality assurance and improvement, with a vision to become a leading hub for digital product enhancement services in the Arabic-speaking world.

## User Preferences
I prefer the AI to maintain a professional yet approachable tone. When suggesting code changes, provide clear, concise explanations for the rationale behind the changes. Prioritize iterative development, presenting changes in manageable chunks. For significant architectural decisions or major code overhauls, please ask for confirmation before proceeding. Ensure all communication is clear and directly addresses the task at hand. I prefer to maintain the existing file structure and naming conventions unless a strong, justified reason for alteration is presented.

## System Architecture
The platform is built with a modern web stack, featuring a modular project structure with `client/`, `server/`, and `shared/` directories.

**UI/UX Decisions:**
- **Design Language:** Modern SaaS aesthetic with soft shadows, rounded edges, and a clean layout (inspired by Figma, Notion).
- **Color Scheme:** Primary green (#4CAF50), white background (#FAFAFA).
- **Typography:** Tajawal Bold/Thick (Arabic), Inter (English).
- **Responsiveness & RTL:** Fully responsive design with comprehensive Right-to-Left (RTL) support.
- **Interactive Elements:** Hover effects, 3D elevations, and Framer Motion animations for icons and card elements.
- **Component Library:** Shadcn UI for consistent and rapid development.

**Technical Implementations & Feature Specifications:**
- **Frontend:** React with TypeScript, Wouter for routing, Tailwind CSS, Shadcn UI, React Hook Form with Zod for validation, and TanStack Query for data management.
- **Backend:** Express.js, with In-Memory Storage for the prototype phase.
- **Forms:** Multi-step forms for registration (Freelancer and Product Owner) with robust validation.
- **User Authentication:** Login system with JWT-based sessions and role-based authorization.
- **Dashboards:** Personalized dashboards for freelancers and product owners.
- **Campaign Management:** CRUD operations for product owners to manage campaigns.
- **Freelancer Listing:** `/freelancers` page with search, filter, and detailed freelancer cards.
- **API Endpoints:** Comprehensive CRUD APIs for freelancers, product owners, and campaigns, secured by authentication and authorization middleware.
- **File Uploads:** System for profile images and ID verification using `multer`.
- **Service Offerings:** Defined packages (Basic, Pro, Growth) and services (app testing, Google Maps reviews, UX/UI reviews, social media engagement).
- **SEO & Social Media Integration:** Comprehensive SEO-optimized content for the homepage and a dedicated social media interaction service to boost engagement across platforms (Facebook, Instagram, Twitter, LinkedIn).
- **Freelancer Dashboard:** Features real-time statistics (active, submitted, completed tasks, earnings), tabbed task views, search/filter for available tasks, task cards with details, and task management (accept, start, submit with report). Uses TanStack Query for data fetching and mutations with optimistic updates.
- **Homepage Motion Graphics:** Utilizes Framer Motion for professional animations including 3D fade-ins, animated background particles, floating decorative icons, and interactive hover effects on service cards. Each service card has unique animated icons, background particles, and color gradients.

**System Design Choices:**
- **Data Schemas:** Shared TypeScript data models for consistency across the stack.

## External Dependencies
- **OpenAI (via Replit AI Integrations):** For AI-powered suggestions (e.g., bio, product descriptions).
- **Object Storage:** Planned for file uploads (e.g., profile pictures, ID verifications).
- **PostgreSQL:** Planned for persistent data storage in production.