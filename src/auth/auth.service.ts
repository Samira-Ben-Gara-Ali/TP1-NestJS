import {
  Injectable, UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { CredenialsDto } from './dto/credentials.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginResponeDto } from './dto/login-response.dto';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto): Promise<Partial<UserEntity>> {
    const hashedPassword = await bcrypt.hash(dto.password,10);

    const user = await this.userService.create({
      ...dto,
      password: hashedPassword,
      role: 'user',
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email}

  }
  async login(credentialsDto: CredenialsDto): Promise<LoginResponeDto> {
    const { identifier, password } = credentialsDto;

    const user = await this.userService.getUserByIdentifier(identifier, true);
    if (!user) {
      throw new UnauthorizedException('Veuillez vérifier vos credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Veuillez vérifier vos credentials');
    }

    const payload: JwtPayloadDto = {
      username: user.username,
      email: user.email,
      role: user.role,
    };
    const jwt = this.jwtService.sign(payload);

    return {
      jwt
    };
  }

}