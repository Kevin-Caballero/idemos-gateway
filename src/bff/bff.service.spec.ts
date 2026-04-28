import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { BffService, FeedFilters } from './bff.service';
import { InitiativeType } from '@idemos/common';

const mockFeed = { data: [], total: 0, page: 1, limit: 20 };

describe('BffService', () => {
  let service: BffService;
  let backendClient: jest.Mocked<Pick<ClientProxy, 'send'>>;

  beforeEach(async () => {
    backendClient = { send: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BffService,
        { provide: 'BACKEND_SERVICE', useValue: backendClient },
      ],
    }).compile();

    service = module.get<BffService>(BffService);
  });

  describe('aggregateFeed', () => {
    it('sends initiatives.findAll with all filters and returns result', async () => {
      backendClient.send.mockReturnValue(of(mockFeed));

      const filters: FeedFilters = {
        type: InitiativeType.Proyecto,
        page: 2,
        limit: 10,
      };
      const result = await service.aggregateFeed(filters);

      expect(backendClient.send).toHaveBeenCalledWith(
        'initiatives.findAll',
        filters,
      );
      expect(result).toEqual(mockFeed);
    });

    it('sends initiatives.findAll without filters', async () => {
      backendClient.send.mockReturnValue(of(mockFeed));

      await service.aggregateFeed({});

      expect(backendClient.send).toHaveBeenCalledWith(
        'initiatives.findAll',
        {},
      );
    });

    it('returns the paginated response from backend', async () => {
      const populated = {
        data: [{ id: 'uuid-1', title: 'Test' }],
        total: 1,
        page: 1,
        limit: 20,
      };
      backendClient.send.mockReturnValue(of(populated));

      const result = await service.aggregateFeed({});

      expect(result).toEqual(populated);
    });
  });

  describe('search', () => {
    it('sends initiatives.findAll with q param', async () => {
      backendClient.send.mockReturnValue(of(mockFeed));

      const filters: FeedFilters = { q: 'presupuestos', page: 1, limit: 20 };
      await service.search(filters);

      expect(backendClient.send).toHaveBeenCalledWith(
        'initiatives.findAll',
        filters,
      );
    });

    it('sends initiatives.findAll with q and type combined', async () => {
      backendClient.send.mockReturnValue(of(mockFeed));

      const filters: FeedFilters = {
        q: 'ley',
        type: InitiativeType.Proposicion,
        page: 1,
        limit: 20,
      };
      await service.search(filters);

      expect(backendClient.send).toHaveBeenCalledWith(
        'initiatives.findAll',
        filters,
      );
    });

    it('returns the paginated response from backend', async () => {
      const populated = {
        data: [{ id: 'uuid-1', title: 'Ley de test' }],
        total: 1,
        page: 1,
        limit: 20,
      };
      backendClient.send.mockReturnValue(of(populated));

      const result = await service.search({ q: 'ley' });

      expect(result).toEqual(populated);
    });

    it('sends initiatives.findAll with empty filters when q is undefined', async () => {
      backendClient.send.mockReturnValue(of(mockFeed));

      await service.search({});

      expect(backendClient.send).toHaveBeenCalledWith(
        'initiatives.findAll',
        {},
      );
    });
  });
});
