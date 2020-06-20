import { Module } from '@nestjs/common';
import { LinksModule } from './links/links.module';
import { MongooseModule } from '@nestjs/mongoose';
import LinkSettings from './links/LinkSettings';

const settings = new LinkSettings('http://localhost:3000', 5);

@Module({
    imports: [
        LinksModule,
        MongooseModule.forRoot('mongodb://localhost/shortlink'),
    ],
    controllers: [],
    providers: [
        {
            provide: LinkSettings,
            useValue: settings,
        },
    ],
})
export class AppModule {}
