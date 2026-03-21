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
  { id: 1,  name: 'Infinity Link Bracelet',          description: 'Elegant silver bracelet with repeating infinity symbol links',                         price: 35, image: 'images/IMG-20260318-WA0058.jpg', badge: 'bestseller' },
  { id: 2,  name: 'Silver Star Necklace',             description: 'Delicate silver chain necklace with a dainty star pendant',                            price: 65, image: 'images/IMG-20260318-WA0059.jpg', badge: 'new' },
  { id: 3,  name: 'Silver Cross Necklace',            description: 'Minimalist silver chain with an elegant open cross pendant',                           price: 65, image: 'images/IMG-20260318-WA0060.jpg', badge: 'new' },
  { id: 4,  name: 'Letter & Star Charm Necklace',     description: 'Silver chain necklace with initial letter pendant and star charms',                    price: 65, image: 'images/IMG-20260318-WA0061.jpg', badge: 'new' },
  { id: 5,  name: 'Custom Name Bracelets',            description: 'Personalised pearl bracelets with letter beads, flower and butterfly charms',           price: 50, image: 'images/IMG-20260318-WA0062.jpg', badge: 'bestseller' },
  { id: 6,  name: 'Blue Crystal Cross Bracelet Set',  description: 'Stunning blue and clear crystal bead bracelet pair with cross and angel charms',       price: 80, image: 'images/IMG-20260318-WA0063.jpg', badge: null },
  { id: 7,  name: 'Pink Crystal Bear Bracelet',       description: 'Sweet pink crystal beads with adorable bear face charm and dangle accent',             price: 45, image: 'images/IMG-20260318-WA0064.jpg', badge: 'bestseller' },
  { id: 8,  name: 'Crystal Daisy Bracelet',           description: 'Sparkling clear crystal beads with a beautiful white daisy flower charm',              price: 45, image: 'images/IMG-20260318-WA0065.jpg', badge: null },
  { id: 9,  name: 'Pink & Black Hello Kitty Bracelet', description: 'Pink and black beads with crystal spacers and Hello Kitty star charm',               price: 45, image: 'images/IMG-20260318-WA0066.jpg', badge: null },
  { id: 10, name: 'Gothic Cross Link Bracelet',       description: 'Bold silver gothic cross link bracelet with vintage charm',                            price: 50, image: 'images/IMG-20260318-WA0067.jpg', badge: null },
  { id: 11, name: 'Leopard Charm Bangle',             description: 'Silver cable bangle with leopard print beads, 8-ball, cherry and cheetah charms',      price: 65, image: 'images/IMG-20260223-WA0008.jpg', badge: 'new' },
  { id: 12, name: "Cat's Eye Bead Bracelet",           description: 'Smooth cat eye glass bead stretch bracelet, available in pink, blue, yellow, orange, burgundy, red and green', price: 30, image: 'images/IMG-20260319-WA0083.jpg', badge: 'new' },
  { id: 13, name: 'Red Pearl 8-Ball Bracelet',         description: 'Red and pearl bead bracelet with 8-ball charm and silver star dangle',                  price: 40, image: 'images/IMG-20260319-WA0084.jpg', badge: 'new' },
  { id: 14, name: 'Hot Pink Cross & Star Bracelet',    description: 'Vibrant hot pink bead bracelet with crystal spacers, rhinestone cross and star charms', price: 40, image: 'images/IMG-20260319-WA0086.jpg', badge: 'new' },
  { id: 15, name: 'Green Pearl 8-Ball Bracelet',       description: 'Green and pearl bead bracelet with 8-ball charm and silver star dangle',                price: 40, image: 'images/IMG-20260319-WA0087.jpg', badge: 'new' },
  { id: 16, name: 'Yellow Silver 8-Ball Bracelet',     description: 'Yellow and silver bead bracelet with 8-ball charm and star dangle',                     price: 40, image: 'images/IMG-20260319-WA0088.jpg', badge: 'new' },
  { id: 17, name: 'Blue Crystal Charm Bracelet',       description: 'Soft blue crystal bead bracelet with crystal spacers and charm (paw, letter or owl)',   price: 40, image: 'images/IMG-20260319-WA0089.jpg', badge: 'new' },
  { id: 18, name: 'Purple Spider Charm Bracelet',      description: 'Purple and lilac bead bracelet with crystal spacers and silver spider charm',           price: 40, image: 'images/IMG-20260319-WA0090.jpg', badge: 'new' },
  { id: 19, name: 'Pink Charm Bracelet',               description: 'Pink and white bead bracelet with crystal spacers and charm (star, letter or heart)',   price: 40, image: 'images/IMG-20260319-WA0091.jpg', badge: 'new' },
  { id: 20, name: 'Yellow Charm Bracelet',             description: 'Yellow and white bead bracelet with charm options (butterfly, letter, smiley daisy)',   price: 40, image: 'images/IMG-20260319-WA0092.jpg', badge: 'new' },
  { id: 21, name: 'Aqua Spider Charm Bracelet',        description: 'Aqua and clear crystal bead bracelet with crystal spacers and silver spider charm',     price: 40, image: 'images/IMG-20260319-WA0093.jpg', badge: 'new' },
  { id: 22, name: 'Black Spider Charm Bracelet',       description: 'Black and clear crystal bead bracelet with crystal spacers and silver spider charm',    price: 40, image: 'images/IMG-20260319-WA0094.jpg', badge: 'new' },
  { id: 23, name: 'Evil Eye Bracelet Set (3 Pack)',    description: 'Crystal and evil eye bead bracelet set with star chain, cross charm and evil eye beads', price: 120, image: 'images/IMG-20260319-WA0095.jpg', badge: 'bestseller' },
  { id: 24, name: 'Pearl & Star Bead Necklace',        description: 'Delicate pearl bead necklace with iridescent star beads and star charm',                price: 70, image: 'images/IMG-20260319-WA0096.jpg', badge: 'new' },
  { id: 25, name: 'Gamer Charm Necklace',              description: 'Silver chain necklace with controller, butterfly, dice, evil eye and cross charms',      price: 100, image: 'images/IMG-20260319-WA0097.jpg', badge: 'new' },
  { id: 26, name: 'Skull & Bones Gothic Necklace',     description: 'Gothic bead necklace with skull, dice, butterfly, bone beads and cross pendant',        price: 100, image: 'images/IMG-20260319-WA0098.jpg', badge: 'new' },
  { id: 27, name: '"Truth" Gothic Charm Necklace',     description: 'Black gothic chain necklace with dice, wings, butterfly, flower charms and "Truth" letter beads', price: 90, image: 'images/IMG-20260319-WA0099.jpg', badge: 'new' },
  { id: 28, name: 'Custom Name Charm Necklace',        description: 'Colourful custom name bead necklace with skulls, aliens, mushrooms, crosses and butterfly charms', price: 100, image: 'images/IMG-20260319-WA0100.jpg', badge: 'bestseller' },
];

