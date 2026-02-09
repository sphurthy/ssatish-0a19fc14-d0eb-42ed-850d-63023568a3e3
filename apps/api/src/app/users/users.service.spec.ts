import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<Repository<UserEntity>>;

  beforeEach(() => {
    usersRepository = {
      findOne: jest.fn(),
      count: jest.fn(),
      save: jest.fn(),
    } as never;

    service = new UsersService(usersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findByEmail should query with relations', async () => {
    usersRepository.findOne.mockResolvedValue(null);

    await service.findByEmail('owner@acme.com');

    expect(usersRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'owner@acme.com' },
      relations: ['organization', 'organization.parent', 'organization.children'],
    });
  });

  it('findById should query with relations', async () => {
    usersRepository.findOne.mockResolvedValue(null);

    await service.findById('user-1');

    expect(usersRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      relations: ['organization', 'organization.parent', 'organization.children'],
    });
  });

  it('count should return repository count', async () => {
    usersRepository.count.mockResolvedValue(3);

    const result = await service.count();

    expect(result).toBe(3);
  });

  it('save should delegate to repository', async () => {
    const user = { id: 'user-1', email: 'owner@acme.com' } as UserEntity;
    usersRepository.save.mockResolvedValue(user);

    const result = await service.save(user);

    expect(usersRepository.save).toHaveBeenCalledWith(user);
    expect(result).toBe(user);
  });
});
