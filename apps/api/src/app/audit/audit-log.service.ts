import { Injectable } from '@nestjs/common';
import { AuditLogEntry } from '@task-mgmt/data';
import { randomUUID } from 'crypto';

@Injectable()
export class AuditLogService {
  private readonly entries: AuditLogEntry[] = [];

  log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    const logEntry: AuditLogEntry = {
      ...entry,
      id: randomUUID(),
      timestamp: new Date().toISOString(),
    };
    this.entries.unshift(logEntry);
    // Basic audit logging requirement: write to console.
    // eslint-disable-next-line no-console
    console.log('[AUDIT]', logEntry);
  }

  list() {
    return this.entries;
  }
}
