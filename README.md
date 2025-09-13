# Node Static Serve

A tiny static file server in Node.js. Serves files from the `public/` folder with basic content types and path traversal protection.

## Features
- Serves `public/` (directories default to `index.html`)
- Simple MIME type map (html, css, js, json, svg, png, jpg, txt)
- Streams files efficiently
- Prevents `..` path traversal

## Project structure
```
.
├─ index.js
└─ public/
   ├─ index.html
   ├─ style.css
   └─ hello.txt
```

## Run
```bash
node index.js
# Static server → http://localhost:3000
```

Open in browser:
- http://localhost:3000/
- http://localhost:3000/hello.txt

## Code (index.js preview)
```js
const http = require("http");
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");

const ROOT = path.join(__dirname, "public");
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".txt":  "text/plain; charset=utf-8"
};

const server = http.createServer(async (req, res) => {
  try {
    const urlPath = decodeURI((req.url || "/").split("?")[0]);
    let filePath = path.normalize(path.join(ROOT, urlPath));
    if (!filePath.startsWith(ROOT)) { res.statusCode = 403; return res.end("Forbidden"); }
    let stat;
    try {
      stat = await fsp.stat(filePath);
      if (stat.isDirectory()) filePath = path.join(filePath, "index.html");
    } catch {}
    await fsp.access(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.setHeader("Content-Type", TYPES[ext] || "application/octet-stream");
    fs.createReadStream(filePath).on("error", () => { res.statusCode = 500; res.end("Read error"); }).pipe(res);
  } catch {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Not found");
  }
});

server.listen(3000, () => console.log("Static server → http://localhost:3000"));
```

## package.json
```json
{
    "name": "node-static-serve",
    "version": "1.0.0",
    "description": "A simple static file server using Node.js and the 'http' and 'fs' modules.",
    "main": "index.js",
    "scripts": {"start": "node index.js"},
    "author": "Mohit Sharma",
    "license": "MIT"
}
```

## .gitignore 
```
node_modules/
npm-debug.log*
yarn-error.log*
.DS_Store
Thumbs.db
.idea/
.vscode/
```

## License
MIT
