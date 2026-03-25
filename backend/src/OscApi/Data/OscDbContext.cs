using Microsoft.EntityFrameworkCore;
using OscApi.Models;

namespace OscApi.Data;

public class OscDbContext : DbContext
{
    public OscDbContext(DbContextOptions<OscDbContext> options) : base(options) { }

    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();
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

    private void SetUpdatedTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            var prop = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "UpdatedAt");
            if (prop is not null)
                prop.CurrentValue = DateTimeOffset.UtcNow;
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // AdminUser
        modelBuilder.Entity<AdminUser>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
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

        // Admin seeding handled in Program.cs (upsert-style) to avoid migration conflicts
    }
}
