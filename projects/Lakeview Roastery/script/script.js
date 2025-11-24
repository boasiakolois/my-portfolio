/* scripts.js - uses your HTML/layout, only handles cart + newsletter logic */

const PRODUCTS = [
  { id: 'p1', name: 'Macchiato – 8oz', price: 4.75, img: '/images/macchiato.jpg' },
  { id: 'p2', name: 'Matcha Latte – 12oz', price: 6.50, img: '/images/matchalatte.jpg' },
  { id: 'p3', name: 'Espresso Beans – 8oz Bag', price: 12.00, img: '/images/expresso.jpg' },
  { id: 'p4', name: 'Flat White – 12oz', price: 5.75, img: '/images/flatwhite.jpg' },
  { id: 'p5', name: 'Hot Chocolate – 12oz', price: 4.75, img: '/images/hotchocolate.jpg' },
  { id: 'p6', name: 'Iced Americano – 16oz', price: 4.50, img: '/images/icedamericano.jpg' },
  { id: 'p7', name: 'Iced Coffee – 16oz', price: 4.75, img: '/images/icedcoffee.jpg' },
  { id: 'p8', name: 'Iced Matcha – 16oz', price: 6.25, img: '/images/icedmatcha.jpg' },
  { id: 'p9', name: 'Iced Tea – 16oz', price: 4.25, img: '/images/icedtea.jpg' }
//  { id: 'p9', name: 'Iced Tea', price: 5.50, img: '/images/icedtea.jpg' }
  // you can add more here if you want
];

const CART_KEY = 'lv_cart_v1';

function getCart() {
  const raw = localStorage.getItem(CART_KEY);
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  dispatchCartUpdated();
}

function addToCart(productId, qty = 1) {
  const cart = getCart();
  if (!cart[productId]) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return; // in case the id doesn't exist
    cart[productId] = { id: productId, name: product.name, price: product.price, qty: 0 };
  }
  cart[productId].qty += qty;
  saveCart(cart);
}

function removeFromCart(productId) {
  const cart = getCart();
  delete cart[productId];
  saveCart(cart);
}

function updateQty(productId, qty) {
  const cart = getCart();
  if (!cart[productId]) return;
  cart[productId].qty = Math.max(0, qty);
  if (cart[productId].qty === 0) delete cart[productId];
  saveCart(cart);
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  dispatchCartUpdated();
}

function cartTotalAndCount() {
  const cart = getCart();
  let total = 0, count = 0;
  for (const k in cart) {
    total += cart[k].price * cart[k].qty;
    count += cart[k].qty;
  }
  return { total, count };
}

