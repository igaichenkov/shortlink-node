import { Module } from '@nestjs/common';
import { ApiKeyStrategy } from './apiKey.strategy';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [PassportModule, UsersModule],
    providers: [ApiKeyStrategy],
})
export class AuthModule {}
