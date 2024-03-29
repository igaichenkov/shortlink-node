import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const port =
        typeof process.env.port === 'number'
            ? Number.parseInt(process.env.port)
            : 3000;

    const app = await NestFactory.create(AppModule);

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
