const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Address = require('../models/addressModel');
const Wishlist = require('../models/wishlistModel');



const addToCart = async (req, res) => {
  const { productId, size, quantity, price } = req.body; // Get price from request body
  const userId = req.session.user._id;

  console.log('cartController addToCart req.body:', req.body);
  console.log('cartController addToCart price:', price);

  if (!productId || !size || !price) {
    return res.status(400).send('Product ID, size, and price are required.');
  }

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send('Product not found.');
    }

    // Check if the selected size has sufficient stock
    const availableStock = product.stock[size];
    if (!availableStock) {
      return res.status(400).send('Selected size is not available.');
    }

    // Ensure that the maximum allowed quantity is not exceeded
    const MAX_QUANTITY = 10;
    const requestedQuantity = parseInt(quantity);

    const cart = await Cart.findOne({ userId });

    if (cart) {
      const existingProductIndex = cart.products.findIndex(
        (p) => p.productId.toString() === productId.toString() && p.size.toString() === size.toString()
      );

      let totalCartQuantity = requestedQuantity;

      if (existingProductIndex !== -1) {
        // If the product already exists in the cart, sum the current cart quantity with the requested quantity
        totalCartQuantity += cart.products[existingProductIndex].quantity;
      }

      // Check if the total quantity exceeds the available stock or the maximum quantity allowed
      if (totalCartQuantity > availableStock) {
        return res.status(400).send(`Cannot add more than ${availableStock} of size ${size} to the cart.`);
      }
      
      if (totalCartQuantity > MAX_QUANTITY) {
        return res.status(400).send(`Cannot add more than ${MAX_QUANTITY} of a single product to the cart.`);
      }

      if (existingProductIndex !== -1) {
        cart.products[existingProductIndex].quantity += requestedQuantity;
        cart.products[existingProductIndex].total_price += price * requestedQuantity;
      } else {
        cart.products.push({
          productId: product._id,
          size,
          quantity: requestedQuantity,
          product_price: price,
          total_price: price * requestedQuantity,
        });
      }

      const newTotal = cart.products.reduce((sum, product) => sum + product.total_price, 0);
      cart.total = newTotal;

      await cart.save();
    } else {
      // Create a new cart if it doesn't exist
      if (requestedQuantity > availableStock) {
        return res.status(400).send(`Cannot add more than ${availableStock} of size ${size} to the cart.`);
      }
      
      if (requestedQuantity > MAX_QUANTITY) {
        return res.status(400).send(`Cannot add more than ${MAX_QUANTITY} of a single product to the cart.`);
      }

      await Cart.create({
        userId,
        products: [
          {
            productId: product._id,
            size,
            quantity: requestedQuantity,
            product_price: price,
            total_price: price * requestedQuantity,
          },
        ],
        total: price * requestedQuantity,
      });
    }

    res.status(200).send('Product added to Cart.');
  } catch (error) {
    console.log('Error from cartController.addToCart:', error);
    res.status(500).send('Server error.');
  }
};

  
  const loadCart = async (req,res) =>{
  
    try {
      const searchQuery = req.query.q;
      const sortQuery = req.query.sort;
      const categoryQuery = req.query.category || '';
      const userId = req.session.user._id;
      const userData = await User.findById(userId);
  
      const wishlist = await Wishlist.findOne({userId:userId});

      const cart = await Cart.findOne({userId}).populate('products.productId');
      // console.log('cartController loadCart cart:',cart);
      res.render('user/cart',{
        userData,
        cart,
        wishlist,
        searchQuery,
        sortQuery,
        categoryQuery
      });
    } catch (error) {
      console.log('Error from cartController.loadCart',error);
  
    }
  }
  
  const removeItemsFromCart = async(req,res) =>{
    try {
       const {productId ,size, productPrice} = req.body;
       const userId = req.session.user._id;
  
       let cart = await Cart.findOne ({userId});
  
       if(!cart) {
        return  res. status(400).json({success: false,message: 'Cart not found'});
  
       }
  
       const productIndex = cart.products.findIndex(p => p.productId.toString() === productId && p.size === size);
      //  console.log(productIndex)
        // console.log('userControler.removeItemsfromCart cart.product.[productIndex]',cart.products[productIndex]);
        if(productIndex > -1) {
            cart.products.splice(productIndex,1);
          
          cart.total = cart.products.reduce((acc, product) => acc + product.total_price,0);
          await cart.save();
  
          return res.status(200).json({success:true , message:'Product quantity updated',cart});
        }else{
          return res.status(400).json({ success:false, message:'Product not found in cart'});
        }
  
    } catch (error) {
      console.log('Error from cartController.removeItemsFromCart:',error);
      res.status(500).json({ success: false, message: 'Failed to update cart'});
    }
  };

  
  const loadOrderConfirmation = async (req,res) => {
    try {
      res.send('order confirmation page');
    } catch (error) {
      console.log('Error from cartCoroller.loadOrderConfirmation:',error);
    }
  }

  const updateQuantity = async(req, res) => {
    const { productId, size, newQuantity } = req.body;
    const userId = req.session.user._id;

    try {
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(400).json({ message: 'Cart not found' });
        }

        // Find the product in the cart
        const product = cart.products.find(p => p.productId.toString() === productId && p.size === size);

        if (!product) {
            return res.status(400).json({ message: 'Product not found in cart' });
        }

        // Update the quantity and total price based on `product_price` (which could be an offer price)
        product.quantity = newQuantity;
        product.total_price = newQuantity * product.product_price;  // Use `product_price` from cart

        // Update the cart total
        cart.total = cart.products.reduce((acc, p) => acc + p.total_price, 0);

        // Save the cart
        await cart.save();

        // Respond with success
        res.status(200).json({ message: 'Quantity updated successfully', cart });
    } catch (error) {
        console.log('Error from cartController.updateQuantity:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

  
  module.exports = {
    
  addToCart,
  loadCart,
  removeItemsFromCart,
  loadOrderConfirmation,
  updateQuantity
  }