const Offer = require('../models/offerModel')

const loadOfferPage = async (req, res) => {
    try {
        res.render('admin/offer',{
            currentUrl: req.url,
        })
    } catch (error) {
        
    }
}

module.exports = {
    loadOfferPage
}