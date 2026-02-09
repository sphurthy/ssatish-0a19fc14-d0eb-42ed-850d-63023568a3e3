# Comprehensive Testing Guide

This document provides detailed manual testing scenarios to validate all features of the Task Management System, including security, RBAC, organization scoping, and UX features.

## 📋 Prerequisites

1. **Start the application:**
   ```sh
   # Terminal 1: Start backend
   npx nx serve api

   # Terminal 2: Start frontend
   npx nx serve dashboard
   ```

2. **Access the application:**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3000/api

3. **Test accounts:**
   | Role   | Email                 | Password     | Organization  |
   |--------|-----------------------|--------------|---------------|
   | Owner  | owner@acme.com        | password123  | ACME (parent) |
   | Admin  | admin@acme.com        | password123  | ACME (parent) |
   | Viewer | viewer@acme.com       | password123  | ACME (parent) |
   | Admin  | admin@globex.com      | password123  | Globex (separate) |
   | Viewer | viewer@subsidiary.com | password123  | Subsidiary (child of ACME) |

## 🔐 Authentication Testing

### Test 1: Successful Login
**Objective:** Verify login flow works and redirects correctly

**Steps:**
1. Open http://localhost:4200
2. Should auto-redirect to `/login`
3. Enter email: `owner@acme.com`
4. Enter password: `password123`
5. Click "Sign In"

**Expected Results:**
- ✅ Redirects to `/tasks` dashboard
- ✅ See user name "Owner User" in header
- ✅ See task list populated
- ✅ No errors in browser console

**Security Validation:**
1. Open DevTools → Application → Cookies
2. Verify `accessToken` cookie exists
3. Verify cookie has `HttpOnly` flag (cannot access via `document.cookie`)
4. Open Console and type `document.cookie`
5. Verify `accessToken` is NOT visible (XSS protection)

### Test 2: Invalid Login
**Objective:** Verify failed login handling

**Steps:**
1. Navigate to `/login`
2. Enter email: `invalid@example.com`
3. Enter password: `wrongpassword`
4. Click "Sign In"

**Expected Results:**
- ✅ Stays on login page
- ✅ See error message (toast or inline)
- ✅ No redirect occurs
- ✅ No cookie is set

### Test 3: Logout
**Objective:** Verify logout clears session

**Steps:**
1. Login as any user
2. Click "Logout" button in header
3. Check DevTools → Cookies

**Expected Results:**
- ✅ Redirects to `/login`
- ✅ `accessToken` cookie is cleared
- ✅ Cannot access `/tasks` without logging in again

### Test 4: Session Persistence
**Objective:** Verify cookie-based session survives page refresh

**Steps:**
1. Login as `owner@acme.com`
2. Navigate to `/tasks`
3. Refresh the page (F5)

**Expected Results:**
- ✅ Still authenticated (no redirect to login)
- ✅ Tasks still visible
- ✅ User name still shown in header
- ✅ Session restored from cookie

### Test 5: Protected Route Access
**Objective:** Verify unauthenticated users cannot access protected routes

**Steps:**
1. Ensure logged out (clear cookies if needed)
2. Manually navigate to http://localhost:4200/tasks

**Expected Results:**
- ✅ Redirects to `/login`
- ✅ Cannot see tasks without authentication

## 👥 Role-Based Access Control (RBAC) Testing

### Test 6: Owner Permissions
**Objective:** Verify Owner has full access

**Steps:**
1. Login as `owner@acme.com`
2. Navigate to dashboard
3. Verify buttons visible: "Create Task", "Edit", "Delete"
4. Create a new task
5. Edit an existing task
6. Delete a task

**Expected Results:**
- ✅ All CRUD operations succeed
- ✅ Success toast for each operation
- ✅ Tasks update in UI immediately
- ✅ No 403 errors in console

### Test 7: Admin Permissions
**Objective:** Verify Admin has same task permissions as Owner

**Steps:**
1. Login as `admin@acme.com`
2. Repeat Test 6 steps (create, edit, delete)

**Expected Results:**
- ✅ Same as Owner - all operations succeed
- ✅ No permission errors

### Test 8: Viewer Permissions (Read-Only)
**Objective:** Verify Viewer can only read tasks

**UI Validation:**
1. Login as `viewer@acme.com`
2. Navigate to dashboard
3. Check UI elements

