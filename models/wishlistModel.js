const mongoose = require('mongoose');
const wishlistSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products:[{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"products",
            required: true
        }
    }]
})

module.exports = mongoose.model('wishlist',wishlistSchema);