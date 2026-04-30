require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const app = express();

// Initialize Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware to capture raw body for Paystack signature verification
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));
app.use(cors());

// --- PAYSTACK WEBHOOK ENDPOINT ---
app.post('/api/paystack-webhook', async (req, res) => {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const signature = req.headers['x-paystack-signature'];

    // 1. Verify Signature
    const hash = crypto.createHmac('sha512', secret).update(req.rawBody).digest('hex');
    
    if (hash !== signature) {
        console.error('Invalid Paystack Signature');
        return res.status(400).send('Invalid signature');
    }

    const event = req.body;

    // 2. Process "charge.success" event
    if (event.event === 'charge.success') {
        const data = event.data;
        const metadata = data.metadata;
        
        const newOrder = {
            order_id: data.reference,
            status: data.status,
            amount: data.amount / 100, // ZAR
            customer_name: metadata.customer_name || 'Guest',
            customer_email: data.customer.email,
            customer_phone: metadata.customer_phone || '',
            shipping_address: metadata.order_details || {},
            items: metadata.cart_items || []
        };

        // 3. Save to Supabase
        const { error } = await supabase
            .from('orders')
            .insert([newOrder]);

        if (error) {
            console.error('Supabase Error:', error.message);
            return res.status(500).send('Error saving order');
        }

        console.log(`Order saved to Supabase: ${data.reference}`);
    }

    res.sendStatus(200);
});

// --- STRIPE ENDPOINT (Legacy/Backup) ---
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { items } = req.body;
        // ... Stripe logic here if needed ...
        res.status(501).send({ error: "Stripe endpoint currently disabled in favor of Paystack." });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// For Vercel, we export the app
module.exports = app;
