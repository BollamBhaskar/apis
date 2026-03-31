

var adminMiddleware = async(req,res,next)=>{
    try{
        if(req.user.role !=="admin"){
            return res.status(403).json({message : "cannot acces admin routes"})
        }
        
        next()
    }catch(error){
        console.log("error",error);
    }
}

module.exports = adminMiddleware