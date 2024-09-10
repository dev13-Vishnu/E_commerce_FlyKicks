const Cart = require('./models/cart');  // Adjust the path to your Cart model
const mongoose = require('mongoose');
require('dotenv').config()


async function updateCartProductPrice() {
  try {
    // Find all carts with missing `product_price` in their products array
    const carts = await Cart.find({ "products.product_price": { $exists: false } });

    for (const cart of carts) {
      // Update each cart's products array to include `product_price` if missing
      cart.products.forEach(product => {
        if (!product.product_price) {
          product.product_price = product.productId.total_price/quantity || 0; // Use the product's original price or 0
        }
      });
      await cart.save();  // Save the updated cart
    }
    console.log('Cart documents updated successfully!');
  } catch (error) {
    console.error('Error updating cart documents:', error);
  }
}

// Connect to your MongoDB instance and run the update script
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Database connected');
    updateCartProductPrice();
  })
  .catch(err => console.error('Database connection error:', err));
