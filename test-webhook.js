const http = require('http');
const crypto = require('crypto');
require('dotenv').config();

const secret = process.env.PAYSTACK_SECRET_KEY;
if (!secret) {
    console.error('ERROR: PAYSTACK_SECRET_KEY not found in .env');
    process.exit(1);
}

const payload = JSON.stringify({
    event: 'charge.success',
    data: {
        id: 12345678,
        domain: 'live',
        status: 'success',
        reference: 'TEST-' + Date.now(),
        amount: 55000, // R550.00
        currency: 'ZAR',
        paid_at: new Date().toISOString(),
        customer: {
            email: 'test-customer@example.com'
        },
        metadata: {
            customer_name: 'Test Customer',
            customer_phone: '012 345 6789',
            shipping_address: '123 Test Street, Pretoria, 0001',
            order_items: '1x Tropical Escape (100ml); 2x Zesty Harmony (200ml)',
            order_details: {
                address: '123 Test Street',
                city: 'Pretoria',
                province: 'Gauteng',
                postalCode: '0001'
            },
            cart_items: [
                { name: 'Tropical Escape', size: '100ml', quantity: 1, price: 130 },
                { name: 'Zesty Harmony', size: '200ml', quantity: 2, price: 180 }
            ],
            totals: {
                subtotal: 490,
                shipping: 60,
                total: 550
            }
        }
    }
});

const signature = crypto.createHmac('sha512', secret).update(payload).digest('hex');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/paystack-webhook',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-paystack-signature': signature,
        'Content-Length': payload.length
    }
};

const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error('Error: Could not connect to the server. Make sure "node server.js" is running!');
});

req.write(payload);
req.end();

console.log('--- TEST WEBHOOK SENT ---');
console.log('Check your server logs and orders.json to see if it was recorded.');
