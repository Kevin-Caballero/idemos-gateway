import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthProxyGuard } from '../auth/guards/auth-proxy.guard';
import { BffService } from './bff.service';

interface AuthedRequest {
  user: { sub: string };
}

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
    @Req() req?: AuthedRequest,
  ) {
    this.logger.log(`[GET /feed] type=${type} page=${page} limit=${limit}`);
    return this.bffService.aggregateFeed({
      type,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      userId: req?.user?.sub,
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
  @ApiQuery({ name: 'votedOnly', required: false, type: Boolean })
  @Get('search')
  getSearch(
    @Query('q') q?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('votedOnly') votedOnly?: string,
    @Req() req?: AuthedRequest,
  ) {
    this.logger.log(
      `[GET /search] q=${q} type=${type} status=${status} page=${page} limit=${limit} votedOnly=${votedOnly}`,
    );
    return this.bffService.search({
      q,
      type,
      status,
      dateFrom,
      dateTo,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      userId: req?.user?.sub,
      votedOnly: votedOnly === 'true',
    });
  }

  @ApiOperation({ summary: 'Obtener detalle de una iniciativa por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la iniciativa' })
  @Get('initiatives/:id')
  getInitiativeDetail(@Param('id') id: string) {
    this.logger.log(`[GET /initiatives/${id}]`);
    return this.bffService.getDetail(id);
  }

  @ApiOperation({ summary: 'Registrar voto ciudadano en una iniciativa' })
  @ApiParam({ name: 'id', description: 'UUID de la iniciativa' })
  @Post('initiatives/:id/vote')
  castVote(
    @Param('id') initiativeId: string,
    @Body('choice') choice: string,
    @Req() req: AuthedRequest,
  ) {
    const userId = req.user.sub;
    this.logger.log(
      `[POST /initiatives/${initiativeId}/vote] user=${userId} choice=${choice}`,
    );
    return this.bffService.castVote({ userId, initiativeId, choice });
  }

  @ApiOperation({ summary: 'Obtener el voto del usuario en una iniciativa' })
  @ApiParam({ name: 'id', description: 'UUID de la iniciativa' })
  @Get('initiatives/:id/vote')
  getUserVote(@Param('id') initiativeId: string, @Req() req: AuthedRequest) {
    const userId = req.user.sub;
    return this.bffService.getUserVote({ userId, initiativeId });
  }

  @ApiOperation({ summary: 'Obtener estadísticas de votos de una iniciativa' })
  @ApiParam({ name: 'id', description: 'UUID de la iniciativa' })
  @Get('initiatives/:id/vote/stats')
  getVoteStats(@Param('id') initiativeId: string) {
    return this.bffService.getVoteStats(initiativeId);
  }

  @ApiOperation({ summary: 'Seguir o dejar de seguir una iniciativa (toggle)' })
  @ApiParam({ name: 'id', description: 'UUID de la iniciativa' })
  @Post('initiatives/:id/follow')
  toggleFollow(@Param('id') initiativeId: string, @Req() req: AuthedRequest) {
    return this.bffService.toggleFollow(req.user.sub, initiativeId);
  }

  @ApiOperation({ summary: 'Comprobar si el usuario sigue una iniciativa' })
  @ApiParam({ name: 'id', description: 'UUID de la iniciativa' })
  @Get('initiatives/:id/follow')
  isFollowing(@Param('id') initiativeId: string, @Req() req: AuthedRequest) {
    return this.bffService.isFollowing(req.user.sub, initiativeId);
  }

  @ApiOperation({ summary: 'Obtener las iniciativas seguidas por el usuario' })
  @Get('follows')
  getFollows(@Req() req: AuthedRequest) {
    return this.bffService.getFollows(req.user.sub);
  }
}
