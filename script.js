document.addEventListener("DOMContentLoaded", () => {
  console.log("script.js loaded");

  let products = [];

  const productNameInput = document.getElementById("productName");
  const productPriceInput = document.getElementById("productPrice");
  const productStockInput = document.getElementById("productStock");
  const addProductButton = document.getElementById("addProductButton");
  const productList = document.getElementById("productList");
  const totalSalesElement = document.getElementById("totalSales");
  const totalCountElement = document.getElementById("totalCount");
  const rankingList = document.getElementById("rankingList");
  const memo = document.getElementById("memo");

  if (
    !productNameInput ||
    !productPriceInput ||
    !productStockInput ||
    !addProductButton ||
    !productList ||
    !totalSalesElement ||
    !totalCountElement ||
    !rankingList ||
    !memo
  ) {
    console.error("HTMLのidが一致していません。index.htmlのidを確認してください。");
    return;
  }

  function loadData() {
    const savedProducts = localStorage.getItem("products");
    const savedMemo = localStorage.getItem("memo");

    if (savedProducts) {
      products = JSON.parse(savedProducts);
        // 以前のデータにstockがない場合の補正
      products = products.map((product) => {
        return {
          ...product,
          stock: product.stock ?? product.count
        };
      });
    }

    if (savedMemo) {
      memo.value = savedMemo;
    }

    renderProducts();
    updateResults();
  }

  function saveData() {
    localStorage.setItem("products", JSON.stringify(products));
    localStorage.setItem("memo", memo.value);
  }

  function addProduct() {
    console.log("商品追加ボタンが押されました");

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

  addProductButton.addEventListener("click", addProduct);

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

  productNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      productPriceInput.focus();
    }
  });

  memo.addEventListener("input", saveData);

  loadData();
});
