    const Category = require('../models/categoryModel');
 

const loadCategory = async(req,res) =>{
    try {

        // const searchQuery = req.query.search;
        // let categoryData;

        // if (searchQuery) {
        //     categoryData = await Category.find({name:{$regex:searchQuery,$options:"i"}});
        // } else {
        // }
            const categoryData = await Category.find({})
        res.render('admin/categories',{
            data:categoryData,
            currentUrl:req.url
        });
    } catch (error) {
        console.log('error from Category controller load Category',error);
    }
}

const addCategory = async (req,res) =>{
    try {
        const categoryName = req.body.category_name;
        const categoryAction = req.body.category_action;
        const categoryDescription =req.body.category_description;

        const categoryData = await Category.find({});

        const uniqCategory = await Category.findOne({name:{$regex:categoryName,$options:"i"}});
        if(uniqCategory){
            res.render('admin/categories',{
                fMessage:'Category already exists',
                data:categoryData,
                currentUrl:req.url
            });
        }else{
            const categoryData = await Category.create({
                name: categoryName,
                description:categoryDescription,
                action:categoryAction,
                delete:false
        })
            const categoryInfo = await categoryData.save();

            if (categoryInfo) {
                const updatedCategoryData = await Category.find({});
                // console.log('updated category data:',updatedCategoryData);
                res.render('admin/categories',{
                    sMessage:`new  Category -${categoryInfo.name},added`,
                    data:updatedCategoryData,
                    currentUrl:req.url
                });
                console.log('saved Category in mongo db');
            } else {

                res.render('admin/categories',{
                    fMessage:'Category not added',
                    data:categoryInfo,
                    currentUrl:req.url
                });
                
            }
        }
    } catch (error) {
        console.log('error from Category controller add Category', error);
    }
}

const loadEditCategory = async(req,res)=>{
    try {
        const id = req.query.id;
        const categoryData = await Category.findOne({_id:id});
        // console.log('Category data',categoryData);
        if (categoryData) {
            res.render('admin/editcategories',{data:categoryData,currentUrl:req.url})
        } else {
            console.log('not Category')
        }
    } catch (error) {
        console.log('error from Category control load edit user',error);
    }
}

const editCategory= async(req,res)=>{
    try {
        const id = req.query.id;

        console.log('edit category id:',id);

        console.log('editcategory form body:',req.body);
        const categoryName = req.body.category_name;
        const categoryAction = req.body.category_action;
        const categoryDescription = req.body.category_description;

        const categoryData = await Category.find({})

        // console.log('edit Category Category data',categoryData);

        const uniqueCategory = await Category.findOne({name:{$regex:categoryName,$options:"i"}})
        const target = await Category.findOne({_id:id});
        if (uniqueCategory && uniqueCategory._id.toString() !== target._id.toString()) {
            console.log('the category already exists!')
            res.render('admin/editcategories',
            
                {
                    fMessage:'Category already exists!',
                    data:target,
                    currentUrl:req.url
                })
        } else {
            const categoryEdit = await Category.findByIdAndUpdate(id,{
            name:categoryName,
            description:categoryDescription,
            action: categoryAction,
        },{new:true})

        if (categoryEdit) {
            const updatedCategoryData = await Category.find({});

            res.render('admin/categories',{
                data: updatedCategoryData,
                sMessage:'Category updated successfully',
                currentUrl:req.url
            });

        }else{
            res.render('admin/editcategories',{currentUrl:req.url});
        }

        }

        
    } catch (error) {
        console.log('Error from editcategory',error);
    }
}

const deleteCategory = async(req,res) =>{
    try {
        const id= req.query.id;
        const deleteData = await Category.findByIdAndUpdate(id,{
            delete:true
        })

        if (deleteData) {
            res.redirect('/admin/categories');
        } else {
            res.render('admin/categories',{message:'Error from deleteing User',currentUrl:req.url});
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