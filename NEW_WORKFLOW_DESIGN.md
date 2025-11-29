# Sumou Platform - New Workflow System Design

## Executive Summary
Complete redesign of the Sumou platform workflow to enable chat-based project proposals, escrow payments, dynamic task management, and dispute resolution.

---

## 1. Core Workflow

### Phase 1: Discovery & Connection
1. **Product Owner** creates account with wallet funding
2. **Product Owner** explores groups (browse by country, rating, portfolio)
3. **Product Owner** clicks on group → Opens direct chat with **Group Leader**

### Phase 2: Proposal & Agreement
4. **Group Leader** sends **Project Proposal** in chat containing:
   - Project type/category
   - Detailed requirements
   - Total price
   - Number of tasks
   - Delivery deadline
   - Terms & conditions
5. **Product Owner** reviews proposal in chat
6. **Product Owner** accepts or rejects:
   - **Accept**: Payment deducted from Product Owner wallet → Group wallet (ESCROW)
   - **Reject**: Proposal marked declined, conversation continues

### Phase 3: Execution
7. **Group Leader** accesses Group Dashboard
8. **Group Leader** creates tasks for members:
   - Assigns to specific members OR leaves open
   - Sets individual task rewards (custom distribution)
   - Adds task details, requirements, deadline
9. **Group Members** complete tasks and submit proof
10. **Group Leader** reviews and approves task completions

### Phase 4: Delivery & Payment
11. **Group Leader** marks project as "Completed" in dashboard
12. **Chat notification** sent to Product Owner with "Delivery Confirmation" button
13. **Product Owner** reviews deliverables:
    - **Confirms Delivery**: Automatic fund distribution triggered
      - 10% → Platform fee
      - 3% → Group Leader commission
      - 87% → Group Members (per custom task rewards OR equal split)
    - **Rejects Delivery**: Opens dispute case

### Phase 5: Dispute Resolution (if needed)
14. **Dispute** created with evidence from both parties
15. **Admin** reviews case, evidence, messages
16. **Admin** decides:
    - Full refund to Product Owner
    - Partial refund + partial payment
    - Full payment to Group
17. System executes admin decision automatically

---

## 2. User Roles & Permissions

### Product Owner
- Browse/search groups
- Chat with group leaders
- Review/accept/reject proposals
- Fund wallet
- Confirm deliveries
- Initiate disputes
- Rate groups after completion

### Group Leader
- Manage group profile & portfolio
- Chat with product owners
- Create project proposals
- Create & assign tasks
- Review task submissions
- Mark projects complete
- Participate in dispute resolution
- Set custom reward distribution

### Group Member
- View assigned tasks
- Submit task completions
- Receive funds when project completes
- View group chat & updates

### Admin
- Review disputes
- Arbitrate refunds/releases
- View all transactions
- Manage platform settings
- Monitor escrow balances

---

## 3. Database Schema Changes

### New Tables

