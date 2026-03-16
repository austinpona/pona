require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const querystring = require('querystring');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

const SUPABASE_URL = 'https://eascxtwbhzebrlvqzxzp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    : null;

app.use(cors());

// ---------------------------------------------------------------------------
// Stripe helpers — direct HTTPS calls, no SDK
// ---------------------------------------------------------------------------

function stripeRequest(method, urlPath, params) {
  return new Promise((resolve, reject) => {
    const body = params ? querystring.stringify(params) : '';
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
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject(new Error(json.error?.message || `Stripe error ${res.statusCode}`));
          }
        } catch (e) {
          reject(new Error('Failed to parse Stripe response'));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function verifyStripeWebhook(rawBody, signature, secret) {
  const parts = signature.split(',').reduce((acc, part) => {
    const [k, v] = part.split('=');
    acc[k] = v;
    return acc;
  }, {});

  if (!parts.t || !parts.v1) throw new Error('Invalid signature header');

  const signedPayload = `${parts.t}.${rawBody}`;
  const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');

  if (expected !== parts.v1) throw new Error('Webhook signature mismatch');

  const age = Math.floor(Date.now() / 1000) - parseInt(parts.t, 10);
  if (age > 300) throw new Error('Webhook timestamp too old');

  return JSON.parse(rawBody);
}

// ---------------------------------------------------------------------------
// Stripe webhook — raw body required for signature verification
// ---------------------------------------------------------------------------

app.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    return res.status(500).send('Webhook not configured');
  }
  if (!supabase) {
    return res.status(500).send('Supabase not configured');
  }

  let event;
  try {
    event = verifyStripeWebhook(
      req.body.toString(),
      req.headers['stripe-signature'],
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      const lineItemsData = await stripeRequest(
        'GET',
        `/v1/checkout/sessions/${session.id}/line_items?limit=100`
      );

      const amountTotal = (session.amount_total || 0) / 100;
      const customerEmail =
        session.customer_details?.email || session.metadata?.customer_email;
      const customerName =
        session.customer_details?.name || session.metadata?.customer_name;

      let customerId = null;
      if (customerEmail) {
        const { data: existing, error: findError } = await supabase
          .from('customers')
          .select('id')
          .eq('email', customerEmail)
          .maybeSingle();
        if (findError) console.error('Error finding customer:', findError);

        if (existing?.id) {
          customerId = existing.id;
        } else {
          const { data: inserted, error: insertError } = await supabase
            .from('customers')
            .insert({ name: customerName || 'Customer', email: customerEmail })
            .select('id')
            .single();
          if (insertError) console.error('Error inserting customer:', insertError);
          else customerId = inserted.id;
        }
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({ customer_id: customerId, status: 'paid', total_amount: amountTotal })
        .select('id')
        .single();
      if (orderError) throw orderError;

      const orderItemsPayload = (lineItemsData.data || []).map((li) => ({
        order_id: order.id,
        product_name: li.description || 'Item',
        quantity: li.quantity,
        unit_price: (li.amount_total || 0) / 100 / (li.quantity || 1),
      }));

      if (orderItemsPayload.length > 0) {
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItemsPayload);
        if (itemsError) console.error('Error inserting order_items:', itemsError);
      }
    } catch (err) {
      console.error('Error handling checkout.session.completed:', err);
      return res.status(500).send('Webhook handling failed');
    }
  }

  res.json({ received: true });
});

app.use(express.json());

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

const products = [
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

function isEmail(value) {
  if (typeof value !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------

app.get('/api/products', (req, res) => res.json(products));

app.get('/api/products/:id', (req, res) => {
  const product = products.find((p) => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ message: 'Product not found' });
  return res.json(product);
});

app.post('/api/contact', (req, res) => {
  const cleanName = String(req.body?.name || '').trim();
  const cleanEmail = String(req.body?.email || '').trim();
  const cleanMessage = String(req.body?.message || '').trim();

  if (cleanName.length < 2)
    return res.status(400).json({ message: 'Please enter your name.' });
  if (!isEmail(cleanEmail))
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  if (cleanMessage.length < 10)
    return res.status(400).json({ message: 'Message is too short.' });

  console.log('Contact form submission:', {
    at: new Date().toISOString(),
    name: cleanName,
    email: cleanEmail,
    message: cleanMessage,
  });

  return res.json({
    success: true,
    message: 'Thanks! We received your message and will reply soon.',
  });
});

// ---------------------------------------------------------------------------
// Checkout — creates a Stripe Checkout Session
// ---------------------------------------------------------------------------

app.post('/api/checkout', async (req, res) => {
  if (!STRIPE_SECRET_KEY) {
    return res.status(500).json({ message: 'Stripe is not configured on the server.' });
  }

  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  const customerInfo = req.body?.customer || {};

  if (items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty.' });
  }

  const origin = req.headers.origin || `http://localhost:${PORT}`;

  const params = {
    mode: 'payment',
    'payment_method_types[]': 'card',
    success_url: `${origin}/?success=1`,
    cancel_url: `${origin}/?canceled=1`,
    'metadata[customer_name]': customerInfo.name || '',
    'metadata[customer_email]': customerInfo.email || '',
  };

  items.forEach((item, i) => {
    params[`line_items[${i}][quantity]`] = item.quantity || 1;
    params[`line_items[${i}][price_data][currency]`] = 'zar';
    params[`line_items[${i}][price_data][product_data][name]`] = String(item.name || 'Item');
    if (item.description) {
      params[`line_items[${i}][price_data][product_data][description]`] = String(item.description);
    }
    params[`line_items[${i}][price_data][unit_amount]`] = Math.round(
      Number(item.price || 0) * 100
    );
  });

  try {
    const session = await stripeRequest('POST', '/v1/checkout/sessions', params);
    return res.json({ url: session.url });
  } catch (e) {
    console.error('Stripe checkout error:', e.message);
    return res.status(500).json({ message: `Checkout failed: ${e.message}` });
  }
});

// ---------------------------------------------------------------------------
// Static frontend
// ---------------------------------------------------------------------------

const publicDir = path.join(__dirname, 'infinity-pearls-project');
app.use(express.static(publicDir));
app.get('*', (req, res) => res.sendFile(path.join(publicDir, 'index.html')));

// Run locally or export for Vercel
module.exports = app;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Infinity Pearls server running on http://localhost:${PORT}`);
  });
}
