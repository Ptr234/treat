using Microsoft.EntityFrameworkCore;

namespace OscApi.Common;

public static class DbRetry
{
    /// <summary>
    /// Save a newly-added entity whose reference number must be unique, tolerating
    /// the race where two concurrent requests generate the same number. The
    /// <paramref name="assignReference"/> delegate (re)computes and assigns a fresh
    /// reference number onto the tracked entity; on a unique-constraint violation
    /// (Postgres SQLSTATE 23505) it is called again and the insert retried. Without
    /// this, concurrent ticket/investor/appointment creation returns a 500 and loses
    /// the submission.
    /// </summary>
    public static async Task SaveWithUniqueReferenceAsync(
        this DbContext db, Func<Task> assignReference, int maxAttempts = 5)
    {
        for (var attempt = 1; ; attempt++)
        {
            await assignReference();
            try
            {
                await db.SaveChangesAsync();
                return;
            }
            catch (DbUpdateException ex) when (
                attempt < maxAttempts &&
                ex.InnerException is Npgsql.PostgresException { SqlState: "23505" })
            {
                // Another request claimed the same reference number first — the
                // implicit transaction rolled back, the entity is still tracked as
                // Added. Regenerate the reference and retry the insert.
            }
        }
    }
}
