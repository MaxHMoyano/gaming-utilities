import { GuildMember } from 'discord.js';
import { Document, model, Schema } from 'mongoose';

export interface IGamingChannel extends Document {
  _id: string;
  hasChanged: boolean;
  creator: string;
}

const GamingChannel = new Schema({
  _id: { type: String, required: [true, 'El id es obligatorio'] },
  hasChanged: { type: Boolean },
  creator: {type: String, rquired: [true, 'El creador es obligatorio para mantener el tracking']}
});

export default model<IGamingChannel>('GamingChannel', GamingChannel);
