const fs = require('fs');
const path = require('path');

const loadaddProduct = async(req,res)=>{
    try {
        res.render('admin/addproduct');
    } catch (error) {
        console.error('error product controller load add product',error);
        res.status(500).send('internal server error');
    }
}

module.exports = {
    loadaddProduct
}