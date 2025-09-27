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

// basic path configuration
const FileName = fileURLToPath(import.meta.url);
const DirecteoryName = path.dirname(FileName);

const Aplication = express();
const Port = process.env.PORT || 3000;

if (!process.env.MONGO_URI) {
  console.error("Missing MONGO_URI env var");
  process.exit(1);
}
if (!process.env.SESSION_SECRET) {
  console.warn("Missing SESSION_SECRET; using default is insecure in production.");
}



try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");
} catch (err) {
  console.error("MongoDB connection error:", err);
  process.exit(1);
}

const UserSchematic = new mongoose.Schema({
  username: { type: String, unique: true, required: true, trim: true },
  passwordHash: { type: String, required: true }
});
const User = mongoose.model("User", UserSchematic);

const ItemSchematic = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, trim: true },
  message:   { type: String, required: true },

  // NEW: A2-style fields
  priority:  { type: String, enum: ["Low","Mid","High"], default: "Low" },
  responseBy:{ type: Date },   // derived from createdAt + priority

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});


ItemSchematic.pre("save", function(next) { this.updatedAt = Date.now(); next(); });
ItemSchematic.pre(["updateOne","findOneAndUpdate"], function(next) { this.set({ updatedAt: Date.now() }); next(); });

const Item = mongoose.model("Item", ItemSchematic);

Aplication.use(helmet());
Aplication.use(express.json());

Aplication.use(morgan("dev"));

if (process.env.NODE_ENV === "production") {
  Aplication.set("trust proxy", 1);
}

// sessions 
Aplication.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    touchAfter: 24 * 3600
  }),
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000
  }
}));

function Authneticaor(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: "Authentication required. Please log in." });
  next();
}

function deriveResponseBy(priority = "Low", createdAt = new Date()) {
  const days = priority === "High" ? 1 : priority === "Mid" ? 3 : 7;
  return new Date(new Date(createdAt).getTime() + days * 86400000);
}

Aplication.get("/storage.html", (req, res) => {
  if (!req.session.userId) return res.redirect("/login.html");
  res.sendFile(path.join(DirecteoryName, "public", "storage.html"));
});

Aplication.use(express.static(path.join(DirecteoryName, "public"), { index: false }));

// auth routes
Aplication.post("/auth/login", async (req, res) => {
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

Aplication.post("/auth/register", async (req, res) => {
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

Aplication.post("/auth/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ error: "Could not log out" });
    }
    res.json({ ok: true, message: "Logged out" });
  });
});

// items API 
Aplication.get("/api/items", Authneticaor, async (req, res) => {
  try {
    const items = await Item.find({ userId: req.session.userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("Fetch items error:", err);
    res.status(500).json({ error: "Error fetching items" });
  }
});

Aplication.post("/api/items", Authneticaor, async (req, res) => {
  try {
    const { name = "", email = "", message = "", priority = "Low" } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required" });
    }
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

Aplication.put("/api/items/:id", Authneticaor, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, message, priority } = req.body || {};

    // Load existing to know createdAt/priority when recomputing
    const existing = await Item.findOne({ _id: id, userId: req.session.userId });
    if (!existing) return res.status(404).json({ error: "Item not found or access denied" });

    const patch = {};
    if (name != null && name !== "") patch.name = name;
    if (email != null && email !== "") patch.email = email;
    if (message != null && message !== "") patch.message = message;
    if (priority != null && priority !== "") patch.priority = priority;

    // Recompute responseBy if priority changed
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


Aplication.delete("/api/items/:id", Authneticaor, async (req, res) => {
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

// pages
Aplication.get("/", (_req, res) => {
  res.sendFile(path.join(DirecteoryName, "public", "index.html"));
});
Aplication.get("/login", (_req, res) => {
  res.sendFile(path.join(DirecteoryName, "public", "login.html"));
});
Aplication.get("/login.html", (_req, res) => {
  res.sendFile(path.join(DirecteoryName, "public", "login.html"));
});

// errors
Aplication.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});
Aplication.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong" });
});

// start
Aplication.listen(Port, () => {
  console.log(`Server running on port ${Port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
