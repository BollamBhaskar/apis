var express = require("express")
const { getAllProducts, getSingleProduct, addNewProduct, updateProduct, deleteProduct } = require("../Controller/ProductController")
const authMiddleware = require("../Middleware/authMiddleware")
const adminMiddleware = require("../Middleware/adminMiddleware")


var router = express.Router()




router.get("/products",authMiddleware,getAllProducts)

router.get("/products/:id",authMiddleware,adminMiddleware,getSingleProduct)

router.post("/addproduct",authMiddleware,adminMiddleware,addNewProduct)

router.put("/update/:id",authMiddleware,adminMiddleware,updateProduct)

router.delete("/delete/:id",authMiddleware,adminMiddleware,deleteProduct)


module.exports = router