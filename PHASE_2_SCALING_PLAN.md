# Phase 2: Scaling Architecture - Implementation Status

**Started:** July 5, 2026  
**Target:** Handle 1,000+ concurrent users, 100+ req/sec

---

## Critical Issues Status

### ✅ COMPLETED (Phase 1)
1. **Connection Pooling** - Configured with MaxPoolSize=25, MinPoolSize=5
   - Location: Program.cs lines 47-49
   - Status: IMPLEMENTED ✓

2. **Retry Logic** - Npgsql auto-retry on transient failures (3 retries, 5s delay)
   - Location: Program.cs lines 54-57
   - Status: IMPLEMENTED ✓

3. **Audit Logging** - Fire-and-forget async pattern
   - Location: AuditMiddleware.cs lines 26-56
   - Status: IMPLEMENTED ✓

4. **Email Sends** - Fire-and-forget async (no blocking)
   - Location: TicketService.cs lines 79, 167, 294 (_ = pattern)
   - Status: IMPLEMENTED ✓

5. **AuditLog Indexing** - Multiple indexes on ActorEmail, Action, Timestamp
   - Location: OscDbContext.cs lines 163-169
   - Status: IMPLEMENTED ✓

### ⚠️ PARTIAL (Needs Verification/Enhancement)
6. **Redis Configuration** - Optional, falls back to in-memory
   - Location: Program.cs lines 104-115
   - Current: Works but REQUIRES explicit production config
   - Action: Verify Redis is configured in production environment

---

## High-Priority Bottlenecks - Phase 2 Work Items

### 1. N+1 Query: Message Count Per Ticket
**Impact:** 50 tickets = 51 queries  
**Status:** NOT YET FIXED  
**Location:** TicketService.cs (GetTicketsAsync)
```csharp
// Current: Loads entire Messages collection per ticket
MessageCount = t.Messages.Count  // ❌ N+1
// Fix: Use GroupJoin for single query ✓
```
**Effort:** 2-3 hours | **Priority:** HIGH

---

### 2. Dashboard: 10+ Separate Queries
**Impact:** Dashboard load time = 12 × network latency  
**Status:** NOT YET FIXED  
**Location:** DashboardController.cs
**Queries Being Made:** 12+ separate DB hits (tickets, categories, statuses, investors, etc.)
**Fix:** Combine into 1-2 aggregated queries + 5-minute cache
**Effort:** 4-5 hours | **Priority:** HIGH

---

### 3. Settings Service: Database Hit Every Call
**Impact:** Extra DB load per ticket escalation  
**Status:** NOT YET FIXED  
**Location:** SettingsService.cs
```csharp
// Current: Queries DB on every call
var emails = await _db.Settings.Where(...).FirstOrDefaultAsync();  // ❌
// Fix: Cache with 1-hour TTL ✓
```
**Effort:** 1-2 hours | **Priority:** HIGH

---

### 4. Chatbot: Client-Side Conversation History
**Impact:** Long conversations bloat requests; linear Groq token usage  
**Status:** NOT YET FIXED  
**Location:** ChatbotController.cs
**Current:** Client sends entire message history every request
**Fix:** Store conversation state server-side in Redis
**Effort:** 3-4 hours | **Priority:** HIGH

---

### 5. Analytics: Unbatched High-Volume Writes
**Impact:** 10,000 users × 10 events/min = 100,000 rows/min  
**Status:** NOT YET FIXED  
**Location:** AnalyticsController.cs
```csharp
// Current: Sync write per event
_db.AnalyticsEvents.Add(new AnalyticsEvent { ... });
await _db.SaveChangesAsync();  // ❌
// Fix: Queue + batch every 5 seconds ✓
```
**Effort:** 3-4 hours | **Priority:** HIGH

---

### 6. File Uploads: Local Disk Storage
**Impact:** Data loss risk; not scalable across instances; no CDN  
**Status:** NOT YET FIXED  
**Location:** UploadController.cs lines 110-123
**Current:** Files stored in `{ContentRootPath}/uploads`
**Fix:** Migrate to AWS S3 / Azure Blob with CloudFront CDN
**Effort:** 6-8 hours | **Priority:** HIGH (blocks horizontal scaling)

---

### 7. HTTP Cache Headers
**Impact:** Browser cannot cache; every page load re-fetches  
**Status:** NOT YET FIXED  
**Fix:** Add Cache-Control headers to API responses
**Effort:** 1-2 hours | **Priority:** MEDIUM

