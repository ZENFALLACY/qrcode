/**
 * AdminPage.jsx
 * Password-protected admin panel for managing restaurant menu items.
 * Supports adding, editing, and deleting menu items.
 */

import { useState, useEffect } from 'react';
import { api, setStaffToken, getStaffToken } from '../api/client';

// Predefined category options
const CATEGORIES = ['Starters', 'Main Course', 'Drinks', 'Desserts', 'Breads', 'Sides'];

function AdminPage() {
    // Authentication state (JWT in sessionStorage, validated on load)
    const [authenticated, setAuthenticated] = useState(false);
    const [bootstrapping, setBootstrapping] = useState(() => !!getStaffToken());
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);

    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formVisible, setFormVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', message }

    // Form fields
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0]);

    /**
     * Handle admin login — verifies password with backend.
     */
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

    /**
     * Logout — clears session.
     */
    const handleLogout = () => {
        setAuthenticated(false);
        setStaffToken(null);
    };

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

    /**
     * Fetch all menu items from the backend.
     */
    const fetchItems = async () => {
        try {
            const res = await api.get('/api/menu');
            setMenuItems(res.data);
        } catch (err) {
            console.error('Failed to fetch menu items:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authenticated) fetchItems();
    }, [authenticated]);

    /**
     * Show a temporary feedback message.
     */
    const showFeedback = (type, message) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 3000);
    };

    /**
     * Reset the form to its default state.
     */
    const resetForm = () => {
        setName('');
        setPrice('');
        setCategory(CATEGORIES[0]);
        setEditingId(null);
        setFormVisible(false);
    };

    /**
     * Open the form pre-filled for editing an existing item.
     */
    const startEdit = (item) => {
        setName(item.name);
        setPrice(String(item.price));
        setCategory(item.category);
        setEditingId(item._id);
        setFormVisible(true);
    };

    /**
     * Handle form submission for both create and update.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim() || !price || !category) {
            showFeedback('error', 'All fields are required');
            return;
        }

        const itemData = {
            name: name.trim(),
            price: parseFloat(price),
            category,
        };

        try {
            if (editingId) {
                // Update existing item
                await api.put(`/api/menu/${editingId}`, itemData);
                showFeedback('success', `"${itemData.name}" updated successfully`);
            } else {
                // Create new item
                await api.post('/api/menu', itemData);
                showFeedback('success', `"${itemData.name}" added to the menu`);
            }

            resetForm();
            fetchItems(); // Refresh the list
        } catch (err) {
            if (err.response?.status === 401) {
                setStaffToken(null);
                setAuthenticated(false);
                showFeedback('error', 'Session expired. Please log in again.');
                return;
            }
            showFeedback('error', err.response?.data?.error || 'Something went wrong');
        }
    };

    /**
     * Delete a menu item after confirmation.
     */
    const handleDelete = async (item) => {
        if (!window.confirm(`Delete "${item.name}" from the menu?`)) return;

        try {
            await api.delete(`/api/menu/${item._id}`);
            showFeedback('success', `"${item.name}" deleted`);
            fetchItems();
        } catch (err) {
            if (err.response?.status === 401) {
                setStaffToken(null);
                setAuthenticated(false);
                showFeedback('error', 'Session expired. Please log in again.');
                return;
            }
            showFeedback('error', 'Failed to delete item');
        }
    };

    // Group items by category for display
    const groupedItems = menuItems.reduce((groups, item) => {
        if (!groups[item.category]) groups[item.category] = [];
        groups[item.category].push(item);
        return groups;
    }, {});

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
                    <h2>Admin Access</h2>
                    <p>Please enter the admin password to continue.</p>
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
                <p>Loading admin panel...</p>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>Admin Panel</h1>
                <div className="admin-header-actions">
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            resetForm();
                            setFormVisible(!formVisible);
                        }}
                    >
                        {formVisible ? '✕ Cancel' : '+ Add Item'}
                    </button>
                    <button className="btn btn-secondary" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            {/* Feedback message */}
            {feedback && (
                <div className={`alert alert-${feedback.type}`}>
                    <span>{feedback.type === 'success' ? '✅' : '❌'}</span>
                    <div><strong>{feedback.message}</strong></div>
                </div>
            )}

            {/* Add / Edit Form */}
            {formVisible && (
                <form className="admin-form" onSubmit={handleSubmit}>
                    <h3 className="admin-form-title">
                        {editingId ? 'Edit Item' : 'Add New Item'}
                    </h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="item-name">Item Name</label>
                            <input
                                id="item-name"
                                type="text"
                                placeholder="e.g. Butter Chicken"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="item-price">Price (₹)</label>
                            <input
                                id="item-price"
                                type="number"
                                placeholder="e.g. 350"
                                min="0"
                                step="10"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="item-category">Category</label>
                            <select
                                id="item-category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                            {editingId ? 'Save Changes' : 'Add to Menu'}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={resetForm}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Menu Items Table grouped by category */}
            {Object.keys(groupedItems).length === 0 ? (
                <div className="empty-cart">
                    <span className="empty-icon">📋</span>
                    <h3>No menu items yet</h3>
                    <p>Click "Add Item" above to start building your menu.</p>
                </div>
            ) : (
                Object.entries(groupedItems).map(([cat, items]) => (
                    <section key={cat} className="admin-category">
                        <h2 className="category-title">{cat}</h2>
                        <div className="admin-items">
                            {items.map((item) => (
                                <div key={item._id} className="admin-item">
                                    <div className="admin-item-info">
                                        <h3>{item.name}</h3>
                                        <p className="menu-card-price">₹{item.price}</p>
                                    </div>
                                    <div className="admin-item-actions">
                                        <button
                                            className="btn btn-edit"
                                            onClick={() => startEdit(item)}
                                            aria-label={`Edit ${item.name}`}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            className="btn btn-delete"
                                            onClick={() => handleDelete(item)}
                                            aria-label={`Delete ${item.name}`}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))
            )}
        </div>
    );
}

export default AdminPage;
