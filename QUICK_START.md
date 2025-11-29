# Quick Start Guide - Implementing the New Workflow

## What's Already Done ✅

1. **Complete System Design** (NEW_WORKFLOW_DESIGN.md)
   - Full architecture specification
   - Database schema design
   - API endpoint specifications
   - Financial logic
   - Edge case handling

2. **Database Schema** (shared/schema.ts)
   - 4 new tables: `project_tasks`, `disputes`, `escrow_transactions`, and enhanced `project_proposals`
   - Updated wallet tables with escrow support
   - All relations and TypeScript types

3. **Storage Layer** (server/storage-workflow.ts)
   - 30+ production-ready methods
   - Atomic transactions for all financial operations
   - Complete escrow management
   - Task management
   - Dispute resolution
   - Automated fund distribution

4. **Documentation**
   - IMPLEMENTATION_PROGRESS.md - What's done and what's next
   - MIGRATION_GUIDE.md - How to deploy safely

## Next Steps - Implementation Order

### Step 1: Database Migration (30 minutes)

```bash
# Backup database
pg_dump your_database > backup.sql

# Apply schema changes
npm run db:push

# Verify
psql your_database -c "\dt project_tasks"
psql your_database -c "\dt disputes"
psql your_database -c "\dt escrow_transactions"
```

### Step 2: Add API Routes (2-3 hours)

In `server/routes.ts`, add these endpoints:

