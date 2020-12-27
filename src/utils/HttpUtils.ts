import { FastifyReply } from 'fastify';

export default class HttpUtils {
    static AddLocationHeader(res: FastifyReply, url: string): void {
        res.header('Location', url);
    }
}
