require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

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
app.use(express.static(path.join(__dirname)));
app.use(cors());

// Webhook for Paystack Order Persistence (Supabase version)
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

// Endpoint to view orders from Supabase
app.get('/api/orders', async (req, res) => {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return res.status(500).send('Error reading orders');
    res.json(data);
});

// Fallback to index.html for any unmatched routes
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`EUODIA Express Server running at http://localhost:${port}`);
    console.log(`Paystack Webhook Endpoint: http://localhost:${port}/api/paystack-webhook`);
    console.log(`Connected to Supabase: ${process.env.SUPABASE_URL}`);
});
