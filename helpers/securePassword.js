const bcrypt = require('bcrypt');

const SecurePassword = async(password) =>{
    try {
        const passwordHash = await bcrypt.hash(password,10)
        return passwordHash;

    } catch (error) {
        console.log('error from usercontroller SecurePassword',error);

    }
}
module.exports = {
    SecurePassword
}