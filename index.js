const express = require("express");
const app = express();
const fs = require("fs");

const mongoose = require("mongoose");
const { log } = require("console");


// connect to mongodb
mongoose.connect("mongodb://127.0.0.1:27017/rest-api").then(()=>{
    console.log("Connected to MongoDB successfully");
}).catch((err)=>{
    console.error("Failed to connect to MongoDB", err);
});

//Schema Design 
const userSchema = new mongoose.Schema(
    {
        first_name:{
            type:String,
            required:true
        },
        last_name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
        },
        gender:{
           
            type:String,
           
        },
        job_title:{
           
            type:String
        }
    }
);

//lets create a model for user

const User = mongoose.model("User", userSchema);

//Now we can use this User model to perform CRUD operations on our MongoDB database.
//till now we have only used the MOCK_DATA.json file to store our data but now we will use MongoDB to store our data permanently.

//This middleware allows Express to read data sent from forms or Postman
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));


app.get("/", (req, res) => {
    return res.send("Hello World!! this is MINI Project for REST API created by  gupta g");
});
// Get all users (API)
app.get("/api/user", async(req, res) => {
      const alldbuser = await User.find({}); 
    
   res.setHeader("X-myName","Jay Gupta");  // Custom header
    return res.json(alldbuser);
});
//Reading Headers from Request
app.get("/data", (req, res) => {
    const userAgent = req.headers["user-agent"];
    console.log(userAgent);
    res.send("Header received");
});

// Show users in HTML list
app.get("/user", async(req, res) => {
    const alldbuser = await User.find({});  
    const html = `
        <ul>
        ${alldbuser.map((user) => `<li>${user.first_name}-${user.last_name} </li>`).join("")}
        </ul>
    `;
    return res.send(html);
});

// Get user by ID
app.route("/api/user/:userid")
.get(async(req, res) => {

    const user = await User.findById(req.params.userid);
    return res.json(user);
})

.patch(async(req, res) => {
    await User.findByIdAndUpdate(req.params.userid, {last_name: "Updated"});

    return res.json({ status: "Success" });
})

.delete(async(req, res) => {
    await User.findByIdAndDelete(req.params.userid);

    return res.json({ status: "Success" });
});

// Create new user
app.post("/api/user", async(req, res) => {
    const body = req.body;
    if (!body.first_name || !body.email) {
    return res.status(400).json({
        status: "error",
        message: "first_name and email are required"
    });
}

    //here we are pushing the new user data to the users array and then writing it to the MOCK_DATA.json file. This is not a good practice for production applications but for the sake of this mini project, we are doing it this way. In real applications, we should use a database to store our data permanently.
    // users.push({ ...body, id: users.length + 1 });
    // fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err) => {
    //     if (err) return res.status(500).json({ status: "error" });

    //     return res.status(201).json({
    //         status: "success",
    //         id: users.length
    //     });
    // });  

    //we are now performing the same operation using MongoDB. We are creating a new user document in the users collection and then saving it to the database. This is a better approach than writing to a file as it allows us to store our data permanently and also provides us with more features like querying, indexing, etc.

    const result = await User.create({
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        gender: body.gender,
        job_title: body.job_title              
    });
    console.log(result);

    return res.status(201).json({
        msg:"User created successfully",
    });
});

app.listen(3000, () => {
    console.log("Server started successfully on port: 3000");
});