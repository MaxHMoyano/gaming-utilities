import { Document, model, Schema } from 'mongoose';

export interface IRol extends Document {
  name: string;
  displayName: string;
  icon: string;
}

const Rol = new Schema({
  _id: { type: String, required: [true, 'El id es obligatorio'] },
  name: { type: String, required: [true, 'El nombre del rol creado es obligatorio'] },
  displayName: { type: String, required: [true, 'El nombre del rol creado es obligatorio'] },
  icon: { type: String, required: [true, 'El icono del rol es obligatorio'] },
});

export default model<IRol>('Roles', Rol);
