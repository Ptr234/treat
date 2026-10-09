namespace OscApi.Common;

/// <summary>
/// Where uploaded ticket documents live on disk. Set <c>Uploads:Directory</c> to
/// an absolute path outside the release directory (e.g. <c>/var/www/osc/uploads</c>)
/// so documents survive deploys, rollbacks and restarts without depending on a
/// symlink being recreated on every deploy. Defaults to <c>{ContentRoot}/uploads</c>.
/// Single-instance only: running more than one backend instance needs shared
/// storage (object storage) instead.
/// </summary>
public static class UploadStorage
{
    public static string Root(IConfiguration config, IWebHostEnvironment env)
    {
        var configured = config["Uploads:Directory"];
        return string.IsNullOrWhiteSpace(configured)
            ? Path.Combine(env.ContentRootPath, "uploads")
            : Path.GetFullPath(configured);
    }

    /// <summary>
    /// The file a stored document URL ("/uploads/{guid}.pdf") refers to. Only the
    /// file name is used, so a stored value can never point outside the root.
    /// </summary>
    public static string PathFor(string root, string storageUrl)
    {
        // Split on both separators: on Linux, Path.GetFileName treats '\' as an
        // ordinary character, so "..\\..\\x" would otherwise survive intact.
        var normalized = storageUrl.Replace('\\', '/');
        return Path.Combine(root, normalized[(normalized.LastIndexOf('/') + 1)..]);
    }
}
