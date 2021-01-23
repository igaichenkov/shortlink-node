import { Injectable } from '@nestjs/common';
import { Link } from './models/link';
import { ILink } from './interfaces/link.interface';
import { isUri } from 'valid-url';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { LinkIdGenerator } from './linkIdGenerator';
import { retry } from '../utils/retry';
import { MongoError } from 'mongodb';
import { ValidationError } from '../errors/validation-error';

const MAX_RETRIES = 10;

export interface ILinksService {
    getUserLinks(): Promise<ILink[]>;

    getUserLinkById(linkId: string): Promise<ILink | null>;

    resolveFullUrl(shortId: string): Promise<string | null>;

    createLink(
        url: string,
        isPermanent: boolean,
        shortId?: string,
    ): Promise<ILink>;

    deleteUserLink(linkId: string): Promise<ILink | null>;

    updateLink(
        id: string,
        url?: string,
        isPermanent?: boolean,
        shortId?: string,
    ): Promise<ILink | null>;
}

@Injectable()
export class LinksService implements ILinksService {
    private readonly linkModel: Model<Link>;
    private readonly idGenerator: LinkIdGenerator;

    constructor(
        idGenerator: LinkIdGenerator,
        @InjectModel(Link.name) linkModel: Model<Link>,
    ) {
        if (!idGenerator)
            throw new ValidationError("'settings' parameter must be defined");

        if (!linkModel)
            throw new ValidationError("'linkModel' parameter must be defined");

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

        if (!isValidObjectId(linkId)) {
            return null;
        }
        const link = await this.linkModel.findById(linkId).exec();
        // TODO: check user id
        return link;
    }

    async resolveFullUrl(shortId: string): Promise<string | null> {
        const url = await this.linkModel.findOne({ shortId }).exec();
        return url ? url.originalUrl : null;
    }

    async createLink(
        fullUrl: string,
        isPermanent: boolean,
        shortId?: string,
    ): Promise<ILink> {
        /*if (!userId)
      throw new Error('[LinksService]: userId parameter must be provided');*/

        if (!isUri(fullUrl))
            throw new ValidationError('Url parameter must be a valid url');

        if (shortId && shortId.length > 0) {
            // we are not generating short id, do not retry
            return await this.saveShortLink(fullUrl, isPermanent, shortId);
        }

        try {
            // retry in case a random generated shortId already exists
            return await retry(
                () => this.generateShortIdAndSave(fullUrl, isPermanent),
                MAX_RETRIES,
            );
        } catch (e) {
            // TODO: logger
            throw new Error('Failed creating a new link');
        }
    }

    public async updateLink(
        id: string,
        url?: string,
        isPermanent?: boolean,
        shortId?: string,
    ) {
        if (!isValidObjectId(id)) {
            return null;
        }

        const updateCmd = {} as any;

        if (url) {
            updateCmd.originalUrl = url;
        }

        if (isPermanent !== null || isPermanent !== undefined) {
            updateCmd.isPermanent = isPermanent;
        }

        if (shortId) {
            updateCmd.shortId = shortId;
        }

        const options = { new: true };
        try {
            return await this.linkModel
                .findByIdAndUpdate(id, updateCmd, options)
                .exec();
        } catch (e) {
            this.handleDuplicateKeyError(e, shortId ?? '');
            throw new Error('Failed updating link ' + id);
        }
    }

    private async saveShortLink(
        url: string,
        isPermanent: boolean,
        shortId: string,
    ) {
        try {
            return await this.saveLinkInternal(url, isPermanent, shortId);
        } catch (e) {
            this.handleDuplicateKeyError(e, shortId);
            throw new Error('Failed creating a new link');
        }
    }

    private handleDuplicateKeyError(e, shortId: string) {
        // TODO: logger
        const duplicateKeyErrorCode = 11000;
        if (e instanceof MongoError && e.code == duplicateKeyErrorCode) {
            throw new ValidationError(`Link ${shortId} already exists`);
        }
    }

    private async generateShortIdAndSave(
        url: string,
        isPermanent: boolean,
    ): Promise<ILink> {
        const shortId = this.idGenerator.GenerateId();
        return await this.saveLinkInternal(url, isPermanent, shortId);
    }

    private async saveLinkInternal(
        url: string,
        isPermanent: boolean,
        shortId?: string,
    ) {
        return await this.linkModel.create({
            originalUrl: url,
            isPermanent: isPermanent,
            shortId: shortId,
        });
    }

    async deleteUserLink(linkId: string): Promise<ILink | null> {
        if (!isValidObjectId(linkId)) {
            return null;
        }

        return await this.linkModel.findByIdAndDelete(linkId).exec();
    }
}
