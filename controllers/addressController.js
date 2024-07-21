const Address = require('../models/addressModel');

const addAddress = async(req,res) =>{
    try {
        console.log('addAddress controller:',req.body);
        console.log('addAddress controller:req.session:',req.session);

        const {full_name,country,state,city,street,pincode,mobile}= req.body;

        const userId = req.session.user._id;

        //find the users address document
        let addressDoc = await Address.findOne({userId});

        // if no address document is find create new Address document

        if(!addressDoc){
            addressDoc = new Address({
                userId,
                address:[]
            })
        }

        //add the new address to the address array
        addressDoc.address.push({
            name:full_name,
            country,
            state,
            city,
            street,
            pincode,
            mobile,
        })

        //save the address document
        await addressDoc.save();

        res.redirect('/account');

    } catch (error) {
        console.log('error from addressController.js addAddress',error);
    }
}

module.exports = {
    addAddress
}