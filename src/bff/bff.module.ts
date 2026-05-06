import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from '../auth/auth.module';
import { BffController } from './bff.controller';
import { BffService } from './bff.service';

@Module({
  imports: [
    AuthModule,
    ClientsModule.register([
      {
        name: 'BACKEND_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:15672'],
          queue: 'backend_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [BffController],
  providers: [BffService],
})
export class BffModule {}
