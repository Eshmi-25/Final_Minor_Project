const mongoose= require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");

//setting basic connections
const MONGO_URL="mongodb://127.0.0.1:27017/travigo";

main()
.then(()=>{
    console.log("connected to db");
})
.catch((err)=>{
    console.log(err);
});
async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB= async()=>{
    //deleting initial data
    await Listing.deleteMany({});
    //inserting new data
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
}

initDB();



