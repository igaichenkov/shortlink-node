import { NestFactory } from '@nestjs/core';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { isNumber } from 'util';

async function bootstrap() {
    const port = isNumber(process.env.port)
        ? Number.parseInt(process.env.port)
        : 3000;

    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter(),
    );

    const options = new DocumentBuilder()
        .setTitle('Url shortener')
        .setDescription('The url shortener API description')
        .setVersion('1.0')
        .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('swagger', app, document);

    await app.listen(port);
}

bootstrap();
