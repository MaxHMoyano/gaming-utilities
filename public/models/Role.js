"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleModel = exports.RoleSchema = void 0;
const mongoose_1 = require("mongoose");
exports.RoleSchema = new mongoose_1.Schema({
    roleId: { type: String, required: [true, 'El id es obligatorio'] },
    name: { type: String, required: [true, 'El nombre del rol creado es obligatorio'] },
    order: { type: Number, required: [true, 'El order del rol creado es obligatorio'] },
    emoji: { type: String, required: [true, 'El emoji del rol creado es obligatorio'] },
    messageId: { type: String },
});
exports.RoleModel = (0, mongoose_1.model)('Role', exports.RoleSchema);
