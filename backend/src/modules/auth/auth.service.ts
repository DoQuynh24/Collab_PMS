import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { google_id: googleId } });
  }

  async createUser(data: Partial<User>): Promise<User> {
  const user = this.userRepository.create({
    ...data,
    name: data.name || 'User',
    picture: data.picture,
  });
  const savedUser = await this.userRepository.save(user);
  return savedUser;
}

  async generateToken(user: User): Promise<{ access_token: string }> {
    const payload = { sub: user.user_id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async loginGoogle(user: User) {
    return this.generateToken(user);
  }
}