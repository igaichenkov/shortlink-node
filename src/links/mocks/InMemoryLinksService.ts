import { ILinksService } from '../links.service';
import { ILink } from '../interfaces/link.interface';

export class InMemoryLinksService implements ILinksService {
    constructor(public data: ILink[]) {}

    getUserLinks(): Promise<ILink[]> {
        return Promise.resolve(this.data);
    }

    getUserLinkById(linkId: string): Promise<ILink | null> {
        return Promise.resolve(
            this.data.find(link => link.id === linkId) || null,
        );
    }

    resolveFullUrl(shortId: string): Promise<string | null> {
        const link = this.data.find(link => link.shortId === shortId);
        return Promise.resolve(link ? link.originalUrl : null);
    }

    createLink(url: string, isPermanent: boolean): Promise<ILink> {
        const link: ILink = {
            id: Date.now().toString(),
            createdOn: new Date(),
            isPermanent: isPermanent,
            originalUrl: url,
            shortId: Date.now().toString(),
        };

        this.data.push(link);

        return Promise.resolve(link);
    }

    async deleteUserLink(linkId: string): Promise<ILink | null> {
        const link = await this.getUserLinkById(linkId);
        if (link == null) {
            return Promise.resolve(null);
        }

        this.data = this.data.filter(link => link.id !== linkId);

        return link;
    }

    async updateLink(
        id: string,
        url?: string,
        isPermanent?: boolean,
        shortId?: string,
    ) {
        const link = await this.getUserLinkById(id);

        if (link == null) {
            return null;
        }

        link.originalUrl = url ?? link.originalUrl;
        link.shortId = shortId ?? link.shortId;
        link.isPermanent = isPermanent ?? link.isPermanent;

        return link;
    }
}
