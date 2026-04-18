import { Controller, Get, Logger, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthProxyGuard } from '../auth/guards/auth-proxy.guard';
import { BffService } from './bff.service';

@ApiTags('feed')
@ApiBearerAuth()
@UseGuards(AuthProxyGuard)
@Controller()
export class BffController {
  private readonly logger = new Logger(BffController.name);

  constructor(private readonly bffService: BffService) {}

  @ApiOperation({ summary: 'Obtener feed paginado de iniciativas' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['Proyecto', 'Proposicion'],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get('feed')
  getFeed(
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    this.logger.log(`[GET /feed] type=${type} page=${page} limit=${limit}`);
    return this.bffService.aggregateFeed({
      type,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }
}
