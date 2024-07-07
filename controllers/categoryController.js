const category = require('../models/categoryModel');
 

const loadCategory = async(req,res) =>{
    try {

        const searchQuery = req.query.search;
        let categoryData;

        if (searchQuery) {
            categoryData = await category.find({name:{$regex:searchQuery,$options:"i"}});
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

        const uniqCategory = await category.findOne({name:{$regex:categoryName,$options:"i"}});
        if(uniqCategory){
            res.render('admin/categories');
        }else{
            const categoryData = await category.create({
                name: categoryName,
                description:categoryDescription,
                action:categoryAction,
                slug:categorySlug,
                delete:false
        })
            const categoryInfo = await categoryData.save();
            if (categoryInfo) {
                res.redirect('/admin/categories');
                console.log('saved category in mongo db');
            } else {
                res.render('admin/categories');
                
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
        console.log('category data',categoryData);
        if (categoryData) {
            res.render('admin/editcategories',{edit:categoryData})
        } else {
            console.log('not category')
        }
    } catch (error) {
        console.log('error from category control load edit user',error);
    }
}

const editCategory= async(req,res)=>{
    try {
        const id = req.query.id;

        const categoryName = req.body.category_name;
        const categorySlug = req.body.category_slug;
        const categoryAction = req.body.category_action;
        const categoryDescription = req.body.category_description;

        const categoryData = await category.find({})

        console.log('edit category category data',categoryData);

        const uniqueCategory = await category.findOne({name:{$regex:categoryName,$options:"i"}})
        const target = await category.findOne({_id:id});
        if (uniqueCategory._id.toString() != target._id.toString()) {
            res.render('admin/categories',{message:'category already exists',data:categoryData})
        } else {
            const categoryEdit = await category.findByIdAndUpdate(id,{
            name:categoryName,
            description:categoryDescription,
            slug: categorySlug,
            action: categoryAction,
        },{new:true})

        if (categoryEdit) {
            res.redirect('/admin/categories');

        }else{
            res.render('admin/editcategories');
        }

        }

        
    } catch (error) {
        console.log('Error from editcategory',error);
    }
}

const deleteCategory = async(req,res) =>{
    try {
        const id= req.query.id;
        const deleteData = await category.findByIdAndUpdate(id,{
            delete:true
        })

        if (deleteData) {
            res.redirect('/admin/categories');
        } else {
            res.render('admin/categories',{message:'Error from deleteing User'});
        }
    } catch (error) {
        console.log('Error from deleteCategory',error);
    }
}

module.exports = {
    loadCategory,
    addCategory,
    loadEditCategory,
    editCategory,
    deleteCategory

}