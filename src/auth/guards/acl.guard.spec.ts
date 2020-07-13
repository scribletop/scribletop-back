import { Role } from '../../parties/party-member.entity';
import { ACLGuard } from './acl.guard';

let feature, action: string;

jest.mock('@nestjsx/crud', () => ({
  getFeature: (): string => feature,
  getAction: (): string => action,
}));

const assertFeatureAction = async (
  guard: ACLGuard,
  executionContext,
  expected: boolean,
): Promise<void> => {
  try {
    expect(await guard.canActivate(executionContext)).toBe(expected);
  } catch {
    throw new Error(`Expected ${feature}-${action} to be ${expected}.`);
  }
};

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
    await assertFeatureAction(guard, executionContext, false);
  });

  it('checks that an unauthenticated user can access "Auth" feature', async () => {
    feature = 'Auth';
    request.isAuthenticated = (): boolean => false;
    await assertFeatureAction(guard, executionContext, true);
  });

  it('checks that an authenticated user cannot access "Users-Create-One" feature', async () => {
    feature = 'Users';
    action = 'Create-One';
    request.isAuthenticated = (): boolean => true;
    await assertFeatureAction(guard, executionContext, false);
  });

  it('checks that an unauthenticated user can access "Users-Create-One" feature', async () => {
    feature = 'Auth';
    action = 'Create-One';
    request.isAuthenticated = (): boolean => false;
    await assertFeatureAction(guard, executionContext, true);
  });

  it('checks that only the authenticated user can access their data', async () => {
    feature = 'User-Foo';
    request.user = { username };
    request.params = { username };
    await assertFeatureAction(guard, executionContext, true);

    request.params = { username: 'bar' };
    await assertFeatureAction(guard, executionContext, false);

    feature = 'Users';
    action = 'Read-One';
    request.params = { username };
    await assertFeatureAction(guard, executionContext, true);

    request.params = { username: 'bar' };
    await assertFeatureAction(guard, executionContext, false);
  });

  it('checks that an unknown party returns false', async () => {
    const slug = 'slug';
    request.user = { username };
    request.params = { slug };

    feature = 'Party-Users';
    connection.find = jest.fn().mockReturnValue([]);
    await assertFeatureAction(guard, executionContext, false);
    expect(connection.find).toHaveBeenCalledWith({
      where: { slug },
      relations: ['members', 'members.user'],
    });

    feature = 'Party-Games';
    connection.find = jest.fn().mockReturnValue([]);
    await assertFeatureAction(guard, executionContext, false);
    expect(connection.find).toHaveBeenCalledWith({
      where: { slug },
      relations: ['members', 'members.user'],
    });

    feature = 'Parties';
    connection.find = jest.fn().mockReturnValue([]);
    await assertFeatureAction(guard, executionContext, false);
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
    await assertFeatureAction(guard, executionContext, false);
    expect(connection.find).toHaveBeenCalledWith({
      where: { slug },
      relations: ['members', 'members.user'],
    });

    feature = 'Party-Games';
    connection.find = jest.fn().mockReturnValue([party]);
    await assertFeatureAction(guard, executionContext, false);
    expect(connection.find).toHaveBeenCalledWith({
      where: { slug },
      relations: ['members', 'members.user'],
    });

    feature = 'Parties';
    connection.find = jest.fn().mockReturnValue([party]);
    await assertFeatureAction(guard, executionContext, false);
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

    await assertFeatureAction(guard, executionContext, false);
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

    await assertFeatureAction(guard, executionContext, true);
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
    await assertFeatureAction(guard, executionContext, false);
    expect(connection.find).toHaveBeenCalledWith({
      where: { slug },
      relations: ['members', 'members.user'],
    });

    party.findMember = jest.fn().mockReturnValue({ role: Role.player, user: { username } });
    connection.find = jest.fn().mockReturnValue([party]);
    await assertFeatureAction(guard, executionContext, false);
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

    await assertFeatureAction(guard, executionContext, true);
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

    await assertFeatureAction(guard, executionContext, false);
  });

  it('allows a DM to create a game', async () => {
    feature = 'Party-Games';
    action = 'Create-One';

    const slug = 'slug';
    request.params = { partySlug: slug };

    const party = { findMember: jest.fn().mockReturnValue({ role: Role.dm, user: { username } }) };
    connection.find = jest.fn().mockReturnValue([party]);

    await assertFeatureAction(guard, executionContext, true);
    expect(connection.find).toHaveBeenCalledWith({
      where: { slug },
      relations: ['members', 'members.user'],
    });
  });

  it('forbids a player to create a game', async () => {
    feature = 'Party-Games';
    action = 'Create-One';

    const slug = 'slug';
    request.params = { partySlug: slug };

    const party = {
      findMember: jest.fn().mockReturnValue({ role: Role.player, user: { username } }),
    };
    connection.find = jest.fn().mockReturnValue([party]);

    await assertFeatureAction(guard, executionContext, false);
    expect(connection.find).toHaveBeenCalledWith({
      where: { slug },
      relations: ['members', 'members.user'],
    });
  });

  it('allows a player to list games of their party', async () => {
    feature = 'Party-Games';
    action = 'Read-All';

    const slug = 'slug';
    request.params = { partySlug: slug };

    const party = {
      findMember: jest.fn().mockReturnValue({ role: Role.player, user: { username } }),
    };
    connection.find = jest.fn().mockReturnValue([party]);

    await assertFeatureAction(guard, executionContext, true);
    expect(connection.find).toHaveBeenCalledWith({
      where: { slug },
      relations: ['members', 'members.user'],
    });
  });

  it('allows anyone to list systems', async () => {
    feature = 'Systems';
    action = 'Read-All';
    await assertFeatureAction(guard, executionContext, true);
  });

  it('allows anyone to get a system', async () => {
    feature = 'Systems';
    action = 'Read-One';
    await assertFeatureAction(guard, executionContext, true);
  });

  it('allows anyone to create a system', async () => {
    feature = 'Systems';
    action = 'Create-One';
    await assertFeatureAction(guard, executionContext, true);
  });

  it('forbids anyone to do anything else with a system', async () => {
    feature = 'Systems';
    const actions = ['Create-Many', 'Delete-One', 'Replace-One', 'Update-One'];
    await actions.reduce(async (prev, act) => {
      await prev;
      action = act;
      await assertFeatureAction(guard, executionContext, false);
    }, Promise.resolve());
  });

  it('allows anyone to list worlds', async () => {
    feature = 'Worlds';
    action = 'Read-All';
    await assertFeatureAction(guard, executionContext, true);
  });

  it('allows anyone to get a world', async () => {
    feature = 'Worlds';
    action = 'Read-One';
    await assertFeatureAction(guard, executionContext, true);
  });

  it('allows anyone to create a world', async () => {
    feature = 'Worlds';
    action = 'Create-One';
    await assertFeatureAction(guard, executionContext, true);
  });

  it('forbids anyone to do anything else with a world', async () => {
    feature = 'Worlds';
    const actions = ['Create-Many', 'Delete-One', 'Replace-One', 'Update-One'];
    await actions.reduce(async (prev, act) => {
      await prev;
      action = act;
      await assertFeatureAction(guard, executionContext, false);
    }, Promise.resolve());
  });

  it('returns false by default', async () => {
    feature = 'Foo';
    action = 'Bar';
    await assertFeatureAction(guard, executionContext, false);
  });
});