#### `project_proposals`
```typescript
{
  id: UUID (PK)
  conversationId: UUID (FK → conversations)
  groupId: UUID (FK → groups)
  leaderId: UUID (FK → freelancers)
  productOwnerId: UUID (FK → productOwners)
  
  title: TEXT
  description: TEXT
  projectType: TEXT
  requirements: TEXT
  price: DECIMAL(10,2)
  tasksCount: INTEGER
  estimatedDeliveryDays: INTEGER
  
  status: ENUM('pending', 'accepted', 'rejected', 'in_progress', 'delivered', 'completed', 'disputed')
  
  // Financial
  escrowAmount: DECIMAL(10,2)
  platformFee: DECIMAL(10,2)      // 10%
  leaderCommission: DECIMAL(10,2)  // 3% of (price - platformFee)
  memberPool: DECIMAL(10,2)        // 87%
  
  // Timestamps
  proposedAt: TIMESTAMP
  acceptedAt: TIMESTAMP
  deliveredAt: TIMESTAMP
  completedAt: TIMESTAMP
  
  // Custom distribution
  useCustomDistribution: BOOLEAN
  customDistribution: JSONB // { memberId: amount }
  
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

#### `project_tasks`
```typescript
{
  id: UUID (PK)
  proposalId: UUID (FK → project_proposals)
  groupId: UUID (FK → groups)
  assignedToId: UUID (FK → freelancers) [nullable]
  
  title: TEXT
  description: TEXT
  requirements: TEXT
  rewardAmount: DECIMAL(10,2)
  
  status: ENUM('open', 'assigned', 'in_progress', 'submitted', 'approved', 'rejected')
  
  submissionText: TEXT
  submissionFiles: TEXT[]
  submittedAt: TIMESTAMP
  reviewedAt: TIMESTAMP
  reviewNotes: TEXT
  
  createdAt: TIMESTAMP
  updatedAt: TIMESTAMP
}
```

#### `disputes`
```typescript
{
  id: UUID (PK)
  proposalId: UUID (FK → project_proposals)
  initiatedBy: UUID // product owner or leader
  initiatorType: ENUM('product_owner', 'group_leader')
  
  reason: TEXT
  description: TEXT
  evidenceFiles: TEXT[]
  
  status: ENUM('open', 'under_review', 'resolved')
  
  // Admin decision
  adminId: UUID (FK → adminUsers) [nullable]
  adminNotes: TEXT
  resolution: ENUM('full_refund', 'partial_refund', 'full_payment') [nullable]
  refundAmount: DECIMAL(10,2) [nullable]
  
  createdAt: TIMESTAMP
  resolvedAt: TIMESTAMP
}
```

#### `escrow_transactions`
```typescript
{
  id: UUID (PK)
  proposalId: UUID (FK → project_proposals)
  
  transactionType: ENUM('lock', 'release', 'refund', 'dispute_resolution')
  amount: DECIMAL(10,2)
  
  fromWalletId: UUID
  fromWalletType: ENUM('product_owner', 'group', 'platform')
  toWalletId: UUID [nullable]
  toWalletType: ENUM('product_owner', 'group', 'platform', 'freelancer') [nullable]
  
  status: ENUM('pending', 'completed', 'failed')
  description: TEXT
  
  createdAt: TIMESTAMP
}
```

### Modified Tables

#### `group_wallets` - Add escrow tracking
```typescript
{
  // ... existing fields
  escrowBalance: DECIMAL(10,2) // Money locked for active projects
  availableBalance: DECIMAL(10,2) // Money ready to distribute
  totalEscrow: DECIMAL(10,2) // Historical escrow total
}
```

#### `product_owner_wallets` - Track escrow
```typescript
{
  // ... existing fields
  escrowBalance: DECIMAL(10,2) // Money locked in active projects
  availableBalance: DECIMAL(10,2) // Money ready to spend
}
```

#### `conversations` - Enhanced tracking
```typescript
{
  // ... existing fields
  activeProposalId: UUID [nullable] // Current active proposal
  totalProposals: INTEGER
  totalCompletedProjects: INTEGER
}
```

#### `conversation_messages` - Support proposal messages
```typescript
{
  // ... existing fields
  messageType: ENUM('text', 'project_proposal', 'proposal_accepted', 'proposal_rejected', 'delivery_notification', 'delivery_confirmed', 'delivery_rejected', 'dispute_opened')
  relatedProposalId: UUID [nullable]
  metadata: JSONB // For storing action buttons, amounts, etc.
}
```

---

## 4. API Endpoints

### Group Discovery
- `GET /api/groups/discover` - List all groups with filters
- `GET /api/groups/:id/public-profile` - View group profile (no projects)
- `GET /api/groups/:id/portfolio` - View portfolio images only

### Conversations & Proposals
- `POST /api/conversations/start` - Start chat with group leader
- `GET /api/conversations/:id` - Get conversation details
- `POST /api/conversations/:id/proposal` - Leader creates proposal
- `PUT /api/proposals/:id/accept` - Product owner accepts
- `PUT /api/proposals/:id/reject` - Product owner rejects
- `GET /api/proposals/:id` - Get proposal details

### Task Management (Group Leader)
- `GET /api/proposals/:id/tasks` - List all tasks for proposal
- `POST /api/proposals/:id/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `PUT /api/tasks/:id/assign` - Assign task to member
- `DELETE /api/tasks/:id` - Delete task (if not started)

### Task Execution (Group Members)
- `GET /api/tasks/my-tasks` - Get assigned tasks
- `PUT /api/tasks/:id/submit` - Submit task completion
- `PUT /api/tasks/:id/approve` - Leader approves (or rejects)

### Delivery & Completion
- `PUT /api/proposals/:id/mark-delivered` - Leader marks as delivered
- `PUT /api/proposals/:id/confirm-delivery` - Product owner confirms
- `PUT /api/proposals/:id/reject-delivery` - Product owner rejects

### Disputes
- `POST /api/proposals/:id/dispute` - Create dispute
- `GET /api/disputes/:id` - Get dispute details
- `POST /api/disputes/:id/evidence` - Add evidence
- `PUT /api/disputes/:id/resolve` - Admin resolves (admin only)

