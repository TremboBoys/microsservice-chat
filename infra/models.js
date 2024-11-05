import mongoose from "mongoose";

export const messagesSchema = new mongoose.Schema({
    sender: {type: String, required: true},
    receiver: {type: String, required: true},
    message: {type: String, required: true},
    dateTime: {type: Date, required: true},
    read: {type: Boolean, required: true}
});

export const MessagesModel = mongoose.model('Messages', messagesSchema);

