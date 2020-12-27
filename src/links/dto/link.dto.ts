import { ApiProperty } from '@nestjs/swagger';
import { ILink } from '../interfaces/link.interface';

export class LinkDTO {
    @ApiProperty()
    readonly id?: string;
    @ApiProperty()
    readonly shortUrl: string;
    @ApiProperty()
    readonly originalUrl: string;
    @ApiProperty()
    readonly createdOn: Date;
    @ApiProperty()
    readonly isPermanent: boolean;

    constructor(link: ILink, baseUrl: string) {
        this.id = link.id;
        this.shortUrl = baseUrl + link.shortId;
        this.originalUrl = link.originalUrl;
        this.createdOn = link.createdOn;
        this.isPermanent = link.isPermanent;
    }
}
