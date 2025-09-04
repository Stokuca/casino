import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('auth/register')
  @ApiOperation({ summary: 'Player register' })
  @ApiCreatedResponse({
    description: 'Player created',
    schema: {
      example: {
        id: '9c2c0a3e-5d2c-4b70-9a8f-0d7c4bd6f6d1',
        email: 'user@example.com',
        balanceCents: '100000',
        createdAt: '2025-09-04T10:00:00.000Z',
      },
    },
  })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.email, dto.password);
  }

  @Post('auth/login')
  @ApiOperation({ summary: 'Player login' })
  @ApiOkResponse({
    description: 'JWT token',
    schema: { example: { accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' } },
  })
  playerLogin(@Body() dto: LoginDto) {
    return this.auth.playerLogin(dto.email, dto.password);
  }

  @Post('operator/login')
  @ApiOperation({ summary: 'Operator login' })
  @ApiOkResponse({
    description: 'JWT token',
    schema: { example: { accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' } },
  })
  operatorLogin(@Body() dto: LoginDto) {
    return this.auth.operatorLogin(dto.email, dto.password);
  }
}
