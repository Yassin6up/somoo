import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFreelancerSchema, insertProductOwnerSchema, insertCampaignSchema, insertOrderSchema, type Campaign, postComments } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";
import multer from "multer";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import bcrypt from "bcrypt";
import { generateToken, authMiddleware, requireRole, adminAuthMiddleware, requirePermission, type AuthRequest } from "./middleware/auth";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Initialize OpenAI client using Replit AI Integrations
// This provides OpenAI-compatible API access without requiring your own OpenAI API key
// Charges are billed to your Replit credits
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ============================================
  // FREELANCER ROUTES
  // ============================================

  // Create freelancer account
  app.post("/api/freelancers", async (req, res) => {
    try {
      const validatedData = insertFreelancerSchema.parse(req.body);

      // Check if email already exists
      const existingByEmail = await storage.getFreelancerByEmail(validatedData.email);
      if (existingByEmail) {
        return res.status(400).json({ error: "البريد الإلكتروني مستخدم بالفعل" });
      }

      // Check if username already exists
      const existingByUsername = await storage.getFreelancerByUsername(validatedData.username);
      if (existingByUsername) {
        return res.status(400).json({ error: "اسم المستخدم مستخدم بالفعل" });
      }

      // Hash password before storing
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      const freelancerData = { ...validatedData, password: hashedPassword };

      const freelancer = await storage.createFreelancer(freelancerData);
      
      // Generate JWT token
      const token = generateToken({
        userId: freelancer.id,
        userType: "freelancer",
        email: freelancer.email,
      });
      
      // Don't send password back to client
      const { password, ...freelancerWithoutPassword } = freelancer;
      
      res.status(201).json({ 
        user: freelancerWithoutPassword,
        token,
        message: "تم إنشاء الحساب بنجاح"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating freelancer:", error);
      res.status(500).json({ error: "حدث خطأ أثناء إنشاء الحساب" });
    }
  });

  // Get all freelancers
  app.get("/api/freelancers", async (req, res) => {
    try {
      const freelancers = await storage.getAllFreelancers();
      
      // Remove passwords from response
      const freelancersWithoutPasswords = freelancers.map(({ password, ...f }) => f);
      
      res.json(freelancersWithoutPasswords);
    } catch (error) {
      console.error("Error fetching freelancers:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب البيانات" });
    }
  });

  // Accept instructions (protected) - MUST be before :id route
  app.patch("/api/freelancers/accept-instructions", authMiddleware, requireRole(["freelancer"]), async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      const updatedFreelancer = await storage.updateFreelancer(userId, { acceptedInstructions: true });

      if (!updatedFreelancer) {
        return res.status(404).json({ error: "المستقل غير موجود" });
      }

      res.json({ message: "تم قبول التعليمات بنجاح", acceptedInstructions: true });
    } catch (error) {
      console.error("Error accepting instructions:", error);
      res.status(500).json({ error: "حدث خطأ أثناء حفظ الموافقة" });
    }
  });

  // Get freelancer by ID
  app.get("/api/freelancers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const freelancer = await storage.getFreelancer(id);

      if (!freelancer) {
        return res.status(404).json({ error: "المستقل غير موجود" });
      }

      const { password, ...freelancerWithoutPassword } = freelancer;
      res.json(freelancerWithoutPassword);
    } catch (error) {
      console.error("Error fetching freelancer:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب البيانات" });
    }
  });

  // Update freelancer (protected)
  app.patch("/api/freelancers/:id", authMiddleware, requireRole(["freelancer"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Verify user can only update their own profile
      if (req.user?.userId !== id) {
        return res.status(403).json({ error: "ليس لديك صلاحية لتحديث هذا الحساب" });
      }

      // Don't allow password updates through this endpoint
      delete updates.password;
      delete updates.id;

      const updatedFreelancer = await storage.updateFreelancer(id, updates);

      if (!updatedFreelancer) {
        return res.status(404).json({ error: "المستقل غير موجود" });
      }

      const { password, ...freelancerWithoutPassword } = updatedFreelancer;
      res.json(freelancerWithoutPassword);
    } catch (error) {
      console.error("Error updating freelancer:", error);
      res.status(500).json({ error: "حدث خطأ أثناء التحديث" });
    }
  });

  // ============================================
  // PRODUCT OWNER ROUTES
  // ============================================

  // Create product owner account
  app.post("/api/product-owners", async (req, res) => {
    try {
      const validatedData = insertProductOwnerSchema.parse(req.body);

      // Check if email already exists
      const existingByEmail = await storage.getProductOwnerByEmail(validatedData.email);
      if (existingByEmail) {
        return res.status(400).json({ error: "البريد الإلكتروني مستخدم بالفعل" });
      }

      // Hash password before storing
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      const ownerData = { ...validatedData, password: hashedPassword };

      const productOwner = await storage.createProductOwner(ownerData);
      
      // Generate JWT token
      const token = generateToken({
        userId: productOwner.id,
        userType: "product_owner",
        email: productOwner.email,
      });
      
      // Don't send password back to client
      const { password, ...ownerWithoutPassword } = productOwner;
      
      res.status(201).json({ 
        user: ownerWithoutPassword,
        token,
        message: "تم إنشاء الحساب بنجاح"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating product owner:", error);
      res.status(500).json({ error: "حدث خطأ أثناء إنشاء الحساب" });
    }
  });

  // Get all product owners
  app.get("/api/product-owners", async (req, res) => {
    try {
      const owners = await storage.getAllProductOwners();
      
      // Remove passwords from response
      const ownersWithoutPasswords = owners.map(({ password, ...o }) => o);
      
      res.json(ownersWithoutPasswords);
    } catch (error) {
      console.error("Error fetching product owners:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب البيانات" });
    }
  });

  // Accept instructions (protected) - MUST be before :id route
  app.patch("/api/product-owners/accept-instructions", authMiddleware, requireRole(["product_owner"]), async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      const updatedOwner = await storage.updateProductOwner(userId, { acceptedInstructions: true });

      if (!updatedOwner) {
        return res.status(404).json({ error: "صاحب المنتج غير موجود" });
      }

      res.json({ message: "تم قبول الشروط والأحكام بنجاح", acceptedInstructions: true });
    } catch (error) {
      console.error("Error accepting instructions:", error);
      res.status(500).json({ error: "حدث خطأ أثناء حفظ الموافقة" });
    }
  });

  // Get product owner by ID
  app.get("/api/product-owners/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const owner = await storage.getProductOwner(id);

      if (!owner) {
        return res.status(404).json({ error: "صاحب المنتج غير موجود" });
      }

      const { password, ...ownerWithoutPassword } = owner;
      res.json(ownerWithoutPassword);
    } catch (error) {
      console.error("Error fetching product owner:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب البيانات" });
    }
  });

  // Update product owner (protected)
  app.patch("/api/product-owners/:id", authMiddleware, requireRole(["product_owner"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Verify user can only update their own profile
      if (req.user?.userId !== id) {
        return res.status(403).json({ error: "ليس لديك صلاحية لتحديث هذا الحساب" });
      }

      // Don't allow password updates through this endpoint
      delete updates.password;
      delete updates.id;

      const updatedOwner = await storage.updateProductOwner(id, updates);

      if (!updatedOwner) {
        return res.status(404).json({ error: "صاحب المنتج غير موجود" });
      }

      const { password, ...ownerWithoutPassword } = updatedOwner;
      res.json(ownerWithoutPassword);
    } catch (error) {
      console.error("Error updating product owner:", error);
      res.status(500).json({ error: "حدث خطأ أثناء التحديث" });
    }
  });

  // ============================================
  // AI SUGGESTIONS (OpenAI Integration)
  // ============================================

  // Generate AI suggestions for bio/description
  app.post("/api/ai/suggestions", async (req, res) => {
    try {
      const { text, type } = req.body;

      if (!text || text.length < 10) {
        return res.status(400).json({ error: "النص قصير جدًا للحصول على اقتراحات" });
      }

      let prompt = "";
      if (type === "freelancer-bio") {
        prompt = `أنت مساعد ذكي في منصة سُمُوّ، منصة عربية لربط المستقلين بأصحاب المنتجات. المستقل كتب الوصف التالي عن نفسه:

"${text}"

ساعده في تحسين هذا الوصف ليكون أكثر احترافية وجاذبية للعملاء. اكتب نسخة محسّنة من الوصف بالعربية، في 2-3 جمل فقط، مع التركيز على الخبرة والمهارات والقيمة المضافة.`;
      } else if (type === "product-description") {
        prompt = `أنت مساعد ذكي في منصة سُمُوّ، منصة عربية لاختبار المنتجات الرقمية. صاحب المنتج كتب الوصف التالي عن منتجه:

"${text}"

ساعده في تحسين هذا الوصف ليكون أكثر وضوحًا وجاذبية للمختبرين. اكتب نسخة محسّنة من الوصف بالعربية، في 2-3 جمل فقط، مع التركيز على الميزات الرئيسية والقيمة المضافة.`;
      } else {
        return res.status(400).json({ error: "نوع الاقتراح غير صحيح" });
      }

      // Using gpt-5 - the newest OpenAI model released August 7, 2025
      const completion = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "أنت مساعد ذكي متخصص في كتابة أوصاف احترافية باللغة العربية. تجيب دائمًا بالعربية الفصحى الواضحة."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_completion_tokens: 200,
      });

      const suggestion = completion.choices[0]?.message?.content?.trim();

      if (!suggestion) {
        return res.status(500).json({ error: "فشل في توليد الاقتراح" });
      }

      res.json({ suggestion });
    } catch (error) {
      console.error("Error generating AI suggestion:", error);
      res.status(500).json({ error: "حدث خطأ أثناء توليد الاقتراح" });
    }
  });

  // ============================================
  // FILE UPLOAD (Object Storage)
  // ============================================

  // Upload profile image or ID verification (public - used during signup)
  // Security: File type and size validation enforced
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "لم يتم رفع أي ملف" });
      }

      // Validate file size (max 5MB)
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
      if (req.file.size > MAX_FILE_SIZE) {
        return res.status(400).json({ error: "حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت" });
      }

      // Validate file type (only images and PDFs)
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf'
      ];
      
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: "نوع الملف غير مدعوم. يسمح فقط بالصور (JPEG, PNG, GIF, WebP) و PDF" });
      }

      const { type } = req.body; // 'profile', 'verification', or 'group'
      
      if (type !== "profile" && type !== "verification" && type !== "group") {
        return res.status(400).json({ error: "نوع الملف غير صحيح" });
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), "uploads", type);
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${req.file.originalname}`;
      const filePath = join(uploadsDir, filename);

      // Save file
      await writeFile(filePath, req.file.buffer);

      // Return URL path
      const fileUrl = `/uploads/${type}/${filename}`;

      res.json({ url: fileUrl });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "حدث خطأ أثناء رفع الملف" });
    }
  });

  // ============================================
  // AUTHENTICATION ROUTES
  // ============================================

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" });
      }

      // Try to find freelancer first
      let user = await storage.getFreelancerByEmail(email);
      let userType: "freelancer" | "product_owner" = "freelancer";

      // If not found, try product owner
      if (!user) {
        user = await storage.getProductOwnerByEmail(email);
        userType = "product_owner";
      }

      // User not found
      if (!user) {
        return res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      }

      // Verify password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        userType,
        email: user.email,
      });

      // Don't send password back
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        user: userWithoutPassword,
        userType,
        token,
        message: "تم تسجيل الدخول بنجاح"
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "حدث خطأ أثناء تسجيل الدخول" });
    }
  });

  // Change password endpoint
  app.post("/api/auth/change-password", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "كلمة المرور الحالية والجديدة مطلوبة" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
      }

      const userId = req.user!.userId;
      const userType = req.user!.userType;

      // Get user based on type
      let user;
      if (userType === "freelancer") {
        user = await storage.getFreelancer(userId);
      } else {
        user = await storage.getProductOwner(userId);
      }

      if (!user) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "كلمة المرور الحالية غير صحيحة" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      if (userType === "freelancer") {
        await storage.updateFreelancer(userId, { password: hashedPassword });
      } else {
        await storage.updateProductOwner(userId, { password: hashedPassword });
      }

      res.json({ message: "تم تغيير كلمة المرور بنجاح" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ error: "حدث خطأ أثناء تغيير كلمة المرور" });
    }
  });

  // ============================================
  // CAMPAIGN ROUTES
  // ============================================

  // Create campaign (product owners only)
  app.post("/api/campaigns", authMiddleware, requireRole(["product_owner"]), async (req: AuthRequest, res) => {
    try {
      const validatedData = insertCampaignSchema.parse(req.body);

      // Ensure owner_id matches the authenticated user
      if (validatedData.owner_id !== req.user?.userId) {
        return res.status(403).json({ error: "يمكنك فقط إنشاء حملات لحسابك الخاص" });
      }

      const campaign = await storage.createCampaign(validatedData);
      res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating campaign:", error);
      res.status(500).json({ error: "حدث خطأ أثناء إنشاء الحملة" });
    }
  });

  // Get all campaigns (filtered based on user type)
  app.get("/api/campaigns", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { status, owner_id } = req.query;
      
      let campaigns;
      
      if (req.user?.userType === "product_owner") {
        // Product owners see only their campaigns
        campaigns = await storage.getCampaignsByOwner(req.user.userId);
      } else {
        // Freelancers see only active campaigns (not drafts, paused, etc.)
        const allCampaigns = await storage.getAllCampaigns();
        campaigns = allCampaigns.filter(c => c.status === "active");
      }

      // Apply additional filters
      if (status) {
        campaigns = campaigns.filter(c => c.status === status);
      }
      if (owner_id && req.user?.userType === "product_owner") {
        campaigns = campaigns.filter(c => c.owner_id === owner_id);
      }

      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب الحملات" });
    }
  });

  // Get campaign by ID
  app.get("/api/campaigns/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const campaign = await storage.getCampaign(id);

      if (!campaign) {
        return res.status(404).json({ error: "الحملة غير موجودة" });
      }

      // Product owners can only see their own campaigns
      if (req.user?.userType === "product_owner" && campaign.owner_id !== req.user.userId) {
        return res.status(403).json({ error: "ليس لديك صلاحية لعرض هذه الحملة" });
      }

      res.json(campaign);
    } catch (error) {
      console.error("Error fetching campaign:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب بيانات الحملة" });
    }
  });

  // Update campaign (product owners only, own campaigns)
  app.patch("/api/campaigns/:id", authMiddleware, requireRole(["product_owner"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      
      // Get existing campaign to verify ownership
      const existingCampaign = await storage.getCampaign(id);
      if (!existingCampaign) {
        return res.status(404).json({ error: "الحملة غير موجودة" });
      }

      if (existingCampaign.owner_id !== req.user?.userId) {
        return res.status(403).json({ error: "ليس لديك صلاحية لتحديث هذه الحملة" });
      }

      // Create update schema (partial of insert schema, excluding owner_id and id)
      const updateCampaignSchema = insertCampaignSchema.partial().omit({ owner_id: true, id: true });
      
      // Validate updates
      const validatedUpdates = updateCampaignSchema.parse(req.body);

      const updatedCampaign = await storage.updateCampaign(id, validatedUpdates);
      res.json(updatedCampaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating campaign:", error);
      res.status(500).json({ error: "حدث خطأ أثناء تحديث الحملة" });
    }
  });

  // Delete campaign (product owners only, own campaigns)
  app.delete("/api/campaigns/:id", authMiddleware, requireRole(["product_owner"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      // Get existing campaign to verify ownership
      const existingCampaign = await storage.getCampaign(id);
      if (!existingCampaign) {
        return res.status(404).json({ error: "الحملة غير موجودة" });
      }

      if (existingCampaign.owner_id !== req.user?.userId) {
        return res.status(403).json({ error: "ليس لديك صلاحية لحذف هذه الحملة" });
      }

      await storage.deleteCampaign(id);
      res.json({ message: "تم حذف الحملة بنجاح" });
    } catch (error) {
      console.error("Error deleting campaign:", error);
      res.status(500).json({ error: "حدث خطأ أثناء حذف الحملة" });
    }
  });

  // ============================================
  // TASK ROUTES
  // ============================================

  // Get available tasks (freelancers can browse)
  app.get("/api/tasks/available", authMiddleware, requireRole(["freelancer"]), async (req: AuthRequest, res) => {
    try {
      const tasks = await storage.getAvailableTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching available tasks:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب المهام المتاحة" });
    }
  });

  // Get freelancer's tasks (assigned, in_progress, submitted, approved)
  app.get("/api/tasks/my-tasks", authMiddleware, requireRole(["freelancer"]), async (req: AuthRequest, res) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }
      
      const tasks = await storage.getTasksByFreelancer(req.user.userId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching freelancer tasks:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب مهامك" });
    }
  });

  // Get single task details
  app.get("/api/tasks/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ error: "المهمة غير موجودة" });
      }

      // Check authorization: freelancer can only view their own tasks or available tasks
      if (req.user?.userType === "freelancer") {
        if (task.status !== "available" && task.freelancerId !== req.user.userId) {
          return res.status(403).json({ error: "ليس لديك صلاحية لعرض هذه المهمة" });
        }
      }

      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب المهمة" });
    }
  });

  // Accept a task (freelancer assigns themselves)
  app.post("/api/tasks/:id/accept", authMiddleware, requireRole(["freelancer"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      
      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      // Check if task exists and is available
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ error: "المهمة غير موجودة" });
      }

      if (task.status !== "available") {
        return res.status(400).json({ error: "هذه المهمة غير متاحة حالياً" });
      }

      // Assign task to freelancer
      const updatedTask = await storage.assignTask(id, req.user.userId);
      
      if (!updatedTask) {
        return res.status(400).json({ error: "فشل قبول المهمة" });
      }

      // Create notification for product owner
      const campaign = await storage.getCampaign(task.campaignId);
      if (campaign) {
        await storage.createNotification({
          userId: campaign.productOwnerId,
          userType: "product_owner",
          title: "تم قبول مهمة",
          message: `تم قبول المهمة "${task.title}" من قبل مستقل`,
          type: "task_assigned",
        });
      }

      res.json(updatedTask);
    } catch (error) {
      console.error("Error accepting task:", error);
      res.status(500).json({ error: "حدث خطأ أثناء قبول المهمة" });
    }
  });

  // Submit task with report
  app.patch("/api/tasks/:id/submit", authMiddleware, requireRole(["freelancer"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { submission } = req.body;

      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      if (!submission || !submission.trim()) {
        return res.status(400).json({ error: "التقرير مطلوب" });
      }

      // Check if task exists and belongs to this freelancer
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ error: "المهمة غير موجودة" });
      }

      if (task.freelancerId !== req.user.userId) {
        return res.status(403).json({ error: "ليس لديك صلاحية لتسليم هذه المهمة" });
      }

      if (task.status !== "assigned" && task.status !== "in_progress") {
        return res.status(400).json({ error: "لا يمكن تسليم هذه المهمة في حالتها الحالية" });
      }

      // Update task with submission
      const updatedTask = await storage.updateTask(id, {
        submission,
        status: "submitted",
        submittedAt: new Date(),
      });

      // Create notification for product owner
      const campaign = await storage.getCampaign(task.campaignId);
      if (campaign) {
        await storage.createNotification({
          userId: campaign.productOwnerId,
          userType: "product_owner",
          title: "تم تسليم مهمة",
          message: `تم تسليم المهمة "${task.title}" من قبل المستقل`,
          type: "task_submitted",
        });
      }

      res.json(updatedTask);
    } catch (error) {
      console.error("Error submitting task:", error);
      res.status(500).json({ error: "حدث خطأ أثناء تسليم المهمة" });
    }
  });

  // Update task status to in_progress (freelancer starts working)
  app.patch("/api/tasks/:id/start", authMiddleware, requireRole(["freelancer"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ error: "المهمة غير موجودة" });
      }

      if (task.freelancerId !== req.user.userId) {
        return res.status(403).json({ error: "ليس لديك صلاحية لبدء هذه المهمة" });
      }

      if (task.status !== "assigned") {
        return res.status(400).json({ error: "لا يمكن بدء هذه المهمة في حالتها الحالية" });
      }

      const updatedTask = await storage.updateTask(id, {
        status: "in_progress",
      });

      res.json(updatedTask);
    } catch (error) {
      console.error("Error starting task:", error);
      res.status(500).json({ error: "حدث خطأ أثناء بدء المهمة" });
    }
  });

  // ============================================
  // PRODUCT OWNER - TASKS MANAGEMENT
  // ============================================

  // Get all tasks for product owner's campaigns
  app.get("/api/tasks/owner", authMiddleware, requireRole(["product_owner"]), async (req: AuthRequest, res) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      // Get all campaigns for this product owner
      const campaigns: Campaign[] = await storage.getCampaignsByOwner(req.user.userId);
      const campaignIds = campaigns.map((c: Campaign) => c.id);

      // Get all tasks for these campaigns
      const allTasks: any[] = [];
      for (const campaignId of campaignIds) {
        const tasks = await storage.getTasksByCampaign(campaignId);
        allTasks.push(...tasks);
      }

      res.json(allTasks);
    } catch (error) {
      console.error("Error fetching owner tasks:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب المهام" });
    }
  });

  // Approve a task (product owner)
  app.patch("/api/tasks/:id/approve", authMiddleware, requireRole(["product_owner"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { feedback } = req.body;

      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ error: "المهمة غير موجودة" });
      }

      // Verify ownership through campaign
      const campaign = await storage.getCampaign(task.campaignId);
      if (!campaign || campaign.productOwnerId !== req.user.userId) {
        return res.status(403).json({ error: "ليس لديك صلاحية للموافقة على هذه المهمة" });
      }

      if (task.status !== "submitted") {
        return res.status(400).json({ error: "لا يمكن الموافقة على هذه المهمة في حالتها الحالية" });
      }

      // Update task
      const updatedTask = await storage.updateTask(id, {
        status: "approved",
        feedback: feedback || "",
        completedAt: new Date(),
      });

      // Create notification for freelancer
      if (task.freelancerId) {
        await storage.createNotification({
          userId: task.freelancerId,
          userType: "freelancer",
          title: "تمت الموافقة على مهمتك",
          message: `تمت الموافقة على المهمة "${task.title}" وتم إضافة ${task.reward} ر.س إلى محفظتك`,
          type: "task_approved",
        });
      }

      // Update freelancer wallet - add reward to balance
      if (task.freelancerId) {
        const wallet = await storage.getWalletByFreelancer(task.freelancerId);
        if (wallet) {
          await storage.updateWallet(wallet.id, {
            balance: (Number(wallet.balance) + Number(task.reward)).toString(),
            totalEarned: (Number(wallet.totalEarned) + Number(task.reward)).toString(),
          });

          // Create transaction record
          await storage.createTransaction({
            walletId: wallet.id,
            taskId: task.id,
            type: "earning",
            amount: task.reward.toString(),
            status: "completed",
            description: `مكافأة المهمة: ${task.title}`,
          });
        }

        // Create notification for freelancer
        await storage.createNotification({
          userId: task.freelancerId,
          userType: "freelancer",
          title: "تمت الموافقة على المهمة",
          message: `تمت الموافقة على المهمة "${task.title}" وتم إضافة ${task.reward} ر.س لمحفظتك`,
          type: "task_approved",
        });
      }

      res.json(updatedTask);
    } catch (error) {
      console.error("Error approving task:", error);
      res.status(500).json({ error: "حدث خطأ أثناء الموافقة على المهمة" });
    }
  });

  // Reject a task (product owner)
  app.patch("/api/tasks/:id/reject", authMiddleware, requireRole(["product_owner"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { feedback } = req.body;

      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      if (!feedback || !feedback.trim()) {
        return res.status(400).json({ error: "يجب تقديم سبب الرفض" });
      }

      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ error: "المهمة غير موجودة" });
      }

      // Verify ownership through campaign
      const campaign = await storage.getCampaign(task.campaignId);
      if (!campaign || campaign.productOwnerId !== req.user.userId) {
        return res.status(403).json({ error: "ليس لديك صلاحية لرفض هذه المهمة" });
      }

      if (task.status !== "submitted") {
        return res.status(400).json({ error: "لا يمكن رفض هذه المهمة في حالتها الحالية" });
      }

      // Update task - return to in_progress for rework
      const updatedTask = await storage.updateTask(id, {
        status: "in_progress",
        feedback,
      });

      // Create notification for freelancer
      if (task.freelancerId) {
        await storage.createNotification({
          userId: task.freelancerId,
          userType: "freelancer",
          title: "تم رفض المهمة",
          message: `تم رفض المهمة "${task.title}". يرجى مراجعة الملاحظات وإعادة التسليم`,
          type: "task_rejected",
        });
      }

      res.json(updatedTask);
    } catch (error) {
      console.error("Error rejecting task:", error);
      res.status(500).json({ error: "حدث خطأ أثناء رفض المهمة" });
    }
  });

  // ============================================
  // GROUP ROUTES - إدارة الجروبات
  // ============================================

  // Create a new group (freelancer only)
  app.post("/api/groups", authMiddleware, requireRole(["freelancer"]), async (req: AuthRequest, res) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      const { name, description, maxMembers = 700 } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ error: "اسم الجروب مطلوب" });
      }

      if (maxMembers < 1 || maxMembers > 700) {
        return res.status(400).json({ error: "الحد الأقصى للأعضاء يجب أن يكون بين 1 و 700" });
      }

      const group = await storage.createGroup({
        name: name.trim(),
        description: description?.trim() || "",
        leaderId: req.user.userId,
        maxMembers,
        currentMembers: 1, // Leader is the first member
        status: "active",
      });

      // Add leader as member
      await storage.addGroupMember({
        groupId: group.id,
        freelancerId: req.user.userId,
        role: "leader",
      });

      res.status(201).json(group);
    } catch (error) {
      console.error("Error creating group:", error);
      res.status(500).json({ error: "حدث خطأ أثناء إنشاء الجروب" });
    }
  });

  // Get all groups (for joining)
  app.get("/api/groups", async (req, res) => {
    try {
      const groups = await storage.getAllGroups();
      res.json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب الجروبات" });
    }
  });

  // Get group by ID with details
  app.get("/api/groups/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const group = await storage.getGroup(id);

      if (!group) {
        return res.status(404).json({ error: "الجروب غير موجود" });
      }

      res.json(group);
    } catch (error) {
      console.error("Error fetching group:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب بيانات الجروب" });
    }
  });

  // Get groups where user is leader
  app.get("/api/groups/my/leader", authMiddleware, requireRole(["freelancer"]), async (req: AuthRequest, res) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      const groups = await storage.getGroupsByLeader(req.user.userId);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching leader groups:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب الجروبات" });
    }
  });

  // Join a group (freelancer only)
  app.post("/api/groups/:id/join", authMiddleware, requireRole(["freelancer"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      
      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      const group = await storage.getGroup(id);
      if (!group) {
        return res.status(404).json({ error: "الجروب غير موجود" });
      }

      if (group.status !== "active") {
        return res.status(400).json({ error: "هذا الجروب غير نشط" });
      }

      // Check if already a member
      const isMember = await storage.isGroupMember(id, req.user.userId);
      if (isMember) {
        return res.status(400).json({ error: "أنت عضو بالفعل في هذا الجروب" });
      }

      // Check if group is full
      if (group.currentMembers >= group.maxMembers) {
        return res.status(400).json({ error: "الجروب ممتلئ (الحد الأقصى 700 عضو)" });
      }

      // Add member
      const member = await storage.addGroupMember({
        groupId: id,
        freelancerId: req.user.userId,
        role: "member",
      });

      // Update group member count
      await storage.updateGroup(id, {
        currentMembers: group.currentMembers + 1,
      });

      // Create notification for leader
      await storage.createNotification({
        userId: group.leaderId,
        userType: "freelancer",
        title: "عضو جديد انضم للجروب",
        message: `انضم عضو جديد إلى جروب "${group.name}"`,
        type: "group_member_joined",
      });

      res.status(201).json({ message: "تم الانضمام للجروب بنجاح", member });
    } catch (error: any) {
      // Handle unique constraint violation
      if (error?.code === "23505" || error?.message?.includes("unique")) {
        return res.status(400).json({ error: "أنت عضو بالفعل في هذا الجروب" });
      }
      console.error("Error joining group:", error);
      res.status(500).json({ error: "حدث خطأ أثناء الانضمام للجروب" });
    }
  });

  // Leave a group (freelancer only, not leader)
  app.post("/api/groups/:id/leave", authMiddleware, requireRole(["freelancer"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      
      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      const group = await storage.getGroup(id);
      if (!group) {
        return res.status(404).json({ error: "الجروب غير موجود" });
      }

      if (group.leaderId === req.user.userId) {
        return res.status(400).json({ error: "لا يمكن لقائد الجروب المغادرة. يمكنك حذف الجروب بدلاً من ذلك" });
      }

      const isMember = await storage.isGroupMember(id, req.user.userId);
      if (!isMember) {
        return res.status(400).json({ error: "أنت لست عضواً في هذا الجروب" });
      }

      await storage.removeGroupMember(id, req.user.userId);

      // Update member count
      await storage.updateGroup(id, {
        currentMembers: Math.max(1, group.currentMembers - 1),
      });

      res.json({ message: "تم المغادرة من الجروب بنجاح" });
    } catch (error) {
      console.error("Error leaving group:", error);
      res.status(500).json({ error: "حدث خطأ أثناء المغادرة من الجروب" });
    }
  });

  // Get group members (with details)
  app.get("/api/groups/:id/members", async (req, res) => {
    try {
      const { id } = req.params;
      
      const group = await storage.getGroup(id);
      if (!group) {
        return res.status(404).json({ error: "الجروب غير موجود" });
      }

      const members = await storage.getGroupMembers(id);
      res.json(members);
    } catch (error) {
      console.error("Error fetching group members:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب أعضاء الجروب" });
    }
  });

  // Remove member from group (leader only)
  app.delete("/api/groups/:groupId/members/:freelancerId", authMiddleware, requireRole(["freelancer"]), async (req: AuthRequest, res) => {
    try {
      const { groupId, freelancerId } = req.params;
      
      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      const group = await storage.getGroup(groupId);
      if (!group) {
        return res.status(404).json({ error: "الجروب غير موجود" });
      }

      // Only leader can remove members
      if (group.leaderId !== req.user.userId) {
        return res.status(403).json({ error: "فقط قائد الجروب يمكنه إزالة الأعضاء" });
      }

      // Can't remove the leader
      if (freelancerId === group.leaderId) {
        return res.status(400).json({ error: "لا يمكن إزالة قائد الجروب" });
      }

      const isMember = await storage.isGroupMember(groupId, freelancerId);
      if (!isMember) {
        return res.status(404).json({ error: "العضو غير موجود في الجروب" });
      }

      await storage.removeGroupMember(groupId, freelancerId);

      // Update member count
      await storage.updateGroup(groupId, {
        currentMembers: Math.max(1, group.currentMembers - 1),
      });

      // Notify removed member
      await storage.createNotification({
        userId: freelancerId,
        userType: "freelancer",
        title: "تمت إزالتك من الجروب",
        message: `تمت إزالتك من جروب "${group.name}"`,
        type: "group_member_removed",
      });

      res.json({ message: "تم إزالة العضو من الجروب بنجاح" });
    } catch (error) {
      console.error("Error removing group member:", error);
      res.status(500).json({ error: "حدث خطأ أثناء إزالة العضو" });
    }
  });

  // Update group details (leader only)
  app.patch("/api/groups/:id", authMiddleware, requireRole(["freelancer"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      const group = await storage.getGroup(id);
      if (!group) {
        return res.status(404).json({ error: "الجروب غير موجود" });
      }

      // Only leader can update
      if (group.leaderId !== req.user.userId) {
        return res.status(403).json({ error: "فقط قائد الجروب يمكنه تحديث البيانات" });
      }

      // Don't allow certain fields to be updated
      delete updates.id;
      delete updates.leaderId;
      delete updates.currentMembers;
      delete updates.createdAt;

      // Validate maxMembers if provided
      if (updates.maxMembers !== undefined) {
        if (updates.maxMembers < group.currentMembers) {
          return res.status(400).json({ 
            error: `لا يمكن تقليل الحد الأقصى إلى أقل من العدد الحالي (${group.currentMembers} عضو)` 
          });
        }
        if (updates.maxMembers > 700) {
          return res.status(400).json({ error: "الحد الأقصى للأعضاء هو 700" });
        }
      }

      const updatedGroup = await storage.updateGroup(id, updates);
      res.json(updatedGroup);
    } catch (error) {
      console.error("Error updating group:", error);
      res.status(500).json({ error: "حدث خطأ أثناء تحديث الجروب" });
    }
  });

  // ============================================
  // PROJECT ROUTES - إدارة المشاريع
  // ============================================

  // Create a new project (product owner only)
  app.post("/api/projects", authMiddleware, requireRole(["product_owner"]), async (req: AuthRequest, res) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      const { title, description, targetCountry, tasksCount, budget, deadline } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ error: "عنوان المشروع مطلوب" });
      }

      if (!tasksCount || tasksCount < 1) {
        return res.status(400).json({ error: "عدد المهام يجب أن يكون 1 على الأقل" });
      }

      if (!budget || budget < 0) {
        return res.status(400).json({ error: "الميزانية غير صحيحة" });
      }

      const project = await storage.createProject({
        productOwnerId: req.user.userId,
        title: title.trim(),
        description: description?.trim() || "",
        targetCountry: targetCountry || "",
        tasksCount,
        budget,
        deadline: deadline ? new Date(deadline) : null,
        status: "pending",
      });

      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "حدث خطأ أثناء إنشاء المشروع" });
    }
  });

  // Get all pending projects (for group leaders to browse)
  app.get("/api/projects/pending", authMiddleware, requireRole(["freelancer"]), async (req: AuthRequest, res) => {
    try {
      const projects = await storage.getPendingProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching pending projects:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب المشاريع" });
    }
  });

  // Get projects by product owner
  app.get("/api/projects/my", authMiddleware, requireRole(["product_owner"]), async (req: AuthRequest, res) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      const projects = await storage.getProjectsByOwner(req.user.userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching owner projects:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب المشاريع" });
    }
  });

  // Get projects accepted by a group
  app.get("/api/projects/group/:groupId", authMiddleware, requireRole(["freelancer"]), async (req: AuthRequest, res) => {
    try {
      const { groupId } = req.params;

      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      // Verify user is member of the group
      const isMember = await storage.isGroupMember(groupId, req.user.userId);
      if (!isMember) {
        return res.status(403).json({ error: "ليس لديك صلاحية لعرض مشاريع هذا الجروب" });
      }

      const projects = await storage.getProjectsByGroup(groupId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching group projects:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب المشاريع" });
    }
  });

  // Get single project details
  app.get("/api/projects/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: "المشروع غير موجود" });
      }

      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب بيانات المشروع" });
    }
  });

  // Accept a project (group leader only)
  app.post("/api/projects/:id/accept", authMiddleware, requireRole(["freelancer"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { groupId } = req.body;

      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      if (!groupId) {
        return res.status(400).json({ error: "معرف الجروب مطلوب" });
      }

      // Verify user is the group leader
      const group = await storage.getGroup(groupId);
      if (!group) {
        return res.status(404).json({ error: "الجروب غير موجود" });
      }

      if (group.leaderId !== req.user.userId) {
        return res.status(403).json({ error: "فقط قائد الجروب يمكنه قبول المشاريع" });
      }

      if (group.status !== "active") {
        return res.status(400).json({ error: "الجروب غير نشط" });
      }

      // Verify project exists and is pending
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: "المشروع غير موجود" });
      }

      if (project.status !== "pending") {
        return res.status(400).json({ error: "هذا المشروع تم قبوله بالفعل أو مكتمل" });
      }

      // Accept the project
      const updatedProject = await storage.acceptProject(id, groupId);

      // Notify product owner
      await storage.createNotification({
        userId: project.productOwnerId,
        userType: "product_owner",
        title: "تم قبول المشروع",
        message: `تم قبول مشروع "${project.title}" من قبل جروب "${group.name}"`,
        type: "project_accepted",
      });

      res.json(updatedProject);
    } catch (error) {
      console.error("Error accepting project:", error);
      res.status(500).json({ error: "حدث خطأ أثناء قبول المشروع" });
    }
  });

  // Update project status
  app.patch("/api/projects/:id", authMiddleware, requireRole(["product_owner"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: "المشروع غير موجود" });
      }

      // Verify ownership
      if (project.productOwnerId !== req.user.userId) {
        return res.status(403).json({ error: "ليس لديك صلاحية لتحديث هذا المشروع" });
      }

      // Don't allow certain fields to be updated
      delete updates.id;
      delete updates.productOwnerId;
      delete updates.acceptedByGroupId;
      delete updates.createdAt;

      const updatedProject = await storage.updateProject(id, updates);
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: "حدث خطأ أثناء تحديث المشروع" });
    }
  });

  // Delete a project (product owner only, only if pending)
  app.delete("/api/projects/:id", authMiddleware, requireRole(["product_owner"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: "المشروع غير موجود" });
      }

      // Verify ownership
      if (project.productOwnerId !== req.user.userId) {
        return res.status(403).json({ error: "ليس لديك صلاحية لحذف هذا المشروع" });
      }

      // Only allow deletion if pending
      if (project.status !== "pending") {
        return res.status(400).json({ error: "لا يمكن حذف مشروع تم قبوله أو جاري العمل عليه" });
      }

      await storage.deleteProject(id);
      res.json({ message: "تم حذف المشروع بنجاح" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "حدث خطأ أثناء حذف المشروع" });
    }
  });

  // ============================================
  // TASK ROUTES (NEW - للمهام المرتبطة بالمشاريع والجروبات)
  // ============================================

  // Create tasks for a project (group leader only, after accepting project)
  app.post("/api/projects/:projectId/tasks", authMiddleware, requireRole(["freelancer"]), async (req: AuthRequest, res) => {
    try {
      const { projectId } = req.params;
      const { tasks } = req.body; // Array of task objects

      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
        return res.status(400).json({ error: "يجب تحديد مهمة واحدة على الأقل" });
      }

      // Verify project
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "المشروع غير موجود" });
      }

      if (!project.acceptedByGroupId) {
        return res.status(400).json({ error: "يجب قبول المشروع أولاً" });
      }

      // Verify user is the group leader
      const group = await storage.getGroup(project.acceptedByGroupId);
      if (!group || group.leaderId !== req.user.userId) {
        return res.status(403).json({ error: "فقط قائد الجروب يمكنه إنشاء المهام" });
      }

      // Create tasks
      const createdTasks = [];
      for (const taskData of tasks) {
        // Calculate platform fee (10%) and net reward
        const reward = parseFloat(taskData.reward || "0");
        const platformFee = (reward * 0.10).toFixed(2);
        const netReward = (reward - parseFloat(platformFee)).toFixed(2);
        
        const task = await storage.createTask({
          projectId,
          groupId: project.acceptedByGroupId,
          freelancerId: taskData.freelancerId || null,
          title: taskData.title,
          description: taskData.description || "",
          taskUrl: taskData.taskUrl || "",
          reward: taskData.reward || "0",
          platformFee,
          netReward,
          status: taskData.freelancerId ? "assigned" : "available",
          campaignId: "", // Not used in new system
        });
        createdTasks.push(task);

        // Notify assigned freelancer if any
        if (taskData.freelancerId) {
          await storage.createNotification({
            userId: taskData.freelancerId,
            userType: "freelancer",
            title: "تم تعيين مهمة جديدة لك",
            message: `تم تعيين مهمة "${task.title}" لك في مشروع "${project.title}" بمكافأة $${netReward} (بعد خصم رسوم المنصة 10%)`,
            type: "task_assigned",
          });
        }
      }

      res.status(201).json(createdTasks);
    } catch (error) {
      console.error("Error creating tasks:", error);
      res.status(500).json({ error: "حدث خطأ أثناء إنشاء المهام" });
    }
  });

  // Get tasks for a project
  app.get("/api/projects/:projectId/tasks", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { projectId } = req.params;

      const tasks = await storage.getTasksByProject(projectId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching project tasks:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب المهام" });
    }
  });

  // Get tasks assigned to current user
  app.get("/api/tasks/my/assigned", authMiddleware, requireRole(["freelancer"]), async (req: AuthRequest, res) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      const tasks = await storage.getTasksByFreelancer(req.user.userId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching assigned tasks:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب المهام" });
    }
  });

  // Assign task to group member (leader only)
  app.patch("/api/tasks/:id/assign", authMiddleware, requireRole(["freelancer"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { freelancerId } = req.body;

      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      if (!freelancerId) {
        return res.status(400).json({ error: "معرف العضو مطلوب" });
      }

      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ error: "المهمة غير موجودة" });
      }

      if (!task.groupId) {
        return res.status(400).json({ error: "هذه المهمة غير مرتبطة بجروب" });
      }

      // Verify user is group leader
      const group = await storage.getGroup(task.groupId);
      if (!group || group.leaderId !== req.user.userId) {
        return res.status(403).json({ error: "فقط قائد الجروب يمكنه تعيين المهام" });
      }

      // Verify freelancer is group member
      const isMember = await storage.isGroupMember(task.groupId, freelancerId);
      if (!isMember) {
        return res.status(400).json({ error: "العضو المحدد ليس في الجروب" });
      }

      if (task.status !== "available") {
        return res.status(400).json({ error: "هذه المهمة تم تعيينها بالفعل أو مكتملة" });
      }

      // Assign task
      const updatedTask = await storage.updateTask(id, {
        freelancerId,
        status: "assigned",
      });

      // Notify freelancer
      await storage.createNotification({
        userId: freelancerId,
        userType: "freelancer",
        title: "تم تعيين مهمة جديدة لك",
        message: `تم تعيين مهمة "${task.title}" لك`,
        type: "task_assigned",
      });

      res.json(updatedTask);
    } catch (error) {
      console.error("Error assigning task:", error);
      res.status(500).json({ error: "حدث خطأ أثناء تعيين المهمة" });
    }
  });

  // Start working on task
  app.patch("/api/tasks/:id/start-work", authMiddleware, requireRole(["freelancer"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ error: "المهمة غير موجودة" });
      }

      if (task.freelancerId !== req.user.userId) {
        return res.status(403).json({ error: "هذه المهمة غير معينة لك" });
      }

      if (task.status !== "assigned") {
        return res.status(400).json({ error: "لا يمكن البدء بهذه المهمة في حالتها الحالية" });
      }

      const updatedTask = await storage.updateTask(id, {
        status: "in_progress",
      });

      res.json(updatedTask);
    } catch (error) {
      console.error("Error starting task:", error);
      res.status(500).json({ error: "حدث خطأ أثناء بدء المهمة" });
    }
  });

  // Submit task with proof image
  app.patch("/api/tasks/:id/submit-proof", authMiddleware, requireRole(["freelancer"]), upload.single("proofImage"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { report } = req.body;

      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ error: "المهمة غير موجودة" });
      }

      if (task.freelancerId !== req.user.userId) {
        return res.status(403).json({ error: "هذه المهمة غير معينة لك" });
      }

      if (task.status !== "in_progress") {
        return res.status(400).json({ error: "يجب أن تكون المهمة قيد التنفيذ للتسليم" });
      }

      let proofImagePath: string | null = null;
      
      // Handle proof image upload if provided
      if (req.file) {
        const uploadDir = join(process.cwd(), "uploads", "task-proofs");
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true });
        }

        const filename = `proof-${id}-${Date.now()}.${req.file.originalname.split('.').pop()}`;
        const filepath = join(uploadDir, filename);
        await writeFile(filepath, req.file.buffer);
        proofImagePath = `/uploads/task-proofs/${filename}`;
      }

      const updatedTask = await storage.updateTask(id, {
        status: "submitted",
        proofImage: proofImagePath,
        report: report || "",
      });

      // Notify group leader
      if (task.groupId) {
        const group = await storage.getGroup(task.groupId);
        if (group) {
          await storage.createNotification({
            userId: group.leaderId,
            userType: "freelancer",
            title: "تم تسليم مهمة للمراجعة",
            message: `تم تسليم مهمة "${task.title}" من قبل أحد الأعضاء`,
            type: "task_submitted",
          });
        }
      }

      res.json(updatedTask);
    } catch (error) {
      console.error("Error submitting task:", error);
      res.status(500).json({ error: "حدث خطأ أثناء تسليم المهمة" });
    }
  });

  // Review and approve task (group leader only)
  app.patch("/api/tasks/:id/approve-by-leader", authMiddleware, requireRole(["freelancer"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { feedback } = req.body;

      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ error: "المهمة غير موجودة" });
      }

      if (!task.groupId) {
        return res.status(400).json({ error: "هذه المهمة غير مرتبطة بجروب" });
      }

      // Verify user is group leader
      const group = await storage.getGroup(task.groupId);
      if (!group || group.leaderId !== req.user.userId) {
        return res.status(403).json({ error: "فقط قائد الجروب يمكنه الموافقة على المهام" });
      }

      if (task.status !== "submitted") {
        return res.status(400).json({ error: "لا يمكن الموافقة على هذه المهمة في حالتها الحالية" });
      }

      const updatedTask = await storage.updateTask(id, {
        status: "approved",
        feedback: feedback || "تمت الموافقة",
      });

      // Update freelancer earnings with net reward (after platform fee)
      if (task.freelancerId && task.netReward) {
        const freelancer = await storage.getFreelancer(task.freelancerId);
        if (freelancer) {
          const currentEarnings = parseFloat(freelancer.totalEarnings || "0");
          const netReward = parseFloat(task.netReward);
          const newEarnings = (currentEarnings + netReward).toFixed(2);
          
          await storage.updateFreelancerEarnings(task.freelancerId, newEarnings);
        }
      }

      // Notify freelancer
      if (task.freelancerId) {
        const netAmount = task.netReward || (parseFloat(task.reward) - parseFloat(task.platformFee || "0")).toFixed(2);
        await storage.createNotification({
          userId: task.freelancerId,
          userType: "freelancer",
          title: "تمت الموافقة على مهمتك",
          message: `تمت الموافقة على مهمة "${task.title}". تمت إضافة $${netAmount} إلى رصيدك (بعد خصم رسوم المنصة 10%)`,
          type: "task_approved_by_leader",
        });
      }

      res.json(updatedTask);
    } catch (error) {
      console.error("Error approving task:", error);
      res.status(500).json({ error: "حدث خطأ أثناء الموافقة على المهمة" });
    }
  });

  // Reject task and request rework (group leader only)
  app.patch("/api/tasks/:id/reject-by-leader", authMiddleware, requireRole(["freelancer"]), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { feedback } = req.body;

      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      if (!feedback || !feedback.trim()) {
        return res.status(400).json({ error: "يجب تقديم سبب الرفض" });
      }

      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ error: "المهمة غير موجودة" });
      }

      if (!task.groupId) {
        return res.status(400).json({ error: "هذه المهمة غير مرتبطة بجروب" });
      }

      // Verify user is group leader
      const group = await storage.getGroup(task.groupId);
      if (!group || group.leaderId !== req.user.userId) {
        return res.status(403).json({ error: "فقط قائد الجروب يمكنه رفض المهام" });
      }

      if (task.status !== "submitted") {
        return res.status(400).json({ error: "لا يمكن رفض هذه المهمة في حالتها الحالية" });
      }

      const updatedTask = await storage.updateTask(id, {
        status: "in_progress", // Return to in_progress for rework
        feedback: feedback.trim(),
      });

      // Notify freelancer
      if (task.freelancerId) {
        await storage.createNotification({
          userId: task.freelancerId,
          userType: "freelancer",
          title: "تم رفض المهمة",
          message: `تم رفض مهمة "${task.title}". يرجى مراجعة الملاحظات وإعادة التسليم`,
          type: "task_rejected_by_leader",
        });
      }

      res.json(updatedTask);
    } catch (error) {
      console.error("Error rejecting task:", error);
      res.status(500).json({ error: "حدث خطأ أثناء رفض المهمة" });
    }
  });

  // Get tasks for group (leader and members)
  app.get("/api/groups/:groupId/tasks", authMiddleware, requireRole(["freelancer"]), async (req: AuthRequest, res) => {
    try {
      const { groupId } = req.params;

      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      // Verify user is member of the group
      const isMember = await storage.isGroupMember(groupId, req.user.userId);
      if (!isMember) {
        return res.status(403).json({ error: "ليس لديك صلاحية لعرض مهام هذا الجروب" });
      }

      const tasks = await storage.getTasksByGroup(groupId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching group tasks:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب المهام" });
    }
  });

  // ============================================
  // MESSAGES ROUTES - الرسائل الداخلية
  // ============================================

  // Send a message to group
  app.post("/api/groups/:groupId/messages", authMiddleware, requireRole(["freelancer"]), async (req: AuthRequest, res) => {
    try {
      const { groupId } = req.params;
      const { content, type, relatedProjectId } = req.body;

      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      if (!content || !content.trim()) {
        return res.status(400).json({ error: "محتوى الرسالة مطلوب" });
      }

      // Verify user is member of the group
      const isMember = await storage.isGroupMember(groupId, req.user.userId);
      if (!isMember) {
        return res.status(403).json({ error: "يجب أن تكون عضواً في الجروب لإرسال رسالة" });
      }

      const message = await storage.sendMessage({
        groupId,
        senderId: req.user.userId,
        content: content.trim(),
        type: type || "text",
        relatedProjectId: relatedProjectId || null,
      });

      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "حدث خطأ أثناء إرسال الرسالة" });
    }
  });

  // Get messages for a group
  app.get("/api/groups/:groupId/messages", authMiddleware, requireRole(["freelancer"]), async (req: AuthRequest, res) => {
    try {
      const { groupId } = req.params;

      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      // Verify user is member of the group
      const isMember = await storage.isGroupMember(groupId, req.user.userId);
      if (!isMember) {
        return res.status(403).json({ error: "ليس لديك صلاحية لعرض رسائل هذا الجروب" });
      }

      const messages = await storage.getGroupMessages(groupId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب الرسائل" });
    }
  });

  // Mark messages as read
  app.patch("/api/messages/:id/read", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      const message = await storage.markMessageAsRead(id);
      res.json(message);
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ error: "حدث خطأ أثناء تحديث الرسالة" });
    }
  });

  // ============================================
  // WITHDRAWALS ROUTES - طلبات السحب
  // ============================================

  // Create withdrawal request
  app.post("/api/withdrawals", authMiddleware, requireRole(["freelancer"]), async (req: AuthRequest, res) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      const { amount, paymentMethod, accountNumber } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "المبلغ غير صحيح" });
      }

      if (!paymentMethod || !accountNumber) {
        return res.status(400).json({ error: "طريقة الدفع ورقم الحساب مطلوبان" });
      }

      // Get freelancer wallet balance
      const freelancer = await storage.getFreelancer(req.user.userId);
      if (!freelancer) {
        return res.status(404).json({ error: "المستقل غير موجود" });
      }

      if (parseFloat(freelancer.walletBalance) < amount) {
        return res.status(400).json({ error: "الرصيد غير كافٍ" });
      }

      const withdrawal = await storage.createWithdrawal({
        freelancerId: req.user.userId,
        amount: amount.toString(),
        paymentMethod,
        accountNumber,
        status: "pending",
      });

      // Create notification for freelancer
      await storage.createNotification({
        userId: req.user.userId,
        userType: "freelancer",
        title: "طلب سحب جديد",
        message: `تم إنشاء طلب سحب بقيمة ${amount} ر.س. سيتم مراجعة الطلب قريباً`,
        type: "withdrawal_created",
      });

      res.status(201).json(withdrawal);
    } catch (error) {
      console.error("Error creating withdrawal:", error);
      res.status(500).json({ error: "حدث خطأ أثناء إنشاء طلب السحب" });
    }
  });

  // Get withdrawal requests for current freelancer
  app.get("/api/withdrawals/my", authMiddleware, requireRole(["freelancer"]), async (req: AuthRequest, res) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      const withdrawals = await storage.getWithdrawalsByFreelancer(req.user.userId);
      res.json(withdrawals);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب طلبات السحب" });
    }
  });

  // ============================================
  // WALLET ROUTES - المحفظة
  // ============================================

  // Get wallet for current freelancer
  app.get("/api/wallet", authMiddleware, requireRole(["freelancer"]), async (req: AuthRequest, res) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      const wallet = await storage.getWalletByFreelancer(req.user.userId);
      if (!wallet) {
        return res.status(404).json({ error: "المحفظة غير موجودة" });
      }

      res.json(wallet);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب المحفظة" });
    }
  });

  // ============================================
  // NOTIFICATIONS ROUTES - الإشعارات
  // ============================================

  // Get notifications for current user
  app.get("/api/notifications", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (!req.user?.userId || !req.user?.userType) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      const notifications = await storage.getUserNotifications(req.user.userId, req.user.userType);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب الإشعارات" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:id/read", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      if (!req.user?.userId) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      const notification = await storage.getNotification(id);
      if (!notification) {
        return res.status(404).json({ error: "الإشعار غير موجود" });
      }

      // Verify ownership
      if (notification.userId !== req.user.userId) {
        return res.status(403).json({ error: "ليس لديك صلاحية لتحديث هذا الإشعار" });
      }

      const updated = await storage.markNotificationAsRead(id);
      res.json(updated);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "حدث خطأ أثناء تحديث الإشعار" });
    }
  });

  // Mark all notifications as read
  app.patch("/api/notifications/mark-all-read", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (!req.user?.userId || !req.user?.userType) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      await storage.markAllNotificationsAsRead(req.user.userId, req.user.userType);
      res.json({ message: "تم تحديد جميع الإشعارات كمقروءة" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ error: "حدث خطأ أثناء تحديث الإشعارات" });
    }
  });

  // Get unread notification count
  app.get("/api/notifications/unread/count", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (!req.user?.userId || !req.user?.userType) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      const count = await storage.getUnreadNotificationCount(req.user.userId, req.user.userType);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب عدد الإشعارات" });
    }
  });

  // ============================================
  // ORDERS MANAGEMENT
  // ============================================

  // Create new order
  app.post("/api/orders", authMiddleware, requireRole(["product_owner"]), async (req: AuthRequest, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      
      // Get group info to know member count
      const group = await storage.getGroupById(validatedData.groupId);
      if (!group) {
        return res.status(404).json({ error: "الجروب غير موجود" });
      }
      
      // Calculate commission distribution:
      // 1. Platform fee (10% of total)
      const totalAmount = parseFloat(validatedData.totalAmount.toString());
      const platformFee = (totalAmount * 0.10).toFixed(2);
      const netAmount = (totalAmount - parseFloat(platformFee)).toFixed(2);
      
      // 2. Leader commission (3% of net amount)
      const leaderCommission = (parseFloat(netAmount) * 0.03).toFixed(2);
      
      // 3. Member distribution (net amount - leader commission)
      const memberDistribution = (parseFloat(netAmount) - parseFloat(leaderCommission)).toFixed(2);
      
      // 4. Per member amount (member distribution / group members count)
      const groupMembersCount = group.currentMembers || 1; // Prevent division by zero
      const perMemberAmount = (parseFloat(memberDistribution) / groupMembersCount).toFixed(2);
      
      const order = await storage.createOrder({
        ...validatedData,
        productOwnerId: req.user!.userId,
        platformFee,
        netAmount,
        leaderCommission,
        memberDistribution,
        groupMembersCount,
        perMemberAmount,
      });

      // Create notification for group leader
      await storage.createNotification({
        userId: group.leaderId,
        userType: "freelancer",
        title: "طلب خدمة جديد",
        message: `لديك طلب خدمة جديد بقيمة $${totalAmount}. صافي الجروب: $${netAmount}، عمولتك: $${leaderCommission}، للأعضاء: $${memberDistribution}`,
        type: "order_created",
      });

      res.status(201).json(order);
    } catch (error: any) {
      console.error("Error creating order:", error);
      res.status(400).json({ error: error.message || "فشل في إنشاء الطلب" });
    }
  });

  // Get all orders (filtered by user role)
  app.get("/api/orders", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { userId, userType } = req.user!;
      
      let orders;
      if (userType === "product_owner") {
        orders = await storage.getOrdersByProductOwner(userId);
      } else if (userType === "freelancer") {
        // Get orders for groups led by this freelancer
        orders = await storage.getOrdersByGroupLeader(userId);
      } else {
        orders = [];
      }

      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب الطلبات" });
    }
  });

  // Get specific order
  app.get("/api/orders/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const order = await storage.getOrderById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ error: "الطلب غير موجود" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب الطلب" });
    }
  });

  // Update order status
  app.patch("/api/orders/:id/status", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: "الحالة مطلوبة" });
      }

      const order = await storage.updateOrderStatus(req.params.id, status);
      
      if (!order) {
        return res.status(404).json({ error: "الطلب غير موجود" });
      }

      // Create notifications based on status
      if (status === "payment_confirmed") {
        // Notify group leader
        const group = await storage.getGroup(order.groupId);
        if (group) {
          await storage.createNotification({
            userId: group.leaderId,
            userType: "freelancer",
            title: "تم تأكيد الدفع",
            message: `تم تأكيد دفع الطلب بقيمة $${order.totalAmount}. يمكنك الآن البدء في التنفيذ`,
            type: "payment_confirmed",
          });
        }

        // Notify product owner
        await storage.createNotification({
          userId: order.productOwnerId,
          userType: "product_owner",
          title: "تم تأكيد الدفع",
          message: `تم تأكيد دفع طلبك بقيمة $${order.totalAmount}`,
          type: "payment_confirmed",
        });
      } else if (status === "in_progress") {
        // Notify product owner
        await storage.createNotification({
          userId: order.productOwnerId,
          userType: "product_owner",
          title: "الطلب قيد التنفيذ",
          message: `بدأ الفريق بتنفيذ طلبك`,
          type: "order_in_progress",
        });

        // Notify group leader (freelancer)
        const group = await storage.getGroup(order.groupId);
        if (group) {
          await storage.createNotification({
            userId: group.leaderId,
            userType: "freelancer",
            title: "طلب قيد التنفيذ",
            message: `تم تحويل الطلب بقيمة $${order.totalAmount} إلى حالة "قيد التنفيذ"`,
            type: "order_in_progress",
          });
        }
      } else if (status === "completed") {
        // Notify product owner
        await storage.createNotification({
          userId: order.productOwnerId,
          userType: "product_owner",
          title: "تم إكمال الطلب",
          message: `تم إكمال طلبك بنجاح`,
          type: "order_completed",
        });

        // Notify group leader
        const group = await storage.getGroup(order.groupId);
        if (group) {
          await storage.createNotification({
            userId: group.leaderId,
            userType: "freelancer",
            title: "تم إكمال الطلب",
            message: `تم إكمال الطلب بنجاح بقيمة $${order.totalAmount}`,
            type: "order_completed",
          });
        }
      }

      res.json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ error: "حدث خطأ أثناء تحديث الطلب" });
    }
  });

  // ============================================
  // CONVERSATION ROUTES
  // ============================================

  // Get or create conversation
  app.post("/api/conversations", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { groupId } = req.body;

      if (!groupId) {
        return res.status(400).json({ error: "معرف الجروب مطلوب" });
      }

      // Get group to find leader
      const group = await storage.getGroup(groupId);
      if (!group) {
        return res.status(404).json({ error: "الجروب غير موجود" });
      }

      const productOwnerId = req.user!.userId;
      const conversation = await storage.getOrCreateConversation(productOwnerId, groupId, group.leaderId);

      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "حدث خطأ أثناء إنشاء المحادثة" });
    }
  });

  // Get all conversations for current user
  app.get("/api/conversations", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const userType = req.user!.userType;
      const userId = req.user!.userId;

      let conversations;
      if (userType === "product_owner") {
        conversations = await storage.getProductOwnerConversations(userId);
      } else if (userType === "freelancer") {
        conversations = await storage.getFreelancerConversations(userId);
      } else {
        return res.status(400).json({ error: "نوع المستخدم غير صحيح" });
      }

      // Fetch group details for each conversation
      const conversationsWithDetails = await Promise.all(
        conversations.map(async (conv) => {
          const group = await storage.getGroup(conv.groupId);
          const leader = await storage.getFreelancer(conv.leaderId);
          const productOwner = await storage.getProductOwner(conv.productOwnerId);
          
          return {
            ...conv,
            group,
            leader,
            productOwner,
          };
        })
      );

      res.json(conversationsWithDetails);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب المحادثات" });
    }
  });

  // Get conversation messages
  app.get("/api/conversations/:id/messages", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const conversationId = req.params.id;

      // Verify user has access to this conversation
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "المحادثة غير موجودة" });
      }

      const userId = req.user!.userId;
      const userType = req.user!.userType;

      // Check if user is part of conversation
      if (userType === "product_owner" && conversation.productOwnerId !== userId) {
        return res.status(403).json({ error: "غير مصرح بالوصول لهذه المحادثة" });
      }
      if (userType === "freelancer" && conversation.leaderId !== userId) {
        return res.status(403).json({ error: "غير مصرح بالوصول لهذه المحادثة" });
      }

      const messages = await storage.getConversationMessages(conversationId);

      // Mark messages as read
      await storage.markMessagesAsRead(conversationId, userId);

      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب الرسائل" });
    }
  });

  // Send message
  app.post("/api/conversations/:id/messages", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const conversationId = req.params.id;
      const { content } = req.body;

      if (!content || content.trim() === "") {
        return res.status(400).json({ error: "محتوى الرسالة مطلوب" });
      }

      // Verify user has access to this conversation
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "المحادثة غير موجودة" });
      }

      const userId = req.user!.userId;
      const userType = req.user!.userType;

      // Check if user is part of conversation
      if (userType === "product_owner" && conversation.productOwnerId !== userId) {
        return res.status(403).json({ error: "غير مصرح بالوصول لهذه المحادثة" });
      }
      if (userType === "freelancer" && conversation.leaderId !== userId) {
        return res.status(403).json({ error: "غير مصرح بالوصول لهذه المحادثة" });
      }

      const message = await storage.sendMessage(conversationId, userId, userType, content);

      // Create notification for the recipient
      const recipientId = userType === "product_owner" ? conversation.leaderId : conversation.productOwnerId;
      const recipientType = userType === "product_owner" ? "freelancer" : "product_owner";
      
      await storage.createNotification({
        userId: recipientId,
        userType: recipientType,
        title: "رسالة جديدة",
        message: `لديك رسالة جديدة في المحادثة`,
        type: "new_message",
      });

      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "حدث خطأ أثناء إرسال الرسالة" });
    }
  });

  // ============================================
  // GROUP POSTS ROUTES (Community Feature)
  // ============================================

  // Get posts by group (with optional filtering and sorting)
  app.get("/api/groups/:groupId/posts", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { groupId } = req.params;
      const { sort, mediaOnly } = req.query;
      const userId = req.user!.userId;

      // Verify user is a group member or leader
      const group = await storage.getGroup(groupId);
      if (!group) {
        return res.status(404).json({ error: "المجموعة غير موجودة" });
      }

      const isMember = await storage.isGroupMember(groupId, userId);
      const isLeader = group.leaderId === userId;

      if (!isMember && !isLeader) {
        return res.status(403).json({ error: "يجب أن تكون عضواً في المجموعة" });
      }

      let posts = await storage.getPostsByGroup(groupId);
      
      // Filter media-only posts if requested
      if (mediaOnly === 'true') {
        posts = posts.filter(post => post.imageUrl);
      }
      
      // Sort posts if requested
      if (sort === 'popular') {
        posts = posts.sort((a, b) => {
          const scoreA = (a.likesCount || 0) + (a.commentsCount || 0);
          const scoreB = (b.likesCount || 0) + (b.commentsCount || 0);
          return scoreB - scoreA;
        });
      }
      
      res.json(posts);
    } catch (error) {
      console.error("Error fetching group posts:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب المنشورات" });
    }
  });

  // Create post
  app.post("/api/groups/:groupId/posts", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { groupId } = req.params;
      const { content, imageUrl } = req.body;
      const userId = req.user!.userId;

      // Validate content
      if (!content || content.trim() === "") {
        return res.status(400).json({ error: "محتوى المنشور مطلوب" });
      }

      // Verify user is a group member or leader
      const group = await storage.getGroup(groupId);
      if (!group) {
        return res.status(404).json({ error: "المجموعة غير موجودة" });
      }

      const isMember = await storage.isGroupMember(groupId, userId);
      const isLeader = group.leaderId === userId;

      if (!isMember && !isLeader) {
        return res.status(403).json({ error: "يجب أن تكون عضواً في المجموعة" });
      }

      const newPost = await storage.createPost({
        groupId,
        authorId: userId,
        content: content.trim(),
        imageUrl: imageUrl || null,
      });

      res.status(201).json(newPost);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ error: "حدث خطأ أثناء إنشاء المنشور" });
    }
  });

  // Delete post
  app.delete("/api/posts/:postId", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { postId } = req.params;
      const userId = req.user!.userId;

      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ error: "المنشور غير موجود" });
      }

      // Only author or group leader can delete
      const group = await storage.getGroup(post.groupId);
      if (post.authorId !== userId && group?.leaderId !== userId) {
        return res.status(403).json({ error: "غير مصرح لك بحذف هذا المنشور" });
      }

      await storage.deletePost(postId);
      res.json({ message: "تم حذف المنشور بنجاح" });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ error: "حدث خطأ أثناء حذف المنشور" });
    }
  });

  // Get comments for a post
  app.get("/api/posts/:postId/comments", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { postId } = req.params;
      const userId = req.user!.userId;

      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ error: "المنشور غير موجود" });
      }

      // Verify user is a group member
      const isMember = await storage.isGroupMember(post.groupId, userId);
      const group = await storage.getGroup(post.groupId);
      const isLeader = group?.leaderId === userId;

      if (!isMember && !isLeader) {
        return res.status(403).json({ error: "يجب أن تكون عضواً في المجموعة" });
      }

      const comments = await storage.getCommentsByPost(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب التعليقات" });
    }
  });

  // Create comment
  app.post("/api/posts/:postId/comments", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { postId } = req.params;
      const { content, imageUrl } = req.body;
      const userId = req.user!.userId;

      if (!content || content.trim() === "") {
        return res.status(400).json({ error: "محتوى التعليق مطلوب" });
      }

      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ error: "المنشور غير موجود" });
      }

      // Verify user is a group member
      const isMember = await storage.isGroupMember(post.groupId, userId);
      const group = await storage.getGroup(post.groupId);
      const isLeader = group?.leaderId === userId;

      if (!isMember && !isLeader) {
        return res.status(403).json({ error: "يجب أن تكون عضواً في المجموعة" });
      }

      const newComment = await storage.createComment({
        postId,
        authorId: userId,
        content: content.trim(),
        imageUrl: imageUrl || null,
      });

      res.status(201).json(newComment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ error: "حدث خطأ أثناء إنشاء التعليق" });
    }
  });

  // Delete comment
  app.delete("/api/comments/:commentId", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { commentId } = req.params;
      const userId = req.user!.userId;

      const [comment] = await db.select().from(postComments).where(eq(postComments.id, commentId));
      
      if (!comment) {
        return res.status(404).json({ error: "التعليق غير موجود" });
      }

      const post = await storage.getPost(comment.postId);
      if (!post) {
        return res.status(404).json({ error: "المنشور غير موجود" });
      }

      // Only author or group leader can delete
      const group = await storage.getGroup(post.groupId);
      if (comment.authorId !== userId && group?.leaderId !== userId) {
        return res.status(403).json({ error: "غير مصرح لك بحذف هذا التعليق" });
      }

      await storage.deleteComment(commentId);
      res.json({ message: "تم حذف التعليق بنجاح" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ error: "حدث خطأ أثناء حذف التعليق" });
    }
  });

  // Get reactions for a post
  app.get("/api/posts/:postId/reactions", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { postId } = req.params;
      const userId = req.user!.userId;

      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ error: "المنشور غير موجود" });
      }

      const reactions = await storage.getReactionsByPost(postId);
      const userReaction = await storage.getUserReaction(postId, userId);

      res.json({ reactions, userReaction });
    } catch (error) {
      console.error("Error fetching reactions:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب التفاعلات" });
    }
  });

  // Toggle reaction (like/unlike)
  app.post("/api/posts/:postId/reactions", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { postId } = req.params;
      const { type = "like" } = req.body;
      const userId = req.user!.userId;

      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ error: "المنشور غير موجود" });
      }

      // Verify user is a group member
      const isMember = await storage.isGroupMember(post.groupId, userId);
      const group = await storage.getGroup(post.groupId);
      const isLeader = group?.leaderId === userId;

      if (!isMember && !isLeader) {
        return res.status(403).json({ error: "يجب أن تكون عضواً في المجموعة" });
      }

      // Check if user already reacted
      const existingReaction = await storage.getUserReaction(postId, userId);

      if (existingReaction) {
        // Remove reaction (unlike)
        await storage.deleteReaction(postId, userId);
        res.json({ message: "تم إلغاء الإعجاب", liked: false });
      } else {
        // Add reaction (like)
        await storage.createReaction({
          postId,
          userId,
          type,
        });
        res.json({ message: "تم الإعجاب بالمنشور", liked: true });
      }
    } catch (error) {
      console.error("Error toggling reaction:", error);
      res.status(500).json({ error: "حدث خطأ أثناء التفاعل مع المنشور" });
    }
  });

  // ============================================
  // ADMIN DASHBOARD ROUTES
  // ============================================

  // Admin Login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" });
      }

      const { adminUsers, roles } = await import("@shared/schema");
      
      // Find admin user
      const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
      
      if (!admin) {
        return res.status(401).json({ error: "بيانات تسجيل الدخول غير صحيحة" });
      }

      if (!admin.isActive) {
        return res.status(403).json({ error: "الحساب غير نشط" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "بيانات تسجيل الدخول غير صحيحة" });
      }

      // Get role
      const [role] = await db.select().from(roles).where(eq(roles.id, admin.roleId));

      // Update last login
      await db.update(adminUsers)
        .set({ lastLogin: new Date() })
        .where(eq(adminUsers.id, admin.id));

      // Generate token
      const token = generateToken({
        userId: admin.id,
        userType: "admin",
        email: admin.email,
        roleId: admin.roleId,
      });

      // Set HttpOnly cookie for security
      res.cookie("adminToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      const { password: _, ...adminWithoutPassword } = admin;

      res.json({
        user: { ...adminWithoutPassword, role },
        message: "تم تسجيل الدخول بنجاح",
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ error: "حدث خطأ أثناء تسجيل الدخول" });
    }
  });

  // Admin Logout
  app.post("/api/admin/logout", adminAuthMiddleware, (req, res) => {
    // Clear the admin token cookie
    res.clearCookie("adminToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.json({ message: "تم تسجيل الخروج بنجاح" });
  });

  // Get current admin user info
  app.get("/api/admin/me", adminAuthMiddleware, async (req, res) => {
    try {
      const { adminUsers, roles, permissions, rolePermissions } = await import("@shared/schema");
      
      const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, req.user!.userId));
      if (!admin) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }

      const [role] = await db.select().from(roles).where(eq(roles.id, admin.roleId));

      // Get user permissions
      const userPermissions = await db
        .select({
          id: permissions.id,
          name: permissions.name,
          nameAr: permissions.nameAr,
          resource: permissions.resource,
          action: permissions.action,
        })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(rolePermissions.roleId, admin.roleId));

      const { password: _, ...adminWithoutPassword } = admin;

      res.json({
        ...adminWithoutPassword,
        role,
        permissions: userPermissions,
      });
    } catch (error) {
      console.error("Error fetching admin user:", error);
      res.status(500).json({ error: "حدث خطأ في جلب بيانات المستخدم" });
    }
  });

  // Get all admin users
  app.get("/api/admin/users", adminAuthMiddleware, requirePermission("admin_users:view"), async (req, res) => {
    try {
      const { adminUsers, roles } = await import("@shared/schema");
      
      const users = await db
        .select({
          id: adminUsers.id,
          email: adminUsers.email,
          fullName: adminUsers.fullName,
          phone: adminUsers.phone,
          roleId: adminUsers.roleId,
          isActive: adminUsers.isActive,
          lastLogin: adminUsers.lastLogin,
          createdAt: adminUsers.createdAt,
          roleName: roles.name,
          roleNameAr: roles.nameAr,
        })
        .from(adminUsers)
        .leftJoin(roles, eq(adminUsers.roleId, roles.id));

      res.json(users);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ error: "حدث خطأ في جلب المستخدمين" });
    }
  });

  // Create new admin user
  app.post("/api/admin/users", adminAuthMiddleware, requirePermission("admin_users:create"), async (req, res) => {
    try {
      const { adminUsers, insertAdminUserSchema } = await import("@shared/schema");
      const validatedData = insertAdminUserSchema.parse(req.body);

      // Check if email exists
      const [existing] = await db.select().from(adminUsers).where(eq(adminUsers.email, validatedData.email));
      if (existing) {
        return res.status(400).json({ error: "البريد الإلكتروني مستخدم بالفعل" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      const [newAdmin] = await db.insert(adminUsers).values({
        ...validatedData,
        password: hashedPassword,
      }).returning();

      const { password: _, ...adminWithoutPassword } = newAdmin;

      res.status(201).json({
        user: adminWithoutPassword,
        message: "تم إنشاء المستخدم بنجاح",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating admin user:", error);
      res.status(500).json({ error: "حدث خطأ في إنشاء المستخدم" });
    }
  });

  // Update admin user
  app.patch("/api/admin/users/:id", adminAuthMiddleware, requirePermission("admin_users:edit"), async (req, res) => {
    try {
      const { id } = req.params;
      const { adminUsers } = await import("@shared/schema");

      const { password, ...updateData } = req.body;

      // If password is being updated, hash it
      const dataToUpdate: any = updateData;
      if (password) {
        dataToUpdate.password = await bcrypt.hash(password, 10);
      }

      const [updated] = await db.update(adminUsers)
        .set({ ...dataToUpdate, updatedAt: new Date() })
        .where(eq(adminUsers.id, id))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }

      const { password: _, ...adminWithoutPassword } = updated;

      res.json({
        user: adminWithoutPassword,
        message: "تم تحديث المستخدم بنجاح",
      });
    } catch (error) {
      console.error("Error updating admin user:", error);
      res.status(500).json({ error: "حدث خطأ في تحديث المستخدم" });
    }
  });

  // Delete admin user
  app.delete("/api/admin/users/:id", adminAuthMiddleware, requirePermission("admin_users:delete"), async (req, res) => {
    try {
      const { id } = req.params;
      const { adminUsers } = await import("@shared/schema");

      // Prevent deleting yourself
      if (id === req.user!.userId) {
        return res.status(400).json({ error: "لا يمكنك حذف حسابك الخاص" });
      }

      await db.delete(adminUsers).where(eq(adminUsers.id, id));

      res.json({ message: "تم حذف المستخدم بنجاح" });
    } catch (error) {
      console.error("Error deleting admin user:", error);
      res.status(500).json({ error: "حدث خطأ في حذف المستخدم" });
    }
  });

  // Get all roles
  app.get("/api/admin/roles", adminAuthMiddleware, requirePermission("roles:view"), async (req, res) => {
    try {
      const { roles } = await import("@shared/schema");
      
      const allRoles = await db.select().from(roles);

      res.json(allRoles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ error: "حدث خطأ في جلب الأدوار" });
    }
  });

  // Get role with permissions
  app.get("/api/admin/roles/:id", adminAuthMiddleware, requirePermission("roles:view"), async (req, res) => {
    try {
      const { id } = req.params;
      const { roles, permissions, rolePermissions } = await import("@shared/schema");

      const [role] = await db.select().from(roles).where(eq(roles.id, id));
      
      if (!role) {
        return res.status(404).json({ error: "الدور غير موجود" });
      }

      const rolePerms = await db
        .select({
          id: permissions.id,
          name: permissions.name,
          nameAr: permissions.nameAr,
          resource: permissions.resource,
          action: permissions.action,
          description: permissions.description,
        })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(rolePermissions.roleId, id));

      res.json({
        ...role,
        permissions: rolePerms,
      });
    } catch (error) {
      console.error("Error fetching role:", error);
      res.status(500).json({ error: "حدث خطأ في جلب الدور" });
    }
  });

  // Get all permissions
  app.get("/api/admin/permissions", adminAuthMiddleware, requirePermission("roles:view"), async (req, res) => {
    try {
      const { permissions } = await import("@shared/schema");
      
      const allPermissions = await db.select().from(permissions);

      res.json(allPermissions);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      res.status(500).json({ error: "حدث خطأ في جلب الصلاحيات" });
    }
  });

  // Admin Dashboard Statistics
  app.get("/api/admin/statistics", adminAuthMiddleware, async (req, res) => {
    try {
      const { freelancers, productOwners, groups, projects, orders, tasks, withdrawals } = await import("@shared/schema");
      const { sql } = await import("drizzle-orm");

      // Get counts
      const [freelancersCount] = await db.select({ count: sql<number>`count(*)::int` }).from(freelancers);
      const [productOwnersCount] = await db.select({ count: sql<number>`count(*)::int` }).from(productOwners);
      const [groupsCount] = await db.select({ count: sql<number>`count(*)::int` }).from(groups);
      const [projectsCount] = await db.select({ count: sql<number>`count(*)::int` }).from(projects);
      const [ordersCount] = await db.select({ count: sql<number>`count(*)::int` }).from(orders);
      const [tasksCount] = await db.select({ count: sql<number>`count(*)::int` }).from(tasks);
      const [withdrawalsCount] = await db.select({ count: sql<number>`count(*)::int` }).from(withdrawals);

      // Get pending withdrawals
      const [pendingWithdrawals] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(withdrawals)
        .where(eq(withdrawals.status, "pending"));

      // Get total revenue (sum of platform fees from orders)
      const [revenue] = await db
        .select({ total: sql<number>`COALESCE(SUM(platform_fee), 0)::numeric` })
        .from(orders);

      res.json({
        freelancers: freelancersCount.count,
        productOwners: productOwnersCount.count,
        groups: groupsCount.count,
        projects: projectsCount.count,
        orders: ordersCount.count,
        tasks: tasksCount.count,
        withdrawals: withdrawalsCount.count,
        pendingWithdrawals: pendingWithdrawals.count,
        totalRevenue: Number(revenue.total),
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ error: "حدث خطأ في جلب الإحصائيات" });
    }
  });

  // ============================================
  // FREELANCERS MANAGEMENT (ADMIN)
  // ============================================

  // Get all freelancers
  app.get("/api/admin/freelancers", adminAuthMiddleware, requirePermission("freelancers:view"), async (req, res) => {
    try {
      const { freelancers, users } = await import("@shared/schema");
      
      const allFreelancers = await db
        .select({
          id: freelancers.id,
          userId: freelancers.userId,
          fullName: freelancers.fullName,
          email: users.email,
          country: freelancers.country,
          rating: freelancers.rating,
          totalEarnings: freelancers.totalEarnings,
          availableBalance: freelancers.availableBalance,
          pendingBalance: freelancers.pendingBalance,
          tasksCompleted: freelancers.tasksCompleted,
          isActive: freelancers.isActive,
          createdAt: freelancers.createdAt,
        })
        .from(freelancers)
        .leftJoin(users, eq(freelancers.userId, users.id));

      res.json(allFreelancers);
    } catch (error) {
      console.error("Error fetching freelancers:", error);
      res.status(500).json({ error: "حدث خطأ في جلب الفريلانسرز" });
    }
  });

  // Get freelancer details
  app.get("/api/admin/freelancers/:id", adminAuthMiddleware, requirePermission("freelancers:view"), async (req, res) => {
    try {
      const { id } = req.params;
      const { freelancers, users, groups, groupMembers } = await import("@shared/schema");

      const [freelancer] = await db
        .select({
          id: freelancers.id,
          userId: freelancers.userId,
          fullName: freelancers.fullName,
          email: users.email,
          country: freelancers.country,
          phoneNumber: freelancers.phoneNumber,
          profilePicture: freelancers.profilePicture,
          rating: freelancers.rating,
          totalEarnings: freelancers.totalEarnings,
          availableBalance: freelancers.availableBalance,
          pendingBalance: freelancers.pendingBalance,
          tasksCompleted: freelancers.tasksCompleted,
          isActive: freelancers.isActive,
          acceptedInstructions: freelancers.acceptedInstructions,
          createdAt: freelancers.createdAt,
        })
        .from(freelancers)
        .leftJoin(users, eq(freelancers.userId, users.id))
        .where(eq(freelancers.id, id));

      if (!freelancer) {
        return res.status(404).json({ error: "الفريلانسر غير موجود" });
      }

      // Get groups this freelancer is in
      const freelancerGroups = await db
        .select({
          id: groups.id,
          name: groups.name,
          leaderId: groups.leaderId,
          memberCount: groups.memberCount,
        })
        .from(groupMembers)
        .innerJoin(groups, eq(groupMembers.groupId, groups.id))
        .where(eq(groupMembers.freelancerId, id));

      res.json({
        ...freelancer,
        groups: freelancerGroups,
      });
    } catch (error) {
      console.error("Error fetching freelancer:", error);
      res.status(500).json({ error: "حدث خطأ في جلب بيانات الفريلانسر" });
    }
  });

  // Toggle freelancer active status
  app.patch("/api/admin/freelancers/:id/toggle-status", adminAuthMiddleware, requirePermission("freelancers:edit"), async (req, res) => {
    try {
      const { id } = req.params;
      const { freelancers } = await import("@shared/schema");

      const [freelancer] = await db.select().from(freelancers).where(eq(freelancers.id, id));
      
      if (!freelancer) {
        return res.status(404).json({ error: "الفريلانسر غير موجود" });
      }

      const [updated] = await db
        .update(freelancers)
        .set({ isActive: !freelancer.isActive })
        .where(eq(freelancers.id, id))
        .returning();

      res.json({
        freelancer: updated,
        message: `تم ${updated.isActive ? 'تفعيل' : 'إيقاف'} الحساب بنجاح`,
      });
    } catch (error) {
      console.error("Error toggling freelancer status:", error);
      res.status(500).json({ error: "حدث خطأ في تعديل حالة الفريلانسر" });
    }
  });

  // ============================================
  // PRODUCT OWNERS MANAGEMENT (ADMIN)
  // ============================================

  // Get all product owners
  app.get("/api/admin/product-owners", adminAuthMiddleware, requirePermission("product_owners:view"), async (req, res) => {
    try {
      const { productOwners, users } = await import("@shared/schema");
      
      const allProductOwners = await db
        .select({
          id: productOwners.id,
          userId: productOwners.userId,
          fullName: productOwners.fullName,
          email: users.email,
          companyName: productOwners.companyName,
          country: productOwners.country,
          totalSpent: productOwners.totalSpent,
          projectsCreated: productOwners.projectsCreated,
          ordersPlaced: productOwners.ordersPlaced,
          isActive: productOwners.isActive,
          createdAt: productOwners.createdAt,
        })
        .from(productOwners)
        .leftJoin(users, eq(productOwners.userId, users.id));

      res.json(allProductOwners);
    } catch (error) {
      console.error("Error fetching product owners:", error);
      res.status(500).json({ error: "حدث خطأ في جلب أصحاب المنتجات" });
    }
  });

  // Get product owner details
  app.get("/api/admin/product-owners/:id", adminAuthMiddleware, requirePermission("product_owners:view"), async (req, res) => {
    try {
      const { id } = req.params;
      const { productOwners, users, projects, orders } = await import("@shared/schema");

      const [productOwner] = await db
        .select({
          id: productOwners.id,
          userId: productOwners.userId,
          fullName: productOwners.fullName,
          email: users.email,
          companyName: productOwners.companyName,
          country: productOwners.country,
          phoneNumber: productOwners.phoneNumber,
          profilePicture: productOwners.profilePicture,
          totalSpent: productOwners.totalSpent,
          projectsCreated: productOwners.projectsCreated,
          ordersPlaced: productOwners.ordersPlaced,
          isActive: productOwners.isActive,
          acceptedInstructions: productOwners.acceptedInstructions,
          createdAt: productOwners.createdAt,
        })
        .from(productOwners)
        .leftJoin(users, eq(productOwners.userId, users.id))
        .where(eq(productOwners.id, id));

      if (!productOwner) {
        return res.status(404).json({ error: "صاحب المنتج غير موجود" });
      }

      // Get recent projects
      const recentProjects = await db
        .select({
          id: projects.id,
          title: projects.title,
          status: projects.status,
          totalBudget: projects.totalBudget,
          createdAt: projects.createdAt,
        })
        .from(projects)
        .where(eq(projects.productOwnerId, id))
        .limit(5);

      // Get recent orders
      const recentOrders = await db
        .select({
          id: orders.id,
          serviceType: orders.serviceType,
          status: orders.status,
          totalAmount: orders.totalAmount,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .where(eq(orders.productOwnerId, id))
        .limit(5);

      res.json({
        ...productOwner,
        recentProjects,
        recentOrders,
      });
    } catch (error) {
      console.error("Error fetching product owner:", error);
      res.status(500).json({ error: "حدث خطأ في جلب بيانات صاحب المنتج" });
    }
  });

  // Toggle product owner active status
  app.patch("/api/admin/product-owners/:id/toggle-status", adminAuthMiddleware, requirePermission("product_owners:edit"), async (req, res) => {
    try {
      const { id } = req.params;
      const { productOwners } = await import("@shared/schema");

      const [productOwner] = await db.select().from(productOwners).where(eq(productOwners.id, id));
      
      if (!productOwner) {
        return res.status(404).json({ error: "صاحب المنتج غير موجود" });
      }

      const [updated] = await db
        .update(productOwners)
        .set({ isActive: !productOwner.isActive })
        .where(eq(productOwners.id, id))
        .returning();

      res.json({
        productOwner: updated,
        message: `تم ${updated.isActive ? 'تفعيل' : 'إيقاف'} الحساب بنجاح`,
      });
    } catch (error) {
      console.error("Error toggling product owner status:", error);
      res.status(500).json({ error: "حدث خطأ في تعديل حالة صاحب المنتج" });
    }
  });

  // ============================================
  // GROUPS MANAGEMENT (ADMIN)
  // ============================================

  // Get all groups
  app.get("/api/admin/groups", adminAuthMiddleware, requirePermission("groups:view"), async (req, res) => {
    try {
      const { groups, freelancers } = await import("@shared/schema");
      
      const allGroups = await db
        .select({
          id: groups.id,
          name: groups.name,
          description: groups.description,
          leaderId: groups.leaderId,
          leaderName: freelancers.fullName,
          memberCount: groups.memberCount,
          maxMembers: groups.maxMembers,
          country: groups.country,
          projectsCompleted: groups.projectsCompleted,
          rating: groups.rating,
          isActive: groups.isActive,
          createdAt: groups.createdAt,
        })
        .from(groups)
        .leftJoin(freelancers, eq(groups.leaderId, freelancers.id));

      res.json(allGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ error: "حدث خطأ في جلب الجروبات" });
    }
  });

  // Toggle group active status
  app.patch("/api/admin/groups/:id/toggle-status", adminAuthMiddleware, requirePermission("groups:edit"), async (req, res) => {
    try {
      const { id } = req.params;
      const { groups } = await import("@shared/schema");

      const [group] = await db.select().from(groups).where(eq(groups.id, id));
      
      if (!group) {
        return res.status(404).json({ error: "الجروب غير موجود" });
      }

      const [updated] = await db
        .update(groups)
        .set({ isActive: !group.isActive })
        .where(eq(groups.id, id))
        .returning();

      res.json({
        group: updated,
        message: `تم ${updated.isActive ? 'تفعيل' : 'إيقاف'} الجروب بنجاح`,
      });
    } catch (error) {
      console.error("Error toggling group status:", error);
      res.status(500).json({ error: "حدث خطأ في تعديل حالة الجروب" });
    }
  });

  // ============================================
  // PROJECTS MANAGEMENT (ADMIN)
  // ============================================

  // Get all projects
  app.get("/api/admin/projects", adminAuthMiddleware, requirePermission("projects:view"), async (req, res) => {
    try {
      const { projects, productOwners, groups } = await import("@shared/schema");
      
      const allProjects = await db
        .select({
          id: projects.id,
          title: projects.title,
          description: projects.description,
          productOwnerId: projects.productOwnerId,
          ownerName: productOwners.fullName,
          groupId: projects.groupId,
          groupName: groups.name,
          status: projects.status,
          totalBudget: projects.totalBudget,
          platformFee: projects.platformFee,
          tasksCount: projects.tasksCount,
          completedTasksCount: projects.completedTasksCount,
          createdAt: projects.createdAt,
        })
        .from(projects)
        .leftJoin(productOwners, eq(projects.productOwnerId, productOwners.id))
        .leftJoin(groups, eq(projects.groupId, groups.id));

      res.json(allProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "حدث خطأ في جلب المشاريع" });
    }
  });

  // ============================================
  // ORDERS MANAGEMENT (ADMIN)
  // ============================================

  // Get all orders
  app.get("/api/admin/orders", adminAuthMiddleware, requirePermission("orders:view"), async (req, res) => {
    try {
      const { orders, productOwners, groups } = await import("@shared/schema");
      
      const allOrders = await db
        .select({
          id: orders.id,
          productOwnerId: orders.productOwnerId,
          ownerName: productOwners.fullName,
          groupId: orders.groupId,
          groupName: groups.name,
          serviceType: orders.serviceType,
          status: orders.status,
          totalAmount: orders.totalAmount,
          platformFee: orders.platformFee,
          leaderCommission: orders.leaderCommission,
          quantity: orders.quantity,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .leftJoin(productOwners, eq(orders.productOwnerId, productOwners.id))
        .leftJoin(groups, eq(orders.groupId, groups.id));

      res.json(allOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "حدث خطأ في جلب الطلبات" });
    }
  });

  // ============================================
  // WITHDRAWALS MANAGEMENT (ADMIN)
  // ============================================

  // Get all withdrawals
  app.get("/api/admin/withdrawals", adminAuthMiddleware, requirePermission("withdrawals:view"), async (req, res) => {
    try {
      const { withdrawals, freelancers } = await import("@shared/schema");
      
      const allWithdrawals = await db
        .select({
          id: withdrawals.id,
          freelancerId: withdrawals.freelancerId,
          freelancerName: freelancers.fullName,
          amount: withdrawals.amount,
          status: withdrawals.status,
          paymentMethod: withdrawals.paymentMethod,
          accountDetails: withdrawals.accountDetails,
          createdAt: withdrawals.createdAt,
          processedAt: withdrawals.processedAt,
        })
        .from(withdrawals)
        .leftJoin(freelancers, eq(withdrawals.freelancerId, freelancers.id));

      res.json(allWithdrawals);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      res.status(500).json({ error: "حدث خطأ في جلب طلبات السحب" });
    }
  });

  // Approve withdrawal
  app.patch("/api/admin/withdrawals/:id/approve", adminAuthMiddleware, requirePermission("withdrawals:approve"), async (req, res) => {
    try {
      const { id } = req.params;
      const { withdrawals, freelancers } = await import("@shared/schema");

      const [withdrawal] = await db.select().from(withdrawals).where(eq(withdrawals.id, id));
      
      if (!withdrawal) {
        return res.status(404).json({ error: "طلب السحب غير موجود" });
      }

      if (withdrawal.status !== "pending") {
        return res.status(400).json({ error: "طلب السحب تمت معالجته مسبقاً" });
      }

      const [updated] = await db
        .update(withdrawals)
        .set({ 
          status: "completed",
          processedAt: new Date(),
        })
        .where(eq(withdrawals.id, id))
        .returning();

      // Deduct from freelancer's available balance
      await db
        .update(freelancers)
        .set({
          availableBalance: sql`${freelancers.availableBalance} - ${withdrawal.amount}`,
        })
        .where(eq(freelancers.id, withdrawal.freelancerId));

      res.json({
        withdrawal: updated,
        message: "تم اعتماد طلب السحب بنجاح",
      });
    } catch (error) {
      console.error("Error approving withdrawal:", error);
      res.status(500).json({ error: "حدث خطأ في اعتماد طلب السحب" });
    }
  });

  // Reject withdrawal
  app.patch("/api/admin/withdrawals/:id/reject", adminAuthMiddleware, requirePermission("withdrawals:approve"), async (req, res) => {
    try {
      const { id } = req.params;
      const { withdrawals, freelancers } = await import("@shared/schema");

      const [withdrawal] = await db.select().from(withdrawals).where(eq(withdrawals.id, id));
      
      if (!withdrawal) {
        return res.status(404).json({ error: "طلب السحب غير موجود" });
      }

      if (withdrawal.status !== "pending") {
        return res.status(400).json({ error: "طلب السحب تمت معالجته مسبقاً" });
      }

      const [updated] = await db
        .update(withdrawals)
        .set({ 
          status: "rejected",
          processedAt: new Date(),
        })
        .where(eq(withdrawals.id, id))
        .returning();

      // Return amount to freelancer's available balance
      await db
        .update(freelancers)
        .set({
          availableBalance: sql`${freelancers.availableBalance} + ${withdrawal.amount}`,
        })
        .where(eq(freelancers.id, withdrawal.freelancerId));

      res.json({
        withdrawal: updated,
        message: "تم رفض طلب السحب",
      });
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);
      res.status(500).json({ error: "حدث خطأ في رفض طلب السحب" });
    }
  });

  // ============================================
  // HEALTH CHECK
  // ============================================

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Sumou API is running" });
  });

  const httpServer = createServer(app);

  return httpServer;
}
