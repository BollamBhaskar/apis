var User=require("../UserSchema/UserSchema")
var bcrypt = require("bcrypt")
var jwt = require("jsonwebtoken")
var registerUser = async(req,res)=>{
    try{
        var {name,email,password} = req.body
        var userExists = await User.findOne({email})
        if(userExists){
            return res.status(200).json({message : "user exists"})
        }
        var hashPassword = await bcrypt.hash(password,10)

        var newUser = await User.create({
            name,
            email,
            password : hashPassword

        })
        res.status(201).json({message : "account created",user : newUser})

        

    }catch(error){
        console.log("error",error);
    }
}


var login = async(req,res)=>{
    try{
        var {name,email,password} = req.body
        
        var userExists = await User.findOne({email})
        if(!userExists){
          return  res.status(200).json({message : "register "})
        }
        var checkPassword = await bcrypt.compare(password,userExists.password)
        if(!checkPassword){
            return res.status(200).json({message : "incorrect password"})
            
        }

    var token = jwt.sign({
        userId : userExists._id,
        email : userExists.email
    },
    process.env.JWT_TOKEN,
    { expiresIn: "1d" }
    )

    res.status(200).json({message :"login done",webToken : token})

        
    }catch(error){
        console.log("error",error);
    }
}

module.exports = {
    registerUser,login
}