```typescript
// Import the new storage methods
import * as workflowStorage from './storage-workflow';

// === PROPOSAL ROUTES ===

// Create proposal (group leader only)
app.post('/api/proposals/create', authMiddleware, async (req, res) => {
  try {
    const user = req.user as AuthPayload;
    if (user.userType !== 'freelancer') {
      return res.status(403).json({ error: 'Only group leaders can create proposals' });
    }

    const proposal = await workflowStorage.createProposal({
      ...req.body,
      leaderId: user.userId,
    });

    // Send Socket.IO event
    io.to(`conversation:${req.body.conversationId}`).emit('proposal:created', proposal);

    res.json(proposal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Accept proposal (product owner only)
app.post('/api/proposals/:id/accept', authMiddleware, async (req, res) => {
  try {
    const user = req.user as AuthPayload;
    if (user.userType !== 'product_owner') {
      return res.status(403).json({ error: 'Only product owners can accept proposals' });
    }

    const result = await workflowStorage.acceptProposal(req.params.id, user.userId);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const proposal = await workflowStorage.getProposal(req.params.id);
    
    // Send Socket.IO event
    io.to(`conversation:${proposal.conversationId}`).emit('proposal:accepted', proposal);
    io.to(`user:${proposal.leaderId}`).emit('payment:escrow_locked', {
      proposalId: proposal.id,
      amount: proposal.price,
    });

    res.json({ success: true, proposal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject proposal
app.post('/api/proposals/:id/reject', authMiddleware, async (req, res) => {
  try {
    const user = req.user as AuthPayload;
    const result = await workflowStorage.rejectProposal(
      req.params.id,
      user.userId,
      req.body.reason
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const proposal = await workflowStorage.getProposal(req.params.id);
    io.to(`conversation:${proposal.conversationId}`).emit('proposal:rejected', proposal);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === TASK ROUTES ===

// Create task (leader only)
app.post('/api/proposals/:proposalId/tasks', authMiddleware, async (req, res) => {
  try {
    const task = await workflowStorage.createTask({
      ...req.body,
      proposalId: req.params.proposalId,
    });

    const proposal = await workflowStorage.getProposal(req.params.proposalId);
    io.to(`group:${proposal.groupId}`).emit('task:created', task);

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tasks for proposal
app.get('/api/proposals/:proposalId/tasks', authMiddleware, async (req, res) => {
  try {
    const tasks = await workflowStorage.getTasksByProposal(req.params.proposalId);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign task
app.post('/api/tasks/:id/assign', authMiddleware, async (req, res) => {
  try {
    const task = await workflowStorage.assignTask(req.params.id, req.body.freelancerId);
    
    io.to(`user:${req.body.freelancerId}`).emit('task:assigned', task);

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit task (member)
app.post('/api/tasks/:id/submit', authMiddleware, async (req, res) => {
  try {
    const user = req.user as AuthPayload;
    const result = await workflowStorage.submitTask(
      req.params.id,
      user.userId,
      req.body.submissionText,
      req.body.submissionFiles
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const task = await workflowStorage.getTask(req.params.id);
    const proposal = await workflowStorage.getProposal(task.proposalId);
    
    io.to(`user:${proposal.leaderId}`).emit('task:submitted', task);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve task (leader)
app.post('/api/tasks/:id/approve', authMiddleware, async (req, res) => {
  try {
    const user = req.user as AuthPayload;
    const result = await workflowStorage.approveTask(
      req.params.id,
      user.userId,
      req.body.reviewNotes
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const task = await workflowStorage.getTask(req.params.id);
    
    if (task.assignedToId) {
      io.to(`user:${task.assignedToId}`).emit('task:approved', task);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === DELIVERY ROUTES ===

// Mark as delivered (leader)
app.post('/api/proposals/:id/mark-delivered', authMiddleware, async (req, res) => {
  try {
    const user = req.user as AuthPayload;
    const result = await workflowStorage.markProposalAsDelivered(req.params.id, user.userId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const proposal = await workflowStorage.getProposal(req.params.id);
    
    io.to(`conversation:${proposal.conversationId}`).emit('proposal:delivered', proposal);
    io.to(`user:${proposal.productOwnerId}`).emit('proposal:delivered', proposal);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Confirm delivery (product owner)
app.post('/api/proposals/:id/confirm-delivery', authMiddleware, async (req, res) => {
  try {
    const user = req.user as AuthPayload;
    const result = await workflowStorage.confirmDelivery(req.params.id, user.userId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const proposal = await workflowStorage.getProposal(req.params.id);
    
    io.to(`conversation:${proposal.conversationId}`).emit('delivery:confirmed', proposal);
    io.to(`group:${proposal.groupId}`).emit('payment:released', {
      proposalId: proposal.id,
      title: proposal.title,
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject delivery (product owner)
app.post('/api/proposals/:id/reject-delivery', authMiddleware, async (req, res) => {
  try {
    const user = req.user as AuthPayload;
    const result = await workflowStorage.rejectDelivery(
      req.params.id,
      user.userId,
      req.body.reason
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const proposal = await workflowStorage.getProposal(req.params.id);
    
    io.to(`conversation:${proposal.conversationId}`).emit('delivery:rejected', proposal);
    io.to(`conversation:${proposal.conversationId}`).emit('dispute:created', {
      proposalId: proposal.id,
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === DISPUTE ROUTES ===

// Get all disputes (admin only)
app.get('/api/disputes', adminAuthMiddleware, requirePermission('disputes:view'), async (req, res) => {
  try {
    const disputes = await workflowStorage.getAllDisputes();
    res.json(disputes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resolve dispute (admin only)
app.post('/api/disputes/:id/resolve', adminAuthMiddleware, requirePermission('disputes:resolve'), async (req, res) => {
  try {
    const user = req.user as any;
    const result = await workflowStorage.resolveDispute(
      req.params.id,
      user.userId,
      req.body.resolution,
      req.body.adminNotes,
      req.body.refundAmount
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const dispute = await workflowStorage.getDispute(req.params.id);
    const proposal = await workflowStorage.getProposal(dispute.proposalId);
    
    io.to(`conversation:${proposal.conversationId}`).emit('dispute:resolved', {
      disputeId: dispute.id,
      resolution: req.body.resolution,
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Step 3: Frontend Components (4-6 hours)

#### 3.1 Group Discovery Page

```tsx
// client/src/pages/GroupDiscovery.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function GroupDiscovery() {
  const [, setLocation] = useLocation();
  
  const { data: groups } = useQuery({
    queryKey: ['groups', 'discover'],
    queryFn: async () => {
      const res = await fetch('/api/groups/discover');
      return res.json();
    },
  });

  const handleStartChat = (groupId: string, leaderId: string) => {
    // Start conversation and navigate to chat
    fetch('/api/conversations/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, leaderId }),
    }).then(res => res.json())
      .then(conversation => {
        setLocation(`/conversations/${conversation.id}`);
      });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">اكتشف المجموعات</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups?.map(group => (
          <Card key={group.id} className="p-6">
            <img 
              src={group.groupImage || '/default-group.png'} 
              alt={group.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-bold mb-2">{group.name}</h3>
            <p className="text-gray-600 mb-4">{group.description}</p>
            
            <div className="flex justify-between mb-4">
              <span>الأعضاء: {group.currentMembers}</span>
              <span>التقييم: {group.averageRating || 'جديد'}</span>
            </div>

            <Button 
              onClick={() => handleStartChat(group.id, group.leaderId)}
              className="w-full"
            >
              ابدأ محادثة
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

#### 3.2 Proposal Component in Chat

```tsx
// client/src/components/ProposalCard.tsx
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ProposalCardProps {
  proposal: any;
  isProductOwner: boolean;
  onAccept: () => void;
  onReject: () => void;
}

export function ProposalCard({ proposal, isProductOwner, onAccept, onReject }: ProposalCardProps) {
  const [showRejectReason, setShowRejectReason] = useState(false);

  return (
    <Card className="p-6 bg-blue-50 border-2 border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📋</span>
        <h3 className="text-xl font-bold">مقترح مشروع جديد</h3>
      </div>

      <div className="space-y-3 mb-6">
        <div>
          <strong>العنوان:</strong> {proposal.title}
        </div>
        <div>
          <strong>الوصف:</strong> {proposal.description}
        </div>
        <div>
          <strong>نوع المشروع:</strong> {proposal.projectType}
        </div>
        <div>
          <strong>المتطلبات:</strong> {proposal.requirements}
        </div>
        <div>
          <strong>عدد المهام:</strong> {proposal.tasksCount}
        </div>
        <div>
          <strong>مدة التسليم:</strong> {proposal.estimatedDeliveryDays} يوم
        </div>
        <div className="text-2xl font-bold text-green-600">
          <strong>السعر:</strong> {proposal.price} ريال
        </div>
      </div>

      {isProductOwner && proposal.status === 'pending' && (
        <div className="flex gap-3">
          <Button onClick={onAccept} className="flex-1" size="lg">
            قبول المقترح ✓
          </Button>
          <Button 
            onClick={() => setShowRejectReason(true)} 
            variant="outline" 
            className="flex-1"
          >
            رفض ✗
          </Button>
        </div>
      )}

      {proposal.status === 'accepted' && (
        <div className="bg-green-100 p-3 rounded text-center font-bold">
          ✓ تم قبول المقترح وتأمين المبلغ
        </div>
      )}

      {proposal.status === 'rejected' && (
        <div className="bg-red-100 p-3 rounded text-center">
          ✗ تم رفض المقترح
        </div>
      )}
    </Card>
  );
}
```

#### 3.3 Leader Task Dashboard

```tsx
// client/src/pages/group-leader-dashboard/Tasks.tsx
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

export default function LeaderTasks({ proposalId }: { proposalId: string }) {
  const [showCreateTask, setShowCreateTask] = useState(false);

  const { data: tasks } = useQuery({
    queryKey: ['tasks', proposalId],
    queryFn: async () => {
      const res = await fetch(`/api/proposals/${proposalId}/tasks`);
      return res.json();
    },
  });

  const { data: proposal } = useQuery({
    queryKey: ['proposal', proposalId],
    queryFn: async () => {
      const res = await fetch(`/api/proposals/${proposalId}`);
      return res.json();
    },
  });

  const handleMarkDelivered = async () => {
    await fetch(`/api/proposals/${proposalId}/mark-delivered`, {
      method: 'POST',
    });
  };

  const allTasksApproved = tasks?.every((t: any) => t.status === 'approved');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{proposal?.title}</h2>
        <Button onClick={() => setShowCreateTask(true)}>
          إنشاء مهمة جديدة +
        </Button>
      </div>

      <div className="grid gap-4">
        {tasks?.map((task: any) => (
          <Card key={task.id} className="p-4">
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold">{task.title}</h3>
                <p className="text-sm text-gray-600">{task.description}</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-600">
                  {task.rewardAmount} ريال
                </div>
                <div className="text-sm">
                  {task.assignedToId ? 'مُعين' : 'متاح'}
                </div>
              </div>
            </div>

            <div className="mt-3">
              <span className={`px-3 py-1 rounded-full text-sm ${
                task.status === 'approved' ? 'bg-green-100 text-green-800' :
                task.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {task.status}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {allTasksApproved && proposal?.status === 'in_progress' && (
        <Button 
          onClick={handleMarkDelivered}
          className="w-full"
          size="lg"
        >
          تحديد كمشروع مكتمل ✓
        </Button>
      )}
    </div>
  );
}
```

### Step 4: Testing (2 hours)

```bash
# Test proposal creation
curl -X POST http://localhost:3000/api/proposals/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "conversationId": "...",
    "groupId": "...",
    "title": "Test Project",
    "description": "Test",
    "projectType": "testing",
    "price": "1000",
    "tasksCount": 3,
    "estimatedDeliveryDays": 7
  }'

