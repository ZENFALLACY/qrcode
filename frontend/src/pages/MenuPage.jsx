/**
 * MenuPage.jsx
 * Displays restaurant menu items fetched from the backend.
 * Reads table number from URL query parameter (?table=X).
 * Shows a closed banner if ordering is disabled (after 5 PM).
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import MenuCard from '../components/MenuCard';

function MenuPage({ cart, addToCart }) {
    const [menuItems, setMenuItems] = useState([]);
    const [orderingOpen, setOrderingOpen] = useState(true);
    const [statusMessage, setStatusMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();

    // Read table number from URL query string
    const tableNumber = searchParams.get('table') || '1';

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch menu items and ordering status in parallel
                const [menuRes, statusRes] = await Promise.all([
                    api.get('/api/menu'),
                    api.get('/api/status'),
                ]);

                setMenuItems(menuRes.data);
                setOrderingOpen(statusRes.data.ordering);
                setStatusMessage(statusRes.data.message);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Group items by category
    const groupedItems = menuItems.reduce((groups, item) => {
        const category = item.category;
        if (!groups[category]) groups[category] = [];
        groups[category].push(item);
        return groups;
    }, {});

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>Loading menu...</p>
            </div>
        );
    }

    return (
        <div className="menu-page">
            <div className="page-header">
                <h1>Our Menu</h1>
                <p className="table-badge">Table #{tableNumber}</p>
            </div>

            {/* Ordering closed banner */}
            {!orderingOpen && (
                <div className="closed-banner">
                    <span className="closed-icon">🚫</span>
                    <div>
                        <strong>Ordering is closed for today.</strong>
                        <p>{statusMessage}</p>
                    </div>
                </div>
            )}

            {/* Menu items grouped by category */}
            {Object.entries(groupedItems).map(([category, items]) => (
                <section key={category} className="menu-category">
                    <h2 className="category-title">{category}</h2>
                    <div className="menu-grid">
                        {items.map((item) => {
                            const cartItem = cart.find((c) => c.name === item.name);
                            const quantity = cartItem ? cartItem.quantity : 0;
                            return (
                                <MenuCard
                                    key={item._id}
                                    item={item}
                                    quantity={quantity}
                                    onAdd={() => addToCart(item)}
                                    disabled={!orderingOpen}
                                />
                            );
                        })}
                    </div>
                </section>
            ))}
        </div>
    );
}

export default MenuPage;
