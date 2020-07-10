import { UnauthorizedException } from '@nestjs/common';

abstract class AuthGuard {
  canActivate() {
    return canActivate();
  }

  logIn(r) {
    return logIn(r);
  }
}

jest.mock('@nestjs/passport', () => ({
  AuthGuard: () => AuthGuard,
}));

// We need to require because passport strategy needs
// to be FUCKING extended from a FUCKING FUNCTION.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const LocalGuard = require('./local.guard').LocalGuard;

let canActivate, logIn: jest.Mock;

describe('Local Guard', () => {
  let guard: typeof LocalGuard;
  let executionContext;
  let request;

  beforeEach(async () => {
    request = {};
    canActivate = jest.fn();
    logIn = jest.fn();
    executionContext = {
      getRequest: jest.fn().mockReturnValue(request),
      getResponse: jest.fn().mockReturnThis(),
      switchToHttp: jest.fn().mockReturnThis(),
    };

    guard = new LocalGuard();
  });

  afterEach(() => jest.clearAllMocks().restoreAllMocks());

  it('throws super guard error', async () => {
    canActivate.mockImplementation(async () => {
      throw new UnauthorizedException();
    });

    await expect(guard.canActivate(executionContext)).rejects.toThrow(UnauthorizedException);
    expect(logIn).not.toHaveBeenCalled();
  });

  it('calls login if canActivate works', async () => {
    canActivate.mockReturnValue(true);
    logIn.mockReturnValue(null);
    await guard.canActivate(executionContext);
    expect(logIn).toHaveBeenCalledWith(request);
  });

  it('returns the result all the time', async () => {
    canActivate.mockReturnValue(false);
    let res = await guard.canActivate(executionContext);
    expect(logIn).not.toHaveBeenCalled();
    expect(res).toBe(false);

    canActivate.mockReturnValue(true);
    res = await guard.canActivate(executionContext);
    expect(res).toBe(true);
  });
});
