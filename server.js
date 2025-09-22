// Express.js Server for CS4241 Assignment 3
// Based on Express.js documentation: https://expressjs.com/en/starter/hello-world.html
// Session management: https://github.com/expressjs/session
// Mongoose ODM: https://mongoosejs.com/docs/guide.html
// Password hashing: https://github.com/dcodeIO/bcrypt.js

// === IMPORTS & SETUP ===
// Using ES6 modules for modern Node.js
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Environment variables setup
// https://github.com/motdotla/dotenv#readme
dotenv.config();

// ES6 modules don't have __dirname, so we recreate it
// https://nodejs.org/api/esm.html#esm_no_filename_or_dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// === DATABASE CONNECTION ===
// MongoDB connection using Mongoose
// https://mongoosejs.com/docs/connections.html
await mongoose.connect(process.env.MONGO_URI);
console.log("Connected to MongoDB");

// === DATABASE SCHEMAS ===

// User Schema - stores user credentials
// https://mongoosejs.com/docs/guide.html#definition
const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    unique: true,  // Prevents duplicate usernames
    required: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  }
});
const User = mongoose.model("User", UserSchema);

// Item Schema - contact form submissions linked to users
// Using ObjectId reference for user relationship
// https://mongoosejs.com/docs/populate.html
const ItemSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    index: true  // Index for faster queries
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});
const Item = mongoose.model("Item", ItemSchema);

// === MIDDLEWARE ===

// Parse JSON request bodies
// https://expressjs.com/en/api.html#express.json
app.use(express.json());

// Session middleware for user authentication
// https://github.com/expressjs/session#options
app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,          // Don't save session if unmodified
  saveUninitialized: false, // Don't create session until something stored
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files (HTML, CSS, JS)
// https://expressjs.com/en/starter/static-files.html
app.use(express.static(path.join(__dirname, "public")));

// === AUTHENTICATION MIDDLEWARE ===

// Authentication guard - protects routes that require login
// https://expressjs.com/en/guide/writing-middleware.html
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ 
      error: "Authentication required. Please log in." 
    });
  }
  next(); // Continue to next middleware/route handler
}

// === AUTHENTICATION ROUTES ===

// User login/registration endpoint
// POST /auth/login with { username, password }
// https://expressjs.com/en/guide/routing.html#route-handlers
app.post("/auth/login", async (req, res) => {
  try {
    const { username = "", password = "" } = req.body || {};
    
    // Input validation
    if (!username || !password) {
      return res.status(400).json({ 
        error: "Username and password are required" 
      });
    }

    // Check if user exists
    let user = await User.findOne({ username });
    
    if (!user) {
      // Create new account if user doesn't exist (A3 requirement)
      // Hash password with bcrypt: https://github.com/dcodeIO/bcrypt.js#usage
      const passwordHash = await bcrypt.hash(password, 10);
      user = await User.create({ username, passwordHash });
      
      // Set session and respond
      req.session.userId = user._id.toString();
      return res.json({ 
        ok: true, 
        newAccount: true,
        message: "New account created successfully!",
        user: { id: user._id, username } 
      });
    } else {
      // Existing user - verify password
      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        return res.status(401).json({ 
          error: "Incorrect password" 
        });
      }
      
      // Login successful
      req.session.userId = user._id.toString();
      return res.json({ 
        ok: true, 
        newAccount: false,
        message: "Login successful!",
        user: { id: user._id, username } 
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ 
      error: "Server error during login" 
    });
  }
});

// User logout endpoint
// POST /auth/logout
app.post("/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ error: "Could not log out" });
    }
    res.json({ ok: true, message: "Logged out successfully" });
  });
});

// === CONTACT ITEMS API (USER-SCOPED) ===

// Get all items for the authenticated user
// GET /api/items
app.get("/api/items", requireAuth, async (req, res) => {
  try {
    // Find items belonging to current user, sorted by newest first
    const items = await Item.find({ userId: req.session.userId })
                           .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Error fetching items" });
  }
});

// Create new item for authenticated user
// POST /api/items with { name, email, message }
app.post("/api/items", requireAuth, async (req, res) => {
  try {
    const { name = "", email = "", message = "" } = req.body || {};
    
    // Input validation
    if (!name || !email || !message) {
      return res.status(400).json({ 
        error: "Name, email, and message are required" 
      });
    }
    
    // Create new item linked to current user
    const doc = await Item.create({ 
      userId: req.session.userId, 
      name, 
      email, 
      message 
    });
    
    res.status(201).json(doc);
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ error: "Error creating item" });
  }
});

// Update existing item (only user's own items)
// PUT /api/items/:id with { name?, email?, message? }
app.put("/api/items/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, message } = req.body || {};
    
    // Build update object with only provided fields
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;
    if (message !== undefined) updateFields.message = message;
    
    // Find and update item (only if it belongs to current user)
    const doc = await Item.findOneAndUpdate(
      { _id: id, userId: req.session.userId }, // Match ID and user
      { $set: updateFields },
      { new: true } // Return updated document
    );
    
    if (!doc) {
      return res.status(404).json({ 
        error: "Item not found or access denied" 
      });
    }
    
    res.json(doc);
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ error: "Error updating item" });
  }
});

// Delete item (only user's own items)
// DELETE /api/items/:id
app.delete("/api/items/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete item only if it belongs to current user
    const result = await Item.deleteOne({ 
      _id: id, 
      userId: req.session.userId 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        error: "Item not found or access denied" 
      });
    }
    
    res.json({ 
      success: true,
      message: "Item deleted successfully",
      removed: result.deletedCount 
    });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ error: "Error deleting item" });
  }
});

// === STATIC ROUTES ===

// Serve login page
// https://expressjs.com/en/api.html#res.sendFile
app.get("/login", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Root route - redirect to login
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// === ERROR HANDLING ===
// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Handle server errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// === START SERVER ===
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