### Wallets & Escrow
- `GET /api/wallets/my-wallet` - Get wallet with escrow details
- `GET /api/wallets/escrow-transactions` - List escrow transactions
- `POST /api/wallets/deposit` - Add funds to wallet

---

## 5. Socket.IO Events

### Conversation Events
- `proposal:created` - New proposal sent
- `proposal:accepted` - Proposal accepted
- `proposal:rejected` - Proposal rejected
- `proposal:delivered` - Project delivered notification
- `delivery:confirmed` - Delivery confirmed
- `delivery:rejected` - Delivery rejected
- `dispute:created` - Dispute opened
- `dispute:resolved` - Dispute resolved

### Task Events
- `task:created` - New task created
- `task:assigned` - Task assigned to member
- `task:submitted` - Task submitted by member
- `task:approved` - Task approved by leader

### Payment Events
- `payment:escrow_locked` - Funds locked in escrow
- `payment:released` - Funds released to members
- `payment:refunded` - Funds refunded to product owner

---

## 6. Wallet Logic & Fund Distribution

### Payment Flow on Proposal Accept

```typescript
// Step 1: Validate Product Owner has sufficient funds
if (productOwnerWallet.availableBalance < proposal.price) {
  throw new Error('Insufficient funds');
}

// Step 2: Lock funds in escrow
productOwnerWallet.availableBalance -= proposal.price;
productOwnerWallet.escrowBalance += proposal.price;
groupWallet.escrowBalance += proposal.price;
proposal.escrowAmount = proposal.price;
proposal.status = 'accepted';

// Step 3: Record escrow transaction
escrowTransaction = {
  type: 'lock',
  amount: proposal.price,
  fromWallet: productOwnerWallet,
  toWallet: groupWallet,
  proposalId: proposal.id
};
```

### Fund Distribution on Delivery Confirmation

```typescript
// Calculate distribution
const platformFee = proposal.price * 0.10; // 10%
const afterPlatformFee = proposal.price - platformFee;
const leaderCommission = afterPlatformFee * 0.03; // 3% of remaining
const memberPool = afterPlatformFee - leaderCommission; // 87%

// Step 1: Platform fee
await transferFunds(groupWallet, platformWallet, platformFee);

// Step 2: Leader commission
await transferFunds(groupWallet, leaderWallet, leaderCommission);

// Step 3: Distribute to members
if (proposal.useCustomDistribution) {
  // Custom distribution based on task rewards
  for (const task of approvedTasks) {
    await transferFunds(groupWallet, task.assignedToWallet, task.rewardAmount);
  }
} else {
  // Equal distribution
  const members = await getGroupMembers(proposal.groupId);
  const perMemberAmount = memberPool / members.length;
  
  for (const member of members) {
    await transferFunds(groupWallet, member.wallet, perMemberAmount);
  }
}

// Step 4: Update balances
groupWallet.escrowBalance -= proposal.price;
productOwnerWallet.escrowBalance -= proposal.price;
proposal.status = 'completed';
```

### Refund on Dispute Resolution

```typescript
// Admin decides refund
if (dispute.resolution === 'full_refund') {
  // Return all funds to product owner
  await transferFunds(groupWallet, productOwnerWallet, proposal.escrowAmount);
  groupWallet.escrowBalance -= proposal.escrowAmount;
  productOwnerWallet.escrowBalance -= proposal.escrowAmount;
  productOwnerWallet.availableBalance += proposal.escrowAmount;
  
} else if (dispute.resolution === 'partial_refund') {
  // Split as per admin decision
  const refundAmount = dispute.refundAmount;
  const paymentAmount = proposal.escrowAmount - refundAmount;
  
  // Refund to product owner
  await transferFunds(groupWallet, productOwnerWallet, refundAmount);
  
  // Distribute remaining to group
  await distributeToGroup(groupWallet, paymentAmount, proposal);
}
```

---

## 7. Edge Cases & Error Handling

### Financial Edge Cases
1. **Insufficient Funds**: Validate before accepting proposal
2. **Concurrent Proposals**: Lock wallet during transaction
3. **Partial Task Completion**: Allow custom distribution per completed tasks
4. **Member Leaves Group**: Hold their share until dispute window closes
5. **Wallet Withdrawal During Escrow**: Block withdrawals of escrowed funds

### Workflow Edge Cases
1. **Leader Deletes Group**: Auto-refund all active escrows
2. **Member Never Completes Task**: Leader can reassign or cancel
3. **Product Owner Account Deleted**: Auto-release funds after 30 days
4. **Multiple Disputes**: Queue and handle sequentially
5. **Proposal Expired**: Auto-decline after 7 days if no response

