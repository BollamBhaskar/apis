
var Product = require("../UserSchema/ProductSchema")


var getAllProducts = async(req,res)=>{
    try{
        var allProducts =  await Product.find()
        res.status(200).json({products: allProducts})

    }catch(error){
        console.log("error",error);
    }
}


var getSingleProduct = async(req,res)=>{
    try{
        var id = req.params.id 
        var singleProduct = await  Product.findById(id)
        res.status(200).json({singleProduct})

    }catch(error){
        console.log("error",error);
    }
}

var addNewProduct = async(req,res)=>{
    try{
        var {title,description,price} = req.body
        var newProduct = await Product.create({
        title,
        description,
        price
    })
    res.status(201).json({message : "productadded",product : newProduct})
    }catch(error){
        console.log("error",error);
    }
}

var updateProduct = async(req,res)=>{
    try{
        var id = req.params.id 
        var {title,description,price} = req.body
        var update = await Product.findByIdAndUpdate(id,{
            title,
            description,
            price

        },{
            new : true
        })
        res.status(201).json({message : "product updated",data : update})

    }catch(error){
        console.log("error",error);
    }
}

var deleteProduct = async(req,res)=>{
    try{
        var id = req.params.id 
        var deletePro = await Product.findByIdAndDelete(id)
        res.status(200).json({message : "product deleted"})

    }catch(error){
        console.log("error",error);
    }
}
module.exports = {
    getAllProducts,getSingleProduct,addNewProduct,updateProduct,deleteProduct
}