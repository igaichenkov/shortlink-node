import { Module } from '@nestjs/common';
import { LinksController } from './controllers/links.controller';
import { RedirectController } from './controllers/redirect.controller';
import { LinksService } from './links.service';
import { Link, LinkSchema } from './models/link';
import { MongooseModule } from '@nestjs/mongoose';
import { LinkIdGenerator } from './LinkIdGenerator';
import LinkSettings from './LinkSettings';

const settings = new LinkSettings('http://localhost:3000', 5);

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Link.name, schema: LinkSchema }]),
    ],
    controllers: [LinksController, RedirectController],
    providers: [
        LinksService,
        LinkIdGenerator,
        {
            provide: LinkSettings,
            useValue: settings,
        },
    ],
})
export class LinksModule {}
