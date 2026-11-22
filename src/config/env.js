import dotenv from "dotenv";

dotenv.config();

const env = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || "development",

    MONGO_URI: process.env.MONGO_URI,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES || "15m",

    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES || "7d",


    CRYPTO_SECRET: process.env.CRYPTO_SECRET,
    CRYPTO_ALGORITHM: process.env.CRYPTO_ALGORITHM || "aes-256-cbc",

    OTP_LENGTH: process.env.OTP_LENGTH || 6,
    OTP_EXPIRY_MINUTES: process.env.OTP_EXPIRY_MINUTES || 5,

    BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS || 12,


    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
    // Payments. Leave the Razorpay keys empty to run in demo-payment mode (no real money moves).
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || "",
    RAZORPAY_API_BASE: (process.env.RAZORPAY_API_BASE || "https://api.razorpay.com/v1").replace(/\/$/, ""),

    // Booking rules
    CLINIC_TZ_OFFSET_MINUTES: process.env.CLINIC_TZ_OFFSET_MINUTES || 330,
    BOOKING_WINDOW_DAYS: Number(process.env.BOOKING_WINDOW_DAYS) || 30,
    SLOT_HOLD_MINUTES: Number(process.env.SLOT_HOLD_MINUTES) || 10,
    CANCEL_CUTOFF_HOURS: Number(process.env.CANCEL_CUTOFF_HOURS) || 2,
    // Share of the fee kept when a patient cancels a paid appointment (clinic-side cancellations refund in full).
    CANCELLATION_FEE_PERCENT: process.env.CANCELLATION_FEE_PERCENT === undefined || process.env.CANCELLATION_FEE_PERCENT === "" ? 50 : Math.min(100, Math.max(0, Number(process.env.CANCELLATION_FEE_PERCENT))),

    ADMIN_EMAILS: (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean),
}

const REQUIRED_KEYS = [
    "MONGO_URI",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "CRYPTO_SECRET",
];

const missing = REQUIRED_KEYS.filter((key) => !env[key]);
if (missing.length > 0) {
    throw new Error(
        `Missing required environment variable(s): ${missing.join(", ")}. ` +
        `Set them in your .env file before starting the server.`
    );
}


if (env.CRYPTO_ALGORITHM === "aes-256-cbc" && Buffer.from(env.CRYPTO_SECRET, "hex").length !== 32) {
    throw new Error(
        "CRYPTO_SECRET must be a 64-character hex string (32 bytes) for aes-256-cbc. " +
        `Got ${env.CRYPTO_SECRET.length} characters.`
    );
}

export default env;
