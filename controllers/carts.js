const cartsModel = require('../models/carts');

const addItemToCart = async (req, res) => {
    try {
        const { itemId } = req.body;
        const userId = req.user.id;

        if (!itemId) {
            return res.status(400).json({ message: 'itemId is required' });
        }

        let cart = await cartsModel.findOne({ users: userId });

        if (!cart) {
            cart = await cartsModel.create({
                users: userId,
                items: [{ item: itemId, quantity: 1 }],
            });
        } else {
            const existingEntry = cart.items.find(
                (entry) => entry.item.toString() === itemId
            );

            if (existingEntry) {
                existingEntry.quantity += 1;
            } else {
                cart.items.push({ item: itemId, quantity: 1 });
            }

            await cart.save();
        }

        const populatedCart = await cartsModel
            .findById(cart._id)
            .populate('items.item');

        return res.status(200).json({
            message: 'Item added to cart successfully',
            cart: populatedCart,
        });
    } catch (error) {
        console.error('Add item to cart error:', error);
        return res.status(500).json({ message: 'Something went wrong while adding item to cart' });
    }
};


const removeItemFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;
        const userId = req.user.id;

        const cart = await cartsModel.findOne({ users: userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const existingEntry = cart.items.find(
            (entry) => entry.item.toString() === itemId
        );

        if (!existingEntry) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        cart.items = cart.items.filter(
            (entry) => entry.item.toString() !== itemId
        );
        await cart.save();

        const populatedCart = await cartsModel
            .findById(cart._id)
            .populate('items.item');

        return res.status(200).json({
            message: 'Item removed from cart successfully',
            cart: populatedCart,
        });
    } catch (error) {
        console.error('Remove item from cart error:', error);
        return res.status(500).json({ message: 'Something went wrong while removing item from cart' });
    }
};


const updateItemQuantity = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { delta } = req.body; 
        const userId = req.user.id;

        if (typeof delta !== 'number') {
            return res.status(400).json({ message: 'delta must be a number' });
        }

        const cart = await cartsModel.findOne({ users: userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const existingEntry = cart.items.find(
            (entry) => entry.item.toString() === itemId
        );

        if (!existingEntry) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        existingEntry.quantity += delta;

        if (existingEntry.quantity <= 0) {
            cart.items = cart.items.filter(
                (entry) => entry.item.toString() !== itemId
            );
        }

        await cart.save();

        const populatedCart = await cartsModel
            .findById(cart._id)
            .populate('items.item');

        return res.status(200).json({
            message: 'Cart quantity updated successfully',
            cart: populatedCart,
        });
    } catch (error) {
        console.error('Update quantity error:', error);
        return res.status(500).json({ message: 'Something went wrong while updating quantity' });
    }
};


const getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await cartsModel.findOne({ users: userId }).populate('items.item');

        if (!cart) {
            return res.status(200).json({
                message: 'Cart is empty',
                cart: { users: userId, items: [] },
            });
        }

        return res.status(200).json({
            message: 'Cart fetched successfully',
            cart,
        });
    } catch (error) {
        console.error('Get cart error:', error);
        return res.status(500).json({ message: 'Something went wrong while fetching the cart' });
    }
};

module.exports = { addItemToCart, removeItemFromCart, updateItemQuantity, getCart };