    const Category = require('../models/categoryModel');
 

const loadCategory = async(req,res) =>{
    try {

        
            const categoryData = await Category.find()
        res.render('admin/categories',{
            categoryData,
            currentUrl:req.url
        });
    } catch (error) {
        console.log('error from Category controller load Category',error);
    }
}

const addCategory = async (req, res) => {
    try {
        const categoryName = req.body.category_name;
        const categoryAction = req.body.category_action;
        const categoryDescription = req.body.category_description;

        const uniqCategory = await Category.findOne({ name: { $regex: categoryName, $options: "i" } });

        if (uniqCategory) {
            return res.json({ success: false, message: 'Category already exists' });
        } else {
            const categoryData = await Category.create({
                name: categoryName,
                description: categoryDescription,
                action: categoryAction,
                delete: false
            });
            if (categoryData) {
                return res.json({ success: true, message: `New Category - ${categoryData.name} added` });
            } else {
                return res.json({ success: false, message: 'Category not added' });
            }
        }
    } catch (error) {
        console.log('error from Category controller add Category', error);
        return res.json({ success: false, message: 'An error occurred' });
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

const editCategory = async (req, res) => {
    try {
        const id = req.query.id;
        const categoryName = req.body.category_name;
        const categoryAction = req.body.category_action;
        const categoryDescription = req.body.category_description;

        console.log('req.query.id:',req.query.id);
        
        console.log('req.body:',req.body);
        
        const uniqueCategory = await Category.findOne({ name: { $regex: categoryName, $options: "i" } });
        const target = await Category.findOne({ _id: id });

        if (uniqueCategory && uniqueCategory._id.toString() !== target._id.toString()) {
            return res.status(400).json({ message: 'Category already exists!' });
        }

        const categoryEdit = await Category.findByIdAndUpdate(id, {
            name: categoryName,
            description: categoryDescription,
            action: categoryAction,
        }, { new: true });

        if (categoryEdit) {
            return res.status(200).json({ message: 'Category updated successfully!' });
        } else {
            return res.status(500).json({ message: 'Failed to update category!' });
        }
    } catch (error) {
        console.error('Error from editCategory:', error);
        return res.status(500).json({ message: 'Server error!' });
    }
};


const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.body.id;

        const deletedCategory = await Category.findByIdAndUpdate(
            categoryId,
            { delete: true }, // Or you could delete it permanently using `findByIdAndDelete`
            { new: true }
        );

        if (deletedCategory) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(400).json({ success: false, message: 'Category not found.' });
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};

const addBackCategory = async (req, res) => {
    try {
        const { id } = req.body;
        const category = await Category.findById(id);

        if (category) {
            category.delete = false;
            await category.save();

            return res.json({ success: true, message: 'Category added back successfully.' });
        } else {
            return res.json({ success: false, message: 'Category not found.' });
        }
    } catch (error) {
        console.log('Error from addCategory:', error);
        return res.json({ success: false, message: 'An error occurred while adding the category.' });
    }
}

module.exports = {
    loadCategory,
    addCategory,
    loadEditCategory,
    editCategory,
    deleteCategory,
    addBackCategory

}