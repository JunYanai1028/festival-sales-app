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

        <label>
          販売数
          <input
            type="number"
            min="0"
            max="${product.stock}"
            value="${product.count}"
            data-id="${product.id}"
            class="count-input"
          >
        </label>

        <div class="sale-area">
          <label>
            販売個数
            <input
              type="number"
              min="1"
              max="${remainingStock}"
              value="1"
              data-id="${product.id}"
              class="sale-quantity-input"
              ${remainingStock === 0 ? "disabled" : ""}
            >
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
      const hour = date.getHours();
      const hourLabel = `${hour}時台`;
      const productName = record.productName;

      productSet.add(productName);

      if (!hourlyData[hourLabel]) {
        hourlyData[hourLabel] = {
          totalSales: 0,
          products: {}
        };
      }

      if (!hourlyData[hourLabel].products[productName]) {
        hourlyData[hourLabel].products[productName] = 0;
      }

      hourlyData[hourLabel].products[productName] += record.sales;
      hourlyData[hourLabel].totalSales += record.sales;
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
    legend.className = "hourly-chart-legend";

    productNames.forEach((productName) => {
      const legendItem = document.createElement("div");
      legendItem.className = "hourly-chart-legend-item";

      legendItem.innerHTML = `
        <span
          class="hourly-chart-legend-color"
          style="background-color: ${productColors[productName]};"
        ></span>
        <span>${productName}</span>
      `;

      legend.appendChild(legendItem);
    });

    hourlySalesChart.appendChild(legend);

    const sortedHourLabels = Object.keys(hourlyData).sort((a, b) => {
      return Number(a.replace("時台", "")) - Number(b.replace("時台", ""));
    });

    sortedHourLabels.forEach((hourLabel) => {
      const hourInfo = hourlyData[hourLabel];
      const totalSales = hourInfo.totalSales;
      const products = hourInfo.products;

      const chartItem = document.createElement("div");
      chartItem.className = "hourly-chart-item";

      const barSegments = Object.keys(products)
        .map((productName) => {
          const sales = products[productName];
          const percentage = (sales / totalSales) * 100;
          const color = productColors[productName];

          return `
            <div
              class="hourly-stacked-bar-segment"
              style="width: ${percentage}%; background-color: ${color};"
              title="${productName}：${sales.toLocaleString()}円（${percentage.toFixed(1)}%）"
            ></div>
          `;
        })
        .join("");

      chartItem.innerHTML = `
        <div class="hourly-chart-label">${hourLabel}</div>

        <div class="hourly-chart-row">
          <div class="hourly-stacked-bar">
            ${barSegments}
          </div>

          <div class="hourly-chart-total">
            ${totalSales.toLocaleString()}円
          </div>
        </div>
      `;

      hourlySalesChart.appendChild(chartItem);
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
