const Order = require('../models/orderModel.js');
const Product = require('../models/orderModel.js');

const loadOrdersList = async (req,res) => {
    try {
        const orders = await Order.find().populate('userId').populate('products.productId');

        // console.log('ordersListController.loadOrdersList:',orders)
        res.render('admin/orderList',{currentUrl:req.url,
            orders
        });
    } catch (error) {
        console.log('Error from ordersListController.loadOrdersList',error);
    }
}

const loadOrderDetails = async(req,res) => {
    try {
        const orderId = req.query.orderObjectId;
        console.log('ordersListController.loadOrderDetaisl orderId:',orderId);


        const order = await Order.findById(orderId).populate('products.productId');

        console.log('ordersListController.loadOrderDetaisl order:',order);

         
        res.render('admin/orderDetailsPage',{
            currentUrl:req.url,
            order
        })
    } catch (error) {
        console.log('Error from the orderListController.loadOrderDetails',error);
    }
}

const cancelOrder = async (req, res) => {
    const { orderId } = req.body;

    try {
        const order = await Order.findById(orderId).populate('products.productId');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Update the order status to 'Cancelled' and update the product stock
        for (let product of order.products) {
            if (product.status === 'Pending') { // Check if the product status is 'Pending'
                product.status = 'Cancelled'; // Set the product status to 'Cancelled'

                const productDoc = product.productId;
                if (productDoc) {
                    if (productDoc.stock[product.size] !== undefined) {
                        productDoc.stock[product.size] += product.quantity;
                    } else {
                        productDoc.stock[product.size] = product.quantity;
                    }
                    await productDoc.save();
                } else {
                    console.error(`Product not found for ID: ${product.productId}`);
                }
            }
        }

        await order.save();

        res.json({ success: true, message: 'Order cancelled successfully' });
    } catch (err) {
        console.error(`Error: ${err.message}`);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
};


module.exports ={
    loadOrdersList,
    loadOrderDetails,
    cancelOrder

}