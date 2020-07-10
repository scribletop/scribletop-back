import { ACLGuard } from './acl.guard';

let feature, action: string;

jest.mock('@nestjsx/crud', () => ({
  getFeature: (): string => feature,
  getAction: (): string => action,
}));

describe('ACL Guard', () => {
  let guard: ACLGuard;
  let executionContext;
  let request;

  let username = 'username';

  beforeEach(() => {
    request = {};
    feature = '';
    action = '';
    executionContext = {
      getRequest: jest.fn().mockReturnValue(request),
      switchToHttp: jest.fn().mockReturnThis(),
      getHandler: jest.fn().mockReturnThis(),
      getClass: jest.fn().mockReturnThis(),
    };

    guard = new ACLGuard();
    spyOn(console, 'log');
  });

  afterEach(() => jest.clearAllMocks().restoreAllMocks());

  it('checks that an authenticated user cannot access "Auth" feature', () => {
    feature = 'Auth';
    request.isAuthenticated = (): boolean => true;
    expect(guard.canActivate(executionContext)).toBe(false);
  });

  it('checks that an unauthenticated user can access "Auth" feature', () => {
    feature = 'Auth';
    request.isAuthenticated = (): boolean => false;
    expect(guard.canActivate(executionContext)).toBe(true);
  });

  it('checks that an authenticated user cannot access "Users-Create-One" feature', () => {
    feature = 'Users';
    action = 'Create-One';
    request.isAuthenticated = (): boolean => true;
    expect(guard.canActivate(executionContext)).toBe(false);
  });

  it('checks that an unauthenticated user can access "Users-Create-One" feature', () => {
    feature = 'Auth';
    action = 'Create-One';
    request.isAuthenticated = (): boolean => false;
    expect(guard.canActivate(executionContext)).toBe(true);
  });

  it('checks that only the authenticated user can access their data', () => {
    feature = 'User-Foo';
    request.user = { username };
    request.params = { username };
    expect(guard.canActivate(executionContext)).toBe(true);

    request.params = { username: 'bar' };
    expect(guard.canActivate(executionContext)).toBe(false);

    feature = 'Users';
    action = 'Read-One';
    request.params = { username };
    expect(guard.canActivate(executionContext)).toBe(true);

    request.params = { username: 'bar' };
    expect(guard.canActivate(executionContext)).toBe(false);
  });
});
