import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";
import morgan from "morgan";
import env from "./config/env.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import doctorRouter from "./routes/doctor.routes.js";
import appointmentRouter from "./routes/appointment.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import errorHandler from "./middlewares/error.middleware.js"

const App = express();
App.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })); // security

App.use(
    cors({
        origin: env.CLIENT_URL.split(",").map((o) => o.trim()),
        credentials: true,
    })
);
App.use(apiLimiter);
// rawBody is kept so Razorpay webhook signatures can be verified against the exact bytes received.
App.use(express.json({ limit: '5mb', verify: (req, res, buf) => { req.rawBody = buf; } }));
App.use(express.urlencoded({ extended: true }))

App.use(cookieParser());
App.use(compression());

if (env.NODE_ENV === "development") {
    App.use(morgan("dev"));
}
App.get('/', (req, res) => {
    res.send('MedPulse API running')
})
App.use("/api/v1/auth", authRouter);
App.use("/api/v1/users", userRouter);
App.use("/api/v1/doctors", doctorRouter);
App.use("/api/v1/appointments", appointmentRouter);
App.use("/api/v1/payments", paymentRouter);

App.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    })
})

App.use(errorHandler);
export default App;