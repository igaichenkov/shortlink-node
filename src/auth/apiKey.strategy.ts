import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

type verifiedCallbackFunction = (
    err: Error | null,
    user?: Object,
    info?: Object,
) => void;

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy) {
    constructor(private authService: AuthService) {
        super(
            { header: 'x-api-key', prefix: '' },
            false,
            (apikey: string, done: verifiedCallbackFunction) =>
                this.validateApiKey(apikey, done),
        );
    }

    private async validateApiKey(
        apiKey: string,
        verified: verifiedCallbackFunction,
    ) {
        const user = await this.authService.validateKey(apiKey);
        if (user) {
            return verified(null, { userName: 'testuser' });
        }

        verified(new Error('Invalid API key'));
    }
}
