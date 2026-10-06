const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;

app.use(express.json());

const DB_FILE = path.join(__dirname, "urls.json");

function loadUrls() {
    if (!fs.existsSync(DB_FILE)) return {};
    const data = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));

    // older entries were saved as plain strings; convert them to { url, clicks }
    for (const code in data) {
        if (typeof data[code] === "string") {
            data[code] = { url: data[code], clicks: 0 };
        }
    }
    return data;
}

function saveUrls(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// in-memory storage, seeded from disk on startup
const urlDatabase = loadUrls();

function generateShortCode() {
    let code;
    do {
        code = Math.random().toString(36).substring(2, 8);
    } while (urlDatabase[code]);
    return code;
}

// Create a short URL
app.post("/shorten", (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ success: false, message: "URL is required" });
    }

    const shortCode = generateShortCode();
    urlDatabase[shortCode] = { url, clicks: 0 };
    saveUrls(urlDatabase);

    res.json({ success: true, shortUrl: `http://localhost:${PORT}/${shortCode}` });
});

// List all shortened URLs
app.get("/urls", (req, res) => {
    res.json({ success: true, urls: urlDatabase });
});

// Redirect from short code to original URL
app.get("/:shortCode", (req, res) => {
    const { shortCode } = req.params;
    const entry = urlDatabase[shortCode];

    if (!entry) {
        return res.status(404).json({ success: false, message: "Short URL not found" });
    }

    entry.clicks++;
    saveUrls(urlDatabase);

    res.redirect(entry.url);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

//update 
//update 2 