using System;
using HomeTutorAPI.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeTutorAPI.Migrations
{
    /// <remarks>
    /// HAND-AUTHORED — no NuGet/DB access in the dev sandbox to run
    /// `dotnet ef migrations add`. UNVERIFIED — run `dotnet ef migrations
    /// script` on a machine with real DB access and diff against this file
    /// before applying to staging or production.
    /// </remarks>
    [DbContext(typeof(AppDbContext))]
    [Migration("20261023000000_AddSprint1Features")]
    public partial class AddSprint1Features : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // TutorProfile enhancements
            migrationBuilder.AddColumn<bool>(
                name: "OffersFreeDemo",
                table: "TutorProfiles",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string[]>(
                name: "Boards",
                table: "TutorProfiles",
                type: "text[]",
                nullable: false,
                defaultValue: new string[0]);

            migrationBuilder.AddColumn<string>(
                name: "Locality",
                table: "TutorProfiles",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Pincode",
                table: "TutorProfiles",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TravelRadiusKm",
                table: "TutorProfiles",
                type: "integer",
                nullable: true);

            // TuitionRequirement enhancements
            migrationBuilder.AddColumn<string>(
                name: "Board",
                table: "TuitionRequirements",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Locality",
                table: "TuitionRequirements",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Pincode",
                table: "TuitionRequirements",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);

            // Booking enhancements
            migrationBuilder.AddColumn<string>(
                name: "GradeLevel",
                table: "Bookings",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GradeLevel",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "Pincode",
                table: "TuitionRequirements");

            migrationBuilder.DropColumn(
                name: "Locality",
                table: "TuitionRequirements");

            migrationBuilder.DropColumn(
                name: "Board",
                table: "TuitionRequirements");

            migrationBuilder.DropColumn(
                name: "TravelRadiusKm",
                table: "TutorProfiles");

            migrationBuilder.DropColumn(
                name: "Pincode",
                table: "TutorProfiles");

            migrationBuilder.DropColumn(
                name: "Locality",
                table: "TutorProfiles");

            migrationBuilder.DropColumn(
                name: "Boards",
                table: "TutorProfiles");

            migrationBuilder.DropColumn(
                name: "OffersFreeDemo",
                table: "TutorProfiles");
        }
    }
}
