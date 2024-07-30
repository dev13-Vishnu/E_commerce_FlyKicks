const loadOrdersList = async (req,res) => {
    try {
        res.render('admin/orderList');
    } catch (error) {
        console.log('Error from ordersListController.loadOrdersList',error);
    }
}

module.exports ={
    loadOrdersList
}