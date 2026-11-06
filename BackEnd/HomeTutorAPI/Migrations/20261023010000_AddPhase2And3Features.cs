// HAND-AUTHORED MIGRATION (NO 'dotnet ef migrations add' AVAILABLE IN THIS ENVIRONMENT)
// Schema aligned with AppDbContext and Models.cs (PascalCase convention).
using System;
using HomeTutorAPI.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeTutorAPI.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20261023010000_AddPhase2And3Features")]
    public partial class AddPhase2And3Features : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ── Phase 2: Multi-Level Verification & Video Profile on TutorProfiles
            migrationBuilder.AddColumn<bool>(
                name: "IdVerified",
                table: "TutorProfiles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "QualificationVerified",
                table: "TutorProfiles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AddressVerified",
                table: "TutorProfiles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "PoliceCheckVerified",
                table: "TutorProfiles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "IntroVideoUrl",
                table: "TutorProfiles",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            // ── Phase 3: WhatsApp Notification Preferences on TutorProfiles
            migrationBuilder.AddColumn<bool>(
                name: "WhatsAppNotificationsEnabled",
                table: "TutorProfiles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "WhatsAppPhoneNumber",
                table: "TutorProfiles",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            // ── Phase 2: Coin Refund Requests Table
            migrationBuilder.CreateTable(
                name: "CoinRefundRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TutorProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    CoinTransactionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReferenceId = table.Column<Guid>(type: "uuid", nullable: true),
                    CoinsRequested = table.Column<int>(type: "integer", nullable: false),
                    Reason = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Explanation = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    AdminNotes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ReviewedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CoinRefundRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CoinRefundRequests_TutorProfiles_TutorProfileId",
                        column: x => x.TutorProfileId,
                        principalTable: "TutorProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CoinRefundRequests_TutorProfileId",
                table: "CoinRefundRequests",
                column: "TutorProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_CoinRefundRequests_Status",
                table: "CoinRefundRequests",
                column: "Status");

            // ── Phase 3: WhatsApp Notification Logs Table
            migrationBuilder.CreateTable(
                name: "WhatsAppNotificationLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TutorProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    RequirementId = table.Column<Guid>(type: "uuid", nullable: false),
                    RecipientPhone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    MessageContent = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Provider = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Mock"),
                    ProviderResponse = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WhatsAppNotificationLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WhatsAppNotificationLogs_TutorProfiles_TutorProfileId",
                        column: x => x.TutorProfileId,
                        principalTable: "TutorProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WhatsAppNotificationLogs_TuitionRequirements_RequirementId",
                        column: x => x.RequirementId,
                        principalTable: "TuitionRequirements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WhatsAppNotificationLogs_TutorProfileId",
                table: "WhatsAppNotificationLogs",
                column: "TutorProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_WhatsAppNotificationLogs_RequirementId",
                table: "WhatsAppNotificationLogs",
                column: "RequirementId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "WhatsAppNotificationLogs");
            migrationBuilder.DropTable(name: "CoinRefundRequests");

            migrationBuilder.DropColumn(name: "WhatsAppPhoneNumber", table: "TutorProfiles");
            migrationBuilder.DropColumn(name: "WhatsAppNotificationsEnabled", table: "TutorProfiles");
            migrationBuilder.DropColumn(name: "IntroVideoUrl", table: "TutorProfiles");
            migrationBuilder.DropColumn(name: "PoliceCheckVerified", table: "TutorProfiles");
            migrationBuilder.DropColumn(name: "AddressVerified", table: "TutorProfiles");
            migrationBuilder.DropColumn(name: "QualificationVerified", table: "TutorProfiles");
            migrationBuilder.DropColumn(name: "IdVerified", table: "TutorProfiles");
        }
    }
}
