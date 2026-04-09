require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const https      = require('https');
const crypto     = require('crypto');
const rateLimit  = require('express-rate-limit');
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
  { id: 39, name: 'Gothic Skull & 8-Ball Charm Bracelet', description: 'Silver snake chain charm bracelet with 8-ball beads, skull, dice, gun and cross charms', price: 45, original_price: 65, image: 'images/IMG-20260406-WA0071.jpg', badge: 'new' },
];

// ── CORS — restrict to allowed origins ───────────────────────
const ALLOWED_ORIGINS = [
  'https://infinity-pearls.vercel.app',
  'https://www.infinitypearls.co.za',
];
if (process.env.NODE_ENV !== 'production') {
  ALLOWED_ORIGINS.push('http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000');
}
app.use(cors({
  origin(origin, cb) {
    // Allow server-to-server (no origin) and allowed origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
}));

// ── Rate limiting ────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,                   // 10 requests per window (contact, checkout)
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use('/api/', apiLimiter);
app.use('/api/contact', strictLimiter);
app.use('/api/checkout', strictLimiter);
app.use('/api/newsletter', strictLimiter);

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

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
    return res.status(400).send('Webhook verification failed');
  }

  if (event.type === 'payment.succeeded') {
    const payment = event.payload || event.data?.object || {};
    const orderId = payment.metadata?.order_id || null;
    const checkoutId = payment.metadata?.checkoutId || payment.id;

    try {
      if (orderId) {
        // Update the existing pending order to 'paid'
        const { error } = await supabase.from('orders')
          .update({ status: 'paid', stripe_session_id: checkoutId })
          .eq('id', orderId);
        if (error) throw error;
        console.log('Yoco payment confirmed: order', orderId, 'marked as paid');
      } else {
        // Fallback: no order_id in metadata, log for manual review
        console.warn('Yoco payment succeeded but no order_id in metadata:', checkoutId);
      }
    } catch (err) {
      console.error('Webhook order update error:', err.message);
      return res.status(500).send('Order update failed');
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
        .select('id, name, description, price, original_price, image_url, badge')
        .eq('active', true)
        .order('id', { ascending: true });

      if (error) {
        // If original_price column doesn't exist yet, retry without it
        if (error.message && error.message.includes('original_price')) {
          const { data: data2, error: error2 } = await supabase
            .from('products')
            .select('id, name, description, price, image_url, badge')
            .eq('active', true)
            .order('id', { ascending: true });
          if (error2) throw error2;
          return res.json(data2.map((p) => ({ ...p, image: p.image_url })));
        }
        throw error;
      }

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

// ── Checkout — create Yoco Checkout + save order to Supabase ─
app.post('/api/checkout', async (req, res) => {
  if (!YOCO_SECRET_KEY)
    return res.status(500).json({ message: 'Payment gateway is not configured on the server.' });

  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  if (items.length === 0) return res.status(400).json({ message: 'Cart is empty.' });

  const info = req.body?.customerInfo || {};

  // Calculate total in cents (Yoco uses cents)
  const itemsCents = items.reduce((sum, item) => {
    return sum + Math.round(Number(item.price || 0) * 100) * (item.quantity || 1);
  }, 0);
  const shippingCents = Math.round(Number(info.shipping_cost || 0) * 100);
  const totalCents = itemsCents + shippingCents;
  const totalRands = totalCents / 100;

  if (totalCents < 200) {
    return res.status(400).json({ message: 'Minimum order is R2.00.' });
  }

  const origin = req.headers.origin || `http://localhost:${PORT}`;
  const email = info.email ? String(info.email).trim() : null;
  const name  = info.name  ? String(info.name).trim()  : null;
  const phone = info.phone ? String(info.phone).trim() : null;

  // ── Save order to Supabase BEFORE payment ──────────────────
  let orderId = null;
  if (supabase) {
    try {
      // Find or create customer
      let customerId = null;
      if (email) {
        const { data: existing } = await supabase.from('customers').select('id').eq('email', email).maybeSingle();
        if (existing?.id) {
          customerId = existing.id;
        } else {
          const { data: inserted } = await supabase.from('customers')
            .insert({ name: name || 'Customer', email, phone: phone }).select('id').single();
          customerId = inserted?.id || null;
        }
      }

      // Create order with shipping info (status: pending)
      const shippingMethod = String(info.shipping_method || 'door').trim();
      const courierPoint   = info.courier_point ? String(info.courier_point).trim() : null;
      const orderData = {
        customer_id: customerId,
        status: 'pending',
        total_amount: totalRands,
        shipping_name:     name || '',
        shipping_email:    email || '',
        shipping_phone:    phone || '',
        shipping_street:   courierPoint || String(info.street || '').trim(),
        shipping_city:     String(info.city         || '').trim(),
        shipping_province: String(info.province     || '').trim(),
        shipping_postal:   String(info.postal_code  || '').trim(),
        shipping_country:  String(info.country      || 'South Africa').trim(),
      };
      const { data: order, error: orderErr } = await supabase.from('orders')
        .insert(orderData).select('id').single();
      if (orderErr) throw orderErr;
      orderId = order.id;

      // Save order items
      const orderItems = items.map((item) => ({
        order_id: orderId,
        product_name: String(item.name || 'Item'),
        quantity: item.quantity || 1,
        unit_price: Number(item.price || 0),
      }));
      if (orderItems.length > 0) await supabase.from('order_items').insert(orderItems);

      console.log('Order created:', orderId, 'total:', totalRands, 'shipping:', shippingMethod, courierPoint || '', 'customer:', email);
    } catch (err) {
      console.error('Order save error:', err.message);
      // Continue to Yoco even if save fails
    }
  }

  // ── Create Yoco checkout ───────────────────────────────────
  const shippingLabel = info.shipping_method === 'courier' ? 'The Courier Guy — Pickup Point' : 'The Courier Guy — Door to Door';
  const lineItems = items.map((item) => ({
    displayName: String(item.name || 'Item'),
    quantity: item.quantity || 1,
    pricingDetails: {
      price: Math.round(Number(item.price || 0) * 100),
    },
  }));
  if (shippingCents > 0) {
    lineItems.push({
      displayName: shippingLabel,
      quantity: 1,
      pricingDetails: { price: shippingCents },
    });
  }

  const metadata = {};
  if (email)   metadata.customer_email   = email;
  if (name)    metadata.customer_name    = name;
  if (orderId) metadata.order_id         = String(orderId);
  metadata.shipping_method = info.shipping_method || 'door';
  if (info.courier_point) metadata.courier_point = String(info.courier_point);

  const checkoutBody = {
    amount: totalCents,
    currency: 'ZAR',
    successUrl: `${origin}/?success=1&order=${orderId || ''}`,
    cancelUrl:  `${origin}/?canceled=1`,
    failureUrl: `${origin}/?canceled=1`,
    lineItems,
    metadata,
  };

  try {
    const checkout = await yocoRequest('POST', '/api/checkouts', checkoutBody);

    // Store checkout ID on the order
    if (supabase && orderId && checkout.id) {
      await supabase.from('orders').update({ stripe_session_id: checkout.id }).eq('id', orderId);
    }

    return res.json({ url: checkout.redirectUrl });
  } catch (e) {
    console.error('Yoco checkout error:', e.message);
    // If Yoco fails, delete the pending order
    if (supabase && orderId) {
      await supabase.from('order_items').delete().eq('order_id', orderId);
      await supabase.from('orders').delete().eq('id', orderId);
    }
    return res.status(500).json({ message: 'Checkout failed. Please try again or contact support.' });
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
