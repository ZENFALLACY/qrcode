/**
 * CartPage.jsx
 * Shows selected items, allows quantity adjustments, and places orders.
 * Reads table number from URL query parameter.
 */

import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

function CartPage({ cart, removeFromCart, addToCart, clearCart }) {
    const [orderStatus, setOrderStatus] = useState(null); // 'success' | 'error' | null
    const [orderMessage, setOrderMessage] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [placing, setPlacing] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const tableNumber = searchParams.get('table') || '1';

    // Calculate cart total
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    /**
     * Places the order by calling POST /api/order with table number and items.
     */
    const placeOrder = async () => {
        if (cart.length === 0) return;

        setPlacing(true);
        setOrderStatus(null);

        if (!scheduledTime) {
            setOrderStatus('error');
            setOrderMessage('Please select a requested delivery time.');
            setPlacing(false);
            return;
        }

        const selectedDate = new Date(scheduledTime);
        const minDate = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours from now

        if (selectedDate < minDate) {
            setOrderStatus('error');
            setOrderMessage('Orders must be scheduled at least 4 hours in advance.');
            setPlacing(false);
            return;
        }

        try {
            const response = await api.post('/api/order', {
                tableNumber: parseInt(tableNumber, 10),
                items: cart.map((item) => ({
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                })),
                scheduledTime: selectedDate.toISOString(),
            });

            setOrderStatus('success');
            setOrderMessage(response.data.message);
            clearCart();
        } catch (error) {
            setOrderStatus('error');
            setOrderMessage(
                error.response?.data?.error || 'Failed to place order. Please try again.'
            );
        } finally {
            setPlacing(false);
        }
    };

    return (
        <div className="cart-page">
            <div className="page-header">
                <h1>Your Cart</h1>
                <p className="table-badge">Table #{tableNumber}</p>
            </div>

            {/* Order status feedback */}
            {orderStatus === 'success' && (
                <div className="alert alert-success">
                    <span>✅</span>
                    <div>
                        <strong>{orderMessage}</strong>
                        <p>Your order has been sent to the kitchen.</p>
                    </div>
                </div>
            )}

            {orderStatus === 'error' && (
                <div className="alert alert-error">
                    <span>❌</span>
                    <div>
                        <strong>Order Failed</strong>
                        <p>{orderMessage}</p>
                    </div>
                </div>
            )}

            {/* Cart items */}
            {cart.length === 0 && orderStatus !== 'success' ? (
                <div className="empty-cart">
                    <span className="empty-icon">🛒</span>
                    <h3>Your cart is empty</h3>
                    <p>Add some delicious items from our menu!</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/menu?table=${tableNumber}`)}
                    >
                        Browse Menu
                    </button>
                </div>
            ) : (
                cart.length > 0 && (
                    <div className="cart-content">
                        <div className="cart-items">
                            {cart.map((item) => (
                                <div key={item.name} className="cart-item">
                                    <div className="cart-item-info">
                                        <h3>{item.name}</h3>
                                        <p className="cart-item-price">₹{item.price}</p>
                                    </div>
                                    <div className="cart-item-controls">
                                        <button
                                            className="qty-btn"
                                            onClick={() => removeFromCart(item.name)}
                                            aria-label="Decrease quantity"
                                        >
                                            −
                                        </button>
                                        <span className="qty-display">{item.quantity}</span>
                                        <button
                                            className="qty-btn"
                                            onClick={() => addToCart(item)}
                                            aria-label="Increase quantity"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <p className="cart-item-subtotal">
                                        ₹{item.price * item.quantity}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Cart summary */}
                        <div className="cart-summary">
                            <div className="cart-total">
                                <span>Total</span>
                                <span className="total-amount">₹{total}</span>
                            </div>

                            <div className="schedule-section">
                                <label htmlFor="scheduledTime">Requested Delivery Time:</label>
                                <input
                                    type="datetime-local"
                                    id="scheduledTime"
                                    className="datetime-input"
                                    value={scheduledTime}
                                    onChange={(e) => setScheduledTime(e.target.value)}
                                    min={new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                                    required
                                />
                                <small className="schedule-hint">Must be at least 4 hours from now</small>
                            </div>

                            <button
                                className="btn btn-primary btn-place-order"
                                onClick={placeOrder}
                                disabled={placing}
                            >
                                {placing ? 'Placing Order...' : 'Place Order'}
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => navigate(`/menu?table=${tableNumber}`)}
                            >
                                ← Back to Menu
                            </button>
                        </div>
                    </div>
                )
            )}

            {/* After successful order, show a "back to menu" button */}
            {orderStatus === 'success' && cart.length === 0 && (
                <div className="order-success-actions">
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/menu?table=${tableNumber}`)}
                    >
                        Order More
                    </button>
                </div>
            )}
        </div>
    );
}

export default CartPage;
