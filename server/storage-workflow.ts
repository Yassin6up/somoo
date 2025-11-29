// Enhanced storage methods for the new chat-based workflow
// This file contains methods for:
// - Project proposals in chat
// - Escrow management
// - Task management
// - Delivery confirmation
// - Dispute handling
// - Automated fund distribution

import { db } from "./db";
import { eq, and, or, desc, sql } from "drizzle-orm";
import {
  projectProposals,
  projectTasks,
  disputes,
  escrowTransactions,
  conversations,
  conversationMessages,
  productOwnerWallets,
  groupWallets,
  wallets,
  groups,
  groupMembers,
  notifications,
  type ProjectProposal,
  type InsertProjectProposal,
  type ProjectTask,
  type InsertProjectTask,
  type Dispute,
  type InsertDispute,
  type EscrowTransaction,
  type InsertEscrowTransaction,
} from "@shared/schema";

// ============================================
// PROJECT PROPOSAL METHODS
// ============================================

export async function createProposal(
  data: InsertProjectProposal
): Promise<ProjectProposal> {
  const [proposal] = await db
    .insert(projectProposals)
    .values({
      ...data,
      status: "pending",
      proposedAt: new Date(),
    })
    .returning();

  // Update conversation with proposal count
  await db
    .update(conversations)
    .set({
      totalProposals: sql`${conversations.totalProposals} + 1`,
      activeProposalId: proposal.id,
    })
    .where(eq(conversations.id, data.conversationId));

  return proposal;
}

export async function getProposal(id: string): Promise<ProjectProposal | undefined> {
  const [proposal] = await db
    .select()
    .from(projectProposals)
    .where(eq(projectProposals.id, id));
  return proposal;
}

export async function getProposalsByConversation(
  conversationId: string
): Promise<ProjectProposal[]> {
  return await db
    .select()
    .from(projectProposals)
    .where(eq(projectProposals.conversationId, conversationId))
    .orderBy(desc(projectProposals.createdAt));
}

export async function getProposalsByGroup(groupId: string): Promise<ProjectProposal[]> {
  return await db
    .select()
    .from(projectProposals)
    .where(eq(projectProposals.groupId, groupId))
    .orderBy(desc(projectProposals.createdAt));
}

export async function getProposalsByProductOwner(
  productOwnerId: string
): Promise<ProjectProposal[]> {
  return await db
    .select()
    .from(projectProposals)
    .where(eq(projectProposals.productOwnerId, productOwnerId))
    .orderBy(desc(projectProposals.createdAt));
}

export async function getActiveProposalsByGroup(groupId: string): Promise<ProjectProposal[]> {
  return await db
    .select()
    .from(projectProposals)
    .where(
      and(
        eq(projectProposals.groupId, groupId),
        or(
          eq(projectProposals.status, "accepted"),
          eq(projectProposals.status, "in_progress"),
          eq(projectProposals.status, "delivered")
        )
      )
    )
    .orderBy(desc(projectProposals.createdAt));
}

export async function updateProposal(
  id: string,
  updates: Partial<ProjectProposal>
): Promise<ProjectProposal | undefined> {
  const [updated] = await db
    .update(projectProposals)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(projectProposals.id, id))
    .returning();
  return updated;
}

// ============================================
// PROPOSAL ACCEPTANCE & ESCROW
// ============================================

