import { ConnectionOptions } from 'typeorm';

const config: ConnectionOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'scribletop',

  synchronize: false,
  migrationsRun: true,
  logging: true,
  logger: 'advanced-console',

  entities: [__dirname + '/**/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/**/*.{ts,js}'],
  cli: {
    migrationsDir: 'src/migrations',
  },
};

export default config;
