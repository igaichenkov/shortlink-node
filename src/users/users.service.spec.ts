import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { User, UserDocument, UserSchema } from './user';
import { UsersService } from './users.service';

describe('UsersService', () => {
    let service: UsersService;
    let usersModel: Model<UserDocument>;

    const USER_NAME = 'foo@bar.foo';
    const API_KEY = '123456';

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot('mongodb://localhost/shortlink-test'),
                MongooseModule.forFeature([
                    { name: User.name, schema: UserSchema },
                ]),
            ],
            providers: [UsersService],
        }).compile();

        service = module.get<UsersService>(UsersService);
        usersModel = module.get<Model<UserDocument>>(getModelToken(User.name));

        await usersModel.deleteMany();
    });

    it('should create a user', async () => {
        const user = await service.createUser(USER_NAME, [API_KEY]);
        expect(user.userName).toBe(USER_NAME);
        expect(user.id).toBeTruthy();
        expect(user.apiKeys.length).toBe(1);

        const userDb = await usersModel.findOne();
        expect(userDb).not.toBeNull();
        expect(userDb!.id).toBe(user.id);
        expect(userDb!.userName).toBe(user.userName);
        expect(userDb!.apiKeys.length).toBe(1);
        expect(userDb!.apiKeys[0]).toBe(user.apiKeys[0]);
    });

    it('should resolve a user from apiKey', async () => {
        const user = await service.createUser(USER_NAME, [API_KEY]);
        expect(user).toBeDefined();
        console.log(user.apiKeys[0]);

        const resolvedUser = await service.findUserByApiKey(API_KEY);
        expect(resolvedUser).not.toBeNull();
        expect(resolvedUser!.id).toBe(user.id);
    });
});
