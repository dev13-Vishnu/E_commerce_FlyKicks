const mongoose = require ('mongoose');

const orderSchema = new mongoose.Schema(
    {
        userId : {
            type: mongoose.Schema.Types.ObjectId,
            ref:'user',
            required:true
        },
        products:[
            {
                productId: {
                    type:mongoose.Schema.Types.ObjectId,
                    ref:'products'

                },
                size : {
                    type: String,
                    required: true
                },
                quantity: {
                    type:Number,
                    required:true,
                    default: 1
                },
                productPrice: {
                    type: Number,
                    required: true
                },
                product_orderStatus:
                {
                    type:String,
                    enum:[
                        "Pending",
                        "Compleated",
                        "Canceled",
                        "Return",
                        "Shipped",
                        "Return Pending",
                        "Return Cancelled",
                        "Return Compleatd",
                        "Payment Failed"
                    ],
                    default:"Pending"
                },
                Payment_method:{
                    method:{
                        type:String,
                        enum: ['cod','Walled','RazonrPay'],

                    }
                },
                payment_status: {
                    type: String,
                    enum:["Failed","Success"],
                    default:'Failed'
                },
                message:{
                    type:String,
                    default:""
                },
                date:{
                    type:Date,
                    default:Date.now()
                },
                coupon: {
                    type:mongoose.Schema.Types.ObjectId,
                    ref:"coupon",
                    default: null
                },
                cartId:{
                    type: mongoose.Schema.Types.ObjectId,
                    ref:'cart'
                },
                delivery: {
                    type: Number,
                    default:0
                }
            }
        ],
        address:[{
            name:{
                type: String,
                required: true
            },
            mobile:{
                type:Number,
                required: true
            },
            country:{
                type : String,
                required:true
            },
            city:{
                type: String,
                required: true
            },
            street:{
                type:String,
                required:true,
            },
            isDefault:{
                type: Boolean,
                default:false,
            }
        }],
        totalPrice : {
            type: Number,
            required: true
        },
        wallet:{
            type:Number,
            default: 0
        },

    },{
        timestamps:true
    }
)

module.exports = mongoose.model("orde",orderSchema)