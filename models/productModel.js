const mongoose=require('mongoose')

// //   image: [{
//     type: String,
// }],
//  storing multiple image url  thats why image field will array and we taking url so url will bw string
const productSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:[{
        type:String
    }],
    price:{
        type:Number,
        required:true
 
    },
    promo_price:{
        type:Number,
        required:true

    },
        stock:{
            7: {
                type: Number,
                default: 0
            },
            8: {
                type: Number,
                default: 0
            },
            9: {
                type: Number,
                default: 0
            },
            10: {
                type: Number,
                default: 0
            },
            11: {
                type: Number,
                default: 0
            },
            12: {
                type: Number,
                default: 0
            },
        },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'category',
        required:true
    },
 
  
      numReview:{
            type:Number,
            default:0
        },
        totalstars:{
            type:Number,
            default:0
      },

    delete:{
        type:Boolean,
        default:false
    },
    date:{
        type:Date,
        default:Date.now()

    },
    offer:{ 
        type:mongoose.Schema.Types.ObjectId,
        ref:'offer',
     }

})
module.exports=mongoose.model('products',productSchema)