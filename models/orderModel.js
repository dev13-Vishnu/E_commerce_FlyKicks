const mongoose = required ('mongoose');

const orderSchema = new mongoose.Schema(
    {
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        cartId:{
            type: mongoose.Scheme.Types.ObjectId,
            ref: 'car'
        }
    }
)