// Badge from product data (set in Supabase: 'new' | 'bestseller' | null)
function getBadge(product) {
  if (product.badge === 'new')        return { label: 'New',        cls: 'product-card__badge--new' };
  if (product.badge === 'bestseller') return { label: 'Bestseller', cls: 'product-card__badge--best' };
  return null;
}

// ── Image fallback ───────────────────────────────────────────
const IMG_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Crect fill='%23f0f0f0' width='600' height='600'/%3E%3Ctext x='50%25' y='50%25' font-size='28' fill='%23999' text-anchor='middle' dominant-baseline='middle'%3E✦%3C/text%3E%3C/svg%3E";

// ── State ────────────────────────────────────────────────────
let products = [];
let filtered = [];
let activeProductId = null;
let cart = [];
let activeFilter = 'all';

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
  const totalEl = document.getElementById('cartTotal');
  const itemsEl = document.getElementById('cartItems');

  // Update bottom nav cart badge
  const bottomCount = document.getElementById('bottomCartCount');
  const count = cartCount();
  if (bottomCount) {
    bottomCount.textContent = String(count);
    bottomCount.hidden = count === 0;
  }

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
  toast('Added to cart', product.name);
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
    // Text search
    if (q && !p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false;
    // Category filter
    if (activeFilter === 'bracelets') return p.name.toLowerCase().includes('bracelet') || p.name.toLowerCase().includes('bangle');
    if (activeFilter === 'necklaces') return p.name.toLowerCase().includes('necklace');
    return true;
  });
  filtered = sortProducts(filtered, sortKey);

  // Update item count
  const countEl = document.getElementById('itemCount');
  if (countEl) countEl.textContent = `${filtered.length} item${filtered.length !== 1 ? 's' : ''}`;

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
        <div class="product-card__img-wrap">
          ${badge ? `<span class="product-card__badge ${badge.cls}">${badge.label}</span>` : ''}
          <img class="product-card__img" src="${p.image}" alt="${p.name}" loading="lazy"
               onerror="this.onerror=null;this.src='${IMG_FALLBACK}'">
          <button class="product-card__heart" type="button" data-heart="${p.id}" aria-label="Add to wishlist">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          </button>
        </div>
        <div class="product-card__body">
          <h3 class="product-card__name">${p.name}</h3>
          <span class="product-card__price">${zar(p.price)}</span>
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
    toast('Message sent', json.message || 'Thanks! We\'ll reply soon.');
    if (hint) hint.textContent = 'Message sent — we\'ll be in touch!';
  } catch (e) {
    toast('Could not send', e.message || 'Please try again.');
    if (hint) hint.textContent = 'Something went wrong. Try WhatsApp instead.';
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Send Message'; }
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
    toast('Payment successful', 'Thank you! Your order is confirmed.');
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

// ── Bottom Nav ───────────────────────────────────────────────
function switchTab(tab) {
  const tabs = document.querySelectorAll('.bottom-nav__tab');
  tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === tab));

  const productsSection = document.getElementById('products');
  const homeSection     = document.getElementById('homeSection');
  const filterBar       = document.getElementById('filterBar');
  const itemCount       = document.getElementById('itemCount');
  const searchBar       = document.getElementById('searchBar');

  // Hide all by default
  if (productsSection) productsSection.style.display = 'none';
  if (homeSection)     homeSection.classList.remove('visible');
  if (filterBar)       filterBar.style.display = 'none';
  if (itemCount)       itemCount.style.display = 'none';
  if (searchBar)       searchBar.hidden = true;

  switch (tab) {
    case 'shop':
      if (productsSection) productsSection.style.display = '';
      if (filterBar)       filterBar.style.display = '';
      if (itemCount)       itemCount.style.display = '';
      break;
    case 'home':
      if (homeSection) homeSection.classList.add('visible');
      break;
    case 'cart':
      openDrawer();
      // Keep shop visible behind drawer
      if (productsSection) productsSection.style.display = '';
      if (filterBar)       filterBar.style.display = '';
      if (itemCount)       itemCount.style.display = '';
      break;
    case 'wallet':
      if (currentUser) {
        openAccountDrawer();
        switchAccountTab('orders');
      } else {
        openAuthModal('login');
      }
      // Keep shop visible behind drawer
      if (productsSection) productsSection.style.display = '';
      if (filterBar)       filterBar.style.display = '';
      if (itemCount)       itemCount.style.display = '';
      break;
    case 'profile':
      if (currentUser) {
        openAccountDrawer();
      } else {
        openAuthModal('login');
      }
      // Keep shop visible behind drawer
      if (productsSection) productsSection.style.display = '';
      if (filterBar)       filterBar.style.display = '';
      if (itemCount)       itemCount.style.display = '';
      break;
  }
}

