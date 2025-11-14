const express = require("express");
const router = express.Router();
const PostController = require("../controllers/postController");

/**
 * 메인 페이지
 * GET /
 */
router.get(["/", "/home"], PostController.home);

/**
 * 게시물 상세 보기
 * GET /post/:id
 */
router.get("/post/:id", PostController.showPost);

/**
 * 모든 게시물 보기
 * GET /blog
 */
router.get("/blog", PostController.allPosts);

/**
 * 실시간 채팅 페이지
 * GET /chat
 */
router.get("/chat", (req, res) => {
    const locals = {
        title: "실시간 채팅",
        stylesheet: "chat.css",
        role: "user",
    };
    res.render("chat", { locals, layout: mainLayout });
});

module.exports = router;
