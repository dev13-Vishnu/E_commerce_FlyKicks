const fs = require('fs');
const path = require('path');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');
const upload = require('../helpers/multer')


// Controller function to handle the form submission
const addProduct = async (req, res) => {
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

        //pagination
        var page = 1;
        if(req.query.page){
          page = parseInt(req.query.page,10);
        }

        const limit = 5;


        const products = await Product.find({})
        .limit(limit * 1)
        .skip((page -1) * limit)
        .exec();

        const count = await Product.find({})
        .countDocuments();

        products.forEach(product => {
            product.image = product.image.map(img => img.replace(/\\/g, '/'));
        });
        console.log('products url', req.url)
      res.render('admin/products',{products,
        totalPages:Math.ceil(count/limit),
        currentPage: page,
        currentUrl:req.url,
        currentUrlPage:req.query.page
    });
        
    } catch (error) {
        console.log("error from userController.loadHome",error);
    }
}

const loadEditProduct = async (req, res) => {
    try {
        const id = req.query.productId;
        const categoryData = await Category.find({});
        const productData = await Product.findById(id);

        productData.image = productData.image.map(img => img.replace(/\\/g, '/'));

        res.render('admin/editProduct', {
            currentUrl: req.url,
            categoryData,
            productData
        });
    } catch (error) {
        console.log('error from productController.loadEditProduct', error);
    }
};


const deleteProduct = async (req,res)=>{
    try {
        console.log(req.query.id);
        const saved = await Product.findByIdAndUpdate(
            { _id: req.query.id },
            { $set: { delete: true } },
            { new: true }
          )      // user.isBlocked = true;
        // const saved = await user.save();
        // console.log(saved); 
        console.log(saved);
        if(saved){
            res.redirect('/admin/products')
        }
    } catch (error) {
        console.log('error from productController.deleteProduct',error);
    }
}

const pushToUserSide = async(req,res)=>{
    try {
        console.log(req.query.id);
        const saved = await Product.findByIdAndUpdate(
            { _id: req.query.id },
            { $set: { delete: false } },
            { new: true }
          )      // user.isBlocked = true;
        // const saved = await user.save();
        // console.log(saved); 
        console.log(saved);
        if(saved){
            res.redirect('/admin/products')
        }
    } catch (error) {
        console.log('error from productController.addProduct',error);
    }
}

const removeImage = async(req,res) =>{
    try {

        console.log('remove image req.body:',req.query);

        const {productId,index} = req.query;
        
        const product = await Product.findOne({_id:productId});
        if(product){
            product.image.splice(index,1);
            await product.save();
            res.redirect(`/admin/product/edit?id=${productId}`);
        }else{
            res.status(404).send('Product not found');
        }
    } catch (error) {
        console.log('error from product controller remove image',error);
    }
}

const editProduct = async (req,res)  =>{try {
    const productId = req.query.productId;

    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).send(err.message);
        }

        const { product_name, description, product_Aprice, product_Pprice, product_category, stock } = req.body;
        const imageFiles = req.files;
        let images = [];

        if (imageFiles && imageFiles.length > 0) {
            images = imageFiles.map(file => file.path); // Store the file paths in the images array
        }

        const productData = await Product.findById(productId);
        const categoryData = await Category.findById(   );

        if (!productData) {
            return res.status(404).send('Product not found');
        }
        productData.image = productData.image.map(img => img.replace(/\\/g,'/'));


        // Merge existing images with new images
        if (images.length > 0) {
            productData.image = [...productData.image, ...images];
        }

        productData.name = product_name;
        productData.description = description;
        productData.price = product_Aprice;
        productData.promo_price = product_Pprice;
        productData.category = new mongoose.Types.ObjectId(product_category);
        productData.stock = {
            7: Number(stock[7]) || 0,
            8: Number(stock[8]) || 0,
            9: Number(stock[9]) || 0,
            10: Number(stock[10]) || 0,
            11: Number(stock[11]) || 0,
            12: Number(stock[12]) || 0
        };

        await productData.save();

        res.render('admin/editProduct',{
            currentUrl:req.url,
            categoryData,
            productData

        });
    });
} catch (error) {
    res.status(500).send(error.message);
}
};


module.exports = {
    loadaddProduct,
    addProduct,
    loadProducts,
    loadEditProduct,
    deleteProduct,
    pushToUserSide,
    removeImage,
    editProduct
}