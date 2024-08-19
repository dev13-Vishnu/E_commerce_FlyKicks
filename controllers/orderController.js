const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Address = require('../models/addressModel');
const User = require('../models/userModel');
const Razorpay = require('razorpay');
const crypto = require('crypto')  




const razorpayInstance = new Razorpay ({
key_id: process.env.RAZORPAY_ID_KEY,
key_secret: process.env.RAZORPAY_SECRET_KEY
});

const cancelOrder = async(req,res) =>{
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId);

        if(!order){
            return res.status(404).json({ success: false, message:'Order not found'});
        }
        //Update order status to "Canceled" and increase product stock\

        for(const product of order.products) {
            product.product_orderStatus = 'Canceled';
            console.log('OrderControler.cancelOrder product.productId',product.productId);
            await Product.findByIdAndUpdate(product.productId, {
                $inc:{[`stock.${product.size}`]:product.quantity}
            });
        }
        await order.save();

        res.status(200).json({success:true,message:'Order cancelled successfully'});

 
    } catch (error) {
        console.error('Error cancelling order:',error);
        res.status(500).json({success:false,message: 'Failed to cancel order'})
    }
}
const loadCheckout = async(req,res) =>{ 
    try {
      const searchQuery = req.query.q;
      const sortQuery = req.query.sort;

      const userId = req.session.user._id;
      const addressData = await Address.find({userId});
      const userData = await User.findById(userId);
      const cart = await Cart.findOne({userId}).populate('products.productId')

      
    //   console.log('cartControl.loadCheckout cart:',cart);
      res.render('user/checkout',{
        userData,
        cart,
        addressData,
        searchQuery,
        sortQuery
      });
    } catch (error) {
      
      console.log('Error from cartController.loadCheckout',error);
    }
  }

  
  // Controller to handle COD orders
const placeOrderCOD = async (req, res) => {
  try {
      const userId = req.session.user._id;
      const { selectedAddress, orderTotalAmount } = req.body;

      // Get the selected address
      const addressDoc = await Address.findOne({ userId, 'address._id': selectedAddress }, { 'address.$': 1 });
      if (!addressDoc) return res.status(404).json({ success: false, message: 'Address not found' });

      const address = addressDoc.address[0];

      // Fetch the user's cart
      const cart = await Cart.findOne({ userId }).populate('products.productId');
      if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

      // Determine if the order qualifies for free shipping
      const freeShipping = orderTotalAmount >= 10000;

      // Prepare the order data
      const orderData = {
          userId,
          cartId: cart._id,
          products: cart.products.map(product => ({
              productId: product.productId._id,
              size: product.size,
              quantity: product.quantity,
              productPrice: product.productId.price,
          })),
          address: {
              name: address.name,
              street: address.street,
              country: address.country,
              city: address.city,
              state: address.state,
              pincode: address.pincode,
              mobile: address.mobile.toString(),
              email: '',
          },
          payableAmount: orderTotalAmount,
          freeShipping: freeShipping,
          paymentMethod: 'COD',
          paymentStatus: 'Pending',
      };

      // Save the order to the database
      const order = new Order(orderData);
      await order.save();

      // Update the product stock
      for (const product of cart.products) {
          const updateField = `stock.${product.size}`;
          await Product.findByIdAndUpdate(product.productId._id, {
              $inc: { [updateField]: -product.quantity },
          });
      }

      // Clear the cart after the order is placed
      await Cart.findOneAndDelete({ userId });

      res.status(200).json({ success: true, message: 'Order placed successfully', order });
  } catch (error) {
      console.error('Error during checkout:', error);
      res.status(500).json({ success: false, message: 'Failed to place order' });
  }
};

// Controller to handle Razorpay orders
const placeOrderRazorPay = async (req, res) => {
  try {
      const { selectedAddress, amount } = req.body;
      const receiptId = `order-rcpt-${Date.now()}`;

      // Create a new Razorpay order
      const order = await razorpayInstance.orders.create({
          amount: amount ,  // Razorpay expects the amount in paisa
          currency: 'INR',
          receipt: receiptId,
      });

      res.status(200).json({ success: true, orderId: order.id });
  } catch (error) {
      console.error('Error during Razorpay order creation:', error);
      res.status(500).json({ success: false, message: 'Failed to create Razorpay order' });
  }
};

// Controller to verify Razorpay payment
const verifyPayment = async (req, res) => {
  try {
      const { data, payload } = req.body;
      const userId = req.session.user._id;

      const cart = await Cart.findOne({ userId }).populate('products.productId');
      if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

      const addressDoc = await Address.findOne({ userId, 'address._id': data.address }, { 'address.$': 1 });
      if (!addressDoc) return res.status(404).json({ success: false, message: 'Address not found' });

      const address = addressDoc.address[0];

      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = payload.payment;

      // Verify the payment signature
      let hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY);
      hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
      hmac = hmac.digest("hex");

      // Determine if the order qualifies for free shipping
      const freeShipping = data.amount >= 10000;

      if (hmac === razorpay_signature) {
          // Signature is valid, process the order
          const orderData = {
              userId,
              cartId: cart._id,
              products: cart.products.map(product => ({
                  productId: product.productId._id,
                  size: product.size,
                  quantity: product.quantity,
                  productPrice: product.productId.price,
              })),
              address: {
                  name: address.name,
                  street: address.street,
                  country: address.country,
                  city: address.city,
                  state: address.state,
                  pincode: address.pincode,
                  mobile: address.mobile.toString(),
                  email: '',
              },
              payableAmount: data.amount,
              freeShipping: freeShipping,
              paymentMethod: 'RazorPay',
              paymentStatus: 'Success',
          };

          const order = new Order(orderData);
          await order.save();

          // Update the product stock
          for (const product of cart.products) {
              const updateField = `stock.${product.size}`;
              await Product.findByIdAndUpdate(product.productId._id, {
                  $inc: { [updateField]: -product.quantity },
              });
          }

          // Clear the cart after the order is placed
          await Cart.findOneAndDelete({ userId });

          res.status(200).json({ success: true, message: 'Payment verified and order placed successfully', order });
      } else {
          res.status(400).json({ success: false, message: 'Payment verification failed' });
      }
  } catch (error) {
      console.error('Error during payment verification:', error);
      res.status(500).json({ success: false, message: 'Failed to verify payment' });
  }
};
  
const orderStatus = async (req, res) => {
    const { orderId, productId, newStatus } = req.body;

    try {
        const order = await Order.findOneAndUpdate(
            { _id: orderId, "products._id": productId },
            { $set: { "products.$.status": newStatus } },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: "Order or Product not found." });
        }

        res.json({ success: true, message: "Product status updated successfully." });
    } catch (error) {
        console.error("Error updating product status:", error);
        res.status(500).json({ success: false, message: "Internal Server Error." });
    }
};

module.exports = {
    cancelOrder,
    placeOrderCOD,
    loadCheckout,
    placeOrderRazorPay,
    verifyPayment,
    orderStatus
} 