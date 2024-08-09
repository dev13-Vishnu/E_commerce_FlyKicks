const mongoose = require('mongoose');

const couponSchema = mongoose.Schema({
    coupon_code:{
        type: String,
        required: true
    },
    coupon_description: {
        type: String,
        required: true
    },
    offer_percentage: {
        type: Number,
        required: true
    },
    coupon_count: {
        type: Number,
        default: 0
    },
    minimum_order_amount: {
        type: Number,
        required: true
    },
    maximum_order_order: {
        type: Number,
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    ending_date: {
        type: Date,
        required: true
    },
    isBlocked: {
        type: Boolean,
        default:false
    }
})

module.exports = mongoose.model('coupon', couponSchema);