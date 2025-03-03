import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    text: { type: String, required: true },
    uid: { type: String, required: true },
    chatId: { type: String, required: true },
    sender: { type: String, required: true },
    id: { type: String, required: true, unique: true },
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
