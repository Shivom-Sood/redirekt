# redirekt

A small URL shortener built with Node.js and Express.

## Features

- Create a short link for any http or https URL
- Optional custom short codes (3-20 characters: letters, numbers, `-` or `_`)
- Redirect from the short link to the original URL
- List all shortened links
- Click count for each link
- Delete a short link you no longer need
- Invalid URLs and duplicate custom codes are rejected
- Links are saved to `urls.json`, so they survive a server restart

## Run it

```bash
npm install
npm start      # run with node
npm run dev    # run with nodemon (restarts on file changes)
```

The server runs on `http://localhost:3000`.

### Configuration

| Variable | Default | What it does |
|----------|---------|--------------|
| `PORT` | `3000` | Port the server listens on |
| `BASE_URL` | `http://localhost:<PORT>` | Address used when building short links (set this when deployed) |

```bash
PORT=8080 BASE_URL=https://sho.rt npm start
```

## Endpoints

| Method | Path | What it does |
|--------|------|--------------|
| POST | `/shorten` | Body `{ "url": "https://example.com", "customCode": "gh" }` (`customCode` is optional), returns a short URL |
| GET | `/urls` | Lists every short code with its URL and click count |
| GET | `/:shortCode` | Redirects to the original URL and adds 1 to its clicks |
| DELETE | `/:shortCode` | Deletes the short link |

## Examples

Random short code:

```bash
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.github.com"}'
```

Custom short code:

```bash
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.github.com","customCode":"gh"}'
```

Delete a short link:

```bash
curl -X DELETE http://localhost:3000/gh
```
