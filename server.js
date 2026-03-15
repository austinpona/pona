require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const stripeLib = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Stripe setup (fill env vars in .env)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const stripe = STRIPE_SECRET_KEY ? stripeLib(STRIPE_SECRET_KEY) : null;

// Supabase admin client (server-side, using service role key)
const SUPABASE_URL = 'https://eascxtwbhzebrlvqzxzp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    : null;

app.use(cors());

// Stripe webhook MUST receive raw body for signature verification — register before express.json()
app.post(
  '/webhook/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    if (!stripe || !STRIPE_WEBHOOK_SECRET) {
      return res.status(500).send('Webhook not configured');
    }
    if (!supabase) {
      return res.status(500).send('Supabase not configured');
    }

    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
          limit: 100,
        });

        const amountTotal = (session.amount_total || 0) / 100;
        const customerEmail = session.customer_details?.email || session.metadata?.customer_email;
        const customerName = session.customer_details?.name || session.metadata?.customer_name;

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
              .insert({
                name: customerName || 'Customer',
                email: customerEmail,
              })
              .select('id')
              .single();
            if (insertError) {
              console.error('Error inserting customer:', insertError);
            } else {
              customerId = inserted.id;
            }
          }
        }

        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            customer_id: customerId,
            status: 'paid',
            total_amount: amountTotal,
          })
          .select('id')
          .single();
        if (orderError) {
          console.error('Error inserting order:', orderError);
          throw orderError;
        }

        const orderId = order.id;
        const orderItemsPayload =
          lineItems.data?.map((li) => ({
            order_id: orderId,
            product_name: li.description || 'Item',
            quantity: li.quantity,
            unit_price: (li.amount_total || 0) / 100 / (li.quantity || 1),
          })) || [];

        if (orderItemsPayload.length > 0) {
          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsPayload);
          if (itemsError) {
            console.error('Error inserting order_items:', itemsError);
          }
        }
      } catch (err) {
        console.error('Error handling checkout.session.completed:', err);
        return res.status(500).send('Webhook handling failed');
      }
    }

    res.json({ received: true });
  }
);

app.use(express.json());

const products = [
  {
    id: 1,
    name: 'Aqua & Pearl Spider Charm',
    description:
      'Elegant bracelet with turquoise beads, clear crystals, and a unique spider charm',
    price: 60,
    image: 'images/IMG-20260122-WA0007.jpg',
  },
  {
    id: 2,
    name: 'Red & Pearl 8-Ball Bracelet',
    description:
      'Bold red beads with white pearls featuring an 8-ball charm and star accent',
    price: 60,
    image: 'images/IMG-20260122-WA0008.jpg',
  },
  {
    id: 3,
    name: 'Coral & Mint Bat Charm',
    description:
      'Unique color-blocked design with coral, orange, and mint beads with bat charm',
    price: 60,
    image: 'images/IMG-20260122-WA0010.jpg',
  },
  {
    id: 4,
    name: 'Rainbow Flower Power',
    description:
      'Vibrant rainbow gradient bracelet with cheerful flower charm',
    price: 60,
    image: 'images/IMG-20260122-WA0011.jpg',
  },
  {
    id: 5,
    name: 'Pink & Black Heart Star',
    description:
      'Chic pink and black beads with heart and star charm accents',
    price: 60,
    image: 'images/IMG-20260122-WA0012.jpg',
  },
  {
    id: 6,
    name: 'Purple Cross & Star',
    description:
      'Deep purple beads with decorative cross and star charms',
    price: 60,
    image: 'images/IMG-20260122-WA0013.jpg',
  },
  {
    id: 7,
    name: 'Infinity Link Bracelet',
    description:
      'Elegant silver bracelet with repeating infinity symbol links',
    price: 60,
    image: 'images/IMG-20260122-WA0007.jpg',
  },
  {
    id: 8,
    name: 'Pink Ombre Set',
    description:
      'Delicate pink gradient bracelets - perfect matching pair',
    price: 60,
    image: 'images/IMG-20260122-WA0008.jpg',
  },
  {
    id: 9,
    name: 'Crystal Daisy Bracelet',
    description:
      'Sparkling clear crystal beads with white daisy charm',
    price: 60,
    image: 'images/IMG-20260122-WA0010.jpg',
  },
  {
    id: 10,
    name: 'Pink Crystal Bear Charm',
    description:
      'Sweet pink crystal beads with adorable bear face charm',
    price: 60,
    image: 'images/IMG-20260122-WA0011.jpg',
  },
];

function isEmail(value) {
  if (typeof value !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

// API routes
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const product = products.find((p) => p.id === id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  return res.json(product);
});

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body || {};
  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim();
  const cleanMessage = String(message || '').trim();

  if (cleanName.length < 2) {
    return res.status(400).json({ message: 'Please enter your name.' });
  }
  if (!isEmail(cleanEmail)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }
  if (cleanMessage.length < 10) {
    return res.status(400).json({ message: 'Message is too short.' });
  }

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

// Create Stripe Checkout Session
app.post('/api/checkout', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ message: 'Stripe is not configured on the server.' });
    }

    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const customerInfo = req.body?.customer || {};

    if (items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    const lineItems = items.map((item) => ({
      quantity: item.quantity || 1,
      price_data: {
        currency: 'zar',
        product_data: {
          name: item.name,
          description: item.description,
        },
        unit_amount: Math.round(Number(item.price || 0) * 100),
      },
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${req.headers.origin || 'http://localhost:' + PORT}/?success=1`,
      cancel_url: `${req.headers.origin || 'http://localhost:' + PORT}/?canceled=1`,
      metadata: {
        customer_name: customerInfo.name || '',
        customer_email: customerInfo.email || '',
      },
    });

    return res.json({ url: session.url });
  } catch (e) {
    console.error('Stripe checkout error:', e);
    return res.status(500).json({ message: 'Checkout failed.' });
  }
});

// Serve static frontend
const publicDir = path.join(__dirname, 'infinity-pearls-project');
app.use(express.static(publicDir));

// Fallback to index.html for any other route (SPA-style)
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Infinity Pearls server running on http://localhost:${PORT}`);
});

