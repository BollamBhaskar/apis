require("dotenv").config()
var cors = require("cors")

var express = require("express")
const connectToDatabase = require("./DataBase/db.js")
var useRoutes = require("./Routes/userRoutes")
var productRoutes = require("./Routes/ProductRoutes.js")
var profileRoutes = require("./Routes/profileRoutes.js")
var cartRoutes = require("./Routes/CartRoutes.js")
var paymentRoutes = require("./Routes/paymentRoutes.js")
var orderRoutes = require("./Routes/orderRoutes.js")
var wishlistRoutes = require("./Routes/wishlistRoutes.js")
var reviewRoutes = require("./Routes/reviewRoutes.js")
const { connectRedis } = require("./config/redisClient.js")
const { createLimiters } = require("./Middleware/rateLimiter");



var app = express()

app.use(cors())
app.use(express.json())

const startServer = async () => {
  // ✅ 1. Connect Redis FIRST
  await connectRedis();

  // ✅ 2. Create limiters AFTER Redis
  const { productLimiter, adminLimiter } = createLimiters();

app.use("/",useRoutes)

app.use("/",productLimiter,productRoutes)

app.use("/",profileRoutes)

app.use("/",cartRoutes)

app.use("/",paymentRoutes)

app.use("/",orderRoutes)

app.use("/",wishlistRoutes)

app.use("/",reviewRoutes)


await connectToDatabase()
await connectRedis()


var port = process.env.PORT

app.listen(port,()=>{
    console.log("The server is running");
});
}
startServer()