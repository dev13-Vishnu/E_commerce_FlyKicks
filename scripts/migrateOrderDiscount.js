const mongoose = require('mongoose');
const Order = require('../models/orderModel'); // Assuming you have the Order model in models/order
const Product = require('../models/productModel');
require('dotenv').config()

const migrateOrders = async () => {
    try {
      // Fetch all orders
      const orders = await Order.find();
  
      for (let order of orders) {
        let actualTotalPrice = 0;
  
        // Loop through the products in the order to calculate the actual total price
        for (let product of order.products) {
          const productData = await Product.findById(product.productId);
          if (productData) {
            actualTotalPrice += productData.price * product.quantity; // Use original price
          }
        }
  
        // Adjust the total price based on the shipping cost if freeShipping is false
        if (!order.freeShipping) {
          actualTotalPrice += 500; // Adding the shipping cost
        }
  
        // Calculate the discount
        const discountAmount = actualTotalPrice - order.payableAmount;
  
        // Update the order with the new discounts field
        await Order.findByIdAndUpdate(order._id, {
          $set: {
            discounts: discountAmount,
          },
        });
  
        console.log(`Order ${order._id} migrated successfully with discount: ${discountAmount}`);
      }
  
      console.log('Order migration completed.');
    } catch (error) {
      console.error('Error during order migration:', error);
    }
  };
  
  // Connect to your database and run the migration
  mongoose.connect('mongodb://localhost:27017/FLY_KICKS', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('Database connected. Starting migration...');
      migrateOrders();
    })
    .catch(err => {
      console.error('Database connection error:', err);
    });