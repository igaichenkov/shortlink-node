import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { ILink } from '../interfaces/link.interface';
import { Document } from 'mongoose';

//import { IUser } from './user';

@Schema()
export class Link extends Document implements ILink {
    @Prop({ required: true })
    originalUrl: string;

    @Prop({ required: true })
    isPermanent: boolean;

    @Prop({ required: true, unique: true })
    shortId: string;

    @Prop({ required: true, default: () => new Date() })
    createdOn: Date;
}

export const LinkSchema = SchemaFactory.createForClass(Link);
