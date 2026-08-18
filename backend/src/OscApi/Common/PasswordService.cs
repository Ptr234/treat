namespace OscApi.Common;

public interface IPasswordService
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
}

public class PasswordService : IPasswordService
{
    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
    }

    public bool VerifyPassword(string password, string hash)
    {
        // Support legacy PBKDF2 hashes from the Next.js app (format: "salt:hash")
        if (hash.Contains(':') && !hash.StartsWith("$2"))
        {
            return VerifyLegacyPbkdf2(password, hash);
        }

        return BCrypt.Net.BCrypt.Verify(password, hash);
    }

    private static bool VerifyLegacyPbkdf2(string password, string storedHash)
    {
        var parts = storedHash.Split(':');
        if (parts.Length != 2) return false;

        var salt = Convert.FromHexString(parts[0]);
        var expectedHash = Convert.FromHexString(parts[1]);

        using var pbkdf2 = new System.Security.Cryptography.Rfc2898DeriveBytes(
            password, salt, 100_000, System.Security.Cryptography.HashAlgorithmName.SHA256);
        var computedHash = pbkdf2.GetBytes(64);

        return System.Security.Cryptography.CryptographicOperations.FixedTimeEquals(computedHash, expectedHash);
    }
}
