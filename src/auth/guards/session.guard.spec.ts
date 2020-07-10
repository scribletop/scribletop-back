import { UnauthorizedException } from '@nestjs/common';
import { SessionGuard } from './session.guard';

describe('Session Guard', () => {
  let guard: SessionGuard;
  let executionContext;
  let request;

  beforeEach(() => {
    request = {};
    executionContext = {
      getRequest: jest.fn().mockReturnValue(request),
      switchToHttp: jest.fn().mockReturnThis(),
    };

    guard = new SessionGuard();
  });

  afterEach(() => jest.clearAllMocks().restoreAllMocks());

  it('throws Unauthorized if user is not authenticated', () => {
    request.isAuthenticated = jest.fn().mockReturnValue(false);
    expect(() => guard.canActivate(executionContext)).toThrow(UnauthorizedException);
    expect(request.isAuthenticated).toHaveBeenCalled();
  });

  it('checks if user is authenticated', () => {
    request.isAuthenticated = jest.fn().mockReturnValue(true);
    expect(guard.canActivate(executionContext)).toBe(true);
    expect(request.isAuthenticated).toHaveBeenCalled();
  });
});
