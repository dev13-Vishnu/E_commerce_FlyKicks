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
        res.render('admin/addcoupons')
    } catch (error) {
        
    }
}

module.exports = {
    loadCouponsPage,
    loadAddcouponPage
} 