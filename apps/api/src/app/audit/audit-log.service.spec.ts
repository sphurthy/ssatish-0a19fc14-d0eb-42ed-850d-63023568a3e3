import { AuditLogService } from './audit-log.service';

describe('AuditLogService', () => {
  let service: AuditLogService;

  beforeEach(() => {
    service = new AuditLogService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should log entries and return them in order', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    service.log({
      userId: 'user-1',
      action: 'test-action',
      resource: 'resource-1',
      allowed: true,
    });

    service.log({
      userId: 'user-2',
      action: 'test-action-2',
      resource: 'resource-2',
      allowed: false,
    });

    const entries = service.list();

    expect(entries).toHaveLength(2);
    expect(entries[0]).toEqual(
      expect.objectContaining({
        userId: 'user-2',
        action: 'test-action-2',
        resource: 'resource-2',
        allowed: false,
        id: expect.any(String),
        timestamp: expect.any(String),
      })
    );
    expect(entries[1]).toEqual(
      expect.objectContaining({
        userId: 'user-1',
        action: 'test-action',
        resource: 'resource-1',
        allowed: true,
        id: expect.any(String),
        timestamp: expect.any(String),
      })
    );
    expect(logSpy).toHaveBeenCalledTimes(2);

    logSpy.mockRestore();
  });
});
