const { off } = require('pdfkit')
const Offer = require('../models/offerModel')

const loadOfferPage = async (req, res) => {
    try {
        res.render('admin/offer',{
            currentUrl: req.url,
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
        const newOffer = new Offer({
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


module.exports = {
    loadOfferPage,
    loadAddCategoryOfferPage,
    loadAddProductOfferPage,
    addProductOffer
}