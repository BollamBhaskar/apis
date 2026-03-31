var mongoose=require("mongoose")
async function connectToDatabase(){
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log("connected database")

    }catch(error){
        console.log("error",error)
    }
}
module.exports=connectToDatabase