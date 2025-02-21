require("dotenv").config();
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const connectDb = require("./config/db");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const webSocket  = require("./middleware/chatSocket");

const app = express();
const port = process.env.PORT || 3000;

connectDb();

app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(methodOverride("_method"));

app.use("/", require("./routes/main"));
app.use("/", require("./routes/admin"));

const server = app.listen(port, () => {
    console.log(`App Listening on port ${port}`);
});

webSocket(server);