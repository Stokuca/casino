import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Globalna validacija DTO-a
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        // skida nepoznata polja iz body-ja
    forbidNonWhitelisted: true, // baca grešku ako dođe neko polje koje nije u DTO
    transform: true,        // automatski kastuje tipove (npr. string → number)
  }));

  // ✅ Dozvoli CORS ako testiraš frontend kasnije
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
