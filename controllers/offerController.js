const { off } = require('pdfkit')
const Offers = require('../models/offerModel')
const Product = require('../models/productModel');

const loadOfferPage = async (req, res) => {
    try {

        const products = await Product.find({});

        const offers = await Offers.find({});
        res.render('admin/offer',{
            currentUrl: req.url,
            offers,
            products
        })
    } catch (error) {
        
    }
}


const loadAddCategoryOfferPage = async (req,res) => {
    try {
        res.render('admin/addCategoryOffer',{
            currentUrl:req.url,
        })
    } catch (error) {
        
    }
}
const loadAddProductOfferPage = async (req,res) => {
    try {
        res.render('admin/addProductOffer',{
            currentUrl:req.url,
        })
    } catch (error) {
        
    }
}

const addProductOffer = async (req, res, next) => {
    try {
        const {offer_name, offer_description, offer_percentage, offer_type} = req.body;
        const newOffer = new Offers({
            offerName : offer_name,
            offerDescription : offer_description,
            discount : offer_percentage,
            offerType: offer_type,
            isActive: false
        });
        await newOffer.save();

        res.redirect('/admin/offers');

        }catch (error) {
        next(error)
    }
    } 


    const loadProductModal = async (req, res) => {
        try {
            const products = await Product.find({ delete: false }).select('name image price promo_price');
            res.json(products);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch products' });
        }
    }

    const applyOfferToProduct = async (req,res) => {
        const { productId, offerId } = req.body;
        try {
            const product = await Product.findById(productId);
            const offer = await Offer.findById(offerId);
    
            if (!product || !offer) {
                return res.status(404).json({ message: 'Product or Offer not found' });
            }
    
            product.offer = offerId;
            await product.save();
    
            res.json({ message: 'Offer applied successfully' });
            
        } catch (error) {
            
        res.status(500).json({ message: 'Failed to apply offer', error });
        }
    }

    const removeOfferFromProduct  = async (req, res) => {
        const { productId } = req.body;
        try {
            const product = await Product.findById(productId);
    
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
    
            product.offer = null;
            await product.save();
    
            res.json({ message: 'Offer removed successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to remove offer', error });
        }
    };

module.exports = {
    loadOfferPage,
    loadAddCategoryOfferPage,
    loadAddProductOfferPage,
    addProductOffer,
    loadProductModal,
    applyOfferToProduct,
    removeOfferFromProduct 
}