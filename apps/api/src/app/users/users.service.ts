import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>
  ) {}

  findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['organization', 'organization.parent', 'organization.children'],
    });
  }

  findById(id: string) {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['organization', 'organization.parent', 'organization.children'],
    });
  }

  async count() {
    return this.usersRepository.count();
  }

  save(user: UserEntity) {
    return this.usersRepository.save(user);
  }
}
