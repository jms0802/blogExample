// 404 핸들러
const notFoundHandler = (req, res, next) => {
    const error = {
        status: 404,
        message: `경로를 찾을 수 없습니다: ${req.originalUrl}`,
    };
    next(error);
};

// 에러 핸들링 미들웨어
const errorHandler = (err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "서버에서 오류가 발생했습니다.";

    if (process.env.NODE_ENV === "development") {
        console.error("[ERROR]", {
            status,
            message,
            stack: err.stack,
            url: req.originalUrl,
        });
    }

    // 일반 요청은 뷰 렌더링
    const locals = {
        title: `오류 ${status}`,
    };

    res.status(status).render("error", {
        locals,
        error: { status, message },
        layout: "../views/layouts/main.ejs",
    });
};

module.exports = {
    notFoundHandler,
    errorHandler,
};
