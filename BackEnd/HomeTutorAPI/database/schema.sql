-- =============================================================
--  HomeTutor PostgreSQL Schema  (standalone, no EF required)
--  Run: psql -U postgres -d hometutor_db -f schema.sql
-- =============================================================

-- extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ── users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    "Id"                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    "FullName"            VARCHAR(120) NOT NULL,
    "Email"               VARCHAR(255) NOT NULL UNIQUE,
    "Phone"               VARCHAR(15),
    "PasswordHash"        TEXT,
    "Role"                TEXT         NOT NULL,
    "IsActive"            BOOLEAN      NOT NULL DEFAULT TRUE,
    "EmailVerified"       BOOLEAN      NOT NULL DEFAULT FALSE,
    "GoogleId"            VARCHAR(128) UNIQUE,
    "ProfileImage"        TEXT,
    "City"                TEXT,
    "RefreshToken"        TEXT,
    "RefreshTokenExpiry"  TIMESTAMPTZ,
    "ResetToken"          TEXT,
    "ResetTokenExpiry"    TIMESTAMPTZ,
    "CreatedAt"           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    "UpdatedAt"           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "IX_users_Email"    ON users("Email");
CREATE INDEX IF NOT EXISTS "IX_users_Role"     ON users("Role");
CREATE INDEX IF NOT EXISTS "IX_users_GoogleId" ON users("GoogleId")
    WHERE "GoogleId" IS NOT NULL;

-- ── subjects ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subjects (
    "Id"       SERIAL       PRIMARY KEY,
    "Name"     VARCHAR(100) NOT NULL,
    "Category" VARCHAR(50),
    "IsActive" BOOLEAN      NOT NULL DEFAULT TRUE
);

INSERT INTO subjects ("Name","Category") VALUES
    ('Mathematics',    'Science'),
    ('Physics',        'Science'),
    ('Chemistry',      'Science'),
    ('Biology',        'Science'),
    ('English',        'Language'),
    ('Hindi',          'Language'),
    ('Social Studies', 'Humanities'),
    ('History',        'Humanities'),
    ('Geography',      'Humanities'),
    ('Computer Science','Technology'),
    ('Economics',      'Commerce'),
    ('Accountancy',    'Commerce'),
    ('JEE Prep',       'Competitive'),
    ('NEET Prep',      'Competitive')
ON CONFLICT DO NOTHING;

-- ── locations ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS locations (
    "Id"       SERIAL       PRIMARY KEY,
    "City"     VARCHAR(100) NOT NULL,
    "State"    VARCHAR(100),
    "Country"  VARCHAR(100) DEFAULT 'India',
    "IsActive" BOOLEAN      NOT NULL DEFAULT TRUE
);

INSERT INTO locations ("City","State") VALUES
    ('Mumbai','Maharashtra'),('Delhi','Delhi'),('Bangalore','Karnataka'),
    ('Hyderabad','Telangana'),('Chennai','Tamil Nadu'),('Kolkata','West Bengal'),
    ('Pune','Maharashtra'),('Jaipur','Rajasthan'),('Ahmedabad','Gujarat'),
    ('Surat','Gujarat'),('Lucknow','Uttar Pradesh'),('Kochi','Kerala')
ON CONFLICT DO NOTHING;

