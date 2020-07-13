import { System } from './system.entity';

describe('SystemEntity', () => {
  describe('beforeInsert', () => {
    it('generates a slug', () => {
      const system = new System();
      system.name = 'My Super System';
      system.beforeInsert();
      expect(system.slug).toMatch('my-super-system');
    });

    it('generates a non-unique slug', () => {
      const system = new System();
      system.name = 'My Super System';
      system.beforeInsert();
      const oldSlug = system.slug;
      system.beforeInsert();
      expect(system.slug).toBe(oldSlug);
    });
  });
});
