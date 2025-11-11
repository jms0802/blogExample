const express = require("express");
const router = express.Router();
const mainLayout = "../views/layouts/main.ejs";
const asyncHandler = require("express-async-handler");
const db = require("../config/db");
const marked = require("marked");

/**
 * 메인 페이지
 * GET /
 */
router.get(
    ["/", "/home"],
    asyncHandler(async (req, res) => {
        const locals = {
            title: "메인 페이지",
        };
        db.all("SELECT * FROM posts ORDER BY createAt DESC", [], (err, rows) => {
            if (err) {
                return res
                    .status(500)
                    .send("게시물을 불러오는 중 오류가 발생했습니다.");
            }
            // posts에 필요한 가공
            rows.forEach((row) => {
                row.createAt = new Date(row.createAt);
            });
            res.render("index", { locals, data: rows, layout: mainLayout });
        });
    })
);

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

/**
 * 게시물 상세 보기
 * GET /post/:id
 */
router.get(
    "/post/:id",
    asyncHandler(async (req, res) => {
        const postId = req.params.id;
        db.get("SELECT * FROM posts WHERE id = ?", [postId], (err, row) => {
            if (err || !row) {
                return res.status(404).send("게시물을 찾을 수 없습니다.");
            }
            const content = marked.parse(row.body || "");
            row.createAt = new Date(row.createAt);
            const locals = {
                title: row.title,
                stylesheet: "markdown.css",
                role: "user",
            };
            res.render("post", {
                locals,
                data: row,
                content: content,
                layout: mainLayout,
            });
        });
    })
);

/**
 * 모든 게시물 보기
 * GET /blog
 */
router.get("/blog", async (req, res) => {
    db.all("SELECT * FROM posts ORDER BY createAt DESC", [], (err, rows) => {
        if (err) {
            return res.status(500).send("게시물을 불러오는 중 오류가 발생했습니다.");
        }
        // posts에 필요한 가공
        rows.forEach((row) => {
            row.createAt = new Date(row.createAt);
        });
        const locals = {
            title: "모든 게시물",
        };
        res.render("blog", { locals, posts: rows, layout: mainLayout });
    });
});

module.exports = router;
