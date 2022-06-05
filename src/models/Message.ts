import { Document, model, Schema, Types } from 'mongoose';
import { IRole, RoleSchema } from './Role';

export interface IMessage extends Document {
  order: number;
  messageId: string;
  roles: IRole[];
}

const MessageSchema = new Schema<IMessage>({
  messageId: String,
  order: Number,
  roles: [RoleSchema],
});

export const MessageModel = model<IMessage>('Message', MessageSchema);
