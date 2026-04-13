
var Order = require("../UserSchema/OrderSchema")


var getAllOrders = async(req,res)=>{
    try{
        var userId = req.user.userId 
        var allOrders = await find({userId}).sort({ createdAt: -1 });
        res.status(200).json({
            message: "User orders fetched successfully",
            orders,
          });




    }catch(error){
        console.log("error",error);
    }
}


var getSingleOrder = async(req,res)=>{
    try{
        var userId = req.user.userId 
        var orderId = req.params.id 
        var order = await Order.findOne({
            _id: orderId,
            userId: userId, 
          });
          if (!order) {
            return res.status(404).json({
              message: "Order not found",
            });
            
          }

          res.status(200).json({
            message: "Order fetched successfully",
            order,
          });
      

    }catch(error){
        console.log("error",error);
    }
}


module.exports = {
    getAllOrders,getSingleOrder
}