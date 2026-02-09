export enum UserRole {
  Owner = 'Owner',
  Admin = 'Admin',
  Viewer = 'Viewer',
}

export enum Permission {
  TaskCreate = 'task:create',
  TaskRead = 'task:read',
  TaskUpdate = 'task:update',
  TaskDelete = 'task:delete',
  AuditRead = 'audit:read',
}

export enum TaskCategory {
  Work = 'Work',
  Personal = 'Personal',
}

export enum TaskStatus {
  Todo = 'Todo',
  InProgress = 'InProgress',
  Done = 'Done',
}
