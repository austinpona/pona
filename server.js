require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const https   = require('https');
const crypto  = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Yoco ────────────────────────────────────────────────────
const YOCO_SECRET_KEY     = (process.env.YOCO_SECRET_KEY     || '').trim();
const YOCO_WEBHOOK_SECRET = (process.env.YOCO_WEBHOOK_SECRET || '').trim();

// ── Supabase (server-side service key) ───────────────────────
const SUPABASE_URL         = 'https://eascxtwbhzebrlvqzxzp.supabase.co';
const SUPABASE_SERVICE_KEY = (process.env.SUPABASE_SERVICE_KEY || '').trim();
const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

// ── Fallback products (if Supabase unavailable) ───────────────
const FALLBACK_PRODUCTS = [
  { id: 1,  name: 'Infinity Link Bracelet',         description: 'Elegant silver bracelet with repeating infinity symbol links',                         price: 65, image: 'images/IMG-20260318-WA0058.jpg', badge: 'bestseller' },
  { id: 2,  name: 'Silver Star Necklace',            description: 'Delicate silver chain necklace with a dainty star pendant',                            price: 35, image: 'images/IMG-20260318-WA0059.jpg', badge: 'new' },
  { id: 3,  name: 'Silver Cross Necklace',           description: 'Minimalist silver chain with an elegant open cross pendant',                           price: 65, image: 'images/IMG-20260318-WA0060.jpg', badge: 'new' },
  { id: 4,  name: 'Letter & Star Charm Necklace',    description: 'Silver chain necklace with initial letter pendant and star charms',                    price: 65, image: 'images/IMG-20260318-WA0061.jpg', badge: 'new' },
  { id: 5,  name: 'Custom Name Bracelets',           description: 'Personalised pearl bracelets with letter beads, flower and butterfly charms',           price: 60, image: 'images/IMG-20260318-WA0062.jpg', badge: 'bestseller' },
  { id: 6,  name: 'Blue Crystal Cross Bracelet Set', description: 'Stunning blue and clear crystal bead bracelet pair with cross and angel charms',       price: 50, image: 'images/IMG-20260318-WA0063.jpg', badge: null },
  { id: 7,  name: 'Pink Crystal Bear Bracelet',      description: 'Sweet pink crystal beads with adorable bear face charm and dangle accent',             price: 65, image: 'images/IMG-20260318-WA0064.jpg', badge: 'bestseller' },
  { id: 8,  name: 'Crystal Daisy Bracelet',          description: 'Sparkling clear crystal beads with a beautiful white daisy flower charm',              price: 45, image: 'images/IMG-20260318-WA0065.jpg', badge: null },
  { id: 9,  name: 'Pink & Black Hello Kitty Bracelet', description: 'Pink and black beads with crystal spacers and Hello Kitty star charm',              price: 45, image: 'images/IMG-20260318-WA0066.jpg', badge: null },
  { id: 10, name: 'Gothic Cross Link Bracelet',      description: 'Bold silver gothic cross link bracelet with vintage charm',                            price: 45, image: 'images/IMG-20260318-WA0067.jpg', badge: null },
  { id: 11, name: 'Leopard Charm Bangle',            description: 'Silver cable bangle with leopard print beads, 8-ball, cherry and cheetah charms',     price: 50, image: 'images/IMG-20260223-WA0008.jpg', badge: 'new' },
];

app.use(cors());

// ── Yoco helper — make API requests ─────────────────────────
function yocoRequest(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const jsonBody = body ? JSON.stringify(body) : '';
    const options = {
      hostname: 'payments.yoco.com',
      port: 443,
      path: urlPath,
      method,
      headers: {
        Authorization: `Bearer ${YOCO_SECRET_KEY}`,
        'Content-Type': 'application/json',
        ...(jsonBody ? { 'Content-Length': Buffer.byteLength(jsonBody) } : {}),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(json);
          else reject(new Error(json.message || json.errorMessage || `Yoco error ${res.statusCode}`));
        } catch { reject(new Error('Failed to parse Yoco response')); }
      });
    });
    req.on('error', reject);
    if (jsonBody) req.write(jsonBody);
    req.end();
  });
}

