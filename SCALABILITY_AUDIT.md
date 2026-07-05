# Scalability Audit Report
**Uganda OSC Digital Tool - Architecture Assessment**

Generated: 2026-07-05

---

## Executive Summary

The codebase is well-structured for MVP but requires **architectural changes** before handling 100+ concurrent users reliably. 

**Key Findings:**
- ✅ Clean separation of concerns (Controllers → Services → Data)
- ✅ Modern tech stack (Next.js 15, .NET 8, PostgreSQL)
- ❌ **5 critical issues** that block production scale
- ❌ **10 high-priority bottlenecks** under load
- ⚠️ Missing distributed infrastructure patterns (Redis, queueing, cloud storage)

---

## 🔴 CRITICAL ISSUES (Fix Before Scale)

### 1. Redis is Optional but Required for Multi-Instance Deployment
**Impact:** Rate limiting multiplies per instance (10 instances = 10× rate limit capacity)

**Status:** In-memory per-process cache only
```csharp
// Program.cs lines 88-104
var redisConn = builder.Configuration.GetConnectionString("Redis");
if (!string.IsNullOrEmpty(redisConn))
{
    builder.Services.AddStackExchangeRedisCache(options => options.Configuration = redisConn);
}
else
{
    builder.Services.AddDistributedMemoryCache();
    Log.Warning("Redis is not configured: distributed cache and rate limiting are in-memory " +
        "and per-instance. Do NOT run more than one backend instance in this mode.");
}
```

**Fix:** Make Redis mandatory in production configuration

---

### 2. Audit Middleware Blocks Response on Database Write
**Impact:** Synchronous audit logging creates bottleneck; 100 req/sec = secondary write surge

**Location:** AuditMiddleware.cs lines 38-46

**Current:** Audit log written synchronously after response completes
```csharp
await _db.AuditLogs.AddAsync(new AuditLog { /* ... */ });
await _db.SaveChangesAsync();
```

**Fix:** Queue to Redis or use fire-and-forget:
```csharp
_ = Task.Run(async () => {
    await _db.AuditLogs.AddAsync(auditLog);
    await _db.SaveChangesAsync();
});
```

---

### 3. Email Sends Not Properly Queued
**Impact:** External API latency (Resend) indirectly slows request handlers

**Locations:**
- TicketService.cs lines 79-80, 167-168, 289-297
- ContactService.cs lines 40-47, 84-90

**Issue:** Fire-and-forget without background queue
```csharp
_ = _email.SendAsync(...)  // Not awaited, not queued
```

**Fix:** Implement background job system (Hangfire/MassTransit) or explicit queueing:
```csharp
await _emailQueue.EnqueueAsync(new EmailJob { To, Subject, Body });
```

---

### 4. No Database Connection Pooling Configuration
**Impact:** Under load, connection exhaustion causes 429/503 errors

**Location:** Program.cs lines 43-47

**Current:** Using Npgsql defaults
```csharp
var dataSourceBuilder = new Npgsql.NpgsqlDataSourceBuilder(connString);
var dataSource = dataSourceBuilder.Build();
```

**Fix:** Explicit pooling configuration:
```csharp
dataSourceBuilder.ConnectionStringBuilder.MaxPoolSize = 25;
dataSourceBuilder.ConnectionStringBuilder.MinPoolSize = 5;
dataSourceBuilder.EnableRetryOnFailure(3, TimeSpan.FromSeconds(5));
```

---

### 5. Unindexed Full-Text Searches on Audit Logs
**Impact:** Dashboard/audit pages slow as AuditLogs grows to millions of rows

**Location:** AuditController.cs lines 28-31

**Current:** LIKE queries without indexes
```csharp
.Where(a => a.ActorEmail.Contains(actor))
.Where(a => a.Action.Contains(action))
```

