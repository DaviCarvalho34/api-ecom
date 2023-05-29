const express = require("express");
const connect = require("./config/connection.js");
const { errorHandler } = require("./middlewares/errorHandler.js");
const authRouter = require("./routes/authRoutes.js");
const productRouter = require("./routes/productRoutes.js");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require('morgan');

const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 4000;


connect();

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:false }));
app.use(cookieParser());

app.use("/api/user", authRouter);
app.use("/api/product", productRouter )

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}`);
});
