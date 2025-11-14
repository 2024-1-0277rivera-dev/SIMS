
# SIMS - Backend Integration Guide

This document provides a comprehensive overview of the Sports Information Management System (SIMS) frontend application and outlines the necessary backend API endpoints required for full functionality. It is intended for backend developers who will be building the server-side logic and database to support this application.

## 1. Overview & Core Functionality

SIMS is a dynamic, role-based platform for managing sports tournaments and events. Key features include:

- **Role-Based Access Control:** Different user roles (Admin, Officer, Team Lead, User) have varying levels of permissions.
- **Real-Time Leaderboard:** Team rankings and scores are updated live as event results are submitted.
- **Team Management Hub:** A centralized place for team leaders to manage members, rosters, join requests, and view team-specific analytics.
- **Event Management:** Admins and Officers can create, update, and delete events, including detailed mechanics and judging criteria.
- **Score Submission:** Authorized users can input detailed scores for events, which automatically calculates placements and updates the leaderboard.
- **User Profiles:** Users can manage their personal information and declare interest in specific events.
- **Reporting System:** Users can submit reports or suggestions, which can be reviewed and replied to by administrators.
- **Notifications & Activity Feed:** The system generates notifications and logs user activity for key actions.
- **Dynamic Content Visibility:** Admins can toggle the visibility of specific pages or data sections (e.g., hide scores) for regular users.

---

## 2. Frontend Architecture & Dependencies

The frontend is built with React, TypeScript, and Tailwind CSS. Understanding its structure is key to building a compatible backend.

### Key Dependencies:
- **React & React DOM:** Core UI library.
- **React Router (`react-router-dom`):** For client-side routing and navigation.
- **Framer Motion:** For UI animations and transitions.
- **Recharts:** For data visualization (charts).
- **@google/genai:** For integrating with the Gemini API for AI-powered features (currently unused but planned).

### Project Structure:
- `src/pages/`: Contains top-level components for each page/route (e.g., `Dashboard.tsx`, `Leaderboard.tsx`).
- `src/components/`: Contains reusable UI components (e.g., `Card.tsx`, `Button.tsx`, `Modal.tsx`).
- `src/contexts/`: Manages global state using React Context (e.g., `AuthContext.tsx`, `ThemeContext.tsx`). This is crucial for understanding how user data is managed across the app.
- `src/hooks/`: Custom hooks that abstract logic, such as data fetching (`useSyncedData.ts`) or permission checks (`usePermissions.ts`).
- `src/services/api.ts`: **The most important file for backend integration.** It acts as a data layer, containing all functions that fetch or manipulate data. Currently, it's a mock API. **Your goal is to replace the mock logic in this file with real HTTP requests to your backend.**
- `src/types.ts`: Contains all TypeScript interfaces for data models (`User`, `Team`, `Event`, etc.). These should be used as the blueprint for your database schemas and API response structures.

---

## 3. Database Models (Schema Blueprint)

The backend database should be designed to store data that conforms to the interfaces defined in `src/types.ts`. Below are the primary models.

```typescript
// From: src/types.ts

export enum UserRole {
  USER = 'user',
  TEAM_LEAD = 'team_lead',
  OFFICER = 'officer',
  ADMIN = 'admin',
}

export interface User {
  id: string; // Primary Key (UUID or auto-increment)
  name: string;
  email: string; // Unique
  role: UserRole;
  avatar: string; // URL
  studentId?: string; // Unique
  bio?: string;
  teamId?: string; // Foreign Key to Team
  password?: string; // Hashed password
  firstName?: string;
  lastName?: string;
  contactInfo?: string;
  yearLevel?: string;
  section?: string;
  interestedEvents?: string[]; // Stored as JSON array or in a separate table
  gender?: string;
  birthdate?: string; // ISO 8601 Date string
  lastActive?: string; // ISO 8601 DateTime string
}

export interface Team {
  id: string; // Primary Key
  name: string;
  score: number;
  // ... other stats
  description?: string;
  merits?: Merit[]; // Stored as JSON or separate table
  demerits?: Demerit[]; // Stored as JSON or separate table
  eventScores?: EventScore[]; // Stored as JSON or separate table
  detailedProgressHistory?: DetailedScoreHistoryPoint[]; // Stored as JSON or separate table
  unitLeader?: string; // Foreign Key to User
  unitSecretary?: string; // Foreign Key to User
  unitTreasurer?: string; // Foreign Key to User
  unitErrands?: string[]; // Array of Foreign Keys to User
  adviser?: string; // Foreign Key to User
  facilitators?: Facilitator[]; // JSON or separate table
  rosters?: Roster[]; // JSON or separate table
  joinRequests?: JoinRequest[]; // JSON or separate table
}

export interface Event {
  id: string; // Primary Key
  name: string;
  date: string; // ISO 8601 Date string
  // ... other event details
  criteria: CriteriaItem[]; // Stored as JSON
  results?: EventResult[]; // Stored as JSON or separate table
}

export interface Report {
  id: string; // Primary Key
  type: 'report' | 'suggestion';
  description: string;
  submittedBy: string; // Foreign Key to User
  timestamp: string; // ISO 8601 DateTime string
  status: 'pending' | 'reviewed' | 'resolved';
  replies?: ReportReply[]; // JSON or separate table
  // ... other report details
}

// ... and other related interfaces from types.ts
```