// ── Events ───────────────────────────────────────────────────
function initEvents() {
  // Footer year
  const yr = document.getElementById('year');
  if (yr) yr.textContent = String(new Date().getFullYear());

  // Search toggle
  document.getElementById('searchToggle')?.addEventListener('click', () => {
    const bar = document.getElementById('searchBar');
    if (!bar) return;
    bar.hidden = !bar.hidden;
    if (!bar.hidden) document.getElementById('searchInput')?.focus();
  });
  document.getElementById('searchClose')?.addEventListener('click', () => {
    const bar = document.getElementById('searchBar');
    if (bar) bar.hidden = true;
    const input = document.getElementById('searchInput');
    if (input) { input.value = ''; applyFilters(); }
  });

  // Search & sort
  document.getElementById('searchInput')?.addEventListener('input', applyFilters);
  document.getElementById('sortSelect')?.addEventListener('change', applyFilters);
  document.getElementById('clearSearch')?.addEventListener('click', () => {
    const s = document.getElementById('searchInput');
    if (s) s.value = '';
    applyFilters();
  });

  // Filter pills
  document.querySelectorAll('.filter-pill[data-filter]').forEach((pill) => {
    pill.addEventListener('click', () => {
      activeFilter = pill.dataset.filter;
      document.querySelectorAll('.filter-pill[data-filter]').forEach((p) => p.classList.toggle('active', p === pill));
      applyFilters();
    });
  });

  // Products grid (click & keyboard)
  const grid = document.getElementById('productsGrid');
  grid?.addEventListener('click', (e) => {
    // Heart button
    const heartBtn = e.target.closest('[data-heart]');
    if (heartBtn) {
      e.stopPropagation();
      heartBtn.classList.toggle('liked');
      return;
    }
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
  document.getElementById('checkoutBtn')?.addEventListener('click', openCheckoutModal);

  // Bottom nav
  document.querySelectorAll('.bottom-nav__tab').forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (document.getElementById('productModal')?.getAttribute('aria-hidden') === 'false') closeModal();
    if (document.getElementById('cartDrawer')?.getAttribute('aria-hidden') === 'false') closeDrawer();
    if (document.getElementById('authModal')?.getAttribute('aria-hidden') === 'false') closeAuthModal();
    if (document.getElementById('accountDrawer')?.getAttribute('aria-hidden') === 'false') closeAccountDrawer();
    if (document.getElementById('checkoutModal')?.getAttribute('aria-hidden') === 'false') closeCheckoutModal();
  });

  // Contact form
  document.getElementById('contactForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    submitContact(e.target);
  });

  // Newsletter form
  document.getElementById('newsletterForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = e.target.querySelector('input[type="email"]');
    const email = input?.value?.trim() || '';
    if (!email) return;
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Failed');
      toast('Subscribed', `Thanks! We'll keep ${email} in the loop.`);
      e.target.reset();
    } catch {
      toast('Oops', 'Could not subscribe. Please try again.');
    }
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
  loadCart();
  updateCartUI();

  const fromStripe = handleStripeReturn();
  initEvents();
  initAuthEvents();
  initAccountEvents();
  initCheckoutEvents();
  maybeShowAdmin();
  initAuth();

  await fetchProducts();

  if (!fromStripe) {
    setTimeout(() => toast('Welcome to Infinity Pearls', 'Browse the collection and add your favorites to cart.'), 600);
  }
});

