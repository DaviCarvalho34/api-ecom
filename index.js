const express = require("express");
const connect = require("./config/connection.js");
const { errorHandler } = require("./middlewares/errorHandler.js");
const authRouter = require("./routes/authRoutes.js");
const productRouter = require("./routes/productRoutes.js");
const blogRouter = require("./routes/blogRoutes.js");
const categoryRouter = require("./routes/categoryRouter.js");
const brandRouter = require("./routes/brandRouter.js");
const couponRouter = require("./routes/couponRouter.js");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");

const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 4000;

connect();

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use("/api/user", authRouter);
app.use("/api/product", productRouter);
app.use("/api/blog", blogRouter);
app.use("/api/category", categoryRouter);
app.use("/api/brand/", brandRouter);
app.use("/api/coupon", couponRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
});