---

## 4. Backend API Specification

This section details every API endpoint the frontend expects. All requests and responses should use JSON. Authentication should be handled via JWT (JSON Web Tokens) sent in the `Authorization: Bearer <token>` header for protected routes.

### 4.1. Authentication (`/api/auth`)

**POST `/api/auth/login`**
- **Description:** Authenticates a user with email and password.
- **Auth:** Public.
- **Request Body:** `{ "email": "user@example.com", "password": "password123" }`
- **Success (200):** `{ "token": "jwt_token_string", "user": User_Object }`
- **Error (401):** Invalid credentials.
- **Error (404):** User not found.

**POST `/api/auth/register`**
- **Description:** Creates a new user account.
- **Auth:** Public.
- **Request Body:** A partial `User` object including `firstName`, `lastName`, `email`, `password`, etc.
- **Success (201):** `{ "token": "jwt_token_string", "user": New_User_Object }`
- **Error (400):** Email already exists or invalid data.

**POST `/api/auth/google`**
- **Description:** Handles login/registration via Google OAuth. The backend should verify the Google token, then find or create a user.
- **Auth:** Public.
- **Request Body:** `{ "googleToken": "google_id_token" }`
- **Success (200):** `{ "token": "jwt_token_string", "user": User_Object, "isNew": boolean }` (`isNew` tells the frontend to redirect to the profile completion page).