**Expected Results:**
- ✅ "Create Task" button is hidden
- ✅ "Edit" buttons are hidden on task cards
- ✅ "Delete" buttons are hidden on task cards
- ✅ Tasks are visible and can be viewed
- ✅ Filters and search work normally

**API Validation:**
1. Open DevTools → Console
2. Try to create a task via console:
   ```javascript
   fetch('http://localhost:3000/api/tasks', {
     method: 'POST',
     credentials: 'include',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       title: 'Unauthorized Task',
       category: 'Work',
       status: 'Todo'
     })
   }).then(r => console.log(r.status, r.statusText))
   ```

**Expected Results:**
- ✅ API returns 403 Forbidden
- ✅ Error toast appears: "Permission denied"
- ✅ Task is NOT created
- ✅ Audit log records denied attempt (check API console)

### Test 9: Viewer Update Attempt
**Objective:** Verify Viewer cannot update tasks

**Steps:**
1. Still logged in as `viewer@acme.com`
2. Note a task ID from the UI (e.g., `task-1`)
3. Try to update via console:
   ```javascript
   fetch('http://localhost:3000/api/tasks/task-1', {
     method: 'PUT',
     credentials: 'include',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ title: 'Hacked' })
   }).then(r => console.log(r.status, r.statusText))
   ```

**Expected Results:**
- ✅ 403 Forbidden response
- ✅ Error toast: "Permission denied"
- ✅ Task remains unchanged

### Test 10: Viewer Delete Attempt
**Objective:** Verify Viewer cannot delete tasks

**Steps:**
1. Still logged in as `viewer@acme.com`
2. Try to delete via console:
   ```javascript
   fetch('http://localhost:3000/api/tasks/task-1', {
     method: 'DELETE',
     credentials: 'include'
   }).then(r => console.log(r.status, r.statusText))
   ```

**Expected Results:**
- ✅ 403 Forbidden response
- ✅ Error toast: "Permission denied"
- ✅ Task still exists

## 🏢 Organization Scoping Testing

### Test 11: Parent Organization Access
**Objective:** Verify parent org users can see child org tasks

**Steps:**
1. Login as `owner@acme.com` (parent org)
2. View task list
3. Check which organizations' tasks are visible

**Expected Results:**
- ✅ See tasks from ACME organization
- ✅ See tasks from Subsidiary organization (child)
- ✅ Do NOT see tasks from Globex (separate org)

### Test 12: Child Organization Access
**Objective:** Verify child org users cannot see parent org tasks

**Steps:**
1. Login as `viewer@subsidiary.com` (child org)
2. View task list

**Expected Results:**
- ✅ See ONLY Subsidiary organization tasks
- ✅ Do NOT see ACME parent org tasks
- ✅ Do NOT see Globex tasks

### Test 13: Cross-Organization Isolation
**Objective:** Verify complete isolation between separate organizations

**Steps:**
1. Login as `admin@globex.com`
2. Create a task in Globex
3. Logout
4. Login as `owner@acme.com`
5. View task list

**Expected Results:**
- ✅ Cannot see Globex task
- ✅ Only see ACME and Subsidiary tasks

### Test 14: Cross-Organization Update Prevention
**Objective:** Verify users cannot update tasks from other organizations

**Steps:**
1. Login as `owner@acme.com`
2. Create a task (note the task ID)
3. Logout
4. Login as `admin@globex.com`
5. Try to update the ACME task via console:
   ```javascript
   fetch('http://localhost:3000/api/tasks/TASK_ID_HERE', {
     method: 'PUT',
     credentials: 'include',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ title: 'Hacked across orgs' })
   }).then(r => console.log(r.status, r.statusText))
   ```

**Expected Results:**
- ✅ 403 Forbidden response
- ✅ Task remains unchanged
- ✅ Audit log records denied cross-org access

## 🎨 UX Features Testing

### Test 15: Toast Notifications
**Objective:** Verify toast notifications appear for all actions

**Success Toasts:**
1. Login as `admin@acme.com`
2. Create a task → Verify green success toast appears
3. Edit a task → Verify green success toast appears
4. Delete a task → Verify green success toast appears

**Error Toasts:**
1. Logout
2. Login as `viewer@acme.com`
3. Try to create task via console → Verify red error toast

