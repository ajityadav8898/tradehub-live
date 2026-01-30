const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");

        const users = await User.find({}, "username email role date");
        console.log("\n--- USER LIST ---");
        if (users.length === 0) {
            console.log("No users found.");
        } else {
            users.forEach(u => {
                console.log(`- ${u.username} (${u.email}) | Role: ${u.role} | Created: ${u.date}`);
            });
        }
        console.log("-----------------");

        mongoose.disconnect();
    } catch (err) {
        console.error("❌ Error:", err);
    }
};

checkUsers();
