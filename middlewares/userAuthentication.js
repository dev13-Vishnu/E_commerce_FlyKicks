const isLoggedIn = async (req,res,next) =>{
    try {
        if (req.session.user) {
            console.log('username:',req.session.user);
            console.log('checking if the user isBlocked or not:',req.session.user.isBlocked);
            if (!req.session.user.isBlocked) {
                console.log('Checking if the user is blocked or not:',req.session.user.isBlocked);
                next(); 
            } else {
                console.log('Checking if the user is blocked or not:',req.session.user.isBlocked);
                req.session.destroy();
                res.redirect('/login');
            }
        } else {
            res.redirect('/login'); //Redirect to login page if user is not logged in
        }
    } catch (error) {
        console.log('Error from user side authentication middleware',error);
        res.status(500).send('An error occured');
    }
};

const isLoggedOut= async(req,res,next)=>{
    try {
        if (req.session.user) {
                res.redirect('/home');
        } else {
            next();
        }
    } catch (error) {
        console.log('Error from user side Authentication middleware',error);
        res.status(500).send('An error occured');
    }
};

module.exports= {
    isLoggedIn,
    isLoggedOut
}