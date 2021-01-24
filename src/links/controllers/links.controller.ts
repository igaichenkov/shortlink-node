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
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { LinksService } from '../links.service';
import { ILink } from '../interfaces/link.interface';
import { LinkDTO } from '../dto/link.dto';
import { CreateLinkDTO } from '../dto/create-link.dto';
import { ApiResponse, ApiCreatedResponse } from '@nestjs/swagger';
import LinkSettings from '../LinkSettings';
import { UpdateLinkDTO } from '../dto/update-link.dto';

@Controller('links')
export class LinksController {
    private readonly logger = new Logger(LinksController.name);

    constructor(
        private readonly linksService: LinksService,
        private readonly settings: LinkSettings,
    ) {}

    @Get()
    @ApiResponse({ status: HttpStatus.OK, type: LinkDTO, isArray: true })
    async GetAll(): Promise<LinkDTO[]> {
        const links = await this.linksService.getUserLinks();
        return links.map(link => this.convertToLinkDTO(link));
    }

    @Get(':id')
    @ApiResponse({ status: HttpStatus.OK, type: LinkDTO })
    @ApiResponse({ status: HttpStatus.NOT_FOUND })
    async GetById(@Param('id') id: string): Promise<LinkDTO> {
        const link = await this.linksService.getUserLinkById(id);

        if (!link) {
            throw new HttpException('Link not found', HttpStatus.NOT_FOUND);
        }

        return this.convertToLinkDTO(link);
    }

    @Post()
    @ApiCreatedResponse({ type: LinkDTO })
    @HttpCode(HttpStatus.CREATED)
    async CreateLink(@Body() dto: CreateLinkDTO): Promise<LinkDTO> {
        const link = await this.linksService.createLink(
            dto.fullUrl,
            dto.isPermanent,
            dto.shortId,
        );

        return this.convertToLinkDTO(link);
    }

    @Put(':id')
    @ApiResponse({ status: HttpStatus.OK, type: LinkDTO })
    @ApiResponse({ status: HttpStatus.NOT_FOUND })
    async Update(@Param('id') id: string, @Body() dto: UpdateLinkDTO) {
        const link = await this.linksService.updateLink(
            id,
            dto.fullUrl,
            dto.isPermanent,
            dto.shortId,
        );

        if (link === null) {
            throw new HttpException('Link not found', HttpStatus.NOT_FOUND);
        }

        return this.convertToLinkDTO(link);
    }

    @Delete(':id')
    @ApiResponse({ status: HttpStatus.OK, type: LinkDTO })
    @ApiResponse({ status: HttpStatus.NOT_FOUND })
    async Delete(@Param('id') id: string): Promise<LinkDTO> {
        const link = await this.linksService.deleteUserLink(id);
        try {
            if (!link) {
                throw new HttpException('Link not found', HttpStatus.NOT_FOUND);
            }

            return this.convertToLinkDTO(link);
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }

    private convertToLinkDTO(link: ILink): LinkDTO {
        return new LinkDTO(link, this.settings.baseUrl);
    }
}
