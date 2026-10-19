# HomeTutor API — Complete Setup Guide

## Project Structure

```
HomeTutorAPI/
├── Controllers/
│   ├── AuthController.cs          # Register · Login · Refresh · Forgot Password
│   ├── TutorsController.cs        # Profile · Search · Image Upload · Availability · Wallet
│   ├── StudentsController.cs      # Profile · Requirements · Enquiries · Reviews · Wallet
│   ├── PaymentsController.cs      # Razorpay Orders · Verify · Plans · Coin Packages
│   ├── AdminController.cs         # Dashboard · Tutor Approval · Users · Reports
│   └── LookupsController.cs       # Subjects · Cities · Teaching Levels
├── Models/
│   └── Models.cs                  # All EF Core entity classes + enums
├── DTOs/
│   └── DTOs.cs                    # Request/response records matching frontend fields
├── Data/
│   └── AppDbContext.cs            # EF Core context + Fluent API + seed data
├── Repositories/
│   ├── Interfaces/IRepositories.cs
│   └── Repositories.cs
├── Services/
│   ├── Interfaces/IServices.cs
│   ├── TokenService.cs            # JWT access + refresh token generation
│   ├── EmailService.cs            # MailKit SMTP (password reset)
│   └── ImageService.cs            # Local disk upload (swap for Cloudinary)
├── Helpers/
│   ├── MappingProfile.cs          # AutoMapper entity → DTO mappings
│   └── ExceptionMiddleware.cs     # Global error handling
├── Extensions/
│   ├── ServiceExtensions.cs       # Clean DI registration
│   └── ClaimsPrincipalExtensions.cs
├── Migrations/
│   └── 20240101000000_InitialCreate.cs
├── database/
│   └── schema.sql                 # Standalone PostgreSQL DDL (no EF required)
├── frontend-integration/
│   └── api.ts                     # Drop-in frontend API client for your Bolt.new UI
├── Program.cs
├── appsettings.json
└── HomeTutorAPI.csproj
```

---

## Step 1 — Install .NET 9 SDK

```bash
# Check if already installed
dotnet --version   # must be 9.x.x

# If not, download from:
# https://dotnet.microsoft.com/download/dotnet/9.0
```

---

## Step 2 — Install PostgreSQL

```bash
# Ubuntu / Debian
sudo apt-get install -y postgresql postgresql-contrib

# macOS (Homebrew)
brew install postgresql@16 && brew services start postgresql@16

# Windows — download installer from https://www.postgresql.org/download/
```

---

## Step 3 — Create the Database

**Option A — use schema.sql directly (no EF needed):**
```bash
psql -U postgres -c "CREATE DATABASE hometutor_db;"
psql -U postgres -d hometutor_db -f database/schema.sql
```

**Option B — use EF Core migrations:**
```bash
# Install EF Core CLI (once)
dotnet tool install --global dotnet-ef

# From the HomeTutorAPI/ folder:
dotnet ef database update
```

---

## Step 4 — Configure appsettings.json

Edit `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=hometutor_db;Username=postgres;Password=YOUR_PG_PASSWORD"
  },
  "Jwt": {
    "SecretKey": "REPLACE_WITH_RANDOM_32+_CHARACTER_SECRET",
    "Issuer":    "HomeTutorAPI",
    "Audience":  "HomeTutorClient"
  },
  "Razorpay": {
    "KeyId":     "rzp_test_YOUR_KEY_ID",
    "KeySecret": "YOUR_RAZORPAY_SECRET"
  }
}
```

> For the JWT secret, generate one: `openssl rand -base64 32`

---

## Step 5 — Restore & Run

```bash
cd HomeTutorAPI
dotnet restore
dotnet run
```

**Swagger UI** opens at: **http://localhost:5000/swagger**

---

## Step 6 — Connect your Bolt.new Frontend

