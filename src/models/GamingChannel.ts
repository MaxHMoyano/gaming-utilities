import { Document, model, Schema } from 'mongoose';

export interface IGamingChannel extends Document {
  _id: string;
  hasChanged: boolean;
}

const GamingChannel = new Schema({
  _id: { type: String, required: [true, 'El id es obligatorio'] },
  hasChanged: { type: Boolean },
});

export default model<IGamingChannel>('GamingChannel', GamingChannel);
