import { Response } from 'express';

export default class HttpUtils {
    static AddLocationHeader(res: Response, url: string): void {
        res.header('Location', url);
    }
}
