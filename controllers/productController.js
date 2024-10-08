const fs = require('fs');
const path = require('path');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');
const upload = require('../helpers/multer')


// Controller function to handle the form submission


const addProduct = async (req, res) => {
    try {
        const categoryData = await Category.find({});

        upload(req, res, async (err) => {
            if (err) {
                console.error('Upload error:', err);
                return res.status(500).send(err.message);
            }

            const { product_name, description, product_Aprice, product_Pprice, product_category, stock } = req.body;

            // Validate file uploads
            if (!req.files || req.files.length === 0) {
                return res.status(400).send('No files uploaded.');
            }

            // Extract file URLs
            const imageUrls = req.files.map(file => path.join('uploads', path.basename(file.path)).replace(/\\/g, '/'));
            console.log('Image URLs:', imageUrls);

            const newProduct = new Product({
                name: product_name,
                description: description,
                image: imageUrls, // Use the array of cropped images
                price: product_Aprice,
                promo_price: product_Pprice,
                category: new mongoose.Types.ObjectId(product_category),
                stock: {
                    7: Number(stock[7]) || 0,
                    8: Number(stock[8]) || 0,
                    9: Number(stock[9]) || 0,
                    10: Number(stock[10]) || 0,
                    11: Number(stock[11]) || 0,
                    12: Number(stock[12]) || 0
                }
            });

            await newProduct.save();
            console.log('New product added');

            res.render('admin/addproduct', {
                Smessage: 'Product added successfully!',
                data: categoryData,
                currentUrl: req.url
            });
        });
    } catch (error) {
        console.error('Error adding product:', error);
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

        const limit = 6;


        const products = await Product.find({})
        .limit(limit * 1)
        .skip((page -1) * limit)
        .exec();

        const count = await Product.find({})
        .countDocuments();

        products.forEach(product => {
            product.image = product.image.map(img => img.replace(/\\/g, '/'));
        });
        // console.log('products url', req.url)
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
        const productId = req.query.productId;


        // console.log('loadEditProduct req.query:',req.query);
        // console.log('loadEditProduct req.query.id:',id);
        // console.log('loadEditProduct req.query.id:',id);
        const categoryData = await Category.find({});
        let productData = await Product.findOne({_id:productId});

        productData.image = productData.image.map(img => img.replace(/\\/g, '/'));

        productData = productData.toObject();
        res.render('admin/editProduct', {
            currentUrl: req.url,
            categoryData,
            productData
        });
    } catch (error) {
        console.log('error from productController.loadEditProduct', error);
    }
};

const deleteProduct = async (req, res) => {
    try {
        const saved = await Product.findByIdAndUpdate(
            { _id: req.query.productId },
            { $set: { delete: true } },
            { new: true }
        );

        if (saved) {
            res.status(200).json({ success: true, message: 'Product deleted successfully' });
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
};

const pushToUserSide = async (req, res) => {
    try {
        const saved = await Product.findByIdAndUpdate(
            { _id: req.query.productId },
            { $set: { delete: false } },
            { new: true }
        );

        if (saved) {
            res.status(200).json({ success: true, message: 'Product added successfully' });
        }
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ success: false, message: 'Failed to add product' });
    }
};


const removeImage = async (req, res) => {
    try {
        console.log('remove image req.body:', req.query);

        const { productId, index } = req.query;

        const product = await Product.findOne({ _id: productId });
        if (product) {
            product.image.splice(index, 1);
            await product.save();
            res.status(200).json({ message: 'Image removed successfully' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.log('error from product controller remove image', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
const editProduct = async (req, res) => {
    try {
        const productId = req.query.productId;

        // Process images with multer
        upload(req, res, async (err) => {
            if (err) {
                return res.status(500).json({ message: err.message });
            }

            const { product_name, description, product_Aprice, product_Pprice, product_category, stock } = req.body;
            const imageFiles = req.files;
            let images = [];
            console.log('productController editProduct req.body:',req.body);

            if (imageFiles && imageFiles.length > 0) {
                images = imageFiles.map(file => path.join('uploads', path.basename(file.path)).replace(/\\/g, '/'));
            }

            const productData = await Product.findOne({ _id: productId });

            console.log('productController editProduct productData:',productData);
            if (!productData) {
                return res.status(404).json({ message: 'Product not found' });
            }

            // Merge existing images with new images
            if (images.length > 0) {
                productData.image = [...productData.image, ...images];
            }

            productData.name = product_name;
            productData.description = description;
            productData.price = product_Aprice;
            productData.promo_price = product_Pprice;
            productData.category = new mongoose.Types.ObjectId(product_category);
            productData.stock = stock;

            await productData.save();

            return res.status(200).json({ message: 'Product updated successfully' });
        });
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred', error: error.message });
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