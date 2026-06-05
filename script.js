* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: "Helvetica Neue", Arial, sans-serif;
  background-color: #f4f6f8;
  color: #222;
}

header {
  background-color: #263238;
  color: white;
  padding: 24px 16px;
  text-align: center;
}

header h1 {
  margin: 0 0 8px;
  font-size: 24px;
}

header p {
  margin: 0;
  font-size: 14px;
}

main {
  max-width: 860px;
  margin: 24px auto;
  padding: 0 16px;
}

.card {
  background-color: white;
  padding: 20px;
  margin-bottom: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card h2 {
  margin-top: 0;
  font-size: 20px;
  border-left: 5px solid #263238;
  padding-left: 10px;
}

.form-area {
  display: grid;
  gap: 12px;
}

label {
  font-weight: bold;
}

input,
textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccd1d5;
  border-radius: 8px;
  font-size: 16px;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

button {
  padding: 12px;
  background-color: #263238;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}

button:hover {
  opacity: 0.9;
}

.product-item {
  display: grid;
  grid-template-columns: 1fr 140px 140px 80px;
  gap: 12px;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #e0e0e0;
}

.product-name {
  font-weight: bold;
  font-size: 16px;
}

.product-price {
  color: #666;
  font-size: 14px;
  margin-top: 4px;
}

.subtotal {
  font-weight: bold;
}

.delete-button {
  background-color: #b23b3b;
  padding: 10px;
  font-size: 14px;
}

.empty-message {
  color: #777;
}

#totalSales,
#totalCount {
  font-weight: bold;
  font-size: 20px;
}

ol {
  padding-left: 24px;
}

li {
  margin-bottom: 6px;
}

@media (max-width: 700px) {
  .product-item {
    grid-template-columns: 1fr;
  }

  header h1 {
    font-size: 20px;
  }

  .card {
    padding: 16px;
  }
}
