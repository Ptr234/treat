using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OscApi.Models;

[Table("investor_profiles")]
public class InvestorProfile : AuditableEntity
{
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

    /// <summary>
    /// Reference number of a completed URSB <see cref="BusinessRegistration"/> this
    /// investor is linked to, when one was found matching their email and company
    /// name at creation time — so UIA doesn't ask an already-registered business to
    /// re-supply fundamentals URSB already collected. Null when no match was found.
    /// </summary>
    [MaxLength(20)]
    public string? LinkedBusinessRegistrationRef { get; set; }
}
