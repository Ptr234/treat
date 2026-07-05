using OscApi.Models;

namespace OscApi.Tests.Fixtures;

public static class TestTickets
{
    public static Ticket CreateBusinessRegistration(string createdBy = TestUsers.InvestorKibuli.Email)
    {
        return new Ticket
        {
            ReferenceNumber = "TKT-BRG-" + Guid.NewGuid().ToString("N")[..8].ToUpper(),
            Category = TicketCategory.ApplicationSupport,
            Title = "Register new business entity",
            Description = "I need to register a limited liability company",
            Status = TicketStatus.New,
            Priority = TicketPriority.High,
            ContactName = "Business Owner",
            ContactEmail = createdBy,
            ContactPhone = "+256700000010",
            Sector = "Manufacturing",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            Documents = new List<TicketDocument>()
        };
    }

    public static Ticket CreateInvestmentInquiry(string createdBy = TestUsers.InvestorCampala.Email)
    {
        return new Ticket
        {
            ReferenceNumber = "TKT-INV-" + Guid.NewGuid().ToString("N")[..8].ToUpper(),
            Category = TicketCategory.GeneralInquiry,
            Title = "Industrial park investment opportunity",
            Description = "Interested in investing in the industrial park project with UIA",
            Status = TicketStatus.Assigned,
            Priority = TicketPriority.Medium,
            ContactName = "Investor Contact",
            ContactEmail = createdBy,
            ContactPhone = "+256700000011",
            InvestorNationality = "Uganda",
            Sector = "Real Estate",
            InvestmentSize = "5M-10M USD",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            Documents = new List<TicketDocument>()
        };
    }

    public static Ticket CreateLicenseApplication(string createdBy = TestUsers.InvestorMbarara.Email)
    {
        return new Ticket
        {
            ReferenceNumber = "TKT-LIC-" + Guid.NewGuid().ToString("N")[..8].ToUpper(),
            Category = TicketCategory.ApplicationSupport,
            Title = "Apply for business license renewal",
            Description = "Renewal of business license for existing operations",
            Status = TicketStatus.InProgress,
            Priority = TicketPriority.Medium,
            ContactName = "License Applicant",
            ContactEmail = createdBy,
            ContactPhone = "+256700000012",
            Sector = "Retail",
            CreatedAt = DateTimeOffset.UtcNow.AddDays(-5),
            UpdatedAt = DateTimeOffset.UtcNow.AddDays(-1),
            Documents = new List<TicketDocument>()
        };
    }

    public static Ticket CreateTaxInquiry(string createdBy)
    {
        return new Ticket
        {
            ReferenceNumber = "TKT-TAX-" + Guid.NewGuid().ToString("N")[..8].ToUpper(),
            Category = TicketCategory.ProcedureQuery,
            Title = "Request tax clearance certificate",
            Description = "Need tax clearance for company winding up",
            Status = TicketStatus.New,
            Priority = TicketPriority.High,
            ContactName = "Tax Inquiry Person",
            ContactEmail = createdBy,
            ContactPhone = "+256700000015",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            Documents = new List<TicketDocument>()
        };
    }

    public static Ticket CreateClosed()
    {
        return new Ticket
        {
            ReferenceNumber = "TKT-CLS-" + Guid.NewGuid().ToString("N")[..8].ToUpper(),
            Category = TicketCategory.ApplicationSupport,
            Title = "Business registered successfully",
            Description = "Closed - registration complete",
            Status = TicketStatus.Closed,
            Priority = TicketPriority.Medium,
            ContactName = "Registrant",
            ContactEmail = TestUsers.InvestorKibuli.Email,
            ContactPhone = "+256700000010",
            Sector = "Services",
            CreatedAt = DateTimeOffset.UtcNow.AddDays(-30),
            UpdatedAt = DateTimeOffset.UtcNow.AddDays(-1),
            ClosedAt = DateTimeOffset.UtcNow.AddDays(-1),
            Documents = new List<TicketDocument>()
        };
    }
}

public static class TestDocuments
{
    public static TicketDocument CreateBusinessPlan(Guid ticketId)
    {
        return new TicketDocument
        {
            TicketId = ticketId,
            FileName = "business_plan.pdf",
            MimeType = "application/pdf",
            FileSize = 102400,
            StorageUrl = "https://storage.example.com/tickets/" + ticketId + "/business_plan.pdf",
            UploadedAt = DateTimeOffset.UtcNow
        };
    }

    public static TicketDocument CreateCompanyConstitution(Guid ticketId)
    {
        return new TicketDocument
        {
            TicketId = ticketId,
            FileName = "company_constitution.docx",
            MimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            FileSize = 51200,
            StorageUrl = "https://storage.example.com/tickets/" + ticketId + "/company_constitution.docx",
            UploadedAt = DateTimeOffset.UtcNow
        };
    }

    public static TicketDocument CreateDirectorId(Guid ticketId)
    {
        return new TicketDocument
        {
            TicketId = ticketId,
            FileName = "director_id.jpg",
            MimeType = "image/jpeg",
            FileSize = 204800,
            StorageUrl = "https://storage.example.com/tickets/" + ticketId + "/director_id.jpg",
            UploadedAt = DateTimeOffset.UtcNow
        };
    }
}
