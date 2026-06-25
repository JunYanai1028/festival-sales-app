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

    // 並び替え用のキー
    const sortKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}-${String(hour).padStart(2, "0")}`;

    // 画面に表示するラベル
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
    "#3f51b5"
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
