import { Document, model, Schema } from 'mongoose';

export interface IGamingChannel extends Document {
  channelId: string;
  hasChanged: boolean;
  creator: string;
}

const GamingChannelSchema = new Schema<IGamingChannel>({
  channelId: { type: String, required: [true, 'El id es obligatorio'] },
  hasChanged: { type: Boolean },
  creator: { type: String, rquired: [true, 'El creador es obligatorio para mantener el tracking'] },
});

export const GamingChannelModel = model<IGamingChannel>('GamingChannel', GamingChannelSchema);
