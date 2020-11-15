import { Injectable } from '@nestjs/common';
import { isUri } from 'valid-url';

@Injectable()
export default class LinkSettings {
    public readonly baseUrl: string;

    constructor(baseUrl: string, public readonly shortIdLength: number) {
        if (!isUri(baseUrl))
            throw new Error(`[LinkSettings] ${baseUrl} is not a valid url`);

        this.baseUrl = baseUrl;

        if (!baseUrl.endsWith('/'))
            this.baseUrl += '/';
    }
}
