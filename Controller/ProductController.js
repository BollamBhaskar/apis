
// var Product = require("../UserSchema/ProductSchema");
// const { uploadToCloudinary } = require("../helper/cloudinaryhelper");
// const { reviewSummaryForProduct } = require("./reviewController");





// var getAllProducts = async(req,res)=>{
//     try{
//         var allProducts =  await Product.find()
//         console.log(req.user);
//         res.status(200).json({products: allProducts})

//     }catch(error){
//         console.log("error",error);
//     }
// }


// var getSingleProduct = async(req,res)=>{
//     try{
//         var id = req.params.id 
//         var singleProduct = await  Product.findById(id)
//         if(!singleProduct){
//             return res.status(404).json({ message: "Product not found" })
//         }
//         var ratingSummary = await reviewSummaryForProduct(id)
//         res.status(200).json({singleProduct, ratingSummary})

//     }catch(error){
//         console.log("error",error);
//     }
// }

// var addNewProduct = async(req,res)=>{
//     try{

//         var {title,description,price} = req.body
//         if(!req.file){
//             return res.status(200).json({message : "file missing"})
//         }
//         // upload to cloudinary
//         var {url,publicId} = await uploadToCloudinary(req.file.path)
//         var newProduct = await Product.create({
//         title,
//         description,
//         price,
//         image : {
//             url,
//             publicId
//         }
//     })
//     res.status(201).json({message : "productadded",product : newProduct})
//     }catch(error){
//         console.log("error",error);
//     }
// }

// var updateProduct = async(req,res)=>{
//     try{
//         var id = req.params.id 
//         var {title,description,price} = req.body
//         var update = await Product.findByIdAndUpdate(id,{
//             title,
//             description,
//             price

//         },{
//             new : true
//         })
//         res.status(201).json({message : "product updated",data : update})

//     }catch(error){
//         console.log("error",error);
//     }
// }

// var deleteProduct = async(req,res)=>{
//     try{
//         var id = req.params.id 
//         var deletePro = await Product.findByIdAndDelete(id)
//         res.status(200).json({message : "product deleted"})

//     }catch(error){
//         console.log("error",error);
//     }
// }
// module.exports = {
//     getAllProducts,getSingleProduct,addNewProduct,updateProduct,deleteProduct
// }






var Product = require("../UserSchema/ProductSchema");
const { uploadToCloudinary } = require("../helper/cloudinaryhelper");

var {client, isRedisReady} = require("../config/redisClient")

var ALL_PRODUCTS_CACHE_KEY = "allProducts"



var getAllProducts = async (req, res) => {
    try {
        if (isRedisReady()) {
            var cachedData = await client.get(ALL_PRODUCTS_CACHE_KEY);
            if (cachedData) {
                console.log("data from redis");
                return res.status(200).json({
                    products: JSON.parse(cachedData)
                });
            }
        }

        var allProducts = await Product.find();

        if (isRedisReady()) {
            await client.setEx(ALL_PRODUCTS_CACHE_KEY, 3600, JSON.stringify(allProducts));
        }

        console.log("data from mongo db");

        res.status(200).json({
            products: allProducts
        });

    } catch (error) {
        console.log("error", error);
        return res.status(500).json({ message: "Failed to fetch products" });
    }
};


var getSingleProduct = async(req,res)=>{
    try{
        var id = req.params.id 
        var cacheKey =    `product:${id}`
        if (isRedisReady()) {
            const cachedData = await client.get(cacheKey);
            if(cachedData){
                return res.status(200).json({
                    singleProduct: JSON.parse(cachedData)
                });
            }
        }
        const singleProduct = await Product.findById(id);
        if (!singleProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        if (isRedisReady()) {
            await client.setEx(cacheKey, 60, JSON.stringify(singleProduct));
        }
        res.status(200).json({ singleProduct });


    }catch(error){
        console.log("error",error);
        return res.status(500).json({ message: "Failed to fetch product" });
    }
}



var addNewProduct = async(req,res)=>{
    try{

        var {title,description,price} = req.body
        if(!req.file){
            return res.status(200).json({message : "file missing"})
        }
        // upload to cloudinary
        var {url,publicId} = await uploadToCloudinary(req.file.path)
        var newProduct = await Product.create({
        title,
        description,
        price,
        image : {
            url,
            publicId
        }
    })
    if (isRedisReady()) {
        await client.del(ALL_PRODUCTS_CACHE_KEY);
    }
    res.status(201).json({message : "productadded",product : newProduct})
    }catch(error){
        console.log("error",error);
        return res.status(500).json({ message: "Failed to add product" });
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
        if (!update) {
            return res.status(404).json({ message: "Product not found" });
        }
        if (isRedisReady()) {
            await client.del(ALL_PRODUCTS_CACHE_KEY);
            await client.del(`product:${id}`);
        }
        res.status(201).json({message : "product updated",data : update})

    }catch(error){
        console.log("error",error);
        return res.status(500).json({ message: "Failed to update product" });
    }
}

var deleteProduct = async(req,res)=>{
    try{
        var id = req.params.id 
        var deletePro = await Product.findByIdAndDelete(id)
        if (!deletePro) {
            return res.status(404).json({ message: "Product not found" });
        }
        if (isRedisReady()) {
            await client.del(ALL_PRODUCTS_CACHE_KEY);
            await client.del(`product:${id}`);
        }
        res.status(200).json({message : "product deleted"})

    }catch(error){
        console.log("error",error);
        return res.status(500).json({ message: "Failed to delete product" });
    }
}
module.exports = {
    getAllProducts,getSingleProduct,addNewProduct,updateProduct,deleteProduct
}
