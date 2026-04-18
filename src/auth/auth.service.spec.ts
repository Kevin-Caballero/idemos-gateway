import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { AuthProxyService } from './auth.service';

const mockTokenPair = {
  accessToken: 'access.token',
  refreshToken: 'refresh.token',
};

describe('AuthProxyService', () => {
  let service: AuthProxyService;
  let authClient: jest.Mocked<Pick<ClientProxy, 'send'>>;

  beforeEach(async () => {
    authClient = { send: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthProxyService,
        { provide: 'AUTH_SERVICE', useValue: authClient },
      ],
    }).compile();

    service = module.get<AuthProxyService>(AuthProxyService);
  });

  describe('register', () => {
    it('sends auth.register RPC and returns token pair', async () => {
      authClient.send.mockReturnValue(of(mockTokenPair));

      const dto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'pass12345',
      };
      const result = await service.register(dto);

      expect(authClient.send).toHaveBeenCalledWith('auth.register', dto);
      expect(result).toEqual(mockTokenPair);
    });
  });

  describe('login', () => {
    it('sends auth.login RPC and returns token pair', async () => {
      authClient.send.mockReturnValue(of(mockTokenPair));

      const dto = { email: 'test@example.com', password: 'pass12345' };
      const result = await service.login(dto);

      expect(authClient.send).toHaveBeenCalledWith('auth.login', dto);
      expect(result).toEqual(mockTokenPair);
    });
  });

  describe('refresh', () => {
    it('sends auth.refresh RPC and returns new token pair', async () => {
      authClient.send.mockReturnValue(of(mockTokenPair));

      const dto = { refreshToken: 'some.refresh.token' };
      const result = await service.refresh(dto);

      expect(authClient.send).toHaveBeenCalledWith('auth.refresh', dto);
      expect(result).toEqual(mockTokenPair);
    });
  });
});