### Communication Edge Cases
1. **Chat Deleted**: Preserve proposal data separately
2. **Leader Changes**: Transfer proposal ownership
3. **Message Delivery Failure**: Queue and retry with exponential backoff

---

## 8. Security Considerations

### Authorization
- Only group leader can create proposals for their group
- Only product owner in conversation can accept/reject
- Only assigned members can submit tasks
- Only admins can resolve disputes

### Validation
- Validate all monetary amounts (no negatives, max limits)
- Verify wallet balances before any transaction
- Atomic transactions for all fund movements
- Rate limiting on proposal creation (max 5/day per group)

### Audit Trail
- Log all financial transactions
- Store all proposal state changes
- Keep message history even after deletion
- Track all admin actions on disputes

---

## 9. UI/UX Flow

### Product Owner Journey
1. **Dashboard** → "Discover Groups" button
2. **Group Discovery Page**: Cards with group info, ratings, member count
3. Click group → Opens **Conversation Page** (split: chat left, group info right)
4. Receive proposal → **Proposal Card** in chat with details + Accept/Reject buttons
5. Accept → **Payment Modal** → Confirms deduction → Chat shows "Project Active"
6. Receive "Delivered" notification → **Review Deliverables** button in chat
7. Click → **Delivery Review Modal** → Confirm or Reject
8. Confirm → **Success Animation** → Funds distributed notification

### Group Leader Journey
1. **Chat with Product Owner** → "Create Proposal" button in chat header
2. **Proposal Form Modal**: Type, price, requirements, tasks, deadline
3. Submit → Proposal appears in chat for product owner
4. After acceptance → **Group Dashboard** → "Active Projects" tab
5. Click project → **Task Management Page**
6. "Create Task" → Form: title, description, reward, assign to
7. Tasks shown in list → Members submit → Leader reviews
8. All approved → "Mark as Delivered" button
9. Product Owner confirms → **Funds Distributed** notification

### Group Member Journey
1. **Group Dashboard** → "My Tasks" tab
2. See assigned task → Click → **Task Details**
3. "Submit Completion" → Upload proof, add notes
4. Await leader approval
5. On project completion → **Earnings Notification**

### Admin Journey (Disputes)
1. **Admin Dashboard** → "Disputes" section
2. List of open disputes
3. Click dispute → **Dispute Details Page**
4. View: Proposal, Chat History, Evidence from both sides
5. **Resolution Form**: Decision + Notes
6. Submit → System auto-executes financial resolution

---

## 10. Migration Strategy

### Phase 1: Database Migration
1. Create new tables (proposals, tasks, disputes, escrow_transactions)
2. Add new columns to existing tables
3. Migrate existing projects/orders → Mark as legacy
4. Run data integrity checks

### Phase 2: Backend Updates
1. Implement new storage methods
2. Add new API routes
3. Update Socket.IO events
4. Add financial calculation utilities

### Phase 3: Frontend Updates
1. Build group discovery page
2. Enhance conversation UI with proposals
3. Create task management dashboard
4. Build dispute UI
5. Update wallet displays

### Phase 4: Testing & Rollout
1. Test all financial flows in staging
2. Test edge cases and disputes
3. Load testing on escrow transactions
4. Gradual rollout with feature flags

---

## 11. Feature Checklist

### Core Features
- [x] Group discovery without public projects
- [x] Direct chat with group leaders
- [x] In-chat project proposals
- [x] Escrow payment system
- [x] Dynamic task creation
- [x] Custom reward distribution
- [x] Delivery confirmation flow
- [x] Automated fund distribution
- [x] Dispute management
- [x] Admin arbitration

### Advanced Features
- [ ] Proposal templates for leaders
- [ ] Multi-currency support
- [ ] Installment payments
- [ ] Group reputation scoring
- [ ] Automated dispute detection (AI)
- [ ] Portfolio showcase in proposals
- [ ] Video delivery attachments
- [ ] Real-time collaboration tools
- [ ] Export financial reports

---

## 12. Success Metrics

### Platform Health
- Proposal acceptance rate > 60%
- Delivery confirmation rate > 85%
- Dispute rate < 5%
- Average resolution time < 48 hours

### Financial
- Escrow lock success rate > 99%
- Fund distribution accuracy 100%
- Average project value growth
- Platform fee collection rate

### User Engagement
- Messages per proposal: > 10
- Time to first proposal: < 24 hours
- Group-Product Owner retention rate

---

This design provides a complete, production-ready blueprint for the new workflow. Ready to implement!