// ── Yoco webhook verification ────────────────────────────────
function verifyYocoWebhook(rawBody, headers, secret) {
  const webhookId        = headers['webhook-id'];
  const webhookTimestamp  = headers['webhook-timestamp'];
  const webhookSignature = headers['webhook-signature'];

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    throw new Error('Missing webhook headers');
  }

  // Check timestamp (reject if older than 3 minutes)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(webhookTimestamp, 10)) > 180) {
    throw new Error('Webhook timestamp too old');
  }

  // Remove 'whsec_' prefix and decode base64 secret
  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');

  // Build signed content: "{webhook-id}.{webhook-timestamp}.{body}"
  const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;

  // HMAC-SHA256 → base64
  const expectedSig = crypto
    .createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64');

  // webhook-signature header format: "v1,{base64sig}" (may have multiple)
  const signatures = webhookSignature.split(' ');
  const verified = signatures.some((sig) => {
    const parts = sig.split(',');
    if (parts.length < 2) return false;
    return parts[1] === expectedSig;
  });

  if (!verified) throw new Error('Webhook signature mismatch');

  return JSON.parse(rawBody);
}

// ── Yoco webhook endpoint ────────────────────────────────────
app.post('/webhook/yoco', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!YOCO_WEBHOOK_SECRET)
    return res.status(500).send('Webhook not configured');
  if (!supabase)
    return res.status(500).send('Supabase not configured');

  let event;
  try {
    event = verifyYocoWebhook(req.body.toString(), req.headers, YOCO_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Yoco webhook verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment.succeeded') {
    const payment = event.payload || event.data?.object || {};
    const checkoutId = payment.metadata?.checkoutId || payment.id;
    const amountTotal = (payment.amount || 0) / 100;

    try {
      // Get customer info from checkout metadata
      const email = payment.metadata?.customer_email || null;
      const name  = payment.metadata?.customer_name  || null;
      const cartJson = payment.metadata?.cart_items || null;

      let customerId = null;
      if (email) {
        const { data: existing } = await supabase.from('customers').select('id').eq('email', email).maybeSingle();
        if (existing?.id) {
          customerId = existing.id;
        } else {
          const { data: inserted } = await supabase.from('customers')
            .insert({ name: name || 'Customer', email }).select('id').single();
          customerId = inserted?.id || null;
        }
      }

      const { data: order, error: orderErr } = await supabase.from('orders')
        .insert({ customer_id: customerId, status: 'paid', total_amount: amountTotal, stripe_session_id: checkoutId })
        .select('id').single();
      if (orderErr) throw orderErr;

      // Parse cart items from metadata
      let cartItems = [];
      if (cartJson) {
        try { cartItems = JSON.parse(cartJson); } catch {}
      }
      const items = cartItems.map((li) => ({
        order_id: order.id,
        product_name: li.name || 'Item',
        quantity: li.quantity || 1,
        unit_price: li.price || 0,
      }));
      if (items.length > 0) await supabase.from('order_items').insert(items);

      console.log('Yoco payment saved: order', order.id, 'amount', amountTotal);
    } catch (err) {
      console.error('Webhook order error:', err.message);
      return res.status(500).send('Order save failed');
    }
  }

  res.json({ received: true });
});

app.use(express.json());

// ── Helpers ───────────────────────────────────────────────────
function isEmail(v) { return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }

// ── Products — from Supabase, fallback to hardcoded ───────────
app.get('/api/products', async (req, res) => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, price, image_url, badge')
        .eq('active', true)
        .order('id', { ascending: true });
      if (error) throw error;

      // Normalise image_url → image for the frontend
      return res.json(data.map((p) => ({ ...p, image: p.image_url })));
    } catch (e) {
      console.error('Supabase products error:', e.message);
    }
  }
  return res.json(FALLBACK_PRODUCTS);
});

