using HomeTutorAPI.Data;
using HomeTutorAPI.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HomeTutorAPI.Controllers;

/// <summary>
/// Provides dropdown data for the frontend forms:
/// subjects, cities, teaching levels.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class LookupsController(AppDbContext db) : ControllerBase
{
    // GET /api/lookups/subjects
    [HttpGet("subjects")]
    [ProducesResponseType(typeof(List<SubjectDto>), 200)]
    public async Task<IActionResult> GetSubjects(CancellationToken ct)
    {
        var subjects = await db.Subjects
            .Where(s => s.IsActive)
            .OrderBy(s => s.Name)
            .Select(s => new SubjectDto(s.Id, s.Name, s.Category))
            .ToListAsync(ct);
        return Ok(subjects);
    }

    // GET /api/lookups/cities
    [HttpGet("cities")]
    [ProducesResponseType(typeof(List<LocationDto>), 200)]
    public async Task<IActionResult> GetCities(CancellationToken ct)
    {
        var cities = await db.Locations
            .Where(l => l.IsActive)
            .OrderBy(l => l.City)
            .Select(l => new LocationDto(l.Id, l.City, l.State))
            .ToListAsync(ct);
        return Ok(cities);
    }

    // GET /api/lookups/teaching-levels
    [HttpGet("teaching-levels")]
    public IActionResult GetTeachingLevels()
    {
        var levels = new[]
        {
            "Class 1-5", "Class 6-8", "Class 9-10",
            "Class 11-12", "JEE", "NEET", "College",
            "Programming", "Language"
        };
        return Ok(levels);
    }
}
