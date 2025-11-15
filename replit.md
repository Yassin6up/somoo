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
- **Forms:** Multi-step forms for registration (Freelancer and Product Owner) with robust validation. Fixed infinite render loop issue by using `field.value` instead of `form.watch` in checkbox components. All auth forms include autocomplete attributes (email="email", password="new-password" for signups, "current-password" for login) to support password managers.
- **User Authentication:** Login system with JWT-based sessions and role-based authorization. Navbar synchronizes immediately after signup/login via custom "userLoggedIn" event - no page reload required. Profile page shows graceful error state when user data is missing instead of infinite loading spinner. User data always read from localStorage at form submission time, not at component mount.

**NEW: Group-Based Work System (نظام العمل الجماعي):**
- **Groups (الجروبات):**
  - Freelancers can create groups with up to 700 members max
  - **Group image upload** - Leaders can upload custom images from device gallery (max 5MB)
  - Image preview shown next to "أنشئ جروب وابدأ باستقبال أعضاء والعمل على المشاريع" text
  - Images stored using object storage and displayed in group cards and detail pages
  - **Portfolio Gallery (معرض البورتفوليو)** - Each group displays up to 12 portfolio images showing before/after examples of completed work (app reviews, Google Maps reviews, etc.)
  - Portfolio images displayed in horizontal scrollable gallery above group title on Groups page
  - Graceful fallback handling for broken image URLs with placeholder images
  - Group leader manages members and accepts projects
  - Composite unique constraint on (groupId, freelancerId) prevents duplicate memberships
  - Leaders earn 5% commission on completed tasks
  - Real-time member count tracking with activity validation
  - Error handling for failed image uploads with clear user feedback
  
- **Projects (المشاريع):**
  - Product owners create projects with budget and task requirements
  - Group leaders browse pending projects and accept them
  - Projects linked to accepting group for task distribution
  - Complete workflow: pending → accepted → in_progress → completed
  
- **Tasks (المهام):**
  - Leaders create and assign tasks to group members
  - Task lifecycle: available → assigned → in_progress → submitted → approved/rejected
  - Members submit proof images and reports
  - Leaders review and approve/reject with feedback
  - Approval triggers earnings distribution
  
- **Internal Messaging (الرسائل الداخلية):**
  - Group members can send/receive messages
  - Message types: text, file, project-related
  - Real-time message synchronization
  
- **Earnings & Withdrawals (الأرباح والسحوبات):**
  - Automatic earnings calculation with 5% leader commission
  - Wallet balance tracking for freelancers (رصيد المحفظة وإجمالي الأرباح)
  - Withdrawal request system with full validation
  - 5 payment methods: Vodafone Cash, Etisalat Cash, Orange Cash, Bank Card, Bank Transfer
  - Balance verification before withdrawal requests
  - Withdrawal history with status tracking: pending → processing → completed/rejected
  - Admin rejection notes visible to freelancers
  - Real-time wallet balance updates after approvals
  - Type-safe withdrawal amount handling (numeric validation)

- **Direct Purchase System (نظام الشراء المباشر):**
  - Product owners can purchase services directly from group leaders
  - **Purchase Flow:** View Groups → Contact/Purchase → Service Selection → Payment Method → Confirmation
  - **Service Types:** Google Play reviews ($1), iOS reviews ($1), Website reviews ($1), UX testing ($1), Software testing ($1), Social Media engagement ($1), Google Maps reviews ($2)
  - **Payment Methods:** Vodafone Cash, Etisalat Cash, Orange Cash, Bank Card
  - **Order Management:** 
    - Status tracking: pending → payment_confirmed → in_progress → completed
    - Orders table stores: service type, quantity, total amount, payment method, payment details
    - Automatic notifications to group leaders upon new orders
    - Authentication protection: only logged-in product owners can purchase
  - **User Flow Updates:**
    - Freelancers redirected to /groups after signup (to join or create groups)
    - Product Owners see "شراء الخدمة" and "تواصل معي" buttons on group cards
    - PurchaseService page protected with authentication check (redirects to login if not authorized)

