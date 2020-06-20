import { Module } from '@nestjs/common';
import { LinksController } from './links.controller';
import { LinksService } from './links.service';
import { Link, LinkSchema } from './models/link';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Link.name, schema: LinkSchema }]),
    ],
    controllers: [LinksController],
    providers: [LinksService],
})
export class LinksModule {}
