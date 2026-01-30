require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

const promoteUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB...");

        const usernames = ['demouser234', 'testuser234', 'Pravin585'];

        for (const username of usernames) {
            const user = await User.findOne({ username });
            if (user) {
                user.role = 'admin';
                await user.save();
                console.log(`✅ Promoted ${username} to ADMIN.`);
            } else {
                console.log(`User ${username} not found.`);
            }
        }

        mongoose.connection.close();
    } catch (error) {
        console.error("Error:", error);
    }
};

promoteUsers();
