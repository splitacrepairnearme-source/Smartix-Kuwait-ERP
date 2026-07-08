let products = ["Charger", "Speaker", "Cable", "Mouse"];
let sales = [22, 9, 30, 0];

let output = document.getElementById("output");

function getCategory(total) {
  if (total === 0) {
    return "Non-Moving";
  } else if (total < 10) {
    return "Slow Moving";
  } else {
    return "Fast Moving";
  }
}

function renderProducts() {
  output.innerHTML = "";
  for (let i = 0; i < products.length; i++) {
    let category = getCategory(sales[i]);
    output.innerHTML += "<p><b>" + products[i] + "</b> - Sales: " + sales[i] + " - <i>" + category + "</i></p>";
  }
}

function addProduct() {
  let nameInput = document.getElementById("productName");
  let salesInput = document.getElementById("productSales");

  let name = nameInput.value;
  let saleQty = Number(salesInput.value);

  products.push(name);
  sales.push(saleQty);

  nameInput.value = "";
  salesInput.value = "";

  renderProducts();
}

renderProducts();

window.addProduct = addProduct;