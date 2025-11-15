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

**Technical Implementations & Feature Specifications:**
- **Frontend:** React with TypeScript, Wouter for routing, Tailwind CSS, Shadcn UI, React Hook Form with Zod for validation, and TanStack Query for data management.
- **Backend:** Express.js.
- **Forms:** Multi-step forms with robust validation for registration. All auth forms include autocomplete attributes.
- **User Authentication:** JWT-based sessions and role-based authorization. Navbar synchronizes immediately after signup/login. Profile page shows graceful error states. User data read from localStorage at form submission.
- **Mandatory Instructions for Both User Types:** 
    - **Freelancers:** Must accept comprehensive guidelines covering ethical review practices (minimum 3.4-star ratings), platform liability, professional conduct, and **money holding policy** (7-day hold period to ensure legitimacy) before accessing the dashboard.
    - **Product Owners:** Must accept 8-section guidelines covering transparency requirements, truthful information provision, constructive feedback acceptance, company verification allowance, freelancer coordination policies, platform usage ethics, violation consequences, and **quality assurance mechanism** (7-day guarantee for review deletion refunds, location-based freelancer selection recommendations).
    - Both tracked by `acceptedInstructions` database field in respective tables.
    - Signup flow: registration → mandatory instructions acceptance → dashboard access.
    - **Quality Assurance Features:**
        - Product owners get 7-day guarantee: full refund if reviews are deleted
        - Freelancers have 7-day earnings hold to ensure review legitimacy
        - Recommendation system: choose freelancers from same country for better review retention
- **Group-Based Work System:**
    - **Groups:** Freelancers can create groups (up to 700 members) with custom image uploads (max 5MB) and a portfolio gallery (up to 12 images). Group leaders manage members, accept projects, and earn a 5% commission.
    - **Projects:** Product owners create projects; group leaders browse and accept them. Project workflow: pending → accepted → in_progress → completed.
    - **Tasks:** Leaders create and assign tasks to members. Task workflow: available → assigned → in_progress → submitted → approved/rejected. Members submit proof images/reports.
    - **Internal Messaging:** Real-time messaging for group members (text, file, project-related).
    - **Earnings & Withdrawals:** Automatic earnings calculation, wallet balance tracking, withdrawal request system (Vodafone Cash, Etisalat Cash, Orange Cash, Bank Card, Bank Transfer), and withdrawal history.
- **Direct Purchase System:** Product owners can purchase services directly from group leaders (e.g., Google Play reviews, UX testing, Google Maps reviews) with defined pricing ($1-$2 per service). Payment methods include Vodafone Cash, Etisalat Cash, Orange Cash, Bank Card. Order management tracks status: pending → payment_confirmed → in_progress → completed.
- **Product Owner Signup:** Simplified 3-step form (Basic Info → Service Selection & Calculation → Confirmation) with 7 service types and automatic cost calculation based on quantity (1-1000 reviews).
- **Dashboards:** Freelancer and Product Owner dashboards with real-time stats and modular Shadcn sidebar navigation. Freelancer dashboard has 7 pages: Overview, Available Tasks, My Tasks, Wallet, Withdrawals, Orders, Settings. Product Owner dashboard includes Overview and Projects sections.
- **User Type Badge:** Visual indicator (briefcase for freelancers, building for product owners) displayed in the Navbar dropdown menu.
- **Authentication Architecture:** `user`, `userType`, and `token` stored in localStorage. Role-based checks read `userType` from localStorage.
- **API Request Layer:** `apiRequest()` function automatically includes JWT token in Authorization header for all authenticated mutations.
- **Orders Display & Notifications:** Both dashboards display orders with service type, quantity, payment method, status, and total amount. A Navbar component includes a notifications dropdown with unread badge and mark-as-read functionality.
- **Original Features:** Campaign management, freelancer listing, file uploads (profile images, ID verification, task proof), SEO/social media optimization, and Framer Motion animations on homepage.

**System Design Choices:**
- **Data Schemas:** Shared TypeScript data models for consistency across the stack.
- **Layout Architecture:** Consistent sidebar width and proper `h-screen`/`overflow-auto` for scrollable content areas.

## External Dependencies
- **OpenAI (via Replit AI Integrations):** For AI-powered suggestions.
- **Object Storage:** For file uploads (e.g., profile pictures, ID verifications).
- **PostgreSQL:** For persistent data storage in production (Neon).