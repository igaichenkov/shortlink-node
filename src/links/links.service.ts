import { Injectable } from '@nestjs/common';
import { Link } from './interfaces/link.interface';

@Injectable()
export class LinksService {
  getUserLinks(userId: string): Link[] {
    return [
      {
        id: '1',
        shortUrl: 'http://localhost:3000/absdfuxs34sdf',
        fullUrl: 'https://google.com/',
      },
    ];
  }
}
