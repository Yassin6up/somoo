# منصة سُمُوّ - Sumou Platform

## نظرة عامة
منصة رقمية عربية تربط المستقلين المحترفين بأصحاب المنتجات الرقمية لاختبار التطبيقات، المواقع، والأنظمة - مع تقييمات حقيقية وتفاعل على السوشيال ميديا.

## التقنيات المستخدمة

### Frontend
- **React** مع **TypeScript** للواجهة الأمامية
- **Wouter** للتوجيه (Routing)
- **Tailwind CSS** للتصميم
- **Shadcn UI** للمكونات الجاهزة
- **React Hook Form** + **Zod** لإدارة النماذج والتحقق
- **TanStack Query** لإدارة البيانات والـ API calls

### Backend
- **Express.js** للخادم
- **In-Memory Storage** لتخزين البيانات (للنموذج الأولي)
- **OpenAI** (via Replit AI Integrations) للاقتراحات الذكية
- **Object Storage** لرفع الصور والملفات

### التصميم
- خطوط: **Cairo** للعربية، **Inter** للإنجليزية
- دعم RTL كامل
- ألوان: أخضر #4CAF50 كلون أساسي، خلفية بيضاء #FAFAFA
- تصميم Responsive على جميع الأجهزة

## بنية المشروع

```
├── client/
│   ├── src/
│   │   ├── components/         # المكونات المشتركة
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── StepIndicator.tsx
│   │   │   └── PasswordStrength.tsx
│   │   ├── pages/              # الصفحات الرئيسية
│   │   │   ├── Home.tsx        # الصفحة الرئيسية
│   │   │   ├── RoleSelection.tsx
│   │   │   ├── FreelancerSignup.tsx
│   │   │   ├── ProductOwnerSignup.tsx
│   │   │   └── Dashboard.tsx
│   │   └── App.tsx             # نقطة الدخول الرئيسية
├── server/
│   ├── routes.ts               # API endpoints
│   ├── storage.ts              # In-memory storage
│   └── index.ts                # نقطة الدخول للسيرفر
├── shared/
│   └── schema.ts               # نماذج البيانات المشتركة
└── design_guidelines.md        # إرشادات التصميم
```

## الصفحات والميزات

### 1. الصفحة الرئيسية (/)
- Hero Section جذاب مع عنوان ووصف
- قسم "كيف تعمل المنصة" بثلاث خطوات
- قسم الخدمات المتاحة
- تصميم responsive كامل

### 2. صفحة اختيار نوع الحساب (/role-selection)
- بطاقتان تفاعليتان: مستقل أو صاحب منتج
- عرض مميزات كل نوع حساب

### 3. تسجيل المستقل (/freelancer-signup)
نظام متعدد الخطوات:
- **الخطوة 1**: المعلومات الأساسية (الاسم، البريد، الهاتف، كلمة المرور)
- **الخطوة 2**: المهارات والخدمات (المسمى المهني، حجم الفريق، الخدمات، الوصف)
- **الخطوة 3**: التوثيق (صورة شخصية، إثبات الهوية)
- **الخطوة 4**: إعدادات الدفع (وسيلة الدفع، رقم الحساب)

### 4. تسجيل صاحب المنتج (/product-owner-signup)
نظام متعدد الخطوات:
- **الخطوة 1**: المعلومات العامة
- **الخطوة 2**: معلومات المنتج (الاسم، النوع، الوصف، الرابط)
- **الخطوة 3**: الخدمات والباقات (اختيار الخدمات والباقة المناسبة)
- **الخطوة 4**: الميزانية والتأكيد

### 5. لوحة التحكم (/dashboard)
- عرض مخصص للمستقلين وأصحاب المنتجات
- إحصائيات سريعة
- قائمة جانبية للتنقل
- حالة فارغة جميلة

## نماذج البيانات

### المستقلون (Freelancers)
```typescript
{
  id: string
  email: string
  password: string
  fullName: string
  username: string
  phone: string
  countryCode: string
  jobTitle?: string
  teamSize?: number
  services: string[]
  bio?: string
  aboutMe?: string
  profileImage?: string
  idVerification?: string
  paymentMethod?: string
  accountNumber?: string
}
```

### أصحاب المنتجات (Product Owners)
```typescript
{
  id: string
  email: string
  password: string
  fullName: string
  companyName?: string
  phone: string
  productName: string
  productType: string
  productDescription?: string
  productUrl?: string
  services: string[]
  package?: string
  budget?: string
  duration?: string
}
```

## الباقات المتاحة

### Basic (أساسي)
- 10 مختبرين
- تقرير أساسي
- 499 ر.س

### Pro (احترافي) ⭐ الأكثر طلبًا
- 30 مختبر
- تحليل UX/UI مفصل
- 1299 ر.س

### Growth (نمو)
- 50+ مختبر
- اختبار + تقييم + تفاعل
- تحليل ذكي بالـ AI
- 2999 ر.س

## الخدمات المتاحة
1. اختبار تطبيقات
2. تقييم خرائط Google Maps
3. تقييم تطبيقات Android
4. تقييم تطبيقات iOS
5. تقييم مواقع إلكترونية
6. اختبار أنظمة Software
7. مراجعات تجربة المستخدم UX/UI
8. التفاعل مع منشورات السوشيال ميديا

## التشغيل

المشروع يعمل بالأمر:
```bash
npm run dev
```

يتم تشغيل السيرفر على المنفذ الافتراضي مع Vite للواجهة الأمامية.

## الميزات القادمة (Next Phase)

1. **Backend Integration**
   - تنفيذ API endpoints الكاملة
   - دمج OpenAI للاقتراحات الذكية
   - نظام رفع الملفات (Object Storage)

2. **Database**
   - PostgreSQL لتخزين البيانات بشكل دائم
   - Migration scripts

3. **Authentication**
   - نظام تسجيل الدخول
   - JWT tokens
   - حماية الـ routes

4. **Advanced Features**
   - نظام الإشعارات
   - المحفظة الإلكترونية
   - التقارير الذكية
   - لوحة إدارة

## ملاحظات التطوير

- التصميم يتبع نمط SaaS حديث مشابه لـ Figma و Notion
- جميع النماذج تستخدم React Hook Form + Zod للتحقق
- التصميم responsive بالكامل
- دعم RTL كامل للغة العربية
- استخدام Shadcn UI components بشكل مكثف
- ظلال ناعمة وحواف دائرية (rounded-2xl) في كل مكان
- نظام ألوان متسق مع اللون الأخضر #4CAF50 كأساسي

## آخر التحديثات

**Task 1 Completed**: تم بناء جميع صفحات ومكونات الواجهة الأمامية بتصميم احترافي استثنائي
- ✅ Schema definitions
- ✅ Design system setup (Cairo font, RTL, colors)
- ✅ All page components (Home, Role Selection, Freelancer/Owner Signup, Dashboard)
- ✅ Shared components (Navbar, Footer, StepIndicator, PasswordStrength)
- ✅ Responsive design
- ✅ RTL support

**Next**: Backend implementation with API endpoints, OpenAI integration, and file upload system.
