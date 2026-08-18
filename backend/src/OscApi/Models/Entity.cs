using System.ComponentModel.DataAnnotations;

namespace OscApi.Models;

/// <summary>
/// Base for every entity keyed by a server-generated <see cref="Guid"/>.
/// Centralizes the identity property so it isn't redeclared per model.
/// </summary>
public abstract class Entity
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
}

/// <summary>
/// Implemented by any entity that tracks a creation and last-modified timestamp.
/// <see cref="Data.OscDbContext"/> uses this (not a property-name reflection lookup)
/// to stamp <see cref="UpdatedAt"/> on save, so the check is compiler-verified and
/// works polymorphically across every entity type that opts in.
/// </summary>
public interface IAuditable
{
    DateTimeOffset CreatedAt { get; set; }
    DateTimeOffset UpdatedAt { get; set; }
}

/// <summary>
/// Base for entities that record both a creation time and a last-modified time
/// (as opposed to append-only records that only ever have one timestamp).
/// </summary>
public abstract class AuditableEntity : Entity, IAuditable
{
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