- **API Endpoints (الواجهات البرمجية):**
  - **Groups:** POST/GET/PATCH /api/groups, JOIN/LEAVE endpoints, member management
  - **Projects:** POST/GET/PATCH/DELETE /api/projects, accept/update/list endpoints
  - **Tasks:** POST/GET/PATCH /api/tasks, assign/start/submit/approve/reject workflows
  - **Messages:** POST/GET /api/groups/:groupId/messages, read status updates
  - **Notifications:** GET /api/notifications, mark as read, unread count
  - **Withdrawals:** POST/GET /api/withdrawals, request and track withdrawals
  - **Orders:** POST/GET /api/orders, GET /api/orders/:id, PATCH /api/orders/:id/status
  - All secured with authMiddleware and role-based authorization

- **Product Owner Signup (نموذج تسجيل صاحب المنتج):**
  - **Simplified 3-Step Form:** Basic Info → Service Selection & Calculation → Confirmation
  - **7 Service Types:** Google Play reviews ($1), iOS reviews ($1), Website reviews ($1), UX testing ($1), Software testing ($1), Social Media engagement ($1), Google Maps reviews ($2)
  - **Automatic Cost Calculation:** User enters number of reviews needed (1-1000), system calculates total cost based on service type pricing
  - **Removed Fields:** Company name, phone number (kept: fullName, email, password only)
  - **Cost Summary Display:** Shows service type, review count, price per review, and total cost before confirmation

- **Original Features (Still Available):**
  - **Dashboards:** Freelancer & Product Owner dashboards with real-time stats
  - **Campaign Management:** Full CRUD operations for campaigns (legacy system)
  - **Freelancer Listing:** `/freelancers` page with search and filter
  - **File Uploads:** Profile images, ID verification, and task proof images using `multer`
  - **SEO & Social Media:** Optimized content and engagement services
  - **Motion Graphics:** Framer Motion animations on homepage
  - **Testing Infrastructure:** Comprehensive data-testid attributes for Playwright

**System Design Choices:**
- **Data Schemas:** Shared TypeScript data models for consistency across the stack.

**Recent Technical Updates (October 2025):**
- **Authentication Architecture:**
  - User authentication now stores three separate items in localStorage: `user` (JSON object without role field), `userType` (string: "freelancer" or "product_owner"), and `token` (JWT string)
  - All role-based checks now read `userType` directly from localStorage instead of `user.role` (which doesn't exist)
  - Fixed Groups.tsx and PurchaseService.tsx to use `localStorage.getItem("userType")` pattern
  
- **API Request Layer:**
  - `apiRequest()` function in queryClient.ts now automatically includes JWT token in Authorization header
  - Signature: `apiRequest(method, url, data)` - parameter order critical for correct operation
  - All authenticated mutations automatically include `Authorization: Bearer {token}` header
  - Fixed 401 Unauthorized errors by ensuring token transmission on all protected endpoints
  
- **Direct Purchase System Testing:**
  - End-to-end Playwright tests confirm complete purchase flow works: signup → groups → purchase → order creation
  - Verified authentication protection: unauthenticated users correctly redirected to /login when accessing /purchase routes
  - All API endpoints (POST/GET/PATCH /api/orders) tested and working with proper authorization
  - Service pricing calculations verified: $1 per review (Google Play, iOS, Website, UX, Software, Social Media), $2 per Google Maps review

- **Orders Display & Notifications (November 2024):**
  - **ProductOwnerDashboard:** Added "طلباتي" tab displaying all purchases with service type, quantity, payment method, status, and total amount
  - **FreelancerDashboard:** Added "الطلبات" tab as default view showing incoming orders for groups the freelancer leads
  - **NotificationsDropdown Component:** New Navbar component with unread notification badge, dropdown menu with mark-as-read functionality, auto-refresh every 30s
  - **Shared /api/orders endpoint:** Returns role-appropriate data (product owners see their purchases, freelancers see orders for their groups)
  - **Consistent UI patterns:** Both dashboards use matching order card layouts with status badges and responsive design

## External Dependencies
- **OpenAI (via Replit AI Integrations):** For AI-powered suggestions (e.g., bio, product descriptions).
- **Object Storage:** Planned for file uploads (e.g., profile pictures, ID verifications).
- **PostgreSQL:** Planned for persistent data storage in production.