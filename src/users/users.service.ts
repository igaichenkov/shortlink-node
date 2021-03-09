import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) {}

    public async findUserByApiKey(apiKey: string): Promise<User | null> {
        const apiKeyHash = await this.hashString(apiKey);
        return await this.userModel.findOne({ apiKeys: apiKeyHash }).exec();
    }

    public async createUser(
        userName: string,
        apiKeys: string[],
    ): Promise<User> {
        const apiKeyHashes = await Promise.all(
            apiKeys.map(async key => await this.hashString(key)),
        );
        return await this.userModel.create({ userName, apiKeys: apiKeyHashes });
    }

    private async hashString(value: string): Promise<string> {
        return await argon2.hash(value);
    }
}