**Fix:** Add indexes in DbContext OnModelCreating:
```csharp
modelBuilder.Entity<AuditLog>()
    .HasIndex(a => a.ActorEmail);
modelBuilder.Entity<AuditLog>()
    .HasIndex(a => a.Action);
```

---

## 🟠 HIGH PRIORITY (Bottlenecks Under Load)

### 1. N+1 Query: Message Count Per Ticket
**Impact:** 50 tickets = 51 queries; 100 concurrent users = 5,100 queries/sec

**Location:** TicketService.cs lines 35-42
```csharp
MessageCount = t.Messages.Count  // Loads entire collection per ticket
```

**Fix:** Use GroupJoin for single query:
```csharp
.GroupJoin(_db.TicketMessages, t => t.Id, m => m.TicketId,
    (t, msgs) => new { 
        t.Id, 
        MessageCount = msgs.Count() 
    }
)
```

---

### 2. Dashboard Makes 10+ Separate Queries
**Impact:** Dashboard load time = 12 × network latency (1.2s at 100ms latency)

**Location:** DashboardController.cs lines 34-122

**Queries:** Tickets, categories, statuses, investors, chat sessions, inquiries, appointments, escalations, messages, analytics (12 total)

**Fix:** Combine into 1-2 queries + cache entire dashboard for 5 minutes:
```csharp
var cacheKey = "dashboard:admin";
if (!_cache.TryGetValue(cacheKey, out var dashboard))
{
    dashboard = await _db.DashboardStats(); // Single aggregated query
    _cache.Set(cacheKey, dashboard, TimeSpan.FromMinutes(5));
}
return dashboard;
```

---

### 3. Settings Service Queries Database on Every Call
**Impact:** Escalated tickets = extra database load per escalation

**Location:** SettingsService.cs lines 21-25, 58-68

**Issue:** No caching; called during every ticket escalation
```csharp
var emails = await _db.Settings
    .Where(s => s.Key == "EscalationEmails")
    .FirstOrDefaultAsync();
```

**Fix:** Cache in-memory with 1-hour TTL:
```csharp
private IMemoryCache _cache;

public async Task<string[]> GetEscalationEmailsAsync()
{
    if (_cache.TryGetValue("escalation_emails", out string[] cached))
        return cached;
    
    var emails = await _db.Settings.Where(...).ToArrayAsync();
    _cache.Set("escalation_emails", emails, TimeSpan.FromHours(1));
    return emails;
}
```

---

### 4. Chatbot Conversation History: Client-Side Session Storage
**Impact:** Long conversations bloat requests; Groq token usage increases linearly

**Location:** ChatbotController.cs lines 40-46

**Issue:** Client sends entire message history every request
```csharp
// Client sends: [msg1, msg2, ..., msg100]
var recentMessages = messages.TakeLast(10);
```

**Fix:** Store conversation state server-side (Redis):
```csharp
var sessionId = httpContext.Session.Id;
var history = await _redis.GetAsync<Message[]>($"chat:{sessionId}");
if (history == null) history = new Message[0];
// Append new message, store last 10, return to Groq
```

---

### 5. Analytics Writes High Volume Without Batching
**Impact:** 10,000 users × 10 events/min = 100,000 rows/min; unbounded table growth

**Location:** AnalyticsController.cs lines 22-50

**Issue:** Synchronous writes; no batching or async queue
```csharp
_db.AnalyticsEvents.Add(new AnalyticsEvent { /* ... */ });
await _db.SaveChangesAsync();
```

**Fix:** Queue to Redis, batch-insert in background:
```csharp
// In controller: enqueue
await _analyticsQueue.EnqueueAsync(new AnalyticsEvent { /* ... */ });

// In background worker (every 5 seconds):
var batch = await _analyticsQueue.DequeueBatchAsync(100);
_db.AnalyticsEvents.AddRange(batch);
await _db.SaveChangesAsync();
```

---

### 6. File Uploads Stored Locally (Not Cloud-Backed)
**Impact:** Data loss risk on restart; files inaccessible across instances; no CDN

