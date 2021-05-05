"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const GamingChannel = new mongoose_1.Schema({
    _id: { type: String, required: [true, 'El id es obligatorio'] },
    name: { type: String, required: [true, 'El nombre del canal creado es obligatorio'] },
});
exports.default = mongoose_1.model('GamingChannel', GamingChannel);