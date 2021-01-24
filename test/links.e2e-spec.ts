import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Model } from 'mongoose';
import { Link } from '../src/links/models/link';
import { getModelToken } from '@nestjs/mongoose';
import { LinksService } from '../src/links/links.service';
import LinkSettings from '../src/links/LinkSettings';
import { LinkDTO } from '../src/links/dto/link.dto';
import { Types } from 'mongoose';
import * as mongoose from 'mongoose';

describe('AppController (e2e)', () => {
    mongoose.set('useFindAndModify', false);

    let app: INestApplication;
    let linkModel: Model<Link>;
    let service: LinksService;
    let settings: LinkSettings;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        moduleFixture.useLogger(false);

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

    it('/links (GET)', async () => {
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

        return await request(app.getHttpServer())
            .get('/links')
            .expect(HttpStatus.OK)
            .expect(JSON.stringify(expectedResponesBody));
    });

    it('/links/:id (GET)', async () => {
        const testLink = await service.createLink(
            'https://something.org/full/path',
            true,
            '654321',
        );

        const expectedResponesBody = new LinkDTO(testLink, settings.baseUrl);

        return await request(app.getHttpServer())
            .get('/links/' + testLink.id)
            .expect(HttpStatus.OK)
            .expect(JSON.stringify(expectedResponesBody));
    });

    it('/links/:id (GET) does not exist', async () => {
        return await request(app.getHttpServer())
            .get('/links/123123')
            .expect(HttpStatus.NOT_FOUND);
    });

    it('/links (POST)', async () => {
        const runTestCase = async (shortId?: string) => {
            const fullUrl = 'https://something.org/full/path';

            const res = await request(app.getHttpServer())
                .post('/links')
                .send({
                    fullUrl: fullUrl,
                    isPermanent: true,
                    shortId: shortId,
                });

            expect(res.status).toBe(HttpStatus.CREATED);
            const linkDto = res.body as LinkDTO;
            const dbLink = await linkModel.findById(linkDto.id).exec();

            expect(dbLink).not.toBeNull();
            expect(linkDto.originalUrl).toBe(fullUrl);
            expect(linkDto.isPermanent).toBe(true);
            expect(linkDto.shortUrl).toBeTruthy();
            expect(linkDto.shortUrl).toContain(dbLink?.shortId);

            expect(dbLink?.originalUrl).toBe(fullUrl);
            expect(dbLink?.createdOn.toJSON()).toBe(linkDto.createdOn);
            expect(dbLink?.isPermanent).toBe(true);

            if (shortId) {
                expect(dbLink?.shortId).toBe(shortId);
            }
        };

        await runTestCase();
        await runTestCase('123456');
    });

    it('/links (POST) duplicate shortId', async () => {
        const fullUrl = 'https://something.org/full/path';
        const shortId = '123456';

        await service.createLink(fullUrl, true, shortId);

        const res = await request(app.getHttpServer())
            .post('/links')
            .send({
                fullUrl: fullUrl,
                isPermanent: true,
                shortId: shortId,
            });

        expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        expect(res.body.message).toContain('already exists');
    });

    it('/links/:id (PUT)', async () => {
        const newFullUrl = 'https://something.org/new-path';
        const newShortId = '1234567';
        const newIsPermanent = false;

        const testLink = await service.createLink(
            'https://something.org/full/path',
            true,
            '654321',
        );

        const res = await request(app.getHttpServer())
            .put('/links/' + testLink.id)
            .send({
                fullUrl: newFullUrl,
                isPermanent: newIsPermanent,
                shortId: newShortId,
            });

        expect(res.status).toBe(HttpStatus.OK);
        const linkDto = res.body as LinkDTO;
        const dbLink = await linkModel.findById(linkDto.id).exec();

        expect(dbLink).not.toBeNull();
        expect(linkDto.originalUrl).toBe(newFullUrl);
        expect(linkDto.isPermanent).toBe(newIsPermanent);
        expect(linkDto.shortUrl).toBeTruthy();
        expect(linkDto.shortUrl).toContain(dbLink?.shortId);

        expect(dbLink?.originalUrl).toBe(newFullUrl);
        expect(dbLink?.createdOn.toJSON()).toBe(linkDto.createdOn);
        expect(dbLink?.isPermanent).toBe(newIsPermanent);
        expect(dbLink?.shortId).toBe(newShortId);
    });

    it('/links/:id (PUT) duplicate shortId', async () => {
        const newFullUrl = 'https://something.org/new-path';
        const newShortId = '1234567';
        const newIsPermanent = false;

        const testLink = await service.createLink(
            'https://something.org/full/path',
            true,
            '654321',
        );

        await service.createLink(
            'https://something.org/full/path',
            true,
            newShortId, // will cause duplicate key error
        );

        const res = await request(app.getHttpServer())
            .put('/links/' + testLink.id)
            .send({
                fullUrl: newFullUrl,
                isPermanent: newIsPermanent,
                shortId: newShortId,
            });

        expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        expect(res.body.message).toContain('already exists');
    });

    it('/links/:id (PUT) does not exist', async () => {
        return await request(app.getHttpServer())
            .put('/links/123123123')
            .send({
                fullUrl: 'https://something.org/new-path',
                isPermanent: false,
                shortId: '1234567',
            })
            .expect(HttpStatus.NOT_FOUND);
    });

    it('/links/:id (DELETE)', async () => {
        const testLink = await service.createLink(
            'https://something.org/full/path',
            true,
            '654321',
        );

        const res = await request(app.getHttpServer())
            .delete('/links/' + testLink.id)
            .send();

        expect(res.status).toBe(HttpStatus.OK);
        const linkDto = res.body as LinkDTO;
        const dbLink = await linkModel.findById(linkDto.id).exec();

        expect(dbLink).toBeNull();
        expect(linkDto.originalUrl).toBe(testLink.originalUrl);
        expect(linkDto.isPermanent).toBe(testLink.isPermanent);
        expect(linkDto.shortUrl).toContain(testLink.shortId);
        expect(linkDto.id).toBe(testLink.id);
        expect(linkDto.createdOn).toBe(testLink.createdOn.toJSON());
    });

    it('/links/:id (DELETE) does not exist', async () => {
        return await request(app.getHttpServer())
            .delete('/links/' + Types.ObjectId())
            .send()
            .expect(HttpStatus.NOT_FOUND);
    });

    it('/links/:id (DELETE) invalid id', async () => {
        return await request(app.getHttpServer())
            .delete('/links/123123123')
            .send()
            .expect(HttpStatus.NOT_FOUND);
    });

    it('/:id GET', async () => {
        const shortId = '654321';
        const testLink = await service.createLink(
            'https://something.org/full/path',
            true,
            shortId,
        );

        return await request(app.getHttpServer())
            .get('/' + shortId)
            .expect('Location', testLink.originalUrl)
            .expect(HttpStatus.TEMPORARY_REDIRECT);
    });

    it('/:id GET id does not exist', async () => {
        return await request(app.getHttpServer())
            .get('/1234567890')
            .expect(HttpStatus.NOT_FOUND);
    });
});
