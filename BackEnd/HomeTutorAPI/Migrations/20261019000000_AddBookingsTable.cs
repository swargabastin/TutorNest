using System;
using HomeTutorAPI.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeTutorAPI.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(AppDbContext))]
    [Migration("20261019000000_AddBookingsTable")]
    public partial class AddBookingsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    Id                 = table.Column<Guid>(type: "uuid", nullable: false),
                    StudentProfileId   = table.Column<Guid>(type: "uuid", nullable: false),
                    TutorProfileId     = table.Column<Guid>(type: "uuid", nullable: false),
                    Subject            = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Mode               = table.Column<string>(type: "text", nullable: false),
                    Status             = table.Column<string>(type: "text", nullable: false),
                    StartTime          = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndTime            = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    HourlyRate         = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    IsTrial            = table.Column<bool>(type: "boolean", nullable: false),
                    MeetingLink        = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    LocationAddress    = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    StudentNotes       = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CancellationReason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt          = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt          = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bookings_StudentProfiles_StudentProfileId",
                        column: x => x.StudentProfileId,
                        principalTable: "StudentProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Bookings_TutorProfiles_TutorProfileId",
                        column: x => x.TutorProfileId,
                        principalTable: "TutorProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_StudentProfileId",
                table: "Bookings",
                column: "StudentProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_TutorProfileId",
                table: "Bookings",
                column: "TutorProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_StartTime",
                table: "Bookings",
                column: "StartTime");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_Status",
                table: "Bookings",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "Bookings");
        }
    }
}
