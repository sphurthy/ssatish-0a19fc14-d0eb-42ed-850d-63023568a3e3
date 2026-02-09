# Requirements Checklist & Step-by-Step Test Guide

This document maps **every requirement from the Full Stack Assessment** to the implementation and gives **concrete steps to test** each one.

---

## Part A: Requirements Checklist (per Assessment Doc)

| Requirement | Implemented | Where / Notes |
|-------------|-------------|----------------|
| **Monorepo** | | |
| Repo naming (first letter + last name + hyphen + uuid) | ✅ | Repository name follows pattern |
| apps/api → NestJS backend | ✅ | `apps/api/` |
| apps/dashboard → Angular frontend | ✅ | `apps/dashboard/` |
| libs/data → Shared interfaces & DTOs | ✅ | `libs/data/` – enums, types |
| libs/auth → RBAC logic & decorators | ✅ | `libs/auth/` – permissions, `@RequirePermissions` |
| **Backend** | | |
| NestJS + TypeORM + SQLite | ✅ | TypeORM + sql.js (SQLite-compatible) |
| Data: Users, Orgs (2-level), Roles, Permissions, Tasks | ✅ | Entities in `apps/api/src/app/` |
| Roles: Owner, Admin, Viewer | ✅ | `libs/data` enums, seed & RBAC |
| Decorators & guards for access checks | ✅ | `RbacGuard`, `@RequirePermissions` in libs/auth & api |
| Ownership & org-level access | ✅ | `TasksService` scopes by org + children |
| Role inheritance / permission map | ✅ | `libs/auth` ROLE_PERMISSIONS |
| Task visibility scoped by role & org | ✅ | List filtered by org scope; Viewer read-only |
| Basic audit logging (console) | ✅ | `AuditLogService` – in-memory + console |
| POST /tasks (with permission check) | ✅ | `TasksController` + RbacGuard |
| GET /tasks (scoped) | ✅ | Query by org scope + filters |
| PUT /tasks/:id, DELETE /tasks/:id | ✅ | With permission & org checks |
| GET /audit-log (Owner/Admin only) | ✅ | `@RequirePermissions(Permission.AuditRead)` |
| Real JWT auth (no mock) | ✅ | `AuthService`, JwtStrategy, passport-jwt |
| Login; token in all requests | ✅ | Frontend: auth interceptor adds Bearer token |
| Token verification on all (business) endpoints | ✅ | JwtAuthGuard on tasks & audit-log; login & GET /api public |
| **Frontend** | | |
| Angular + TailwindCSS | ✅ | `apps/dashboard`, Tailwind in styles |
| Create, edit, delete tasks | ✅ | Dashboard form + Edit/Delete buttons |
| Sort, filter, categorize (Work, Personal) | ✅ | Filters: category, status, search, sort |
| Drag-and-drop reorder / status change | ✅ | CDK DragDrop between status columns |
| Responsive (mobile to desktop) | ✅ | Tailwind grid/flex, max-w, responsive classes |
| Login UI → backend auth | ✅ | Login page → POST /api/auth/login |
| Store JWT after login | ✅ | localStorage in AuthService |
| Attach JWT to all API requests | ✅ | `authInterceptor` adds Authorization header |
| State management | ✅ | TasksStore (BehaviorSubject + services) |
| **Testing** | | |
| Backend: Jest; RBAC, auth, API tests | ✅ | `nx test api`, libs/auth permissions, auth.service, app.e2e-spec |
| Frontend: Jest or Karma; components & state | ✅ | Vitest for dashboard; login component, tasks store |
| **README** | | |
| Setup: run backend/frontend, .env | ✅ | README.md |
| Architecture, data model, ERD | ✅ | README sections |
| Access control & JWT integration | ✅ | README Access Control Implementation |
| API docs + sample requests | ✅ | README API Documentation |
| Future considerations | ✅ | README Future Considerations |

