const Order = require('../models/orderModel.js');

const loadOrdersList = async (req,res) => {
    try {
        const orders = await Order.find().populate('userId').populate('products.productId');

        console.log('ordersListController.loadOrdersList:',orders)
        res.render('admin/orderList',{currentUrl:req.url,
            orders
        });
    } catch (error) {
        console.log('Error from ordersListController.loadOrdersList',error);
    }
}

const loadOrderDetails = async(req,res) => {
    try {
        res.render('admin/orderDetailsPage',{
            currentUrl:req.url
        })
    } catch (error) {
        console.log('Error from the orderListController.loadOrderDetails',error);
    }
}

module.exports ={
    loadOrdersList,
    loadOrderDetails

}