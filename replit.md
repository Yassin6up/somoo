# منصة سُمُوّ - Sumou Platform

## Overview
Sumou Platform is an Arabic digital platform designed to connect professional freelancers with digital product owners. Its primary purpose is to facilitate the testing of applications, websites, and systems, offering authentic reviews and social media engagement. The platform aims to provide a robust marketplace for digital product quality assurance and enhancement.

## User Preferences
I prefer the AI to maintain a professional yet approachable tone. When suggesting code changes, provide clear, concise explanations for the rationale behind the changes. Prioritize iterative development, presenting changes in manageable chunks. For significant architectural decisions or major code overhauls, please ask for confirmation before proceeding. Ensure all communication is clear and directly addresses the task at hand. I prefer to maintain the existing file structure and naming conventions unless a strong, justified reason for alteration is presented.

## System Architecture
The platform is built with a modern web stack. The frontend utilizes **React** with **TypeScript**, **Wouter** for routing, **Tailwind CSS** for styling, **Shadcn UI** for components, **React Hook Form** with **Zod** for form management and validation, and **TanStack Query** for data management. The backend is powered by **Express.js** and, for the prototype phase, uses **In-Memory Storage**.

**UI/UX Decisions:**
- **Design Language:** Modern SaaS aesthetic inspired by platforms like Figma and Notion, featuring soft shadows, rounded edges (rounded-2xl, rounded-3xl), and a clean layout.
- **Color Scheme:** Primary green (#4CAF50), with a white background (#FAFAFA).
- **Typography:** **Tajawal Bold/Thick** for Arabic text and **Inter** for English text.
- **Responsiveness:** Fully responsive design across all devices.
- **RTL Support:** Comprehensive Right-to-Left (RTL) support for the Arabic interface.
- **Interactive Elements:** Features hover effects, 3D elevations, and Framer Motion animations for icons (rotate, scale on hover) and card elements (floating, tilt/rotate on hover).
- **Component Library:** Heavy use of Shadcn UI components for consistency and rapid development.

**Technical Implementations & Feature Specifications:**
- **Multi-step Forms:** Implemented for both Freelancer and Product Owner registration, utilizing React Hook Form and Zod for robust validation.
- **User Authentication:** Includes a login system with JWT-based session management and bcrypt for password hashing in production. Role-based authorization controls access to specific features and APIs.
- **Dashboard:** Personalized dashboards for both freelancers and product owners, displaying relevant statistics and navigation.
- **Campaign Management:** Product owners can create, view, update, and delete campaigns through dedicated API endpoints and a frontend interface.
- **Freelancer Listing:** A dedicated `/freelancers` page showcasing registered freelancers with search and filter capabilities, including detailed cards for each freelancer.
- **API Endpoints:** Comprehensive CRUD operations for freelancers, product owners, and campaigns, protected by authentication and authorization middleware.
- **File Uploads:** System for uploading profile images and ID verification documents using `multer`.

**System Design Choices:**
- **Modular Project Structure:** Organized into `client/`, `server/`, and `shared/` directories for clear separation of concerns.
- **Data Schemas:** Defined shared TypeScript data models for Freelancers and Product Owners, ensuring consistency across frontend and backend.
- **Service Offerings:** Defined packages (Basic, Pro, Growth) and available services (app testing, Google Maps reviews, UX/UI reviews, social media engagement).

## External Dependencies
- **OpenAI (via Replit AI Integrations):** Used for AI-powered suggestions, such as generating bio and product descriptions.
- **Object Storage:** Planned for storing uploaded images and files (e.g., profile pictures, ID verifications).
- **PostgreSQL:** Planned for persistent data storage in production, replacing in-memory storage.

## Latest Updates (SEO Content + Social Media Service)

**محتوى SEO شامل للصفحة الرئيسية** ✅:
- ✅ إزالة كروت features الصغيرة واستبدالها بمحتوى نصي مباشر
- ✅ إضافة قسم "عن المنصة" (id="about") بمحتوى شامل SEO-optimized
- ✅ شرح تفصيلي للمنصة (1000+ كلمة) يشمل:
  - ما هي منصة سُمُوّ وما تقدمه
  - وصف كامل لجميع الخدمات الـ 6 بطريقة محسنة لمحركات البحث
  - قسم "لماذا تختار منصة سُمُوّ؟" مع 6 مميزات
  - قسم "كيف تعمل المنصة؟" بـ 4 خطوات واضحة
- ✅ استخدام HTML semantics صحيحة (h2, h3, h4, strong, ul, ol)
- ✅ كلمات مفتاحية للSEO:
  - "اختبار التطبيقات", "تقييمات حقيقية", "Google Maps"
  - "السوشيال ميديا", "تفاعل", "انتشار المحتوى"
  - "UX/UI", "مستقلين محترفين", "منتجات رقمية"

**خدمة التفاعل مع السوشيال ميديا** ✅ (Featured Service):
- ✅ إضافة خدمة جديدة للتفاعل مع منشورات السوشيال ميديا
- ✅ تمييزها كخدمة مميزة (featured: true)
- ✅ badge "خدمة مميزة" مع أيقونة Sparkles
- ✅ border خاص (border-2 border-primary ring-2)
- ✅ positioning صحيح للbadge (relative + absolute)
- ✅ شرح تفصيلي في المحتوى يشمل:
  - زيادة التفاعل والانتشار على السوشيال ميديا
  - إعجابات وتعليقات ومشاركات حقيقية
  - تحسين ظهور المحتوى في خوارزميات المنصات
  - الفئات المستهدفة: أصحاب الأعمال، المؤثرين، الشركات الناشئة، الحملات التسويقية
  - المنصات المدعومة: Facebook, Instagram, Twitter, LinkedIn

**تحسينات إضافية** ✅:
- ✅ تحديث جميع أوصاف الخدمات لتكون أكثر تفصيلاً
- ✅ إضافة featured property للخدمات
- ✅ تحديث زر "تعرف على المزيد" للتوجيه إلى #about
- ✅ محتوى متوافق بالكامل مع محركات البحث Google
- ✅ تصميم responsive كامل
- ✅ دعم RTL كامل

## Latest Updates (Freelancer Dashboard - October 30, 2025)

**لوحة تحكم المستقلين الشاملة** ✅:
- ✅ بناء صفحة لوحة تحكم المستقلين `/freelancer-dashboard` بتصميم احترافي
- ✅ إحصائيات شاملة في الوقت الفعلي:
  - المهام النشطة (assigned + in_progress)
  - المهام قيد المراجعة (submitted)
  - المهام المكتملة (approved)
  - الأرباح من محفظة المستقل
- ✅ نظام تبويب متقدم (Tabs) لعرض المهام المتاحة ومهام المستقل
- ✅ محرك بحث وفلترة للمهام المتاحة
- ✅ بطاقات المهام (Task Cards) مع جميع التفاصيل:
  - عنوان المهمة ووصفها
  - نوع الخدمة (serviceType)
  - المكافأة بالريال السعودي
  - حالة المهمة (status badge) مع ألوان مميزة
- ✅ نظام قبول المهام (Accept Task) مع تحديثات فورية
- ✅ نظام بدء العمل (Start Task) لتغيير حالة المهمة
- ✅ نظام تسليم المهام (Submit Task):
  - نموذج مودال (Dialog) لكتابة التقرير المفصل
  - Textarea للتقرير
  - إرسال التقرير وتحديث حالة المهمة
- ✅ عرض التقارير المسلمة والتعليقات من أصحاب المنتجات
- ✅ Loading states وSkeleton screens
- ✅ Empty states احترافية
- ✅ جميع العناصر التفاعلية بها data-testid فريدة للاختبار الآلي

**API Endpoints للمهام** ✅:
- ✅ GET `/api/tasks/available` - عرض المهام المتاحة (freelancer only)
- ✅ GET `/api/tasks/my-tasks` - عرض مهام المستقل (freelancer only)
- ✅ GET `/api/tasks/:id` - تفاصيل مهمة محددة مع تحقق من الصلاحيات
- ✅ POST `/api/tasks/:id/accept` - قبول المهمة وتعيينها للمستقل
  - تغيير الحالة من available إلى assigned
  - تعيين freelancerId وtimestamp
  - إنشاء إشعار لصاحب المنتج
- ✅ PATCH `/api/tasks/:id/start` - بدء العمل على المهمة
  - تغيير الحالة من assigned إلى in_progress
- ✅ PATCH `/api/tasks/:id/submit` - تسليم المهمة مع التقرير
  - تغيير الحالة إلى submitted
  - حفظ نص التقرير (submission)
  - إنشاء إشعار لصاحب المنتج

**الأمان والصلاحيات** ✅:
- ✅ جميع endpoints محمية بـ authMiddleware
- ✅ فلترة بالدور (freelancer role) حيث مطلوب
- ✅ التحقق من ملكية المهام قبل أي تعديل
- ✅ رسائل خطأ واضحة بالعربية
- ✅ إدارة الحالات (status management) آمنة

**تكامل TanStack Query** ✅:
- ✅ استعلامات (queries) لجلب البيانات مع تحديث تلقائي
- ✅ طفرات (mutations) لقبول وبدء وتسليم المهام
- ✅ Optimistic updates لتحسين تجربة المستخدم
- ✅ إلغاء صلاحية الذاكرة المؤقتة (cache invalidation) بعد كل عملية
- ✅ معالجة الأخطاء وإشعارات Toast

**التصميم والمطابقة** ✅:
- ✅ دعم RTL كامل
- ✅ خط Tajawal للنصوص العربية
- ✅ rounded-2xl لجميع البطاقات والعناصر
- ✅ تأثيرات hover-elevate
- ✅ shadow-md للبطاقات
- ✅ نظام ألوان متسق (Primary green #4CAF50)
- ✅ responsive design كامل

**اختبارات البيانات** ✅:
- ✅ جميع الأزرار لها data-testid فريدة: `button-accept-task-${id}`
- ✅ جميع الحقول لها data-testid فريدة: `input-search-tasks`
- ✅ جميع البطاقات لها data-testid فريدة: `card-task-${id}`
- ✅ جميع badges الحالة لها data-testid فريدة: `badge-status-${taskId}`
- ✅ عناصر الإحصائيات: `stat-active-tasks`, `stat-earnings`, etc.
- ✅ عناصر الحوار: `dialog-submit-task`, `textarea-submission`, etc.

## Latest Updates (Homepage Redesign - October 30, 2025)

**تحسين الصفحة الرئيسية مع animations** ✅:
- ✅ **إزالة الكروت الصغيرة للخدمات** واستبدالها بمحتوى نصي مباشر
- ✅ **تنسيق المحتوى بشكل احترافي** في كامل الصفحة الرئيسية:
  - عرض الخدمات بتصميم أفقي (flex layout) مع أيقونات ملونة
  - كل خدمة لها خلفية gradient بسيطة
  - الخدمة المميزة (السوشيال ميديا) بها border مميز وbadge
  - تحسين عرض قسم "كيف تعمل المنصة" مع grid layout وأرقام
- ✅ **إضافة حركات بسيطة (scroll animations)**:
  - استخدام `useInView` من framer-motion
  - مكون `FadeInSection` للحركات البسيطة
  - كل عنصر يظهر تدريجياً عند التمرير (fade in + slide up)
  - delays متدرجة لخلق تأثير متتابع
  - Animation duration: 0.6s مع easing ناعم
- ✅ **تحسينات التصميم**:
  - hover effects على عناصر "لماذا تختار سُمُوّ"
  - خلفيات gradient للأقسام المهمة
  - أيقونات ملونة لكل خدمة (Smartphone, MapPin, TrendingUp, etc.)
  - تنسيق أفضل للمسافات والتباعد
  - نص الختام في صندوق مميز بخلفية gradient

**التقنيات المستخدمة** ✅:
- ✅ `framer-motion` - للحركات والانتقالات
- ✅ `useInView` hook - للكشف عن ظهور العناصر في viewport
- ✅ Component-based animations - مكون FadeInSection قابل لإعادة الاستخدام
- ✅ Staggered animations - تأخير متدرج للعناصر المتعددة