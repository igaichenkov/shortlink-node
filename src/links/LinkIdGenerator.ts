import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import LinkSettings from './LinkSettings';

@Injectable()
export class LinkIdGenerator {
    constructor(private readonly settings: LinkSettings) {}

    public GenerateId(): string {
        return nanoid(this.settings.shortIdLength);
    }
}
