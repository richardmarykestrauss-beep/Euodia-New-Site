const PRODUCTS = {
    'tropical': {
        id: 'tropical',
        name: 'Tropical Escape',
        type: 'Room Mist',
        price100: 130,
        price200: 180,
        image: 'images/room-mists/tropical_escape.png',
        shortDesc: 'A warm, luminous atmosphere anchored in golden light.',
        poeticDesc: 'A warm, luminous atmosphere anchored in golden light. Tropical brightness softened into a steady, grounding calm.',
        ritual: 'Release the fragrance into the corners of your space. Allow it to settle, to open, to breathe.\n\nThis is not just scent — it is atmosphere.\n\nUse in moments of stillness, prayer, focus, or rest. Let the room align before you do.',
        ingredients: [
            { name: 'Petrichor', desc: 'the scent of rain on earth' },
            { name: 'Santal', desc: 'creamy, wood-driven warmth' },
            { name: 'Amber', desc: 'golden, enduring depth' }
        ]
    },
    'citrus': {
        id: 'citrus',
        name: 'Citrus Enigma',
        type: 'Room Mist',
        price100: 130,
        price200: 180,
        image: 'images/room-mists/citrus_enigma.png',
        shortDesc: 'Vibrant citrus clarity balanced by a veiled, smoother depth.',
        poeticDesc: 'Vibrant citrus clarity balanced by a veiled, smoother depth. An awakening composition that settles with quiet intention.',
        ritual: 'Release the fragrance into the corners of your space. Allow it to settle, to open, to breathe.\n\nThis is not just scent — it is atmosphere.\n\nUse in moments of stillness, prayer, focus, or rest. Let the room align before you do.',
        ingredients: [
            { name: 'Bergamot', desc: 'clarity & awakening' },
            { name: 'Frankincense', desc: 'sacred, elevating resin' },
            { name: 'Neroli', desc: 'focused solar presence' }
        ]
    },
    'rose': {
        id: 'rose',
        name: 'Rose Haven',
        type: 'Room Mist',
        price100: 130,
        price200: 180,
        image: 'images/room-mists/rose_haven.png',
        shortDesc: 'A soft, composed floral stillness.',
        poeticDesc: 'A soft, composed floral stillness. Graceful rose notes that layer the room in a state of calm, enduring beauty.',
        ritual: 'Release the fragrance into the corners of your space. Allow it to settle, to open, to breathe.\n\nThis is not just scent — it is atmosphere.\n\nUse in moments of stillness, prayer, focus, or rest. Let the room align before you do.',
        ingredients: [
            { name: 'Damask Rose', desc: 'heavy, velvety floral' },
            { name: 'Oud', desc: 'mystical, grounding resin' },
            { name: 'Myrrh', desc: 'ancient, peaceful stillness' }
        ]
    },
    'zesty': {
        id: 'zesty',
        name: 'Zesty Harmony',
        type: 'Room Mist',
        price100: 130,
        price200: 180,
        image: 'images/room-mists/zesty_harmony.png',
        shortDesc: 'Solar brightness brought into perfect alignment.',
        poeticDesc: 'Solar brightness brought into perfect alignment. Radiant notes that rise with clarity before settling into a deep, rounded finish.',
        ritual: 'Release the fragrance into the corners of your space. Allow it to settle, to open, to breathe.\n\nThis is not just scent — it is atmosphere.\n\nUse in moments of stillness, prayer, focus, or rest. Let the room align before you do.',
        ingredients: [
            { name: 'Lemongrass', desc: 'radiant energy & focus' },
            { name: 'Cedarwood', desc: 'stabilizing, earthy anchor' },
            { name: 'Vetiver', desc: 'deep, grounding calm' }
        ]
    },
    'pear': {
        id: 'pear',
        name: 'Pearfection Bliss',
        type: 'Room Mist',
        price100: 130,
        price200: 180,
        image: 'images/room-mists/pearfection_bliss.png',
        shortDesc: 'Velvety sweetness that invites a sense of gentle abundance.',
        poeticDesc: 'Velvety sweetness that invites a sense of gentle abundance. A comforting fragrance crafted for moments of quiet warmth.',
        ritual: 'Release the fragrance into the corners of your space. Allow it to settle, to open, to breathe.\n\nThis is not just scent — it is atmosphere.\n\nUse in moments of stillness, prayer, focus, or rest. Let the room align before you do.',
        ingredients: [
            { name: 'Pear Blossom', desc: 'gentle, light abundance' },
            { name: 'White Musk', desc: 'velvety, soft atmosphere' },
            { name: 'Vanilla Bean', desc: 'comforting, quiet warmth' }
        ]
    },
    'covenant': {
        id: 'covenant',
        name: 'Covenant',
        type: 'Reed Diffuser',
        price100: 450,
        image: 'images/covenant-bottle.png',
        shortDesc: 'A sacred, grounding anchor for the atmosphere.',
        poeticDesc: 'A sacred, grounding anchor for the atmosphere. Designed to cultivate a space of quiet reverence and depth.',
        ritual: 'Insert reeds into the vessel. Allow 24 hours for the fragrance to fully saturate. Flip reeds weekly to refresh the presence.\n\nUse in moments of stillness, prayer, focus, or rest.',
        ingredients: [
            { name: 'Ancient Cedar', desc: 'grounding, sacred anchor' },
            { name: 'Sacred Resin', desc: 'quiet reverence & depth' },
            { name: 'Dark Cypress', desc: 'clarifying, steady presence' }
        ]
    }
};



