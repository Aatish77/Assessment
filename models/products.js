const Mongoose = require("mongoose");
const ProductsSchema = Mongoose.Schema({
    product_id: String,
    name: String,
    price: Number
})
const ProductsModel = Mongoose.model("products",ProductsSchema);
module.exports=ProductsModel