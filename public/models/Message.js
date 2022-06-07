"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageModel = void 0;
const mongoose_1 = require("mongoose");
const Role_1 = require("./Role");
const MessageSchema = new mongoose_1.Schema({
    messageId: String,
    order: Number,
    isFull: Boolean,
    roles: [Role_1.RoleSchema],
});
exports.MessageModel = (0, mongoose_1.model)('Message', MessageSchema);