**Note:** The only unauthenticated API routes are `GET /api` (welcome/health) and `POST /api/auth/login`; all task and audit-log endpoints require JWT.

---

## Part B: Step-by-Step Test Steps (Proof of Requirements)

Run **API** and **dashboard** first:

```bash
npx nx serve api
# In another terminal:
npx nx serve dashboard
```

---

### 1. Monorepo layout

| Step | Action | Expected |
|------|--------|----------|
| 1.1 | Open repo root. Check folders. | `apps/api`, `apps/dashboard`, `libs/data`, `libs/auth` exist. |
| 1.2 | In `libs/data/src`: open `lib/enums.ts`, `lib/types.ts`. | UserRole, Permission, TaskCategory, TaskStatus; Task, User, Organization types. |
| 1.3 | In `libs/auth/src`: open `lib/permissions.ts`, `lib/decorators.ts`. | `hasPermission`, `getRolePermissions`; `RequirePermissions` decorator. |

---

### 2. Backend – Authentication (real JWT, no mock)

| Step | Action | Expected |
|------|--------|----------|
| 2.1 | Browser: `http://localhost:4200/login`. Login `owner@acme.com` / `password123`. | Redirect to `/tasks`. |
| 2.2 | DevTools → Application → Local Storage. | Key `task-auth-token` (or similar) with JWT string. **Proves: real JWT, store JWT after login.** |
| 2.3 | DevTools → Network. Reload `/tasks`. Select request to `.../api/tasks`. | Request Headers include `Authorization: Bearer <token>`. **Proves: token in all requests.** |
| 2.4 | Log out. Open new tab → `http://localhost:4200/tasks`. | Redirect to `/login`. **Proves: protected routes, token verification.** |

---

### 3. Backend – API endpoints and permission checks

Use Postman, Insomnia, or curl. Base URL: `http://localhost:3000/api`.

| Step | Request | Expected |
|------|---------|----------|
| 3.1 | **POST** `/tasks`, body `{ "title": "Test", "category": "Work", "status": "Todo" }`, **no** Authorization. | **401 Unauthorized.** Proves token required. |
| 3.2 | **POST** `/auth/login`, body `{ "email": "owner@acme.com", "password": "password123" }`. | 201; body has `accessToken`, `user`. Copy `accessToken`. |
| 3.3 | **GET** `/tasks`, header `Authorization: Bearer <accessToken>`. | 200; JSON array of tasks. Proves GET /tasks, list accessible tasks. |
| 3.4 | **POST** `/tasks`, header `Authorization: Bearer <accessToken>`, body `{ "title": "New task", "description": "From API", "category": "Work", "status": "Todo" }`. | 201; created task. Proves POST /tasks, permission check (Owner can create). |
| 3.5 | **PUT** `/tasks/<id>` (use id from GET), header same, body `{ "title": "Updated title", "status": "InProgress" }`. | 200; updated task. Proves PUT /tasks/:id, edit if permitted. |
| 3.6 | **DELETE** `/tasks/<id>`, header same. | 200. Proves DELETE /tasks/:id, delete if permitted. |
| 3.7 | **GET** `/audit-log`, header `Authorization: Bearer <accessToken>` (Owner). | 200; array of audit entries. Proves GET /audit-log, Owner/Admin only. |

---

### 4. Backend – RBAC (Viewer read-only; audit-log Owner/Admin only)

| Step | Action | Expected |
|------|--------|----------|
| 4.1 | Login as Viewer: POST `/auth/login` `{ "email": "viewer@acme.com", "password": "password123" }`. Copy Viewer `accessToken`. | 201; token for Viewer. |
| 4.2 | **GET** `/tasks` with Viewer token. | 200; list of tasks. Proves Viewer can read. |
| 4.3 | **POST** `/tasks` with Viewer token, body `{ "title": "No", "category": "Work", "status": "Todo" }`. | **403 Forbidden.** Proves Viewer cannot create. |
| 4.4 | **PUT** or **DELETE** `/tasks/<id>` with Viewer token. | **403 Forbidden.** Proves RBAC for update/delete. |
| 4.5 | **GET** `/audit-log` with Viewer token. | **403 Forbidden.** Proves audit-log Owner and Admin only. |

