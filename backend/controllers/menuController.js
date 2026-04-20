/**
 * Menu Controller
 * Handles CRUD operations for menu items.
 */

const MenuItem = require('../models/MenuItem');

/**
 * GET /api/menu
 * Returns all menu items sorted by category.
 */
const getMenuItems = async (_req, res) => {
    try {
        const items = await MenuItem.find().sort({ category: 1, name: 1 });
        res.json(items);
    } catch (error) {
        console.error('Error fetching menu:', error.message);
        res.status(500).json({ error: 'Failed to fetch menu items' });
    }
};

/**
 * POST /api/menu
 * Creates a new menu item.
 * Body: { name, price, category }
 */
const createMenuItem = async (req, res) => {
    try {
        const { name, price, category } = req.body;

        if (!name || price == null || !category) {
            return res.status(400).json({ error: 'Name, price, and category are required' });
        }

        const item = await MenuItem.create({ name, price, category });
        console.log(`✅ Added menu item: ${name}`);
        res.status(201).json(item);
    } catch (error) {
        console.error('Error creating menu item:', error.message);
        res.status(500).json({ error: 'Failed to create menu item' });
    }
};

/**
 * PUT /api/menu/:id
 * Updates an existing menu item.
 * Body: { name, price, category }
 */
const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, category } = req.body;

        const item = await MenuItem.findByIdAndUpdate(
            id,
            { name, price, category },
            { new: true, runValidators: true }
        );

        if (!item) {
            return res.status(404).json({ error: 'Menu item not found' });
        }

        console.log(`📝 Updated menu item: ${name}`);
        res.json(item);
    } catch (error) {
        console.error('Error updating menu item:', error.message);
        res.status(500).json({ error: 'Failed to update menu item' });
    }
};

/**
 * DELETE /api/menu/:id
 * Deletes a menu item.
 */
const deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await MenuItem.findByIdAndDelete(id);

        if (!item) {
            return res.status(404).json({ error: 'Menu item not found' });
        }

        console.log(`🗑️ Deleted menu item: ${item.name}`);
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting menu item:', error.message);
        res.status(500).json({ error: 'Failed to delete menu item' });
    }
};

module.exports = { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem };
