var express = require("express")
const { getAllProducts, getSingleProduct, addNewProduct, updateProduct, deleteProduct } = require("../Controller/ProductController")
const authMiddleware = require("../Middleware/authMiddleware")


var router = express.Router()




router.get("/products",authMiddleware,getAllProducts)

router.get("/products/:id",authMiddleware,getSingleProduct)

router.post("/addproduct",authMiddleware,addNewProduct)

router.put("/update/:id",authMiddleware,updateProduct)

router.delete("/delete/:id",authMiddleware,deleteProduct)


module.exports = router