function escapeHtml(str) {
  return ('' + str).replace(/[&<>"']/g, m => ({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  }[m]));
}

/* ---------- UI pieces that JS is allowed to touch ---------- */

function updateCartIcon() {
  const { count } = cartTotalAndCount();
  const el = document.getElementById('cart-count');
  if (el) el.textContent = count;
}

function renderCartDropdown() {
  const cartDiv = document.getElementById('cart-items');
  const totalSpan = document.getElementById('cart-total');
  if (!cartDiv || !totalSpan) return;

  const cart = getCart();
  cartDiv.innerHTML = '';

  if (Object.keys(cart).length === 0) {
    cartDiv.innerHTML = '<p class="muted" style="padding:0.6rem">Your cart is empty.</p>';
    totalSpan.textContent = '0.00';
    return;
  }

  for (const id in cart) {
    const item = cart[id];
    const itemRow = document.createElement('div');
    itemRow.className = 'cart-item';
    itemRow.innerHTML = `
      <div class="meta">
        <div style="font-weight:600">${escapeHtml(item.name)}</div>
        <div class="muted" style="font-size:0.9rem">$${item.price.toFixed(2)} × ${item.qty}</div>
      </div>
      <div style="text-align:right">
        <div>$${(item.price * item.qty).toFixed(2)}</div>
        <div style="margin-top:6px">
          <button data-action="dec" data-id="${item.id}" class="btn">-</button>
          <button data-action="inc" data-id="${item.id}" class="btn">+</button>
      </div>
    `;
    cartDiv.appendChild(itemRow);
  }
  const { total } = cartTotalAndCount();
  totalSpan.textContent = total.toFixed(2);
}

function renderCartPreview() {
  const preview = document.getElementById('cart-preview');
  if (!preview) return;

  const cart = getCart();
  preview.innerHTML = '';

  if (Object.keys(cart).length === 0) {
    preview.innerHTML = '<p class="muted">Cart empty — add items from the menu.</p>';
    return;
  }

  for (const id in cart) {
    const it = cart[id];
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.padding = '0.35rem 0';
    row.innerHTML = `
      <div>${escapeHtml(it.name)} × ${it.qty}</div>
      <div>$${(it.price * it.qty).toFixed(2)}</div>
    `;
    preview.appendChild(row);
  }

  const { total } = cartTotalAndCount();
  const totalRow = document.createElement('div');
  totalRow.style.display = 'flex';
  totalRow.style.justifyContent = 'space-between';
  totalRow.style.paddingTop = '0.5rem';
  totalRow.style.borderTop = '1px solid #eee';
  totalRow.innerHTML = `<strong>Total</strong><strong>$${total.toFixed(2)}</strong>`;
  preview.appendChild(totalRow);
}

function dispatchCartUpdated() {
  updateCartIcon();
  renderCartDropdown();
  renderCartPreview();
  window.dispatchEvent(new Event('cart-updated'));
}

/* ---------- These two functions used to rebuild your HTML. Now they are NOT called. ---------- */

function renderMenuGrid() {
  // NO LONGER USED so it does not overwrite your HTML.
  // You can safely delete this function if you want.
}

function renderFeatured() {
  // NO LONGER USED so it does not overwrite your HTML.
  // You can safely delete this function if you want.
}

/* ---------- Cart dropdown behavior ---------- */

function handleCartDropdownToggle() {
  const btn = document.getElementById('cart-btn');
  const dd = document.getElementById('cart-dropdown');
  if (!btn || !dd) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dd.style.display === 'block';
    dd.style.display = isOpen ? 'none' : 'block';
    btn.setAttribute('aria-expanded', String(!isOpen));
    dd.setAttribute('aria-hidden', String(isOpen));
  });

  document.addEventListener('click', (e) => {
    if (!dd.contains(e.target) && !btn.contains(e.target)) {
      dd.style.display = 'none';
      btn.setAttribute('aria-expanded', 'false');
      dd.setAttribute('aria-hidden', 'true');
    }
  });

  document.addEventListener('click', (e) => {
    const action = e.target.getAttribute && e.target.getAttribute('data-action');
    const id = e.target.getAttribute && e.target.getAttribute('data-id');
    if (!action) return;

    if (action === 'inc') updateQty(id, (getCart()[id]?.qty || 0) + 1);
    if (action === 'dec') updateQty(id, (getCart()[id]?.qty || 0) - 1);

  });

  const checkoutBtn = document.getElementById('checkout-btn');
  const clearBtn = document.getElementById('clear-cart-btn');

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      const { total } = cartTotalAndCount();
      if (total === 0) {
        alert('Your cart is empty.');
        return;
      }
      alert(`Demo checkout — your order of $${total.toFixed(2)} has been placed!`);
      clearCart();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear your cart?')) clearCart();
    });
  }
}

/* ---------- Add-to-cart buttons (using your existing HTML buttons) ---------- */

function handleAddToCartButtons() {
  document.addEventListener('click', (e) => {
    const action = e.target.getAttribute && e.target.getAttribute('data-action');
    const id = e.target.getAttribute && e.target.getAttribute('data-id');
    if (!action || !id) return;

    if (action === 'add' || action === 'add-1') {
      addToCart(id, 1);
      const original = (action === 'add' ? 'Add to Cart' : '+1');
      e.target.textContent = 'Added';
      setTimeout(() => { e.target.textContent = original; }, 600);
    }
  });
}

/* ---------- Newsletter ---------- */

function handleNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  const emailInput = document.getElementById('newsletter-email');
  const msg = document.getElementById('newsletter-msg');

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const email = (emailInput.value || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msg.textContent = 'Please enter a valid email address.';
      msg.style.color = 'crimson';
      return;
    }

    const key = 'lv_subscribers_v1';
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];

    if (arr.includes(email)) {
      msg.textContent = 'You are already subscribed — thank you!';
      msg.style.color = 'green';
      emailInput.value = '';
      return;
    }

    arr.push(email);
    localStorage.setItem(key, JSON.stringify(arr));
    msg.textContent = 'Thanks! You are subscribed.';
    msg.style.color = 'green';
    emailInput.value = '';
  });
}

/* ---------- Init ---------- */

document.addEventListener('DOMContentLoaded', () => {
  // DO NOT call renderMenuGrid or renderFeatured, so your HTML stays as you wrote it
  renderCartDropdown();
  renderCartPreview();
  updateCartIcon();

  handleCartDropdownToggle();
  handleAddToCartButtons();
  handleNewsletter();

  window.addEventListener('storage', () => dispatchCartUpdated());
});
