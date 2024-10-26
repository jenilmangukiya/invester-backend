import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
); // Cors Middleware
app.use(express.json({ limit: "16kb" })); // Json Middleware
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // Get Request Middleware
app.use(express.static("public")); // Static Middleware
app.use(cookieParser()); // Cookies Middleware

// Routes
import healthcheckRouter from "./routes/healthcheck.routes.js";
import userRouter from "./routes/user.routes.js";

// Routes Declaration
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);

export { app };
