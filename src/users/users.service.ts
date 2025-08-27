import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }
  async findByID(id: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async fetchAll(): Promise<User[]> {
    return this.userRepository.find({ select: ['id', 'name'] });
  }
}
