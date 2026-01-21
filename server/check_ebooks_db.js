const mongoose = require('mongoose');
require('dotenv').config();

// Define minimal schema to avoid loading full model if path is tricky
const ebookSchema = new mongoose.Schema({}, { strict: false });
const Ebook = mongoose.model('Ebook', ebookSchema);

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const count = await Ebook.countDocuments();
        console.log(`TOTAL_EBOOKS: ${count}`);

        if (count > 0) {
            const sample = await Ebook.findOne();
            console.log("SAMPLE_EBOOK:", JSON.stringify(sample, null, 2));
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkData();