**Location:** UploadController.cs lines 110-123

**Issue:** Files written to `{ContentRootPath}/uploads`

**Fix:** Use cloud storage (AWS S3, Azure Blob, GCS):
```csharp
var s3Client = new AmazonS3Client();
var key = $"uploads/{Guid.NewGuid()}-{file.FileName}";
await s3Client.PutObjectAsync(new PutObjectRequest 
{
    BucketName = "osc-uploads",
    Key = key,
    InputStream = file.OpenReadStream()
});
return $"https://s3.amazonaws.com/osc-uploads/{key}";
```

---

### 7. No HTTP Cache Headers on API Responses
**Impact:** Browser cannot cache; every page load re-fetches identical data

**Fix:** Add Cache-Control headers:
```csharp
// In controller base or middleware
[HttpGet]
public IActionResult GetInvestments()
{
    Response.Headers.CacheControl = "public, max-age=300"; // 5 minutes
    return Ok(_investments);
}
```

---

### 8. Frontend useTickets Hook Refetches on Every Navigation
**Impact:** Redundant backend load; slow UX on slow networks

**Location:** Frontend useTickets hook (no caching, no SWR)

**Fix:** Implement request deduplication + cache:
```typescript
const useTickets = () => {
    const { data, isLoading, error } = useSWR(
        '/api/tickets',
        fetcher,
        { revalidateOnFocus: false, dedupingInterval: 60000 } // Cache 1 min
    );
    return { data, isLoading, error };
};
```

---

### 9. No Connection Resilience/Retry Policy
**Impact:** Temporary Postgres outage = immediate 503 to users

**Location:** Program.cs database configuration

**Fix:** Add retry logic:
```csharp
optionsBuilder.UseNpgsql(connString, o => 
    o.EnableRetryOnFailure(
        maxRetryCount: 3,
        maxRetialDelay: TimeSpan.FromSeconds(5),
        errorCodesToAdd: null
    )
);
```

---

### 10. Sequential Email Sends in ContactService
**Impact:** Response latency = Resend latency × 2

**Location:** ContactService.cs lines 40-47, 84-90

**Fix:** Send in parallel:
```csharp
var emailConfirmation = _email.SendAsync(contactEmail, "Confirmation", body1);
var emailNotification = _email.SendAsync(agencyEmail, "Inquiry", body2);
await Task.WhenAll(emailConfirmation, emailNotification);
```

---

## 🟡 MEDIUM PRIORITY (Optimization Opportunities)

| Issue | Location | Impact | Fix |
|-------|----------|--------|-----|
| No index on ChatEnquiries.SessionId | DashboardController:69 | Slow distinct count on large table | Add `.HasIndex(c => c.SessionId)` |
| Frontend cache max 100 items | cacheManager.ts:17 | Cache full = evictions | Increase to 500 or use LRU |
| Password reset token unindexed | AdminUser model | Token verification slow | Add index on PasswordResetToken |
| No response compression | API config | Network waste (~50KB payloads) | Enable Gzip in middleware |
| No frontend code splitting | next.config.ts | Large initial JS bundle | Dynamic imports for heavy components |
| Chatbot max history hardcoded to 10 | ChatbotController:40 | Inflexible; poor context | Make configurable per user |
| Rate limiting per-IP only | Program.cs:190 | No per-user throttling; CDN bypass | Add authenticated user-based limits |
| AuditLog.Details field unused | AuditLog model | Coarse audit trail | Log request body summary to Details |

---

## 🔵 LOW PRIORITY (Nice-to-Have)

- Image optimization in next.config.ts (responsive, WebP)
- Bundle size analysis (@next/bundle-analyzer)
- Sentry adaptive sampling (currently 20%)
- API response pagination consistency (`{ data, total, page }`)
- Enhanced health check endpoint (includes DB, cache, external services)

---

