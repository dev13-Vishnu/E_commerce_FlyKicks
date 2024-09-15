const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Wishlist = require('../models/wishlistModel');
const mongoose = require('mongoose')

const loadWishlist = async (req,res) => {
    try {
        const sortQuery = req.query.sort;
        const searchQuery = req.query.q;
        const categoryQuery = req.query.category || '';
        const userId = req.session.user._id;
        const userData = await User.findById(userId);
        const wishlist = await Wishlist.findOne({ userId }).populate('products.productId');
        const cart = await Cart.findOne({userId:userId});

        if(!wishlist){
            return res.render('user/wishlist',{
                cart,
                wishlist,
                userData,
                searchQuery,
                sortQuery,

            })
        }
  
        res.render('user/wishlist',{
            userData,
            searchQuery,
            sortQuery,
            categoryQuery,
            wishlist,
            cart
        });
    } catch (error) {
        console.log('Error from wishlist contorller loadWishlist',error);
    }
}

const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.session.user._id;
        console.log('wishlistController addToWishlist userId', userId);

        let wishlist = await Wishlist.findOne({ userId });
        console.log('wishlistController addToWishlist wishlist', wishlist);

        if (!wishlist) {
            wishlist = new Wishlist({ userId, products: [] });
        }

        // Check if the product already exists in the wishlist
        const productExists = wishlist.products.some(
            product => product.productId.toString() === productId
        );

        if (productExists) {
            res.status(409).send('Product already in wishlist');
        } else {
            wishlist.products.push({ productId: new mongoose.Types.ObjectId(productId) });
            await wishlist.save();
            res.status(200).send('Product added to wishlist');
        }
    } catch (error) {
        console.log('Error from WishlistController addToWishlist', error);
        res.status(500).send('Server error');
    }
};


const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const productId = req.body.productId;

        await Wishlist.updateOne(
            { userId },
            { $pull: { products: { productId } } }
        );

        res.status(200).json({ message: 'Item removed from wishlist' });
    } catch (error) {
        console.error('Error removing item from wishlist:', error);
        res.status(500).json({ message: 'Failed to remove item from wishlist' });
    }
};

module.exports = {
    loadWishlist,
    addToWishlist,
    removeFromWishlist
}