// ── Contact — save to Supabase ────────────────────────────────
app.post('/api/contact', async (req, res) => {
  const name    = String(req.body?.name    || '').trim();
  const email   = String(req.body?.email   || '').trim();
  const message = String(req.body?.message || '').trim();

  if (name.length < 2)    return res.status(400).json({ message: 'Please enter your name.' });
  if (!isEmail(email))    return res.status(400).json({ message: 'Please enter a valid email address.' });
  if (message.length < 10) return res.status(400).json({ message: 'Message is too short.' });

  if (supabase) {
    const { error } = await supabase.from('contact_submissions').insert({ name, email, message });
    if (error) console.error('Contact save error:', error.message);
  }

  console.log('Contact submission:', { at: new Date().toISOString(), name, email });
  return res.json({ success: true, message: 'Thanks! We received your message and will reply soon.' });
});

// ── Checkout — create Yoco Checkout Session ──────────────────
app.post('/api/checkout', async (req, res) => {
  if (!YOCO_SECRET_KEY)
    return res.status(500).json({ message: 'Payment gateway is not configured on the server.' });

  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  if (items.length === 0) return res.status(400).json({ message: 'Cart is empty.' });

  const info = req.body?.customerInfo || {};

  // Calculate total in cents (Yoco uses cents)
  const totalCents = items.reduce((sum, item) => {
    return sum + Math.round(Number(item.price || 0) * 100) * (item.quantity || 1);
  }, 0);

  if (totalCents < 200) {
    return res.status(400).json({ message: 'Minimum order is R2.00.' });
  }

  const origin = req.headers.origin || `http://localhost:${PORT}`;

  // Build line items for Yoco
  const lineItems = items.map((item) => ({
    displayName: String(item.name || 'Item'),
    quantity: item.quantity || 1,
    pricingDetails: {
      price: Math.round(Number(item.price || 0) * 100),
    },
  }));

  // Build metadata (Yoco supports metadata for reconciliation)
  const metadata = {};
  if (info.email) metadata.customer_email = String(info.email).trim();
  if (info.name)  metadata.customer_name  = String(info.name).trim();
  if (info.street) {
    metadata.shipping_street   = String(info.street).trim();
    metadata.shipping_city     = String(info.city     || '').trim();
    metadata.shipping_province = String(info.province || '').trim();
    metadata.shipping_postal   = String(info.postal_code || '').trim();
    metadata.shipping_country  = String(info.country  || 'South Africa').trim();
  }

  // Store cart items in metadata for webhook order creation
  metadata.cart_items = JSON.stringify(items.map((item) => ({
    name: item.name,
    quantity: item.quantity || 1,
    price: Number(item.price || 0),
  })));

  const checkoutBody = {
    amount: totalCents,
    currency: 'ZAR',
    successUrl: `${origin}/?success=1`,
    cancelUrl:  `${origin}/?canceled=1`,
    failureUrl: `${origin}/?canceled=1`,
    lineItems,
    metadata,
  };

  try {
    const checkout = await yocoRequest('POST', '/api/checkouts', checkoutBody);
    return res.json({ url: checkout.redirectUrl });
  } catch (e) {
    console.error('Yoco checkout error:', e.message);
    return res.status(500).json({ message: `Checkout failed: ${e.message}` });
  }
});

// ── Newsletter — save subscriber email ───────────────────────
app.post('/api/newsletter', async (req, res) => {
  const email = String(req.body?.email || '').trim();
  if (!isEmail(email)) return res.status(400).json({ message: 'Please enter a valid email.' });
  if (supabase) {
    await supabase.from('contact_submissions')
      .insert({ name: 'Newsletter', email, message: 'Newsletter subscription request' });
  }
  console.log('Newsletter signup:', email);
  return res.json({ success: true });
});

// ── Static frontend ───────────────────────────────────────────
const publicDir = path.join(__dirname, 'infinity-pearls-project');
app.use(express.static(publicDir));
app.get('*', (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));

module.exports = app;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}
