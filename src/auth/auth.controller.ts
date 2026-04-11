import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthProxyService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthProxyService) {}

  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    this.logger.log(`[register] email=${dto.email}`);
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Iniciar sesión' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    this.logger.log(`[login] email=${dto.email}`);
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: 'Renovar access token' })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto) {
    this.logger.log(`[refresh] called`);
    return this.authService.refresh(dto);
  }
}
