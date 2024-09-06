const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const seccurePassword = require('../helpers/securePassword');
const Order = require('../models/orderModel'); 
const moment = require('moment');



const login = async(req,res)=>{
    try {
        res.render('admin/login');
    } catch (error) {
        console.log('error from adimincontroller login',error);
    }
};

const verifyLogin = async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        // console.log(req.body.email,'\n',req.body.password );

        const userData = await User.findOne({email: email});
        {
            if (userData) {
                // console.log("userdata und");
                // console.log(userData.password)
                const passwordMatch = await bcrypt.compare(password,userData.password);
                if(passwordMatch){
                    if(userData.isAdmin===1){
                        req.session.admin = {
                            _id:userData._id,
                            email:email,
                        };
                    res.redirect('/admin/home')
                    console.log('rendering working');

                    }else{
                        res.render('admin/login',{message:'you are not a Admin'});

                    }
                }else{
                    res.render('admin/login',{message:'passwod does not match'});

                }
            }else{
                res.render('admin/login',{message: "email and password doesn't match"});
            }
        }
    } catch (error) {
        console.log('Error in adming verify login',error);
    }
};


const loadDashboard = async (req, res, next) => {
    try {

        // Set pagination variables
const page = parseInt(req.query.page) || 1; // Current page number
const limit = parseInt(req.query.limit) || 10; // Number of records per page
const skip = (page - 1) * limit; // Number of records to skip

// Fetch orders with pagination
let orders = await Order.find({paymentStatus: 'Success'})
    .populate('userId', 'username email')
    .populate('products.productId', 'name')
    .sort({ orderDate: -1 })
    .skip(skip)
    .limit(limit);

// Count total orders for pagination
const totalOrdersPagination = await Order.countDocuments();

const totalPages = Math.ceil(totalOrdersPagination / limit);



        

        // Get Dates for Filters
        const today = moment().endOf('day');
        const last7Days = moment().subtract(6, 'days').startOf('day');
        const startOfMonth = moment().startOf('month');
        const startOfYear = moment().startOf('year');


        


        // Aggregate Sales Data for Last 7 Days
        const salesDataLast7Days = await Order.aggregate([
            {
                $match: {
                    orderDate: { $gte: last7Days.toDate(), $lte: today.toDate() }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$orderDate" },
                        month: { $month: "$orderDate" },
                        day: { $dayOfMonth: "$orderDate" }
                    },
                    totalSales: { $sum: "$payableAmount" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
        ]);

        // Aggregate Sales Data for This Month
        const salesDataThisMonth = await Order.aggregate([
            {
                $match: {
                    orderDate: { $gte: startOfMonth.toDate(), $lte: today.toDate() }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$orderDate" },
                        month: { $month: "$orderDate" },
                        day: { $dayOfMonth: "$orderDate" }
                    },
                    totalSales: { $sum: "$payableAmount" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
        ]);

        // Aggregate Sales Data for This Year
        const salesDataThisYear = await Order.aggregate([
            {
                $match: {
                    orderDate: { $gte: startOfYear.toDate(), $lte: today.toDate() }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$orderDate" },
                        month: { $month: "$orderDate" }
                    },
                    totalSales: { $sum: "$payableAmount" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Calculate Overall Revenue
        const overallRevenue = orders.reduce((total, order) => total + order.payableAmount, 0);

        // Calculate Total Orders
        const totalOrders = orders.length;

        // Calculate Total Products Sold
        const totalProducts = orders.reduce((count, order) => count + order.products.length, 0);

        // Calculate Average Monthly Earnings
        const currentYear = new Date().getFullYear();
        const monthlyEarnings = await Order.aggregate([
            {
                $match: {
                    orderDate: {
                        $gte: new Date(currentYear, 0, 1),
                        $lte: new Date(currentYear, 11, 31),
                    },
                },
            },
            {
                $group: {
                    _id: { month: { $month: "$orderDate" } },
                    totalSales: { $sum: "$payableAmount" },
                },
            },
        ]);

        const totalMonths = monthlyEarnings.length;
        const averageMonthlyEarning = totalMonths > 0
            ? monthlyEarnings.reduce((sum, month) => sum + month.totalSales, 0) / totalMonths
            : 0;

            const bestSellingProducts = await Order.aggregate([
                { $unwind: "$products" }, // Deconstruct the products array
                {
                    $group: {
                        _id: "$products.productId", // Group by productId
                        totalSold: { $sum: "$products.quantity" }, // Sum the quantity for each product
                    },
                },
                { $sort: { totalSold: -1 } }, // Sort by totalSold in descending order
                { $limit: 10 }, // Limit the result to the top 10 best-selling products
                {
                    $lookup: {
                        from: "products",
                        localField: "_id",
                        foreignField: "_id",
                        as: "productDetails",
                    },
                },
                { $unwind: "$productDetails" },
                {
                    $project: {
                        _id: 0,
                        productId: "$_id",
                        totalSold: 1,
                        productName: "$productDetails.name",
                        productImage: { $arrayElemAt: ["$productDetails.image", 0] }, // Get the first image from the array
                        productPrice: "$productDetails.price",
                    },
                },
            ]);
            

            const topSellingCategories = await Order.aggregate([
        { $unwind: '$products' },
        {
            $lookup: {
                from: 'products',
                localField: 'products.productId',
                foreignField: '_id',
                as: 'productDetails'
            }
        },
        { $unwind: '$productDetails' },
        {
            $group: {
                _id: '$productDetails.category',
                totalSold: { $sum: '$products.quantity' }
            }
        },
        {
            $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: '_id',
                as: 'categoryDetails'
            }
        },
        { $unwind: '$categoryDetails' },
        {
            $project: {
                _id: 0,
                categoryName: '$categoryDetails.name',
                totalSold: 1
            }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 }  // Adjust the number as needed
    ]);

    
    const discounts = await Order.aggregate([
    {
      $unwind: "$products",  // Deconstructs the products array
    },
    {
      $group: {
        _id: "$_id",  // Group by each order ID
        totalProductPrice: { $sum: "$products.productPrice" },  // Sum of productPrice fields
        totalPayableAmount: { $first: "$payableAmount" },  // Get the payableAmount for each order
      },
    },
    {
      $project: {
        _id: 1,
        totalProductPrice: 1,
        totalPayableAmount: 1,
        deduction: {
          $subtract: ["$totalProductPrice", "$totalPayableAmount"],  // Calculate the difference
        },
      },
    },
  ]);

  // Map discounts to orders
  orders = orders.map(order => {
    const discount = discounts.find(d => d._id.toString() === order._id.toString());
    return {
        ...order.toObject(), // Convert mongoose document to plain object
        discount: discount ? discount.deduction : 0
    };
});
console.log('admin controller loaddashboard orders:',orders);

          

        // Render Dashboard View and Pass Data
        res.render('admin/dashboard', {
            currentUrl: req.url,
            orders,
            totalOrdersPagination,
            currentPage: page,
            totalPages,
            limit,
            overallRevenue,
            totalOrders,
            totalProducts,
            averageMonthlyEarning,
            salesDataLast7Days: JSON.stringify(salesDataLast7Days),
            salesDataThisMonth: JSON.stringify(salesDataThisMonth),
            salesDataThisYear: JSON.stringify(salesDataThisYear),
            bestSellingProducts,
            topSellingCategories,
            // discount: JSON.stringify(discounts) // Pass discount data to the template

        });
    } catch (error) {
        console.error('Error loading dashboard:', error);
        next(error);
    }
};




const loadUserList = async(req,res,next)=>{
    try {
        
         var page = 1;
         if(req.query.page){
            page = req.query.page;
         }

         const limit = 5;
         
    

        const users = await User.find({isAdmin : 0})
        .limit(limit*1)
        .skip((page - 1) * limit)
        .exec();

        const count = await User.find({isAdmin:0})
        .countDocuments();



        // console.log(users);
        
        res.render('admin/userslist',{users,
            totalPages:Math.ceil(count/limit),
            currentPage: page,
            currentUrlPage:req.query.page,
            currentUrl:req.url});
    } catch (error) {
        next(error);
    }
}

const userBlock = async (req, res) => {
    try {
        const saved = await User.findByIdAndUpdate(
            { _id: req.query.id },
            { $set: { isBlocked: true } },
            { new: true }
        );
        if (saved) {
            res.sendStatus(200); // Success
        }
    } catch (error) {
        console.log('error from admincontroller userBlock', error);
        res.sendStatus(500); // Failure
    }
};

const userUnblock = async (req, res) => {
    try {
        const saved = await User.findByIdAndUpdate(
            { _id: req.query.id },
            { $set: { isBlocked: false } },
            { new: true }
        );
        if (saved) {
            res.sendStatus(200); // Success
        }
    } catch (error) {
        console.log('error from admincontroller userUnblock', error);
        res.sendStatus(500); // Failure
    }
};


const logout = async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.log("error from admin logout", err);
          res.status(500).send("server error");
        } else {
          console.log("logout working");
          res.redirect("/admin");
        }
      });
    } catch (error) {
      console.log("error from admin controll logout", error);
    }
  };

  


module.exports={
    login,
    verifyLogin,
    loadDashboard,
    loadUserList,
    userBlock,
    userUnblock,
    logout
}