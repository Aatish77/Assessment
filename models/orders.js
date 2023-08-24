const Mongoose = require("mongoose");
const OrdersSchema = Mongoose.Schema({
    customer_id: String,
    preference_id : String,
    date : Date
})
const OrdersModel = Mongoose.model("orders",OrdersSchema);
module.exports=OrdersModel