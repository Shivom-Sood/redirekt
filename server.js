const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

// in-memory storage: shortCode -> original URL
const urlDatabase = {};

// Create a short URL
app.post("/shorten", (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ success: false, message: "URL is required" });
    }

    const shortCode = Math.random().toString(36).substring(2, 8);
    urlDatabase[shortCode] = url;

    res.json({ success: true, shortUrl: `http://localhost:${PORT}/${shortCode}` });
});

// Redirect from short code to original URL
app.get("/:shortCode", (req, res) => {
    const { shortCode } = req.params;
    const originalUrl = urlDatabase[shortCode];

    if (!originalUrl) {
        return res.status(404).json({ success: false, message: "Short URL not found" });
    }

    res.redirect(originalUrl);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});