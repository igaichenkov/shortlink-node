import { Module } from '@nestjs/common';
import { LinksModule } from './links/links.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        LinksModule,
        MongooseModule.forRoot('mongodb://localhost/shortlink'),
    ],
    controllers: [],
})
export class AppModule {}
