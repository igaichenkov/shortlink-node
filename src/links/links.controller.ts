import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    HttpException,
    Delete,
    Res,
    HttpCode,
} from '@nestjs/common';
import { LinksService } from './links.service';
import { ILink } from './interfaces/link.interface';
import { LinkDTO } from './dto/link.dto';
import { CreateLinkDTO } from './dto/createLink.dto';
import { ApiResponse, ApiCreatedResponse } from '@nestjs/swagger';
import LinkSettings from './LinkSettings';
import HttpUtils from '../utils/HttpUtils';
import { FastifyReply } from 'fastify';

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
    async CreateLink(
        @Body() dto: CreateLinkDTO,
        @Res() res: FastifyReply,
    ): Promise<LinkDTO> {
        const link = await this.linksService.createLink(
            dto.fullUrl,
            dto.isPermanent,
        );

        const responseDto = this.convertToLinkDTO(link);
        HttpUtils.AddLocationHeader(res, responseDto.shortUrl);
        res.send(responseDto).status(201);

        return responseDto;
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
