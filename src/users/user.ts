import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class User {
    id: Types.ObjectId;

    @Prop({ required: true })
    userName: string;

    @Prop()
    apiKeys: string[];
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
