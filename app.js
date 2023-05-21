require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
require('dotenv')

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    }).catch((err) => {
        console.error("Error connecting to database.", err);
    })

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});

const User = new mongoose.model("User", userSchema);

app.get("/", (req,res) => {
    res.render("home")
})

app.get("/login", (req,res) => {
    res.render("login")
})

app.get("/register", (req,res) => {
    res.render("register")
})

app.post("/register", async (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    try{
        await newUser.save();
        console.log('new user registered with the name '+newUser.email);
        res.render("secrets");
    }catch (err){
        console.error(err);
        res.send(err);
    }
})

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try{
        const foundUser = await User.findOne({email: username}).exec();
        if (foundUser.password === password){
            res.render("secrets");
        }
    }catch (err){
        console.error(err);
    }
})





app.listen(3000, () => {
    console.log('server sunning on 3000');
})