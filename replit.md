# منصة سُمُوّ - Sumou Platform

## Overview
Sumou Platform is an Arabic digital platform connecting professional freelancers with digital product owners. Its primary purpose is to facilitate application, website, and system testing, provide authentic reviews, and enhance social media engagement. The platform aims to be a robust marketplace for digital product quality assurance and improvement, with a vision to become a leading hub for digital product enhancement services in the Arabic-speaking world.

## User Preferences
I prefer the AI to maintain a professional yet approachable tone. When suggesting code changes, provide clear, concise explanations for the rationale behind the changes. Prioritize iterative development, presenting changes in manageable chunks. For significant architectural decisions or major code overhauls, please ask for confirmation before proceeding. Ensure all communication is clear and directly addresses the task at hand. I prefer to maintain the existing file structure and naming conventions unless a strong, justified reason for alteration is presented.

## System Architecture
The platform is built with a modern web stack, featuring a modular project structure with `client/`, `server/`, and `shared/` directories.

**UI/UX Decisions:**
- **Design Language:** Modern SaaS aesthetic with soft shadows, rounded edges, and a clean layout.
- **Color Scheme:** Primary deep blue (#002e62), white background (#FAFAFA).
- **Typography:** Tajawal Bold/Thick (Arabic), Inter (English).
- **Responsiveness & RTL:** Fully responsive design with comprehensive Right-to-Left (RTL) support.
- **Interactive Elements:** Hover effects, 3D elevations, and Framer Motion animations.
- **Component Library:** Shadcn UI for consistent and rapid development.
- **Icon System:** All UI elements use `lucide-react` icons exclusively.

**Technical Implementations & Feature Specifications:**
- **Frontend:** React with TypeScript, Wouter for routing, Tailwind CSS, Shadcn UI, React Hook Form with Zod for validation, and TanStack Query for data management.
- **Backend:** Express.js.
- **User Authentication:** JWT-based sessions and role-based authorization for both users and administrators.
- **Admin Control Panel:** Comprehensive administrative system with separate authentication flow, permission-based access control (37 permissions across 5 default roles), and complete platform management capabilities including user management, financial oversight, and analytics dashboard.
- **Admin Roles & Permissions:** Five predefined roles (مدير/Admin, مبرمج/Developer, مسوّق/Marketer, دعم فني/Support, شريك/Partner) with granular permissions using resource:action pattern (e.g., users:view, freelancers:edit, withdrawals:approve).
- **Mandatory Instructions:** Both Freelancers and Product Owners must accept comprehensive guidelines covering ethical practices, platform policies, and financial terms (e.g., 7-day earnings hold for freelancers, 7-day guarantee for product owners). These are tracked in the database and presented during signup.
- **Quality Assurance Features:** Includes a 7-day product owner guarantee for review deletion refunds and a 7-day freelancer earnings hold to ensure review legitimacy. Features a recommendation system for selecting freelancers from the same country.
- **Platform Commission System:** A multi-tier commission structure automatically deducts 10% platform fee, 3% leader commission, and distributes the remainder among group members.
- **Group-Based Work System:** Freelancers can form groups (up to 700 members) to accept projects from product owners. Includes project workflow (pending to completed), task assignment, and internal messaging.
- **Direct Purchase System:** Product owners can purchase services directly from group leaders with defined pricing and various payment methods.
- **Conversations System:** Real-time messaging between product owners and group leaders with dedicated chat pages, user profiles, and safety guidelines.
- **Notifications System:** A comprehensive system for both user types, including database schema, dedicated notification pages, unread badges, and automated notifications for various platform activities (e.g., withdrawals, orders, messages).
- **Product Owner Signup:** A simplified 3-step form for product owners to select services and calculate costs.
- **Dashboards:** Dedicated Freelancer, Product Owner, and Admin dashboards with real-time stats and modular navigation.
- **Services Showcase Page:** A public-facing page detailing four main platform services: Google Maps Reviews, App Reviews, UX Testing, and Social Media Engagement.
- **API Request Layer:** Custom `apiRequest()` function automatically includes JWT tokens for authenticated requests.

**System Design Choices:**
- **Data Schemas:** Shared TypeScript data models for consistency.
- **Layout Architecture:** Consistent dashboard layouts with fixed sidebars (RTL optimized) to prevent content overlay, ensuring the sidebar appears on the right for RTL users.

## External Dependencies
- **OpenAI (via Replit AI Integrations):** For AI-powered suggestions.
- **Object Storage:** For file uploads (e.g., profile pictures, ID verifications).
- **PostgreSQL:** For persistent data storage in production (Neon).