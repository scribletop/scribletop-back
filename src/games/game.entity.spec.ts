import { Game } from './game.entity';

describe('GameEntity', () => {
  describe('beforeInsert', () => {
    it('generates a slug', () => {
      const game = new Game();
      game.name = 'My Super Game';
      game.beforeInsert();
      expect(game.slug).toMatch('my-super-game');
    });

    it('generates a unique slug', () => {
      const game = new Game();
      game.name = 'My Super Game';
      game.beforeInsert();
      const oldSlug = game.slug;
      game.beforeInsert();
      expect(game.slug).not.toBe(oldSlug);
    });
  });
});
