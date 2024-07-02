const category = require('../models/categoryModel');


const loadCategory = async(req,res) =>{
    try {

        const searchQuery = req.query.search;
        let categoryData;

        if (searchQuery) {
            categoryData = await category.find({name:{$regex:searchQuery,$option:"i"}});
        } else {
            categoryData = await category.find({})
        }
        res.render('admin/categories',{data:categoryData});
    } catch (error) {
        console.log('error from category controller load category',error);
    }
}

const addCategory = async (req,res) =>{
    try {
        const categoryName = req.body.category_name
        const categorySlug = req.body.category_slug
        const categoryAction = req.body.category_action
        const categoryDescription =req.body.category_description

        const categoryData = await category.find({});

        const uniqCategory = await category.findOne({name:{$regex:categoryName,$option:"i"}});
        if(uniqCategory){
            res.render('admin/category');
        }else{
            const categoryInfo = await categoryData. save();
            if (categoryInfo) {
                res.redirect('/admin/category');
                console.log('saved category in mongo db');
            } else {
                res.render('admin/category');
                
            }
        }
    } catch (error) {
        console.log('error from category controller add category', error);
    }
}

const loadEditCategory = async(req,res)=>{
    try {
        const id = req.query.id;
        const categoryData = await category.findOne({_id:id});
        console.log(categoryData);
        if (categoryData) {
            res.render('admin/editcategory')
        } else {
            console.log('not category')
        }
    } catch (error) {
        console.log('error from category control load edit user',error);
    }
}

module.exports = {
    loadCategory,
    addCategory

}