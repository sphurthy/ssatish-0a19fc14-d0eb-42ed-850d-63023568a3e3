import { TaskCategory, TaskStatus, UserRole } from './enums';

export interface Organization {
  id: string;
  name: string;
  parentId?: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  category: TaskCategory;
  status: TaskStatus;
  order: number;
  organizationId: string;
  createdById: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  allowed: boolean;
  timestamp: string;
}
