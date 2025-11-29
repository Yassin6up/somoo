# Database Migration Guide - Old to New Workflow

## Overview
This guide explains how to migrate from the old project/order system to the new chat-based proposal workflow.

## Migration Strategy

### Phase 1: Schema Migration (Safe - Non-Breaking)

The new schema is **additive** - it adds new tables and columns without breaking existing functionality. You can deploy it immediately.

#### New Tables Added
1. `project_tasks` - Task management within proposals
2. `disputes` - Dispute resolution system
3. `escrow_transactions` - Complete audit trail

#### Modified Tables
1. `conversations` - Added `activeProposalId`, `totalProposals`, `totalCompletedProjects`
2. `project_proposals` - Enhanced with escrow fields and timestamps
3. `product_owner_wallets` - Added `availableBalance`, `escrowBalance`
4. `group_wallets` - Added `availableBalance`, `totalEscrowReceived`
5. `conversation_messages` - Added `metadata` field

### Phase 2: Run Database Migration

```bash
# 1. Backup your database first!
pg_dump your_database > backup_$(date +%Y%m%d).sql

# 2. Run Drizzle push to apply schema changes
npm run db:push

# 3. Verify all tables created successfully
psql your_database -c "\dt"
```

### Phase 3: Data Migration (Optional)

If you want to migrate existing projects/orders to the new system:

```sql
-- Mark all existing projects as "legacy"
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_legacy BOOLEAN DEFAULT false;
UPDATE projects SET is_legacy = true WHERE created_at < NOW();

-- Mark all existing orders as "legacy"
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_legacy BOOLEAN DEFAULT false;
UPDATE orders SET is_legacy = true WHERE created_at < NOW();

-- Initialize wallet balances if needed
UPDATE product_owner_wallets 
SET available_balance = balance, escrow_balance = 0
WHERE available_balance IS NULL;

UPDATE group_wallets 
SET available_balance = balance, escrow_balance = 0
WHERE available_balance IS NULL OR escrow_balance IS NULL;
```

### Phase 4: Deploy Backend Changes

```bash
# 1. Add new storage methods (already in storage-workflow.ts)
# 2. Add new API routes (see IMPLEMENTATION_PROGRESS.md)
# 3. Update Socket.IO events
# 4. Deploy with zero downtime:

# Build new version
npm run build

# Deploy with rolling update
# Old code continues serving old routes
# New code adds new routes
# No breaking changes
```

### Phase 5: Deploy Frontend Changes

```bash
# 1. Build group discovery page
# 2. Build proposal UI components
# 3. Build task management
# 4. Build dispute UI
# 5. Update wallet displays

# Deploy with feature flags
# Enable new workflow gradually
```

## Coexistence Period

During migration, both systems can run simultaneously:

### Old System (Still Works)
- `projects` table (marked as legacy)
- `orders` table (marked as legacy)
- Existing project workflow
- Existing order workflow

### New System (New Features)
- Chat-based proposals via `project_proposals`
- Escrow management via `escrow_transactions`
- Task management via `project_tasks`
- Dispute resolution via `disputes`

## API Compatibility

### Deprecated Endpoints (Keep for backward compatibility)
- `POST /api/projects/create` - Old project creation
- `POST /api/orders/create` - Old order creation
- `GET /api/projects` - Old projects list

### New Endpoints
- `POST /api/proposals/create` - New proposal workflow
- `POST /api/proposals/:id/accept` - Escrow-based acceptance
- `POST /api/tasks/create` - Task management
- `POST /api/disputes/create` - Dispute system

## Rollback Plan

If you need to rollback:

```sql
-- 1. Restore database from backup
psql your_database < backup_YYYYMMDD.sql

-- 2. Or manually drop new tables (CAUTION!)
DROP TABLE IF EXISTS escrow_transactions CASCADE;
DROP TABLE IF EXISTS disputes CASCADE;
DROP TABLE IF EXISTS project_tasks CASCADE;

-- 3. Remove added columns
ALTER TABLE conversations DROP COLUMN IF EXISTS active_proposal_id;
ALTER TABLE conversations DROP COLUMN IF EXISTS total_proposals;
ALTER TABLE conversations DROP COLUMN IF EXISTS total_completed_projects;

-- 4. Restore wallet columns
ALTER TABLE product_owner_wallets DROP COLUMN IF EXISTS available_balance;
ALTER TABLE product_owner_wallets DROP COLUMN IF EXISTS escrow_balance;

ALTER TABLE group_wallets DROP COLUMN IF EXISTS available_balance;
ALTER TABLE group_wallets DROP COLUMN IF EXISTS total_escrow_received;
```

