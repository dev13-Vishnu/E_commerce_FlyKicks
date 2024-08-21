const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Address = require('../models/addressModel');
const User = require('../models/userModel');
const Razorpay = require('razorpay');
const crypto = require('crypto')  
const mongoose = require('mongoose');



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
            product.status = 'Canceled';
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
              productPrice: product.productId.promo_price,
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

// payment method wallet
const placeOrderWallet = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const {selectedAddress, orderTotalAmount} = req.body;

        const userOrder = await Order.findOne({ userId });
        if (!userOrder) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Calculate wallet balance
    const walletBalance = await Order.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } }, // Filter orders by userId
        { $group: { _id: null, totalWallet: { $sum: "$wallet" } } }, // Sum the wallet field
        { $project: { _id: 0, totalWallet: 1 } } // Return only the totalWallet
      ]);
  
      console.log('userController loadAccount walletBalance:',walletBalance);
  
      // Handle case where no orders exist
      const totalWallet = walletBalance.length > 0 ? walletBalance[0].totalWallet : 0;

      if(totalWallet < orderTotalAmount) {
        return res.status(400).json({success: false, message: 'Insufficeint wallet balance'})
      }

      // Deduct the order amount from the wallet
      const newWalletValue = -orderTotalAmount; // Negative to reflect deduction
      
      console.log('orderControll placeOrderWallet newWalletValue:',newWalletValue);

        const addressDoc  = await Address.findOne ({userId, 'address._id':selectedAddress}, {'address.$': 1});

        const address = addressDoc.address[0];
        
        //Fetch the user's cart
        const cart = await  Cart.findOne({userId}).populate('products.productId'); 
        if(!cart) return res.status(404).json({success:false,message:'Cart not found'});

        //Determine if the order qualifies for free shipping
        const freeShipping = orderTotalAmount >= 10000;

        //Prepare the order date

        const orderData = {
            userId,
            cartId: cart._id,
            products: cart.products.map(product => ({
                productId: product.productId._id,
                size: product.size,
                quantity: product.quantity,
                productPrice: product.productId.promo_price,
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
            payableAmount:orderTotalAmount,
            freeShipping: freeShipping,
            paymentMethod: 'Wallet',
            paymentStatus: 'Success',
            wallet: newWalletValue,  // Initialize the wallet field with the deducted amount
        };

        // Save the order to the database
        const order = new Order(orderData);
        const savedOrder = await order.save();

        console.log('orderController placeOrderWallet savedOrder:',savedOrder);
        //Update the  prodduct stock
        for (const product of cart.products) {
            const updateField = `stock.${product.size}`;
            await Product.findByIdAndUpdate(product.productId._id,{
                $inc: {[updateField]: -product.quantity},
            });
        }
        //Clear the cart after the order is placed
        await Cart.findOneAndDelete({userId});
        res.status(200).json({ success: true, message:'Order placed successfully', order});

    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).json({ success: false, message: 'Failed to place order'});
    }
}

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
                  productPrice: product.productId.promo_price,
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

const loadUserOrderDetails = async (req,res) =>{
    try {
        
        const searchQuery = req.query.q;
        const sortQuery = req.query.sort;
        
        const userId = req.session.user._id;
        const userData = await User.findById(userId);
        const orderId = req.query.orderObjectId;
        console.log('ordersListController.loadOrderDetaisl orderId:',orderId);


        const order = await Order.findById(orderId).populate('products.productId');

        console.log('ordersListController.loadOrderDetaisl order:',order);

         
        res.render('user/userOrderDetailsPage',{
            userData,
            searchQuery,
            sortQuery,
            order
        })
    } catch (error) {
        console.log('Error from orderController loadUserOrderDetails:',error);
    }
}


