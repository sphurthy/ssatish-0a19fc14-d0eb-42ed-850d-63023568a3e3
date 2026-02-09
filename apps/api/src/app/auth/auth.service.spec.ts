import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('logs in with valid credentials', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    const user = {
      id: 'user-1',
      name: 'Owner User',
      email: 'owner@acme.com',
      role: 'Owner',
      passwordHash,
      organization: { id: 'org-1' },
    };

    const usersService = {
      findByEmail: jest.fn().mockResolvedValue(user),
    };
    const jwtService = {
      signAsync: jest.fn().mockResolvedValue('token-123'),
    };

    const authService = new AuthService(usersService as never, jwtService as never);
    const result = await authService.login('owner@acme.com', 'password123');

    expect(result.accessToken).toBe('token-123');
    expect(result.user.email).toBe('owner@acme.com');
  });

  it('rejects invalid credentials', async () => {
    const usersService = {
      findByEmail: jest.fn().mockResolvedValue(null),
    };
    const jwtService = { signAsync: jest.fn() };
    const authService = new AuthService(usersService as never, jwtService as never);

    await expect(authService.login('bad@acme.com', 'wrong')).rejects.toBeInstanceOf(
      UnauthorizedException
    );
  });
});
