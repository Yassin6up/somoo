import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFreelancerSchema, insertProductOwnerSchema, insertCampaignSchema, type Campaign } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";
import multer from "multer";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import bcrypt from "bcrypt";
import { generateToken, authMiddleware, requireRole, type AuthRequest } from "./middleware/auth";

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

      const { type } = req.body; // 'profile' or 'verification'
      
      if (type !== "profile" && type !== "verification") {
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
  // HEALTH CHECK
  // ============================================

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Sumou API is running" });
  });

  const httpServer = createServer(app);

  return httpServer;
}