---

### 5. Backend – Organization hierarchy (2-level, scoping)

| Step | Action | Expected |
|------|--------|----------|
| 5.1 | Login as Owner (`owner@acme.com`). GET `/tasks`. Note count and which orgs’ tasks appear. | Owner (parent org) sees tasks from parent + child orgs. |
| 5.2 | Login as `viewer@subsidiary.com` (child org). GET `/tasks`. | Fewer tasks; only child-org tasks. Proves org-level access, 2-level hierarchy. |

---

### 6. Backend – Audit logging

| Step | Action | Expected |
|------|--------|----------|
| 6.1 | In terminal running `npx nx serve api`, trigger: login (Owner), GET /tasks, POST /tasks. | Console lines like `[AUDIT] { userId, action, resource, allowed, timestamp }`. Proves basic audit logging (console). |
| 6.2 | GET `/audit-log` with Owner token. | Response array includes those actions. Proves view access logs. |

---

### 7. Frontend – Task management dashboard

| Step | Action | Expected |
|------|--------|----------|
| 7.1 | Login at `http://localhost:4200/login` as `owner@acme.com` / `password123`. | Land on task dashboard. |
| 7.2 | **Create:** Fill “Create / Edit Task” (title, category Work/Personal, status). Click “Save Task”. | New task appears. Proves create tasks. |
| 7.3 | **Edit:** Click “Edit” on a task; change title or status; “Save Task”. | Task updates. Proves edit tasks. |
| 7.4 | **Delete:** Click “Delete” on a task. | Task removed. Proves delete tasks. |
| 7.5 | **Sort/filter/categorize:** Set Category, Status, Search, Sort; click “Apply”. | List updates. Proves sort, filter, categorize (e.g. Work, Personal). |
| 7.6 | **Drag-and-drop:** Drag a task from one status column to another. | Task moves; status updates (reload to confirm persistence). Proves drag-and-drop for reorder/status. |
| 7.7 | **Responsive:** Resize browser to mobile width and back. | Layout adapts. Proves responsive (mobile to desktop). |

---

### 8. Frontend – Auth UI and JWT

| Step | Action | Expected |
|------|--------|----------|
| 8.1 | Login page has email/password and “Sign In”; submit. | Success → redirect to `/tasks`, token stored and sent on API calls (see 2.2–2.3). Proves Login UI vs backend, store JWT, attach JWT to all requests. |

---

### 9. State management

| Step | Action | Expected |
|------|--------|----------|
| 9.1 | In code: open `apps/dashboard/src/app/services/tasks.store.ts`. | Store (e.g. BehaviorSubject) + TasksService for API; components use store. Proves state management. |

---

### 10. Automated tests

| Step | Command | Expected |
|------|---------|----------|
| 10.1 | `npx nx test api` | Tests pass: RBAC permissions, auth service (login valid/invalid), API (e2e login + list tasks). Proves Jest, RBAC, auth, API. |
| 10.2 | `npx nx test dashboard` | Tests pass: e.g. login component, tasks store. Proves components and state (Vitest used; doc allows Jest or Karma). |

---

### 11. README requirements

| Step | Action | Expected |
|------|--------|----------|
| 11.1 | Open README.md. | Contains: setup (run backend/frontend, .env), architecture, data model/ERD, access control & JWT, API docs with sample requests/responses, future considerations. |

---

## Optional (bonus) – Not required by doc

- Task completion visualization (e.g. bar chart): not implemented.
- Dark/light mode toggle: not implemented.
- Keyboard shortcuts: not implemented.
