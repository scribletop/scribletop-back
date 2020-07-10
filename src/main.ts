import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as connectRedis from 'connect-redis';
import * as session from 'express-session';
import { logger } from 'express-winston';
import * as passport from 'passport';
import * as winston from 'winston';
import { AppModule } from './app.module';
import * as redis from 'redis';

const RedisStore = connectRedis(session);
const redisClient = redis.createClient({ port: 32768 });

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.disable('x-powered-by');

  app.use(
    session({
      secret: 'super secret key', // todo change with env
      resave: false,
      saveUninitialized: false,
      store: new RedisStore({ client: redisClient }),
    }),
    logger({
      transports: [new winston.transports.Console()],
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        // winston.format.json(),
      ),
      expressFormat: true,
      colorize: true,
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  const options = new DocumentBuilder()
    .setTitle('Scribletop API')
    .setDescription('The scribletop API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('', app, document);

  await app.listen(3000);
}

(() => bootstrap())();
