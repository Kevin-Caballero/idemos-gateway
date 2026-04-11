import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth.controller';
import { AuthProxyService } from './auth.service';
import { AuthProxyGuard } from './guards/auth-proxy.guard';

@Module({
  imports: [
    JwtModule.register({}),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
          queue: 'auth_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthProxyService, AuthProxyGuard],
  exports: [AuthProxyGuard, JwtModule],
})
export class AuthModule {}
