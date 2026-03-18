require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const https   = require('https');
const crypto  = require('crypto');
const qs      = require('querystring');
const { createClient } = require('@supabase/supabase-js');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Stripe (direct HTTPS — no SDK) ──────────────────────────
const STRIPE_SECRET_KEY     = (process.env.STRIPE_SECRET_KEY     || '').trim();
const STRIPE_WEBHOOK_SECRET = (process.env.STRIPE_WEBHOOK_SECRET || '').trim();

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

// ── Stripe helpers ────────────────────────────────────────────
function stripeRequest(method, urlPath, params) {
  return new Promise((resolve, reject) => {
    const body = params ? qs.stringify(params) : '';
    const options = {
      hostname: 'api.stripe.com',
      port: 443,
      path: urlPath,
      method,
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(json);
          else reject(new Error(json.error?.message || `Stripe error ${res.statusCode}`));
        } catch { reject(new Error('Failed to parse Stripe response')); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function verifyStripeWebhook(rawBody, signature, secret) {
  const parts = signature.split(',').reduce((acc, part) => {
    const [k, v] = part.split('='); acc[k] = v; return acc;
  }, {});
  if (!parts.t || !parts.v1) throw new Error('Invalid signature header');
  const expected = crypto.createHmac('sha256', secret)
    .update(`${parts.t}.${rawBody}`).digest('hex');
  if (expected !== parts.v1) throw new Error('Signature mismatch');
  if (Math.floor(Date.now() / 1000) - parseInt(parts.t, 10) > 300)
    throw new Error('Webhook too old');
  return JSON.parse(rawBody);
}

// ── Stripe webhook ────────────────────────────────────────────
app.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET)
    return res.status(500).send('Webhook not configured');
  if (!supabase)
    return res.status(500).send('Supabase not configured');

  let event;
  try {
    event = verifyStripeWebhook(req.body.toString(), req.headers['stripe-signature'], STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      const lineItemsData = await stripeRequest('GET', `/v1/checkout/sessions/${session.id}/line_items?limit=100`);
      const amountTotal   = (session.amount_total || 0) / 100;
      const email = session.customer_details?.email || session.metadata?.customer_email;
      const name  = session.customer_details?.name  || session.metadata?.customer_name;

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
        .insert({ customer_id: customerId, status: 'paid', total_amount: amountTotal, stripe_session_id: session.id })
        .select('id').single();
      if (orderErr) throw orderErr;

      const items = (lineItemsData.data || []).map((li) => ({
        order_id: order.id,
        product_name: li.description || 'Item',
        quantity: li.quantity,
        unit_price: (li.amount_total || 0) / 100 / (li.quantity || 1),
      }));
      if (items.length > 0) await supabase.from('order_items').insert(items);

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
      // Fall through to hardcoded list
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

// ── Checkout — create Stripe Checkout Session ─────────────────
app.post('/api/checkout', async (req, res) => {
  if (!STRIPE_SECRET_KEY)
    return res.status(500).json({ message: 'Stripe is not configured on the server.' });

  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  if (items.length === 0) return res.status(400).json({ message: 'Cart is empty.' });

  const info = req.body?.customerInfo || {};

  const origin = req.headers.origin || `http://localhost:${PORT}`;
  const params = {
    mode: 'payment',
    'payment_method_types[]': 'card',
    success_url: `${origin}/?success=1`,
    cancel_url:  `${origin}/?canceled=1`,
  };

  if (info.email) params['customer_email']           = String(info.email).trim();
  if (info.name)  params['metadata[customer_name]']  = String(info.name).trim();
  if (info.street) {
    params['metadata[shipping_street]']   = String(info.street).trim();
    params['metadata[shipping_city]']     = String(info.city     || '').trim();
    params['metadata[shipping_province]'] = String(info.province || '').trim();
    params['metadata[shipping_postal]']   = String(info.postal_code || '').trim();
    params['metadata[shipping_country]']  = String(info.country  || 'South Africa').trim();
  }

  items.forEach((item, i) => {
    params[`line_items[${i}][quantity]`]                               = item.quantity || 1;
    params[`line_items[${i}][price_data][currency]`]                   = 'zar';
    params[`line_items[${i}][price_data][product_data][name]`]         = String(item.name || 'Item');
    if (item.description)
      params[`line_items[${i}][price_data][product_data][description]`] = String(item.description);
    params[`line_items[${i}][price_data][unit_amount]`]                = Math.round(Number(item.price || 0) * 100);
  });

  try {
    const session = await stripeRequest('POST', '/v1/checkout/sessions', params);
    return res.json({ url: session.url });
  } catch (e) {
    console.error('Stripe checkout error:', e.message);
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
