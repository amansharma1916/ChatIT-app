import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import User from './models/User.js';
import Message from './models/Message.js';
import Friend from './models/Friend.js';
import Admin from './models/Admin.js';


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MongoDB_URI = "mongodb+srv://amansharmayt19:nvrQpvCAPAWSEh9C@scripterx.7nhap.mongodb.net/ChatIT?retryWrites=true&w=majority&appName=ScripterX";

// Connect to MongoDB
mongoose.connect(MongoDB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

/* ────────────────────────────────────────────
   ✅ USER ROUTES (Register, Login, Get Users)
   ──────────────────────────────────────────── */

// 📌 Register a new user
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) return res.status(400).json({ message: "All fields are required" });

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists" });

        // const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password,
            userstatus : "pending",
            uid: uuidv4(),
            createdAt: new Date(),
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully", user: newUser });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 📌 Login a user
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "All fields are required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: "Invalid password" });

        const token = jwt.sign({ uid: user.uid }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(200).json({ message: "Login successful", token, user });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 📌 Admin Login


// Admin Login Route
app.get("/adminlogin", async (req, res) => {
    try {
      const { username, password } = req.query;
  
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
  
      const admin = await Admin.findOne({ username, password });
  
      if (admin) {
        console.log("Admin found:", admin);
        res.json([admin]); // Return admin in an array
      } else {
        res.json([]); // Empty array if admin not found
      }
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

// 📌 Get all users
app.get('/users', async (req, res) => {
    try {
        const { email, password } = req.query;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email, password});
        // const approveduser = await User.findOne({userstatus : "approved"});
        

        if (user) {
            if (user.userstatus === "approved") {
                res.json([user]); // Return user in an array
            } else {
                res.json({ message: "Your account is not approved yet! Contact Admin .. " });
            }
        } else {
            res.json([]); // Empty array if user not found
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


/* ────────────────────────────────────────────
   ✅ MESSAGE ROUTES (Send, Get Messages)
   ──────────────────────────────────────────── */

// 📌 Send a message
app.post('/sendMessage', async (req, res) => {
    try {
        const { text, uid, chatId, sender } = req.body;
        if (!text || !uid || !chatId || !sender) return res.status(400).json({ message: "All fields are required" });

        const newMessage = new Message({
            text,
            uid,
            chatId,
            sender,
            id: uuidv4(),
            timestamp: new Date(),
        });

        await newMessage.save();
        res.status(201).json({ message: "Message sent", messageData: newMessage });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

app.post('/deleteMessage', async (req, res) => {
    try {
        const { messageId } = req.body;

        const deletedMessage = await Message.findOneAndDelete({ id: messageId });

        if (!deletedMessage) {
            return res.status(404).json({ message: 'Message not found' });
        }

        res.status(200).json({ message: 'Message deleted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

app.post('/removeFriend', async (req, res) => {
    try {
        const { uid } = req.body;

        if (!uid) {
            return res.status(400).json({ message: 'Friend UID is required' });
        }

        const deletedFriend = await Friend.findOneAndDelete({ uid });

        if (!deletedFriend) {
            return res.status(404).json({ message: 'Friend not found' });
        }

        res.status(200).json({ message: 'Friend removed successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});



// 📌 Get messages for a chat
app.get('/getMessages', async (req, res) => {
    try {
        const { chatId } = req.query;

        if (!chatId) {
            return res.status(400).json({ message: 'chatId is required' });
        }

        const messages = await Message.find({ chatId });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


/* ────────────────────────────────────────────
   ✅ FRIEND ROUTES (Add, Get Friends)
   ──────────────────────────────────────────── */

// 📌 Add a friend
app.post('/addFriend', async (req, res) => {
    try {
        const { uid, username, email, user } = req.body;
        if (!uid || !username || !email || !user) return res.status(400).json({ message: "All fields are required" });

        const existingFriendship = await Friend.findOne({ uid, user });
        if (existingFriendship) return res.status(400).json({ message: "Already friends" });

        const newFriend = new Friend({ uid, username, email, user });

        await newFriend.save();
        res.status(201).json({ message: "Friend added successfully", friend: newFriend });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 📌 Get friends of a user
app.get('/friends/:user', async (req, res) => {
    try {
        const { user } = req.params;
        const friends = await Friend.find({ user });
        res.status(200).json(friends);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

app.get('/dataFile', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

app.get('/friendsFile', async (req, res) => {
    try {
        const friends = await Friend.find();
        res.json(friends);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

app.post("/removeuser", async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ message: ' username is required' });
        }

        const deleteduser = await User.findOneAndDelete({ username });

        if (!deleteduser) {
            return res.status(404).json({ message: 'Friend not found' });
        }

        res.status(200).json({ message: 'Friend removed successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

app.post("/approveuser", async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ message: ' username is required' });
        }

        const updateduser = await User.findOneAndUpdate({ username }, { userstatus: "approved" }, { new: true });

        if (!updateduser) {
            return res.status(404).json({ message: 'Friend not found' });
        }

        res.status(200).json({ message: 'Friend removed successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

/* ────────────────────────────────────────────
   ✅ SERVER SETUP
   ──────────────────────────────────────────── */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
