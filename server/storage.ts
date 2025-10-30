import { 
  type User, 
  type InsertUser,
  type Freelancer,
  type InsertFreelancer,
  type ProductOwner,
  type InsertProductOwner,
  type Campaign,
  type InsertCampaign,
  type Task,
  type InsertTask,
  type Wallet,
  type InsertWallet,
  type Transaction,
  type InsertTransaction,
  type Payment,
  type InsertPayment,
  type Notification,
  type InsertNotification,
  users,
  freelancers,
  productOwners,
  campaigns,
  tasks,
  wallets,
  transactions,
  payments,
  notifications,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Legacy user methods (for compatibility)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Freelancer methods
  getFreelancer(id: string): Promise<Freelancer | undefined>;
  getFreelancerByEmail(email: string): Promise<Freelancer | undefined>;
  getFreelancerByUsername(username: string): Promise<Freelancer | undefined>;
  createFreelancer(freelancer: InsertFreelancer): Promise<Freelancer>;
  updateFreelancer(id: string, updates: Partial<Freelancer>): Promise<Freelancer | undefined>;
  getAllFreelancers(): Promise<Freelancer[]>;

  // Product Owner methods
  getProductOwner(id: string): Promise<ProductOwner | undefined>;
  getProductOwnerByEmail(email: string): Promise<ProductOwner | undefined>;
  createProductOwner(owner: InsertProductOwner): Promise<ProductOwner>;
  updateProductOwner(id: string, updates: Partial<ProductOwner>): Promise<ProductOwner | undefined>;
  getAllProductOwners(): Promise<ProductOwner[]>;

  // Campaign methods
  getCampaign(id: string): Promise<Campaign | undefined>;
  getCampaignsByOwner(productOwnerId: string): Promise<Campaign[]>;
  getAllCampaigns(): Promise<Campaign[]>;
  getActiveCampaigns(): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: string): Promise<void>;

  // Task methods
  getTask(id: string): Promise<Task | undefined>;
  getTasksByCampaign(campaignId: string): Promise<Task[]>;
  getTasksByFreelancer(freelancerId: string): Promise<Task[]>;
  getAvailableTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;
  assignTask(taskId: string, freelancerId: string): Promise<Task | undefined>;

  // Wallet methods
  getWalletByFreelancer(freelancerId: string): Promise<Wallet | undefined>;
  createWallet(freelancerId: string): Promise<Wallet>;
  updateWallet(id: string, updates: Partial<Wallet>): Promise<Wallet | undefined>;

  // Transaction methods
  getTransactionsByWallet(walletId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Payment methods
  getPaymentsByCampaign(campaignId: string): Promise<Payment[]>;
  getPaymentsByOwner(productOwnerId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined>;

  // Notification methods
  getNotificationsByUser(userId: string, userType: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private freelancers: Map<string, Freelancer>;
  private productOwners: Map<string, ProductOwner>;

  constructor() {
    this.users = new Map();
    this.freelancers = new Map();
    this.productOwners = new Map();
  }

  // Legacy user methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Freelancer methods
  async getFreelancer(id: string): Promise<Freelancer | undefined> {
    return this.freelancers.get(id);
  }

  async getFreelancerByEmail(email: string): Promise<Freelancer | undefined> {
    return Array.from(this.freelancers.values()).find(
      (freelancer) => freelancer.email === email
    );
  }

  async getFreelancerByUsername(username: string): Promise<Freelancer | undefined> {
    return Array.from(this.freelancers.values()).find(
      (freelancer) => freelancer.username === username
    );
  }

  async createFreelancer(insertFreelancer: InsertFreelancer): Promise<Freelancer> {
    const id = randomUUID();
    const freelancer: Freelancer = { 
      ...insertFreelancer, 
      id,
      countryCode: insertFreelancer.countryCode || "+966",
      jobTitle: insertFreelancer.jobTitle || null,
      teamSize: insertFreelancer.teamSize || null,
      services: insertFreelancer.services || null,
      bio: insertFreelancer.bio || null,
      aboutMe: insertFreelancer.aboutMe || null,
      profileImage: insertFreelancer.profileImage || null,
      idVerification: insertFreelancer.idVerification || null,
      paymentMethod: insertFreelancer.paymentMethod || null,
      accountNumber: insertFreelancer.accountNumber || null,
      isVerified: false,
      createdAt: new Date(),
    };
    this.freelancers.set(id, freelancer);
    return freelancer;
  }

  async updateFreelancer(id: string, updates: Partial<Freelancer>): Promise<Freelancer | undefined> {
    const existing = this.freelancers.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.freelancers.set(id, updated);
    return updated;
  }

  async getAllFreelancers(): Promise<Freelancer[]> {
    return Array.from(this.freelancers.values());
  }

  // Product Owner methods
  async getProductOwner(id: string): Promise<ProductOwner | undefined> {
    return this.productOwners.get(id);
  }

  async getProductOwnerByEmail(email: string): Promise<ProductOwner | undefined> {
    return Array.from(this.productOwners.values()).find(
      (owner) => owner.email === email
    );
  }

  async createProductOwner(insertOwner: InsertProductOwner): Promise<ProductOwner> {
    const id = randomUUID();
    const owner: ProductOwner = { 
      ...insertOwner, 
      id,
      companyName: insertOwner.companyName || null,
      productDescription: insertOwner.productDescription || null,
      productUrl: insertOwner.productUrl || null,
      services: insertOwner.services || null,
      package: insertOwner.package || null,
      budget: insertOwner.budget || null,
      duration: insertOwner.duration || null,
      createdAt: new Date(),
    };
    this.productOwners.set(id, owner);
    return owner;
  }

  async updateProductOwner(id: string, updates: Partial<ProductOwner>): Promise<ProductOwner | undefined> {
    const existing = this.productOwners.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.productOwners.set(id, updated);
    return updated;
  }

  async getAllProductOwners(): Promise<ProductOwner[]> {
    return Array.from(this.productOwners.values());
  }

  // Stub implementations for new methods (not used since we're using DatabaseStorage)
  async getCampaign(): Promise<Campaign | undefined> { throw new Error("Not implemented in MemStorage"); }
  async getCampaignsByOwner(): Promise<Campaign[]> { throw new Error("Not implemented in MemStorage"); }
  async getAllCampaigns(): Promise<Campaign[]> { throw new Error("Not implemented in MemStorage"); }
  async getActiveCampaigns(): Promise<Campaign[]> { throw new Error("Not implemented in MemStorage"); }
  async createCampaign(): Promise<Campaign> { throw new Error("Not implemented in MemStorage"); }
  async updateCampaign(): Promise<Campaign | undefined> { throw new Error("Not implemented in MemStorage"); }
  async deleteCampaign(): Promise<void> { throw new Error("Not implemented in MemStorage"); }
  async getTask(): Promise<Task | undefined> { throw new Error("Not implemented in MemStorage"); }
  async getTasksByCampaign(): Promise<Task[]> { throw new Error("Not implemented in MemStorage"); }
  async getTasksByFreelancer(): Promise<Task[]> { throw new Error("Not implemented in MemStorage"); }
  async getAvailableTasks(): Promise<Task[]> { throw new Error("Not implemented in MemStorage"); }
  async createTask(): Promise<Task> { throw new Error("Not implemented in MemStorage"); }
  async updateTask(): Promise<Task | undefined> { throw new Error("Not implemented in MemStorage"); }
  async assignTask(): Promise<Task | undefined> { throw new Error("Not implemented in MemStorage"); }
  async getWalletByFreelancer(): Promise<Wallet | undefined> { throw new Error("Not implemented in MemStorage"); }
  async createWallet(): Promise<Wallet> { throw new Error("Not implemented in MemStorage"); }
  async updateWallet(): Promise<Wallet | undefined> { throw new Error("Not implemented in MemStorage"); }
  async getTransactionsByWallet(): Promise<Transaction[]> { throw new Error("Not implemented in MemStorage"); }
  async createTransaction(): Promise<Transaction> { throw new Error("Not implemented in MemStorage"); }
  async getPaymentsByCampaign(): Promise<Payment[]> { throw new Error("Not implemented in MemStorage"); }
  async getPaymentsByOwner(): Promise<Payment[]> { throw new Error("Not implemented in MemStorage"); }
  async createPayment(): Promise<Payment> { throw new Error("Not implemented in MemStorage"); }
  async updatePayment(): Promise<Payment | undefined> { throw new Error("Not implemented in MemStorage"); }
  async getNotificationsByUser(): Promise<Notification[]> { throw new Error("Not implemented in MemStorage"); }
  async createNotification(): Promise<Notification> { throw new Error("Not implemented in MemStorage"); }
  async markNotificationAsRead(): Promise<void> { throw new Error("Not implemented in MemStorage"); }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  // Legacy user methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Freelancer methods
  async getFreelancer(id: string): Promise<Freelancer | undefined> {
    const [freelancer] = await db.select().from(freelancers).where(eq(freelancers.id, id));
    return freelancer || undefined;
  }

  async getFreelancerByEmail(email: string): Promise<Freelancer | undefined> {
    const [freelancer] = await db.select().from(freelancers).where(eq(freelancers.email, email));
    return freelancer || undefined;
  }

  async getFreelancerByUsername(username: string): Promise<Freelancer | undefined> {
    const [freelancer] = await db.select().from(freelancers).where(eq(freelancers.username, username));
    return freelancer || undefined;
  }

  async createFreelancer(insertFreelancer: InsertFreelancer): Promise<Freelancer> {
    const [freelancer] = await db.insert(freelancers).values(insertFreelancer).returning();
    // Create wallet for the freelancer
    await this.createWallet(freelancer.id);
    return freelancer;
  }

  async updateFreelancer(id: string, updates: Partial<Freelancer>): Promise<Freelancer | undefined> {
    const [updated] = await db.update(freelancers).set(updates).where(eq(freelancers.id, id)).returning();
    return updated || undefined;
  }

  async getAllFreelancers(): Promise<Freelancer[]> {
    return await db.select().from(freelancers);
  }

  // Product Owner methods
  async getProductOwner(id: string): Promise<ProductOwner | undefined> {
    const [owner] = await db.select().from(productOwners).where(eq(productOwners.id, id));
    return owner || undefined;
  }

  async getProductOwnerByEmail(email: string): Promise<ProductOwner | undefined> {
    const [owner] = await db.select().from(productOwners).where(eq(productOwners.email, email));
    return owner || undefined;
  }

  async createProductOwner(insertOwner: InsertProductOwner): Promise<ProductOwner> {
    const [owner] = await db.insert(productOwners).values(insertOwner).returning();
    return owner;
  }

  async updateProductOwner(id: string, updates: Partial<ProductOwner>): Promise<ProductOwner | undefined> {
    const [updated] = await db.update(productOwners).set(updates).where(eq(productOwners.id, id)).returning();
    return updated || undefined;
  }

  async getAllProductOwners(): Promise<ProductOwner[]> {
    return await db.select().from(productOwners);
  }

  // Campaign methods
  async getCampaign(id: string): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign || undefined;
  }

  async getCampaignsByOwner(productOwnerId: string): Promise<Campaign[]> {
    return await db.select().from(campaigns).where(eq(campaigns.productOwnerId, productOwnerId)).orderBy(desc(campaigns.createdAt));
  }

  async getAllCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
  }

  async getActiveCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns).where(or(eq(campaigns.status, "active"), eq(campaigns.status, "in_progress"))).orderBy(desc(campaigns.createdAt));
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const [campaign] = await db.insert(campaigns).values(insertCampaign).returning();
    return campaign;
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | undefined> {
    const [updated] = await db.update(campaigns).set({ ...updates, updatedAt: new Date() }).where(eq(campaigns.id, id)).returning();
    return updated || undefined;
  }

  async deleteCampaign(id: string): Promise<void> {
    await db.delete(campaigns).where(eq(campaigns.id, id));
  }

  // Task methods
  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async getTasksByCampaign(campaignId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.campaignId, campaignId)).orderBy(desc(tasks.createdAt));
  }

  async getTasksByFreelancer(freelancerId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.freelancerId, freelancerId)).orderBy(desc(tasks.createdAt));
  }

  async getAvailableTasks(): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.status, "available")).orderBy(desc(tasks.createdAt));
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const [updated] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return updated || undefined;
  }

  async assignTask(taskId: string, freelancerId: string): Promise<Task | undefined> {
    const [updated] = await db.update(tasks)
      .set({ 
        freelancerId, 
        status: "assigned", 
        assignedAt: new Date() 
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.status, "available")))
      .returning();
    return updated || undefined;
  }

  // Wallet methods
  async getWalletByFreelancer(freelancerId: string): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.freelancerId, freelancerId));
    return wallet || undefined;
  }

  async createWallet(freelancerId: string): Promise<Wallet> {
    const [wallet] = await db.insert(wallets).values({ freelancerId }).returning();
    return wallet;
  }

  async updateWallet(id: string, updates: Partial<Wallet>): Promise<Wallet | undefined> {
    const [updated] = await db.update(wallets).set({ ...updates, updatedAt: new Date() }).where(eq(wallets.id, id)).returning();
    return updated || undefined;
  }

  // Transaction methods
  async getTransactionsByWallet(walletId: string): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.walletId, walletId)).orderBy(desc(transactions.createdAt));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  // Payment methods
  async getPaymentsByCampaign(campaignId: string): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.campaignId, campaignId)).orderBy(desc(payments.createdAt));
  }

  async getPaymentsByOwner(productOwnerId: string): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.productOwnerId, productOwnerId)).orderBy(desc(payments.createdAt));
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(insertPayment).returning();
    return payment;
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined> {
    const [updated] = await db.update(payments).set(updates).where(eq(payments.id, id)).returning();
    return updated || undefined;
  }

  // Notification methods
  async getNotificationsByUser(userId: string, userType: string): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.userType, userType)))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(insertNotification).returning();
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }
}

export const storage = new DatabaseStorage();
