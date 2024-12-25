require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose");

mongoose.connect(config.connectionString);

const User = require("./models/user.model");
const Note = require("./models/note.model");

const express = require("express");
const cors = require("cors")
const app = express();

const jwt = require('jsonwebtoken');
const { authenticaionToken } = require("./utilities");

app.use(express.json());

app.use(
    cors({
        origin: "*",
    })
);

app.get("/", (req, res) => {
    res.json({ data: "hello" });
});

//Create Account
app.post("/createAccount", async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName) {
        return res
            .status(400)
            .json({ error: true, message: "Please enter your full name" });
    }

    if (!email) {
        return res
            .status(400)
            .json({ error: true, message: "Email is required" });
    }

    if (!password) {
        return res
            .status(400)
            .json({ error: true, message: "Password is required" });
    }

    const isUser = await User.findOne({ email: email });

    if (isUser) {
        return res.json({ error: true, message: "User already exists" });
    }

    const user = new User({
        fullName,
        email,
        password,
    });

    await user.save();

    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
    });

    return res.json({
        error: false,
        user,
        accessToken,
        message: "Registration Successful"
    });

})

//Login User
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is Required" });
    }

    if (!password) {
        return res.status(400).json({ message: "Password is Required" });
    }

    const userInfo = await User.findOne({ email: email });

    if (!userInfo) {
        return res.status(400).json({ message: "USer not found" });
    }

    if (userInfo.email == email && userInfo.password == password) {
        const user = { user: userInfo };
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "1h",
        });

        return res.json({
            error: false,
            message: "Login Successful",
            email,
            accessToken,
        })
    } else {
        return res
            .status(400)
            .json({ message: "Invalid Email or Password" });
    }
})

//Add Note
app.post("/add-note", authenticaionToken, async (req, res) => {
    const { title, content, tag } = req.body;
    const { user } = req.user; // Ensure `authenticaionToken` sets `req.user`

    // Validate title and content
    if (!title) {
        return res.status(400).json({ error: true, message: "Title is required" });
    }

    if (!content) {
        return res.status(400).json({ error: true, message: "Content is required" });
    }

    try {
        // Create and save a new note
        const note = new Note({
            title,
            content,
            tags: tag || [], // Use an empty array if tag is undefined
            userId: user._id, // Ensure `user._id` exists
        });

        await note.save();

        return res.json({
            error: false,
            message: "Note added successfully",
        });
    } catch (error) {
        console.error(error); // Log error for debugging
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
});


app.listen(8000);

module.exports = app;