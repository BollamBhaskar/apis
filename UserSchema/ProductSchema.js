var mongoose = require("mongoose")

var productSchema = new mongoose.Schema({
    title : {
        type : String
    },
    description : {
        type : String
    },
    price : {
        type : Number
    },
    image : {
        url : {
            type : String
        },
        publicId : {
            type : String
        }
    }

})

var Product = mongoose.model("products",productSchema)


module.exports = Product