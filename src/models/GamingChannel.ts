import { Document, model, Schema } from 'mongoose';

export interface IGamingChannel extends Document {
  _id: string;
}

const GamingChannel = new Schema({
  _id: { type: String, required: [true, 'El id es obligatorio'] },
});

export default model<IGamingChannel>('GamingChannel', GamingChannel);
