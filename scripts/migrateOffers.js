const mongoose = require('mongoose');
const Category = require('../models/Category'); // Adjust the path to your model
require('dotenv').config()


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB');
    return migrateOffers();
})
.catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
});

async function migrateOffers() {
    try {
        // Find all categories where offer is a number
        const categories = await Category.find({ offer: { $type: "number" } });

        for (const category of categories) {
            // Logic to convert the numeric offer to an ObjectId, if possible
            // For this example, we're setting offer to null
            category.offer = null;

            // Save the updated document
            await category.save();
        }

        console.log('Migration completed');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}
