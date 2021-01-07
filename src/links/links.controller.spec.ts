import { Test, TestingModule } from '@nestjs/testing';
import { LinksController } from './links.controller';
import { LinksService } from './links.service';
import LinkSettings from './LinkSettings';
import { LinkIdGenerator } from './LinkIdGenerator';
import { FakeLinksService } from './mocks/FakeLinksService';
import { nanoid } from 'nanoid';
import { ILink } from './interfaces/link.interface';
import { LinkDTO } from './dto/link.dto';
import { HttpException } from '@nestjs/common';

const fakeLinks: ILink[] = [
    {
        id: nanoid(12),
        originalUrl: 'http://something.org',
        createdOn: new Date(),
        isPermanent: false,
        shortId: nanoid(6),
    },
    {
        id: nanoid(12),
        originalUrl: 'https://another_web_site.org/some/relative/path?id=42',
        createdOn: new Date(),
        isPermanent: false,
        shortId: nanoid(6),
    },
];

const SERVER_URL = 'http://localhost:3000';

const compareLinks = (link: ILink, dto: LinkDTO) => {
    expect(link.id).toBe(dto.id);
    expect(link.createdOn).toBe(dto.createdOn);
    expect(link.originalUrl).toBe(dto.originalUrl);
    expect(dto.shortUrl).toBe(SERVER_URL + '/' + link.shortId);
};

describe('Links Controller', () => {
    let controller: LinksController;
    let module: TestingModule;
    let fakeLinksService: FakeLinksService;

    beforeAll(async () => {
        const settings: LinkSettings = new LinkSettings(SERVER_URL, 5);
        fakeLinksService = new FakeLinksService(fakeLinks);

        module = await Test.createTestingModule({
            providers: [
                {
                    provide: LinkSettings,
                    useFactory: () => settings,
                },
                {
                    provide: LinksService,
                    useFactory: () => fakeLinksService,
                },
                LinksController,
                LinkIdGenerator,
            ],
        }).compile();

        controller = module.get<LinksController>(LinksController);
    });

    afterAll(async () => {
        await module.close();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should return all user links', async () => {
        const links = await controller.GetAll();
        expect(links.length).toBe(2);
        compareLinks(fakeLinks[0], links[0]);
        compareLinks(fakeLinks[1], links[1]);
    });

    it('should return link by id', async () => {
        const linkResponse = await controller.GetById(fakeLinks[1].id!);
        compareLinks(fakeLinks[1], linkResponse);
    });

    it('should throw HttpException if link does not exist', async () => {
        expect.assertions(1);
        try {
            await controller.GetById('not existing link id');
        } catch (e) {
            const httpError = e as HttpException;
            expect(httpError.getStatus()).toBe(404);
        }
    });

    it('POST should create a link', async () => {
        const testUrl = 'https://google.com/some/page/path/';
        const isPermanent = true;

        const linkDto = await controller.CreateLink({
            fullUrl: testUrl,
            isPermanent,
        });

        expect(linkDto.originalUrl).toBe(testUrl);
        expect(linkDto.isPermanent).toBe(isPermanent);
        expect(linkDto.shortUrl).toContain(SERVER_URL);

        compareLinks(fakeLinks[fakeLinks.length - 1], linkDto);
    });
});
