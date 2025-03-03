import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
    username: String,
    password: Number
});

const Admin = mongoose.model('Admin', AdminSchema);

export default Admin;
