require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname)));
app.use(express.json());
app.use(cors());

// Price Database (Sync with js/cart.js)
const PRICES = {
    'tropical': { '100ml': 130, '200ml': 180 },
    'citrus': { '100ml': 130, '200ml': 180 },
    'rose': { '100ml': 130, '200ml': 180 },
    'zesty': { '100ml': 130, '200ml': 180 },
    'pear': { '100ml': 130, '200ml': 180 }
};

const SHIPPING_FLAT_RATE = 140;

// Create Payment Intent Endpoint
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { items } = req.body;
        
        // 1. Calculate Total (Server-side verification)
        let subtotal = 0;
        items.forEach(item => {
            const productPrices = PRICES[item.id];
            if (productPrices && productPrices[item.size]) {
                subtotal += productPrices[item.size] * item.quantity;
            }
        });

        const totalCents = (subtotal + SHIPPING_FLAT_RATE) * 100; // Stripe expects cents

        // 2. Create Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalCents,
            currency: 'zar', // South African Rand
            automatic_payment_methods: {
                enabled: true,
            },
            description: `EUODIA Order - ${items.length} items`,
        });

        // 3. Send Client Secret back
        res.send({
            clientSecret: paymentIntent.client_secret,
            total: subtotal + SHIPPING_FLAT_RATE
        });

    } catch (error) {
        console.error('Stripe Error:', error.message);
        res.status(500).send({ error: error.message });
    }
});

// Fallback to index.html for any unmatched routes (Client-side routing support)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`EUODIA Express Server running at http://localhost:${port}`);
});
