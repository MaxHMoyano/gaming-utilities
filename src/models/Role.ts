import { model, Schema, Types } from 'mongoose';

export interface IRole extends Types.Subdocument {
  roleId: string;
  name: string;
  order: number;
  emoji: string;
  messageId?: string;
}

export const RoleSchema = new Schema<IRole>({
  roleId: { type: String, required: [true, 'El id es obligatorio'] },
  name: { type: String, required: [true, 'El nombre del rol creado es obligatorio'] },
  order: { type: Number },
  emoji: { type: String, required: [true, 'El emoji del rol creado es obligatorio'] },
  messageId: { type: String },
});

export const RoleModel = model<IRole>('Role', RoleSchema);
