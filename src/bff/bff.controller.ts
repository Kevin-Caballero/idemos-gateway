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

  @ApiOperation({ summary: 'Buscar iniciativas por texto y tipo' })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['Proyecto', 'Proposicion'],
  })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get('search')
  getSearch(
    @Query('q') q?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    this.logger.log(
      `[GET /search] q=${q} type=${type} status=${status} page=${page} limit=${limit}`,
    );
    return this.bffService.search({
      q,
      type,
      status,
      dateFrom,
      dateTo,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }
}
