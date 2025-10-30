import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Freelancer schema
export const freelancers = pgTable("freelancers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  username: text("username").notNull().unique(),
  phone: text("phone").notNull(),
  countryCode: text("country_code").notNull().default("+966"),
  jobTitle: text("job_title"),
  teamSize: integer("team_size").default(1),
  services: text("services").array().default(sql`ARRAY[]::text[]`),
  bio: text("bio"),
  aboutMe: text("about_me"),
  profileImage: text("profile_image"),
  idVerification: text("id_verification"),
  paymentMethod: text("payment_method"),
  accountNumber: text("account_number"),
});

// Product Owner schema
export const productOwners = pgTable("product_owners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  companyName: text("company_name"),
  phone: text("phone").notNull(),
  productName: text("product_name").notNull(),
  productType: text("product_type").notNull(),
  productDescription: text("product_description"),
  productUrl: text("product_url"),
  services: text("services").array().default(sql`ARRAY[]::text[]`),
  package: text("package"),
  budget: text("budget"),
  duration: text("duration"),
});

// Insert schemas for validation
export const insertFreelancerSchema = createInsertSchema(freelancers).omit({
  id: true,
});

export const insertProductOwnerSchema = createInsertSchema(productOwners).omit({
  id: true,
});

// TypeScript types
export type Freelancer = typeof freelancers.$inferSelect;
export type InsertFreelancer = z.infer<typeof insertFreelancerSchema>;
export type ProductOwner = typeof productOwners.$inferSelect;
export type InsertProductOwner = z.infer<typeof insertProductOwnerSchema>;

// Service options
export const serviceOptions = [
  "اختبار تطبيقات",
  "تقييم خرائط Google Maps",
  "تقييم تطبيقات Android",
  "تقييم تطبيقات iOS",
  "تقييم مواقع إلكترونية",
  "اختبار أنظمة Software",
  "مراجعات تجربة المستخدم UX/UI",
  "التفاعل مع منشورات السوشيال ميديا",
] as const;

// Product types
export const productTypes = [
  "تطبيق موبايل",
  "موقع إلكتروني",
  "نظام سوفت وير",
  "متجر إلكتروني",
] as const;

// Payment methods
export const paymentMethods = [
  "محفظة سُمُوّ",
  "PayPal",
  "STC Pay",
  "تحويل بنكي",
] as const;

// Packages
export const packages = [
  {
    id: "basic",
    name: "Basic",
    nameAr: "أساسي",
    testers: 10,
    features: [
      "10 مختبرين متخصصين",
      "تقرير أساسي عن التجربة",
      "مدة التنفيذ: 3-5 أيام",
      "دعم فني أساسي",
    ],
    price: "499",
  },
  {
    id: "pro",
    name: "Pro",
    nameAr: "احترافي",
    testers: 30,
    features: [
      "30 مختبرًا متخصصًا",
      "تحليل UX/UI مفصل",
      "تقرير شامل مع توصيات",
      "مدة التنفيذ: 5-7 أيام",
      "دعم فني ذو أولوية",
    ],
    price: "1299",
    recommended: true,
  },
  {
    id: "growth",
    name: "Growth",
    nameAr: "نمو",
    testers: 50,
    features: [
      "50+ مختبرًا من مختلف الفئات",
      "اختبار + تقييم + تفاعل سوشيال",
      "تحليل ذكي بالـ AI",
      "تقارير تفصيلية أسبوعية",
      "مدة التنفيذ: 7-14 يوم",
      "مدير حساب مخصص",
      "دعم فني على مدار الساعة",
    ],
    price: "2999",
  },
] as const;

// Keep the existing users table for compatibility
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
