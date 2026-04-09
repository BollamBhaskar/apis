require("dotenv").config()
var cors = require("cors")

var express = require("express")
const connectToDatabase = require("./database/db.js")
var useRoutes = require("./Routes/userRoutes")
var productRoutes = require("./Routes/ProductRoutes.js")
var profileRoutes = require("./Routes/profileRoutes.js")
var cartRoutes = require("./Routes/CartRoutes.js")
var paymentRoutes = require("./Routes/paymentRoutes.js")
var orderRoutes = require("./Routes/orderRoutes.js")



var app = express()

app.use(cors())
app.use(express.json())


app.use("/",useRoutes)

app.use("/",productRoutes)

app.use("/",profileRoutes)

app.use("/",cartRoutes)

app.use("/",paymentRoutes)

app.use("/",orderRoutes)


connectToDatabase()


var port = process.env.PORT

app.listen(port,()=>{
    console.log("The server is running");
})