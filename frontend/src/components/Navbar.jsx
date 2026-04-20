/**
 * Navbar.jsx
 * Top navigation bar with restaurant title and cart link.
 */

import { Link, useSearchParams } from 'react-router-dom';

function Navbar({ cartCount }) {
    const [searchParams] = useSearchParams();
    const tableNumber = searchParams.get('table') || '1';

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to={`/menu?table=${tableNumber}`} className="navbar-brand">
                    <span className="brand-icon">🍽️</span>
                    <span className="brand-text">Homestay MistyWoods</span>
                </Link>
                <div className="navbar-links">
                    <Link to={`/menu?table=${tableNumber}`} className="nav-menu-link">
                        📖 Menu
                    </Link>
                    <Link to="/kitchen" className="nav-kitchen-link">
                        🧑‍🍳 Kitchen
                    </Link>
                    <Link to="/admin" className="nav-admin-link">
                        ⚙️ Admin
                    </Link>
                    <Link to={`/cart?table=${tableNumber}`} className="nav-cart-link">
                        <span className="cart-icon">🛒</span>
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
