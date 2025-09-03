import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('auth/register')
  register(@Body() dto: RegisterDto) {
    // vraća player-a (možeš kasnije da vratiš i token ako želiš)
    return this.auth.register(dto.email, dto.password);
  }

  @Post('auth/login')
  playerLogin(@Body() dto: LoginDto) {
    return this.auth.playerLogin(dto.email, dto.password);
  }

  @Post('operator/login')
  operatorLogin(@Body() dto: LoginDto) {
    return this.auth.operatorLogin(dto.email, dto.password);
  }
}