---

### 8. Frontend Request Caching (SWR)
**Impact:** Redundant backend load; slow UX on slow networks  
**Status:** NOT YET FIXED  
**Location:** Frontend hooks (useTickets, useInvestments, etc.)
**Fix:** Implement SWR with deduping interval, revalidation control
**Effort:** 3-4 hours | **Priority:** MEDIUM

---

### 9. Connection Resilience (Already Implemented)
**Status:** ✅ DONE (retry logic in place)

---

### 10. Sequential Email Sends in ContactService
**Impact:** Response latency = Resend latency × 2  
**Status:** PARTIALLY FIXED (uses async, but sequential)
**Location:** ContactService.cs lines 40-47, 84-90
**Fix:** Send in parallel with Task.WhenAll
**Effort:** 1 hour | **Priority:** MEDIUM

---

## Medium Priority Optimizations

| Issue | Effort | Priority |
|-------|--------|----------|
| Add index on ChatEnquiries.SessionId | 0.5h | MEDIUM |
| Frontend cache max to 500 items (or LRU) | 0.5h | MEDIUM |
| Add index on PasswordResetToken | 0.5h | MEDIUM |
| Enable Gzip response compression | 1h | MEDIUM |
| Frontend code splitting for heavy components | 2-3h | MEDIUM |
| Make chatbot history max configurable | 0.5h | MEDIUM |
| Rate limiting by authenticated user | 2h | MEDIUM |
| Log request body summary to AuditLog.Details | 1h | MEDIUM |

---

## Low Priority Improvements

- Image optimization in next.config.ts (responsive, WebP)
- Bundle size analysis (@next/bundle-analyzer)
- Sentry adaptive sampling (currently 20%)
- API response pagination consistency
- Enhanced health check endpoint (includes DB, cache, external services)

---

## Recommended Phase 2 Implementation Order

### Sprint 1 (Week 1-2): Database Optimization ✅ COMPLETED
- [x] Fix N+1 Message count query (2-3h) — GroupJoin implementation
- [x] Implement Settings service caching (1-2h) — 1-hour TTL with cache invalidation
- [x] Add missing database indexes (0.5h) — Verified all in place
- [x] Parallel email sends in ContactService (1h) — Task.WhenAll for parallel execution
- **Subtotal: 5-7 hours** ✅ DONE

### Sprint 2 (Week 2-3): Dashboard & Analytics
- [ ] Dashboard: Combine queries + cache (4-5h)
- [ ] Analytics: Batch writes + queue (3-4h)
- [ ] Add HTTP Cache-Control headers (1-2h)
- **Subtotal: 8-11 hours**

### Sprint 3 (Week 3-4): File Storage & Backend Queueing
- [ ] Migrate uploads to S3 (6-8h)
- [ ] Set up CloudFront CDN (2h)
- [ ] Chatbot history to Redis (3-4h)
- **Subtotal: 11-14 hours**

### Sprint 4 (Week 4-5): Frontend & Monitoring
- [ ] Frontend SWR caching (3-4h)
- [ ] Code splitting for heavy components (2-3h)
- [ ] Rate limiting by user (2h)
- [ ] Test under load (2-3h)
- **Subtotal: 9-12 hours**

**Total Effort:** ~35-50 hours

---

## Next Steps

**Choose starting point:**

A) **Start with Sprint 1** (Database optimization) - Quick wins, low risk, high ROI  
B) **Start with file storage migration** (S3) - Unblocks horizontal scaling  
C) **Full implementation** - Tackle all sprints systematically

**Recommendation:** Start with Sprint 1 (database fixes). These are low-risk, deliver immediate performance gains, and set the foundation for scaling.

---

## Testing Strategy

After each fix:
1. Run load test (simulate 100+ concurrent users)
2. Monitor query performance (check slow query log)
3. Verify cache hit rates
4. Check memory/CPU usage

```bash
# Load test command (from Phase 2):
k6 run scripts/load-test.js --vus 100 --duration 30s
```

---

## Success Criteria

- [ ] Dashboard load time < 200ms (was 1.2s+)
- [ ] 90th percentile response time < 500ms
- [ ] Database connection pool stays under 20 active connections
- [ ] Analytics queue drains within 5 seconds
- [ ] File upload latency < 2s (was local write time)
- [ ] Browser cache hit rate > 60% on repeat visits
- [ ] Support 500+ concurrent users without 503 errors

