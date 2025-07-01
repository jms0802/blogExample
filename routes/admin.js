const express = require("express");
const router = express.Router();
const adminLayout1 = "../views/layouts/admin";
const adminLayout2 = "../views/layouts/main";
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Post = require("../models/Post");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

/**
 * 로그인 확인
 */
const checkLogin = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    res.redirect("/admin");
  } else {
    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.userId = decoded.userId;
      next();
    } catch (err) {
      res.redirect("admin");
    }
  }
};

/**
 * 관리자 페이지
 * GET /admin
 */
router.get("/admin", (req, res) => {
  const locals = {
    title: "관리자 페이지",
  };
  res.render("admin/index", { locals, layout: adminLayout2 });
});

/**
 * Check Login
 * POST /admin
 */
router.post(
  "/admin",
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.json({
        success: false,
        message: "일치하는 사용자가 없습니다.",
      });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.json({
        success: false,
        message: "비밀번호가 일치하지 않습니다.",
      });
    }
    const token = jwt.sign({ id: user._id }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });
    res.json({
      success: true,
      redirect: "/allPosts", // 리다이렉트할 URL 전달
    });
  })
);

/**
 * 관리자 등록
 * GET /register
 */
router.get("/register", (req, res) => {
  res.render("admin/index", { layout: adminLayout2 });
});

/**
 * 관리자 등록
 * POST /register
 */
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    try {
      // JSON 형식의 데이터 처리
      const { username, password } = req.body;

      // 이미 존재하는 사용자인지 확인
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.json({
          success: false,
          message: "이미 존재하는 사용자 이름입니다.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        username,
        password: hashedPassword,
      });

      res.json({
        success: true,
        message: "관리자가 성공적으로 등록되었습니다.",
      });
    } catch (error) {
      console.error("관리자 등록 오류:", error);
      res.json({
        success: false,
        message: "등록 중 오류가 발생했습니다.",
      });
    }
  })
);

/**
 * 모든 게시물
 * GET /allPosts
 */
router.get(
  "/allPosts",
  checkLogin,
  asyncHandler(async (req, res) => {
    const locals = {
      title: "Posts",
    };
    const data = await Post.find().sort({ createAt: -1 });
    res.render("admin/allPost", { locals, data, layout: adminLayout1 });
  })
);

/**
 * 관리자 로그아웃
 * GET /logout
 */
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

/**
 * 게시물 추가
 * GET /add
 */
router.get(
  "/add",
  checkLogin,
  asyncHandler(async (req, res) => {
    const locals = {
      title: "게시물 작성",
      role: "add",
      stylesheet: "markdown.css",
    };
    res.render("admin/edit", { locals, layout: adminLayout1 });
  })
);

/**
 * 게시물 추가
 * POST /add
 */
router.post(
  "/add",
  asyncHandler(async (req, res) => {
    const { title, body } = req.body;
    const newPost = new Post({
      title: title,
      body: body,
    });
    await Post.create(newPost);
    res.redirect("/allPosts");
  })
);

/**
 * 게시물 수정
 * GET /edit/:id
 */
router.get(
  "/edit/:id",
  checkLogin,
  asyncHandler(async (req, res) => {
    const locals = {
      title: "게시물 편집",
      role: "edit",
      stylesheet: "markdown.css",
    };
    const data = await Post.findOne({ _id: req.params.id });
    res.render("admin/edit", { locals, data, layout: adminLayout1 });
  })
);

/**
 * 게시물 수정
 * PUT /edit/:id
 */
router.put(
  "/edit/:id",
  checkLogin,
  asyncHandler(async (req, res) => {
    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
    });
    res.redirect("/allPosts");
  })
);

/**
 * 게시물 삭제
 * DELETE /delete/:id
 */
router.delete(
  "/delete/:id",
  checkLogin,
  asyncHandler(async (req, res) => {
    await Post.deleteOne({ _id: req.params.id });
    res.redirect("/allPosts");
  })
);

/**
 * 관리자용 채팅 페이지
 * GET /chat
 */
router.get("/chat/admin", checkLogin, (req, res) => {
  const locals = {
    title: "실시간 채팅",
    stylesheet: "chat.css",
    role: "admin",
  };
  res.render("chat", { locals, layout: adminLayout1 });
});

module.exports = router;
