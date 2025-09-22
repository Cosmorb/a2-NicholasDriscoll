// https://expressjs.com/en/starter/hello-world.html
// https://github.com/expressjs/session
//  https://mongoosejs.com/docs/guide.html
//  https://github.com/dcodeIO/bcrypt.js
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();
// https://nodejs.org/api/esm.html#esm_no_filename_or_dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app =express();
const PORT =process.env.PORT || 3000;

// https://mongoosejs.com/docs/connections.html
await mongoose.connect(process.env.MONGO_URI);
console.log("Connected to MongoDB");


// https://mongoosejs.com/docs/guide.html#definition
const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    unique: true,  
    required: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  }
});
const User = mongoose.model("User", UserSchema);


// https://mongoosejs.com/docs/populate.html
const ItemSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    index: true  
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
