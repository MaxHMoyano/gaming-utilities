"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamingChannelModel = void 0;
const mongoose_1 = require("mongoose");
const GamingChannelSchema = new mongoose_1.Schema({
    channelId: { type: String, required: [true, 'El id es obligatorio'] },
    hasChanged: { type: Boolean },
    creator: { type: String, rquired: [true, 'El creador es obligatorio para mantener el tracking'] },
});
exports.GamingChannelModel = (0, mongoose_1.model)('GamingChannel', GamingChannelSchema);
