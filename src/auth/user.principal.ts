import { Types } from 'mongoose';
import { User } from 'src/users/user';

export class UserPrincipal {
    public readonly id: Types.ObjectId;
    public readonly userName: string;

    constructor(user: User) {
        this.id = user.id;
        this.userName = user.userName;
    }
}