export async function acceptProposal(
  proposalId: string,
  productOwnerId: string
): Promise<{ success: boolean; error?: string }> {
  return await db.transaction(async (tx) => {
    // 1. Get proposal
    const [proposal] = await tx
      .select()
      .from(projectProposals)
      .where(eq(projectProposals.id, proposalId));

    if (!proposal) {
      return { success: false, error: "Proposal not found" };
    }

    if (proposal.productOwnerId !== productOwnerId) {
      return { success: false, error: "Unauthorized" };
    }

    if (proposal.status !== "pending") {
      return { success: false, error: "Proposal already processed" };
    }

    // 2. Get product owner wallet
    const [poWallet] = await tx
      .select()
      .from(productOwnerWallets)
      .where(eq(productOwnerWallets.productOwnerId, productOwnerId));

    if (!poWallet) {
      return { success: false, error: "Wallet not found" };
    }

    const price = parseFloat(proposal.price as string);

    if (parseFloat(poWallet.availableBalance as string) < price) {
      return { success: false, error: "Insufficient funds" };
    }

    // 3. Get group wallet
    const [gWallet] = await tx
      .select()
      .from(groupWallets)
      .where(eq(groupWallets.groupId, proposal.groupId));

    if (!gWallet) {
      return { success: false, error: "Group wallet not found" };
    }

    // 4. Calculate fees
    const platformFee = price * 0.1; // 10%
    const afterPlatformFee = price - platformFee;
    const leaderCommission = afterPlatformFee * 0.03; // 3%
    const memberPool = afterPlatformFee - leaderCommission; // 87%

    // 5. Lock funds in escrow
    // Deduct from product owner available balance
    await tx
      .update(productOwnerWallets)
      .set({
        availableBalance: sql`${productOwnerWallets.availableBalance} - ${price}`,
        escrowBalance: sql`${productOwnerWallets.escrowBalance} + ${price}`,
      })
      .where(eq(productOwnerWallets.id, poWallet.id));

    // Add to group escrow
    await tx
      .update(groupWallets)
      .set({
        escrowBalance: sql`${groupWallets.escrowBalance} + ${price}`,
        totalEscrowReceived: sql`${groupWallets.totalEscrowReceived} + ${price}`,
      })
      .where(eq(groupWallets.id, gWallet.id));

    // 6. Update proposal
    await tx
      .update(projectProposals)
      .set({
        status: "accepted",
        acceptedAt: new Date(),
        escrowAmount: price.toString(),
        platformFee: platformFee.toString(),
        leaderCommission: leaderCommission.toString(),
        memberPool: memberPool.toString(),
        updatedAt: new Date(),
      })
      .where(eq(projectProposals.id, proposalId));

    // 7. Record escrow transaction
    await tx.insert(escrowTransactions).values({
      proposalId,
      transactionType: "lock",
      amount: price.toString(),
      fromWalletId: poWallet.id,
      fromWalletType: "product_owner",
      toWalletId: gWallet.id,
      toWalletType: "group",
      status: "completed",
      description: `Escrow lock for proposal: ${proposal.title}`,
    });

    // 8. Notify group leader
    await tx.insert(notifications).values({
      userId: proposal.leaderId,
      userType: "freelancer",
      title: "مشروع جديد مقبول",
      message: `تم قبول مقترحك "${proposal.title}" وتأمين المبلغ`,
      type: "proposal_accepted",
    });

    return { success: true };
  });
}

export async function rejectProposal(
  proposalId: string,
  productOwnerId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const [proposal] = await db
    .select()
    .from(projectProposals)
    .where(eq(projectProposals.id, proposalId));

  if (!proposal || proposal.productOwnerId !== productOwnerId) {
    return { success: false, error: "Unauthorized" };
  }

  if (proposal.status !== "pending") {
    return { success: false, error: "Proposal already processed" };
  }

  await db
    .update(projectProposals)
    .set({
      status: "rejected",
      rejectionReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(projectProposals.id, proposalId));

  // Notify group leader
  await db.insert(notifications).values({
    userId: proposal.leaderId,
    userType: "freelancer",
    title: "تم رفض مقترح المشروع",
    message: `تم رفض مقترحك "${proposal.title}"`,
    type: "proposal_rejected",
  });

  return { success: true };
}

// ============================================
// TASK MANAGEMENT
// ============================================

export async function createTask(data: InsertProjectTask): Promise<ProjectTask> {
  const [task] = await db.insert(projectTasks).values(data).returning();
  return task;
}

export async function getTask(id: string): Promise<ProjectTask | undefined> {
  const [task] = await db
    .select()
    .from(projectTasks)
    .where(eq(projectTasks.id, id));
  return task;
}

export async function getTasksByProposal(proposalId: string): Promise<ProjectTask[]> {
  return await db
    .select()
    .from(projectTasks)
    .where(eq(projectTasks.proposalId, proposalId))
    .orderBy(desc(projectTasks.createdAt));
}

export async function getTasksByMember(freelancerId: string): Promise<ProjectTask[]> {
  return await db
    .select()
    .from(projectTasks)
    .where(eq(projectTasks.assignedToId, freelancerId))
    .orderBy(desc(projectTasks.createdAt));
}

export async function updateTask(
  id: string,
  updates: Partial<ProjectTask>
): Promise<ProjectTask | undefined> {
  const [updated] = await db
    .update(projectTasks)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(projectTasks.id, id))
    .returning();
  return updated;
}

