using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OscApi.Models;

[Table("chat_enquiries")]
public class ChatEnquiry : Entity
{
    [Required, MaxLength(100)]
    public string SessionId { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? UserName { get; set; }

    [MaxLength(255)]
    public string? UserEmail { get; set; }

    [MaxLength(30)]
    public string? UserPhone { get; set; }

    [MaxLength(200)]
    public string? UserLocation { get; set; }

    [Required, MaxLength(2000)]
    public string UserMessage { get; set; } = string.Empty;

    [Required, MaxLength(10000)]
    public string BotResponse { get; set; } = string.Empty;

    public ChatLanguage Language { get; set; } = ChatLanguage.En;
    public ChatSentiment? Sentiment { get; set; }
    public ChatTier Tier { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
