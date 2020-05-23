import { ApiProperty } from '@nestjs/swagger';

export class LinkDTO {
  @ApiProperty()
  readonly id: string;
  @ApiProperty()
  readonly shortUrl: string;
  @ApiProperty()
  readonly fullUrl: string;
}
