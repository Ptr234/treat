using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OscApi.Models;

[Table("investor_profiles")]
public class InvestorProfile
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(20)]
    public string ReferenceNumber { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(30)]
    public string Phone { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Nationality { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? CompanyName { get; set; }

    [MaxLength(100)]
    public string? Position { get; set; }

    public InvestorType InvestorType { get; set; }
    public InvestorExperience Experience { get; set; }
    public InvestmentGoal InvestmentGoal { get; set; }

    [MaxLength(50)]
    public string InvestmentAmount { get; set; } = string.Empty;

    public TimeHorizon TimeHorizon { get; set; }
    public RiskTolerance RiskTolerance { get; set; }

    [MaxLength(100)]
    public string PrimarySector { get; set; } = string.Empty;

    [Column(TypeName = "jsonb")]
    public string[] SecondarySectors { get; set; } = Array.Empty<string>();

    [MaxLength(2000)]
    public string? SpecificInterests { get; set; }

    public CapitalSource CapitalSource { get; set; }
    public InvestorTimeframe Timeframe { get; set; }

    [Column(TypeName = "jsonb")]
    public string[] SupportNeeded { get; set; } = Array.Empty<string>();

    public InvestorStatus Status { get; set; } = InvestorStatus.New;

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
