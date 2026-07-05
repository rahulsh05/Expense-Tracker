const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const path = require("path");

const adapter = new FileSync(path.join(__dirname, "db.json"));
const db = low(adapter);

// Set up default structure if the file is empty
db.defaults({ users: [], expenses: [], nextUserId: 1, nextExpenseId: 1 }).write();

module.exports = db;