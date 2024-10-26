import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Middleware
export const allowedOrigins = process.env.CORS_ORIGINS?.split(",");

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins?.indexOf(origin) !== -1) {
        // Origin is allowed
        callback(null, true);
      } else {
        // Origin is not allowed
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" })); // Json Middleware
app.use(express.urlencoded({ extended: true, limit: "50mb" })); // Get Request Middleware
app.use(express.static("public")); // Static Middleware
app.use(cookieParser()); // Cookies Middleware

// Routes
import healthcheckRouter from "./routes/healthcheck.routes.js";
import userRouter from "./routes/user.routes.js";
import investerRouter from "./routes/invester.routes.js";

// Routes Declaration
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/invester", investerRouter);

export { app };
