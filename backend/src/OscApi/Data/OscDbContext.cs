using Microsoft.EntityFrameworkCore;
using OscApi.Models;

namespace OscApi.Data;

public class OscDbContext : DbContext
{
    public OscDbContext(DbContextOptions<OscDbContext> options) : base(options) { }

    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();
    public DbSet<User> Users => Set<User>();
    public DbSet<FormDraft> FormDrafts => Set<FormDraft>();
    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<TicketMessage> TicketMessages => Set<TicketMessage>();
    public DbSet<TicketDocument> TicketDocuments => Set<TicketDocument>();
    public DbSet<InvestorProfile> InvestorProfiles => Set<InvestorProfile>();
    public DbSet<AgencyMessage> AgencyMessages => Set<AgencyMessage>();
    public DbSet<ChatEnquiry> ChatEnquiries => Set<ChatEnquiry>();
    public DbSet<ContactInquiry> ContactInquiries => Set<ContactInquiry>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
    public DbSet<AnalyticsEvent> AnalyticsEvents => Set<AnalyticsEvent>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<BusinessRegistration> BusinessRegistrations => Set<BusinessRegistration>();

    public override int SaveChanges()
    {
        SetUpdatedTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        SetUpdatedTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Stamps <see cref="IAuditable.UpdatedAt"/> on every modified entity that opts
    /// into it, dispatched by the interface rather than a property-name lookup — so
    /// it's compiler-checked and applies polymorphically to any current or future
    /// <see cref="AuditableEntity"/>.
    /// </summary>
    private void SetUpdatedTimestamps()
    {
        foreach (var entry in ChangeTracker.Entries<IAuditable>())
        {
            if (entry.State == EntityState.Modified)
                entry.Entity.UpdatedAt = DateTimeOffset.UtcNow;
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // AdminUser
        modelBuilder.Entity<AdminUser>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.HasIndex(u => u.PasswordResetToken);  // For token verification lookups
            e.HasIndex(u => u.AgencyCode);  // For agency officer access scoping
        });

        // User (regular end users / investors)
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
        });

        // FormDraft — one draft per (user, form type)
        modelBuilder.Entity<FormDraft>(e =>
        {
            e.HasIndex(d => new { d.UserEmail, d.FormType }).IsUnique();
        });

        // Ticket
        modelBuilder.Entity<Ticket>(e =>
        {
            e.HasIndex(t => t.ReferenceNumber).IsUnique();
            e.HasIndex(t => t.ContactEmail);
            e.HasIndex(t => new { t.Status, t.CreatedAt });
            e.HasIndex(t => t.IsEscalated).HasFilter("\"IsEscalated\" = true");

            e.Property(t => t.Category).HasConversion<string>();
            e.Property(t => t.Priority).HasConversion<string>();
            e.Property(t => t.Status).HasConversion<string>();

            e.HasMany(t => t.Messages)
                .WithOne(m => m.Ticket)
                .HasForeignKey(m => m.TicketId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasMany(t => t.Documents)
                .WithOne(d => d.Ticket)
                .HasForeignKey(d => d.TicketId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // TicketMessage
        modelBuilder.Entity<TicketMessage>(e =>
        {
            e.Property(m => m.AuthorRole).HasConversion<string>();
        });

        // InvestorProfile
        modelBuilder.Entity<InvestorProfile>(e =>
        {
            e.HasIndex(i => i.ReferenceNumber).IsUnique();
            e.HasIndex(i => i.Email).IsUnique();

            e.Property(i => i.InvestorType).HasConversion<string>();
            e.Property(i => i.Experience).HasConversion<string>();
            e.Property(i => i.InvestmentGoal).HasConversion<string>();
            e.Property(i => i.TimeHorizon).HasConversion<string>();
            e.Property(i => i.RiskTolerance).HasConversion<string>();
            e.Property(i => i.CapitalSource).HasConversion<string>();
            e.Property(i => i.Timeframe).HasConversion<string>();
            e.Property(i => i.Status).HasConversion<string>();
        });

        // AgencyMessage
        modelBuilder.Entity<AgencyMessage>(e =>
        {
            e.HasIndex(m => new { m.Channel, m.SentAt });
        });

        // ChatEnquiry
        modelBuilder.Entity<ChatEnquiry>(e =>
        {
            e.HasIndex(c => new { c.SessionId, c.CreatedAt });
            e.HasIndex(c => c.CreatedAt);

            e.Property(c => c.Language).HasConversion<string>();
            e.Property(c => c.Sentiment).HasConversion<string>();
            e.Property(c => c.Tier).HasConversion<string>();
        });

        // ContactInquiry
        modelBuilder.Entity<ContactInquiry>(e =>
        {
            e.HasIndex(i => i.ReferenceNumber).IsUnique();
            e.HasIndex(i => i.AgencyCode);
            e.HasIndex(i => i.ContactEmail);
            e.Property(i => i.Urgency).HasConversion<string>();
            e.Property(i => i.Status).HasConversion<string>();
        });

        // Appointment
        modelBuilder.Entity<Appointment>(e =>
        {
            e.HasIndex(a => a.ReferenceNumber).IsUnique();
            e.HasIndex(a => a.AgencyCode);
            e.HasIndex(a => a.ContactEmail);
            e.Property(a => a.MeetingType).HasConversion<string>();
            e.Property(a => a.Status).HasConversion<string>();
        });

        // AnalyticsEvent
        modelBuilder.Entity<AnalyticsEvent>(e =>
        {
            e.HasIndex(a => new { a.EventType, a.CreatedAt });
            e.HasIndex(a => a.CreatedAt);
        });

        // AuditLog
        modelBuilder.Entity<AuditLog>(e =>
        {
            e.HasIndex(a => a.Timestamp);
            e.HasIndex(a => a.ActorEmail);
            e.HasIndex(a => a.Action);  // For filtering by action type
            e.HasIndex(a => new { a.Timestamp, a.ActorEmail });  // For audit report queries
        });

        // BusinessRegistration
        modelBuilder.Entity<BusinessRegistration>(e =>
        {
            e.HasIndex(r => r.ReferenceNumber).IsUnique();
            e.HasIndex(r => r.ContactEmail);
            e.HasIndex(r => r.BusinessName);  // For the name-availability check
            e.HasIndex(r => r.AssignedAgencyCode);
            e.Property(r => r.Status).HasConversion<string>();
        });

        // Admin seeding handled in Program.cs (upsert-style) to avoid migration conflicts
    }
}
