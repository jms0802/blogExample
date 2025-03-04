const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
require("dotenv").config();

const connectDb = asyncHandler( async() => {
    try {
        const connect = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`DB Connected : ${connect.connection.host}`);
    } catch(err) {
        console.log(err);
    }
});

module.exports = connectDb;