**Toast Behavior:**
- ✅ Toasts appear in top-right corner
- ✅ Auto-dismiss after ~5 seconds
- ✅ Can manually dismiss by clicking X
- ✅ Multiple toasts stack vertically
- ✅ Slide-in animation

### Test 16: Edit Modal
**Objective:** Verify edit modal works correctly

**Steps:**
1. Login as `admin@acme.com`
2. Click "Edit" on any task
3. Verify modal appears
4. Change task title
5. Click "Save"

**Expected Results:**
- ✅ Modal appears with task data pre-filled
- ✅ Can edit all fields (title, description, category, status)
- ✅ "Save" button updates task
- ✅ Success toast appears
- ✅ Modal closes
- ✅ Task list updates with new data

**Modal Interactions:**
- ✅ Click outside modal (backdrop) → modal closes without saving
- ✅ Press ESC key → modal closes without saving
- ✅ Click X button → modal closes without saving
- ✅ Click "Cancel" → modal closes without saving

### Test 17: Delete Confirmation Modal
**Objective:** Verify delete confirmation prevents accidental deletions

**Steps:**
1. Login as `admin@acme.com`
2. Click "Delete" on any task
3. Verify confirmation modal appears
4. Read the confirmation message
5. Click "Cancel"
6. Verify task still exists
7. Click "Delete" again
8. Click "Confirm" (red button)

**Expected Results:**
- ✅ Confirmation modal shows task title
- ✅ "Cancel" button does not delete task
- ✅ "Confirm" button deletes task
- ✅ Success toast appears after deletion
- ✅ Task removed from list immediately

### Test 18: Real-Time Updates (Polling)
**Objective:** Verify tasks update automatically without refresh

**Setup:**
1. Open two browser windows side-by-side
2. Login as `admin@acme.com` in both

**Steps:**
1. In Window 1: Create a new task
2. Wait 10 seconds
3. Check Window 2

**Expected Results:**
- ✅ New task appears in Window 2 within 10 seconds
- ✅ No manual refresh needed
- ✅ Task appears in correct status column

**Additional Test:**
1. In Window 1: Edit a task (change status from Todo to Done)
2. Wait 10 seconds
3. Check Window 2

**Expected Results:**
- ✅ Task moves to Done column in Window 2
- ✅ Changes synchronized automatically

### Test 19: Drag-and-Drop
**Objective:** Verify drag-and-drop status changes work

**Steps:**
1. Login as `admin@acme.com`
2. Find a task in "Todo" column
3. Drag it to "In Progress" column
4. Release the mouse

**Expected Results:**
- ✅ Task visually moves to new column
- ✅ Task status updates in database
- ✅ Refresh page - task stays in new column
- ✅ No error toasts

**Note:** Viewer role cannot drag-and-drop tasks (permission check).

### Test 20: Advanced Filtering
**Objective:** Verify all filter options work

**Category Filter:**
1. Login as `admin@acme.com`
2. Select "Work" from category dropdown
3. Click "Apply Filters"

**Expected Results:**
- ✅ Only "Work" category tasks visible
- ✅ "Personal" tasks hidden

**Status Filter:**
1. Select "Done" from status dropdown
2. Click "Apply Filters"

**Expected Results:**
- ✅ Only "Done" status tasks visible
- ✅ Other statuses hidden

**Search Filter:**
1. Type "test" in search box
2. Click "Apply Filters"

**Expected Results:**
- ✅ Only tasks with "test" in title visible
- ✅ Case-insensitive search

**Sort Options:**
1. Select "Title" from sort dropdown
2. Click "Apply Filters"

**Expected Results:**
- ✅ Tasks sorted alphabetically by title

**Clear Filters:**
1. Click "Clear Filters" button

**Expected Results:**
- ✅ All filters reset to default
- ✅ All tasks visible again

## 🔬 Security Validation

### Test 21: XSS Protection Verification
**Objective:** Verify JWT token is not accessible via JavaScript

**Steps:**
1. Login as any user
2. Open DevTools → Console
3. Type: `document.cookie`
4. Press Enter

**Expected Results:**
- ✅ `accessToken` is NOT shown in the output
- ✅ Only non-HttpOnly cookies visible (if any)
- ✅ Console confirms HttpOnly protection

### Test 22: CSRF Protection (sameSite)
**Objective:** Verify cookies have CSRF protection

