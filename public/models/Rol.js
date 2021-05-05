"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Rol = new mongoose_1.Schema({
    _id: { type: String, required: [true, 'El id es obligatorio'] },
    name: { type: String, required: [true, 'El nombre del rol creado es obligatorio'] },
    displayName: { type: String, required: [true, 'El nombre del rol creado es obligatorio'] },
    icon: { type: String, required: [true, 'El icono del rol es obligatorio'] },
});
exports.default = mongoose_1.model('Roles', Rol);
