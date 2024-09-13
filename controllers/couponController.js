const Coupon = require('../models/couponModel');
const Cart = require('../models/cartModel');

const loadCouponsPage = async (req, res) => {
    try {
        const itemsPerPage = 2;  // Number of coupons per page
        const page = req.query.page ? parseInt(req.query.page) : 1;  // Get the page number from the query parameter, default to 1
        const totalCoupons = await Coupon.countDocuments();  // Get the total number of coupons

        // Fetch only the coupons needed for the current page
        const couponData = await Coupon.find()
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage);

        const totalPages = Math.ceil(totalCoupons / itemsPerPage);  // Calculate the total number of pages

        if (couponData) {
            res.render('admin/couponPage', {
                couponData,
                currentUrl: req.url,
                currentPage: page,
                totalPages: totalPages
            });
        } else {
            console.log('couponController loadCouponPage: no coupons to find');
        }
    } catch (error) {
        console.log('Error from couponController', error);
    }
};


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

const applyCoupon = async (req, res) => {
    try {
        console.log('anything');
        const userId = req.session.user._id;

        const cart = await Cart.findOne({userId}).populate('products.productId');
        
        if (!cart) {
            return res.json({ success: false, message: 'Cart not found for the user' });
        }

        // Extract the total amount from the cart
        const totalPrice = cart.total;

        

        const  {couponCode,totalAmount}  = req.body;

        console.log(req.body);
        // Find the coupon in the database
        const coupon = await Coupon.findOne({ coupon_code: couponCode, isBlocked: false });

        if (!coupon) {
            return res.json({ success: false, message: 'Coupon not found or blocked' });
        }

        // Ensure the coupon is valid
        const now = new Date();
        if (now < coupon.start_date || now > coupon.ending_date) {
            return res.json({ success: false, message: 'Coupon is expired or not yet valid.' });
        }


        // Check minimum and maximum order amount
        if (totalPrice < coupon.minimum_order_amount || totalPrice > coupon.maximum_order_amount) {
            console.log(totalPrice,coupon.maximum_order_amount);
            
            return res.json({ success: false, message: 'Your order does not meet the coupon requirements.' });
        }

        // Apply the coupon
    const discountAmount = (coupon.offer_percentage / 100) * totalPrice;
        const newTotal = totalPrice - discountAmount;

        let actualTotalPrice = 0;
        cart.products.forEach(product => {
            actualTotalPrice += product.productId.price *product.quantity;
        });
        // console.log('couponController applycoupon actualTotalPrice:',actualTotalPrice);
        const totalDiscount = actualTotalPrice - newTotal;


        //save coupon Id in session
        req.session.appliedCouponId = coupon._id;
        return res.status(200).json({ success: true, newTotal, totalDiscount});
    } catch (error) {
        console.error('Error applying coupon:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while applying the coupon' });
    }
}

const removeCoupon  = async (req,res) => {
    try {

        console.log('remove coupon')

        const userId = req.session.user._id;

        const cart = await Cart.findOne({userId}).populate('products.productId');
        
        if (!cart) {
            return res.json({ success: false, message: 'Cart not found for the user' });
        }

        // Extract the total amount from the cart
        const totalPrice = cart.total;

        let actualTotalPrice = 0;
        cart.products.forEach(product => {
            actualTotalPrice += product.productId.price *product.quantity;
        });
        // console.log('couponController applycoupon actualTotalPrice:',actualTotalPrice);
        const totalDiscount = actualTotalPrice - cart.total;
        
        //Remove couponId from session
        req.session.appliedCouponId = null;

        return res.json({success:true, totalPrice, totalDiscount});
    } catch (error) {
        console.error('Error removing coupon:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while removing the coupon' });
    }
}

module.exports = {
    loadCouponsPage,
    loadAddcouponPage,
    addCoupon,
    blockAndUnblockCoupon,
    loadEditCoupon,
    editCoupon,
    applyCoupon,
    removeCoupon
} 