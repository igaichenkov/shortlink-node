import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    HttpException,
    Delete,
    HttpCode,
    Put,
} from '@nestjs/common';
import { LinksService } from './links.service';
import { ILink } from './interfaces/link.interface';
import { LinkDTO } from './dto/link.dto';
import { CreateLinkDTO } from './dto/create-link.dto';
import { ApiResponse, ApiCreatedResponse } from '@nestjs/swagger';
import LinkSettings from './LinkSettings';
import { UpdateLinkDTO } from './dto/update-link.dto';

@Controller('links')
export class LinksController {
    constructor(
        private linksService: LinksService,
        private settings: LinkSettings,
    ) {}

    @Get()
    @ApiResponse({ status: 200, type: LinkDTO, isArray: true })
    async GetAll(): Promise<LinkDTO[]> {
        const links = await this.linksService.getUserLinks();
        return links.map(link => this.convertToLinkDTO(link));
    }

    @Get(':id')
    @ApiResponse({ status: 200, type: LinkDTO })
    @ApiResponse({ status: 404 })
    async GetById(@Param('id') id: string): Promise<LinkDTO> {
        const link = await this.linksService.getUserLinkById(id);

        if (!link) {
            throw new HttpException('Link not found', 404);
        }

        return this.convertToLinkDTO(link);
    }

    @Post()
    @ApiCreatedResponse({ type: LinkDTO })
    @HttpCode(201)
    async CreateLink(@Body() dto: CreateLinkDTO): Promise<LinkDTO> {
        const link = await this.linksService.createLink(
            dto.fullUrl,
            dto.isPermanent,
        );

        return this.convertToLinkDTO(link);
    }

    @Put(':id')
    @ApiResponse({ status: 200, type: LinkDTO })
    @ApiResponse({ status: 404 })
    async Update(@Param('id') id: string, @Body() dto: UpdateLinkDTO) {
        const link = await this.linksService.updateLink(
            id,
            dto.fullUrl,
            dto.isPermanent,
            dto.shortId,
        );

        if (link === null) {
            throw new HttpException('Link not found', 404);
        }

        return this.convertToLinkDTO(link);
    }

    @Delete(':id')
    @ApiResponse({ status: 200, type: LinkDTO })
    @ApiResponse({ status: 404 })
    async Delete(@Param('id') id: string): Promise<LinkDTO> {
        const link = await this.linksService.deleteUserLink(id);
        if (!link) {
            throw new HttpException('Link not found', 404);
        }

        return this.convertToLinkDTO(link);
    }

    private convertToLinkDTO(link: ILink): LinkDTO {
        return new LinkDTO(link, this.settings.baseUrl);
    }
}
