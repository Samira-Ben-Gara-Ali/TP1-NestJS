import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CredenialsDto } from './dto/credentials.dto';
import { LoginResponeDto } from './dto/login-response.dto';


@Controller('users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }
  @Post('login')
  login(@Body() credentialsDto: CredenialsDto): Promise<LoginResponeDto>{
    return this.authService.login(credentialsDto);
  }
}