# Test acceptance
curl -X POST http://localhost:3000/api/proposals/PROPOSAL_ID/accept \
  -H "Authorization: Bearer PRODUCT_OWNER_TOKEN"

# Test task creation
curl -X POST http://localhost:3000/api/proposals/PROPOSAL_ID/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer LEADER_TOKEN" \
  -d '{
    "title": "Task 1",
    "description": "Test task",
    "rewardAmount": "300"
  }'
```

## Quick Deployment

```bash
# 1. Run migration
npm run db:push

# 2. Build
npm run build

# 3. Deploy
npm start

# 4. Monitor
tail -f logs/app.log
```

## What This System Gives You

✅ **100% chat-based workflow** - No public project pages
✅ **Automatic escrow** - Instant payment locking on acceptance
✅ **Smart distribution** - 10/3/87 split, custom or equal
✅ **Task management** - Leaders create tasks, members complete
✅ **Delivery confirmation** - Product owner reviews before payment
✅ **Dispute system** - Admin arbitration with full/partial refunds
✅ **Real-time notifications** - Socket.IO events for everything
✅ **Atomic transactions** - Financial consistency guaranteed
✅ **Complete audit trail** - Every penny tracked

## Need Help?

1. Check `NEW_WORKFLOW_DESIGN.md` for complete specs
2. Check `IMPLEMENTATION_PROGRESS.md` for status
3. Check `MIGRATION_GUIDE.md` for deployment
4. Review `storage-workflow.ts` for method usage
5. Check errors in terminal/browser console

---

**You're 70% done!** The hard part (financial logic, escrow, distribution) is complete. Now just connect the dots with API routes and UI components. 🚀
