const express = require("express");
const Ebook = require("../models/Ebook");
const { auth, isAdmin } = require("../middleware/authMiddleware"); 

const router = express.Router();
// NOTE: Multer is removed because the frontend sends the PDF link in the JSON body,
// and no actual file is being uploaded to this endpoint anymore.

// 🚀 GET /api/ebooks - Get all ebooks (Optimized for performance)
router.get("/", async (req, res) => {
    try {
        // REMOVED .select('-pdf')
        const ebooks = await Ebook.find(); 
        res.json(ebooks);
    } catch (error) {
        console.error("Error fetching ebooks list:", error);
        res.status(500).json({ error: "Server Error during retrieval" });
    }
});

// ✅ POST /api/ebooks/upload - Upload a new ebook (Admin Only)
// FIX: Removed upload.single("file") middleware
router.post("/upload", auth, isAdmin, async (req, res) => {
    try {
        // FIX: Changed destructuring to match the frontend's JSON body: {title, thumbnail, pdf}
        const { title, thumbnail, pdf } = req.body; 

        if (!title || !thumbnail || !pdf) {
            // FIX: Updated error message to reflect expected fields
            return res.status(400).json({ error: "All fields (title, thumbnail URL, and PDF Raw Link) are required!" });
        }

        const newEbook = new Ebook({
            title,
            thumbnail, 
            pdf: pdf, // CRITICAL FIX: Saves the GitHub Raw Link string directly
        });
        await newEbook.save();

        console.log(`Ebook added: ${title}`);
        res.status(201).json({ 
            message: "Ebook uploaded successfully", 
            ebook: { _id: newEbook._id, title: newEbook.title, thumbnail: newEbook.thumbnail, pdf: newEbook.pdf } 
        });
    } catch (error) {
        console.error("Error uploading ebook:", error);
        res.status(500).json({ error: "Error uploading ebook. Check server console for details." });
    }
});

// NOTE: /api/ebooks/:id/pdf is now obsolete since the frontend links directly.
// Keeping it won't hurt, but the frontend code below bypasses it.

// ✅ DELETE /api/ebooks/:id - Remove an ebook by ID (Admin Only)
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