-- ── subscription_plans ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscription_plans (
    "Id"            SERIAL          PRIMARY KEY,
    "Name"          VARCHAR(80)     NOT NULL,
    "Tier"          TEXT            NOT NULL,
    "Price"         NUMERIC(10,2)   NOT NULL,
    "CoinsPerMonth" INTEGER         NOT NULL,
    "Features"      TEXT[]          NOT NULL DEFAULT '{}',
    "DurationDays"  INTEGER         NOT NULL DEFAULT 30,
    "IsPopular"     BOOLEAN         NOT NULL DEFAULT FALSE,
    "IsActive"      BOOLEAN         NOT NULL DEFAULT TRUE,
    "CreatedAt"     TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

INSERT INTO subscription_plans
    ("Name","Tier","Price","CoinsPerMonth","Features","DurationDays","IsPopular") VALUES
    ('Free',    'Free',    0,   0,    ARRAY['Basic tutor search','View tutor profiles','Post 2 requirements/month'],                                               36500, FALSE),
    ('Basic',   'Basic',   299, 500,  ARRAY['500 coins/month','Unlimited tutor search','Post 10 requirements/month','Email support'],                              30,    FALSE),
    ('Pro',     'Pro',     599, 1000, ARRAY['1000 coins/month','Unlimited everything','Priority matching','Phone support','Featured in search'],                   30,    TRUE),
    ('Premium', 'Premium', 999, 2500, ARRAY['2500 coins/month','Unlimited everything','Dedicated manager','24/7 support','Top placement','Analytics dashboard'], 30,    FALSE)
ON CONFLICT DO NOTHING;

-- ── tutor_profiles ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tutor_profiles (
    "Id"              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    "UserId"          UUID            NOT NULL UNIQUE REFERENCES users("Id") ON DELETE CASCADE,
    "Qualification"   VARCHAR(300),
    "ExperienceYears" INTEGER         NOT NULL DEFAULT 0,
    "Bio"             VARCHAR(2000),
    "TeachingMode"    TEXT            NOT NULL DEFAULT 'Both',
    "HourlyRate"      NUMERIC(10,2)   NOT NULL DEFAULT 0,
    "Status"          TEXT            NOT NULL DEFAULT 'Pending',
    "IsVerified"      BOOLEAN         NOT NULL DEFAULT FALSE,
    "IsFeatured"      BOOLEAN         NOT NULL DEFAULT FALSE,
    "RatingAvg"       NUMERIC(3,2)    NOT NULL DEFAULT 0,
    "RatingCount"     INTEGER         NOT NULL DEFAULT 0,
    "StudentsTaught"  INTEGER         NOT NULL DEFAULT 0,
    "ResponseTime"    TEXT,
    "CoinBalance"     INTEGER         NOT NULL DEFAULT 0,
    "EarningsBalance" NUMERIC(12,2)   NOT NULL DEFAULT 0,
    "Languages"       TEXT[]          NOT NULL DEFAULT '{}',
    "TeachingLevels"  TEXT[]          NOT NULL DEFAULT '{}',
    "Boards"          TEXT[]          NOT NULL DEFAULT '{}',
    "OffersFreeDemo"  BOOLEAN         NOT NULL DEFAULT TRUE,
    "Locality"        VARCHAR(100),
    "Pincode"         VARCHAR(10),
    "TravelRadiusKm"  INTEGER,
    "CreatedAt"       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    "UpdatedAt"       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "IX_tp_Status"   ON tutor_profiles("Status");
CREATE INDEX IF NOT EXISTS "IX_tp_Rating"   ON tutor_profiles("RatingAvg" DESC);

-- ── tutor_subjects ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tutor_subjects (
    "Id"             SERIAL  PRIMARY KEY,
    "TutorProfileId" UUID    NOT NULL REFERENCES tutor_profiles("Id") ON DELETE CASCADE,
    "SubjectId"      INTEGER NOT NULL REFERENCES subjects("Id") ON DELETE CASCADE,
    UNIQUE("TutorProfileId","SubjectId")
);

-- ── student_profiles ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_profiles (
    "Id"          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    "UserId"      UUID        NOT NULL UNIQUE REFERENCES users("Id") ON DELETE CASCADE,
    "CoinBalance" INTEGER     NOT NULL DEFAULT 0,
    "CreatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── payments ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
    "Id"                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    "UserId"            UUID          NOT NULL REFERENCES users("Id") ON DELETE CASCADE,
    "Type"              TEXT          NOT NULL,
    "Status"            TEXT          NOT NULL DEFAULT 'Pending',
    "Amount"            NUMERIC(12,2) NOT NULL,
    "Currency"          VARCHAR(3)    NOT NULL DEFAULT 'INR',
    "RazorpayOrderId"   TEXT          UNIQUE,
    "RazorpayPaymentId" TEXT          UNIQUE,
    "RazorpaySignature" TEXT,
    "CoinsAwarded"      INTEGER,
    "CreatedAt"         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    "UpdatedAt"         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── tutor_subscriptions ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tutor_subscriptions (
    "Id"             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    "TutorProfileId" UUID        NOT NULL REFERENCES tutor_profiles("Id") ON DELETE CASCADE,
    "PlanId"         INTEGER     NOT NULL REFERENCES subscription_plans("Id"),
    "PaymentId"      UUID        REFERENCES payments("Id"),
    "StartsAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "ExpiresAt"      TIMESTAMPTZ NOT NULL,
    "IsActive"       BOOLEAN     NOT NULL DEFAULT TRUE,
    "CreatedAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── student_subscriptions ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_subscriptions (
    "Id"               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    "StudentProfileId" UUID        NOT NULL REFERENCES student_profiles("Id") ON DELETE CASCADE,
    "PlanId"           INTEGER     NOT NULL REFERENCES subscription_plans("Id"),
    "PaymentId"        UUID        REFERENCES payments("Id"),
    "StartsAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "ExpiresAt"        TIMESTAMPTZ NOT NULL,
    "IsActive"         BOOLEAN     NOT NULL DEFAULT TRUE,
    "CreatedAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── tuition_requirements ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tuition_requirements (
    "Id"               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    "StudentProfileId" UUID          NOT NULL REFERENCES student_profiles("Id") ON DELETE CASCADE,
    "Subject"          VARCHAR(100)  NOT NULL,
    "Level"            VARCHAR(50)   NOT NULL,
    "Board"            VARCHAR(50),
    "City"             VARCHAR(100),
    "Locality"         VARCHAR(100),
    "Pincode"          VARCHAR(10),
    "Mode"             TEXT          NOT NULL,
    "Budget"           VARCHAR(50),
    "FrequencyPerWeek" INTEGER,
    "Description"      VARCHAR(2000),
    "Status"           TEXT          NOT NULL DEFAULT 'Active',
    "ResponseCount"    INTEGER       NOT NULL DEFAULT 0,
    "CreatedAt"        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    "UpdatedAt"        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── enquiries ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enquiries (
    "Id"               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    "StudentProfileId" UUID         NOT NULL REFERENCES student_profiles("Id") ON DELETE CASCADE,
    "TutorProfileId"   UUID         NOT NULL REFERENCES tutor_profiles("Id")   ON DELETE CASCADE,
    "Subject"          VARCHAR(100) NOT NULL,
    "Level"            VARCHAR(50)  NOT NULL,
    "Message"          VARCHAR(2000),
    "IsRead"           BOOLEAN      NOT NULL DEFAULT FALSE,
    "CreatedAt"        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── reviews ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
    "Id"               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    "TutorProfileId"   UUID         NOT NULL REFERENCES tutor_profiles("Id")   ON DELETE CASCADE,
    "StudentProfileId" UUID         NOT NULL REFERENCES student_profiles("Id") ON DELETE CASCADE,
    "Rating"           SMALLINT     NOT NULL CHECK ("Rating" BETWEEN 1 AND 5),
    "ReviewText"       VARCHAR(2000),
    "Status"           TEXT         NOT NULL DEFAULT 'Visible',
    "CreatedAt"        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE("TutorProfileId","StudentProfileId")
);

-- ── coin_transactions ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coin_transactions (
    "Id"               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    "TutorProfileId"   UUID         REFERENCES tutor_profiles("Id"),
    "StudentProfileId" UUID         REFERENCES student_profiles("Id"),
    "Type"             TEXT         NOT NULL,
    "Amount"           INTEGER      NOT NULL,
    "BalanceAfter"     INTEGER      NOT NULL,
    "Description"      VARCHAR(200) NOT NULL,
    "ReferenceId"      UUID,
    "CreatedAt"        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── availabilities ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS availabilities (
    "Id"             SERIAL  PRIMARY KEY,
    "TutorProfileId" UUID    NOT NULL REFERENCES tutor_profiles("Id") ON DELETE CASCADE,
    "DayOfWeek"      INTEGER NOT NULL,
    "StartTime"      TIME    NOT NULL,
    "EndTime"        TIME    NOT NULL,
    "IsActive"       BOOLEAN NOT NULL DEFAULT TRUE
);

-- ── tutor_verification_documents ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tutor_verification_documents (
    "Id"               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    "TutorProfileId"   UUID          NOT NULL REFERENCES tutor_profiles("Id") ON DELETE CASCADE,
    "DocType"          TEXT          NOT NULL,   -- GovernmentId | EducationCertificate | PoliceVerification | AddressProof
    "Status"           TEXT          NOT NULL DEFAULT 'Pending', -- Pending | Approved | Rejected
    "FileUrl"          VARCHAR(500)  NOT NULL,
    "RejectionReason"  VARCHAR(500),
    "ReviewedByUserId" UUID,
    "ReviewedAt"       TIMESTAMPTZ,
    "CreatedAt"        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "IX_tutor_verification_documents_TutorProfileId"
    ON tutor_verification_documents("TutorProfileId");
CREATE INDEX IF NOT EXISTS "IX_tutor_verification_documents_Status"
    ON tutor_verification_documents("Status");

-- ── bookings ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Bookings" (
    "Id"                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    "StudentProfileId"   UUID          NOT NULL REFERENCES "StudentProfiles"("Id") ON DELETE CASCADE,
    "TutorProfileId"     UUID          NOT NULL REFERENCES "TutorProfiles"("Id") ON DELETE CASCADE,
    "Subject"            VARCHAR(100)  NOT NULL,
    "GradeLevel"         VARCHAR(50),
    "Mode"               TEXT          NOT NULL, -- Online | Offline | Both
    "Status"             TEXT          NOT NULL DEFAULT 'Pending', -- Pending | Confirmed | Cancelled | Completed | Rescheduled
    "StartTime"          TIMESTAMPTZ   NOT NULL,
    "EndTime"            TIMESTAMPTZ   NOT NULL,
    "HourlyRate"         NUMERIC(10,2) NOT NULL DEFAULT 0,
    "IsTrial"            BOOLEAN       NOT NULL DEFAULT FALSE,
    "MeetingLink"        VARCHAR(500),
    "LocationAddress"    VARCHAR(500),
    "StudentNotes"       VARCHAR(1000),
    "CancellationReason" VARCHAR(1000),
    "CreatedAt"          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    "UpdatedAt"          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "IX_Bookings_StudentProfileId" ON "Bookings"("StudentProfileId");
CREATE INDEX IF NOT EXISTS "IX_Bookings_TutorProfileId" ON "Bookings"("TutorProfileId");
CREATE INDEX IF NOT EXISTS "IX_Bookings_StartTime" ON "Bookings"("StartTime");
CREATE INDEX IF NOT EXISTS "IX_Bookings_Status" ON "Bookings"("Status");

-- ── conversations ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Conversations" (
    "Id"               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    "StudentProfileId" UUID         NOT NULL REFERENCES "StudentProfiles"("Id") ON DELETE CASCADE,
    "TutorProfileId"   UUID         NOT NULL REFERENCES "TutorProfiles"("Id") ON DELETE CASCADE,
    "Subject"          VARCHAR(100),
    "LastMessageAt"    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    "CreatedAt"        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS "IX_Conversations_StudentProfileId_TutorProfileId"
    ON "Conversations"("StudentProfileId", "TutorProfileId");
CREATE INDEX IF NOT EXISTS "IX_Conversations_LastMessageAt"
    ON "Conversations"("LastMessageAt");

-- ── chat_messages ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ChatMessages" (
    "Id"             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    "ConversationId" UUID          NOT NULL REFERENCES "Conversations"("Id") ON DELETE CASCADE,
    "SenderUserId"   UUID          NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "Content"        VARCHAR(2000) NOT NULL,
    "IsRead"         BOOLEAN       NOT NULL DEFAULT FALSE,
    "SentAt"         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "IX_ChatMessages_ConversationId" ON "ChatMessages"("ConversationId");
CREATE INDEX IF NOT EXISTS "IX_ChatMessages_SentAt" ON "ChatMessages"("SentAt");
CREATE INDEX IF NOT EXISTS "IX_ChatMessages_IsRead" ON "ChatMessages"("IsRead");

-- ── auto-update UpdatedAt ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW."UpdatedAt" = NOW(); RETURN NEW; END; $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_upd') THEN
    CREATE TRIGGER trg_users_upd BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_tutor_upd') THEN
    CREATE TRIGGER trg_tutor_upd BEFORE UPDATE ON tutor_profiles
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_student_upd') THEN
    CREATE TRIGGER trg_student_upd BEFORE UPDATE ON student_profiles
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_req_upd') THEN
    CREATE TRIGGER trg_req_upd BEFORE UPDATE ON tuition_requirements
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

-- ── auto-recalculate tutor rating ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION refresh_tutor_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE tutor_profiles SET
    "RatingAvg"   = COALESCE((SELECT AVG("Rating") FROM reviews
                               WHERE "TutorProfileId" = NEW."TutorProfileId"
                                 AND "Status" = 'Visible'), 0),
    "RatingCount" = (SELECT COUNT(*) FROM reviews
                      WHERE "TutorProfileId" = NEW."TutorProfileId"
                        AND "Status" = 'Visible')
  WHERE "Id" = NEW."TutorProfileId";
  RETURN NEW;
END; $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_review_rating') THEN
    CREATE TRIGGER trg_review_rating AFTER INSERT OR UPDATE OR DELETE ON reviews
        FOR EACH ROW EXECUTE FUNCTION refresh_tutor_rating();
  END IF;
END $$;

-- ── default admin user (password: Admin@123) ──────────────────────────────────
-- BCrypt hash of 'Admin@123' with cost factor 11
INSERT INTO users ("FullName","Email","Phone","PasswordHash","Role","IsActive","EmailVerified")
VALUES ('Admin','admin@hometutor.in','9000000000',
        '$2a$11$K8TkYezgwJq5qJzRhkX5reXfWmEkA9jJKPf9VV9c9N0b7t1RgGfHe',
        'Admin', TRUE, TRUE)
ON CONFLICT ("Email") DO NOTHING;
