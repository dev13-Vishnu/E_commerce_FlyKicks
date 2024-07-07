const fs = require('fs');
const path = require('path');
const category = require('../models/categoryModel');
const product = require('../models/productModel');



const loadaddProduct = async(req,res)=>{
    try {
        const categoryData = await category.find({})
        res.render('admin/addproduct',{data: categoryData});
    } catch (error) {
        console.error('error product controller load add product',error);
        res.status(500).send('internal server error');
    }
}

module.exports = {
    loadaddProduct
}