import { PartyMember } from './party-member.entity';
import { Party } from './party.entity';

describe('PartyEntity', () => {
  describe('hasMembers', () => {
    it('should return a member of a party', () => {
      const party = new Party();
      const username = 'username';
      const partyMember = { user: { username } };
      party.members = [partyMember] as PartyMember[];

      expect(party.findMember(username)).toBe(partyMember);
    });

    it('should return undefined when member is not found', () => {
      const party = new Party();
      const username = 'username';
      const partyMember = { user: { username: `not-username` } };
      party.members = [partyMember] as PartyMember[];

      expect(party.findMember(username)).toBeUndefined();
    });

    it('should throw when party has no member', () => {
      const party = new Party();
      expect(() => party.findMember('')).toThrow();

      party.members = [];
      expect(() => party.findMember('')).toThrow();
    });
  });

  describe('beforeInsert', () => {
    it('generates a slug', () => {
      const party = new Party();
      party.name = 'My Super Party';
      party.beforeInsert();
      expect(party.slug).toMatch('my-super-party');
    });

    it('generates a unique slug', () => {
      const party = new Party();
      party.name = 'My Super Party';
      party.beforeInsert();
      const oldSlug = party.slug;
      party.beforeInsert();
      expect(party.slug).not.toBe(oldSlug);
    });
  });
});
