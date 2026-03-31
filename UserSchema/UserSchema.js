var mongoose = require("mongoose")

var userSchema = new mongoose.Schema({

    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true ,
        unique : true
    },
    password : {
        type : String,
        required : true 
    },
    role : {
        type : String,
        enum : ["user","admin"],
        default : "admin"
    }
})

var User = mongoose.model("User", userSchema)

module.exports = User