export async function assignTask(
  taskId: string,
  freelancerId: string
): Promise<ProjectTask | undefined> {
  const [task] = await db
    .update(projectTasks)
    .set({
      assignedToId: freelancerId,
      status: "assigned",
      updatedAt: new Date(),
    })
    .where(eq(projectTasks.id, taskId))
    .returning();

  if (task) {
    // Notify freelancer
    await db.insert(notifications).values({
      userId: freelancerId,
      userType: "freelancer",
      title: "مهمة جديدة",
      message: `تم تعيينك في مهمة: ${task.title}`,
      type: "task_assigned",
    });
  }

  return task;
}

export async function submitTask(
  taskId: string,
  freelancerId: string,
  submissionText: string,
  submissionFiles?: string[]
): Promise<{ success: boolean; error?: string }> {
  const [task] = await db
    .select()
    .from(projectTasks)
    .where(eq(projectTasks.id, taskId));

  if (!task || task.assignedToId !== freelancerId) {
    return { success: false, error: "Unauthorized" };
  }

  if (task.status !== "assigned" && task.status !== "in_progress") {
    return { success: false, error: "Task cannot be submitted" };
  }

  await db
    .update(projectTasks)
    .set({
      status: "submitted",
      submissionText,
      submissionFiles: submissionFiles || [],
      submittedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(projectTasks.id, taskId));

  // Get proposal to notify leader
  const [proposal] = await db
    .select()
    .from(projectProposals)
    .where(eq(projectProposals.id, task.proposalId));

  if (proposal) {
    await db.insert(notifications).values({
      userId: proposal.leaderId,
      userType: "freelancer",
      title: "تم تسليم مهمة",
      message: `تم تسليم مهمة: ${task.title}`,
      type: "task_submitted",
    });
  }

  return { success: true };
}

export async function approveTask(
  taskId: string,
  leaderId: string,
  reviewNotes?: string
): Promise<{ success: boolean; error?: string }> {
  const [task] = await db
    .select()
    .from(projectTasks)
    .where(eq(projectTasks.id, taskId));

  if (!task) {
    return { success: false, error: "Task not found" };
  }

  // Verify leader owns this proposal
  const [proposal] = await db
    .select()
    .from(projectProposals)
    .where(eq(projectProposals.id, task.proposalId));

  if (!proposal || proposal.leaderId !== leaderId) {
    return { success: false, error: "Unauthorized" };
  }

  await db
    .update(projectTasks)
    .set({
      status: "approved",
      reviewedAt: new Date(),
      reviewNotes,
      updatedAt: new Date(),
    })
    .where(eq(projectTasks.id, taskId));

  // Notify assignee
  if (task.assignedToId) {
    await db.insert(notifications).values({
      userId: task.assignedToId,
      userType: "freelancer",
      title: "تم قبول المهمة",
      message: `تم قبول تسليمك للمهمة: ${task.title}`,
      type: "task_approved",
    });
  }

  return { success: true };
}

// ============================================
// DELIVERY & COMPLETION
// ============================================

export async function markProposalAsDelivered(
  proposalId: string,
  leaderId: string
): Promise<{ success: boolean; error?: string }> {
  const [proposal] = await db
    .select()
    .from(projectProposals)
    .where(eq(projectProposals.id, proposalId));

  if (!proposal || proposal.leaderId !== leaderId) {
    return { success: false, error: "Unauthorized" };
  }

  if (proposal.status !== "in_progress" && proposal.status !== "accepted") {
    return { success: false, error: "Invalid status" };
  }

  // Check if all tasks are approved
  const tasks = await db
    .select()
    .from(projectTasks)
    .where(eq(projectTasks.proposalId, proposalId));

  const allApproved = tasks.every((t) => t.status === "approved");

  if (!allApproved && tasks.length > 0) {
    return {
      success: false,
      error: "Not all tasks are approved. Please review all task submissions first.",
    };
  }

  await db
    .update(projectProposals)
    .set({
      status: "delivered",
      deliveredAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(projectProposals.id, proposalId));

  // Notify product owner
  await db.insert(notifications).values({
    userId: proposal.productOwnerId,
    userType: "product_owner",
    title: "تم تسليم المشروع",
    message: `تم تسليم مشروع: ${proposal.title}. يرجى المراجعة والتأكيد`,
    type: "project_delivered",
  });

  return { success: true };
}

export async function confirmDelivery(
  proposalId: string,
  productOwnerId: string
): Promise<{ success: boolean; error?: string }> {
  return await db.transaction(async (tx) => {
    // 1. Get proposal
    const [proposal] = await tx
      .select()
      .from(projectProposals)
      .where(eq(projectProposals.id, proposalId));

    if (!proposal || proposal.productOwnerId !== productOwnerId) {
      return { success: false, error: "Unauthorized" };
    }

    if (proposal.status !== "delivered") {
      return { success: false, error: "Project not marked as delivered" };
    }

    // 2. Get wallets
    const [poWallet] = await tx
      .select()
      .from(productOwnerWallets)
      .where(eq(productOwnerWallets.productOwnerId, productOwnerId));

    const [gWallet] = await tx
      .select()
      .from(groupWallets)
      .where(eq(groupWallets.groupId, proposal.groupId));

    if (!poWallet || !gWallet) {
      return { success: false, error: "Wallet not found" };
    }

    const escrowAmount = parseFloat(proposal.escrowAmount as string);
    const platformFee = parseFloat(proposal.platformFee as string);
    const leaderCommission = parseFloat(proposal.leaderCommission as string);
    const memberPool = parseFloat(proposal.memberPool as string);

    // 3. Release escrow from product owner
    await tx
      .update(productOwnerWallets)
      .set({
        escrowBalance: sql`${productOwnerWallets.escrowBalance} - ${escrowAmount}`,
        totalSpent: sql`${productOwnerWallets.totalSpent} + ${escrowAmount}`,
      })
      .where(eq(productOwnerWallets.id, poWallet.id));

    // 4. Release from group escrow
    await tx
      .update(groupWallets)
      .set({
        escrowBalance: sql`${groupWallets.escrowBalance} - ${escrowAmount}`,
      })
      .where(eq(groupWallets.id, gWallet.id));

    // 5. Distribute funds
    // Platform fee (10%)
    // TODO: Transfer to platform wallet when implemented
    await tx.insert(escrowTransactions).values({
      proposalId,
      transactionType: "distribution",
      amount: platformFee.toString(),
      fromWalletId: gWallet.id,
      fromWalletType: "group",
      toWalletId: "platform",
      toWalletType: "platform",
      status: "completed",
      description: "Platform fee (10%)",
    });

    // Leader commission (3%)
    const [leaderWallet] = await tx
      .select()
      .from(wallets)
      .where(eq(wallets.freelancerId, proposal.leaderId));

    if (leaderWallet) {
      await tx
        .update(wallets)
        .set({
          balance: sql`${wallets.balance} + ${leaderCommission}`,
          totalEarned: sql`${wallets.totalEarned} + ${leaderCommission}`,
        })
        .where(eq(wallets.id, leaderWallet.id));

      await tx.insert(escrowTransactions).values({
        proposalId,
        transactionType: "distribution",
        amount: leaderCommission.toString(),
        fromWalletId: gWallet.id,
        fromWalletType: "group",
        toWalletId: leaderWallet.id,
        toWalletType: "freelancer",
        recipientId: proposal.leaderId,
        status: "completed",
        description: "Leader commission (3%)",
      });
    }

    // Member distribution (87%)
    if (proposal.useCustomDistribution && proposal.customDistribution) {
      // Custom distribution based on task rewards
      const distribution = JSON.parse(proposal.customDistribution);
      
      for (const [memberId, amount] of Object.entries(distribution)) {
        const amountNum = parseFloat(amount as string);
        
        const [memberWallet] = await tx
          .select()
          .from(wallets)
          .where(eq(wallets.freelancerId, memberId));

        if (memberWallet) {
          await tx
            .update(wallets)
            .set({
              balance: sql`${wallets.balance} + ${amountNum}`,
              totalEarned: sql`${wallets.totalEarned} + ${amountNum}`,
            })
            .where(eq(wallets.id, memberWallet.id));

          await tx.insert(escrowTransactions).values({
            proposalId,
            transactionType: "distribution",
            amount: amountNum.toString(),
            fromWalletId: gWallet.id,
            fromWalletType: "group",
            toWalletId: memberWallet.id,
            toWalletType: "freelancer",
            recipientId: memberId,
            status: "completed",
            description: "Task reward",
          });

          // Notify member
          await tx.insert(notifications).values({
            userId: memberId,
            userType: "freelancer",
            title: "تم استلام الأرباح",
            message: `تم إضافة ${amountNum} ريال إلى محفظتك من مشروع: ${proposal.title}`,
            type: "payment_received",
          });
        }
      }
    } else {
      // Equal distribution
      const members = await tx
        .select()
        .from(groupMembers)
        .where(eq(groupMembers.groupId, proposal.groupId));

      const perMember = memberPool / members.length;

      for (const member of members) {
        const [memberWallet] = await tx
          .select()
          .from(wallets)
          .where(eq(wallets.freelancerId, member.freelancerId));

        if (memberWallet) {
          await tx
            .update(wallets)
            .set({
              balance: sql`${wallets.balance} + ${perMember}`,
              totalEarned: sql`${wallets.totalEarned} + ${perMember}`,
            })
            .where(eq(wallets.id, memberWallet.id));

          await tx.insert(escrowTransactions).values({
            proposalId,
            transactionType: "distribution",
            amount: perMember.toString(),
            fromWalletId: gWallet.id,
            fromWalletType: "group",
            toWalletId: memberWallet.id,
            toWalletType: "freelancer",
            recipientId: member.freelancerId,
            status: "completed",
            description: "Equal share distribution",
          });

          // Notify member
          await tx.insert(notifications).values({
            userId: member.freelancerId,
            userType: "freelancer",
            title: "تم استلام الأرباح",
            message: `تم إضافة ${perMember.toFixed(2)} ريال إلى محفظتك من مشروع: ${proposal.title}`,
            type: "payment_received",
          });
        }
      }
    }

    // 6. Update proposal
    await tx
      .update(projectProposals)
      .set({
        status: "completed",
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(projectProposals.id, proposalId));

    // 7. Update conversation
    await tx
      .update(conversations)
      .set({
        totalCompletedProjects: sql`${conversations.totalCompletedProjects} + 1`,
        activeProposalId: null,
      })
      .where(eq(conversations.id, proposal.conversationId));

    // 8. Notify leader
    await tx.insert(notifications).values({
      userId: proposal.leaderId,
      userType: "freelancer",
      title: "تم إكمال المشروع",
      message: `تم تأكيد استلام المشروع وتوزيع الأرباح: ${proposal.title}`,
      type: "project_completed",
    });

    return { success: true };
  });
}

export async function rejectDelivery(
  proposalId: string,
  productOwnerId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const [proposal] = await db
    .select()
    .from(projectProposals)
    .where(eq(projectProposals.id, proposalId));

  if (!proposal || proposal.productOwnerId !== productOwnerId) {
    return { success: false, error: "Unauthorized" };
  }

  if (proposal.status !== "delivered") {
    return { success: false, error: "Project not marked as delivered" };
  }

  // Mark as disputed
  await db
    .update(projectProposals)
    .set({
      status: "disputed",
      disputedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(projectProposals.id, proposalId));

  // Create dispute automatically
  await db.insert(disputes).values({
    proposalId,
    initiatedBy: productOwnerId,
    initiatorType: "product_owner",
    reason: "delivery_rejection",
    description: reason,
    status: "open",
  });

  // Notify leader
  await db.insert(notifications).values({
    userId: proposal.leaderId,
    userType: "freelancer",
    title: "تم رفض التسليم",
    message: `تم رفض تسليم المشروع: ${proposal.title}. تم فتح نزاع`,
    type: "delivery_rejected",
  });

  return { success: true };
}

// ============================================
// DISPUTE MANAGEMENT
// ============================================

export async function createDispute(data: InsertDispute): Promise<Dispute> {
  return await db.transaction(async (tx) => {
    const [dispute] = await tx.insert(disputes).values(data).returning();

    // Update proposal status
    await tx
      .update(projectProposals)
      .set({
        status: "disputed",
        disputedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(projectProposals.id, data.proposalId));

    return dispute;
  });
}

export async function getDispute(id: string): Promise<Dispute | undefined> {
  const [dispute] = await db
    .select()
    .from(disputes)
    .where(eq(disputes.id, id));
  return dispute;
}

export async function getDisputesByStatus(status: string): Promise<Dispute[]> {
  return await db
    .select()
    .from(disputes)
    .where(eq(disputes.status, status))
    .orderBy(desc(disputes.createdAt));
}

export async function getAllDisputes(): Promise<Dispute[]> {
  return await db
    .select()
    .from(disputes)
    .orderBy(desc(disputes.createdAt));
}

export async function resolveDispute(
  disputeId: string,
  adminId: string,
  resolution: string,
  adminNotes: string,
  refundAmount?: number
): Promise<{ success: boolean; error?: string }> {
  return await db.transaction(async (tx) => {
    // 1. Get dispute
    const [dispute] = await tx
      .select()
      .from(disputes)
      .where(eq(disputes.id, disputeId));

    if (!dispute) {
      return { success: false, error: "Dispute not found" };
    }

    if (dispute.status !== "open" && dispute.status !== "under_review") {
      return { success: false, error: "Dispute already resolved" };
    }

    // 2. Get proposal
    const [proposal] = await tx
      .select()
      .from(projectProposals)
      .where(eq(projectProposals.id, dispute.proposalId));

    if (!proposal) {
      return { success: false, error: "Proposal not found" };
    }

    const escrowAmount = parseFloat(proposal.escrowAmount as string);

    // 3. Get wallets
    const [poWallet] = await tx
      .select()
      .from(productOwnerWallets)
      .where(eq(productOwnerWallets.productOwnerId, proposal.productOwnerId));

    const [gWallet] = await tx
      .select()
      .from(groupWallets)
      .where(eq(groupWallets.groupId, proposal.groupId));

    if (!poWallet || !gWallet) {
      return { success: false, error: "Wallet not found" };
    }

    // 4. Execute resolution
    if (resolution === "full_refund") {
      // Return all funds to product owner
      await tx
        .update(productOwnerWallets)
        .set({
          escrowBalance: sql`${productOwnerWallets.escrowBalance} - ${escrowAmount}`,
          availableBalance: sql`${productOwnerWallets.availableBalance} + ${escrowAmount}`,
        })
        .where(eq(productOwnerWallets.id, poWallet.id));

      await tx
        .update(groupWallets)
        .set({
          escrowBalance: sql`${groupWallets.escrowBalance} - ${escrowAmount}`,
        })
        .where(eq(groupWallets.id, gWallet.id));

      await tx.insert(escrowTransactions).values({
        proposalId: proposal.id,
        transactionType: "refund",
        amount: escrowAmount.toString(),
        fromWalletId: gWallet.id,
        fromWalletType: "group",
        toWalletId: poWallet.id,
        toWalletType: "product_owner",
        status: "completed",
        description: "Full refund - Admin dispute resolution",
      });

      // Notify both parties
      await tx.insert(notifications).values({
        userId: proposal.productOwnerId,
        userType: "product_owner",
        title: "تم حل النزاع",
        message: `تم استرداد المبلغ كاملاً للمشروع: ${proposal.title}`,
        type: "dispute_resolved",
      });

      await tx.insert(notifications).values({
        userId: proposal.leaderId,
        userType: "freelancer",
        title: "تم حل النزاع",
        message: `تم استرداد المبلغ لصاحب المشروع: ${proposal.title}`,
        type: "dispute_resolved",
      });
    } else if (resolution === "partial_refund" && refundAmount) {
      // Partial refund
      const paymentAmount = escrowAmount - refundAmount;

      // Refund to product owner
      await tx
        .update(productOwnerWallets)
        .set({
          escrowBalance: sql`${productOwnerWallets.escrowBalance} - ${refundAmount}`,
          availableBalance: sql`${productOwnerWallets.availableBalance} + ${refundAmount}`,
        })
        .where(eq(productOwnerWallets.id, poWallet.id));

      await tx.insert(escrowTransactions).values({
        proposalId: proposal.id,
        transactionType: "refund",
        amount: refundAmount.toString(),
        fromWalletId: gWallet.id,
        fromWalletType: "group",
        toWalletId: poWallet.id,
        toWalletType: "product_owner",
        status: "completed",
        description: "Partial refund - Admin dispute resolution",
      });

      // Release remaining to group (distribute it)
      // This is simplified - in production you'd call confirmDelivery with custom amount
      await tx
        .update(groupWallets)
        .set({
          escrowBalance: sql`${groupWallets.escrowBalance} - ${escrowAmount}`,
          availableBalance: sql`${groupWallets.availableBalance} + ${paymentAmount}`,
        })
        .where(eq(groupWallets.id, gWallet.id));
    } else if (resolution === "full_payment") {
      // Release full payment to group
      // Trigger the distribution (simplified here)
      await tx
        .update(projectProposals)
        .set({
          status: "delivered", // Set back to delivered so confirmDelivery can be called
          updatedAt: new Date(),
        })
        .where(eq(projectProposals.id, proposal.id));

      // In production, you'd call confirmDelivery here
    }

    // 5. Update dispute
    await tx
      .update(disputes)
      .set({
        status: "resolved",
        adminId,
        adminNotes,
        resolution,
        refundAmount: refundAmount?.toString(),
        resolvedAt: new Date(),
      })
      .where(eq(disputes.id, disputeId));

    // 6. Update proposal
    await tx
      .update(projectProposals)
      .set({
        status: resolution === "full_payment" ? "delivered" : "completed",
        updatedAt: new Date(),
      })
      .where(eq(projectProposals.id, proposal.id));

    return { success: true };
  });
}

// ============================================
// ESCROW TRANSACTION QUERIES
// ============================================

export async function getEscrowTransactionsByProposal(
  proposalId: string
): Promise<EscrowTransaction[]> {
  return await db
    .select()
    .from(escrowTransactions)
    .where(eq(escrowTransactions.proposalId, proposalId))
    .orderBy(desc(escrowTransactions.createdAt));
}

export async function getEscrowTransactionsByWallet(
  walletId: string,
  walletType: string
): Promise<EscrowTransaction[]> {
  return await db
    .select()
    .from(escrowTransactions)
    .where(
      or(
        and(
          eq(escrowTransactions.fromWalletId, walletId),
          eq(escrowTransactions.fromWalletType, walletType)
        ),
        and(
          eq(escrowTransactions.toWalletId, walletId),
          eq(escrowTransactions.toWalletType, walletType)
        )
      )
    )
    .orderBy(desc(escrowTransactions.createdAt));
}
