const Mongoose = require("mongoose");
const CustomerpreferenceSchema =Mongoose.Schema({
    preference_id: String,
    product_id : String
})
const CustomerpreferenceModel = Mongoose.model("customer_preferences",CustomerpreferenceSchema);
module.exports = CustomerpreferenceModel