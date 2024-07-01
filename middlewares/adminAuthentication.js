const isLogin = async(req,res,next)=>{
    try {
            if (req.session.admin) {
                console.log(req.session.admin);

                next();
            } else {
                res.redirect('/admin');
            }
    } catch (error) {
        console.log('error from middleware isLogin',error);
        res.status(500).send('An error occured');
    }
};

const isLogout = async(req,res,next) =>{
    try {
        if(req.session.admin){
            res.redirect('/admin/home');
        }else{
            next(); 
        }
    } catch (error) {
        console.log('An error occured in Admin authentication',error.message);
        res.status(500).send('An error occured');
    }
}

module.exports = {
    isLogin,
    isLogout
}