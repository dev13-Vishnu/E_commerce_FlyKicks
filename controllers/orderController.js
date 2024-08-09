const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Address = require('../models/addressModel');
const User = require('../models/userModel');
const Razorpay = require('razorpay');

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

  const placeOrderCOD = async (req,res) =>{
    try {
      const userId = req.session.user._id;
      const {selectedAddress,payment_method,index}= req.body;

      
      // const user = User.findById(userId);
      const addressDoc = await Address.findOne({userId,'address._id':selectedAddress},{'address.$': 1});
      
      const address = addressDoc.address[0]
      console.log('cartControler place order address:',address)
      //Fetch the user's cart
      const cart = await Cart.findOne({userId}).populate('products.productId');
      if(!cart) {
        return res.status(404).send('Cart not found');

      }

      const orderData = {
        userId,
        address,
        products: cart.products.map(product => ({
          productId: product.productId._id,
          size: product.size,
          quantity: product.quantity,
          productPrice: product.total_price,
        })),
        totalPrice: cart.total + 50,
        payment_method,
        payment_status: 'Failed',
      };

      
      

      const order = new Order(orderData);
      await order.save();

      for(const product of cart.products) {
        const updateField = `stock.${product.size}`;
        await Product.findByIdAndUpdate(product.productId._id,{
          $inc:{[updateField]:-product.quantity},
        });
      }

      //clear the cart here
      await Cart.findOneAndDelete({userId});
      
      res.status(200).json({ success: true, message: 'Order placed successfully', order });


    } catch (error) {
      console.error('Error during checkout:', error);
      res.status(500).json({ success: false, message: 'Failed to place order' });
    }
  }

const placeOrderRazorPay = async (req,res) =>{

    
    const {selectedAddress, payment_method, total_amount} = req.body;
    
    const razorpayInstance = new Razorpay ({
    key_id: process.env.RAZORPAY_ID_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY
    });

    const amountInPaise = total_amount * 100;

    const options = {
        amount: amountInPaise,
        currency: "INR",
        receipt: "order_reptid_11"
    };
    try {
        const userId = req.session.user._id;
        const razorpayOrder = await razorpayInstance.orders.create(options);

        const addressDoc = await Address.findOne({userId,'address._id':selectedAddress},{'address.$':1});

        const address = addressDoc.address[0];
        console.log('cartController placeOrderRazorpay address:',address);

        const cart = await Cart.findOne({userId}).populate('products.productId');

        if(!cart) {
            return res.status(404).send('Cart not found');
        }
        //Create the order document and save it to the database

        const newOrder = new Order({
            userId,
            orderId: razorpayOrder.id,
            products: cart.products.map(product => ({
                productId: product.productId._id,
                size: product.quantity,
                productPrice:product.total_price,
            })),
            address,
            totalPrice: total_amount,
            payment_method,
            payment_status:'pending',

        }); 
        await newOrder.save();
        // await Cart.findOneAndDelete({userId});
        res.json({ success: true, paymentUrl:`http://checkout.razorpay.com/v1/checkout.js?order_id=${razorpayOrder.id}`});

    } catch (error) {
        
    }
  }

module.exports = {
    cancelOrder,
    placeOrderCOD,
    loadCheckout,
    placeOrderRazorPay
} 