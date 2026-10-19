using System;
using HomeTutorAPI.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeTutorAPI.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(AppDbContext))]
    [Migration("20260817000000_AddSubscriptionPlanAudience")]
    public partial class AddSubscriptionPlanAudience : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Audience",
                table: "SubscriptionPlans",
                type: "text",
                nullable: false,
                defaultValue: "Both");

            // Existing plans: Free stays available to everyone; Basic/Pro/Premium
            // (the original 3 paid tiers) become Student-only now that dedicated
            // Tutor plans exist below.
            migrationBuilder.Sql(
                "UPDATE \"SubscriptionPlans\" SET \"Audience\" = 'Student' WHERE \"Id\" IN (2, 3, 4);");
            migrationBuilder.Sql(
                "UPDATE \"SubscriptionPlans\" SET \"Audience\" = 'Both' WHERE \"Id\" = 1;");

            // New tutor-specific plans.
            migrationBuilder.InsertData(
                table: "SubscriptionPlans",
                columns: new[] { "Id", "Audience", "CoinsPerMonth", "CreatedAt", "DurationDays", "Features", "IsActive", "IsPopular", "Name", "Price", "Tier" },
                columnTypes: new[] { "integer", "text", "integer", "timestamp with time zone", "integer", "text[]", "boolean", "boolean", "character varying(80)", "numeric(10,2)", "text" },
                values: new object[,]
                {
                    { 5, "Tutor", 300,  new DateTime(2026, 8, 17, 0, 0, 0, 0, DateTimeKind.Utc), 30, new[] { "Profile listing", "View 20 requirements/month", "300 coins/month", "Basic support" }, true, false, "Tutor Basic", 499m, "Basic" },
                    { 6, "Tutor", 800,  new DateTime(2026, 8, 17, 0, 0, 0, 0, DateTimeKind.Utc), 30, new[] { "Featured profile listing", "Unlimited requirements", "Priority in search results", "800 coins/month", "Verified badge", "Priority support" }, true, true,  "Tutor Professional", 999m, "Pro" },
                    { 7, "Tutor", 1500, new DateTime(2026, 8, 17, 0, 0, 0, 0, DateTimeKind.Utc), 30, new[] { "Everything in Professional", "Top of search results", "1500 coins/month", "Custom profile URL", "Dedicated account manager" }, true, false, "Tutor Premium", 1499m, "Premium" },
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "SubscriptionPlans",
                keyColumn: "Id",
                keyValues: new object[] { 5, 6, 7 });

            migrationBuilder.DropColumn(
                name: "Audience",
                table: "SubscriptionPlans");
        }
    }
}