// ════════════════════════════════════════════════════════════
// AUTH — Supabase Auth (email/password + Google)
// ════════════════════════════════════════════════════════════

let currentUser = null;

async function initAuth() {
  if (!supabaseClient) return;
  const { data: { session } } = await supabaseClient.auth.getSession();
  currentUser = session?.user || null;
  updateAuthUI();

  supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    currentUser = session?.user || null;
    updateAuthUI();
    if (_event === 'SIGNED_IN' && currentUser) {
      // Upsert customer record
      var userName = currentUser.user_metadata?.full_name || null;
      await supabaseClient.from('customers').upsert(
        { email: currentUser.email, auth_user_id: currentUser.id,
          name: userName },
        { onConflict: 'email' }
      );
      // If no name in auth metadata, fetch from customers table
      if (!userName) {
        var custResult = await supabaseClient
          .from('customers').select('name').eq('email', currentUser.email).maybeSingle();
        if (custResult.data?.name) {
          await supabaseClient.auth.updateUser({ data: { full_name: custResult.data.name } });
        }
      }
      updateAuthUI();
    }
  });
}

function updateAuthUI() {
  const emailEl  = document.getElementById('accountEmail');
  const avatarEl = document.getElementById('accountAvatar');
  const nameEl   = document.getElementById('accountName');
  var displayName = currentUser?.user_metadata?.full_name || '';
  if (emailEl)  emailEl.textContent = currentUser?.email || '';
  if (avatarEl) avatarEl.textContent = (displayName || currentUser?.email || '?')[0].toUpperCase();
  if (nameEl)   nameEl.textContent = displayName;
  const pName  = document.getElementById('profileName');
  const pEmail = document.getElementById('profileEmail');
  if (pEmail && currentUser) pEmail.value = currentUser.email || '';
  if (pName  && currentUser) pName.value  = displayName;
}

