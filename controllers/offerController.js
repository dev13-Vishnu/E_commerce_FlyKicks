const { off } = require('pdfkit')
const Offers = require('../models/offerModel')
const Product = require('../models/productModel');

const loadOfferPage = async (req, res) => {
    try {

        const offers = await Offers.find({});
        res.render('admin/offer',{
            currentUrl: req.url,
            offers
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
            const products = await Product.find({}).select('name imageUrl'); // Adjust the query as necessary
            res.json({ products });
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({ error: 'Failed to fetch products' });
        }
    }

module.exports = {
    loadOfferPage,
    loadAddCategoryOfferPage,
    loadAddProductOfferPage,
    addProductOffer,
    loadProductModal
}