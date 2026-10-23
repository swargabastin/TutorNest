// HAND-AUTHORED MIGRATION (NO 'dotnet ef migrations add' AVAILABLE IN THIS ENVIRONMENT)
// Schema verified against Neon PostgreSQL catalog and Models.cs.
using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeTutorAPI.Migrations
{
    [Migration("20261023010000_AddPhase2And3Features")]
    public partial class AddPhase2And3Features : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ── Phase 2: Multi-Level Verification & Video Profile on tutor_profiles
            migrationBuilder.AddColumn<bool>(
                name: "id_verified",
                table: "tutor_profiles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "qualification_verified",
                table: "tutor_profiles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "address_verified",
                table: "tutor_profiles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "police_check_verified",
                table: "tutor_profiles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "intro_video_url",
                table: "tutor_profiles",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            // ── Phase 3: WhatsApp Notification Preferences on tutor_profiles
            migrationBuilder.AddColumn<bool>(
                name: "whats_app_notifications_enabled",
                table: "tutor_profiles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "whats_app_phone_number",
                table: "tutor_profiles",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            // ── Phase 2: Coin Refund Requests Table
            migrationBuilder.CreateTable(
                name: "coin_refund_requests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tutor_profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    coin_transaction_id = table.Column<Guid>(type: "uuid", nullable: false),
                    reference_id = table.Column<Guid>(type: "uuid", nullable: true),
                    coins_requested = table.Column<int>(type: "integer", nullable: false),
                    reason = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    explanation = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    admin_notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    reviewed_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    reviewed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_coin_refund_requests", x => x.id);
                    table.ForeignKey(
                        name: "FK_coin_refund_requests_tutor_profiles_tutor_profile_id",
                        column: x => x.tutor_profile_id,
                        principalTable: "tutor_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_coin_refund_requests_tutor_profile_id",
                table: "coin_refund_requests",
                column: "tutor_profile_id");

            migrationBuilder.CreateIndex(
                name: "IX_coin_refund_requests_status",
                table: "coin_refund_requests",
                column: "status");

            // ── Phase 3: WhatsApp Notification Logs Table
            migrationBuilder.CreateTable(
                name: "whatsapp_notification_logs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tutor_profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    requirement_id = table.Column<Guid>(type: "uuid", nullable: false),
                    recipient_phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    message_content = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    provider = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Mock"),
                    provider_response = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_whatsapp_notification_logs", x => x.id);
                    table.ForeignKey(
                        name: "FK_whatsapp_notification_logs_tutor_profiles_tutor_profile_id",
                        column: x => x.tutor_profile_id,
                        principalTable: "tutor_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_whatsapp_notification_logs_tuition_requirements_requirement_id",
                        column: x => x.requirement_id,
                        principalTable: "tuition_requirements",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_whatsapp_notification_logs_tutor_profile_id",
                table: "whatsapp_notification_logs",
                column: "tutor_profile_id");

            migrationBuilder.CreateIndex(
                name: "IX_whatsapp_notification_logs_requirement_id",
                table: "whatsapp_notification_logs",
                column: "requirement_id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "whatsapp_notification_logs");
            migrationBuilder.DropTable(name: "coin_refund_requests");

            migrationBuilder.DropColumn(name: "whats_app_phone_number", table: "tutor_profiles");
            migrationBuilder.DropColumn(name: "whats_app_notifications_enabled", table: "tutor_profiles");
            migrationBuilder.DropColumn(name: "intro_video_url", table: "tutor_profiles");
            migrationBuilder.DropColumn(name: "police_check_verified", table: "tutor_profiles");
            migrationBuilder.DropColumn(name: "address_verified", table: "tutor_profiles");
            migrationBuilder.DropColumn(name: "qualification_verified", table: "tutor_profiles");
            migrationBuilder.DropColumn(name: "id_verified", table: "tutor_profiles");
        }
    }
}
