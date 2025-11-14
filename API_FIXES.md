# API Fixes Summary

## Issues Fixed

### 1. **Column Name Mapping (Snake Case ↔ Camel Case)**
The database uses `snake_case` (first_name, last_name, student_id, team_id) but the TypeScript frontend expects `camelCase` (firstName, lastName, studentId, teamId). This was causing data not to load properly.

**Files Fixed:**
- `api/users/get.php` - Maps user fields to camelCase
- `api/users/get_by_id.php` - Maps user fields to camelCase
- `api/users/update.php` - Maps returned user data to camelCase
- `api/auth/login.php` - Maps user fields to camelCase
- `api/auth/register.php` - Maps user fields to camelCase
- `api/auth/complete-profile.php` - Maps user fields to camelCase
- `api/teams/get.php` - Maps team fields and handles event_scores JSON
- `api/teams/members.php` - Maps member fields to camelCase
- `api/events/get.php` - Maps event fields and parses criteria/results JSON

### 2. **Permission Issue in users/get.php**
The endpoint was restricting access to only admin/officer roles, but regular users on the Teams page need to access user data.

**Fix:** Removed the role check to allow any authenticated user to see user data.

## How to Test

1. **Database Setup:**
   - Create database: `sims_db`
   - Import schema: `sql/sims_schema.sql`
   - Add sample data (or use the SQL INSERT statements)

2. **Login:**
   - Go to http://localhost/SIMS4 (or your path)
   - Login with test credentials
   - Token will be stored in localStorage

3. **Check Pages:**
   - Navigate to Teams - should load leaderboard with teams and user counts
   - Navigate to Events - should load events
   - Navigate to Profile - should load profile with available events

## API Endpoints Status

### GET Endpoints (Data Loading)
- ✅ `/api/users/get.php` - Returns all users (fixed)
- ✅ `/api/users/get_by_id.php` - Returns specific user (fixed)
- ✅ `/api/teams/get.php` - Returns teams leaderboard (fixed)
- ✅ `/api/teams/members.php` - Returns team members (fixed)
- ✅ `/api/events/get.php` - Returns all events (fixed)

### Auth Endpoints
- ✅ `/api/auth/login.php` - Login & get token (fixed)
- ✅ `/api/auth/register.php` - Register new user (fixed)
- ✅ `/api/auth/complete-profile.php` - Complete profile (fixed)

## Database Schema Reminder

The database columns are:
```
users table:
- id (INT)
- first_name, last_name (VARCHAR)
- email (VARCHAR)
- password_hash (VARCHAR)
- role (ENUM: user, team_lead, officer, admin)
- avatar, student_id, bio, contact_info, year_level, section, gender, birthdate (VARCHAR/TEXT)
- team_id (INT, FK to teams)

teams table:
- id (INT)
- name, description (VARCHAR/TEXT)
- score (INT)
- merits, demerits, event_scores (JSON)
- Various leader/adviser IDs

events table:
- id (INT)
- name, description (VARCHAR/TEXT)
- date (DATE)
- criteria, results (JSON)
```

## Next Steps if Issues Persist

1. Check browser console for error messages
2. Check XAMPP MySQL error logs
3. Run `test_api.php` to verify database connection
4. Verify JWT token is being sent: Check Network tab in Dev Tools
5. Check that all required PHP extensions are enabled (JSON, PDO, etc.)
