const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "carts",
      required: true,
    },
    orderId: {
      type: String,
      default: () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
      },
      unique: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
          required: true,
        },
        size: {
          type: String,
          required: true,
        },
        productPrice: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        status: {
          type: String,
          enum: [
            "Pending",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled",
          "Return Pending",
            "Return Cancelled",
            "Return Success",
          ],
          default: "Pending",
        },
        reason: {
          type: String,
          required: false,
        },
      },
    ],
    address:[{
        name:{
            type:String,
            required:true
        },
        mobile:{
            type:Number,
            required:true
        },
        country:{
            type:String,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        city:{
            type:String,
            required:true
        },
        street:{
            type:String,
            required:true
        },
        pincode:{
            type:Number,
            required:true
        },
        isDefault:{
            type:Boolean,
            default:false
        }
    }],
    payableAmount: {
      type: Number,
      required: true,
    },
    coupon: {
      type: String,
    },
    freeShipping: {
      type: Boolean,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "RazorPay"],
    },
    paymentStatus: {
      type: String,
      enum: ["Success", "Pending", "Failed"],
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("orders", orderSchema);