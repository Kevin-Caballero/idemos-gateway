import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

const RPC_TIMEOUT_MS = 8000;

export interface FeedFilters {
  type?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class BffService {
  private readonly logger = new Logger(BffService.name);

  constructor(
    @Inject('BACKEND_SERVICE') private readonly backendClient: ClientProxy,
  ) {}

  aggregateFeed(filters: FeedFilters) {
    this.logger.log(
      `[aggregateFeed] type=${filters.type ?? 'all'} page=${filters.page ?? 1}`,
    );
    return firstValueFrom(
      this.backendClient
        .send('initiatives.findAll', filters)
        .pipe(timeout(RPC_TIMEOUT_MS)),
    );
  }
}
