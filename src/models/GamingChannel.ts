import { Document, model, Schema } from 'mongoose';

export interface IGamingChannel extends Document {
  name: string;
}

const GamingChannel = new Schema({
  _id: { type: String, required: [true, 'El id es obligatorio'] },
  name: { type: String, required: [true, 'El nombre del canal creado es obligatorio'] },
});

export default model<IGamingChannel>('GamingChannel', GamingChannel);