function openAuthModal(tab) {
  tab = tab || 'login';
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  switchAuthTab(tab);
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  const lh = document.getElementById('loginHint');
  const rh = document.getElementById('registerHint');
  if (lh) lh.textContent = '';
  if (rh) rh.textContent = '';
}

function switchAuthTab(tab) {
  const loginBtn  = document.getElementById('loginTabBtn');
  const regBtn    = document.getElementById('registerTabBtn');
  const loginPane = document.getElementById('loginPane');
  const regPane   = document.getElementById('registerPane');
  if (tab === 'login') {
    loginBtn.classList.add('active');   regBtn.classList.remove('active');
    loginPane.hidden = false;           regPane.hidden = true;
  } else {
    regBtn.classList.add('active');     loginBtn.classList.remove('active');
    regPane.hidden = false;             loginPane.hidden = true;
  }
}

async function handleLogin(email, password) {
  const hint = document.getElementById('loginHint');
  hint.textContent = 'Signing in...';
  const { error } = await supabaseClient.auth.signInWithPassword({ email: email, password: password });
  if (error) { hint.textContent = error.message; return; }
  closeAuthModal();
  toast('Welcome back', email);
}

async function handleRegister(name, email, password) {
  const hint = document.getElementById('registerHint');
  hint.textContent = 'Creating account...';
  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password,
    options: { data: { full_name: name } },
  });
  if (error) { hint.textContent = error.message; return; }
  if (data && data.user) {
    await supabaseClient.from('customers').upsert(
      { name: name, email: email, auth_user_id: data.user.id },
      { onConflict: 'email' }
    );
  }
  hint.textContent = '';
  closeAuthModal();
  toast('Account created', 'Check your email to confirm your address.');
}

async function handleGoogleLogin() {
  if (!supabaseClient) return;
  await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
}

async function handleSignOut() {
  if (!supabaseClient) return;
  await supabaseClient.auth.signOut();
  currentUser = null;
  updateAuthUI();
  closeAccountDrawer();
  toast('Signed out', 'See you next time!');
}

function initAuthEvents() {
  document.getElementById('loginTabBtn')?.addEventListener('click', function() { switchAuthTab('login'); });
  document.getElementById('registerTabBtn')?.addEventListener('click', function() { switchAuthTab('register'); });
  document.getElementById('authClose')?.addEventListener('click', closeAuthModal);
  document.getElementById('authBackdrop')?.addEventListener('click', closeAuthModal);

  document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    var email = document.getElementById('loginEmail').value.trim();
    var pass  = document.getElementById('loginPassword').value;
    if (email && pass) handleLogin(email, pass);
  });

  document.getElementById('registerForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    var name  = document.getElementById('registerName').value.trim();
    var email = document.getElementById('registerEmail').value.trim();
    var pass  = document.getElementById('registerPassword').value;
    if (name && email && pass) handleRegister(name, email, pass);
  });

  document.getElementById('googleLoginBtn')?.addEventListener('click', handleGoogleLogin);
  document.getElementById('googleRegisterBtn')?.addEventListener('click', handleGoogleLogin);
}

// ════════════════════════════════════════════════════════════
// ACCOUNT DRAWER
// ════════════════════════════════════════════════════════════

function openAccountDrawer() {
  if (!currentUser) { openAuthModal('login'); return; }
  var drawer = document.getElementById('accountDrawer');
  if (!drawer) return;
  drawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  updateAuthUI();
  switchAccountTab('profile');
}

