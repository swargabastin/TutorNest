using System;
using HomeTutorAPI.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeTutorAPI.Migrations
{
    /// <inheritdoc />
    /// <remarks>
    /// HAND-AUTHORED — same reason as AddSubscriptionPlanAudience: no NuGet/DB
    /// access in the dev sandbox to run `dotnet ef migrations add`. UNVERIFIED —
    /// run `dotnet ef migrations script` on a machine with real DB access and
    /// diff it against this file before applying to staging or production.
    /// </remarks>
    [DbContext(typeof(AppDbContext))]
    [Migration("20260824000000_AddTutorVerificationDocuments")]
    public partial class AddTutorVerificationDocuments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TutorVerificationDocuments",
                columns: table => new
                {
                    Id               = table.Column<Guid>(type: "uuid", nullable: false),
                    TutorProfileId   = table.Column<Guid>(type: "uuid", nullable: false),
                    DocType          = table.Column<int>(type: "integer", nullable: false),
                    Status           = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    FileUrl          = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    RejectionReason  = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ReviewedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    ReviewedAt       = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt        = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TutorVerificationDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TutorVerificationDocuments_TutorProfiles_TutorProfileId",
                        column: x => x.TutorProfileId,
                        principalTable: "TutorProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TutorVerificationDocuments_TutorProfileId",
                table: "TutorVerificationDocuments",
                column: "TutorProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_TutorVerificationDocuments_Status",
                table: "TutorVerificationDocuments",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "TutorVerificationDocuments");
        }
    }
}
