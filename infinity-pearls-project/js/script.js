/* Infinity Pearls — modern frontend */

// Supabase config
const SUPABASE_URL = 'https://eascxtwbhzebrlvqzxzp.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhc2N4dHdiaHplYnJsdnF6eHpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNTk2NjcsImV4cCI6MjA4NjYzNTY2N30.30JA1cBgPE0UfKcMTNfUN_PFpg8lBtDDdcRe3KViBdQ';

let supabaseClient = null;
if (window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const fallbackProducts = [
  {
    id: 1,
    name: 'Aqua & Pearl Spider Charm',
    description: 'Elegant bracelet with turquoise beads, clear crystals, and a unique spider charm',
    price: 60,
    image: 'images/IMG-20260122-WA0007.jpg',
  },
  {
    id: 2,
    name: 'Red & Pearl 8-Ball Bracelet',
    description: 'Bold red beads with white pearls featuring an 8-ball charm and star accent',
    price: 60,
    image: 'images/IMG-20260122-WA0008.jpg',
  },
  {
    id: 3,
    name: 'Coral & Mint Bat Charm',
    description: 'Unique color-blocked design with coral, orange, and mint beads with bat charm',
    price: 60,
    image: 'images/IMG-20260122-WA0010.jpg',
  },
  {
    id: 4,
    name: 'Rainbow Flower Power',
    description: 'Vibrant rainbow gradient bracelet with cheerful flower charm',
    price: 60,
    image: 'images/IMG-20260122-WA0011.jpg',
  },
  {
    id: 5,
    name: 'Pink & Black Heart Star',
    description: 'Chic pink and black beads with heart and star charm accents',
    price: 60,
    image: 'images/IMG-20260122-WA0012.jpg',
  },
  {
    id: 6,
    name: 'Purple Cross & Star',
    description: 'Deep purple beads with decorative cross and star charms',
    price: 60,
    image: 'images/IMG-20260122-WA0013.jpg',
  },
  {
    id: 7,
    name: 'Infinity Link Bracelet',
    description: 'Elegant silver bracelet with repeating infinity symbol links',
    price: 60,
    image: 'images/IMG-20260122-WA0007.jpg',
  },
  {
    id: 8,
    name: 'Pink Ombre Set',
    description: 'Delicate pink gradient bracelets - perfect matching pair',
    price: 60,
    image: 'images/IMG-20260122-WA0008.jpg',
  },
  {
    id: 9,
    name: 'Crystal Daisy Bracelet',
    description: 'Sparkling clear crystal beads with white daisy charm',
    price: 60,
    image: 'images/IMG-20260122-WA0010.jpg',
  },
  {
    id: 10,
    name: 'Pink Crystal Bear Charm',
    description: 'Sweet pink crystal beads with adorable bear face charm',
    price: 60,
    image: 'images/IMG-20260122-WA0011.jpg',
  },
];

const els = {
  year: document.getElementById('year'),
  navToggle: document.getElementById('navToggle'),
  navMenu: document.getElementById('navMenu'),
  themeToggle: document.getElementById('themeToggle'),
  searchInput: document.getElementById('searchInput'),
  sortSelect: document.getElementById('sortSelect'),
  productsGrid: document.getElementById('productsGrid'),
  emptyState: document.getElementById('emptyState'),
  clearSearch: document.getElementById('clearSearch'),

  modal: document.getElementById('productModal'),
  modalImage: document.getElementById('modalImage'),
  modalTitle: document.getElementById('modalTitle'),
  modalDescription: document.getElementById('modalDescription'),
  modalPrice: document.getElementById('modalPrice'),
  modalAddToCart: document.getElementById('modalAddToCart'),

  drawer: document.getElementById('cartDrawer'),
  cartOpen: document.getElementById('cartOpen'),
  cartItems: document.getElementById('cartItems'),
  cartTotal: document.getElementById('cartTotal'),
  cartCount: document.getElementById('cartCount'),
  checkoutBtn: document.getElementById('checkoutBtn'),
  clearCartBtn: document.getElementById('clearCartBtn'),

  toasts: document.getElementById('toasts'),

  contactForm: document.getElementById('contactForm'),
  contactSubmit: document.getElementById('contactSubmit'),
};

const IMAGE_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 600 400%22%3E%3Crect fill=%22%23eaecef%22 width=%22600%22 height=%22400%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2230%22 fill=%22%23777%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EImage%3C/text%3E%3C/svg%3E";

let products = [];
let filtered = [];
let activeProductId = null;
let cart = [];

function moneyZAR(value) {
  return `R${Number(value || 0).toFixed(2)}`;
}

function toast(title, text) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<div class="toast__title"></div><div class="toast__text"></div>`;
  el.querySelector('.toast__title').textContent = title;
  el.querySelector('.toast__text').textContent = text || '';
  els.toasts.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function saveCart() {
  localStorage.setItem('infinityPearlsCart', JSON.stringify(cart));
}

function loadCart() {
  try {
    const raw = localStorage.getItem('infinityPearlsCart');
    cart = raw ? JSON.parse(raw) : [];
  } catch {
    cart = [];
  }
}

function cartCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function cartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function setCartUI() {
  els.cartCount.textContent = String(cartCount());
  els.cartTotal.textContent = moneyZAR(cartTotal());

  if (cart.length === 0) {
    els.cartItems.innerHTML = `<div class="cart-empty">Your cart is empty. Add something you love.</div>`;
    return;
  }

  els.cartItems.innerHTML = cart
    .map(
      (item) => `
      <div class="cart-item" data-cart-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" loading="lazy"
             onerror="this.onerror=null;this.src='${IMAGE_FALLBACK}'">
        <div>
          <p class="cart-item__name">${item.name}</p>
          <p class="cart-item__meta">${moneyZAR(item.price)} • ${item.quantity} item(s)</p>
        </div>
        <div class="qty" aria-label="Quantity controls">
          <button type="button" data-qty="-1" aria-label="Decrease quantity">−</button>
          <span aria-label="Quantity">${item.quantity}</span>
          <button type="button" data-qty="1" aria-label="Increase quantity">+</button>
        </div>
      </div>
    `
    )
    .join('');
}

function addToCart(id) {
  const product = products.find((p) => p.id === id);
  if (!product) return;

  const existing = cart.find((c) => c.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({ ...product, quantity: 1 });

  saveCart();
  setCartUI();
  toast('Added to cart', product.name);
}

function changeQty(id, delta) {
  const item = cart.find((c) => c.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) cart = cart.filter((c) => c.id !== id);
  saveCart();
  setCartUI();
}

function clearCart() {
  cart = [];
  saveCart();
  setCartUI();
  toast('Cart cleared', 'Your cart is now empty.');
}

function openDrawer() {
  els.drawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  els.drawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function openModal(product) {
  activeProductId = product.id;
  els.modalImage.onerror = function () {
    this.onerror = null;
    this.src = IMAGE_FALLBACK;
  };
  els.modalImage.src = product.image;
  els.modalImage.alt = product.name;
  els.modalTitle.textContent = product.name;
  els.modalDescription.textContent = product.description;
  els.modalPrice.textContent = moneyZAR(product.price);
  els.modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  els.modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  activeProductId = null;
}

function sortProducts(list, sortKey) {
  const copy = [...list];
  if (sortKey === 'price-asc') copy.sort((a, b) => a.price - b.price);
  if (sortKey === 'price-desc') copy.sort((a, b) => b.price - a.price);
  if (sortKey === 'name-asc') copy.sort((a, b) => a.name.localeCompare(b.name));
  return copy;
}

function applyFilters() {
  const q = (els.searchInput.value || '').trim().toLowerCase();
  const sortKey = els.sortSelect.value;

  filtered = products.filter((p) => {
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  });

  filtered = sortProducts(filtered, sortKey);
  renderGrid();
}

function renderGrid() {
  if (filtered.length === 0) {
    els.productsGrid.innerHTML = '';
    els.emptyState.hidden = false;
    return;
  }

  els.emptyState.hidden = true;
  els.productsGrid.innerHTML = filtered
    .map(
      (p) => `
      <article class="card product" tabindex="0" role="button" aria-label="View ${p.name}" data-product-id="${p.id}">
        <img class="product__img" src="${p.image}" alt="${p.name}" loading="lazy"
             onerror="this.onerror=null;this.src='${IMAGE_FALLBACK}'">
        <div class="product__body">
          <h3 class="product__name">${p.name}</h3>
          <p class="product__desc">${p.description}</p>
          <div class="product__row">
            <div class="price">${moneyZAR(p.price)}</div>
            <button class="mini" type="button" data-add="${p.id}" aria-label="Add ${p.name} to cart">Add</button>
          </div>
        </div>
      </article>
    `
    )
    .join('');
}

async function fetchProducts() {
  try {
    const res = await fetch('/api/products', { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('Failed to load products');
    products = await res.json();
  } catch (e) {
    console.error(e);
    products = fallbackProducts;
    toast('Offline mode', 'Using local product list (backend not available).');
  }

  filtered = [...products];
  applyFilters();
}

function setTheme(next) {
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('infinityPearlsTheme', next);
  els.themeToggle.innerHTML = next === 'light' ? '<span aria-hidden="true">🌙</span>' : '<span aria-hidden="true">☀️</span>';
}

function initTheme() {
  const saved = localStorage.getItem('infinityPearlsTheme');
  if (saved === 'light' || saved === 'dark') {
    setTheme(saved);
    return;
  }
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  setTheme(prefersLight ? 'light' : 'dark');
}

async function submitContact(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  els.contactSubmit.disabled = true;
  els.contactSubmit.textContent = 'Sending...';
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || 'Message failed');
    form.reset();
    toast('Message sent', json.message || 'Thanks for contacting Infinity Pearls!');
  } catch (e) {
    console.error(e);
    toast('Could not send', 'Please try again (backend may not be running).');
  } finally {
    els.contactSubmit.disabled = false;
    els.contactSubmit.textContent = 'Send message';
  }
}

async function loadDashboardTotals() {
  if (!supabaseClient) {
    console.warn('Supabase not configured; skipping admin totals.');
    return;
  }

  try {
    const { data, error } = await supabaseClient.from('business_totals').select('*').single();

    if (error) throw error;

    const totalSales = data.total_sales || 0;
    const totalOrders = data.total_orders || 0;
    const totalCustomers = data.total_customers || 0;

    const elSales = document.getElementById('adminTotalSales');
    const elOrders = document.getElementById('adminTotalOrders');
    const elCustomers = document.getElementById('adminTotalCustomers');

    if (elSales) elSales.textContent = moneyZAR(totalSales);
    if (elOrders) elOrders.textContent = String(totalOrders);
    if (elCustomers) elCustomers.textContent = String(totalCustomers);
  } catch (e) {
    console.error(e);
    const elSales = document.getElementById('adminTotalSales');
    const elOrders = document.getElementById('adminTotalOrders');
    const elCustomers = document.getElementById('adminTotalCustomers');
    if (elSales) elSales.textContent = 'Error';
    if (elOrders) elOrders.textContent = 'Error';
    if (elCustomers) elCustomers.textContent = 'Error';
  }
}

function initEvents() {
  // Footer year
  els.year.textContent = String(new Date().getFullYear());

  // Mobile nav
  els.navToggle.addEventListener('click', () => {
    const open = els.navMenu.classList.toggle('is-open');
    els.navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  els.navMenu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      els.navMenu.classList.remove('is-open');
      els.navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Theme
  els.themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  // Filters
  els.searchInput.addEventListener('input', applyFilters);
  els.sortSelect.addEventListener('change', applyFilters);
  els.clearSearch.addEventListener('click', () => {
    els.searchInput.value = '';
    applyFilters();
  });

  // Grid click / keyboard
  els.productsGrid.addEventListener('click', (e) => {
    const add = e.target.closest('[data-add]');
    if (add) {
      addToCart(Number(add.getAttribute('data-add')));
      return;
    }
    const card = e.target.closest('[data-product-id]');
    if (!card) return;
    const id = Number(card.getAttribute('data-product-id'));
    const product = products.find((p) => p.id === id);
    if (product) openModal(product);
  });
  els.productsGrid.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('[data-product-id]');
    if (!card) return;
    e.preventDefault();
    const id = Number(card.getAttribute('data-product-id'));
    const product = products.find((p) => p.id === id);
    if (product) openModal(product);
  });

  // Modal close
  els.modal.addEventListener('click', (e) => {
    if (e.target.matches('[data-close-modal]')) closeModal();
    if (e.target.closest('[data-close-modal]')) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (els.modal.getAttribute('aria-hidden') === 'false') closeModal();
      if (els.drawer.getAttribute('aria-hidden') === 'false') closeDrawer();
    }
  });
  els.modal.querySelectorAll('[data-close-modal]').forEach((b) =>
    b.addEventListener('click', closeModal)
  );
  els.modalAddToCart.addEventListener('click', () => {
    if (activeProductId == null) return;
    addToCart(activeProductId);
    closeModal();
    openDrawer();
  });

  // Drawer open/close
  els.cartOpen.addEventListener('click', openDrawer);
  els.drawer.querySelectorAll('[data-close-drawer]').forEach((b) =>
    b.addEventListener('click', closeDrawer)
  );
  els.drawer.addEventListener('click', (e) => {
    if (e.target.matches('[data-close-drawer]')) closeDrawer();
  });

  // Cart qty buttons (event delegation)
  els.cartItems.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-qty]');
    if (!btn) return;
    const wrap = e.target.closest('[data-cart-id]');
    if (!wrap) return;
    const id = Number(wrap.getAttribute('data-cart-id'));
    const delta = Number(btn.getAttribute('data-qty'));
    changeQty(id, delta);
  });

  els.clearCartBtn.addEventListener('click', clearCart);
  els.checkoutBtn.addEventListener('click', async () => {
    if (cart.length === 0) {
      toast('Cart is empty', 'Add at least one item to checkout.');
      return;
    }
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || 'Checkout failed');

      if (json.url) {
        window.location.href = json.url; // Redirect to Stripe Checkout
      } else {
        toast('Checkout error', 'No payment URL returned.');
      }
    } catch (e) {
      console.error(e);
      toast('Checkout failed', 'Backend may not be running. Try again later.');
    }
  });

  // Contact form
  els.contactForm.addEventListener('submit', (e) => {
    const host = window.location.hostname;
    const onNetlify = host.endsWith('netlify.app');
    if (onNetlify) {
      // Let Netlify Forms handle it (no JS submit).
      return;
    }
    e.preventDefault();
    submitContact(els.contactForm);
  });
}

// Handle return from Stripe Checkout (success or cancel)
function handleStripeReturn() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('success') === '1') {
    clearCart();
    setCartUI();
    toast('Thank you!', 'Your payment was successful. We’ll be in touch.');
    window.history.replaceState({}, document.title, window.location.pathname);
    return true;
  }
  if (params.get('canceled') === '1') {
    toast('Checkout canceled', 'Your cart is unchanged. You can continue shopping.');
    window.history.replaceState({}, document.title, window.location.pathname);
    return true;
  }
  return false;
}

// Init
window.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  loadCart();
  setCartUI();
  const fromStripe = handleStripeReturn();
  initEvents();
  await fetchProducts();
  await loadDashboardTotals();
  if (!fromStripe) toast('Welcome', 'Browse the collection and add your favorites to the cart.');
});
