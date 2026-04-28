import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthProxyGuard } from './auth-proxy.guard';

const mockPayload = { sub: 'uuid-1', email: 'test@example.com' };

function buildContext(authHeader?: string) {
  const req: Record<string, unknown> = {
    headers: { authorization: authHeader },
  };
  return {
    switchToHttp: () => ({ getRequest: () => req }),
    req,
  } as unknown as ExecutionContext & { req: Record<string, unknown> };
}

describe('AuthProxyGuard', () => {
  let guard: AuthProxyGuard;
  let jwtService: jest.Mocked<Pick<JwtService, 'verify'>>;

  beforeEach(() => {
    jwtService = { verify: jest.fn() };
    guard = new AuthProxyGuard(jwtService as unknown as JwtService);
  });

  it('throws UnauthorizedException when authorization header is absent', () => {
    const ctx = buildContext();
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when header scheme is not Bearer', () => {
    const ctx = buildContext('Basic dXNlcjpwYXNz');
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when JwtService.verify throws', () => {
    jwtService.verify.mockImplementation(() => {
      throw new Error('invalid signature');
    });
    const ctx = buildContext('Bearer bad.token.here');
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('returns true and attaches payload to request when token is valid', () => {
    jwtService.verify.mockReturnValue(mockPayload);
    const ctx = buildContext('Bearer valid.token');

    const result = guard.canActivate(ctx);

    expect(result).toBe(true);
    const req = ctx.switchToHttp().getRequest();
    expect(req['user']).toEqual(mockPayload);
  });

  it('passes the correct secret to JwtService.verify', () => {
    process.env.JWT_SECRET = 'my-secret';
    jwtService.verify.mockReturnValue(mockPayload);
    buildContext('Bearer valid.token');
    const ctx = buildContext('Bearer valid.token');
    guard.canActivate(ctx);

    expect(jwtService.verify).toHaveBeenCalledWith(
      'valid.token',
      expect.objectContaining({ secret: 'my-secret' }),
    );
  });
});
