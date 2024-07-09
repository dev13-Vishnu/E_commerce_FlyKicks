const fs = require('fs');
const path = require('path');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const multer= require('multer');
const mongoose = require('mongoose');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Ensure this directory exists
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage }).array('images', 4); // Accept up to 4 files

// Controller function to handle the form submission
const addproduct = async (req, res) => {
    try {

        const categoryData = await Category.find({})
        upload(req, res, async (err) => {
            if (err) {
                return res.status(500).send(err.message);
            }


            const { product_name, description, product_Aprice, product_Pprice, product_category,stock } = req.body;
            const imageFiles = req.files;

            console.log('stock data',stock);
        if (!imageFiles || imageFiles.length === 0) {
                return res.status(400).send('No files uploaded.');
            }

            const images = imageFiles.map(file => file.path); // Store the file paths in the images array

            const newProduct = new Product({
                name : product_name,
                description:description,
                image: images,
                price:product_Aprice,
                promo_price:product_Pprice,
                category: new mongoose.Types.ObjectId(product_category),
                stock: {
                    7: Number(stock[7]) || 0,
                    8: Number(stock[8]) || 0,
                    9: Number(stock[9]) || 0,
                    10: Number(stock[10]) || 0,
                    11: Number(stock[11]) || 0,
                    12: Number(stock[12]) || 0
                } // Use 'new' with ObjectId
            });

            console.log('new product:',newProduct);
            await newProduct.save();
            console.log('new product added');

            res.render('admin/addproduct',{Smessage:'Products added Successfully!',data:categoryData,currentUrl:req.url});
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
}; 


const loadaddProduct = async(req,res)=>{
    try {
        const categoryData = await Category.find({})
        res.render('admin/addproduct',{data: categoryData,currentUrl:req.url});
    } catch (error) {
        console.error('error product controller load add product',error);
        res.status(500).send('internal server error');
    }
}

const loadProducts = async(req,res)=>{
    try {
        res.render('admin/products')
    } catch (error) {
        
    }
}

module.exports = {
    loadaddProduct,
    addproduct,
    loadProducts
}