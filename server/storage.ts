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
  type Group,
  type InsertGroup,
  type GroupMember,
  type InsertGroupMember,
  type Project,
  type InsertProject,
  type Message,
  type InsertMessage,
  type Withdrawal,
  type InsertWithdrawal,
  type Order,
  type InsertOrder,
  type Conversation,
  type InsertConversation,
  type ConversationMessage,
  type InsertConversationMessage,
  type GroupPost,
  type InsertGroupPost,
  type PostComment,
  type InsertPostComment,
  type PostReaction,
  type InsertPostReaction,
  users,
  freelancers,
  productOwners,
  campaigns,
  tasks,
  wallets,
  transactions,
  payments,
  notifications,
  groups,
  groupMembers,
  projects,
  messages,
  withdrawals,
  orders,
  conversations,
  conversationMessages,
  groupPosts,
  postComments,
  postReactions,
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

  // Group methods
  getGroup(id: string): Promise<Group | undefined>;
  getAllGroups(): Promise<Group[]>;
  getGroupsByLeader(leaderId: string): Promise<Group[]>;
  getGroupsByMember(freelancerId: string): Promise<Group[]>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: string, updates: Partial<Group>): Promise<Group | undefined>;

  // Group Member methods
  getGroupMembers(groupId: string): Promise<GroupMember[]>;
  addGroupMember(member: InsertGroupMember): Promise<GroupMember>;
  removeGroupMember(groupId: string, freelancerId: string): Promise<void>;
  isGroupMember(groupId: string, freelancerId: string): Promise<boolean>;

  // Project methods
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByOwner(productOwnerId: string): Promise<Project[]>;
  getPendingProjects(): Promise<Project[]>;
  getProjectsByGroup(groupId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;
  acceptProject(projectId: string, groupId: string): Promise<Project | undefined>;

  // Message methods
  getMessagesByGroup(groupId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Withdrawal methods
  getWithdrawalsByFreelancer(freelancerId: string): Promise<Withdrawal[]>;
  getAllWithdrawals(): Promise<Withdrawal[]>;
  createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal>;
  updateWithdrawal(id: string, updates: Partial<Withdrawal>): Promise<Withdrawal | undefined>;

  // Order methods
  getOrderById(id: string): Promise<Order | undefined>;
  getOrdersByProductOwner(productOwnerId: string): Promise<Order[]>;
  getOrdersByGroupLeader(leaderId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;

  // Helper methods for orders
  getGroupById(id: string): Promise<Group | undefined>;
  markAllNotificationsAsRead(userId: string, userType: string): Promise<void>;
  getUnreadNotificationCount(userId: string, userType: string): Promise<number>;

  // Conversation methods
  getOrCreateConversation(productOwnerId: string, groupId: string, leaderId: string): Promise<Conversation>;
  getConversation(conversationId: string): Promise<Conversation | undefined>;
  getConversationMessages(conversationId: string): Promise<ConversationMessage[]>;
  sendMessage(conversationId: string, senderId: string, senderType: string, content: string): Promise<ConversationMessage>;
  getProductOwnerConversations(productOwnerId: string): Promise<Conversation[]>;
  getFreelancerConversations(freelancerId: string): Promise<Conversation[]>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<void>;

  // Group Posts methods
  getPostsByGroup(groupId: string): Promise<GroupPost[]>;
  getPost(postId: string): Promise<GroupPost | undefined>;
  createPost(post: InsertGroupPost): Promise<GroupPost>;
  deletePost(postId: string): Promise<void>;
  updatePostCounts(postId: string, likesCount?: number, commentsCount?: number): Promise<void>;

  // Post Comments methods
  getCommentsByPost(postId: string): Promise<PostComment[]>;
  createComment(comment: InsertPostComment): Promise<PostComment>;
  deleteComment(commentId: string): Promise<void>;

  // Post Reactions methods
  getReactionsByPost(postId: string): Promise<PostReaction[]>;
  getUserReaction(postId: string, userId: string): Promise<PostReaction | undefined>;
  createReaction(reaction: InsertPostReaction): Promise<PostReaction>;
  deleteReaction(postId: string, userId: string): Promise<void>;
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
  async getGroup(): Promise<Group | undefined> { throw new Error("Not implemented in MemStorage"); }
  async getGroupsByLeader(): Promise<Group[]> { throw new Error("Not implemented in MemStorage"); }
  async getGroupsByMember(): Promise<Group[]> { throw new Error("Not implemented in MemStorage"); }
  async createGroup(): Promise<Group> { throw new Error("Not implemented in MemStorage"); }
  async updateGroup(): Promise<Group | undefined> { throw new Error("Not implemented in MemStorage"); }
  async getGroupMembers(): Promise<GroupMember[]> { throw new Error("Not implemented in MemStorage"); }
  async addGroupMember(): Promise<GroupMember> { throw new Error("Not implemented in MemStorage"); }
  async removeGroupMember(): Promise<void> { throw new Error("Not implemented in MemStorage"); }
  async isGroupMember(): Promise<boolean> { throw new Error("Not implemented in MemStorage"); }
  async getProject(): Promise<Project | undefined> { throw new Error("Not implemented in MemStorage"); }
  async getProjectsByOwner(): Promise<Project[]> { throw new Error("Not implemented in MemStorage"); }
  async getPendingProjects(): Promise<Project[]> { throw new Error("Not implemented in MemStorage"); }
  async getProjectsByGroup(): Promise<Project[]> { throw new Error("Not implemented in MemStorage"); }
  async createProject(): Promise<Project> { throw new Error("Not implemented in MemStorage"); }
  async updateProject(): Promise<Project | undefined> { throw new Error("Not implemented in MemStorage"); }
  async acceptProject(): Promise<Project | undefined> { throw new Error("Not implemented in MemStorage"); }
  async getMessagesByGroup(): Promise<Message[]> { throw new Error("Not implemented in MemStorage"); }
  async createMessage(): Promise<Message> { throw new Error("Not implemented in MemStorage"); }
  async getWithdrawalsByFreelancer(): Promise<Withdrawal[]> { throw new Error("Not implemented in MemStorage"); }
  async getAllWithdrawals(): Promise<Withdrawal[]> { throw new Error("Not implemented in MemStorage"); }
  async createWithdrawal(): Promise<Withdrawal> { throw new Error("Not implemented in MemStorage"); }
  async updateWithdrawal(): Promise<Withdrawal | undefined> { throw new Error("Not implemented in MemStorage"); }
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

  // Group methods
  async getGroup(id: string): Promise<Group | undefined> {
    const [group] = await db.select().from(groups).where(eq(groups.id, id));
    return group || undefined;
  }

  async getAllGroups(): Promise<Group[]> {
    return await db.select().from(groups).orderBy(desc(groups.createdAt));
  }

  async getGroupsByLeader(leaderId: string): Promise<Group[]> {
    return await db.select().from(groups).where(eq(groups.leaderId, leaderId)).orderBy(desc(groups.createdAt));
  }

  async getGroupsByMember(freelancerId: string): Promise<Group[]> {
    const memberGroups = await db
      .select({ group: groups })
      .from(groupMembers)
      .innerJoin(groups, eq(groupMembers.groupId, groups.id))
      .where(eq(groupMembers.freelancerId, freelancerId));
    return memberGroups.map(mg => mg.group);
  }

  async createGroup(insertGroup: InsertGroup): Promise<Group> {
    const [group] = await db.insert(groups).values(insertGroup).returning();
    // Add leader as a member
    await this.addGroupMember({
      groupId: group.id,
      freelancerId: group.leaderId,
      role: "leader",
    });
    return group;
  }

  async updateGroup(id: string, updates: Partial<Group>): Promise<Group | undefined> {
    const [updated] = await db.update(groups).set(updates).where(eq(groups.id, id)).returning();
    return updated || undefined;
  }

  // Group Member methods
  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    return await db.select().from(groupMembers).where(eq(groupMembers.groupId, groupId)).orderBy(desc(groupMembers.joinedAt));
  }

  async addGroupMember(member: InsertGroupMember): Promise<GroupMember> {
    const [newMember] = await db.insert(groupMembers).values(member).returning();
    // Update group's current members count
    await db.update(groups)
      .set({ currentMembers: db.select({ count: groupMembers.id }).from(groupMembers).where(eq(groupMembers.groupId, member.groupId)) as any })
      .where(eq(groups.id, member.groupId));
    return newMember;
  }

  async removeGroupMember(groupId: string, freelancerId: string): Promise<void> {
    await db.delete(groupMembers).where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.freelancerId, freelancerId)));
    // Update group's current members count
    const count = await db.select().from(groupMembers).where(eq(groupMembers.groupId, groupId));
    await db.update(groups).set({ currentMembers: count.length }).where(eq(groups.id, groupId));
  }

  async isGroupMember(groupId: string, freelancerId: string): Promise<boolean> {
    const [member] = await db.select().from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.freelancerId, freelancerId)));
    return !!member;
  }

  // Project methods
  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjectsByOwner(productOwnerId: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.productOwnerId, productOwnerId)).orderBy(desc(projects.createdAt));
  }

  async getPendingProjects(): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.status, "pending")).orderBy(desc(projects.createdAt));
  }

  async getProjectsByGroup(groupId: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.acceptedByGroupId, groupId)).orderBy(desc(projects.createdAt));
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const [updated] = await db.update(projects).set({ ...updates, updatedAt: new Date() }).where(eq(projects.id, id)).returning();
    return updated || undefined;
  }

  async acceptProject(projectId: string, groupId: string): Promise<Project | undefined> {
    const [updated] = await db.update(projects)
      .set({ 
        status: "accepted", 
        acceptedByGroupId: groupId,
        updatedAt: new Date() 
      })
      .where(and(eq(projects.id, projectId), eq(projects.status, "pending")))
      .returning();
    return updated || undefined;
  }

  // Message methods
  async getMessagesByGroup(groupId: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.groupId, groupId)).orderBy(desc(messages.createdAt));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  // Withdrawal methods
  async getWithdrawalsByFreelancer(freelancerId: string): Promise<Withdrawal[]> {
    return await db.select().from(withdrawals).where(eq(withdrawals.freelancerId, freelancerId)).orderBy(desc(withdrawals.createdAt));
  }

  async getAllWithdrawals(): Promise<Withdrawal[]> {
    return await db.select().from(withdrawals).orderBy(desc(withdrawals.createdAt));
  }

  async createWithdrawal(insertWithdrawal: InsertWithdrawal): Promise<Withdrawal> {
    const [withdrawal] = await db.insert(withdrawals).values(insertWithdrawal).returning();
    return withdrawal;
  }

  async updateWithdrawal(id: string, updates: Partial<Withdrawal>): Promise<Withdrawal | undefined> {
    const [updated] = await db.update(withdrawals).set(updates).where(eq(withdrawals.id, id)).returning();
    return updated || undefined;
  }

  // Order methods
  async getOrderById(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrdersByProductOwner(productOwnerId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.productOwnerId, productOwnerId)).orderBy(desc(orders.createdAt));
  }

  async getOrdersByGroupLeader(leaderId: string): Promise<Order[]> {
    // Get all groups led by this freelancer
    const leaderGroups = await db.select().from(groups).where(eq(groups.leaderId, leaderId));
    const groupIds = leaderGroups.map(g => g.id);
    
    if (groupIds.length === 0) {
      return [];
    }

    // Get all orders for these groups
    const groupOrders: Order[] = [];
    for (const groupId of groupIds) {
      const ordersForGroup = await db.select().from(orders).where(eq(orders.groupId, groupId)).orderBy(desc(orders.createdAt));
      groupOrders.push(...ordersForGroup);
    }
    
    return groupOrders;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const now = new Date();
    const updateData: any = { status, updatedAt: now };
    
    if (status === "payment_confirmed") {
      updateData.paidAt = now;
    } else if (status === "completed") {
      updateData.completedAt = now;
    }

    const [updated] = await db.update(orders).set(updateData).where(eq(orders.id, id)).returning();
    return updated || undefined;
  }

  // Helper methods
  async getGroupById(id: string): Promise<Group | undefined> {
    return await this.getGroup(id);
  }

  async markAllNotificationsAsRead(userId: string, userType: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.userType, userType),
        eq(notifications.isRead, false)
      ));
  }

  async getUnreadNotificationCount(userId: string, userType: string): Promise<number> {
    const result = await db.select().from(notifications).where(and(
      eq(notifications.userId, userId),
      eq(notifications.userType, userType),
      eq(notifications.isRead, false)
    ));
    return result.length;
  }

  // Conversation methods
  async getOrCreateConversation(productOwnerId: string, groupId: string, leaderId: string): Promise<Conversation> {
    // Check if conversation already exists
    const [existing] = await db.select().from(conversations).where(and(
      eq(conversations.productOwnerId, productOwnerId),
      eq(conversations.groupId, groupId)
    ));

    if (existing) {
      return existing;
    }

    // Create new conversation
    const [conversation] = await db.insert(conversations).values({
      productOwnerId,
      groupId,
      leaderId,
      lastMessageAt: new Date(),
    }).returning();

    return conversation;
  }

  async getConversation(conversationId: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, conversationId));
    return conversation || undefined;
  }

  async getConversationMessages(conversationId: string): Promise<ConversationMessage[]> {
    return await db.select().from(conversationMessages)
      .where(eq(conversationMessages.conversationId, conversationId))
      .orderBy(conversationMessages.createdAt);
  }

  async sendMessage(conversationId: string, senderId: string, senderType: string, content: string): Promise<ConversationMessage> {
    // Insert message
    const [message] = await db.insert(conversationMessages).values({
      conversationId,
      senderId,
      senderType,
      content,
      isRead: false,
    }).returning();

    // Update conversation lastMessageAt
    await db.update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, conversationId));

    return message;
  }

  async getProductOwnerConversations(productOwnerId: string): Promise<Conversation[]> {
    return await db.select().from(conversations)
      .where(eq(conversations.productOwnerId, productOwnerId))
      .orderBy(desc(conversations.lastMessageAt));
  }

  async getFreelancerConversations(freelancerId: string): Promise<Conversation[]> {
    return await db.select().from(conversations)
      .where(eq(conversations.leaderId, freelancerId))
      .orderBy(desc(conversations.lastMessageAt));
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    await db.update(conversationMessages)
      .set({ isRead: true })
      .where(and(
        eq(conversationMessages.conversationId, conversationId),
        eq(conversationMessages.isRead, false)
      ));
  }

  // Group Posts methods
  async getPostsByGroup(groupId: string): Promise<GroupPost[]> {
    return await db.select().from(groupPosts)
      .where(eq(groupPosts.groupId, groupId))
      .orderBy(desc(groupPosts.createdAt));
  }

  async getPost(postId: string): Promise<GroupPost | undefined> {
    const [post] = await db.select().from(groupPosts).where(eq(groupPosts.id, postId));
    return post || undefined;
  }

  async createPost(post: InsertGroupPost): Promise<GroupPost> {
    const [newPost] = await db.insert(groupPosts).values(post).returning();
    return newPost;
  }

  async deletePost(postId: string): Promise<void> {
    await db.delete(groupPosts).where(eq(groupPosts.id, postId));
  }

  async updatePostCounts(postId: string, likesCount?: number, commentsCount?: number): Promise<void> {
    const updates: any = { updatedAt: new Date() };
    if (likesCount !== undefined) updates.likesCount = likesCount;
    if (commentsCount !== undefined) updates.commentsCount = commentsCount;
    
    await db.update(groupPosts)
      .set(updates)
      .where(eq(groupPosts.id, postId));
  }

  // Post Comments methods
  async getCommentsByPost(postId: string): Promise<PostComment[]> {
    return await db.select().from(postComments)
      .where(eq(postComments.postId, postId))
      .orderBy(postComments.createdAt);
  }

  async createComment(comment: InsertPostComment): Promise<PostComment> {
    const [newComment] = await db.insert(postComments).values(comment).returning();
    
    // Increment comments count
    const post = await this.getPost(comment.postId);
    if (post) {
      await this.updatePostCounts(comment.postId, undefined, post.commentsCount + 1);
    }
    
    return newComment;
  }

  async deleteComment(commentId: string): Promise<void> {
    // Get comment first to update count
    const [comment] = await db.select().from(postComments).where(eq(postComments.id, commentId));
    
    await db.delete(postComments).where(eq(postComments.id, commentId));
    
    // Decrement comments count
    if (comment) {
      const post = await this.getPost(comment.postId);
      if (post && post.commentsCount > 0) {
        await this.updatePostCounts(comment.postId, undefined, post.commentsCount - 1);
      }
    }
  }

  // Post Reactions methods
  async getReactionsByPost(postId: string): Promise<PostReaction[]> {
    return await db.select().from(postReactions)
      .where(eq(postReactions.postId, postId));
  }

  async getUserReaction(postId: string, userId: string): Promise<PostReaction | undefined> {
    const [reaction] = await db.select().from(postReactions)
      .where(and(
        eq(postReactions.postId, postId),
        eq(postReactions.userId, userId)
      ));
    return reaction || undefined;
  }

  async createReaction(reaction: InsertPostReaction): Promise<PostReaction> {
    const [newReaction] = await db.insert(postReactions).values(reaction).returning();
    
    // Increment likes count
    const post = await this.getPost(reaction.postId);
    if (post) {
      await this.updatePostCounts(reaction.postId, post.likesCount + 1, undefined);
    }
    
    return newReaction;
  }

  async deleteReaction(postId: string, userId: string): Promise<void> {
    await db.delete(postReactions)
      .where(and(
        eq(postReactions.postId, postId),
        eq(postReactions.userId, userId)
      ));
    
    // Decrement likes count
    const post = await this.getPost(postId);
    if (post && post.likesCount > 0) {
      await this.updatePostCounts(postId, post.likesCount - 1, undefined);
    }
  }
}

export const storage = new DatabaseStorage();
