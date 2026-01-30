const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    date: { type: Date, default: Date.now },
    virtualBalance: { type: Number, default: 1000000 }, // 10 Lakh Virtual Cash
});

// Method to compare password (CRITICAL FIX: This MUST be present for login)
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// FIX: Use module.exports = mongoose.models.User || mongoose.model('User', userSchema);
// This checks if the model is already compiled and prevents errors in environments
// that cache or reload files multiple times.
module.exports = mongoose.models.User || mongoose.model("User", userSchema);