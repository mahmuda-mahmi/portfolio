import { createApp } from './app.factory';

async function bootstrap() {
  const expressApp = await createApp();
  const port = Number(process.env.PORT ?? 3001);
  expressApp.listen(port, () => {
    console.log(`NestJS 11 API listening on http://localhost:${port}/api`);
  });
}

bootstrap();
