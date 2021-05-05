import { Document, Model, model, Types, Schema, Query } from 'mongoose';

const GamingChannel = new Schema({
  _id: { type: String, required: [true, 'El id es obligatorio'] },
  name: { type: String, required: [true, 'El nombre del canal creado es obligatorio'] },
});

interface GamingChannel extends Document {
  discordId: string;
  name: string;
}

export default model<GamingChannel>('GamingChannel', GamingChannel);
