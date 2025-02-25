const express = require("express");
const router = express.Router();
const mainLayout = "../views/layouts/main.ejs"
const Post = require("../models/Post");
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
        stylesheet:"chat.css"
    }
    res.render("chat", { locals, layout: mainLayout });
});

/**
 * 게시물 상세 보기
 * GET /post/:id
 */
router.get("/post/:id", asyncHandler(async (req, res) => {
    const data = await Post.findOne({ _id: req.params.id });
    res.render("post", { data, layout: mainLayout });
}));

module.exports = router;

// Post.insertMany([
//     {
//         title : "제목1",
//         body : "내용 1 - ㅁㄴ아ㅓㅠㅗ나피ㅓㅇㄹ니ㅏ퓨ㅏㅓㄷㄱ퓨ㅏㅓㄷ자",
//     },
//     {
//         title : "제목2",
//         body : "내용 2 - ㅁㄴ아ㅓㅠㅗ나피ㅓㅇㄹ니ㅏ퓨ㅏㅓㄷㄱ퓨ㅏㅓㄷ자",
//     },
//     {
//         title : "제목3",
//         body : "내용 3 - ㅁㄴ아ㅓㅠㅗ나피ㅓㅇㄹ니ㅏ퓨ㅏㅓㄷㄱ퓨ㅏㅓㄷ자",
//     }
// ]);