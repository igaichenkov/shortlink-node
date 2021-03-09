import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserPrincipal } from './user.principal';

type verifiedCallbackFunction = (
    err: Error | null,
    user?: Object,
    info?: Object,
) => void;

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy) {
    constructor(private usersService: UsersService) {
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
        try {
            const user = await this.usersService.findUserByApiKey(apiKey);
            if (user) {
                const principal = new UserPrincipal(user);
                return verified(null, principal);
            }

            verified(null);
        } catch (error) {
            verified(error);
        }
    }
}
