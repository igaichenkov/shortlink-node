import * as supertest from 'supertest';
import { INestApplication } from '@nestjs/common';

export const AUTH_HEADER = 'x-api-key';
export const API_KEY = '12345';

export function request(
    app: INestApplication,
    authHeaderName: string = AUTH_HEADER,
    apiKey: string = API_KEY,
) {
    const hook = (method = 'post') => args =>
        supertest(app)
            [method](args)
            .set(authHeaderName, apiKey);

    return {
        post: hook('post'),
        get: hook('get'),
        put: hook('put'),
        delete: hook('delete'),
    };
}