**Steps:**
1. Login as any user
2. Open DevTools → Application → Cookies
3. Click on `accessToken` cookie
4. Check the "SameSite" field

**Expected Results:**
- ✅ SameSite is set to "Strict" or "Lax"
- ✅ Prevents CSRF attacks from third-party sites

### Test 23: Audit Logging
**Objective:** Verify all access decisions are logged

**Steps:**
1. Check the API console (Terminal 1)
2. Login as `viewer@acme.com`
3. Try to create a task via console (should fail)
4. Check API console output

**Expected Results:**
- ✅ See audit log entry with:
  - `userId`: viewer user ID
  - `action`: task:create
  - `allowed`: false
  - `timestamp`: current timestamp
- ✅ All permission checks logged

## 📊 Test Coverage Summary

### Backend Tests (Jest)
Run: `npx nx test api`

**Expected Results:**
- ✅ 56 tests passing
- ✅ 0 tests failing
- ✅ Coverage report generated

**Test Suites:**
- ✅ AuthService (login, password validation)
- ✅ TasksService (CRUD, filtering, org scoping)
- ✅ TasksController (HTTP delegation)
- ✅ RbacGuard (permission checks, audit logging)
- ✅ Permission system (role inheritance)
- ✅ E2E tests (authentication, RBAC, cross-org)

### Frontend Tests
**Note:** Frontend test templates are created but require Vitest syntax updates.

**Test Templates:**
- ✅ dashboard.component.spec.ts
- ✅ auth.service.spec.ts
- ✅ tasks.service.spec.ts
- ✅ modal.component.spec.ts
- ✅ toast-container.component.spec.ts
- ✅ toast.service.spec.ts
- ✅ confirmation-modal.component.spec.ts

## ✅ Acceptance Checklist

Use this checklist to verify all requirements are met:

### Security
- [ ] JWT tokens stored in HttpOnly cookies (not localStorage)
- [ ] Cookies have `httpOnly`, `secure` (prod), `sameSite` flags
- [ ] `document.cookie` does NOT reveal access token
- [ ] All API endpoints require authentication
- [ ] RBAC permissions enforced at controller level
- [ ] Organization scoping enforced at service level
- [ ] Audit logging captures all access decisions

### RBAC
- [ ] Owner has all permissions (task CRUD, user/org management)
- [ ] Admin has task CRUD + audit read (inherited from Viewer)
- [ ] Viewer has read-only access
- [ ] Role inheritance works (Owner → Admin → Viewer)
- [ ] Viewers cannot create/update/delete tasks (403)
- [ ] Permission checks occur on every request

### Organization Scoping
- [ ] Parent org users can see child org tasks
- [ ] Child org users cannot see parent org tasks
- [ ] Separate orgs are completely isolated
- [ ] Cross-org task access returns 403
- [ ] All task operations respect org boundaries

### UX Features
- [ ] Toast notifications for all actions (success, error)
- [ ] Edit modal opens with pre-filled data
- [ ] Delete confirmation modal prevents accidents
- [ ] Drag-and-drop changes task status
- [ ] Real-time updates (10s polling)
- [ ] Permission-aware UI (Viewers see read-only)
- [ ] Advanced filtering (category, status, search, sort)
- [ ] Responsive design works on mobile

### Code Quality
- [ ] 56+ backend tests passing
- [ ] Clean NX monorepo structure
- [ ] Shared types/enums in libs/data
- [ ] Shared RBAC logic in libs/auth
- [ ] No console errors during normal operation
- [ ] Code is TypeScript with strict typing

### Documentation
- [ ] README.md comprehensive and up-to-date
- [ ] API documentation complete
- [ ] Security architecture explained
- [ ] Architecture decisions documented
- [ ] TESTING.md provides manual test guide
- [ ] Setup instructions are clear

## 🐛 Known Limitations

- **sql.js**: In-memory database, data lost on restart
- **Polling**: 10s delay for real-time updates (not true real-time)
- **CSRF**: SameSite provides basic protection, consider adding CSRF tokens
- **Frontend Tests**: Require Vitest syntax updates (templates provided)

## 📝 Notes

- All test accounts use password `password123` (for development only)
- API console shows detailed logs (audit entries, permission checks)
- DevTools Network tab useful for debugging API calls
- Ensure both API and Dashboard are running for manual tests

---

**Testing Checklist:** Mark items as you validate them. All items should be ✅ before submission.
