import { Injectable, ValidationError } from '@nestjs/common';
import { Link } from './interfaces/link.interface';
import { nanoid } from 'nanoid';
import { isUri } from 'valid-url';

@Injectable()
export class LinksService {
  private links: Link[] = [
    {
      id: nanoid(),
      shortUrl: 'http://localhost:3000/absdfuxs34sdf',
      fullUrl: 'https://google.com/',
      userId: '1',
    },
  ];

  private readonly baseUrl: string;

  constructor(private settings: LinkSettings) {}

  getUserLinks(userId: string): Link[] {
    return this.links.filter(l => l.userId == userId);
  }

  createLink(userId: string, url: string) {
    if (!userId)
      throw new Error('[LinksService]: userId parameter must be provided');

    if (!isUri(url))
      throw new Error('[LinksService] url parameter must be a valid url');

    const newUrlId = nanoid();

    const newLink: Link = {
      userId: userId,
      fullUrl: url,
      id: newUrlId,
      shortUrl: this.baseUrl + newUrlId,
    };

    this.links.push(newLink);
  }
}

export class LinkSettings {
  public readonly baseUrl: string;

  constructor(baseUrl: string) {
    if (!isUri(baseUrl))
      throw new Error(`[LinkSettings] ${baseUrl} is not a valid url`);

    this.baseUrl = baseUrl;

    if (!baseUrl.endsWith('/')) this.baseUrl += '/';
  }
}
