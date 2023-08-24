const Express = require("express")
const Mongoose =require("mongoose")
const BodyParser = require("body-parser")
const Cors = require("cors")
const ProductsModel = require("./models/products")
const CustomerpreferenceModel = require("./models/customer_preference")
const OrdersModel = require("./models/orders")
const app= new Express()

app.use(BodyParser.json())
app.use(BodyParser.urlencoded({extended:true}))
app.use(Cors())
Mongoose.connect("mongodb+srv://vetrim287:Vetri123@cluster0.t3lrbds.mongodb.net/assessmentdb?retryWrites=true&w=majority", {useNewUrlParser: true})
const path = require('path');  
app.use(express.static(path.join(__dirname,'/buil d')));    
app.get('/*', function(req, res) {   res.sendFile(path.join(__dirname ,'/build/index.html')); }); 

app.get("/viewallproducts",async(req,res)=>{
    try{
        var result=await ProductsModel.find();
        res.send(result);

    }catch(error){
        res.status(500).send(error);
    }
})

app.get("/viewallpreferences",async(req,res)=>{
    try{
        var result=await CustomerpreferenceModel.find();
        res.send(result);

    }catch(error){
        res.status(500).send(error);
    }
})

app.get("/viewallorders",async(req,res)=>{
    try{
        var result=await OrdersModel.find();
        res.send(result);

    }catch(error){
        res.status(500).send(error);
    }
})





app.get("/popularproducts", async (req, res) => {
    try {
        const popularProduct = await ProductsModel.aggregate([
            {
                $lookup: {
                    from: "customer_preferences",
                    localField: "product_id",
                    foreignField: "product_id",
                    as: "preferences"
                }
            },
            {
                $lookup: {
                    from: "orders",
                    localField: "preferences.preference_id",
                    foreignField: "preference_id",
                    as: "orders"
                }
            },
            {
                $project: {
                    product_id: 1,
                    name: 1,
                    price: 1,
                    orderCount: { $size: "$orders" }
                }
            },
            {
                $sort: { orderCount: -1 }
            }
        ]);
        const keyToFind = "orderCount";

const popularProducts = popularProduct.reduce((max, current) => {
  if (current[keyToFind] > max[keyToFind]) {
    return current;
  } else {
    return max;
  }
}, popularProduct[0]);
const arrayOfpopularpro = [popularProducts];


        res.send(arrayOfpopularpro);
    } catch (error) {
        res.status(500).send(error);
    }
});


app.get("/customers-ordered-all-products", async (req, res) => {
    try {
        const allProductIDs = [1, 2, 3, 4, 5]; // List of all product IDs
        
        const customersOrderedAllProducts = await OrdersModel.aggregate([
            {
                $lookup: {
                    from: "customer_preferences", // Name of the collection
                    localField: "preference_id",
                    foreignField: "preference_id",
                    as: "preferences"
                }
            },
            {
                $unwind: "$preferences"
            },
            {
                $group: {
                    _id: "$customer_id",
                    orderedProducts: { $addToSet: "$preferences.product_id" }
                }
            },
            {
                $match: {
                    orderedProducts: { $all: allProductIDs.map(id => id.toString()) }
                }
            },
            {
                $project: {
                    _id: 1
                }
            }
        ]);

        const customerIDs = customersOrderedAllProducts.map(customer => customer._id);
        
        res.send(customerIDs);
    } catch (error) {
        res.status(500).send(error);
    }
});


app.get("/customersWhoBoughtInexpensiveItems", async (req, res) => {
    try {
        // Step 1: Find the lowest priced product
        const lowestPricedProduct = await ProductsModel.findOne().sort({ price: 1 });

        if (!lowestPricedProduct) {
            return res.json({ message: "No products found." });
        }

        // Step 2: Find customer preferences matching the lowest priced product
        const matchingPreferences = await CustomerpreferenceModel.find({ product_id: lowestPricedProduct.product_id });

        if (matchingPreferences.length === 0) {
            return res.json({ message: "No matching preferences found." });
        }

        // Extract preference IDs
        const matchingPreferenceIds = matchingPreferences.map(preference => preference.preference_id);

        // Step 3: Find customers who ordered the products with matching preferences
        const matchingCustomers = await OrdersModel.distinct("customer_id", {
            preference_id: { $in: matchingPreferenceIds }
        });

        res.json({ matchingCustomers });

    } catch (error) {
        res.status(500).json({ error: "An error occurred." });
    }
});







app.listen(3007,()=>{
    console.log("server Started")
})