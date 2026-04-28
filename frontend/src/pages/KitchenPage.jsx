/**
 * KitchenPage.jsx
 * Staff dashboard for pending orders (JWT-protected API).
 */

import { useState, useEffect } from 'react';
import { api, setStaffToken, getStaffToken } from '../api/client';

function KitchenPage() {
    const [authenticated, setAuthenticated] = useState(false);
    const [bootstrapping, setBootstrapping] = useState(() => !!getStaffToken());
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        const t = getStaffToken();
        if (!t) {
            setBootstrapping(false);
            return;
        }
        api.get('/api/admin/me')
            .then(() => setAuthenticated(true))
            .catch(() => {
                setStaffToken(null);
            })
            .finally(() => setBootstrapping(false));
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthError('');

        try {
            const res = await api.post('/api/admin/login', { password }, { skipAuth: true });
            if (res.data.success && res.data.token) {
                setStaffToken(res.data.token);
                setAuthenticated(true);
            }
        } catch (err) {
            setAuthError(err.response?.data?.message || 'Incorrect password');
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogout = () => {
        setAuthenticated(false);
        setStaffToken(null);
        setOrders([]);
    };

    const fetchOrders = async () => {
        try {
            const res = await api.get('/api/orders');
            setOrders(res.data);
            setLastUpdated(new Date());
        } catch (err) {
            if (err.response?.status === 401) {
                setStaffToken(null);
                setAuthenticated(false);
                return;
            }
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const markCompleted = async (orderId) => {
        try {
            await api.patch(`/api/orders/${orderId}/status`, { status: 'completed' });
            setOrders((prev) => prev.filter((order) => order._id !== orderId));
        } catch (err) {
            if (err.response?.status === 401) {
                setStaffToken(null);
                setAuthenticated(false);
                return;
            }
            console.error('Failed to update order:', err);
            alert('Failed to mark order as complete');
        }
    };

    useEffect(() => {
        if (!authenticated) return;

        fetchOrders();
        const intervalId = setInterval(fetchOrders, 10000);
        return () => clearInterval(intervalId);
    }, [authenticated]);

    const formatTimePassed = (dateString) => {
        const orderTime = new Date(dateString);
        const diffMs = new Date() - orderTime;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins === 1) return '1 min ago';
        return `${diffMins} mins ago`;
    };

    if (bootstrapping) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>Checking session...</p>
            </div>
        );
    }

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
                                onClick={() => { window.location.href = '/menu'; }}
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
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-secondary" onClick={fetchOrders}>
                        🔄 Refresh Now
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="empty-cart">
                    <span className="empty-icon">🍳</span>
                    <h3>No pending orders</h3>
                    <p>The kitchen is clear. Great job!</p>
                </div>
            ) : (
                <div className="order-grid">
                    {orders.map((order) => (
                        <div key={order._id} className="order-ticket">
                            <div className="ticket-header">
                                <div>
                                    <span className="table-badge">Table {order.tableNumber}</span>
                                    {order.scheduledTime && (
                                        <div className="scheduled-badge">
                                            🎯 For:{' '}
                                            {new Date(order.scheduledTime).toLocaleString([], {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </div>
                                    )}
                                </div>
                                <span
                                    className={`time-badge ${
                                        Math.floor(new Date() - new Date(order.orderTime)) / 60000 > 15
                                            ? 'urgent'
                                            : ''
                                    }`}
                                >
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
                                    type="button"
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
