const mongoose = require("mongoose");

const ebookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  thumbnail: { type: String, required: true }, // URL for the thumbnail image
  pdf: { type: String, required: true },       // URL for the PDF file (CRITICAL for fast database queries)
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Ebook", ebookSchema);