import { Role } from '../../parties/party-member.entity';
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
  let connection;

  const username = 'username';

  beforeEach(() => {
    request = {};
    connection = {
      getRepository: jest.fn().mockReturnThis(),
    };
    feature = '';
    action = '';
    executionContext = {
      getRequest: jest.fn().mockReturnValue(request),
      switchToHttp: jest.fn().mockReturnThis(),
      getHandler: jest.fn().mockReturnThis(),
      getClass: jest.fn().mockReturnThis(),
    };

    guard = new ACLGuard(connection);
    spyOn(console, 'log');
  });

  afterEach(() => jest.clearAllMocks().restoreAllMocks());

  it('checks that an authenticated user cannot access "Auth" feature', async () => {
    feature = 'Auth';
    request.isAuthenticated = (): boolean => true;
    expect(await guard.canActivate(executionContext)).toBe(false);
  });

  it('checks that an unauthenticated user can access "Auth" feature', async () => {
    feature = 'Auth';
    request.isAuthenticated = (): boolean => false;
    expect(await guard.canActivate(executionContext)).toBe(true);
  });

  it('checks that an authenticated user cannot access "Users-Create-One" feature', async () => {
    feature = 'Users';
    action = 'Create-One';
    request.isAuthenticated = (): boolean => true;
    expect(await guard.canActivate(executionContext)).toBe(false);
  });

  it('checks that an unauthenticated user can access "Users-Create-One" feature', async () => {
    feature = 'Auth';
    action = 'Create-One';
    request.isAuthenticated = (): boolean => false;
    expect(await guard.canActivate(executionContext)).toBe(true);
  });

  it('checks that only the authenticated user can access their data', async () => {
    feature = 'User-Foo';
    request.user = { username };
    request.params = { username };
    expect(await guard.canActivate(executionContext)).toBe(true);

    request.params = { username: 'bar' };
    expect(await guard.canActivate(executionContext)).toBe(false);

    feature = 'Users';
    action = 'Read-One';
    request.params = { username };
    expect(await guard.canActivate(executionContext)).toBe(true);

    request.params = { username: 'bar' };
    expect(await guard.canActivate(executionContext)).toBe(false);
  });

  it('checks that an unknown party returns false', async () => {
    const slug = 'slug';
    request.user = { username };
    request.params = { slug };

    feature = 'Party-Users';
    connection.find = jest.fn().mockReturnValue([]);
    expect(await guard.canActivate(executionContext)).toBe(false);
    expect(connection.find).toHaveBeenCalledWith({
      where: { slug },
      relations: ['members', 'members.user'],
    });

    feature = 'Parties';
    connection.find = jest.fn().mockReturnValue([]);
    expect(await guard.canActivate(executionContext)).toBe(false);
    expect(connection.find).toHaveBeenCalledWith({
      where: { slug },
      relations: ['members', 'members.user'],
    });
  });

  it('checks that a party you do not belong to returns false', async () => {
    const slug = 'slug';
    request.user = { username };
    request.params = { slug };

    const party = { findMember: jest.fn().mockReturnValue(undefined) };

    feature = 'Party-Users';
    connection.find = jest.fn().mockReturnValue([party]);
    expect(await guard.canActivate(executionContext)).toBe(false);
    expect(connection.find).toHaveBeenCalledWith({
      where: { slug },
      relations: ['members', 'members.user'],
    });

    feature = 'Parties';
    connection.find = jest.fn().mockReturnValue([party]);
    expect(await guard.canActivate(executionContext)).toBe(false);
    expect(connection.find).toHaveBeenCalledWith({
      where: { slug },
      relations: ['members', 'members.user'],
    });
  });

  it('checks that only a member of a party can add another user to it', async () => {
    feature = 'Party-Users';
    action = 'Create-One';

    const slug = 'slug';
    request.user = { username };
    request.params = { slug };

    const party = { findMember: jest.fn().mockReturnValue(undefined) };
    connection.find = jest.fn().mockReturnValue([party]);

    expect(await guard.canActivate(executionContext)).toBe(false);
    expect(connection.find).toHaveBeenCalledWith({
      where: { slug },
      relations: ['members', 'members.user'],
    });
  });

  it('checks that a member of a party can add another user to it', async () => {
    feature = 'Party-Users';
    action = 'Create-One';

    const slug = 'slug';
    request.user = { username };
    request.params = { slug };

    const party = { findMember: jest.fn().mockReturnValue({}) };
    connection.find = jest.fn().mockReturnValue([party]);

    expect(await guard.canActivate(executionContext)).toBe(true);
    expect(connection.find).toHaveBeenCalledWith({
      where: { slug },
      relations: ['members', 'members.user'],
    });
  });

  it('checks that only a DM of a party can remove another user from it', async () => {
    feature = 'Party-Users';
    action = 'Delete-One';

    const slug = 'slug';
    request.user = { username };
    request.params = { slug };

    const party = { findMember: jest.fn().mockReturnValue(undefined) };
    connection.find = jest.fn().mockReturnValue([party]);
    expect(await guard.canActivate(executionContext)).toBe(false);
    expect(connection.find).toHaveBeenCalledWith({
      where: { slug },
      relations: ['members', 'members.user'],
    });

    party.findMember = jest.fn().mockReturnValue({ role: Role.player, user: { username } });
    connection.find = jest.fn().mockReturnValue([party]);
    expect(await guard.canActivate(executionContext)).toBe(false);
    expect(connection.find).toHaveBeenCalledWith({
      where: { slug },
      relations: ['members', 'members.user'],
    });
  });

  it('checks that a DM of a party can remove another user to it', async () => {
    feature = 'Party-Users';
    action = 'Delete-One';

    const slug = 'slug';
    request.user = { username };
    request.params = { slug };

    const party = { findMember: jest.fn().mockReturnValue({ role: Role.dm, user: { username } }) };
    connection.find = jest.fn().mockReturnValue([party]);

    expect(await guard.canActivate(executionContext)).toBe(true);
    expect(connection.find).toHaveBeenCalledWith({
      where: { slug },
      relations: ['members', 'members.user'],
    });
  });

  it('checks that a user of a party cannot remove themselves', async () => {
    feature = 'Party-Users';
    action = 'Delete-One';

    const slug = 'slug';
    request.user = { username };
    request.params = { slug, username };

    expect(await guard.canActivate(executionContext)).toBe(false);
  });

  it('allows anyone to list systems', async () => {
    feature = 'Systems';
    action = 'Read-All';
    expect(await guard.canActivate(executionContext)).toBe(true);
  });

  it('allows anyone to get a system', async () => {
    feature = 'Systems';
    action = 'Read-One';
    expect(await guard.canActivate(executionContext)).toBe(true);
  });

  it('forbids anyone to do anything else with a system', async () => {
    feature = 'Systems';
    const actions = ['Create-One', 'Create-Many', 'Delete-One', 'Replace-One', 'Update-One'];
    await actions.reduce(async (prev, act) => {
      action = act;
      expect(await guard.canActivate(executionContext)).toBe(false);
    }, Promise.resolve());
  });

  it('returns false by default', async () => {
    feature = 'Foo';
    action = 'Bar';
    expect(await guard.canActivate(executionContext)).toBe(false);
  });
});
