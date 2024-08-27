const mongoose = require('mongoose');

const referralSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    email: {
        type: String,
        required: true
    },
    referred: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('referral', referralSchema);