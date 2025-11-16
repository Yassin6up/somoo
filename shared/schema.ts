import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, boolean, uniqueIndex } from "drizzle-orm/pg-core";
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
  isVerified: boolean("is_verified").default(false),
  acceptedInstructions: boolean("accepted_instructions").default(false),
  lastSeen: timestamp("last_seen"), // آخر ظهور (للحالة أونلاين/أوفلاين)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Product Owner schema
export const productOwners = pgTable("product_owners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  companyName: text("company_name"),
  phone: text("phone"),
  productName: text("product_name"),
  productType: text("product_type"),
  productDescription: text("product_description"),
  productUrl: text("product_url"),
  services: text("services").array().default(sql`ARRAY[]::text[]`),
  package: text("package"),
  budget: text("budget"),
  duration: text("duration"),
  acceptedInstructions: boolean("accepted_instructions").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Campaigns schema
export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productOwnerId: varchar("product_owner_id").notNull().references(() => productOwners.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  productType: text("product_type").notNull(),
  productUrl: text("product_url"),
  services: text("services").array().notNull(),
  package: text("package").notNull(),
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
  testersNeeded: integer("testers_needed").notNull(),
  testersAssigned: integer("testers_assigned").default(0).notNull(),
  status: text("status").notNull().default("draft"), // draft, active, in_progress, completed, cancelled
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Groups schema - الجروبات (MOVED BEFORE TASKS)
export const groups = pgTable("groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  groupImage: text("group_image"), // صورة الجروب
  portfolioImages: text("portfolio_images").array().default(sql`ARRAY[]::text[]`), // صور البورتفوليو (قبل وبعد)
  leaderId: varchar("leader_id").notNull().references(() => freelancers.id),
  maxMembers: integer("max_members").default(700).notNull(),
  currentMembers: integer("current_members").default(1).notNull(),
  status: text("status").notNull().default("active"), // active, inactive
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Projects schema - المشاريع من أصحاب المشاريع (MOVED BEFORE TASKS)
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productOwnerId: varchar("product_owner_id").notNull().references(() => productOwners.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  targetCountry: text("target_country").notNull(),
  tasksCount: integer("tasks_count").notNull(), // عدد المهام المطلوبة
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
  deadline: timestamp("deadline"),
  status: text("status").notNull().default("pending"), // pending, accepted, in_progress, completed, cancelled
  acceptedByGroupId: varchar("accepted_by_group_id").references(() => groups.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tasks schema (individual testing tasks assigned to freelancers)
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").references(() => campaigns.id),
  projectId: varchar("project_id").references(() => projects.id),
  groupId: varchar("group_id").references(() => groups.id),
  freelancerId: varchar("freelancer_id").references(() => freelancers.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  serviceType: text("service_type").notNull(),
  reward: decimal("reward", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull().default("0"), // رسوم المنصة 10%
  netReward: decimal("net_reward", { precision: 10, scale: 2 }).notNull().default("0"), // المكافأة الصافية للفريلانسر بعد خصم رسوم المنصة
  status: text("status").notNull().default("available"), // available, assigned, in_progress, submitted, approved, rejected
  assignedAt: timestamp("assigned_at"),
  submittedAt: timestamp("submitted_at"),
  completedAt: timestamp("completed_at"),
  submission: text("submission"), // Freelancer's submission/report
  proofImage: text("proof_image"), // صورة الإثبات
  taskUrl: text("task_url"), // رابط المهمة
  feedback: text("feedback"), // Product owner's or leader's feedback
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Wallets schema (freelancer wallets)
export const wallets = pgTable("wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  freelancerId: varchar("freelancer_id").notNull().unique().references(() => freelancers.id),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0").notNull(),
  pendingBalance: decimal("pending_balance", { precision: 10, scale: 2 }).default("0").notNull(),
  totalEarned: decimal("total_earned", { precision: 10, scale: 2 }).default("0").notNull(),
  totalWithdrawn: decimal("total_withdrawn", { precision: 10, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Transactions schema (wallet transactions)
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletId: varchar("wallet_id").notNull().references(() => wallets.id),
  taskId: varchar("task_id").references(() => tasks.id),
  type: text("type").notNull(), // earning, withdrawal, refund
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Payments schema (product owner payments)
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull().references(() => campaigns.id),
  productOwnerId: varchar("product_owner_id").notNull().references(() => productOwners.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // stripe, paypal, stc_pay
  paymentIntentId: text("payment_intent_id"),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed, refunded
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notifications schema
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // can be freelancer or product owner
  userType: text("user_type").notNull(), // freelancer or product_owner
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // task_assigned, payment_received, campaign_update, etc.
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Group Members schema - أعضاء الجروبات
export const groupMembers = pgTable("group_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => groups.id),
  freelancerId: varchar("freelancer_id").notNull().references(() => freelancers.id),
  role: text("role").notNull().default("member"), // leader, member
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (table) => ({
  uniqueGroupMember: uniqueIndex("unique_group_member_idx").on(table.groupId, table.freelancerId),
}));

// Messages schema - الرسائل الداخلية
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => groups.id),
  senderId: varchar("sender_id").notNull().references(() => freelancers.id),
  content: text("content").notNull(),
  type: text("type").notNull().default("text"), // text, task_post, image
  relatedProjectId: varchar("related_project_id").references(() => projects.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Withdrawals schema - طلبات السحب
export const withdrawals = pgTable("withdrawals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  freelancerId: varchar("freelancer_id").notNull().references(() => freelancers.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  accountNumber: text("account_number").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, rejected
  processedAt: timestamp("processed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Orders schema - الطلبات المباشرة من أصحاب المشاريع للجروبات
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productOwnerId: varchar("product_owner_id").notNull().references(() => productOwners.id),
  groupId: varchar("group_id").notNull().references(() => groups.id),
  serviceType: text("service_type").notNull(), // google_play_reviews, ios_reviews, website_reviews, ux_testing, software_testing, social_media, google_maps
  quantity: integer("quantity").notNull(), // عدد المراجعات/المهام المطلوبة
  pricePerUnit: decimal("price_per_unit", { precision: 10, scale: 2 }).notNull(), // السعر لكل وحدة
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(), // الإجمالي
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull().default("0"), // رسوم المنصة 10%
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }).notNull().default("0"), // المبلغ الصافي للفريلانسر بعد خصم رسوم المنصة
  paymentMethod: text("payment_method").notNull(), // vodafone_cash, etisalat_cash, orange_cash, bank_card
  paymentDetails: text("payment_details"), // رقم الهاتف أو بيانات البطاقة
  status: text("status").notNull().default("pending"), // pending, payment_confirmed, in_progress, completed, cancelled
  paidAt: timestamp("paid_at"),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Group Join Requests schema - طلبات الانضمام للجروبات
export const groupJoinRequests = pgTable("group_join_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => groups.id),
  freelancerId: varchar("freelancer_id").notNull().references(() => freelancers.id),
  message: text("message"), // رسالة من المتقدم
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"), // ملاحظات من قائد الجروب
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueJoinRequest: uniqueIndex("unique_join_request_idx").on(table.groupId, table.freelancerId),
}));

// Conversations schema - المحادثات المباشرة
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productOwnerId: varchar("product_owner_id").notNull().references(() => productOwners.id),
  groupId: varchar("group_id").notNull().references(() => groups.id),
  leaderId: varchar("leader_id").notNull().references(() => freelancers.id),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueConversation: uniqueIndex("unique_conversation_idx").on(table.productOwnerId, table.groupId),
}));

// Conversation Messages schema - رسائل المحادثة المباشرة
export const conversationMessages = pgTable("conversation_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  senderId: varchar("sender_id").notNull(), // يمكن أن يكون product owner أو freelancer
  senderType: text("sender_type").notNull(), // product_owner, freelancer
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Group Posts schema - منشورات الجروب (Community Posts)
export const groupPosts = pgTable("group_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => groups.id),
  authorId: varchar("author_id").notNull().references(() => freelancers.id),
  content: text("content").notNull(),
  imageUrl: text("image_url"), // صورة المنشور (اختيارية)
  likesCount: integer("likes_count").default(0).notNull(),
  commentsCount: integer("comments_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Post Comments schema - تعليقات المنشورات
export const postComments = pgTable("post_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => groupPosts.id),
  authorId: varchar("author_id").notNull().references(() => freelancers.id),
  content: text("content").notNull(),
  imageUrl: text("image_url"), // صورة التعليق (اختيارية)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Post Reactions schema - تفاعلات المنشورات (لايكات)
export const postReactions = pgTable("post_reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => groupPosts.id),
  userId: varchar("user_id").notNull().references(() => freelancers.id),
  type: text("type").notNull().default("like"), // like, love, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueReaction: uniqueIndex("unique_reaction_idx").on(table.postId, table.userId),
}));

// Relations
export const freelancersRelations = relations(freelancers, ({ one, many }) => ({
  wallet: one(wallets, { fields: [freelancers.id], references: [wallets.freelancerId] }),
  tasks: many(tasks),
  groupsLeading: many(groups),
  groupMemberships: many(groupMembers),
  withdrawals: many(withdrawals),
  messages: many(messages),
  groupJoinRequests: many(groupJoinRequests),
}));

export const productOwnersRelations = relations(productOwners, ({ many }) => ({
  campaigns: many(campaigns),
  payments: many(payments),
  projects: many(projects),
  orders: many(orders),
  conversations: many(conversations),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  productOwner: one(productOwners, { fields: [campaigns.productOwnerId], references: [productOwners.id] }),
  tasks: many(tasks),
  payments: many(payments),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  campaign: one(campaigns, { fields: [tasks.campaignId], references: [campaigns.id] }),
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  group: one(groups, { fields: [tasks.groupId], references: [groups.id] }),
  freelancer: one(freelancers, { fields: [tasks.freelancerId], references: [freelancers.id] }),
  transactions: many(transactions),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  freelancer: one(freelancers, { fields: [wallets.freelancerId], references: [freelancers.id] }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  wallet: one(wallets, { fields: [transactions.walletId], references: [wallets.id] }),
  task: one(tasks, { fields: [transactions.taskId], references: [tasks.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  campaign: one(campaigns, { fields: [payments.campaignId], references: [campaigns.id] }),
  productOwner: one(productOwners, { fields: [payments.productOwnerId], references: [productOwners.id] }),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  leader: one(freelancers, { fields: [groups.leaderId], references: [freelancers.id] }),
  members: many(groupMembers),
  tasks: many(tasks),
  messages: many(messages),
  posts: many(groupPosts),
  acceptedProjects: many(projects),
  orders: many(orders),
  joinRequests: many(groupJoinRequests),
  conversations: many(conversations),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, { fields: [groupMembers.groupId], references: [groups.id] }),
  freelancer: one(freelancers, { fields: [groupMembers.freelancerId], references: [freelancers.id] }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  productOwner: one(productOwners, { fields: [projects.productOwnerId], references: [productOwners.id] }),
  acceptedByGroup: one(groups, { fields: [projects.acceptedByGroupId], references: [groups.id] }),
  tasks: many(tasks),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  group: one(groups, { fields: [messages.groupId], references: [groups.id] }),
  sender: one(freelancers, { fields: [messages.senderId], references: [freelancers.id] }),
  relatedProject: one(projects, { fields: [messages.relatedProjectId], references: [projects.id] }),
}));

export const withdrawalsRelations = relations(withdrawals, ({ one }) => ({
  freelancer: one(freelancers, { fields: [withdrawals.freelancerId], references: [freelancers.id] }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  productOwner: one(productOwners, { fields: [orders.productOwnerId], references: [productOwners.id] }),
  group: one(groups, { fields: [orders.groupId], references: [groups.id] }),
}));

export const groupJoinRequestsRelations = relations(groupJoinRequests, ({ one }) => ({
  group: one(groups, { fields: [groupJoinRequests.groupId], references: [groups.id] }),
  freelancer: one(freelancers, { fields: [groupJoinRequests.freelancerId], references: [freelancers.id] }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  productOwner: one(productOwners, { fields: [conversations.productOwnerId], references: [productOwners.id] }),
  group: one(groups, { fields: [conversations.groupId], references: [groups.id] }),
  leader: one(freelancers, { fields: [conversations.leaderId], references: [freelancers.id] }),
  messages: many(conversationMessages),
}));

export const conversationMessagesRelations = relations(conversationMessages, ({ one }) => ({
  conversation: one(conversations, { fields: [conversationMessages.conversationId], references: [conversations.id] }),
}));

export const groupPostsRelations = relations(groupPosts, ({ one, many }) => ({
  group: one(groups, { fields: [groupPosts.groupId], references: [groups.id] }),
  author: one(freelancers, { fields: [groupPosts.authorId], references: [freelancers.id] }),
  comments: many(postComments),
  reactions: many(postReactions),
}));

export const postCommentsRelations = relations(postComments, ({ one }) => ({
  post: one(groupPosts, { fields: [postComments.postId], references: [groupPosts.id] }),
  author: one(freelancers, { fields: [postComments.authorId], references: [freelancers.id] }),
}));

export const postReactionsRelations = relations(postReactions, ({ one }) => ({
  post: one(groupPosts, { fields: [postReactions.postId], references: [groupPosts.id] }),
  user: one(freelancers, { fields: [postReactions.userId], references: [freelancers.id] }),
}));

// Insert schemas for validation
export const insertFreelancerSchema = createInsertSchema(freelancers).omit({
  id: true,
  isVerified: true,
  createdAt: true,
});

export const insertProductOwnerSchema = createInsertSchema(productOwners).omit({
  id: true,
  createdAt: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  testersAssigned: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  currentMembers: true,
  createdAt: true,
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertWithdrawalSchema = createInsertSchema(withdrawals).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGroupJoinRequestSchema = createInsertSchema(groupJoinRequests).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertConversationMessageSchema = createInsertSchema(conversationMessages).omit({
  id: true,
  createdAt: true,
});

export const insertGroupPostSchema = createInsertSchema(groupPosts).omit({
  id: true,
  likesCount: true,
  commentsCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostCommentSchema = createInsertSchema(postComments).omit({
  id: true,
  createdAt: true,
});

export const insertPostReactionSchema = createInsertSchema(postReactions).omit({
  id: true,
  createdAt: true,
});

// TypeScript types
export type Freelancer = typeof freelancers.$inferSelect;
export type InsertFreelancer = z.infer<typeof insertFreelancerSchema>;
export type ProductOwner = typeof productOwners.$inferSelect;
export type InsertProductOwner = z.infer<typeof insertProductOwnerSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type GroupJoinRequest = typeof groupJoinRequests.$inferSelect;
export type InsertGroupJoinRequest = z.infer<typeof insertGroupJoinRequestSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type ConversationMessage = typeof conversationMessages.$inferSelect;
export type InsertConversationMessage = z.infer<typeof insertConversationMessageSchema>;
export type GroupPost = typeof groupPosts.$inferSelect;
export type InsertGroupPost = z.infer<typeof insertGroupPostSchema>;
export type PostComment = typeof postComments.$inferSelect;
export type InsertPostComment = z.infer<typeof insertPostCommentSchema>;
export type PostReaction = typeof postReactions.$inferSelect;
export type InsertPostReaction = z.infer<typeof insertPostReactionSchema>;

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
  "فودافون كاش",
  "اتصالات كاش",
  "أورانج كاش",
  "التحويل البنكي",
  "محفظة سُمُوّ",
] as const;

// Payment method details configuration
export const paymentMethodDetails: Record<string, { label: string; placeholder: string; inputType: string }> = {
  "فودافون كاش": {
    label: "رقم محفظة فودافون كاش",
    placeholder: "مثال: 01012345678",
    inputType: "tel",
  },
  "اتصالات كاش": {
    label: "رقم محفظة اتصالات كاش",
    placeholder: "مثال: 01112345678",
    inputType: "tel",
  },
  "أورانج كاش": {
    label: "رقم محفظة أورانج كاش",
    placeholder: "مثال: 01212345678",
    inputType: "tel",
  },
  "التحويل البنكي": {
    label: "رقم الحساب البنكي (IBAN)",
    placeholder: "مثال: SA1234567890123456789012",
    inputType: "text",
  },
  "محفظة سُمُوّ": {
    label: "معرف محفظة سُمُوّ",
    placeholder: "سيتم إنشاؤه تلقائيًا",
    inputType: "text",
  },
};

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
