/* Infinity Pearls — Frontend JS */

// ── Supabase (for admin dashboard) ──────────────────────────
const SUPABASE_URL = 'https://eascxtwbhzebrlvqzxzp.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhc2N4dHdiaHplYnJsdnF6eHpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNTk2NjcsImV4cCI6MjA4NjYzNTY2N30.30JA1cBgPE0UfKcMTNfUN_PFpg8lBtDDdcRe3KViBdQ';

let supabaseClient = null;
if (window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ── Fallback products (if API is unreachable) ────────────────
const FALLBACK_PRODUCTS = [
  { id: 1, name: 'Aqua & Pearl Spider Charm', description: 'Elegant bracelet with turquoise beads, clear crystals, and a unique spider charm', price: 60, image: 'images/IMG-20260122-WA0007.jpg' },
  { id: 2, name: 'Red & Pearl 8-Ball Bracelet', description: 'Bold red beads with white pearls featuring an 8-ball charm and star accent', price: 60, image: 'images/IMG-20260122-WA0008.jpg' },
  { id: 3, name: 'Coral & Mint Bat Charm', description: 'Unique color-blocked design with coral, orange, and mint beads with bat charm', price: 60, image: 'images/IMG-20260122-WA0010.jpg' },
  { id: 4, name: 'Rainbow Flower Power', description: 'Vibrant rainbow gradient bracelet with cheerful flower charm', price: 60, image: 'images/IMG-20260122-WA0011.jpg' },
  { id: 5, name: 'Pink & Black Heart Star', description: 'Chic pink and black beads with heart and star charm accents', price: 60, image: 'images/IMG-20260122-WA0012.jpg' },
  { id: 6, name: 'Purple Cross & Star', description: 'Deep purple beads with decorative cross and star charms', price: 60, image: 'images/IMG-20260122-WA0013.jpg' },
  { id: 7, name: 'Infinity Link Bracelet', description: 'Elegant silver bracelet with repeating infinity symbol links', price: 60, image: 'images/IMG-20260122-WA0007.jpg' },
  { id: 8, name: 'Pink Ombre Set', description: 'Delicate pink gradient bracelets - perfect matching pair', price: 60, image: 'images/IMG-20260122-WA0008.jpg' },
  { id: 9, name: 'Crystal Daisy Bracelet', description: 'Sparkling clear crystal beads with white daisy charm', price: 60, image: 'images/IMG-20260122-WA0010.jpg' },
  { id: 10, name: 'Pink Crystal Bear Charm', description: 'Sweet pink crystal beads with adorable bear face charm', price: 60, image: 'images/IMG-20260122-WA0011.jpg' },
];

// Badge from product data (set in Supabase: 'new' | 'bestseller' | null)
function getBadge(product) {
  if (product.badge === 'new')        return { label: 'New',        cls: 'product-card__badge--new' };
  if (product.badge === 'bestseller') return { label: 'Bestseller', cls: 'product-card__badge--best' };
  return null;
}

// ── Image fallback ───────────────────────────────────────────
const IMG_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Crect fill='%231a2235' width='600' height='400'/%3E%3Ctext x='50%25' y='50%25' font-size='28' fill='%23c9a84c' text-anchor='middle' dominant-baseline='middle'%3E✦%3C/text%3E%3C/svg%3E";

// ── State ────────────────────────────────────────────────────
let products = [];
let filtered = [];
let activeProductId = null;
let cart = [];

// ── Helpers ──────────────────────────────────────────────────
function zar(value) {
  return `R${Number(value || 0).toFixed(2)}`;
}

function toast(title, text) {
  const wrap = document.getElementById('toasts');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<div class="toast__title"></div><div class="toast__text"></div>`;
  el.querySelector('.toast__title').textContent = title;
  el.querySelector('.toast__text').textContent = text || '';
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// ── Cart persistence ─────────────────────────────────────────
function saveCart() {
  localStorage.setItem('ip_cart', JSON.stringify(cart));
}
function loadCart() {
  try {
    const raw = localStorage.getItem('ip_cart');
    cart = raw ? JSON.parse(raw) : [];
  } catch { cart = []; }
}
function cartCount() { return cart.reduce((s, i) => s + i.quantity, 0); }
function cartTotal() { return cart.reduce((s, i) => s + i.price * i.quantity, 0); }

// ── Cart UI ──────────────────────────────────────────────────
function updateCartUI() {
  const countEl = document.getElementById('cartCount');
  const totalEl = document.getElementById('cartTotal');
  const itemsEl = document.getElementById('cartItems');

  if (countEl) countEl.textContent = String(cartCount());
  if (totalEl) totalEl.textContent = zar(cartTotal());
  if (!itemsEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = `<div class="cart-empty">Your cart is empty.<br>Add something you love ✦</div>`;
    return;
  }

  itemsEl.innerHTML = cart.map((item) => `
    <div class="cart-item" data-cart-id="${item.id}">
      <img src="${item.image}" alt="${item.name}" loading="lazy"
           onerror="this.onerror=null;this.src='${IMG_FALLBACK}'">
      <div>
        <p class="cart-item__name">${item.name}</p>
        <p class="cart-item__meta">${zar(item.price)} &middot; qty: ${item.quantity}</p>
      </div>
      <div class="qty" aria-label="Quantity for ${item.name}">
        <button type="button" data-qty="-1" aria-label="Decrease">−</button>
        <span>${item.quantity}</span>
        <button type="button" data-qty="1" aria-label="Increase">+</button>
      </div>
    </div>
  `).join('');
}

function addToCart(id) {
  const product = products.find((p) => p.id === id);
  if (!product) return;
  const existing = cart.find((c) => c.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({ ...product, quantity: 1 });
  saveCart();
  updateCartUI();
  toast('Added to cart ✦', product.name);
}

function changeQty(id, delta) {
  const item = cart.find((c) => c.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) cart = cart.filter((c) => c.id !== id);
  saveCart();
  updateCartUI();
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartUI();
  toast('Cart cleared', 'Your cart is now empty.');
}

// ── Drawer ───────────────────────────────────────────────────
function openDrawer() {
  document.getElementById('cartDrawer')?.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  document.getElementById('cartDrawer')?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// ── Product Modal ────────────────────────────────────────────
function openModal(product) {
  activeProductId = product.id;
  const modal = document.getElementById('productModal');
  const img   = document.getElementById('modalImage');
  const title = document.getElementById('modalTitle');
  const desc  = document.getElementById('modalDescription');
  const price = document.getElementById('modalPrice');
  const wa    = document.getElementById('modalWhatsapp');

  if (img)   { img.onerror = () => { img.onerror = null; img.src = IMG_FALLBACK; }; img.src = product.image; img.alt = product.name; }
  if (title) title.textContent = product.name;
  if (desc)  desc.textContent  = product.description;
  if (price) price.textContent = zar(product.price);
  if (wa)    wa.href = `https://wa.me/27645575188?text=${encodeURIComponent(`Hi! I'd like to order: ${product.name} (R${product.price})`)}`;

  modal?.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('productModal')?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  activeProductId = null;
}

// ── Products rendering ───────────────────────────────────────
function sortProducts(list, key) {
  const copy = [...list];
  if (key === 'price-asc')  copy.sort((a, b) => a.price - b.price);
  if (key === 'price-desc') copy.sort((a, b) => b.price - a.price);
  if (key === 'name-asc')   copy.sort((a, b) => a.name.localeCompare(b.name));
  return copy;
}

function applyFilters() {
  const q       = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
  const sortKey = document.getElementById('sortSelect')?.value || 'featured';

  filtered = products.filter((p) => {
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
  });
  filtered = sortProducts(filtered, sortKey);
  renderGrid();
}

function renderGrid() {
  const grid  = document.getElementById('productsGrid');
  const empty = document.getElementById('emptyState');
  if (!grid) return;

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;

  grid.innerHTML = filtered.map((p, i) => {
    const badge = getBadge(p);
    return `
      <article class="product-card" tabindex="0" role="button"
               aria-label="View ${p.name}" data-product-id="${p.id}"
               style="animation-delay:${i * 0.05}s">
        ${badge ? `<span class="product-card__badge ${badge.cls}">${badge.label}</span>` : ''}
        <div class="product-card__img-wrap">
          <img class="product-card__img" src="${p.image}" alt="${p.name}" loading="lazy"
               onerror="this.onerror=null;this.src='${IMG_FALLBACK}'">
          <div class="product-card__overlay">
            <button class="btn btn--gold" type="button" data-add="${p.id}" aria-label="Add ${p.name} to cart">
              Add to Cart
            </button>
          </div>
        </div>
        <div class="product-card__body">
          <h3 class="product-card__name">${p.name}</h3>
          <p class="product-card__desc">${p.description}</p>
          <div class="product-card__row">
            <span class="product-card__price">${zar(p.price)}</span>
            <button class="product-card__add" type="button" data-add="${p.id}" aria-label="Add ${p.name}">Add</button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

async function fetchProducts() {
  try {
    const res = await fetch('/api/products', { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('Failed');
    products = await res.json();
  } catch {
    products = FALLBACK_PRODUCTS;
  }
  filtered = [...products];
  applyFilters();
}

// ── Theme ────────────────────────────────────────────────────
function setTheme(next) {
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('ip_theme', next);
  const icon = document.querySelector('.theme-icon');
  if (icon) icon.textContent = next === 'light' ? '🌙' : '☀️';
}

function initTheme() {
  const saved = localStorage.getItem('ip_theme');
  if (saved === 'light' || saved === 'dark') { setTheme(saved); return; }
  setTheme(window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
}

// ── Contact form ─────────────────────────────────────────────
async function submitContact(form) {
  const btn  = document.getElementById('contactSubmit');
  const hint = document.getElementById('contactHint');
  const data = Object.fromEntries(new FormData(form).entries());

  if (btn)  { btn.disabled = true; btn.textContent = 'Sending…'; }
  if (hint) hint.textContent = '';

  try {
    const res  = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || 'Failed');
    form.reset();
    toast('Message sent ✦', json.message || 'Thanks! We\'ll reply soon.');
    if (hint) hint.textContent = 'Message sent — we\'ll be in touch!';
  } catch (e) {
    toast('Could not send', e.message || 'Please try again.');
    if (hint) hint.textContent = 'Something went wrong. Try WhatsApp instead.';
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Send Message'; }
  }
}

// ── Checkout ─────────────────────────────────────────────────
async function handleCheckout() {
  if (cart.length === 0) {
    toast('Cart is empty', 'Add at least one item before checking out.');
    return;
  }
  const btn = document.getElementById('checkoutBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Processing…'; }

  try {
    const res  = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: cart }) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || 'Checkout failed');
    if (json.url) {
      window.location.href = json.url;
    } else {
      throw new Error('No payment URL returned.');
    }
  } catch (e) {
    console.error(e);
    toast('Checkout failed', e.message || 'Please try again.');
    if (btn) { btn.disabled = false; btn.textContent = 'Checkout'; }
  }
}

// ── Admin dashboard ──────────────────────────────────────────
async function loadAdminTotals() {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient.from('business_totals').select('*').single();
    if (error) throw error;
    const s = document.getElementById('adminTotalSales');
    const o = document.getElementById('adminTotalOrders');
    const c = document.getElementById('adminTotalCustomers');
    if (s) s.textContent = zar(data.total_sales || 0);
    if (o) o.textContent = String(data.total_orders || 0);
    if (c) c.textContent = String(data.total_customers || 0);
  } catch (e) {
    console.warn('Admin totals error:', e.message);
  }
}

// ── Stripe return ────────────────────────────────────────────
function handleStripeReturn() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('success') === '1') {
    clearCart();
    updateCartUI();
    toast('Payment successful ✦', 'Thank you! Your order is confirmed. We\'ll be in touch.');
    window.history.replaceState({}, '', window.location.pathname);
    return true;
  }
  if (params.get('canceled') === '1') {
    toast('Checkout canceled', 'Your cart is unchanged. Continue shopping anytime.');
    window.history.replaceState({}, '', window.location.pathname);
    return true;
  }
  return false;
}

// ── Scroll reveal ────────────────────────────────────────────
function initScrollReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
}

// ── Sticky nav ───────────────────────────────────────────────
function initStickyNav() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ── Events ───────────────────────────────────────────────────
function initEvents() {
  // Footer year
  const yr = document.getElementById('year');
  if (yr) yr.textContent = String(new Date().getFullYear());

  // Announcement bar close
  document.getElementById('announceClose')?.addEventListener('click', () => {
    document.getElementById('announce')?.remove();
  });

  // Mobile nav toggle
  const toggle  = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  toggle?.addEventListener('click', () => {
    const open = navMenu?.classList.toggle('is-open');
    toggle.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navMenu?.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      navMenu.classList.remove('is-open');
      toggle?.classList.remove('active');
      toggle?.setAttribute('aria-expanded', 'false');
    });
  });

  // Theme toggle
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(cur === 'dark' ? 'light' : 'dark');
  });

  // Search & sort
  document.getElementById('searchInput')?.addEventListener('input', applyFilters);
  document.getElementById('sortSelect')?.addEventListener('change', applyFilters);
  document.getElementById('clearSearch')?.addEventListener('click', () => {
    const s = document.getElementById('searchInput');
    if (s) s.value = '';
    applyFilters();
  });

  // Products grid (click & keyboard)
  const grid = document.getElementById('productsGrid');
  grid?.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-add]');
    if (addBtn) { addToCart(Number(addBtn.dataset.add)); return; }
    const card = e.target.closest('[data-product-id]');
    if (card) openModal(products.find((p) => p.id === Number(card.dataset.productId)));
  });
  grid?.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('[data-product-id]');
    if (!card) return;
    e.preventDefault();
    openModal(products.find((p) => p.id === Number(card.dataset.productId)));
  });

  // Modal
  document.getElementById('productModal')?.addEventListener('click', (e) => {
    if (e.target.dataset.closeModal !== undefined || e.target.closest('[data-close-modal]')) closeModal();
  });
  document.getElementById('modalAddToCart')?.addEventListener('click', () => {
    if (activeProductId == null) return;
    addToCart(activeProductId);
    closeModal();
    openDrawer();
  });

  // Cart drawer
  document.getElementById('cartOpen')?.addEventListener('click', openDrawer);
  document.getElementById('cartDrawer')?.addEventListener('click', (e) => {
    if (e.target.dataset.closeDrawer !== undefined || e.target.closest('[data-close-drawer]')) closeDrawer();
  });
  document.getElementById('cartItems')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-qty]');
    if (!btn) return;
    const wrap = btn.closest('[data-cart-id]');
    if (!wrap) return;
    changeQty(Number(wrap.dataset.cartId), Number(btn.dataset.qty));
  });
  document.getElementById('clearCartBtn')?.addEventListener('click', clearCart);
  document.getElementById('checkoutBtn')?.addEventListener('click', handleCheckout);

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (document.getElementById('productModal')?.getAttribute('aria-hidden') === 'false') closeModal();
    if (document.getElementById('cartDrawer')?.getAttribute('aria-hidden') === 'false') closeDrawer();
  });

  // Contact form
  document.getElementById('contactForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    submitContact(e.target);
  });

  // Newsletter form
  document.getElementById('newsletterForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = e.target.querySelector('input[type="email"]');
    toast('Subscribed ✦', `Thanks! We'll keep ${input?.value || 'you'} in the loop.`);
    e.target.reset();
  });
}

// ── Admin visibility (URL param: ?admin=1) ───────────────────
function maybeShowAdmin() {
  if (new URLSearchParams(window.location.search).get('admin') === '1') {
    const sec = document.getElementById('admin');
    if (sec) { sec.style.display = ''; sec.removeAttribute('aria-hidden'); }
    loadAdminTotals();
  }
}

// ── Init ─────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initStickyNav();
  loadCart();
  updateCartUI();

  const fromStripe = handleStripeReturn();
  initEvents();
  initScrollReveal();
  maybeShowAdmin();

  await fetchProducts();

  if (!fromStripe) {
    setTimeout(() => toast('Welcome to Infinity Pearls ✦', 'Browse the collection and add your favorites to cart.'), 600);
  }
});
