const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// All routes here require a valid JWT
router.use(authMiddleware);

// ---------- Add a new expense ----------
router.post("/", (req, res) => {
  try {
    const { amount, category, note, date } = req.body;

    if (!amount || !category || !date) {
      return res.status(400).json({ error: "Amount, category, and date are required." });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ error: "Amount must be a positive number." });
    }

    const newId = db.get("nextExpenseId").value();

    const newExpense = {
      id: newId,
      user_id: req.userId,
      amount: Number(amount),
      category,
      note: note || "",
      date,
    };

    db.get("expenses").push(newExpense).write();
    db.set("nextExpenseId", newId + 1).write();

    res.status(201).json({ message: "Expense added.", expense: newExpense });
  } catch (err) {
    console.error("Add expense error:", err.message);
    res.status(500).json({ error: "Something went wrong while adding the expense." });
  }
});

// ---------- Get all expenses for logged-in user ----------
router.get("/", (req, res) => {
  try {
    const expenses = db
      .get("expenses")
      .filter({ user_id: req.userId })
      .value()
      .sort((a, b) => (a.date < b.date ? 1 : -1));

    res.json({ expenses });
  } catch (err) {
    console.error("Fetch expenses error:", err.message);
    res.status(500).json({ error: "Something went wrong while fetching expenses." });
  }
});

// ---------- Delete an expense ----------
router.delete("/:id", (req, res) => {
  try {
    const id = Number(req.params.id);

    const expense = db.get("expenses").find({ id, user_id: req.userId }).value();
    if (!expense) {
      return res.status(404).json({ error: "Expense not found." });
    }

    db.get("expenses").remove({ id, user_id: req.userId }).write();
    res.json({ message: "Expense deleted." });
  } catch (err) {
    console.error("Delete expense error:", err.message);
    res.status(500).json({ error: "Something went wrong while deleting the expense." });
  }
});

// ---------- Category-wise summary (for chart) ----------
router.get("/summary", (req, res) => {
  try {
    const expenses = db.get("expenses").filter({ user_id: req.userId }).value();

    const totalsByCategory = {};
    expenses.forEach((exp) => {
      totalsByCategory[exp.category] = (totalsByCategory[exp.category] || 0) + exp.amount;
    });

    const summary = Object.entries(totalsByCategory)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);

    const grandTotal = summary.reduce((sum, row) => sum + row.total, 0);

    res.json({ summary, grandTotal });
  } catch (err) {
    console.error("Summary error:", err.message);
    res.status(500).json({ error: "Something went wrong while generating summary." });
  }
});

module.exports = router;