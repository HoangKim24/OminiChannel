const auth = {
    login: async (username, password) => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (response.ok) {
            const user = await response.json();
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        }
        throw new Error('Đăng nhập thất bại');
    },
    logout: () => {
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    },
    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    checkAuth: (requiredRole) => {
        const user = auth.getUser();
        if (!user) {
            window.location.href = 'login.html';
            return null;
        }
        if (requiredRole && user.role !== requiredRole) {
            window.location.href = 'index.html';
            return null;
        }
        return user;
    },
    register: async (username, password) => {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (response.ok) return await response.json();
        const err = await response.json();
        throw new Error(err.message || 'Đăng ký thất bại');
    },
    // Cart logic
    getCart: () => JSON.parse(localStorage.getItem('cart')) || [],
    addToCart: (product, qty = 1) => {
        let cart = auth.getCart();
        const existing = cart.find(item => item.id === product.id);
        if (existing) existing.quantity += qty;
        else cart.push({ ...product, quantity: qty });
        localStorage.setItem('cart', JSON.stringify(cart));
    },
    removeFromCart: (id) => {
        let cart = auth.getCart().filter(item => item.id !== id);
        localStorage.setItem('cart', JSON.stringify(cart));
    },
    clearCart: () => localStorage.removeItem('cart'),
    // Favorites logic
    getFavorites: () => JSON.parse(localStorage.getItem('favorites')) || [],
    isFavorite: (id) => {
        const favs = auth.getFavorites();
        return favs.includes(id);
    },
    toggleFavorite: (id, btnElement) => {
        let favs = auth.getFavorites();
        if (favs.includes(id)) {
            favs = favs.filter(fId => fId !== id);
            if (btnElement) btnElement.classList.remove('active');
        } else {
            favs.push(id);
            if (btnElement) btnElement.classList.add('active');
        }
        localStorage.setItem('favorites', JSON.stringify(favs));
    }
};
