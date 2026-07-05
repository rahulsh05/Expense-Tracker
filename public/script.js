// ---------- State ----------
let token = localStorage.getItem("token");
let currentUser = JSON.parse(localStorage.getItem("user") || "null");
let chartInstance = null;

const authScreen = document.getElementById("authScreen");
const dashboardScreen = document.getElementById("dashboardScreen");

// ---------- Auth tab switching ----------
document.querySelectorAll(".auth-tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".auth-tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".auth-form").forEach((f) => f.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.form).classList.add("active");
  });
});

// ---------- Signup ----------
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("signupError");
  errorEl.textContent = "";

  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;

  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Signup failed");

    loginSuccess(data.token, data.user);
  } catch (err) {
    errorEl.textContent = err.message;
  }
});

// ---------- Login ----------
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("loginError");
  errorEl.textContent = "";

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Login failed");

    loginSuccess(data.token, data.user);
  } catch (err) {
    errorEl.textContent = err.message;
  }
});

function loginSuccess(newToken, user) {
  token = newToken;
  currentUser = user;
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  showDashboard();
}

// ---------- Logout ----------
document.getElementById("logoutBtn").addEventListener("click", () => {
  token = null;
  currentUser = null;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  showAuth();
});

// ---------- Screen switching ----------
function showDashboard() {
  authScreen.classList.add("hidden");
  dashboardScreen.classList.remove("hidden");
  document.getElementById("userName").textContent = `Hi, ${currentUser.name}`;
  document.getElementById("date").valueAsDate = new Date();
  loadExpenses();
  loadSummary();
}

function showAuth() {
  dashboardScreen.classList.add("hidden");
  authScreen.classList.remove("hidden");
}

// ---------- Add expense ----------
document.getElementById("expenseForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const amount = document.getElementById("amount").value;
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;
  const note = document.getElementById("note").value.trim();

  try {
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount, category, date, note }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not add expense");

    document.getElementById("expenseForm").reset();
    document.getElementById("date").valueAsDate = new Date();

    loadExpenses();
    loadSummary();
  } catch (err) {
    alert(err.message);
  }
});

// ---------- Load expenses ----------
async function loadExpenses() {
  try {
    const res = await fetch("/api/expenses", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401) return showAuth();
      throw new Error(data.error);
    }

    renderExpenses(data.expenses);
  } catch (err) {
    console.error(err.message);
  }
}

function renderExpenses(expenses) {
  const listEl = document.getElementById("expenseList");
  listEl.innerHTML = "";

  if (expenses.length === 0) {
    listEl.innerHTML = `<p class="empty-text">No expenses yet. Add your first one!</p>`;
    return;
  }

  expenses.forEach((exp) => {
    const item = document.createElement("div");
    item.className = "expense-item";
    item.innerHTML = `
      <div class="expense-info">
        <span class="expense-category">${exp.category}</span>
        <span class="expense-meta">${exp.date}${exp.note ? " · " + exp.note : ""}</span>
      </div>
      <div class="expense-right">
        <span class="expense-amount">₹${exp.amount}</span>
        <button class="delete-btn" data-id="${exp.id}">Delete</button>
      </div>
    `;
    listEl.appendChild(item);
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      if (!confirm("Delete this expense?")) return;

      try {
        const res = await fetch(`/api/expenses/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Could not delete expense");

        loadExpenses();
        loadSummary();
      } catch (err) {
        alert(err.message);
      }
    });
  });
}

// ---------- Load summary + chart ----------
async function loadSummary() {
  try {
    const res = await fetch("/api/expenses/summary", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    document.getElementById("grandTotal").textContent = data.grandTotal.toFixed(2);
    renderChart(data.summary);
  } catch (err) {
    console.error(err.message);
  }
}

function renderChart(summary) {
  const ctx = document.getElementById("summaryChart");

  const labels = summary.map((s) => s.category);
  const totals = summary.map((s) => s.total);

  if (chartInstance) chartInstance.destroy();

  if (summary.length === 0) return;

  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: totals,
          backgroundColor: [
            "#6366f1", "#f87171", "#34d399", "#fbbf24",
            "#a78bfa", "#38bdf8", "#fb923c",
          ],
          borderWidth: 0,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#e2e8f0", font: { size: 12 } },
        },
      },
    },
  });
}

// ---------- Init: check if already logged in ----------
if (token && currentUser) {
  showDashboard();
} else {
  showAuth();
}