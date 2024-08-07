const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Whishlist = require('../models/whishlistModel');

const loadWishlist = async (req,res) => {
    try {
        const sortQuery = req.query.sort;
        const searchQuery = req.query.q;
        const userId = req.session.user._id;
        const userData = await User.findById(userId);
  
        res.render('user/wishlist',{
            userData,
            searchQuery,
            sortQuery
        });
    } catch (error) {
        console.log('Error from wishlist contorller loadWishlist',error);
    }
}

const addToWishlist = async(req,res) => {
    try {
        console.log('add to wishlist Contorller');
        console.log('wishlistcontreller addtoWishlist req.query.productId',req.query.productId);
        res.send('added to wishlist')
    } catch (error) {
        console.log('Error from WishlistController addToWishlist',error);
    }
}

module.exports = {
    loadWishlist,
    addToWishlist
}