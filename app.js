require('dotenv').config()
const mongoose = require ("mongoose");
const express = require("express");
const app = express();
const passport =require('passport');
const path = require("path");
const morgan = require("morgan");
const session = require ("express-session");
const bodyparser = require('body-parser');
const nocache = require("nocache");
const flash = require("connect-flash");
const cors = require('cors');

app.use(flash());


const PORT =process.env.PORT; // Use default port or environment variable

app.use(session({
  secret:process.env.Secret,
  resave:false,
  saveUninitialized:true
}))


app.use(passport.initialize());
app.use(passport.session());


try {
    mongoose.connect(process.env.MONGO_URL)
      .then(() => console.log("MongoDB connected"))
      .catch((error) => {
        console.error("MongoDB connection error:", error);
        process.exit(1); // Exit the application on connection failure
      });
  } catch (error) {
    console.error("Unexpected error:", error);
    process.exit(1);
  }

  // configure view engine
  app.set('views',path.join(__dirname,'views'));
  app.set('view engine','ejs');

  // body parser
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:true}))
app.use(cors())

  // set static folder
  app.use(express.static(path.join(__dirname,'public')));

  // for user routes
  const userRoute = require("./routes/userRoutes")
  app.use('/',userRoute);


  //for admin routes
const adminRoutes = require('./routes/adminRoutes');

app.use('/admin',adminRoutes);
  

  
// ... your server setup code (routes, middleware, etc.)

app.listen(PORT, () => console.log(` app listening on port ${PORT}!`))