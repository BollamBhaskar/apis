var jwt = require("jsonwebtoken")

var authMiddleware = async(req,res,next)=>{
    try{
        var authHeader = req.headers.authorization
        if(!authHeader){
            return res.status(401).json({message : "no token found"})
        }
        var token = authHeader.split(" ")[1]
        var decode = jwt.verify(token,process.env.JWT_TOKEN)
        req.user = decode
        next()

    }catch(error){
        return res.status(401).json({
            message: "Invalid or malformed token"
        });
    }
}

module.exports = authMiddleware

