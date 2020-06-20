import { Test, TestingModule } from '@nestjs/testing';
import { LinksController } from './links.controller';
import { LinksService } from './links.service';
import LinkSettings from './LinkSettings';
import { MongooseModule } from '@nestjs/mongoose';
import { Link, LinkSchema } from './models/link';

describe('Links Controller', () => {
    let controller: LinksController;
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
                LinksController,
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
});
