document.addEventListener("DOMContentLoaded", () => {
  console.log("script.js loaded");

  let products = [];
  let salesHistory = [];

  const productNameInput = document.getElementById("productName");
  const productPriceInput = document.getElementById("productPrice");
  const productStockInput = document.getElementById("productStock");
  const addProductButton = document.getElementById("addProductButton");
  const productList = document.getElementById("productList");
  const totalSalesElement = document.getElementById("totalSales");
  const totalCountElement = document.getElementById("totalCount");
  const rankingList = document.getElementById("rankingList");
  const memo = document.getElementById("memo");
  const salesHistoryList = document.getElementById("salesHistoryList");
  const clearHistoryButton = document.getElementById("clearHistoryButton");
  const hourlySalesChart = document.getElementById("hourlySalesChart");

  if (
    !productNameInput ||
    !productPriceInput ||
    !productStockInput ||
    !addProductButton ||
    !productList ||
    !totalSalesElement ||
    !totalCountElement ||
    !rankingList ||
    !memo ||
    !salesHistoryList ||
    !clearHistoryButton ||
    !hourlySalesChart
  ) {
    console.error("HTMLのidが一致していません。index.htmlのidを確認してください。");
    return;
  }

  function loadData() {
    const savedProducts = localStorage.getItem("products");
    const savedMemo = localStorage.getItem("memo");
    const savedSalesHistory = localStorage.getItem("salesHistory");

    if (savedProducts) {
      products = JSON.parse(savedProducts);

      products = products.map((product) => {
        return {
          ...product,
          stock: product.stock ?? product.count ?? 0,
          count: product.count ?? 0
        };
      });
    }

    if (savedSalesHistory) {
      salesHistory = JSON.parse(savedSalesHistory);
    }

    if (savedMemo) {
      memo.value = savedMemo;
    }

    renderProducts();
    updateResults();
    renderSalesHistory();
    renderHourlySalesChart();
  }

  function saveData() {
    localStorage.setItem("products", JSON.stringify(products));
    localStorage.setItem("salesHistory", JSON.stringify(salesHistory));
    localStorage.setItem("memo", memo.value);
  }

  function addProduct() {
    const name = productNameInput.value.trim();
    const price = Number(productPriceInput.value);
    const stock = Number(productStockInput.value);

    if (name === "") {
      alert("商品名を入力してください。");
      return;
    }

    if (!price || price <= 0) {
      alert("価格を正しく入力してください。");
      return;
    }

    if (!stock || stock <= 0) {
      alert("在庫数を正しく入力してください。");
      return;
    }

    const product = {
      id: Date.now(),
      name: name,
      price: price,
      stock: stock,
      count: 0
    };

    products.push(product);

    productNameInput.value = "";
    productPriceInput.value = "";
    productStockInput.value = "";

    saveData();
    renderProducts();
    updateResults();
    renderHourlySalesChart();
  }

 function renderProducts() {
  productList.innerHTML = "";

  if (products.length === 0) {
    productList.innerHTML = '<p class="empty-message">まだ商品が登録されていません。</p>';
    return;
  }

  products.forEach((product) => {
    const remainingStock = product.stock - product.count;

    let stockStatus = "";
    let stockStatusClass = "";

    if (remainingStock === 0) {
      stockStatus = "完売";
      stockStatusClass = "sold-out";
    } else if (remainingStock <= 5) {
      stockStatus = "残りわずか";
      stockStatusClass = "low-stock";
    } else {
      stockStatus = "販売中";
      stockStatusClass = "in-stock";
    }

    const item = document.createElement("div");
    item.className = "product-item";

    item.innerHTML = `
      <div>
        <div class="product-name">${product.name}</div>
        <div class="product-price">${product.price.toLocaleString()}円</div>
        <div class="product-stock">
          在庫：${product.stock}個 ／ 残り：${remainingStock}個
          <span class="${stockStatusClass}">${stockStatus}</span>
        </div>
      </div>

      <label class="input-group">
        <span>販売数</span>
        <div class="stepper">
          <button
            type="button"
            class="step-button"
            data-type="count"
            data-action="decrease"
            data-id="${product.id}"
            ${product.count <= 0 ? "disabled" : ""}
          >
            −
          </button>

          <input
            type="number"
            min="0"
            max="${product.stock}"
            value="${product.count}"
            data-id="${product.id}"
            class="count-input step-input"
          >

          <button
            type="button"
            class="step-button"
            data-type="count"
            data-action="increase"
            data-id="${product.id}"
            ${product.count >= product.stock ? "disabled" : ""}
          >
            ＋
          </button>
        </div>
      </label>

      <div class="sale-area">
        <label class="input-group">
          <span>販売個数</span>
          <div class="stepper">
            <button
              type="button"
              class="step-button"
              data-type="sale"
              data-action="decrease"
              data-id="${product.id}"
              ${remainingStock === 0 ? "disabled" : ""}
            >
              −
            </button>

            <input
              type="number"
              min="1"
              max="${remainingStock}"
              value="1"
              data-id="${product.id}"
              class="sale-quantity-input step-input"
              ${remainingStock === 0 ? "disabled" : ""}
            >

            <button
              type="button"
              class="step-button"
              data-type="sale"
              data-action="increase"
              data-id="${product.id}"
              ${remainingStock <= 1 ? "disabled" : ""}
            >
              ＋
            </button>
          </div>
        </label>

        <button
          class="sale-button"
          data-id="${product.id}"
          ${remainingStock === 0 ? "disabled" : ""}
        >
          販売登録
        </button>
      </div>

      <div class="subtotal">
        小計：${(product.price * product.count).toLocaleString()}円
      </div>

      <button class="delete-button" data-id="${product.id}">
        削除
      </button>
    `;

    productList.appendChild(item);
  });

  const countInputs = document.querySelectorAll(".count-input");
  countInputs.forEach((input) => {
    input.addEventListener("input", updateProductCount);
  });

  const stepButtons = document.querySelectorAll(".step-button");
  stepButtons.forEach((button) => {
    button.addEventListener("click", handleStepButtonClick);
  });

  const saleButtons = document.querySelectorAll(".sale-button");
  saleButtons.forEach((button) => {
    button.addEventListener("click", registerSale);
  });

  const deleteButtons = document.querySelectorAll(".delete-button");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", deleteProduct);
  });
}

  function updateProductCount(event) {
    const productId = Number(event.target.dataset.id);
    let newCount = Number(event.target.value);

    products = products.map((product) => {
      if (product.id === productId) {
        if (newCount < 0) {
          newCount = 0;
        }

        if (newCount > product.stock) {
          alert("販売数が在庫数を超えています。");
          newCount = product.stock;
        }

        return {
          ...product,
          count: newCount
        };
      }

      return product;
    });

    saveData();
    renderProducts();
    updateResults();
    renderHourlySalesChart();
  }
