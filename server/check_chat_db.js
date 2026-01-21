const mongoose = require('mongoose');
const ChatMessage = require('./models/ChatMessage');
require('dotenv').config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const count = await ChatMessage.countDocuments();
        console.log(`Total Messages: ${count}`);

        const users = await ChatMessage.distinct("userId");
        console.log("Distinct Users:", users);

        const messages = await ChatMessage.find().limit(5);
        console.log("Sample Messages:", messages);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkData();
