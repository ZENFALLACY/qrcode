/**
 * MenuCard.jsx
 * Displays a single menu item with name, price, and an "Add to Cart" button.
 */

function MenuCard({ item, quantity, onAdd, disabled }) {
    return (
        <div className="menu-card">
            <div className="menu-card-content">
                <h3 className="menu-card-name">{item.name}</h3>
                <p className="menu-card-price">₹{item.price}</p>
            </div>
            <div className="menu-card-actions">
                {quantity > 0 && (
                    <span className="menu-card-badge">{quantity} in cart</span>
                )}
                <button
                    className="btn btn-add"
                    onClick={onAdd}
                    disabled={disabled}
                    aria-label={`Add ${item.name} to cart`}
                >
                    {disabled ? 'Closed' : '+ Add'}
                </button>
            </div>
        </div>
    );
}

export default MenuCard;
