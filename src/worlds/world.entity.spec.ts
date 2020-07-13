import { World } from './world.entity';

describe('WorldEntity', () => {
  describe('beforeInsert', () => {
    it('generates a slug', () => {
      const world = new World();
      world.name = 'My Super World';
      world.beforeInsert();
      expect(world.slug).toMatch('my-super-world');
    });

    it('generates a unique slug', () => {
      const world = new World();
      world.name = 'My Super World';
      world.beforeInsert();
      const oldSlug = world.slug;
      world.beforeInsert();
      expect(world.slug).not.toBe(oldSlug);
    });
  });
});