function closeAccountDrawer() {
  var drawer = document.getElementById('accountDrawer');
  if (!drawer) return;
  drawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function switchAccountTab(tab) {
  var panes = { profile: 'profilePane', orders: 'ordersPane', addresses: 'addressesPane' };
  Object.keys(panes).forEach(function(key) {
    var el = document.getElementById(panes[key]);
    if (el) el.hidden = (key !== tab);
  });
  document.querySelectorAll('.account-tab-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  if (tab === 'orders')    loadOrders();
  if (tab === 'addresses') loadAddresses();
}

async function loadOrders() {
  if (!supabaseClient || !currentUser) return;
  var loadingEl = document.getElementById('ordersLoading');
  var listEl    = document.getElementById('ordersList');
  var emptyEl   = document.getElementById('ordersEmpty');
  if (loadingEl) loadingEl.hidden = false;
  if (listEl)    listEl.innerHTML = '';

  var custResult = await supabaseClient
    .from('customers').select('id').eq('email', currentUser.email).maybeSingle();
  var customer = custResult.data;

  if (!customer) {
    if (loadingEl) loadingEl.hidden = true;
    if (emptyEl)   emptyEl.hidden = false;
    return;
  }

  var ordResult = await supabaseClient
    .from('orders')
    .select('id, status, total_amount, created_at, shipping_name, shipping_email, shipping_street, shipping_city, shipping_province, shipping_postal, shipping_country, order_items(product_name, quantity, unit_price)')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false });
  var orders = ordResult.data;

  if (loadingEl) loadingEl.hidden = true;
  if (!orders || orders.length === 0) { if (emptyEl) emptyEl.hidden = false; return; }
  if (emptyEl) emptyEl.hidden = true;

  listEl.innerHTML = orders.map(function(o) {
    var items = (o.order_items || []).map(function(i) { return i.product_name + ' x' + i.quantity; }).join(', ');
    var date  = new Date(o.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
    var idStr = String(o.id).padStart(4, '0');
    var shipTo = [o.shipping_street, o.shipping_city, o.shipping_province, o.shipping_postal, o.shipping_country].filter(Boolean).join(', ');
    var shipName = o.shipping_name || '';
    var shipEmail = o.shipping_email || '';
    return '<li class="order-card">' +
      '<div class="order-card__header">' +
        '<span class="order-card__id">#' + idStr + '</span>' +
        '<span class="order-card__status order-card__status--' + o.status + '">' + o.status + '</span>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center">' +
        '<span class="order-card__date">' + date + '</span>' +
        '<span class="order-card__total">' + zar(o.total_amount) + '</span>' +
      '</div>' +
      '<p class="order-card__items">' + items + '</p>' +
      (shipName || shipEmail || shipTo ?
        '<div class="order-card__shipping">' +
          '<span class="order-card__shipping-label">Ship to:</span>' +
          (shipName ? ' <strong>' + shipName + '</strong>' : '') +
          (shipEmail ? ' (' + shipEmail + ')' : '') +
          (shipTo ? '<br><span class="order-card__shipping-addr">' + shipTo + '</span>' : '') +
        '</div>' : '') +
    '</li>';
  }).join('');
}

async function loadAddresses() {
  if (!supabaseClient || !currentUser) return;
  var listEl  = document.getElementById('addressList');
  var emptyEl = document.getElementById('addressesEmpty');
  if (!listEl) return;
  listEl.innerHTML = '';

  var result = await supabaseClient
    .from('saved_addresses')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('is_default', { ascending: false });
  var addrs = result.data;

  if (!addrs || addrs.length === 0) { if (emptyEl) emptyEl.hidden = false; return; }
  if (emptyEl) emptyEl.hidden = true;

  listEl.innerHTML = addrs.map(function(a) {
    var addrText = [a.street, a.city, a.province, a.postal_code, a.country].filter(Boolean).join(', ');
    var defBadge = a.is_default ? '<span class="address-card__default-badge">Default · </span>' : '';
    var setBtn   = !a.is_default ? '<button class="address-card__btn" data-set-default="' + a.id + '">Set default</button>' : '';
    return '<li class="address-card ' + (a.is_default ? 'address-card--default' : '') + '" data-addr-id="' + a.id + '">' +
      '<div class="address-card__text">' + defBadge + addrText + '</div>' +
      '<div class="address-card__actions">' +
        setBtn +
        '<button class="address-card__btn" data-delete-addr="' + a.id + '">Delete</button>' +
      '</div>' +
    '</li>';
  }).join('');

  listEl.querySelectorAll('[data-set-default]').forEach(function(btn) {
    btn.addEventListener('click', function() { setDefaultAddress(Number(btn.dataset.setDefault)); });
  });
  listEl.querySelectorAll('[data-delete-addr]').forEach(function(btn) {
    btn.addEventListener('click', function() { deleteAddress(Number(btn.dataset.deleteAddr)); });
  });
}

async function setDefaultAddress(id) {
  if (!supabaseClient || !currentUser) return;
  await supabaseClient.from('saved_addresses').update({ is_default: false }).eq('user_id', currentUser.id);
  await supabaseClient.from('saved_addresses').update({ is_default: true }).eq('id', id).eq('user_id', currentUser.id);
  loadAddresses();
}

async function deleteAddress(id) {
  if (!supabaseClient || !currentUser) return;
  await supabaseClient.from('saved_addresses').delete().eq('id', id).eq('user_id', currentUser.id);
  loadAddresses();
}

function initAccountEvents() {
  document.getElementById('accountDrawerClose')?.addEventListener('click', closeAccountDrawer);
  document.getElementById('accountBackdrop')?.addEventListener('click', closeAccountDrawer);
  document.getElementById('signOutBtn')?.addEventListener('click', handleSignOut);

  document.querySelectorAll('.account-tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { switchAccountTab(btn.dataset.tab); });
  });

  document.getElementById('profileForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    var name  = document.getElementById('profileName').value.trim();
    var email = document.getElementById('profileEmail').value.trim();
    var hint  = document.getElementById('profileHint');
    if (!supabaseClient || !currentUser) return;
    hint.textContent = 'Saving...';
    var updateResult = await supabaseClient.auth.updateUser({ email: email, data: { full_name: name } });
    if (updateResult.error) { hint.textContent = updateResult.error.message; return; }
    await supabaseClient.from('customers').update({ name: name }).eq('auth_user_id', currentUser.id);
    hint.textContent = 'Saved!';
    setTimeout(function() { hint.textContent = ''; }, 2000);
    toast('Profile updated', '');
  });

  document.getElementById('addAddressForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!supabaseClient || !currentUser) return;
    var hint = document.getElementById('addAddrHint');
    var payload = {
      user_id:     currentUser.id,
      street:      document.getElementById('addrStreet').value.trim(),
      city:        document.getElementById('addrCity').value.trim(),
      province:    document.getElementById('addrProvince').value.trim(),
      postal_code: document.getElementById('addrPostal').value.trim(),
      country:     document.getElementById('addrCountry').value.trim() || 'South Africa',
    };
    if (!payload.street || !payload.city) { hint.textContent = 'Street and city are required.'; return; }
    var insertResult = await supabaseClient.from('saved_addresses').insert(payload);
    if (insertResult.error) { hint.textContent = insertResult.error.message; return; }
    hint.textContent = '';
    document.getElementById('addAddressDetails').open = false;
    e.target.reset();
    loadAddresses();
    toast('Address saved', '');
  });
}

