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
});
