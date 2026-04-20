import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

const RPC_TIMEOUT_MS = 8000;

export interface FeedFilters {
  q?: string;
  type?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  userId?: string;
  votedOnly?: boolean;
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

  search(filters: FeedFilters) {
    this.logger.log(
      `[search] q=${filters.q ?? ''} type=${filters.type ?? 'all'} status=${filters.status ?? ''} page=${filters.page ?? 1}`,
    );
    return firstValueFrom(
      this.backendClient
        .send('initiatives.findAll', filters)
        .pipe(timeout(RPC_TIMEOUT_MS)),
    );
  }

  getDetail(id: string) {
    this.logger.log(`[getDetail] id=${id}`);
    return firstValueFrom(
      this.backendClient
        .send('initiatives.findOne', { id })
        .pipe(timeout(RPC_TIMEOUT_MS)),
    );
  }

  castVote(dto: { userId: string; initiativeId: string; choice: string }) {
    this.logger.log(
      `[castVote] user=${dto.userId} initiative=${dto.initiativeId}`,
    );
    return firstValueFrom(
      this.backendClient.send('votes.cast', dto).pipe(timeout(RPC_TIMEOUT_MS)),
    );
  }

  getUserVote(data: { userId: string; initiativeId: string }) {
    return firstValueFrom(
      this.backendClient
        .send('votes.getByUser', data)
        .pipe(timeout(RPC_TIMEOUT_MS)),
    );
  }

  getVoteStats(initiativeId: string) {
    return firstValueFrom(
      this.backendClient
        .send('votes.getStats', { initiativeId })
        .pipe(timeout(RPC_TIMEOUT_MS)),
    );
  }
}
