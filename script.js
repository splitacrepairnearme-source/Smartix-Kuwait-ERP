/* ===== Qivenza Dashboard Logic ===== */

const STORAGE_KEY = "qivenza_products";
const LOW_STOCK_THRESHOLD = 5;

let products = [];
let editingId = null;

let output = document.getElementById("output");

/* ---------- Storage ---------- */
function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

async function loadFromStorage() {
  let saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    products = JSON.parse(saved);
    return;
  }

  try {
    let response = await fetch("./products.json");
    let masterList = await response.json();
    products = masterList;
    saveToStorage();
  } catch (err) {
    products = [
      { id: 1, name: "Charger", sales: 22, stock: 15 },
      { id: 2, name: "Speaker", sales: 9, stock: 4 },
      { id: 3, name: "Cable", sales: 30, stock: 20 },
      { id: 4, name: "Mouse", sales: 0, stock: 2 }
    ];
    saveToStorage();
  }
}

/* ---------- Helpers ---------- */
function getCategory(total) {
  if (total === 0) {
    return "Non-Moving";
  } else if (total < 10) {
    return "Slow Moving";
  } else {
    return "Fast Moving";
  }
}

function getNextId() {
  return products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
}

/* ---------- Render ---------- */
function renderProducts() {
  let searchTerm = document.getElementById("searchBox").value.toLowerCase();
  let filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm));

  output.innerHTML = "";

  if (filtered.length === 0) {
    output.innerHTML = "<div class='empty-state'>No products found.</div>";
  }

  filtered.forEach(p => {
    let category = getCategory(p.sales);
    let isLow = p.stock <= LOW_STOCK_THRESHOLD;

    let row = document.createElement("div");
    row.className = "product-row" + (isLow ? " low-stock" : "");
    row.innerHTML =
      "<div class='product-info'>" +
        "<b>" + p.name + "</b>" +
        "<span class='meta'>Sales: " + p.sales + " • Stock: " + p.stock + "</span>" +
        "<span class='tag'>" + category + "</span>" +
        (isLow ? "<span class='low-badge'>⚠ Low Stock</span>" : "") +
      "</div>" +
      "<div class='product-actions'>" +
        "<button class='icon-btn edit-btn' onclick='startEdit(" + p.id + ")'>✏️</button>" +
        "<button class='icon-btn delete-btn' onclick='deleteProduct(" + p.id + ")'>🗑️</button>" +
      "</div>";

    output.appendChild(row);
  });

  updateStats();
}

function updateStats() {
  document.getElementById("totalProducts").textContent = products.length;
  document.getElementById("totalSales").textContent = products.reduce((sum, p) => sum + Number(p.sales), 0);
  document.getElementById("lowStockCount").textContent = products.filter(p => p.stock <= LOW_STOCK_THRESHOLD).length;
}

/* ---------- Add / Edit / Delete ---------- */
function addProduct() {
  let nameInput = document.getElementById("productName");
  let salesInput = document.getElementById("productSales");
  let stockInput = document.getElementById("productStock");

  let name = nameInput.value.trim();
  let saleQty = Number(salesInput.value) || 0;
  let stockQty = Number(stockInput.value) || 0;

  if (!name) {
    alert("Please enter a product name.");
    return;
  }

  if (editingId !== null) {
    let product = products.find(p => p.id === editingId);
    product.name = name;
    product.sales = saleQty;
    product.stock = stockQty;
    editingId = null;
    document.getElementById("submitBtn").textContent = "Add Product";
    document.getElementById("cancelEditBtn").style.display = "none";
  } else {
    products.push({ id: getNextId(), name: name, sales: saleQty, stock: stockQty });
  }

  nameInput.value = "";
  salesInput.value = "";
  stockInput.value = "";

  saveToStorage();
  renderProducts();
}

function startEdit(id) {
  let product = products.find(p => p.id === id);
  if (!product) return;

  document.getElementById("productName").value = product.name;
  document.getElementById("productSales").value = product.sales;
  document.getElementById("productStock").value = product.stock;

  editingId = id;
  document.getElementById("submitBtn").textContent = "Save Changes";
  document.getElementById("cancelEditBtn").style.display = "inline-block";

  document.getElementById("productName").focus();
}

function cancelEdit() {
  editingId = null;
  document.getElementById("productName").value = "";
  document.getElementById("productSales").value = "";
  document.getElementById("productStock").value = "";
  document.getElementById("submitBtn").textContent = "Add Product";
  document.getElementById("cancelEditBtn").style.display = "none";
}

function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  products = products.filter(p => p.id !== id);
  saveToStorage();
  renderProducts();
}

/* ---------- Init ---------- */
async function init() {
  await loadFromStorage();
  renderProducts();
}
init();

window.addProduct = addProduct;
window.startEdit = startEdit;
window.cancelEdit = cancelEdit;
window.deleteProduct = deleteProduct;
window.renderProducts = renderProducts;
// ===== Qivenza AI Button =====
const aiChatBtn = document.getElementById("aiChatBtn");

if (aiChatBtn) {
  aiChatBtn.addEventListener("click", function () {
    const question = prompt("🤖 Welcome to Qivenza AI\n\nAsk your business question:");

    if (!question) return;

    let reply = "Sorry, I don't know that yet.";

    if (question.toLowerCase().includes("stock")) {
      reply = "📦 Opening Stock Module...";
    } else if (question.toLowerCase().includes("sales")) {
      reply = "💰 Opening Sales Module...";
    } else if (question.toLowerCase().includes("product")) {
      reply = "📱 Opening Products...";
    }

    alert(reply);
  });
}
