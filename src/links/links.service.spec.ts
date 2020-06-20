import { Test, TestingModule } from '@nestjs/testing';
import { LinksService } from './links.service';
import { Link, LinkSchema } from './models/link';
import LinkSettings from './LinkSettings';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ILink } from './interfaces/link.interface';

const ensureEquals = (link1: ILink, link2: ILink) => {
    expect(link1.id).toBe(link2.id);
    expect(link1.isPermanent).toBe(link2.isPermanent);
    expect(link1.originalUrl).toBe(link2.originalUrl);
    expect(link1.shortId).toBe(link2.shortId);
    expect(
        Math.abs(link1.createdOn.getTime() - link2.createdOn.getTime()),
    ).toBeLessThan(1000);
};

describe('LinksService', () => {
    let service: LinksService;
    let linkModel: Model<Link>;
    let module: TestingModule;

    beforeAll(async () => {
        const settings: LinkSettings = new LinkSettings(
            'http://localhost:3000',
            5,
        );

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
            ],
        }).compile();

        service = module.get<LinksService>(LinksService);
        linkModel = module.get<Model<Link>>(getModelToken(Link.name));
    });

    beforeEach(async () => {
        await linkModel.deleteMany({});
    });

    afterAll(async () => {
        await module.close();
    });

    const createTestLinkEntry = async (): Promise<Link> => {
        return await linkModel.create({
            originalUrl: 'https://google.com/maps',
            shortId: '123',
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
});
