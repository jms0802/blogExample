const asyncHandler = require("express-async-handler");
const db = require("../config/db");
const marked = require("marked");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET;
const mainLayout = "../views/layouts/main.ejs";
const adminLayout = "../views/layouts/admin.ejs";

class AdminController {
    //로그인 체크 미들웨어
    checkLogin = asyncHandler(async (req, res, next) => {
        const token = req.cookies.token;
        if (!token) {
            return res.redirect("/admin");
        }
        jwt.verify(token, jwtSecret, (err, decoded) => {
            if (err) {
                return res.redirect("/admin");
            } else {
                next();
            }
        });
    });

    adminHome = asyncHandler(async (req, res) => {
        const token = req.cookies.token;
        if (!token) {
            const locals = {
                title: "관리자 페이지",
            };
            return res.render("admin/index", { locals, layout: adminLayout });
        }
        jwt.verify(token, jwtSecret, (err, decoded) => {
            if (err) {
                const locals = {
                    title: "관리자 페이지",
                };
                return res.render("admin/index", { locals, layout: adminLayout });
            } else {
                return res.redirect("/allPosts");
            }
        });
    });

    adminLogin = asyncHandler(async (req, res) => {
        const { username, password } = req.body;

        db.get(
            "SELECT * FROM users WHERE username = ?",
            [username],
            async (err, user) => {
                if (err) {
                    throw new Error("로그인 중 오류가 발생했습니다.");
                }
                const isValid = user && (await bcrypt.compare(password, user.password));
                if (!isValid) throw new Error("잘못된 로그인 정보입니다.");

                const token = jwt.sign({ id: user.id }, jwtSecret);
                res.cookie("token", token, { httpOnly: true });
                res.json({
                    success: true,
                    redirect: "/allPosts",
                });
            }
        );
    });

    adminRegister = asyncHandler(async (req, res) => {
        const { username, password } = req.body;

        db.get(
            "SELECT * FROM users WHERE username = ?",
            [username],
            async (err, existingUser) => {
                if (err) {
                    throw err;
                }
                if (existingUser) throw new Error("이미 존재하는 사용자 이름입니다.");

                const hashedPassword = await bcrypt.hash(password, 10);

                db.run(
                    "INSERT INTO users (username, password) VALUES (?, ?)",
                    [username, hashedPassword],
                    function (err) {
                        if (err) {
                            console.error("관리자 등록 오류:", err);
                            throw new Error("등록 중 오류가 발생했습니다.");
                        }
                        res.json({
                            success: true,
                            message: "관리자가 성공적으로 등록되었습니다.",
                        });
                    }
                );
            }
        );
    });

    listAll = asyncHandler(async (req, res) => {
        const locals = {
            title: "Posts",
        };
        db.all("SELECT * FROM posts ORDER BY createAt DESC", [], (err, rows) => {
            if (err) {
                throw new Error("게시물을 불러오는 중 오류가 발생했습니다.");
            }
            rows.forEach((r) => {
                r.createAt = new Date(r.createAt);
            });
            res.render("admin/allPost", {
                locals,
                data: rows,
                layout: adminLayout,
            });
        });
    });

    addPost = asyncHandler(async (req, res) => {
        const { title, body } = req.body;
        db.run(
            "INSERT INTO posts (title, body, createAt) VALUES (?, ?, ?)",
            [title, body, new Date().toISOString()],
            function (err) {
                if (err) {
                    throw new Error("게시물 추가 중 오류가 발생했습니다.");
                }
                res.redirect("/allPosts");
            }
        );
    });

    findOnePost = asyncHandler(async (req, res) => {
        const locals = {
            title: "게시물 편집",
            role: "edit",
            stylesheet: "markdown.css",
        };
        const postId = req.params.id;
        db.get("SELECT * FROM posts WHERE id = ?", [postId], (err, row) => {
            if (err || !row) {
                throw new Error("게시물을 찾을 수 없습니다.");
            }
            row.createAt = new Date(row.createAt);
            res.render("admin/edit", { locals, data: row, layout: adminLayout });
        });
    });

    editPost = asyncHandler(async (req, res) => {
        db.run(
            "UPDATE posts SET title = ?, body = ? WHERE id = ?",
            [req.body.title, req.body.body, req.params.id],
            function (err) {
                if (err) {
                    throw new Error("게시물 수정 중 오류가 발생했습니다.");
                }
                res.redirect("/allPosts");
            }
        );
    });

    deletePost = asyncHandler(async (req, res) => {
        db.run("DELETE FROM posts WHERE id = ?", [req.params.id], function (err) {
            if (err) {
                throw new Error("게시물 삭제 중 오류가 발생했습니다.");
            }
            res.redirect("/allPosts");
        });
    });
}

module.exports = new AdminController();