// Cart State Management
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('euodia_cart')) || [];
        this.updateCounter();
    }

    addItem(product) {
        const existing = this.items.find(item => item.id === product.id && item.size === product.size);
        if (existing) {
            existing.quantity += parseInt(product.quantity);
        } else {
            this.items.push(product);
        }
        this.save();
    }

    removeItem(id, size) {
        this.items = this.items.filter(item => !(item.id === id && item.size === size));
        this.save();
    }

    updateQuantity(id, size, quantity) {
        const item = this.items.find(item => item.id === id && item.size === size);
        if (item) {
            item.quantity = parseInt(quantity);
            if (item.quantity <= 0) {
                this.removeItem(id, size);
            } else {
                this.save();
            }
        }
    }

    save() {
        localStorage.setItem('euodia_cart', JSON.stringify(this.items));
        this.updateCounter();
        // Dispatch custom event for UI updates
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    }

    updateCounter() {
        const counter = document.getElementById('cart-counter');
        if (counter) {
            const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
            counter.textContent = totalItems;
        }
    }

    getTotals() {
        const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        // LOCKED: Constant R140 shipping if there are items in the cart
        const shipping = subtotal > 0 ? 140 : 0;
        return {
            subtotal,
            shipping,
            total: subtotal + shipping
        };
    }
}

const euodiaCart = new Cart();

// Utility for dynamic price update on product cards
function setupPriceUpdates() {
    document.querySelectorAll('.size-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const card = e.target.closest('.product-card') || e.target.closest('.detail-info');
            if (!card) return;
            
            const priceDisplay = card.querySelector('.price-display');
            const price = e.target.value === '200ml' ? 180 : 130;
            priceDisplay.textContent = `R${price}`;
            
            // Update data attributes if needed
            const addButton = card.querySelector('.add-to-cart-btn');
            if (addButton) {
                addButton.dataset.price = price;
                addButton.dataset.size = e.target.value;
            }
        });
    });
}

// Global click handler for Add to Cart
document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart-btn')) {
        const btn = e.target;
        const product = {
            id: btn.dataset.id,
            name: btn.dataset.name,
            type: btn.dataset.type,
            size: btn.dataset.size || '100ml',
            price: parseInt(btn.dataset.price),
            quantity: parseInt(document.getElementById(`qty-${btn.dataset.id}`)?.value || 1),
            image: btn.dataset.image
        };
        
        euodiaCart.addItem(product);
        
        // Refined Feedback
        const originalText = btn.textContent;
        btn.textContent = 'ADDED';
        btn.classList.add('btn-added');
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('btn-added');
        }, 1500);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    setupPriceUpdates();
    euodiaCart.updateCounter();
});
