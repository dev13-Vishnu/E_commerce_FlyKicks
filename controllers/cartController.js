const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Address = require('../models/addressModel');



const addToCart = async (req, res) => {
  const { productId, size, quantity } = req.body;
  const userId = req.session.user._id;

  if (!productId || !size) {
      return res.status(400).send('Product ID and size are required.');
  }

  try {
      const product = await Product.findById(productId);

      if (!product) {
          return res.status(404).send('Product or size not found.');
      }

      const productTotalPrice = product.promo_price * quantity;

      const cart = await Cart.findOne({ userId });

      if (cart) {
          const existingProductIndex = cart.products.findIndex(
              (p) => p.productId.toString() === productId.toString() && p.size.toString() === size.toString()
          );

          if (existingProductIndex !== -1) {
              cart.products[existingProductIndex].quantity += parseInt(quantity);
              cart.products[existingProductIndex].total_price += productTotalPrice;
          } else {
              cart.products.push({
                  productId: product._id,
                  size,
                  quantity,
                  total_price: productTotalPrice
              });
          }

          const newTotal = cart.products.reduce((sum, product) => sum + product.total_price, 0);
          cart.total = newTotal;

          await cart.save();
      } else {
          await Cart.create({
              userId,
              products: [
                  {
                      productId: product._id,
                      size,
                      quantity,
                      total_price: productTotalPrice,
                  },
              ],
              total: productTotalPrice,
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
      const userId = req.session.user._id;
      const userData = await User.findById(userId);
  
      const cart = await Cart.findOne({userId}).populate('products.productId');
      // console.log('cartController loadCart cart:',cart);
      res.render('user/cart',{
        userData,
        cart,
        searchQuery,
        sortQuery
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

  const updateQuantity = async(req,res) =>{
    const {productId, size, newQuantity} = req.body;

    console.log('cartControllre. updateQuantity:',productId, size, newQuantity);
    const userId = req.session.user._id;

  console.log('cartController.updateQuantity userId',userId);
    try {
      const cart = await Cart.findOne({userId});
      console.log('cartController.updateQuantity cart:',cart);


      if(!cart){
        return res.status(400).json({message:'Cart not found'});
      }

      //find the product in the cart
      const product  = cart.products.find(p => p.productId.toString() === productId && p.size === size);
      
      if(!product) {
        return res.status(400).json({message:'Product not found in cart'});
      }

      console.log('cartControll updateQuantity product:',product)

      //Update the quantity and total price
      product.quantity = newQuantity;
      product.total_price = newQuantity * (await Product.findById(productId)).price;

      //Update the cart total
      cart.total = cart.products.reduce((acc,p) => + p.total_price, 0);

      //save the cart
      await cart.save();

      //Respond with success
      res.status(200).json({message:'Server Error'});
    } catch (error) {
      
    }
  }
  
  module.exports = {
    
  addToCart,
  loadCart,
  removeItemsFromCart,
  loadOrderConfirmation,
  updateQuantity
  }