## Recommended Implementation Timeline

### Phase 1: Foundation (Weeks 1-2)
- [ ] Configure Redis in production
- [ ] Implement connection pooling (Npgsql MaxPoolSize, MinPoolSize)
- [ ] Queue audit logs (fire-and-forget pattern)
- [ ] Add Npgsql retry logic

### Phase 2: Database Optimization (Weeks 3-4)
- [ ] Fix N+1 query (Message count)
- [ ] Combine dashboard queries + cache
- [ ] Add missing indexes (AuditLog, PasswordResetToken, SessionId)
- [ ] Implement Settings service caching

### Phase 3: Infrastructure (Weeks 5-6)
- [ ] Migrate file uploads to cloud storage (S3/Blob)
- [ ] Implement background job system (Hangfire)
- [ ] Queue email sends
- [ ] Queue analytics writes

### Phase 4: Client-Side (Weeks 7-8)
- [ ] Implement frontend request caching (SWR)
- [ ] Add HTTP Cache-Control headers
- [ ] Move chatbot history to server-side (Redis)
- [ ] Code splitting for heavy components

---

## Scale Targets

| Metric | Current | Target | Notes |
|--------|---------|--------|-------|
| Concurrent Users | ~10 | 1,000+ | Requires all critical fixes |
| Requests/Sec | <10 | 100+ | Needs queueing + caching |
| Response Time (p95) | Unknown | <500ms | Requires cache headers + query optimization |
| Database Connections | Default (~100) | 25-50 pooled | Explicit pooling required |
| Session Storage | Per-process | Redis | Multi-instance deployment |
| File Storage | Local disk | Cloud (S3) | Horizontal scaling requirement |
| Audit Log Retention | Unlimited | 90 days + archive | Control table growth |

---

## Architecture Recommendations

**For 100+ concurrent users:**
1. **Distributed Cache:** Redis for sessions, rate limits, settings, dashboard
2. **Background Jobs:** Hangfire or similar for emails, analytics, audit logs
3. **Cloud Storage:** AWS S3 for file uploads (with CloudFront CDN)
4. **Load Balancer:** Nginx/HAProxy distributing to 2-3 backend instances
5. **Database:** PostgreSQL with 25-30 connection pool (RDS or Neon with proper config)
6. **CDN:** CloudFront or similar for static assets, cached API responses
7. **Monitoring:** Application Insights or DataDog for metrics, errors, performance

**For 10,000+ concurrent users:**
- Add read-only replica for analytics queries
- Implement API gateway (Kong, AWS API Gateway)
- Separate ticket write database from read cache
- Consider CQRS pattern for high-volume operations

---

## Cost Impact Analysis

| Component | Current Cost | At Scale Cost | Effort |
|-----------|--------------|---------------|--------|
| Redis (self-hosted) | $0 | $20-50/mo | 4 hours |
| Cloud file storage (S3) | $0 | $50-200/mo | 8 hours |
| Additional backend instance | $0 | $20-50/mo | 2 hours config |
| Background job system | $0 | Open-source | 16 hours |
| Database optimization | $0 | Included | 20 hours |
| **Total effort to scale 100x:** | - | ~**50 hours** | - |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Redis unavailability | Medium | High (rate limiting fails) | Fallback to in-memory; alert on connection loss |
| Database connection exhaustion | High (no pooling) | Critical | Implement connection pooling immediately |
| Email service slowdown | Medium | Medium (blocks requests) | Queue emails; add timeout |
| File storage loss | Low (local only) | Critical | Migrate to cloud storage |
| Audit log table bloat | High (unlimited growth) | Medium (slow queries) | Implement retention policy |

---

## Conclusion

**Current State:** MVP-ready, single-instance deployment
**Scaling Target:** 1,000 concurrent users
**Required Effort:** ~50 hours of architecture + implementation
**Go-Live Recommendation:** Address critical 5 issues before multi-instance deployment

