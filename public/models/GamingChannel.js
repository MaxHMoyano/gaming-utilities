"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const GamingChannel = new mongoose_1.Schema({
    _id: { type: String, required: [true, 'El id es obligatorio'] },
    hasChanged: { type: Boolean },
    creator: { type: String, rquired: [true, 'El creador es obligatorio para mantener el tracking'] }
});
exports.default = (0, mongoose_1.model)('GamingChannel', GamingChannel);
