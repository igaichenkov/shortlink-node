import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Model } from 'mongoose';
import { Link } from '../src/links/models/link';
import { getModelToken } from '@nestjs/mongoose';
import { LinksService } from '../src/links/links.service';
import LinkSettings from '../src/links/LinkSettings';
import { LinkDTO } from '../src/links/dto/link.dto';

describe('AppController (e2e)', () => {
    let app: INestApplication;
    let linkModel: Model<Link>;
    let service: LinksService;
    let settings: LinkSettings;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        linkModel = moduleFixture.get<Model<Link>>(getModelToken(Link.name));
        service = moduleFixture.get<LinksService>(LinksService);
        settings = moduleFixture.get<LinkSettings>(LinkSettings);

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    beforeEach(async () => {
        await linkModel.deleteMany().exec();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/ (GET)', async () => {
        const testLink1 = await service.createLink(
            'https://something.org/full/path',
            true,
            '654321',
        );
        const testLink2 = await service.createLink(
            'https://another-site.org/full/path',
            false,
        );

        const expectedResponesBody = [testLink1, testLink2].map(
            link => new LinkDTO(link, settings.baseUrl),
        );

        return request(app.getHttpServer())
            .get('/links')
            .expect(200)
            .expect(JSON.stringify(expectedResponesBody));
    });

    it('/:id (GET)', async () => {
        const testLink = await service.createLink(
            'https://something.org/full/path',
            true,
            '654321',
        );

        const expectedResponesBody = new LinkDTO(testLink, settings.baseUrl);

        return request(app.getHttpServer())
            .get('/links/' + testLink.id)
            .expect(200)
            .expect(JSON.stringify(expectedResponesBody));
    });

    it('/:id (POST)', async () => {
        const fullUrl = 'https://something.org/full/path';

        request(app.getHttpServer())
            .post('/links')
            .send({
                fullUrl: fullUrl,
                isPermanent: true,
            })
            .expect(201)
            .expect(async (res: Response) => {
                const linkDto = (await res.json()) as LinkDTO;
                const dbLink = await linkModel.findById(linkDto.id).exec();

                expect(dbLink).not.toBeNull();
                expect(linkDto.originalUrl).toBe(fullUrl);
                expect(linkDto.isPermanent).toBe(true);
                expect(linkDto.shortUrl).toBeTruthy();
                expect(linkDto.shortUrl).toContain(dbLink?.shortId);
                expect(dbLink?.originalUrl).toBe(fullUrl);
                expect(dbLink?.createdOn).toBe(linkDto.createdOn);
            });
    });
});
