const Coupon = require('../models/couponModel');

const loadCouponsPage = async(req,res) =>{
    try {
        const couponData = await  Coupon.find();
        if(couponData) {
        res.render('admin/couponPage',{
            couponData,
            currentUrl:req.url
        });
    }else{
        console.log('couponController loadCouponPage: no coupons to find');
    }
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

const addCoupon = async (req, res) => {
    try {
        const { coupon_code, coupon_description, offer_percentage, coupon_count, minimum_order_amount, maximum_order_amount, start_date, ending_date } = req.body;

        // Check if a coupon with the same code already exists
        const uniqueCoupon = await Coupon.findOne({ coupon_code: { $regex: coupon_code, $options: "i" } });

        if (uniqueCoupon) {
            return res.json({ success: false, message: "Coupon code already exists!" });
        }

        const couponData = new Coupon({
            coupon_code,
            coupon_description,
            offer_percentage,
            coupon_count,
            minimum_order_amount,
            maximum_order_amount,
            start_date,
            ending_date,
            isBlocked: false
        });

        const couponSave = await couponData.save();

        if (couponSave) {
            return res.json({ success: true, message: "Coupon created successfully!" });
        } else {
            return res.json({ success: false, message: "Failed to create coupon!" });
        }

    } catch (error) {
        console.log('Error from coupon controller addCoupon', error);
        return res.json({ success: false, message: "An error occurred while creating the coupon." });
    }
}


const blockAndUnblockCoupon = async (req,res) =>{
    try {
        console.log("blockandUnblockCoupon renderinggg");
        const couponId = req.params.id;
        const { isBlocked } = req.body;

        const updatedCoupon = await Coupon.findByIdAndUpdate(
            couponId,
            { isBlocked: isBlocked },
            { new: true }
        );
        if (updatedCoupon) {
            res.status(200).json({ success: true, coupon: updatedCoupon });
        } else {
            res.status(404).json({ success: false, message: 'Coupon not found' });
        }

        
    } catch (error) {
        
        console.log("error from coupon Controller blockandUnblockCoupon",error);
    }
}

const loadEditCoupon = async (req,res) => {
    try {
        const couponId= req.query.id;

        const couponData = await Coupon.findOne({_id:couponId});

        if (couponData) {
            res.render('admin/editCoupon',{
                couponData,
                currentUrl:req.url
            })
        } 
    } catch (error) {
        console.log('Error from coupon controller load Edit coupon ', error);
    }
}

const editCoupon = async (req,res)=> {
    try {
        const couponId = req.params.id;
        const updatedData = req.body;

        console.log ('couponController.editCoupon updateData',updatedData);

        // Find the coupon by ID and update it with the new data
        const updated = await Coupon.findByIdAndUpdate(couponId, updatedData);

        if(updated) {
            
        res.status(200).send({ message: 'Coupon updated successfully' });
        }else{
            res.status(400).send({message:'invalid data send in the request'});
        }
    } catch (error) {
        res.status(500).send({ message: 'Failed to update coupon', error });
    }
}

module.exports = {
    loadCouponsPage,
    loadAddcouponPage,
    addCoupon,
    blockAndUnblockCoupon,
    loadEditCoupon,
    editCoupon
} 