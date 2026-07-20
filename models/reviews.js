const mongoose = require('mongoose');

const reviewsSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    review:{
        type:String,
        required:true
    },
    starts:{
        type:Number,
        required:true
    },
    item:{
        type:mongoose.Schema.ObjectId,
        ref:'items'
    }
});

module.exports = mongoose.model('reviews', reviewsSchema);