require("dotenv").config()

var express = require("express")
const connectToDatabase = require("./database/db.js")
var useRoutes = require("./Routes/userRoutes")
var productRoutes = require("./Routes/ProductRoutes.js")
var profile=require("./Routes/profileRoutes.js")


var app = express()


app.use(express.json())



app.use("/",useRoutes)

app.use("/",productRoutes)
app.use("/", profile)




connectToDatabase()



var port = process.env.PORT

app.listen(port,()=>{
    console.log("The server is running");
})