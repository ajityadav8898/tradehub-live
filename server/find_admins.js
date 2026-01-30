require('dotenv').config({ path: './.env' }); // Load .env from current dir
const mongoose = require('mongoose');
const User = require('./models/User');

const checkAdmins = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB...");

        const admins = await User.find({ role: 'admin' });

        if (admins.length === 0) {
            console.log("No ADMIN users found!");
            // List all users to see who is available
            const allUsers = await User.find({}, 'username email role');
            console.log("Here are the existing users:");
            console.table(allUsers.map(u => ({ username: u.username, role: u.role, _id: u._id })));
        } else {
            console.log("Found ADMIN users:");
            console.table(admins.map(u => ({ username: u.username, role: u.role })));
        }

        mongoose.connection.close();
    } catch (error) {
        console.error("Error:", error);
    }
};

checkAdmins();
