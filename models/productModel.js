const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please insert a product name"]
        },
        quantity: {
            type: Number,
            required: true,
            default: 0
        },
        price: {
            type: Number,
            required: true,
            default: 0
        }
    },
    {
        timestamps: true
    }
)

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
