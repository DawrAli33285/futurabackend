const mongoose = require('mongoose')

const purchaseSchema = mongoose.Schema({
    items: [{
        type: mongoose.Schema.ObjectId,
        ref: 'items'
    }],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'users'
    },
    totalPrice: {
        type: Number,
        required: true
    },
    shippingCost: {
        type: Number,
        default: 0
    },
    paymentMethod: {
        type: String
    },
    shippingAddress: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String },
        address: { type: String, required: true },
        apartment: { type: String },
        city: { type: String, required: true },
        postcode: { type: String, required: true },
        country: { type: String, required: true },
        state: { type: String }
    },
    agreements: {
        terms: { type: Boolean, default: false },
        newsletter: { type: Boolean, default: false },
        researchOnly: { type: Boolean, default: false }
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true
})

const purchaseModel = mongoose.model('purchases', purchaseSchema)
module.exports = purchaseModel;