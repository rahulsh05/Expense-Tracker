const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

// ---------- Signup ----------
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const existingUser = db.get("users").find({ email }).value();
    if (existingUser) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newId = db.get("nextUserId").value();

    const newUser = { id: newId, name, email, password: hashedPassword };
    db.get("users").push(newUser).write();
    db.set("nextUserId", newId + 1).write();

    const token = jwt.sign({ userId: newId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "Account created successfully.",
      token,
      user: { id: newId, name, email },
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ error: "Something went wrong during signup." });
  }
});

// ---------- Login ----------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = db.get("users").find({ email }).value();
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Logged in successfully.",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Something went wrong during login." });
  }
});

module.exports = router;