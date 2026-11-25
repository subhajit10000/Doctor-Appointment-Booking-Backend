// All clinic times are interpreted in one timezone (default IST, UTC+05:30).
import env from "../config/env.js";

const OFFSET_MIN = Number(env.CLINIC_TZ_OFFSET_MINUTES);

export const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
};
export const fromMinutes = (n) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

export const isValidDateStr = (s) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const d = new Date(`${s}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};

// Absolute instant for a clinic-local date + time.
export const slotInstant = (dateStr, hhmm) => {
    const [y, mo, d] = dateStr.split("-").map(Number);
    return new Date(Date.UTC(y, mo - 1, d, 0, toMinutes(hhmm) - OFFSET_MIN, 0));
};

// Weekday (0-6) of a clinic-local calendar date.
export const weekdayOf = (dateStr) => new Date(`${dateStr}T00:00:00Z`).getUTCDay();

// Today's clinic-local date as YYYY-MM-DD.
export const todayStr = (now = new Date()) => new Date(now.getTime() + OFFSET_MIN * 60000).toISOString().slice(0, 10);

export const addDays = (dateStr, n) => new Date(new Date(`${dateStr}T00:00:00Z`).getTime() + n * 86400000).toISOString().slice(0, 10);
