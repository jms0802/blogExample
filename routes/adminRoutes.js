const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/adminController");

const mainLayout = "../views/layouts/main.ejs";
const adminLayout = "../views/layouts/admin.ejs";

/**
 * 관리자 페이지
 * GET /admin
 */
router.get("/admin", AdminController.adminHome);

/**
 * Check Login
 * POST /admin
 */
router.post("/admin", AdminController.adminLogin);

/**
 * 관리자 로그아웃
 * GET /logout
 */
router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

/**
 * 관리자 등록
 * GET /register
 */
router.get("/register", (req, res) => {
    res.render("admin/index", { layout: mainLayout });
});

/**
 * 관리자 등록
 * POST /register
 */
router.post("/register", AdminController.adminRegister);

/**
 * 모든 게시물
 * GET /allPosts
 */
router.get("/allPosts", AdminController.checkLogin, AdminController.listAll);

/**
 * 게시물 추가
 * GET /add
 */
router.get("/add", AdminController.checkLogin, (req, res) => {
    const locals = {
        title: "게시물 작성",
        role: "add",
        stylesheet: "markdown.css",
    };
    res.render("admin/edit", { locals, layout: adminLayout });
});

/**
 * 게시물 추가
 * POST /add
 */
router.post("/add", AdminController.addPost);

/**
 * 게시물 수정
 * GET /edit/:id
 */
router.get(
    "/edit/:id",
    AdminController.checkLogin,
    AdminController.findOnePost
);

/**
 * 게시물 수정
 * PUT /edit/:id
 */
router.put("/edit/:id", AdminController.checkLogin, AdminController.editPost);

/**
 * 게시물 삭제
 * DELETE /delete/:id
 */
router.delete(
    "/delete/:id",
    AdminController.checkLogin,
    AdminController.deletePost
);

/**
 * 관리자용 채팅 페이지
 * GET /chat
 */
router.get("/chat/admin", AdminController.checkLogin, (req, res) => {
    const locals = {
        title: "실시간 채팅",
        stylesheet: "chat.css",
        role: "admin",
    };
    res.render("chat", { locals, layout: adminLayout });
});

module.exports = router;
