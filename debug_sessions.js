const mongoose = require('mongoose');
const Session = require('./server/models/Session');
const User = require('./server/models/User');

// Connect to MongoDB
// Note: Using the connection string from typical .env or defaulting to local if not found.
// I'll assume standard local or try to read .env if possible, but hardcoding local for now as it's common.
// Better: Read from server.js logic or .env file content first? 
// I'll try to find the connection string from server.js first. 
// For now, I will use a placeholder and rely on the user having a standard setup or reading .env
// actually, I should read .env first to be safe.

require('dotenv').config({ path: './server/.env' });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected');

        const sessionCount = await Session.countDocuments();
        console.log(`Total Sessions in DB: ${sessionCount}`);

        const sessions = await Session.find().populate('userId', 'username email').limit(5);
        console.log('Sample Sessions:', JSON.stringify(sessions, null, 2));

        if (sessionCount === 0) {
            console.log("No sessions found. Try logging out and logging back in.");
        }

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

connectDB();
