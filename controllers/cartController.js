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
        // console.log ('cart controller add to cart Current cart products;',cart.products.map(p => ({
        //   productId : p.productId.toString(),
        //   size: p.size
          
        // })))
          const existingProductIndex = cart.products.findIndex(
              (p) => p.productId.toString() === productId.toString() && p.size.toString() === size.toString()
            
          );
          
          // console.log('cart controllerl addToCart Current cart products:', cart.products);

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

  const loadCheckout = async(req,res) =>{ 
    try {
      const searchQuery = req.query.q;
      const sortQuery = req.query.sort;

      const userId = req.session.user._id;
      const addressData = await Address.find({userId});
      const userData = await User.findById(userId);
      const cart = await Cart.findOne({userId}).populate('products.productId')

      
      console.log('cartControl.loadCheckout cart:',cart);
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
      await Cart.findOneAndDelete({userId});
      res.status(200).json({ success: true, message: 'Order placed successfully', order });


    } catch (error) {
      console.error('Error during checkout:', error);
      res.status(500).json({ success: false, message: 'Failed to place order' });
    }
  }

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
  loadCheckout,
  placeOrderCOD,
  loadOrderConfirmation,
  updateQuantity
  }