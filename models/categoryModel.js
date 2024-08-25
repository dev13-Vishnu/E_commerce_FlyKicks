const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true
    },
    
    delete: {
        type: Boolean,
        defautl:false
    },
    date:{
        type: Date,
        defautl:Date.now()
    },

    offer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'offer',
    }
})
module.exports = mongoose.model('category',categorySchema);