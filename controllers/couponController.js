const Coupon = require('../models/couponModel');

const loadCouponsPage = async(req,res) =>{
    try {
        res.render('admin/couponPage',{
            currentUrl:req.url
        });
    } catch (error) {
        console.log('Error from couponController',error);
    }
}

const loadAddcouponPage = async(req,res) => {
    try {
        res.render('admin/addcoupons',{
            currentUrl: req.url
        }
        )
    } catch (error) {
        console.log('Error from the couponController loadAddCouponpage:',error);
    }
}

const addCoupon = async (req,res) => {
    try {
        const {couponCode,couponDescription,offerPercentage,couponCount,minimumOrderAmount,maximumOfferAmount,startDate,expireDate} = req.body;

        //checking if there is any existing coupon with the same coupon code
        const uniqueCoupon = await Coupon.findOne({coupon_code:{$regex:couponCode,$options:"i"}});

        if(uniqueCoupon) {
            res.render('admin/addCoupons',{message:"already Coupon available"});
            return;
        }

        const couponData = await Coupon.create({
            coupon_code: couponCode,
            coupon_description: couponDescription,
            offer_percentage: offerPercentage,
            coupon_count: couponCount,
            minimum_order_amount: minimumOrderAmount,
            maximum_order_amount: maximumOfferAmount,
            start_date: startDate,
            ending_date: expireDate,
            isBlocked:false

        })

        const couponSave = await couponData.save();

        if(couponSave) {
            console.log('saved');
            res.redirect ('/admin/coupons');

        }else{
            console.log('not saved');
        }

    } catch (error) {
        console.log('Error from coupon controller addcoupon',error);
    }
}

module.exports = {
    loadCouponsPage,
    loadAddcouponPage,
    addCoupon
} 