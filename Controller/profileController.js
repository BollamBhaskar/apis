
var User = require("../UserSchema/UserSchema")

var bycrpt = require("bcrypt")

var getProfile = async(req,res)=>{
    try{
        var userId = req.user.userId
        if(!userId){
            return res.status(403).json({message : "no user found"})
        }
        var user = await User.findById(userId).select("-password")
        res.status(200).json({user})

        
    }catch(error){
        console.log("error",error);
    }
}

var updateProfile = async(req,res)=>{
    try{
        var userId = req.user.userId
        if(!userId){
            return res.status(200).json({message : "no user id"})
        }
        var {name,email,password} = req.body 
        var updatedUser = {}
        if(name){
            updatedUser.name = name
        }
        if(email){
            updatedUser.email = email
        }
        if(password){
            var hashedPassword = await bycrpt.hash(password,10)
            updatedUser.password = hashedPassword
        }
        var updateUserdata = await User.findByIdAndUpdate(userId,updatedUser,{new : true})
        res.status(201).json({updateUserdata})


    }catch(error){
        console.log("error",error);
    }
}

module.exports = {
    getProfile,
    updateProfile
}