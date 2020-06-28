import { Injectable } from '@nestjs/common';
import { Link } from './models/link';
import { ILink } from './interfaces/link.interface';
import { isUri } from 'valid-url';
import { Model, Error } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { LinkIdGenerator } from './linkIdGenerator';
import { retry } from '../utils/retry';

const MAX_RETRIES = 10;

@Injectable()
export class LinksService {
    private readonly linkModel: Model<Link>;
    private readonly idGenerator: LinkIdGenerator;

    constructor(
        idGenerator: LinkIdGenerator,
        @InjectModel(Link.name) linkModel: Model<Link>,
    ) {
        if (!idGenerator)
            throw new Error("'settings' parameter must be defined");

        if (!linkModel)
            throw new Error("'linkModel' parameter must be defined");

        this.idGenerator = idGenerator;
        this.linkModel = linkModel;
    }

    async getUserLinks(): Promise<ILink[]> {
        /*if (!userId)
      throw new Error('[LinksService]: userId parameter must be provided');*/

        return await this.linkModel.find().exec();
    }

    async getUserLinkById(linkId: string): Promise<ILink | null> {
        /*if (!userId)
      throw new Error('[LinksService]: userId parameter must be provided');*/

        const link = await this.linkModel.findById(linkId).exec();
        // TODO: check user id
        return link;
    }

    async resolveFullUrl(shortId: string): Promise<string | null> {
        const url = await this.linkModel.findOne({ shortId }).exec();
        return url ? url.originalUrl : null;
    }

    async createLink(url: string, isPermanent: boolean): Promise<ILink> {
        /*if (!userId)
      throw new Error('[LinksService]: userId parameter must be provided');*/

        if (!isUri(url))
            throw new Error('[LinksService] url parameter must be a valid url');

        return await retry(
            () => this.createLinkInternal(url, isPermanent),
            MAX_RETRIES,
        );
    }

    private async createLinkInternal(
        url: string,
        isPermanent: boolean,
    ): Promise<ILink> {
        const newUrlId = this.idGenerator.GenerateId();

        return await this.linkModel.create({
            originalUrl: url,
            isPermanent: isPermanent,
            shortId: newUrlId,
        });
    }

    async deleteUserLink(linkId: string): Promise<ILink | null> {
        return await this.linkModel.findByIdAndDelete(linkId).exec();
    }
}
