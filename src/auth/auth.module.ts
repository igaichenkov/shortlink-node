import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiKeyStrategy } from './apiKey.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
    imports: [PassportModule],
    providers: [AuthService, ApiKeyStrategy],
})
export class AuthModule {}
