const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;

app.use(express.json());

const DB_FILE = path.join(__dirname, "urls.json");

function loadUrls() {
    if (!fs.existsSync(DB_FILE)) return {};
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function saveUrls(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// in-memory storage, seeded from disk on startup
const urlDatabase = loadUrls();

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

// List all shortened URLs
app.get("/urls", (req, res) => {
    res.json({ success: true, urls: urlDatabase });
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