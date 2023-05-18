const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode == 200 ? 500: res.statusCode;
    res.status(statusCode);
    res.json({
        status: "fail",
        message: err?.message,
        stack: err?.stack,
    });
};

module.exports = { errorHandler }