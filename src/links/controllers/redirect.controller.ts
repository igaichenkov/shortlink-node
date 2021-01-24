import { Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';
import { LinksService } from '../links.service';
import { Response } from 'express';

@Controller()
export class RedirectController {
    constructor(private readonly linksService: LinksService) {}

    @Get(':shortId')
    async Redirect(
        @Param('shortId') shortId: string,
        @Res() response: Response,
    ) {
        const fullUrl = await this.linksService.resolveFullUrl(shortId);

        if (fullUrl) {
            response.redirect(fullUrl, HttpStatus.TEMPORARY_REDIRECT);
            return;
        }

        response.status(HttpStatus.NOT_FOUND).send({
            message: 'Url does not exist',
        });
    }
}