**PUT `/api/auth/complete-profile`**
- **Description:** Updates a user's profile, typically after a social login.
- **Auth:** Required (User's own token).
- **Request Body:** A `User` object with all required fields filled in.
- **Success (200):** `{ "user": Updated_User_Object }`
- **Error (400):** Invalid data.

### 4.2. Users (`/api/users`)

**GET `/api/users`**
- **Description:** Retrieves a list of all users.
- **Auth:** Required (Admin, Officer).
- **Success (200):** `[ User_Object_1, User_Object_2, ... ]`

**GET `/api/users/:userId`**
- **Description:** Retrieves a single user's public profile.
- **Auth:** Required.
- **Success (200):** `User_Object` (without sensitive data like password).
- **Error (404):** User not found.

**PUT `/api/users/:userId`**
- **Description:** Updates a user's own profile information.
- **Auth:** Required (User's own token).
- **Request Body:** A partial `User` object with fields to update.
- **Success (200):** `Updated_User_Object`
- **Error (403):** Forbidden (trying to edit another user).

**PUT `/api/users/:userId/role`**
- **Description:** Updates a user's role.
- **Auth:** Required (Admin only).
- **Request Body:** `{ "role": "admin" }`
- **Success (200):** `Updated_User_Object`
- **Error (404):** User not found.

**DELETE `/api/users/:userId`**
- **Description:** Deletes a user.
- **Auth:** Required (Admin only).
- **Success (204):** No content.
- **Error (404):** User not found.

### 4.3. Teams (`/api/teams`)

**GET `/api/teams` (Leaderboard)**
- **Description:** Retrieves all teams, sorted by score for the leaderboard. Should include calculated stats like `playersCount`, `rank`, and `placementStats`.
- **Auth:** Required.
- **Success (200):** `[ Team_Object_1, Team_Object_2, ... ]`

**GET `/api/teams/:teamId`**
- **Description:** Retrieves detailed information for a single team.
- **Auth:** Required.
- **Success (200):** `Team_Object`
- **Error (404):** Team not found.

**GET `/api/teams/:teamId/members`**
- **Description:** Retrieves all user objects who are members of a specific team.
- **Auth:** Required.
- **Success (200):** `[ User_Object_1, User_Object_2, ... ]`

**PUT `/api/teams/:teamId`**
- **Description:** Updates a team's information (e.g., description, leadership roles, facilitators).
- **Auth:** Required (Admin, Officer, Team Lead of that team).
- **Request Body:** A partial `Team` object with fields to update.
- **Success (200):** `Updated_Team_Object`

**POST `/api/teams/:teamId/join-requests`**
- **Description:** A user requests to join a team.
- **Auth:** Required (User's own token).
- **Success (201):** `{ "message": "Request sent" }`

**DELETE `/api/teams/join-requests`**
- **Description:** A user cancels their own pending join request.
- **Auth:** Required (User's own token).
- **Success (204):** No content.

**POST `/api/teams/:teamId/join-requests/:userId`**
- **Description:** A team manager accepts or rejects a join request.
- **Auth:** Required (Admin, Team Lead of that team).
- **Request Body:** `{ "action": "accept" | "reject" }`
- **Success (200):** `{ "message": "Request processed" }`
- **Backend Logic:** If accepted, update the user's `teamId`. In either case, remove the request from the team's `joinRequests` array.

**PUT `/api/teams/:teamId/roster`**
- **Description:** Sets or updates the participant roster for a specific event.
- **Auth:** Required (Admin, Team Lead of that team).
- **Request Body:** `{ "eventId": "event_id", "participants": ["Player Name 1", "Player Name 2"] }`
- **Success (200):** `Updated_Team_Object`

**POST `/api/teams/:teamId/members`**
- **Description:** Admin directly adds a user to a team.
- **Auth:** Required (Admin, Team Lead of that team).
- **Request Body:** `{ "userId": "user_id_to_add" }`
- **Backend Logic:** Set the `teamId` on the specified user.
- **Success (200):** `{ "message": "Member added" }`

**DELETE `/api/teams/:teamId/members/:userId`**
- **Description:** Admin directly removes a user from a team.
- **Auth:** Required (Admin, Team Lead of that team).
- **Backend Logic:** Set the user's `teamId` to `null`.
- **Success (204):** No content.

### 4.4. Events (`/api/events`)

**GET `/api/events`**
- **Description:** Retrieves all events.
- **Auth:** Required.
- **Success (200):** `[ Event_Object_1, Event_Object_2, ... ]`

**POST `/api/events`**
- **Description:** Creates a new event.
- **Auth:** Required (Admin, Officer).
- **Request Body:** A partial `Event` object.
- **Success (201):** `New_Event_Object`

**PUT `/api/events/:eventId`**
- **Description:** Updates an existing event's details.
- **Auth:** Required (Admin, Officer).
- **Request Body:** A partial `Event` object with fields to update.
- **Success (200):** `Updated_Event_Object`

**DELETE `/api/events/:eventId`**
- **Description:** Deletes an event.
- **Auth:** Required (Admin, Officer).
- **Success (204):** No content.

**PUT `/api/events/:eventId/results`**
- **Description:** Submits/updates the results for an event. This is a critical endpoint.
- **Auth:** Required (Admin, Officer, designated Facilitators).
- **Request Body:** `{ "results": [ EventResult_Object_1, EventResult_Object_2, ... ] }`
- **Backend Logic:**
  1.  Store the raw `results` on the event.
  2.  For each team, calculate their total raw score based on criteria scores.
  3.  Sort teams by raw score to determine placements (1st, 2nd, etc.).
  4.  Calculate competition points for each team based on their placement and the event's `competitionPoints`.
  5.  Update each team's `eventScores` array with the new results.
  6.  Recalculate each team's total `score`.
  7.  Recalculate `placementStats` for each team.
  8.  Add an entry to each team's `detailedProgressHistory`.
- **Success (200):** `Updated_Event_Object`

### 4.5. Points/Logs (`/api/points`)

**POST `/api/points`**
- **Description:** Adds a merit or demerit to a team.
- **Auth:** Required (Admin, Officer).
- **Request Body:** `{ "teamId": "t1", "type": "merit" | "demerit", "reason": "Good sportsmanship", "points": 50 }`
- **Backend Logic:**
  1. Add the log to the team's `merits` or `demerits` array.
  2. Update the team's total `score`.
  3. Add an entry to the team's `detailedProgressHistory`.
- **Success (201):** `{ "message": "Log added" }`

**PUT `/api/points/:logId`**
- **Description:** Updates an existing merit/demerit log.
- **Auth:** Required (Admin, Officer).
- **Request Body:** `{ "teamId": "t1", "reason": "Updated reason", "points": 75 }`
- **Backend Logic:** Recalculate team score based on the change in points.
- **Success (200):** `{ "message": "Log updated" }`

**DELETE `/api/points/:logId`**
- **Description:** Deletes a merit/demerit log.
- **Auth:** Required (Admin, Officer).
- **Request Body:** `{ "teamId": "t1", "type": "merit" | "demerit" }`
- **Backend Logic:** Recalculate team score based on the removed points.
- **Success (204):** No content.

### 4.6. Reports (`/api/reports`)

**GET `/api/reports`**
- **Description:** Retrieves all reports (for managers) or only the user's own reports.
- **Auth:** Required.
- **Success (200):** `[ Report_Object_1, Report_Object_2, ... ]`

**POST `/api/reports`**
- **Description:** Submits a new report or suggestion.
- **Auth:** Required.
- **Request Body:** A partial `Report` object. The `submittedBy` field should be set to the authenticated user's ID.
- **Success (201):** `New_Report_Object`

**PUT `/api/reports/:reportId/status`**
- **Description:** Updates the status of a report.
- **Auth:** Required (Admin, Officer).
- **Request Body:** `{ "status": "reviewed" | "resolved" }`
- **Success (200):** `Updated_Report_Object`

**POST `/api/reports/:reportId/replies`**
- **Description:** Adds a reply to a report.
- **Auth:** Required (Admin, Officer).
- **Request Body:** `{ "message": "We are looking into this." }`
- **Backend Logic:** The `repliedBy` field should be set to the authenticated user's ID.
- **Success (201):** `Updated_Report_Object`

### 4.7. Notifications & Activity (`/api/system`)

**GET `/api/system/notifications`**
- **Description:** Retrieves notifications relevant to the current user.
- **Auth:** Required.
- **Backend Logic:** The backend should generate notifications when key events happen (e.g., new event created, report submitted, join request approved) and store them with targeting information (`target.roles`, `target.teamId`, `target.userId`). This endpoint filters and returns only notifications relevant to the authenticated user.
- **Success (200):** `[ Notification_Object_1, ... ]`

**GET `/api/system/activity`**
- **Description:** Retrieves the latest system-wide activities.
- **Auth:** Required.
- **Success (200):** `[ Activity_Object_1, ... ]`

### 4.8. Settings (`/api/settings`)

**GET `/api/settings/visibility`**
- **Description:** Retrieves the global content visibility settings.
- **Auth:** Required.
- **Success (200):** `VisibilitySettings_Object`

**PUT `/api/settings/visibility`**
- **Description:** Updates the global content visibility settings.
- **Auth:** Required (Admin only).
- **Request Body:** `VisibilitySettings_Object`
- **Success (200):** `Updated_VisibilitySettings_Object`

---

## 5. Real-Time Functionality (Recommendation)

The current frontend uses a `useSyncedData` hook which polls for changes by re-fetching data when a `storage-update` event is detected. This is a mock implementation. For a production environment, a push-based system is highly recommended.

- **Recommendation:** Implement a **WebSocket** or **Server-Sent Events (SSE)** endpoint.
- **Events to Push:**
  - `leaderboard_update`: When any team's score changes.
  - `events_update`: When an event is created, updated, or deleted.
  - `reports_update`: When a new report is submitted or a status changes.
  - `notification_new`: When a new notification is created for a user.
- **Implementation:** When the backend performs an action that changes data (e.g., updating event results), it should broadcast a message to all connected clients via the WebSocket/SSE channel. The frontend can then listen for these messages and re-fetch the relevant data or update its state directly. This will provide a truly real-time experience and be more efficient than polling.

---

## 6. Environment Variables

The backend should manage sensitive information like database credentials and JWT secrets. The frontend expects one key for AI features:

- `API_KEY`: The Google Gemini API key. This should be exposed to the frontend build environment.

