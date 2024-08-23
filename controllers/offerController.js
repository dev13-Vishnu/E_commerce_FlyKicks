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

module.exports = {
    loadOfferPage,
    loadAddCategoryOfferPage,
    loadAddProductOfferPage
}