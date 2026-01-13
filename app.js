const API =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://food-pre-order-backend.onrender.com";

const vendorsDiv = document.getElementById("vendors");
const cartDiv = document.getElementById("cart");

const cart = {}; // vendorId -> vendor data

// LOAD VENDORS & MENU
fetch(`${API}/vendors`)
  .then(res => res.json())
  .then(vendors => {
    vendors.forEach(v => {
      const div = document.createElement("div");
      div.className = "vendor";
      div.innerHTML = `<h3>${v.name}</h3>`;

      if (!v.menu || v.menu.length === 0) {
        div.innerHTML += "<p>No menu items</p>";
      } else {
        v.menu.forEach(m => {
          div.innerHTML += `
            <div>
              ${m.item_name} - ₹${m.price}
              <input 
                type="number"
                min="1"
                max="${m.max_quantity}"
                value="1"
                id="q_${m.id}">
              <button onclick="addToCart(
                ${v.id},
                '${v.name}',
                '${v.phone}',
                ${m.id},
                '${m.item_name}',
                ${m.price}
              )">Add</button>
            </div>
          `;
        });
      }

      vendorsDiv.appendChild(div);
    });
  })
  .catch(err => {
    console.error("Error loading vendors:", err);
  });

// ADD TO CART
function addToCart(vendorId, vendorName, vendorPhone, itemId, itemName, price) {

  const qtyInput = document.getElementById(`q_${itemId}`);
  const qty = Number(qtyInput.value);

  if (qty <= 0) {
    alert("Quantity must be at least 1");
    return;
  }

  if (!cart[vendorId]) {
    cart[vendorId] = {
      vendor: vendorName,
      vendor_phone: vendorPhone,
      items: []
    };
  }

  const existing = cart[vendorId].items.find(i => i.id === itemId);

  if (existing) {
    existing.quantity += qty;
  } else {
    cart[vendorId].items.push({
      id: itemId,
      name: itemName,
      price: price,
      quantity: qty
    });
  }

  renderCart();
}

// RENDER CART
function renderCart() {
  cartDiv.innerHTML = "";

  for (const vendorId in cart) {
    let total = 0;

    let html = `<h4>${cart[vendorId].vendor}</h4><ul>`;

    cart[vendorId].items.forEach(i => {
      const itemTotal = i.price * i.quantity;
      total += itemTotal;
      html += `<li>${i.name} × ${i.quantity} = ₹${itemTotal}</li>`;
    });

    html += `</ul><b>Total: ₹${total}</b><hr>`;
    cartDiv.innerHTML += html;
  }
}

// CHECKOUT
function checkout() {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();

  if (!name || !phone) {
    alert("Please enter Name and Phone");
    return;
  }

  if (Object.keys(cart).length === 0) {
    alert("Cart is empty");
    return;
  }

  fetch(`${API}/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, phone, cart })
  })
    .then(res => res.json())
    .then(summary => {
      let msg = "Order Confirmed!\n\n";
      summary.forEach(s => {
        msg += `${s.vendor}\nPay ₹${s.total} to ${s.vendor_phone}\n\n`;
      });
      alert(msg);
      location.reload();
    });
}
