import 'reflect-metadata';
import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { CurrentUser } from './current-user.decorator';

describe('CurrentUser decorator', () => {
  it('returns the current user from request', () => {
    const user = { id: 'user-1', role: 'Admin' };
    const context: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as never;

    class TestController {
      test(_user: unknown) {}
    }

    const decorator = CurrentUser();
    decorator(TestController.prototype, 'test', 0);

    const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestController, 'test');
    expect(args).toBeTruthy();
    const paramMetadata = Object.values(args)[0] as { factory: Function; data: unknown };
    const result = paramMetadata.factory(paramMetadata.data, context);

    expect(result).toBe(user);
  });
});
