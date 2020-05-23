import { Controller, Get } from '@nestjs/common';
import { LinksService } from './links.service';
import { Link } from './interfaces/link.interface';
import { LinkDTO } from './dto/link.dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller('links')
export class LinksController {
  constructor(private linksService: LinksService) {}

  @Get()
  @ApiResponse({ status: 200, type: LinkDTO, isArray: true })
  GetAll(): Link[] {
    return this.linksService.getUserLinks('12');
  }
}
