import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    public validateKey(apiKey: string): Promise<{ userName: string } | null> {
        return Promise.resolve({ userName: 'testuser' });
    }
}
