const mongoose = require('mongoose');
const wishlistSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    products:[{
        prouductId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"products",
            requier: true
        }
    }]
})

module.exports = mongoose.model('wishlist',wishlistSchema);