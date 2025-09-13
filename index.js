// Simple static file server (zero deps)
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

    // prevent path traversal
    if (!filePath.startsWith(ROOT)) {
      res.statusCode = 403;
      return res.end("Forbidden");
    }

    // if directory → serve index.html
    let stat;
    try {
      stat = await fsp.stat(filePath);
      if (stat.isDirectory()) filePath = path.join(filePath, "index.html");
    } catch {
      // fall through to 404
    }

    // stream file
    await fsp.access(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.setHeader("Content-Type", TYPES[ext] || "application/octet-stream");
    fs.createReadStream(filePath)
      .on("error", () => { res.statusCode = 500; res.end("Read error"); })
      .pipe(res);
  } catch {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Not found");
  }
});

server.listen(3000, () => {
  console.log("Static server → http://localhost:3000");
});
