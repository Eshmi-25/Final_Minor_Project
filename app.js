const express= require("express");
const app= express();
const mongoose = require("mongoose");
const Listing=require("./models/listing.js");
var path = require("path");
const methodOverride = require("method-override");
const ejsMate= require("ejs-mate");
const wrapAsync= require("./utils/wrapAsync.js");
const ExpressError= require("./utils/ExpressError.js");
const{listingSchema}= require("./schema.js");


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

app.set("view engine","ejs");
app.set("views",path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.static(path.join(__dirname,"/views")));
app.get("/",(req,res)=>{
    res.render('Home/index');
});

const validateListing =(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else{
        next();
    } 
}


//Index Route Listings
app.get("/listings", wrapAsync(async (req,res)=>{
   const allListings = await Listing.find({});
   res.render("listings/index.ejs",{allListings});
}));

//New Route
app.get("/listings/new", (req,res)=>{
    res.render("listings/new.ejs");
}); 

//showRoute
app.get("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
}));

//Create Route
app.post("/listings" ,validateListing,wrapAsync(async(req,res,next)=>{
    
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
    
    
}));

//Edit Route
app.get("/listings/:id/edit",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

//Update Route
app.put("/listings/:id", validateListing , wrapAsync(async(req,res)=>{
    let{id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing}); 
    res.redirect(`/listings/${id}`);  
}));

//DELETE Route
app.delete("/listings/:id", wrapAsync(async(req,res)=>{
    let {id}=req.params;
   let deletedListing = await Listing.findByIdAndDelete(id);
   console.log(deletedListing);
   res.redirect("/listings");
}));

/*app.get("/testListing", async (req,res)=>{
    let sampleListing=new Listing({
        title:"My New Villa",
        description:"By the Beach",
        price:1200,
        location:"Connaught Place, New Delhi",
        country:"India",
    });
   await sampleListing.save();
    console.log("Sample was Saved");
    res.send("Successful Testing");
})*/

app.get("/solotrip", (req,res)=>{
    res.render("solotrip/solotrip.ejs");
}); 

app.get("/attractions",(req,res)=>{
    res.render("Tourist_Attractions/ta.ejs")
})

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));
});

app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went Wrong"}=err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
    
})


app.listen(8080, ()=>{
    console.log("Server is listening to port 8080");
});