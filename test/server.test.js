const { test, before, after } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

// use a throwaway database so tests never touch the real urls.json
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "redirekt-"));
process.env.DB_FILE = path.join(tmpDir, "urls.json");
const app = require("../server");

let server;
let baseUrl;

before(async () => {
    server = app.listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    baseUrl = `http://localhost:${server.address().port}`;
});

after(() => {
    server.close();
    fs.rmSync(tmpDir, { recursive: true, force: true });
});

function shorten(body) {
    return fetch(`${baseUrl}/shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
}

test("creates a short link with a random code", async () => {
    const res = await shorten({ url: "https://example.com" });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.match(data.shortUrl, /\/[a-z0-9]+$/);
});

test("rejects invalid URLs", async () => {
    const res = await shorten({ url: "not a url" });
    assert.strictEqual(res.status, 400);
});

test("rejects URLs that are too long", async () => {
    const res = await shorten({ url: "https://example.com/" + "a".repeat(2048) });
    assert.strictEqual(res.status, 400);
});

test("rejects reserved and duplicate custom codes", async () => {
    assert.strictEqual((await shorten({ url: "https://example.com", customCode: "stats" })).status, 400);
    assert.strictEqual((await shorten({ url: "https://example.com", customCode: "dupe" })).status, 200);
    assert.strictEqual((await shorten({ url: "https://example.com", customCode: "dupe" })).status, 409);
});

test("redirects and counts clicks", async () => {
    await shorten({ url: "https://example.com/page", customCode: "clicky" });

    const res = await fetch(`${baseUrl}/clicky`, { redirect: "manual" });
    assert.strictEqual(res.status, 302);
    assert.strictEqual(res.headers.get("location"), "https://example.com/page");

    const stats = await (await fetch(`${baseUrl}/stats/clicky`)).json();
    assert.strictEqual(stats.clicks, 1);
    assert.ok(stats.createdAt);
});

test("deletes a short link", async () => {
    await shorten({ url: "https://example.com", customCode: "gone" });
    assert.strictEqual((await fetch(`${baseUrl}/gone`, { method: "DELETE" })).status, 200);
    assert.strictEqual((await fetch(`${baseUrl}/stats/gone`)).status, 404);
});

test("returns JSON for malformed request bodies", async () => {
    const res = await fetch(`${baseUrl}/shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{bad json"
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual((await res.json()).message, "Request body must be valid JSON");
});
