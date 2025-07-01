const express = require("express");
const router = express.Router();
const mainLayout = "../views/layouts/main.ejs"
const Post = require("../models/Post");
const marked = require('marked');
const asyncHandler = require("express-async-handler");

router.get(["/", "/home"], asyncHandler(async (req, res) => {
    const locals = {
        title: "메인 페이지"
    }
    const data = await Post.find().sort({ createAt: -1 });
    res.render("index", { locals, data, layout: mainLayout });
}));

router.get("/chat", (req, res) => {
    const locals = {
        title: "실시간 채팅",
        stylesheet:"chat.css",
        role: "user",
    }
    res.render("chat", { locals, layout: mainLayout });
});

/**
 * 게시물 상세 보기
 * GET /post/:id
 */
router.get("/post/:id", asyncHandler(async (req, res) => {
    const data = await Post.findOne({ _id: req.params.id });
    const content = marked.parse(data.body);
    const locals = {
        title: data.title,
        stylesheet:"markdown.css",
        role: "user",
    }
    res.render("post", { locals, data, content: content, layout: mainLayout });
}));

module.exports = router;