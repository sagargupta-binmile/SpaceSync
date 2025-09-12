// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Create a new user
  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create({
      ...userData,
      isActive: true, // Ensure new users are active by default
    });
    return await this.userRepository.save(user);
  }

  // Find user by email (only active users)
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email, isActive: true } });
  }

  // Find user by ID (only active users)
  async findByID(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id, isActive: true } });
  }

  // Get all active users
  async findAll(): Promise<User[]> {
    return this.userRepository.find({ where: { isActive: true } });
  }

  // Update user by ID
  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  // Soft delete user by ID
  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    user.isActive = false; // Mark as inactive instead of removing
    await this.userRepository.save(user);
  }
}
