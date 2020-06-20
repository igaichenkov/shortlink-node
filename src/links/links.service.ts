import { Injectable } from '@nestjs/common';
import { Link } from './models/link';
import { ILink } from './interfaces/link.interface';
import { nanoid } from 'nanoid';
import { isUri } from 'valid-url';
import LinkSettings from './LinkSettings';
import { Model, Error } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class LinksService {
    private readonly settings: LinkSettings;
    private readonly linkModel: Model<Link>;

    constructor(
        settings: LinkSettings,
        @InjectModel(Link.name) linkModel: Model<Link>,
    ) {
        if (!settings) throw new Error("'settings' parameter must be defined");

        if (!linkModel)
            throw new Error("'linkModel' parameter must be defined");

        this.settings = settings;
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

    async createLink(url: string, isPermanent: boolean): Promise<ILink> {
        /*if (!userId)
      throw new Error('[LinksService]: userId parameter must be provided');*/

        if (!isUri(url))
            throw new Error('[LinksService] url parameter must be a valid url');

        const newUrlId = nanoid(this.settings.shortIdLength);

        const newLink = await this.linkModel.create({
            originalUrl: url,
            isPermanent: isPermanent,
            shortId: newUrlId,
        });

        return newLink;
    }

    async deleteUserLink(linkId: string): Promise<ILink | null> {
        return await this.linkModel.findByIdAndDelete(linkId).exec();
    }
}
