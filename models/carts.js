const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    users: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    items: [
        {
            item: { type: mongoose.Schema.Types.ObjectId, ref: 'items', required: true },
            quantity: { type: Number, default: 1, min: 1 },
        },
    ],
});

module.exports = mongoose.model('Cart', cartSchema);