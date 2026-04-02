require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();

// Middleware
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
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { items } = req.body;
        
        let subtotal = 0;
        items.forEach(item => {
            const productPrices = PRICES[item.id];
            if (productPrices && productPrices[item.size]) {
                subtotal += productPrices[item.size] * item.quantity;
            }
        });

        const totalCents = (subtotal + SHIPPING_FLAT_RATE) * 100;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalCents,
            currency: 'zar',
            automatic_payment_methods: {
                enabled: true,
            },
            description: `EUODIA Order - ${items.length} items`,
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
            total: subtotal + SHIPPING_FLAT_RATE
        });

    } catch (error) {
        console.error('Stripe Error:', error.message);
        res.status(500).send({ error: error.message });
    }
});

// For Vercel, we export the app
module.exports = app;
