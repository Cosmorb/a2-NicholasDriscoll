const http = require("http"),
    fs   = require("fs"),
    // IMPORTANT: you must run `npm install` in the directory for this assignment
    // to install the mime library if you're testing this on your local machine.
    // However, Glitch will install it automatically by looking in your package.json
    // file.
    path = require("path"),
    url  = require("url"),
    port = 3000;

// Use Render's port when deployed; 3000 locally.
const PORT = process.env.PORT || port;
// Absolute path to /public for safe static serving.
const PUB  = path.resolve(__dirname, "public");

let items = [];


// rewritten as it was too AI generated for my liking
// based off this: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
// and  this: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type
// and this: https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Node_server_without_framework 
const MIME_TYPES = {
    html: "text/html; charset=UTF-8",
    js: "application/javascript; charset=utf-8",
    css: "text/css; charset=utf-8",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    ico: "image/x-icon",
    svg: "image/svg+xml",
    json: "application/json; charset=utf-8",
    default: "text/plain; charset=utf-8"
};

function contentType(file) {
    const ext = file.split('.').pop().toLowerCase();
    return MIME_TYPES[ext] || MIME_TYPES.default;
}

// agian rewritten as it was too AI generated for my liking
// based off this tjis https://expressjs.com/en/4x/api.html#req.path
function cleaner(urlPath) {
    let file = urlPath === "/" ? "/index.html" : urlPath;
    file = path.normalize(file);
    const abs = path.join(PUB, file);
    if (!abs.startsWith(PUB)) return null;
    return abs;
}

// previous code was too AI generated for my liking, this was what was here previously
// based off this: https://stackoverflow.com/a/45130990
// function Blocker(urlPath) {
//     const p = urlPath === "/" ? "/index.html" : urlPath;
//     const abs = path.resolve(PUB, "." + p);
//     if (!abs.startsWith(PUB)) return null;
//     return abs;
// }



// based off this: https://stackoverflow.com/questions/19696240/proper-way-to-return-json-using-node-or-express
// as it was too AI generated for my liking
function sendJSON(res, code, obj) {
    res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(obj));
}

// Alternative way using async/await and collecting all data before resolving
async function readBody(req) {
    let data = "";
    for await (const chunk of req) {
        data += chunk;
    }
    return data;
}

// based off this: https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework
// and this: https://nodejs.org/api/http.html 
// and this: https://stackoverflow.com/a/12006679
// based off this: https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework
// and https://stackoverflow.com/a/12006679
// curent
const Server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, "http://localhost"); 
  if (pathname === "/api/items" && req.method === "GET") {
    return sendJSON(res, 200, items);
  }
  if (pathname === "/api/items" && req.method === "POST") {
    const raw = await readBody(req);
    let data = {};
    try { data = JSON.parse(raw); } catch {}
    const { name, email, message } = data;
    if (!name || !email || !message) {
      return sendJSON(res, 400, { error: "Missing field(s)" });
    }
    const row = {
      id: "id-" + Math.random().toString(36).slice(2, 9),
      name, email, message,
      createdAt: new Date().toISOString()
    };
    items.unshift(row);
    return sendJSON(res, 201, row);
  }
  if (pathname.startsWith("/api/items/") && req.method === "DELETE") {
    const rid = pathname.split("/").pop();
    const before = items.length;
    items = items.filter(r => r.id !== rid);
    return sendJSON(res, 200, { removed: before - items.length });
  }
  const filePath = cleaner(pathname);
  if (!filePath) return send(res, 403, "Forbidden", { "Content-Type": "text/plain" });
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      return send(res, 404, "Not Found", { "Content-Type": "text/plain" });
    }
    res.writeHead(200, { "Content-Type": contentType(filePath) });
    const stream = fs.createReadStream(filePath);
    stream.on("error", () => {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Server error");
    });
    stream.pipe(res);
  });
});


Server.listen(PORT);