function handleStepButtonClick(event) {
  const productId = Number(event.target.dataset.id);
  const type = event.target.dataset.type;
  const action = event.target.dataset.action;

  if (type === "count") {
    const input = document.querySelector(`.count-input[data-id="${productId}"]`);
    if (!input) return;

    let value = Number(input.value);
    const min = Number(input.min);
    const max = Number(input.max);

    if (action === "increase" && value < max) {
      value += 1;
    }

    if (action === "decrease" && value > min) {
      value -= 1;
    }

    input.value = value;
    updateProductCount({ target: input });
  }

  if (type === "sale") {
    const input = document.querySelector(`.sale-quantity-input[data-id="${productId}"]`);
    if (!input) return;

    let value = Number(input.value);
    const min = Number(input.min);
    const max = Number(input.max);

    if (action === "increase" && value < max) {
      value += 1;
    }

    if (action === "decrease" && value > min) {
      value -= 1;
    }

    input.value = value;
  }
}
  function registerSale(event) {
    const productId = Number(event.target.dataset.id);
    const product = products.find((item) => item.id === productId);

    if (!product) {
      alert("商品が見つかりません。");
      return;
    }

    const quantityInput = document.querySelector(
      `.sale-quantity-input[data-id="${productId}"]`
    );

    const quantity = Number(quantityInput.value);
    const remainingStock = product.stock - product.count;

    if (!quantity || quantity <= 0) {
      alert("販売個数を正しく入力してください。");
      return;
    }

    if (quantity > remainingStock) {
      alert("販売個数が残り在庫を超えています。");
      return;
    }

    products = products.map((item) => {
      if (item.id === productId) {
        return {
          ...item,
          count: item.count + quantity
        };
      }

      return item;
    });

    const saleRecord = {
      id: Date.now(),
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: quantity,
      sales: product.price * quantity,
      soldAt: new Date().toISOString()
    };

    salesHistory.unshift(saleRecord);

    saveData();
    renderProducts();
    updateResults();
    renderSalesHistory();
    renderHourlySalesChart();
  }

  function deleteProduct(event) {
    const productId = Number(event.target.dataset.id);
    const isConfirmed = confirm("この商品を削除しますか？");

    if (!isConfirmed) {
      return;
    }

    products = products.filter((product) => product.id !== productId);

    saveData();
    renderProducts();
    updateResults();
    renderHourlySalesChart();
  }

  function updateResults() {
    let totalSales = 0;
    let totalCount = 0;

    products.forEach((product) => {
      totalSales += product.price * product.count;
      totalCount += product.count;
    });

    totalSalesElement.textContent = totalSales.toLocaleString();
    totalCountElement.textContent = totalCount.toLocaleString();

    updateRanking();
  }

  function updateRanking() {
    rankingList.innerHTML = "";

    if (products.length === 0) {
      rankingList.innerHTML = "<li>まだデータがありません。</li>";
      return;
    }

    const sortedProducts = [...products].sort((a, b) => {
      return b.price * b.count - a.price * a.count;
    });

    sortedProducts.forEach((product) => {
      const sales = product.price * product.count;
      const remainingStock = product.stock - product.count;

      const li = document.createElement("li");
      li.textContent = `${product.name}：${sales.toLocaleString()}円（残り${remainingStock}個）`;
      rankingList.appendChild(li);
    });
  }

  function renderSalesHistory() {
    salesHistoryList.innerHTML = "";

    if (salesHistory.length === 0) {
      salesHistoryList.innerHTML = '<p class="empty-message">まだ販売履歴がありません。</p>';
      return;
    }

    salesHistory.forEach((record) => {
      const historyItem = document.createElement("div");
      historyItem.className = "history-item";

      const date = new Date(record.soldAt);
      const formattedDate = date.toLocaleString("ja-JP", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });

      historyItem.innerHTML = `
        <div class="history-main">
          <strong>${record.productName}</strong>
          <span>${record.quantity}個</span>
          <span>${record.sales.toLocaleString()}円</span>
        </div>
        <div class="history-time">
          ${formattedDate}
        </div>
      `;

      salesHistoryList.appendChild(historyItem);
    });
  }

  function renderHourlySalesChart() {
    hourlySalesChart.innerHTML = "";

    if (salesHistory.length === 0) {
      hourlySalesChart.innerHTML =
        '<p class="empty-message">まだグラフに表示できる販売履歴がありません。</p>';
      return;
    }

    const hourlyData = {};
    const productSet = new Set();

    salesHistory.forEach((record) => {
      const date = new Date(record.soldAt);

      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hour = date.getHours();

      const sortKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}-${String(hour).padStart(2, "0")}`;
      const displayLabel = `${month}/${day} ${hour}時台`;
      const productName = record.productName;

      productSet.add(productName);

      if (!hourlyData[sortKey]) {
        hourlyData[sortKey] = {
          label: displayLabel,
          totalSales: 0,
          products: {}
        };
      }

      if (!hourlyData[sortKey].products[productName]) {
        hourlyData[sortKey].products[productName] = 0;
      }

      hourlyData[sortKey].products[productName] += record.sales;
      hourlyData[sortKey].totalSales += record.sales;
    });

    const colorPalette = [
      "#1f4e79",
      "#4caf50",
      "#ff9800",
      "#e91e63",
      "#9c27b0",
      "#009688",
      "#f44336",
      "#3f51b5",
      "#795548",
      "#607d8b"
    ];

    const productNames = Array.from(productSet);
    const productColors = {};

    productNames.forEach((productName, index) => {
      productColors[productName] = colorPalette[index % colorPalette.length];
    });

    const legend = document.createElement("div");
    legend.className = "time-sales-legend";

    productNames.forEach((productName) => {
      const legendItem = document.createElement("div");
      legendItem.className = "time-sales-legend-item";

      const colorBox = document.createElement("span");
      colorBox.className = "time-sales-legend-color";
      colorBox.style.backgroundColor = productColors[productName];

      const nameText = document.createElement("span");
      nameText.textContent = productName;

      legendItem.appendChild(colorBox);
      legendItem.appendChild(nameText);
      legend.appendChild(legendItem);
    });

    hourlySalesChart.appendChild(legend);

    const sortedKeys = Object.keys(hourlyData).sort();

    sortedKeys.forEach((key) => {
      const hourInfo = hourlyData[key];
      const totalSales = hourInfo.totalSales;
      const products = hourInfo.products;

      const block = document.createElement("div");
      block.className = "time-sales-block";

      const label = document.createElement("div");
      label.className = "time-sales-label";
      label.textContent = hourInfo.label;

      const graphRow = document.createElement("div");
      graphRow.className = "time-sales-graph-row";

      const bar = document.createElement("div");
      bar.className = "time-sales-bar";

      Object.keys(products).forEach((productName) => {
        const sales = products[productName];
        const percentage = (sales / totalSales) * 100;

        const segment = document.createElement("div");
        segment.className = "time-sales-segment";
        segment.style.width = `${percentage}%`;
        segment.style.backgroundColor = productColors[productName];
        segment.title = `${productName}：${sales.toLocaleString()}円（${percentage.toFixed(1)}%）`;

        bar.appendChild(segment);
      });

      const total = document.createElement("div");
      total.className = "time-sales-total";
      total.textContent = `${totalSales.toLocaleString()}円`;

      graphRow.appendChild(bar);
      graphRow.appendChild(total);

      block.appendChild(label);
      block.appendChild(graphRow);

      hourlySalesChart.appendChild(block);
    });
  }

  function clearSalesHistory() {
    const isConfirmed = confirm("販売履歴をすべて削除しますか？");

    if (!isConfirmed) {
      return;
    }

    salesHistory = [];

    saveData();
    renderSalesHistory();
    renderHourlySalesChart();
  }

  addProductButton.addEventListener("click", addProduct);

  productNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      productPriceInput.focus();
    }
  });

  productPriceInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      productStockInput.focus();
    }
  });

  productStockInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      addProduct();
    }
  });

  memo.addEventListener("input", saveData);

  clearHistoryButton.addEventListener("click", clearSalesHistory);

  loadData();
});