const cancelIndividualProduct = async (req, res) => {
    const { orderId, productId } = req.body;

    try {
        const order = await Order.findById(orderId).populate('products.productId');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const productInOrder = order.products.find(p => p._id.toString() === productId);

        if (!productInOrder) {
            return res.status(404).json({ message: 'Product not found in the order' });
        }

        if (productInOrder.status === 'Cancelled') {
            return res.status(400).json({ message: 'Product is already canceled' });
        }

        // Find the product and check if it is deleted
        const product = await Product.findById(productInOrder.productId._id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if sizes object exists and is valid
        if (!product.stock || typeof product.stock !== 'object') {
            return res.status(400).json({ message: 'Product stock information is invalid' });
        }

        // Update the stock for the specific size
        const size = productInOrder.size;

        if (!product.stock[size]) {
            return res.status(400).json({ message: `Size '${size}' not found in product stock` });
        }

        product.stock[size] += productInOrder.quantity;
        await product.save();

        // Calculate cost reduction
        const productCost = productInOrder.quantity * product.promo_price;
        console.log('orderController cancelIndividualProduct productCost:',productCost);
        order.payableAmount -= productCost;

        
        // Add product cost to the wallet if payment status is 'Success'
        if (order.paymentStatus === 'Success') {
            order.wallet += productCost;    

            // Only add the shipping cost to the wallet if it hasn't been added yet
            if (!order.freeShipping && !order.shippingFeeAddedToWallet) {
                order.wallet += 500; 
                order.shippingFeeAddedToWallet = true; // Flag to indicate shipping fee has been added
            }
        }

        // Remove the product from the order
        // Update the product's status to "Cancelled"
        productInOrder.status = 'Cancelled';
         // Check if all products are canceled
         const allCanceled = order.products.every(p => p.status === 'Cancelled');

         if (allCanceled) {
             // Set payable amount to zero if all products are canceled
             order.payableAmount = 0;
         } else if (order.payableAmount < 10000 && order.freeShipping) {
             order.payableAmount += 500;
             order.freeShipping = false; // Assuming `freeShipping` is a field in your order schema
         }
 
         await order.save();

        return res.status(200).json({ message: 'Product canceled, stock updated, order adjusted, and shipping status updated successfully' });

    } catch (error) {
        console.log('Error from orderController cancelIndividualProduct:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const returnProduct = async (req,res)=> {

    const {orderId, productId, reason} = req.body;

    try {
        const order = await Order.findById(orderId).populate('products.productId');
        if(!order) {
            return res.status(404).json({message:'Order not found'})
        }

        const productInOrder = order.products.find(p=>p._id.toString() === productId);

        if(!productInOrder) {
            return res.status(404).json({message:'Product not found in the order'});
        }
        if(productInOrder.status === 'Returned'){
            return res.status(400).json({message:'Product is already returned'});
        }
        //Mark the product as returned and save the reason
        productInOrder.status = 'Return Pending';
        productInOrder.reason = reason;

        //Find the product and update stock for the returned product
        const product = await Product.findById(productInOrder.productId._id);

        if(!product) {
            return res.status(404).json({message:'Product not found'});
        }

        const size = productInOrder.size;

        if(!product.stock[size]) {
            return res.status(400).json({message:`Size '${size}' not found in product stock`});
        }
        
        product.stock[size] += productInOrder.quantity;
        await product.save();

        //Adjust the payable amount
        const productCost = productInOrder.quantity * product.promo_price;
        order.payableAmount -= productCost;

         // Add product cost to the wallet if payment status is 'Success'
         if (order.paymentStatus === 'Success') {
            order.wallet += productCost;

            // Only add the shipping cost to the wallet if it hasn't been added yet
            if (!order.freeShipping && !order.shippingFeeAddedToWallet) {
                order.wallet += 500;
                order.shippingFeeAddedToWallet = true; // Flag to indicate shipping fee has been added
            }
        }

        // If all products are returned , set payable amount
        const allReturned = order.products.every(p => p.status === 'Return Pending');

        if(allReturned) {
            order.payableAmount = 0;
        }else if(order.payableAmount < 10000 && order.freeShipping) {
            order.payableAmount += 500;
            order.freeShipping = false;
        }

        await order.save();

        return res.status(200).json({message:'Product returned successfully, stok updated, order adjusted , and reason saved'});

    } catch (error) {
        console.log('Error form orderController returnProduct:', error);
        res.status(500).json({message: 'Internal server error'});
    }

}


module.exports = {
    cancelOrder,
    placeOrderCOD,
    loadCheckout,
    placeOrderRazorPay,
    verifyPayment,
    orderStatus,
    loadUserOrderDetails,
    cancelIndividualProduct,
    returnProduct,
    placeOrderWallet
} 