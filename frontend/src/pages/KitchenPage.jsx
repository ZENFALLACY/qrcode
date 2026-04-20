/**
 * KitchenPage.jsx
 * Password-protected dashboard for restaurant staff to view pending orders.
 * Auto-refreshes every 10 seconds.
 */

import { useState, useEffect } from 'react';
import axios from 'axios';

function KitchenPage() {
    // Shared authentication state (same as AdminPage)
    const [authenticated, setAuthenticated] = useState(
        () => sessionStorage.getItem('adminAuth') === 'true'
    );
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    /**
     * Handle login (shared admin password)
     */
    const handleLogin = async (e) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthError('');

        try {
            const res = await axios.post('/api/admin/login', { password });
            if (res.data.success) {
                setAuthenticated(true);
                sessionStorage.setItem('adminAuth', 'true');
            }
        } catch (err) {
            setAuthError(err.response?.data?.message || 'Incorrect password');
        } finally {
            setAuthLoading(false);
        }
    };

    /**
     * Fetch pending orders
     */
    const fetchOrders = async () => {
        try {
            const res = await axios.get('/api/orders');
            setOrders(res.data);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Mark an order as completed
     */
    const markCompleted = async (orderId) => {
        try {
            await axios.patch(`/api/orders/${orderId}/status`, { status: 'completed' });
            // Remove the order instantly from the UI for a snappy feel
            setOrders(prev => prev.filter(order => order._id !== orderId));
        } catch (err) {
            console.error('Failed to update order:', err);
            alert('Failed to mark order as complete');
        }
    };

    // Auto-refresh orders every 10 seconds
    useEffect(() => {
        if (!authenticated) return;

        // Initial fetch
        fetchOrders();

        const intervalId = setInterval(fetchOrders, 10000);
        return () => clearInterval(intervalId);
    }, [authenticated]);

    // Format time passed since order
    const formatTimePassed = (dateString) => {
        const orderTime = new Date(dateString);
        const diffMs = new Date() - orderTime;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins === 1) return '1 min ago';
        return `${diffMins} mins ago`;
    };

    if (!authenticated) {
        return (
            <div className="admin-login-page">
                <div className="admin-login-card">
                    <h2>Kitchen Access</h2>
                    <p>Please enter the staff password to continue.</p>
                    {authError && <div className="auth-error">{authError}</div>}
                    <form onSubmit={handleLogin} className="admin-login-form">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                        />
                        <div className="login-actions">
                            <button type="submit" className="btn btn-primary" disabled={authLoading}>
                                {authLoading ? 'Verifying...' : 'Login'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => window.location.href = '/menu'}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>Loading kitchen dashboard...</p>
            </div>
        );
    }

    return (
        <div className="kitchen-page">
            <div className="page-header">
                <div>
                    <h1>🧑‍🍳 Kitchen Orders</h1>
                    <p className="last-updated">
                        Last synced: {lastUpdated.toLocaleTimeString()}
                    </p>
                </div>
                <button className="btn btn-secondary" onClick={fetchOrders}>
                    🔄 Refresh Now
                </button>
            </div>

            {orders.length === 0 ? (
                <div className="empty-cart">
                    <span className="empty-icon">🍳</span>
                    <h3>No pending orders</h3>
                    <p>The kitchen is clear. Great job!</p>
                </div>
            ) : (
                <div className="order-grid">
                    {orders.map(order => (
                        <div key={order._id} className="order-ticket">
                            <div className="ticket-header">
                                <div>
                                    <span className="table-badge">Table {order.tableNumber}</span>
                                    {order.scheduledTime && (
                                        <div className="scheduled-badge">
                                            🎯 For: {new Date(order.scheduledTime).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    )}
                                </div>
                                <span className={`time-badge ${Math.floor(new Date() - new Date(order.orderTime)) / 60000 > 15 ? 'urgent' : ''}`}>
                                    {formatTimePassed(order.orderTime)}
                                </span>
                            </div>
                            <ul className="ticket-items">
                                {order.items.map((item, idx) => (
                                    <li key={idx}>
                                        <span className="qty">{item.quantity}x</span>
                                        <span className="name">{item.name}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="ticket-footer">
                                <button
                                    className="btn btn-success btn-full"
                                    onClick={() => markCompleted(order._id)}
                                >
                                    ✓ Mark Completed
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default KitchenPage;
