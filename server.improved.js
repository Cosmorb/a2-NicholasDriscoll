const http = require("http"),
    fs   = require("fs"),
    // IMPORTANT: you must run `npm install` in the directory for this assignment
    // to install the mime library if you"re testing this on your local machine.
    // However, Glitch will install it automatically by looking in your package.json
    // file.
    // mime = require("mime"), // (unused now)
    // dir  = "public/",       // (unused now)
    path = require("path"),
    url  = require("url"),
    port = 3000;

// Use Render's port when deployed; 3000 locally.
const PORT = process.env.PORT || port;
// Absolute path to /public for safe static serving.
const PUB  = path.resolve(__dirname, "public");

let items = [];

// helpers funtiions
const id  = () => "id-" + Math.random().toString(36).slice(2, 9);
const iso = () => new Date().toISOString();

// AI copilto did auto genrate contenetType after creating the first line, just wanted this noted, sorry
const contentType = (file) => {
    if (file.endsWith(".html")) return "text/html; charset=utf-8";
    if (file.endsWith(".css"))  return "text/css; charset=utf-8";
    if (file.endsWith(".js"))   return "application/javascript; charset=utf-8";
    if (file.endsWith(".json")) return "application/json; charset=utf-8";
    if (file.endsWith(".svg"))  return "image/svg+xml";
    if (file.endsWith(".png"))  return "image/png";
    if (file.endsWith(".jpg") || file.endsWith(".jpeg")) return "image/jpeg";
    if (file.endsWith(".ico"))  return "image/x-icon";
    return "text/plain; charset=utf-8";
};

// stole this from here, basiclay stops reqest password and other stuff
function Blocker(urlPath) {
    const p = urlPath === "/" ? "/index.html" : urlPath;
    const abs = path.resolve(PUB, "." + p);
    if (!abs.startsWith(PUB)) return null;
    return abs;
}

// simple helpler for json bases from here : https://stackoverflow.com/questions/19696240/proper-way-to-return-json-using-node-or-express
function send(res, code, body, headers = {}) {
    res.writeHead(code, headers);
    res.end(body);
}

function sendJSON(res, code, obj) {
    // remove leading space in content type
    send(res, code, JSON.stringify(obj), { "Content-Type": "application/json; charset=utf-8" });
}

// THIS was created with the help of WEBSTORM AI,
function readit(req) {
    return new Promise((resolve) => {
        let data = "";
        req.on("data", (chunk) => (data += chunk));
        req.on("end", () => resolve(data));
    });
}

// Based off this, wbstom ai did help fill out https://stackoverflow.com/questions/49885609/http-createserver-onrequest-async-await-functions
const server = http.createServer(async (req, res) => {
    // Avoid shadowing the imported 'url' module by using 'u'
    const u = new URL(req.url, `http://${req.headers.host}`);
    const pathName = u.pathname;

    // API, based of this : https://javascript.plainenglish.io/building-a-rest-api-with-vanilla-node-js-without-any-frameworks-25e9b46c9671
    if (pathName === "/api/items" && req.method === "GET") {
        return sendJSON(res, 200, items);
    }

    if (pathName === "/api/items" && req.method === "POST") {
        const raw = await readit(req);
        let data = {};
        try { data = JSON.parse(raw || "{}"); } catch {}
        const { name = "", email = "", message = "" } = data;
        // verifies i f feild are filled
        if (!name || !email || !message) {
            return sendJSON(res, 400, { error: "YOU FORFOT A FIELD, FILL IT OUT" });
        }
        //
        const createdAt = iso();
        const row = { id: id(), name, email, message, createdAt: iso() };
        items.unshift(row);
        return sendJSON(res, 201, row);
    }

    if (pathName.startsWith("/api/items/") && req.method === "DELETE") {
        const rid = pathName.split("/").pop();
        const nBefore = items.length;
        items = items.filter((r) => r.id !== rid);
        return sendJSON(res, 200, { removed: nBefore - items.length });
    }

    // this was generater with the help of AI WEBSTIRM
    const filePath = Blocker(pathName);
    if (!filePath) return send(res, 403, "Forbidden");

    fs.readFile(filePath, (err, buf) => {
        if (err) return send(res, 404, "Not Found");
        send(res, 200, buf, { "Content-Type": contentType(filePath) });
    });
});

// starte the given post
server.listen(PORT);
