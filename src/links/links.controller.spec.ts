import { Test, TestingModule } from '@nestjs/testing';
import { LinksController } from './links.controller';
import { LinksService } from './links.service';
import LinkSettings from './LinkSettings';
import { LinkIdGenerator } from './LinkIdGenerator';
import { InMemoryLinksService } from './mocks/InMemoryLinksService';
import { nanoid } from 'nanoid';
import { ILink } from './interfaces/link.interface';
import { LinkDTO } from './dto/link.dto';
import { HttpException } from '@nestjs/common';

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
    let fakeLinksService: InMemoryLinksService;

    beforeAll(async () => {
        const settings: LinkSettings = new LinkSettings(SERVER_URL, 5);
        fakeLinksService = new InMemoryLinksService([]);

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

    beforeEach(() => {
        fakeLinksService.data.length = 0;

        fakeLinksService.data.push({
            id: nanoid(12),
            originalUrl: 'http://something.org',
            createdOn: new Date(),
            isPermanent: false,
            shortId: nanoid(6),
        });

        fakeLinksService.data.push({
            id: nanoid(12),
            originalUrl:
                'https://another_web_site.org/some/relative/path?id=42',
            createdOn: new Date(),
            isPermanent: false,
            shortId: nanoid(6),
        });
    });

    afterAll(async () => {
        await module.close();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('GET should return all user links', async () => {
        const links = await controller.GetAll();
        expect(links.length).toBe(2);
        compareLinks(fakeLinksService.data[0], links[0]);
        compareLinks(fakeLinksService.data[1], links[1]);
    });

    it('GET should return link by id', async () => {
        const linkResponse = await controller.GetById(
            fakeLinksService.data[1].id!,
        );
        compareLinks(fakeLinksService.data[1], linkResponse);
    });

    it('GET should throw HttpException if link does not exist', async () => {
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

        compareLinks(
            fakeLinksService.data[fakeLinksService.data.length - 1],
            linkDto,
        );
    });

    it('PUT should update a link', async () => {
        const testUrl = 'https://google.com/some/page/path/';
        const isPermanent = false;
        const newShortId = '556677';
        fakeLinksService.data[0].isPermanent = true;

        const linkDto = await controller.Update(fakeLinksService.data[0].id!, {
            fullUrl: testUrl,
            isPermanent,
            shortId: newShortId,
        });

        expect(linkDto.originalUrl).toBe(testUrl);
        expect(linkDto.isPermanent).toBe(isPermanent);
        expect(linkDto.shortUrl).toContain(SERVER_URL);

        compareLinks(fakeLinksService.data[0], linkDto);
        console.log(linkDto);
    });

    it('PUT should throw HttpException if link does not exist', async () => {
        expect.assertions(1);
        try {
            await controller.Update('not existing link id', {
                shortId: '123',
                fullUrl: 'http://something.org',
                isPermanent: false,
            });
        } catch (e) {
            const httpError = e as HttpException;
            expect(httpError.getStatus()).toBe(404);
        }
    });

    it('DELETE removes a link by id', async () => {
        const linkToDelete = fakeLinksService.data[0];
        const deletedLink = await controller.Delete(linkToDelete.id!);

        compareLinks(linkToDelete, deletedLink);
        expect(fakeLinksService.data.length).toBe(1);
    });

    it('DELETE throws exception if link does not exist', async () => {
        expect.assertions(1);

        try {
            await controller.Delete('do not exist');
        } catch (e) {
            const httpError = e as HttpException;
            expect(httpError.getStatus()).toBe(404);
        }
    });
});
