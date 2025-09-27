// References:
// https://expressjs.com/en/starter/hello-world.html
// https://github.com/expressjs/session
// https://mongoosejs.com/docs/guide.html
// https://github.com/dcodeIO/bcrypt.js
// https://github.com/motdotla/dotenv#readme
// https://nodejs.org/api/esm.html#esm_no_filename_or_dirname
// https://expressjs.com/en/starter/static-files.html
// https://expressjs.com/en/guide/writing-middleware.html
// https://expressjs.com/en/guide/routing.html#route-handlers
// https://expressjs.com/en/api.html#express.json
// https://expressjs.com/en/api.html#res.sendFile
// https://www.npmjs.com/package/helmet
// https://www.npmjs.com/package/morgan
// https://www.npmjs.com/package/connect-mongo

import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import MongoStore from "connect-mongo";
import morgan from "morgan";

dotenv.config();

// ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App
const app = express();
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === "production";

// ----- REQUIRED ENVS -----
if (!process.env.MONGO_URI) {
  console.error("Missing MONGO_URI");
  process.exit(1);
}
if (!process.env.SESSION_SECRET) {
  console.warn("Missing SESSION_SECRET (OK for local dev, NOT for prod)");
}

// ----- DB -----
try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");
} catch (err) {
  console.error("Mongo error:", err);
  process.exit(1);
}

// ----- Schemas -----
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true, trim: true },
  passwordHash: { type: String, required: true }
});
const User = mongoose.model("User", UserSchema);

const ItemSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, trim: true },
  message:    { type: String, required: true },
  // A2-style fields
  priority:   { type: String, enum: ["Low","Mid","High"], default: "Low" },
  responseBy: { type: Date }, // derived
  createdAt:  { type: Date, default: Date.now },
  updatedAt:  { type: Date }
});
ItemSchema.pre("save", function(next){ this.updatedAt = Date.now(); next(); });
ItemSchema.pre(["updateOne","findOneAndUpdate"], function(next){ this.set({ updatedAt: Date.now() }); next(); });
const Item = mongoose.model("Item", ItemSchema);

// ----- Helpers -----
function deriveResponseBy(priority = "Low", createdAt = new Date()) {
  const days = priority === "High" ? 1 : priority === "Mid" ? 3 : 7;
  return new Date(createdAt.getTime() + days * 86400000);
}

// ----- Middleware -----
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

if (IS_PROD) {
  // IMPORTANT for Render so secure cookies work
  app.set("trust proxy", 1);
}

app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    touchAfter: 24 * 3600
  }),
  cookie: {
    secure: IS_PROD,      // true on Render (HTTPS), false locally
    httpOnly: true,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000
  }
}));

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: "Authentication required" });
  next();
}

// ----- Routes -----
// Protect storage page
app.get("/storage.html", (req, res) => {
  if (!req.session.userId) return res.redirect("/login.html");
  res.sendFile(path.join(__dirname, "public", "storage.html"));
});

// Static files (index disabled because you control root route below)
app.use(express.static(path.join(__dirname, "public"), { index: false }));

// Auth
app.post("/auth/login", async (req, res) => {
  try {
    const { username = "", password = "" } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: "Username and password are required" });

    let user = await User.findOne({ username });
    if (!user) {
      const passwordHash = await bcrypt.hash(password, 10);
      user = await User.create({ username, passwordHash });
      req.session.userId = user._id.toString();
      return res.json({ ok: true, newAccount: true, message: "New account created", user: { id: user._id, username } });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Incorrect password" });

    req.session.userId = user._id.toString();
    res.json({ ok: true, newAccount: false, message: "Login successful", user: { id: user._id, username } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

app.post("/auth/register", async (req, res) => {
  try {
    const { username = "", password = "" } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: "Username and password are required" });

    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ error: "Username already taken" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash });
    req.session.userId = user._id.toString();
    res.json({ ok: true, newAccount: true, message: "Account created", user: { id: user._id, username } });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

app.post("/auth/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ error: "Could not log out" });
    }
    res.json({ ok: true, message: "Logged out" });
  });
});

// Items API (user-scoped)
app.get("/api/items", requireAuth, async (req, res) => {
  try {
    const items = await Item.find({ userId: req.session.userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("Fetch items error:", err);
    res.status(500).json({ error: "Error fetching items" });
  }
});

app.post("/api/items", requireAuth, async (req, res) => {
  try {
    const { name = "", email = "", message = "", priority = "Low" } = req.body || {};
    if (!name || !email || !message) return res.status(400).json({ error: "Name, email, and message are required" });

    const createdAt = new Date();
    const responseBy = deriveResponseBy(priority, createdAt);

    const doc = await Item.create({
      userId: req.session.userId,
      name, email, message,
      priority,
      responseBy,
      createdAt
    });
    res.status(201).json(doc);
  } catch (err) {
    console.error("Create item error:", err);
    res.status(500).json({ error: "Error creating item" });
  }
});

app.put("/api/items/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, message, priority } = req.body || {};

    const existing = await Item.findOne({ _id: id, userId: req.session.userId });
    if (!existing) return res.status(404).json({ error: "Item not found or access denied" });

    const patch = {};
    if (name != null && name !== "") patch.name = name;
    if (email != null && email !== "") patch.email = email;
    if (message != null && message !== "") patch.message = message;
    if (priority != null && priority !== "") patch.priority = priority;

    if (patch.priority) {
      patch.responseBy = deriveResponseBy(patch.priority, existing.createdAt);
    }

    const doc = await Item.findOneAndUpdate(
      { _id: id, userId: req.session.userId },
      { $set: patch },
      { new: true }
    );

    res.json(doc);
  } catch (err) {
    console.error("Update item error:", err);
    res.status(500).json({ error: "Error updating item" });
  }
});

app.delete("/api/items/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Item.deleteOne({ _id: id, userId: req.session.userId });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Item not found or access denied" });
    res.json({ success: true, removed: result.deletedCount });
  } catch (err) {
    console.error("Delete item error:", err);
    res.status(500).json({ error: "Error deleting item" });
  }
});

// Pages
app.get("/", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/login", (_req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/login.html", (_req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));

// Optional debug route (remove in prod)
app.get("/whoami", (req, res) => res.json({ userId: req.session.userId || null }));

// Errors
app.use((req, res) => res.status(404).json({ error: "Route not found" }));
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong" });
});

// Start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
