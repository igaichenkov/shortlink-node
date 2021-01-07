import { Module } from '@nestjs/common';
import { LinksModule } from './links/links.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';

@Module({
    imports: [
        LinksModule,
        MongooseModule.forRoot('mongodb://localhost/shortlink'),
        UsersModule,
    ],
    controllers: [],
})
export class AppModule {}
