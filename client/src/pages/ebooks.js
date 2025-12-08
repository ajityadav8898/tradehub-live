// /server/routes/ebooks.js
const express = require("express");
const multer = require("multer");
const Ebook = require("../models/Ebook");
const router = express.Router();
const { auth, isAdmin } = require("../middleware/authMiddleware"); // Import auth middleware

// Multer setup for memory storage (no local files)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ GET all ebooks (accessible by anyone)
router.get("/", async (req, res) => {
    try {
        const ebooks = await Ebook.find();
        res.json(ebooks);
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
});

// ✅ POST - Upload a new ebook (Admin Only, requires auth and isAdmin middleware)
router.post("/upload", auth, isAdmin, upload.single("pdf"), async (req, res) => {
    try {
        const { title, thumbnail, pdfUrl } = req.body; 

        // Important: We will not store the PDF as Base64.
        // We will assume the frontend has uploaded the PDF to a storage service and provides a URL.
        if (!title || !thumbnail || !pdfUrl) {
            return res.status(400).json({ error: "All fields (title, thumbnail URL, and PDF URL) are required!" });
        }

        const newEbook = new Ebook({
            title,
            thumbnail, 
            pdf: pdfUrl, // Store only the URL
        });
        await newEbook.save();

        console.log(`Ebook added: ${title}`);
        res.status(201).json({ message: "Ebook uploaded successfully", ebook: newEbook });
    } catch (error) {
        console.error("Error uploading ebook:", error);
        res.status(500).json({ error: "Error uploading ebook" });
    }
});

// ✅ GET - Serve thumbnail (redirect to the thumbnail URL)
router.get("/:id/thumbnail", async (req, res) => {
    try {
        const ebook = await Ebook.findById(req.params.id);
        if (!ebook) return res.status(404).json({ error: "Ebook not found" });
        res.redirect(ebook.thumbnail);
    } catch (error) {
        console.error("Error fetching thumbnail:", error);
        res.status(500).json({ error: "Error fetching thumbnail" });
    }
});

// ✅ GET - Serve PDF (redirect to the PDF URL)
router.get("/:id/pdf", async (req, res) => {
    try {
        const ebook = await Ebook.findById(req.params.id);
        if (!ebook) return res.status(404).json({ error: "Ebook not found" });
        res.redirect(ebook.pdf);
    } catch (error) {
        console.error("Error fetching PDF:", error);
        res.status(500).json({ error: "Error fetching PDF" });
    }
});

// ✅ DELETE - Remove an ebook by ID (Admin Only)
router.delete("/:id", auth, isAdmin, async (req, res) => {
    try {
        const ebook = await Ebook.findByIdAndDelete(req.params.id);
        if (!ebook) return res.status(404).json({ error: "Ebook not found" });

        console.log(`Ebook deleted: ${ebook.title}`);
        res.json({ message: "Ebook deleted successfully" });
    } catch (error) {
        console.error("Error deleting ebook:", error);
        res.status(500).json({ error: "Error deleting ebook" });
    }
});

module.exports = router;