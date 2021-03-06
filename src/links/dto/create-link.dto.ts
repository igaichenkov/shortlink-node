import { ApiProperty } from '@nestjs/swagger';

export class CreateLinkDTO {
    @ApiProperty()
    readonly fullUrl: string;
    @ApiProperty()
    readonly isPermanent: boolean;
    @ApiProperty({ required: false })
    readonly shortId?: string;
}
