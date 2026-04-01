// Product Database
const PRODUCTS = {
    'tropical': {
        id: 'tropical',
        name: 'Tropical Escape',
        type: 'Room Mist',
        price100: 130,
        price200: 180,
        image: 'images/room-mists/tropical_escape.png',
        shortDesc: 'A gentle release into warmth and light.',
        poeticDesc: 'A gentle release into warmth and light. Fresh tropical brightness opens the room, while softer notes settle into a calm and lingering atmosphere. Designed to evoke the feeling of a sun-drenched sanctuary, this fragrance transforms any space into a haven of tranquility.'
    },
    'citrus': {
        id: 'citrus',
        name: 'Citrus Enigma',
        type: 'Room Mist',
        price100: 130,
        price200: 180,
        image: 'images/room-mists/citrus_enigma.png',
        shortDesc: 'Clarity with a hidden warmth.',
        poeticDesc: 'Clarity with a hidden warmth. A vibrant citrus composition that awakens the air, balanced by a smoother depth that keeps the fragrance refined. This enigmatic blend offers a refreshing burst of energy followed by a sophisticated, lingering trail of warmth.'
    },
    'rose': {
        id: 'rose',
        name: 'Rose Haven',
        type: 'Room Mist',
        price100: 130,
        price200: 180,
        image: 'images/room-mists/rose_haven.png',
        shortDesc: 'A floral stillness, soft and composed.',
        poeticDesc: 'A floral stillness, soft and composed. Rose-led and graceful, this fragrance fills the room with calm beauty and a quiet sense of presence. It is a timeless expression of elegance, bringing the serene atmosphere of a blooming garden into your home.'
    },
    'zesty': {
        id: 'zesty',
        name: 'Zesty Harmony',
        type: 'Room Mist',
        price100: 130,
        price200: 180,
        image: 'images/room-mists/zesty_harmony.png',
        shortDesc: 'Brightness brought into balance.',
        poeticDesc: 'Brightness brought into balance. Fresh, clean citrus notes rise first, then settle into a lighter, rounded finish that lifts the whole space. This harmonious composition creates an uplifting and vibrant environment, perfect for moments of renewal.'
    },
    'pear': {
        id: 'pear',
        name: 'Pearfection Bliss',
        type: 'Room Mist',
        price100: 130,
        price200: 180,
        image: 'images/room-mists/pearfection_bliss.png',
        shortDesc: 'A softer sweetness, warm and inviting.',
        poeticDesc: 'A softer sweetness, warm and inviting. Fruit and comfort meet in a fragrance that brings gentle abundance into the room without becoming heavy. A delightful blend of sweet pear and warm undertones, it offers a sense of Cozy luxury.'
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
        
        // Feedback
        const originalText = btn.textContent;
        btn.textContent = 'ADDED';
        btn.style.backgroundColor = '#4CAF50';
        btn.style.color = 'white';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = '';
            btn.style.color = '';
        }, 1500);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    setupPriceUpdates();
    euodiaCart.updateCounter();
});
