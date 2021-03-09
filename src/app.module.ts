import { Module } from '@nestjs/common';
import { LinksModule } from './links/links.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
    imports: [
        LinksModule,
        MongooseModule.forRoot('mongodb://localhost/shortlink'),
        AuthModule,
        UsersModule,
    ],
    controllers: [],
})
export class AppModule {}
