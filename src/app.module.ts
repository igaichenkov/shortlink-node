import { Module } from '@nestjs/common';
import { LinksModule } from './links/links.module';

@Module({
  imports: [LinksModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