// ════════════════════════════════════════════════════════════
// CHECKOUT STEPPER
// ════════════════════════════════════════════════════════════

var checkoutInfo = {};
var coStep = 1;

async function openCheckoutModal() {
  if (cart.length === 0) { toast('Cart is empty', 'Add a product first.'); return; }
  coStep = 1;
  checkoutInfo = {};

  var nameEl  = document.getElementById('coName');
  var emailEl = document.getElementById('coEmail');
  if (nameEl  && currentUser) nameEl.value  = currentUser.user_metadata?.full_name || '';
  if (emailEl && currentUser) emailEl.value = currentUser.email || '';

  if (supabaseClient && currentUser) {
    var addrResult = await supabaseClient
      .from('saved_addresses').select('*')
      .eq('user_id', currentUser.id).eq('is_default', true).maybeSingle();
    var addr = addrResult.data;
    if (addr) {
      document.getElementById('coStreet').value   = addr.street   || '';
      document.getElementById('coCity').value     = addr.city     || '';
      document.getElementById('coProvince').value = addr.province || '';
      document.getElementById('coPostal').value   = addr.postal_code || '';
      document.getElementById('coCountry').value  = addr.country  || 'South Africa';
    }
  }

  var saveLabel = document.getElementById('saveAddrLabel');
  if (saveLabel) saveLabel.hidden = !currentUser;

  showCoStep(1);
  var modal = document.getElementById('checkoutModal');
  if (modal) modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  closeDrawer();
}

