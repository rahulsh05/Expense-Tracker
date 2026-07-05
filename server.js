require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const expenseRoutes = require("./routes/expenses");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

app.listen(PORT, () => {
  console.log(`Expense Tracker running on http://localhost:${PORT}`);
});