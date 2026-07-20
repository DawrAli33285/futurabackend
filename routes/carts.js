const express = require('express');
const router = express.Router();
const { addItemToCart, removeItemFromCart, updateItemQuantity, getCart } = require('../controllers/carts');
const isUser = require('../middleware/user');

router.post('/', isUser, addItemToCart);
router.patch('/:itemId', isUser, updateItemQuantity);
router.delete('/:itemId', isUser, removeItemFromCart);
router.get('/', isUser, getCart);

module.exports = router;