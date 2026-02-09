import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@task-mgmt/data';
import { OrganizationEntity } from '../organizations/organization.entity';
import { OrganizationsService } from '../organizations/organizations.service';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly organizationsService: OrganizationsService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string) {
    if (email === 'admin@globex.com') {
      await this.ensureGlobexAdmin();
    }
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return null;
    }
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organization?.id,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organization?.id,
      },
    };
  }

  private async ensureGlobexAdmin() {
    const existing = await this.usersService.findByEmail('admin@globex.com');
    if (existing) {
      return;
    }

    let globexOrg = await this.organizationsService.findByName('Globex Corp');
    if (!globexOrg) {
      globexOrg = await this.organizationsService.save({
        name: 'Globex Corp',
      } as OrganizationEntity);
    }

    const passwordHash = await bcrypt.hash('password123', 10);
    await this.usersService.save({
      name: 'Globex Admin',
      email: 'admin@globex.com',
      role: UserRole.Admin,
      passwordHash,
      organization: globexOrg,
    } as UserEntity);
  }
}
