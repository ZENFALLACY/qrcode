/**
 * App.jsx
 * Root component with React Router setup for /menu, /cart, and /admin routes.
 */

import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import AdminPage from './pages/AdminPage';
import KitchenPage from './pages/KitchenPage';

function App() {
    // Cart state shared between Menu and Cart pages
    const [cart, setCart] = useState([]);

    /**
     * Adds an item to the cart. If it already exists, increments quantity.
     */
    const addToCart = (item) => {
        setCart((prev) => {
            const existing = prev.find((c) => c.name === item.name);
            if (existing) {
                return prev.map((c) =>
                    c.name === item.name ? { ...c, quantity: c.quantity + 1 } : c
                );
            }
            return [...prev, { name: item.name, price: item.price, quantity: 1 }];
        });
    };

    /**
     * Removes one quantity of an item, or removes it entirely if quantity is 1.
     */
    const removeFromCart = (itemName) => {
        setCart((prev) => {
            const existing = prev.find((c) => c.name === itemName);
            if (existing && existing.quantity > 1) {
                return prev.map((c) =>
                    c.name === itemName ? { ...c, quantity: c.quantity - 1 } : c
                );
            }
            return prev.filter((c) => c.name !== itemName);
        });
    };

    /**
     * Clears the entire cart (used after successful order).
     */
    const clearCart = () => setCart([]);

    return (
        <div className="app">
            <Navbar cartCount={cart.reduce((sum, c) => sum + c.quantity, 0)} />
            <div className="global-info-banner">
                <p>📞 <strong>For any queries, contact:</strong> +91 98765 43210</p>
                <p>💡 <strong>Note:</strong> Orders require a 4-hour minimum notice. <br /><i>(Example: For breakfast at 6:00 AM, please order by 6:00 PM the previous day)</i></p>
            </div>
            <main className="main-content">
                <Routes>
                    <Route
                        path="/menu"
                        element={<MenuPage cart={cart} addToCart={addToCart} />}
                    />
                    <Route
                        path="/cart"
                        element={
                            <CartPage
                                cart={cart}
                                removeFromCart={removeFromCart}
                                addToCart={addToCart}
                                clearCart={clearCart}
                            />
                        }
                    />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/kitchen" element={<KitchenPage />} />
                    {/* Redirect root to /menu */}
                    <Route path="*" element={<Navigate to="/menu" replace />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
