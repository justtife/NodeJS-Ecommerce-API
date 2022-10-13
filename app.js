require("dotenv").config();
require("express-async-errors");

const express = require("express");
const app = express();

//Installed Middlewares

const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const PORT = process.env.APP_PORT || 4040;
//Initialize middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(
  cors({
    origin: [`http://localhost:${PORT}`],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(helmet());
app.use(xss());
app.use(compression());
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(cookieParser(process.env.JWT_SECRET));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else if (process.env.NODE_ENV === "production") {
  app.use(morgan("common"));
}
//Cloudinary Configuration
require("./utils/cloudinaryConfig");

//Import and Initialize routes
app.use("/api/v1", require("./routes/authRouter"));
//Import manual Middlewares
const NotFoundMiddleware = require("./middlewares/notFound");
const ErrorHandlerMiddleware = require("./middlewares/errorHandler");

//Initialize manual Middlewares
app.use(NotFoundMiddleware);
app.use(ErrorHandlerMiddleware);

//Import Database Connection
const connectDB = require("./db/connect");

//Start Server
if (process.env.NODE_ENV !== "test") {
  const start = async () => {
    await connectDB(process.env.DB_URI);
    app.listen(PORT, (err) => {
      if (err) throw err;
      console.log(
        `Server started in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`
      );
    });
  };
  start();
}
