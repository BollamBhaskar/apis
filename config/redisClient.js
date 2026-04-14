var {createClient} = require("redis")


var client = createClient({
    url : process.env.REDIS_URL
})

var redisReady = false

client.on("connect",()=>{
    console.log("connected to the redis");
})

client.on("ready", () => {
    redisReady = true
    console.log("redis client ready")
})

client.on("end", () => {
    redisReady = false
    console.log("redis client disconnected")
})

client.on("error",(error)=>{
    redisReady = false
    console.log("error",error);
})


var connectRedis = async()=>{
    try{
        if (!process.env.REDIS_URL) {
            console.log("REDIS_URL missing, skipping redis connection")
            return
        }

        if (client.isOpen) {
            return
        }

        await client.connect()

    }catch(error){
        redisReady = false
        console.log("redis connect error", error.message);
    }
}




module.exports = {
    client,connectRedis,
    isRedisReady: () => redisReady && client.isOpen
}