using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using OscApi.Common;

namespace OscApi.Tests.Helpers;

public static class MockEmailService
{
    public static EmailService Create()
    {
        // Empty config → Postmark client is null → emails are no-ops
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>())
            .Build();

        return new EmailService(config, NullLogger<EmailService>.Instance);
    }
}