## Testing Checklist

Before going live:

### Database
- [ ] Schema migration successful
- [ ] All tables created
- [ ] Indexes created
- [ ] Foreign keys working
- [ ] Default values correct

### Backend
- [ ] Proposal creation works
- [ ] Escrow locking works
- [ ] Fund distribution works
- [ ] Task management works
- [ ] Dispute resolution works
- [ ] Notifications sent

### Frontend
- [ ] Group discovery loads
- [ ] Chat shows proposals
- [ ] Accept/reject buttons work
- [ ] Task dashboard loads
- [ ] Delivery confirmation works
- [ ] Wallet shows escrow

### Financial
- [ ] Balances calculate correctly
- [ ] Platform fee: 10%
- [ ] Leader commission: 3%
- [ ] Member distribution: 87%
- [ ] Escrow locks properly
- [ ] Escrow releases properly
- [ ] Refunds work

### Edge Cases
- [ ] Insufficient funds blocked
- [ ] Concurrent proposals handled
- [ ] Dispute during delivery
- [ ] Member leaves during project
- [ ] Leader changes ownership
- [ ] Group deleted with escrow

## Monitoring

After deployment, monitor:

1. **Database Metrics**
   - Escrow transaction success rate (should be 100%)
   - Failed transaction count (should be 0)
   - Escrow balance accuracy

2. **Application Metrics**
   - Proposal creation rate
   - Acceptance rate (target >60%)
   - Dispute rate (target <5%)
   - Average time to completion

3. **Financial Metrics**
   - Total escrow locked
   - Total funds distributed
   - Platform fees collected
   - Refund amounts

## Support & Troubleshooting

### Common Issues

**Issue: Insufficient funds error**
```sql
-- Check wallet balance
SELECT * FROM product_owner_wallets WHERE product_owner_id = 'xxx';

-- Check if escrow is stuck
SELECT SUM(escrow_amount::numeric) FROM project_proposals 
WHERE status IN ('accepted', 'in_progress', 'delivered') 
AND product_owner_id = 'xxx';
```

**Issue: Escrow not releasing**
```sql
-- Check proposal status
SELECT * FROM project_proposals WHERE id = 'xxx';

-- Check escrow transactions
SELECT * FROM escrow_transactions WHERE proposal_id = 'xxx' ORDER BY created_at DESC;

-- Manual release (ADMIN ONLY)
-- Use storage.confirmDelivery() function
```

**Issue: Distribution mismatch**
```sql
-- Verify distribution calculation
SELECT 
  price::numeric as total,
  platform_fee::numeric as platform_fee,
  leader_commission::numeric as leader_commission,
  member_pool::numeric as member_pool,
  (platform_fee::numeric + leader_commission::numeric + member_pool::numeric) as sum_total
FROM project_proposals WHERE id = 'xxx';

-- Should: sum_total == total
```

## Performance Optimization

After migration:

```sql
-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_proposals_status ON project_proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_group ON project_proposals(group_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_proposal ON project_tasks(proposal_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON project_tasks(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_escrow_proposal ON escrow_transactions(proposal_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);

-- Analyze tables for query optimization
ANALYZE project_proposals;
ANALYZE project_tasks;
ANALYZE escrow_transactions;
ANALYZE disputes;
```

## Success Criteria

Migration is successful when:

1. ✅ All schema changes applied without errors
2. ✅ Existing data intact and accessible
3. ✅ New proposal workflow functional end-to-end
4. ✅ Escrow locking/releasing works correctly
5. ✅ Fund distribution accurate (87/3/10 split)
6. ✅ Task management operational
7. ✅ Dispute resolution working
8. ✅ No degradation in old system performance
9. ✅ Real-time notifications working
10. ✅ All tests passing

## Timeline Recommendation

- **Week 1**: Schema migration + backend storage layer
- **Week 2**: API routes + Socket.IO events
- **Week 3**: Frontend components (discovery, chat, proposals)
- **Week 4**: Task management + dispute UI
- **Week 5**: Integration testing + bug fixes
- **Week 6**: User acceptance testing
- **Week 7**: Gradual rollout to users
- **Week 8**: Monitor + optimize

## Contact & Support

For migration issues:
1. Check logs: `tail -f logs/migration.log`
2. Review IMPLEMENTATION_PROGRESS.md
3. Check NEW_WORKFLOW_DESIGN.md for specs
4. Review storage-workflow.ts for method usage

---

**Remember**: This is a **non-breaking migration**. The old system continues working while the new system is added alongside it. Take your time and test thoroughly!
