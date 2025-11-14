const asyncHandler = require("express-async-handler");
const db = require("../config/db");
const marked = require("marked");

const mainLayout = "../views/layouts/main.ejs";

class PostController {
    home = asyncHandler(async (req, res) => {
        const locals = {
            title: "메인 페이지",
        };

        db.all("SELECT * FROM posts ORDER BY createAt DESC", [], (err, rows) => {
            if (err) {
                throw new Error("게시글 목록을 불러오는 중 오류가 발생했습니다.");
            }
            if (!rows) {
                throw {
                    status: 404,
                    message: "게시물을 찾을 수 없습니다.",
                };
            }
            rows.forEach((row) => {
                row.createAt = new Date(row.createAt);
            });
            res.render("index", { locals, data: rows, layout: mainLayout });
        });
    });

    showPost = asyncHandler(async (req, res) => {
        const postId = req.params.id;
        db.get("SELECT * FROM posts WHERE id = ?", [postId], (err, row) => {
            if (err) {
                throw new Error("게시물을 불러오는 중 오류가 발생했습니다.");
            }
            if (!row) {
                throw {
                    status: 404,
                    message: "게시물을 찾을 수 없습니다.",
                };
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
    });

    allPosts = asyncHandler(async (req, res) => {
        db.all("SELECT * FROM posts ORDER BY createAt DESC", [], (err, rows) => {
            if (err) {
                throw new Error("게시물을 불러오는 중 오류가 발생했습니다.");
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
}

module.exports = new PostController();
