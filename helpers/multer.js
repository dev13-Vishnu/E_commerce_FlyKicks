const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/uploads/'); // Ensure this directory exists
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize upload without file type check
const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 } // 5MB limit
}).array('images', 4); // Name of the file input field and maximum number of files

// Export the upload configuration
module.exports = upload;
