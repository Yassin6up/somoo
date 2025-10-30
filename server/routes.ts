import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFreelancerSchema, insertProductOwnerSchema } from "@shared/schema";
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

  // Upload profile image or ID verification (protected)
  app.post("/api/upload", authMiddleware, upload.single("file"), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "لم يتم رفع أي ملف" });
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
        campaigns = await storage.getCampaignsByOwnerId(req.user.userId);
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
      const campaign = await storage.getCampaignById(id);

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
      const existingCampaign = await storage.getCampaignById(id);
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
      const existingCampaign = await storage.getCampaignById(id);
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
  // HEALTH CHECK
  // ============================================

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Sumou API is running" });
  });

  const httpServer = createServer(app);

  return httpServer;
}
