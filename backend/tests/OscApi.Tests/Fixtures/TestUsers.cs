using OscApi.Models;

namespace OscApi.Tests.Fixtures;

public static class TestUsers
{
    public static class Admin
    {
        public const string Email = "admin@test.local";
        public const string Password = "Admin123!@#";
        public const string FirstName = "Admin";
        public const string LastName = "User";
        public const string Phone = "+256700000001";
    }

    public static class StaffUia
    {
        public const string Email = "staff.uia@test.local";
        public const string Password = "Staff123!@#";
        public const string FirstName = "Staff";
        public const string LastName = "UIA";
        public const string Phone = "+256700000002";
    }

    public static class StaffUbos
    {
        public const string Email = "staff.ubos@test.local";
        public const string Password = "Staff123!@#";
        public const string FirstName = "Staff";
        public const string LastName = "UBOS";
        public const string Phone = "+256700000003";
    }

    public static class InvestorKibuli
    {
        public const string Email = "investor.kibuli@test.local";
        public const string Password = "Investor123!@#";
        public const string FirstName = "John";
        public const string LastName = "Kibuli";
        public const string Phone = "+256700000010";
        public const string Company = "Kibuli Investments Ltd";
    }

    public static class InvestorCampala
    {
        public const string Email = "investor.kampala@test.local";
        public const string Password = "Investor123!@#";
        public const string FirstName = "Jane";
        public const string LastName = "Kampala";
        public const string Phone = "+256700000011";
        public const string Company = "Kampala Ventures";
    }

    public static class InvestorMbarara
    {
        public const string Email = "investor.mbarara@test.local";
        public const string Password = "Investor123!@#";
        public const string FirstName = "Peter";
        public const string LastName = "Mbarara";
        public const string Phone = "+256700000012";
        public const string Company = "Mbarara Trade Co";
    }

    public static class Dg
    {
        public const string Email = "dg@test.local";
        public const string Password = "DG123!@#";
        public const string FirstName = "Director";
        public const string LastName = "General";
        public const string Phone = "+256700000020";
    }

    public static class Anonymous
    {
        public const string Email = "anonymous@test.local";
    }
}
