# Secure Task Management System

Secure Task Management System built with an Nx monorepo, NestJS backend, and Angular + TailwindCSS frontend. The platform uses JWT authentication, role-based access control (RBAC), and organization hierarchy scoping.

## Monorepo Structure

```
apps/
  api/        # NestJS backend
  dashboard/  # Angular frontend
libs/
  data/       # Shared TypeScript interfaces + enums
  auth/       # Reusable RBAC logic and decorators
```

## Setup Instructions

### Prerequisites
- Node.js 20+
- npm 10+

### Install Dependencies
```sh
npm install
```

### Environment Configuration
Copy the example file and update values as needed:
```sh
copy .env.example .env
```

`.env` values:
- `PORT` - API server port (default 3000)
- `JWT_SECRET` - JWT signing key
- `DB_PATH` - sql.js database location name

## Run the Applications

### Backend (NestJS API)
```sh
npx nx serve api
```
The API runs on `http://localhost:3000/api`.

### Frontend (Angular Dashboard)
```sh
npx nx serve dashboard
```
The dashboard runs on `http://localhost:4200`.

## Seeded Test Accounts

| Role   | Email                 | Password     |
|--------|-----------------------|--------------|
| Owner  | owner@acme.com         | password123  |
| Admin  | admin@acme.com         | password123  |
| Viewer | viewer@acme.com        | password123  |
| Viewer | viewer@subsidiary.com  | password123  |

## Architecture Overview

- **apps/api**: NestJS API with TypeORM (sql.js), JWT auth, RBAC guard, and audit logging.
- **apps/dashboard**: Angular + Tailwind UI with JWT login, drag-and-drop task board, filters, and responsive layout.
- **libs/data**: Shared enums/interfaces (`Task`, `User`, `Organization`, `Permission`).
- **libs/auth**: Shared RBAC logic (`hasPermission`, `RequirePermissions` decorator).

## Data Model Explanation

### Entities
- **Organizations**: 2-level hierarchy (parent + children)
- **Users**: belong to organizations and hold a role (Owner/Admin/Viewer)
- **Permissions**: explicit permission records (`task:create`, `audit:read`, etc.)
- **Tasks**: belong to organizations and have category, status, order, and creator

### ERD (Simplified)

```
Organization (1) <---> (many) User
Organization (1) <---> (many) Task
User (1) <---> (many) Task (createdBy)
```

## Access Control Implementation

### Roles and Permissions
- **Owner**: full access to tasks + audit log
- **Admin**: full access to tasks + audit log
- **Viewer**: read-only access to tasks

### Organization Hierarchy
- Users can access tasks in their own organization.
- Users in a parent organization can access tasks in child organizations.
- Users in child orgs cannot access parent org tasks.

### JWT Integration
- `/api/auth/login` issues JWT on valid credentials.
- `JwtAuthGuard` validates tokens for all protected endpoints.
- `RbacGuard` enforces permissions and writes to the audit log.

## API Documentation

### POST `/api/auth/login`
Request:
```json
{ "email": "owner@acme.com", "password": "password123" }
```
Response:
```json
{ "accessToken": "<jwt>", "user": { "id": "...", "role": "Owner", ... } }
```

### POST `/api/tasks`
Create a task (Owner/Admin).

### GET `/api/tasks`
List accessible tasks. Optional query params:
`category`, `status`, `search`, `sort` (`order | title | status`)

### PUT `/api/tasks/:id`
Update a task (Owner/Admin, scoped by org).

### DELETE `/api/tasks/:id`
Delete a task (Owner/Admin, scoped by org).

### GET `/api/audit-log`
View audit log (Owner/Admin).

## Testing Strategy

### Backend (Jest)
```sh
npx nx test api
```
Covered:
- RBAC permission map tests
- Auth service login tests
- API endpoint tests (login + list tasks)

### Frontend (Vitest)
```sh
npx nx test dashboard
```
Covered:
- Login component creation
- Task store state management

## Test Steps (Manual)

### Authentication
1. Start API and dashboard.
2. Go to `http://localhost:4200/login`.
3. Login with `owner@acme.com / password123`.
4. Confirm redirect to `/tasks`.

### RBAC
1. Login as `viewer@acme.com`.
2. Confirm task list loads.
3. Try creating or deleting a task (expect 403 errors in API console).

### Organization Scoping
1. Login as `owner@acme.com` (parent org).
2. Confirm tasks from both parent and child orgs appear.
3. Login as `viewer@subsidiary.com` (child org).
4. Confirm only child org tasks are visible.

### Drag-and-Drop
1. Drag a task card between columns.
2. Confirm status updates after drop.

## Future Considerations

- JWT refresh tokens and rotation
- CSRF protection for browser-based sessions
- RBAC caching for high-volume permission checks
- Advanced role delegation and per-task permissions
- Database migrations and production hardening

## Tradeoffs / Notes

- `sql.js` is used for SQLite compatibility without native builds.
- Audit logging is stored in-memory and printed to console for simplicity.

---

## Requirements checklist and test steps

For a **requirement-by-requirement checklist** and **step-by-step test instructions** that prove every item in the assessment doc, see **[TESTING-REQUIREMENTS.md](./TESTING-REQUIREMENTS.md)**.



<!-- See TESTING-REQUIREMENTS.md for full requirements checklist and step-by-step test steps. -->