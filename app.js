const express = require("express");

const path = require("path");
const envFile =
    process.env.NODE_ENV === "production" ? ".env.production" : ".env.dev";
require("dotenv").config({ path: path.resolve(__dirname, envFile) });

const expressLayouts = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");

const sqlite = require("./config/db");

//미들웨어
const webSocket = require("./middleware/chatSocket");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();
const port = process.env.PORT || 3000;

app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(methodOverride("_method"));

app.use("/", require("./routes/postRoutes"));
app.use("/", require("./routes/adminRoutes"));

//에러 핸들러
app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(port, () => {
    console.log(`App Listening on port ${port}`);
});

webSocket(server);
