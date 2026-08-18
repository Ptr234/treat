using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OscApi.Models;

/// <summary>
/// A resumable, server-side draft of a multi-step form (e.g. investor
/// onboarding, business registration) owned by a signed-in user. One draft
/// per (user, form type) — saving upserts. Lets users resume across devices.
/// </summary>
[Table("form_drafts")]
public class FormDraft : AuditableEntity
{
    /// <summary>Owner — the signed-in user's login email (lower-cased).</summary>
    [Required, MaxLength(255)]
    public string UserEmail { get; set; } = string.Empty;

    /// <summary>Form identifier, e.g. "investor_onboarding", "business_registration".</summary>
    [Required, MaxLength(50)]
    public string FormType { get; set; } = string.Empty;

    /// <summary>Serialized form state (JSON).</summary>
    [Required]
    [Column(TypeName = "text")]
    public string Data { get; set; } = "{}";
}
