import mongoose from 'mongoose';

const friendSchema = new mongoose.Schema({
    uid: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    user: { type: String, required: true },  // Assuming the user is a string (like "Aman Sharma")
});

const Friend = mongoose.model('Friend', friendSchema);

export default Friend;
