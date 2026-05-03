import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';

const RPC_TIMEOUT_MS = 8000;

/**
 * Servicio proxy de autenticación en el gateway.
 * Encapsula el reenvío de llamadas RPC al microservicio auth aplicando
 * un timeout configurable para evitar que peticiones colgadas bloqueen el gateway.
 */
@Injectable()
export class AuthProxyService {
  private readonly logger = new Logger(AuthProxyService.name);

  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  register(dto: RegisterDto) {
    this.logger.log(`[register] sending RPC auth.register email=${dto.email}`);
    return firstValueFrom(
      this.authClient.send('auth.register', dto).pipe(timeout(RPC_TIMEOUT_MS)),
    );
  }

  login(dto: LoginDto) {
    this.logger.log(`[login] sending RPC auth.login email=${dto.email}`);
    return firstValueFrom(
      this.authClient.send('auth.login', dto).pipe(timeout(RPC_TIMEOUT_MS)),
    );
  }

  refresh(dto: RefreshDto) {
    this.logger.log(`[refresh] sending RPC auth.refresh`);
    return firstValueFrom(
      this.authClient.send('auth.refresh', dto).pipe(timeout(RPC_TIMEOUT_MS)),
    );
  }
}
