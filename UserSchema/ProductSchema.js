var mongoose = require("mongoose")

var productSchema = new mongoose.Schema({
    title : String,
    description : String,
    price : Number

})

var Product = mongoose.model("products",productSchema)


module.exports = Product