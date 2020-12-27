import { Test, TestingModule } from '@nestjs/testing';
import { LinksService } from './links.service';
import { Link, LinkSchema } from './models/link';
import LinkSettings from './LinkSettings';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ILink } from './interfaces/link.interface';
import { LinkIdGenerator } from './linkIdGenerator';

const ensureEquals = (link1: ILink, link2: ILink) => {
    expect(link1.id).toBe(link2.id);
    expect(link1.isPermanent).toBe(link2.isPermanent);
    expect(link1.originalUrl).toBe(link2.originalUrl);
    expect(link1.shortId).toBe(link2.shortId);
    expect(
        Math.abs(link1.createdOn.getTime() - link2.createdOn.getTime()),
    ).toBeLessThan(1000);
};

const settings: LinkSettings = new LinkSettings('http://localhost:3000', 5);

describe('LinksService', () => {
    let service: LinksService;
    let linkModel: Model<Link>;
    let module: TestingModule;
    let idGenerator: LinkIdGenerator;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot('mongodb://localhost/shortlink-test'),
                MongooseModule.forFeature([
                    { name: Link.name, schema: LinkSchema },
                ]),
            ],
            providers: [
                {
                    provide: LinkSettings,
                    useFactory: () => settings,
                },
                LinksService,
                LinkIdGenerator,
            ],
        }).compile();

        service = module.get<LinksService>(LinksService);
        linkModel = module.get<Model<Link>>(getModelToken(Link.name));
        idGenerator = module.get<LinkIdGenerator>(LinkIdGenerator);

        await linkModel.deleteMany({});
    });

    afterEach(async () => {
        await module.close();
    });

    const createTestLinkEntry = async (): Promise<Link> => {
        return await linkModel.create({
            originalUrl: 'https://google.com/maps',
            shortId: idGenerator.GenerateId(),
            isPermanent: true,
        });
    };

    it('should return all links', async () => {
        const link1 = await createTestLinkEntry();
        const link2 = await createTestLinkEntry();

        const links = await service.getUserLinks();

        expect(links.length).toBe(2);
        ensureEquals(links[0], link1);
        ensureEquals(links[1], link2);
    });

    it('should return one link by id', async () => {
        const link = await createTestLinkEntry();

        const userLink = await service.getUserLinkById(link.id);

        expect(userLink).not.toBeNull();
        ensureEquals(userLink!, link);
    });

    it('should return null if link does not exist', async () => {
        const userLink = await service.getUserLinkById(
            '507f1f77bcf86cd799439011',
        );
        expect(userLink).toBeNull();
    });

    it('should resolve original url by short id', async () => {
        const link = await createTestLinkEntry();

        const fullUrl = await service.resolveFullUrl(link.shortId);
        expect(fullUrl).toBe(link.originalUrl);
    });

    it('should resolve original url to null if url does not exist', async () => {
        const fullUrl = await service.resolveFullUrl(
            '507f1f77bcf86cd799439011',
        );
        expect(fullUrl).toBeNull();
    });

    it('should delete link by id', async () => {
        const link = await createTestLinkEntry();

        const userLink = await service.deleteUserLink(link.id);

        expect(userLink).not.toBeNull();
        ensureEquals(userLink!, link);

        expect(await linkModel.findById(link.id).exec()).toBeNull();
    });

    it('should return null if deleted link does not exist', async () => {
        const userLink = await service.deleteUserLink(
            '507f1f77bcf86cd799439011',
        );

        expect(userLink).toBeNull();
    });

    it('should create a new short link entry', async () => {
        const fullUrl = 'https://google.com';
        const date = new Date().getTime();
        const linkEntry = await service.createLink(fullUrl, true);

        expect(linkEntry.isPermanent).toBe(true);
        expect(linkEntry.originalUrl).toBe(fullUrl);
        expect(linkEntry.createdOn.getTime()).toBeGreaterThanOrEqual(date);
        expect(linkEntry.shortId.length).toBe(settings.shortIdLength);
        expect(linkEntry.id).toBeTruthy();
    });

    it('should throw exception if fails to find a unique id', async () => {
        const fakeShortId = '123456';

        jest.spyOn(idGenerator, 'GenerateId').mockImplementation(
            () => fakeShortId,
        );

        const fullUrl1 = 'https://google.com';
        const fullUrl2 = 'https://facebook.com';

        await service.createLink(fullUrl1, true);
        await expect(service.createLink(fullUrl2, true)).rejects.toThrowError();
    });

    it('does not generate unique id if short id provided', async () => {
        const fakeShortId = '123456';

        jest.spyOn(idGenerator, 'GenerateId').mockImplementation(
            () => fakeShortId,
        );

        const fullUrl1 = 'https://google.com';
        const fullUrl2 = 'https://facebook.com';

        await service.createLink(fullUrl1, true);

        const definedId = '54321';
        const link = await service.createLink(fullUrl2, true, definedId);
        expect(link.shortId).toBe(definedId);
    });
});
