const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true
  },
  mobile:{
    type:Number,
    default:""
  },
  password:{
    type:String,
    default:""
  },
  isBlocked:{
    type: Boolean,
    required: true
  },
  isAdmin:{
    type:Number,
    default:0
  },
  token:{
    type:String,
    default:""
  },
  date:{
    type:Date,
    default:Date.now()
  },
  googleId: String,
  
}
);

module.exports = mongoose.model("user", userSchema);
