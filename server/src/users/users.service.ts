import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Brackets, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(userData: Partial<User>): Promise<User> {
    // Check if user exists by email
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      // Update existing user
      existingUser.name = userData.name ?? existingUser.name;
      existingUser.role = userData.role ?? existingUser.role;
      existingUser.isActive = true; // Reactivate if previously soft-deleted
      return await this.userRepository.save(existingUser);
    } else {
      // Create new user
      const user = this.userRepository.create({
        ...userData,
        isActive: true,
      });
      return await this.userRepository.save(user);
    }
  }

  async isBlocked(employee_id: string): Promise<Boolean> {
    const user = await this.userRepository.findOne({ where: { id: employee_id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isBlocked) {
      return true;
    } else {
      return false;
    }
  }
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email, isActive: true } });
  }
  async findByID(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id, isActive: true } });
  }

  async findAll(
    page: number = 1,
    isActive?: boolean,
    email?: string,
    name?: string,
  ): Promise<{ users: User[]; totalPages: number }> {
    const limit = 20;
    const offset = (page - 1) * limit;

    const query = this.userRepository.createQueryBuilder('user');

    if (isActive !== undefined) {
      query.andWhere('user.isActive = :isActive', { isActive });
    }

    if (email || name) {
      query.andWhere(
        new Brackets((qb) => {
          if (email) qb.orWhere('user.email LIKE :email', { email: `%${email}%` });
          if (name) qb.orWhere('user.name LIKE :name', { name: `%${name}%` });
        }),
      );
    }

    const [users, totalCount] = await query.take(limit).skip(offset).getManyAndCount();

    const totalPages = Math.ceil(totalCount / limit);
    return { users, totalPages };
  }

  async toggleBlockUser(email: string): Promise<string> {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    // Toggle the state
    existingUser.isBlocked = !existingUser.isBlocked;

    await this.userRepository.save(existingUser);

    return existingUser.isBlocked ? 'User blocked successfully' : 'User unblocked successfully';
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    user.isActive = false;
    await this.userRepository.save(user);
  }
}