function closeCheckoutModal() {
  var modal = document.getElementById('checkoutModal');
  if (modal) modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function showCoStep(n) {
  coStep = n;
  [1, 2, 3].forEach(function(i) {
    var step = document.getElementById('coStep' + i);
    var dot  = document.getElementById('stepDot' + i);
    if (step) step.classList.toggle('active', i === n);
    if (dot) {
      dot.classList.toggle('active', i === n);
      dot.classList.toggle('done',   i < n);
    }
  });
  if (n === 3) buildCoReview();
}

function validateCoStep1() {
  var name  = (document.getElementById('coName')?.value  || '').trim();
  var email = (document.getElementById('coEmail')?.value || '').trim();
  var hint  = document.getElementById('coStep1Hint');
  if (!name || name.length < 2)                             { hint.textContent = 'Please enter your full name.'; return false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { hint.textContent = 'Please enter a valid email.';  return false; }
  hint.textContent = '';
  checkoutInfo.name  = name;
  checkoutInfo.email = email;
  return true;
}

function validateCoStep2() {
  var street = (document.getElementById('coStreet')?.value || '').trim();
  var city   = (document.getElementById('coCity')?.value   || '').trim();
  var hint   = document.getElementById('coStep2Hint');
  if (!street) { hint.textContent = 'Please enter your street address.'; return false; }
  if (!city)   { hint.textContent = 'Please enter your city.';           return false; }
  hint.textContent = '';
  checkoutInfo.street      = street;
  checkoutInfo.city        = city;
  checkoutInfo.province    = (document.getElementById('coProvince')?.value || '').trim();
  checkoutInfo.postal_code = (document.getElementById('coPostal')?.value   || '').trim();
  checkoutInfo.country     = (document.getElementById('coCountry')?.value  || 'South Africa').trim();
  return true;
}

function buildCoReview() {
  var itemsEl = document.getElementById('coReviewItems');
  var totalEl = document.getElementById('coReviewTotal');
  var addrEl  = document.getElementById('coReviewAddress');

  if (itemsEl) {
    itemsEl.innerHTML = cart.map(function(item) {
      return '<li class="review-item"><span>' + item.name + ' x' + item.quantity + '</span><span>' + zar(item.price * item.quantity) + '</span></li>';
    }).join('');
  }
  if (totalEl) totalEl.textContent = zar(cartTotal());
  if (addrEl) {
    var parts = [checkoutInfo.name, checkoutInfo.street,
      [checkoutInfo.city, checkoutInfo.province].filter(Boolean).join(', '),
      checkoutInfo.postal_code, checkoutInfo.country].filter(Boolean);
    addrEl.textContent = parts.join('\n');
    addrEl.style.whiteSpace = 'pre-line';
  }
}

async function handleCoPay() {
  var btn  = document.getElementById('coPayBtn');
  var hint = document.getElementById('coStep3Hint');
  if (btn) { btn.disabled = true; btn.textContent = 'Processing...'; }
  if (hint) hint.textContent = '';

  var saveAddr = document.getElementById('coSaveAddr')?.checked;
  if (saveAddr && supabaseClient && currentUser) {
    await supabaseClient.from('saved_addresses').insert({
      user_id:     currentUser.id,
      street:      checkoutInfo.street,
      city:        checkoutInfo.city,
      province:    checkoutInfo.province,
      postal_code: checkoutInfo.postal_code,
      country:     checkoutInfo.country,
    });
  }

  try {
    var res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, customerInfo: checkoutInfo }),
    });
    var json = await res.json();
    if (!res.ok || !json.url) throw new Error(json.message || 'Checkout failed');
    window.location.href = json.url;
  } catch (err) {
    if (hint) hint.textContent = err.message;
    if (btn) { btn.disabled = false; btn.textContent = 'Pay Now'; }
  }
}

function initCheckoutEvents() {
  document.getElementById('checkoutModalClose')?.addEventListener('click', closeCheckoutModal);
  document.getElementById('checkoutBackdrop')?.addEventListener('click', closeCheckoutModal);
  document.getElementById('coNext1')?.addEventListener('click', function() { if (validateCoStep1()) showCoStep(2); });
  document.getElementById('coBack2')?.addEventListener('click', function() { showCoStep(1); });
  document.getElementById('coNext2')?.addEventListener('click', function() { if (validateCoStep2()) showCoStep(3); });
  document.getElementById('coBack3')?.addEventListener('click', function() { showCoStep(2); });
  document.getElementById('coPayBtn')?.addEventListener('click', handleCoPay);
}