1. Copy `frontend-integration/api.ts` → `lib/api.ts` in your Next.js project
2. Create `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
3. Install axios: `npm install axios`
4. Add Razorpay script to `app/layout.tsx`:
   ```tsx
   <Script src="https://checkout.razorpay.com/v1/checkout.js" />
   ```
5. Replace mock-data imports page by page (see table below)

---

## Frontend Integration Map

| Page / Component          | Replace this mock-data import           | With this API call                        |
|---------------------------|-----------------------------------------|-------------------------------------------|
| `app/register/student`    | `handleSubmit → alert()`               | `authApi.registerStudent(formData)`       |
| `app/register/tutor`      | `handleSubmit → alert()`               | `authApi.registerTutor(formData)`         |
| `app/dashboard/student`   | `import { mockStudent }`               | `studentsApi.getStats()`                  |
| `app/dashboard/tutor`     | Hardcoded stats object                  | `tutorsApi.getStats()`                    |
| `app/dashboard/admin`     | `import { dashboardStats }`            | `adminApi.getDashboard()`                 |
| `app/search`              | `import { tutors }` + filter           | `tutorsApi.search(filters)`               |
| `app/tutor/[id]`          | `tutors.find(t => t.id === id)`        | `tutorsApi.getById(id)`                   |
| `app/subscription`        | `import { subscriptions }`             | `paymentsApi.getPlans()`                  |
| `app/wallet`              | `import { transactions, mockStudent }` | `studentsApi.getWallet()`                 |
| `app/payment`             | `setTimeout → setSuccess(true)`        | `openRazorpay(order, meta)`               |
| `app/post-requirement`    | `setSubmitted(true)`                   | `studentsApi.postRequirement(formData)`   |
| `components/tutor-card`   | Static tutor object                     | Data from `tutorsApi.search()` response   |
| Register forms — cities   | `import { cities }`                    | `lookupsApi.getCities()`                  |
| Register forms — subjects | `import { subjects }`                  | `lookupsApi.getSubjects()`                |

---

## API Endpoints Reference

### Auth
| Method | Endpoint                        | Auth     | Description              |
|--------|---------------------------------|----------|--------------------------|
| POST   | `/api/auth/register/student`    | –        | Register student         |
| POST   | `/api/auth/register/tutor`      | –        | Register tutor           |
| POST   | `/api/auth/login`               | –        | Login → JWT tokens       |
| POST   | `/api/auth/refresh`             | –        | Refresh access token     |
| POST   | `/api/auth/forgot-password`     | –        | Send reset email         |
| POST   | `/api/auth/reset-password`      | –        | Reset with token         |
| POST   | `/api/auth/change-password`     | JWT      | Change own password      |
| POST   | `/api/auth/logout`              | JWT      | Invalidate refresh token |

### Tutors
| Method | Endpoint                        | Auth       | Description              |
|--------|---------------------------------|------------|--------------------------|
| GET    | `/api/tutors/search`            | –          | Search with filters      |
| GET    | `/api/tutors/{id}`              | –          | Get tutor detail         |
| GET    | `/api/tutors/me`                | Tutor      | My profile               |
| PUT    | `/api/tutors/me`                | Tutor      | Update profile           |
| POST   | `/api/tutors/me/profile-image`  | Tutor      | Upload photo             |
| GET    | `/api/tutors/me/stats`          | Tutor      | Dashboard stats          |
| GET    | `/api/tutors/me/wallet`         | Tutor      | Coin balance + history   |
| GET    | `/api/tutors/me/enquiries`      | Tutor      | Student enquiries        |
| PUT    | `/api/tutors/me/availability`   | Tutor      | Set schedule             |

### Students
| Method | Endpoint                        | Auth       | Description              |
|--------|---------------------------------|------------|--------------------------|
| GET    | `/api/students/me`              | Student    | My profile               |
| GET    | `/api/students/me/stats`        | Student    | Dashboard stats          |
| POST   | `/api/students/me/requirements` | Student    | Post tuition requirement |
| GET    | `/api/students/me/requirements` | Student    | My requirements          |
| DELETE | `/api/students/me/requirements/{id}` | Student | Close requirement   |
| POST   | `/api/students/me/enquiries`    | Student    | Send enquiry to tutor    |
| GET    | `/api/students/me/enquiries`    | Student    | My sent enquiries        |
| POST   | `/api/students/me/reviews`      | Student    | Submit tutor review      |
| GET    | `/api/students/me/wallet`       | Student    | Coin balance + history   |

### Payments
| Method | Endpoint                        | Auth       | Description              |
|--------|---------------------------------|------------|--------------------------|
| GET    | `/api/payments/plans`           | –          | Subscription plans       |
| GET    | `/api/payments/coin-packages`   | –          | Coin packages            |
| POST   | `/api/payments/create-order`    | JWT        | Create Razorpay order    |
| POST   | `/api/payments/verify`          | JWT        | Verify + credit coins    |

### Lookups
| Method | Endpoint                        | Auth | Description         |
|--------|---------------------------------|------|---------------------|
| GET    | `/api/lookups/subjects`         | –    | All subjects        |
| GET    | `/api/lookups/cities`           | –    | All cities          |
| GET    | `/api/lookups/teaching-levels`  | –    | Teaching level list |

### Admin
| Method | Endpoint                           | Auth  | Description             |
|--------|------------------------------------|-------|-------------------------|
| GET    | `/api/admin/dashboard`             | Admin | Platform stats + charts |
| GET    | `/api/admin/tutors`                | Admin | All tutors (paginated)  |
| PUT    | `/api/admin/tutors/{id}/status`    | Admin | Approve / Reject tutor  |
| GET    | `/api/admin/users`                 | Admin | All users (paginated)   |
| PUT    | `/api/admin/users/{id}/toggle`     | Admin | Activate / Deactivate   |
| GET    | `/api/admin/payments`              | Admin | All successful payments |
| GET    | `/api/admin/requirements`          | Admin | All requirements        |

---

## Default Admin Login

After running `schema.sql`, an admin account is pre-seeded:

| Field    | Value                  |
|----------|------------------------|
| Email    | `admin@hometutor.in`   |
| Password | `Admin@123`            |

> Change this immediately in production!

---

## Production Checklist

- [ ] Change `Jwt:SecretKey` to a random 64-character string
- [ ] Set `RequireHttpsMetadata = true` in `ServiceExtensions.cs`
- [ ] Replace `LocalImageService` with `CloudinaryImageService`
- [ ] Configure real SMTP credentials for `EmailService`
- [ ] Switch Razorpay to live keys (`rzp_live_...`)
- [ ] Set strong `postgres` password
- [ ] Enable SSL on PostgreSQL connection string
- [ ] Add rate limiting middleware
- [ ] Set `ASPNETCORE_ENVIRONMENT=Production`

---

## Re-generating Migrations (after model changes)

```bash
# Add a new migration
dotnet ef migrations add YourMigrationName

# Apply to database
dotnet ef database update

# Roll back last migration
dotnet ef migrations remove
```
