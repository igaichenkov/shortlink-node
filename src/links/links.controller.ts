import { Controller, Get } from '@nestjs/common';
import { LinksService } from './links.service';
import { Link } from './interfaces/link.interface';

@Controller('links')
export class LinksController {
  constructor(private linksService: LinksService) {}

  @Get()
  GetAll(): Link[] {
    return this.linksService.getUserLinks('12');
  }
}
