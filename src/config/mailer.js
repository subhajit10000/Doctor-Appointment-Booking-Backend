import nodemailer from "nodemailer";
import env from "./env.js";

let transporter = null;

const smtpConfigured = () =>
  Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
  );

// Created lazily so missing SMTP settings never crash server boot.
const getTransporter = () => {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
};

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, "");
const FROM = () =>
  process.env.EMAIL_FROM || `"MedPulse" <${process.env.SMTP_USER}>`;

const layout = ({
  title,
  intro,
  highlight,
  rows = [],
  appUrl = env.CLIENT_URL,
  ctaLabel = "Open MedPulse",
}) => `<!doctype html><html><body style="margin:0;padding:32px 12px;background:#eef4f5;font-family:Arial,sans-serif;color:#0b2433">
<div style="max-width:540px;margin:auto;background:#fff;border:1px solid #d7e4e6;border-radius:18px;overflow:hidden">
<div style="padding:24px 30px;background:#0b2433;color:#fff;font-size:22px;font-weight:800">Med<span style="color:#4fd1c5">Pulse</span></div>
<div style="padding:30px">
<h1 style="margin:0 0 12px;font-size:22px">${esc(title)}</h1>
<p style="line-height:1.65;color:#48606b;margin:0 0 18px">${intro}</p>
${highlight ? `<div style="margin:18px 0;padding:18px;text-align:center;border-radius:14px;background:#e6f4f2;border:1px solid #cfe7e3;font-size:34px;font-weight:800;letter-spacing:9px;color:#0b2433">${esc(highlight)}</div>` : ""}
${rows.length ? `<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #d7e4e6;border-radius:12px;border-collapse:separate;margin:8px 0 20px">${rows.map(([k, v]) => `<tr><td style="padding:10px 14px;color:#6b8691;font-size:13px;border-bottom:1px solid #eef4f5">${esc(k)}</td><td style="padding:10px 14px;font-size:14px;font-weight:bold;text-align:right;border-bottom:1px solid #eef4f5">${esc(v)}</td></tr>`).join("")}</table>` : ""}
${appUrl ? `<a href="${esc(appUrl)}" style="display:inline-block;padding:12px 22px;background:#0f8b8d;color:#fff;border-radius:10px;text-decoration:none;font-weight:bold;font-size:14px">${esc(ctaLabel)}</a>` : ""}
</div>
<div style="padding:16px 30px;background:#f6fafa;color:#8aa0a8;font-size:11px">&copy; ${new Date().getFullYear()} MedPulse</div>
</div></body></html>`;

const send = async ({ to, subject, html, devLog }) => {
  // Local development convenience: without SMTP settings, print to the console instead of failing.
  if (!smtpConfigured()) {
    if (env.NODE_ENV === "production")
      throw new Error(
        "Email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS.",
      );
    console.log(
      `\n[DEV MAIL] SMTP not configured. To: ${to} | ${subject}${devLog ? ` | ${devLog}` : ""}\n`,
    );
    return;
  }
  await getTransporter().sendMail({ from: FROM(), to, subject, html });
};

const sendOtpEmail = async ({
  to,
  name,
  otp,
  expiryMinutes,
  appUrl,
  purpose = "verifyEmail",
}) => {
  const isReset = purpose === "resetPassword";
  await send({
    to,
    subject: isReset
      ? "Your MedPulse password reset code"
      : "Verify your MedPulse email",
    devLog: `${purpose} code: ${otp} (expires in ${expiryMinutes} min)`,
    html: layout({
      title: isReset ? "Reset your password" : "Verify your email",
      intro: `Hello ${esc(name || "there")}, use this code to ${isReset ? "reset your MedPulse password" : "finish creating your MedPulse account"}. It expires in ${expiryMinutes} minutes. If you didn't ask for it, you can ignore this email.`,
      highlight: otp,
      appUrl,
      ctaLabel: "Return to MedPulse",
    }),
  });
};

const fmtDate = (d) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
const to12 = (t) => {
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};
const inr = (n) =>
  `Rs. ${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

// Appointment emails must never break the booking itself, so failures are logged and swallowed.
// event: "confirmed" | "cancelled"
const sendAppointmentEmail = async ({
  to,
  name,
  doctor,
  appointment,
  event,
  byAdmin = false,
}) => {
  const ref = String(appointment._id).slice(-8).toUpperCase();
  const rows = [
    ["Doctor", doctor.name],
    ["Speciality", doctor.specialization],
    ["Date", fmtDate(appointment.date)],
    [
      "Time",
      `${to12(appointment.startTime)} - ${to12(appointment.endTime)} IST`,
    ],
    ["Booking reference", ref],
  ];
  if (doctor.clinic)
    rows.splice(2, 0, [
      "Where",
      `${doctor.clinic}${doctor.city ? `, ${doctor.city}` : ""}`,
    ]);
  const cancelled = event === "cancelled";
  let intro;
  if (cancelled) {
    rows.push(["Amount paid", inr(appointment.fee)]);
    if (appointment.cancellationFee > 0)
      rows.push([
        "Cancellation charge",
        `- ${inr(appointment.cancellationFee)}`,
      ]);
    rows.push(["Refund", inr(appointment.refundAmount)]);
    intro =
      `Hello ${esc(name)}, your appointment${byAdmin ? " was cancelled by the clinic" : " has been cancelled"}.` +
      (appointment.refundAmount > 0
        ? ` ${inr(appointment.refundAmount)} is being refunded to your original payment method and should arrive in 5 to 7 working days.`
        : "") +
      (!byAdmin && appointment.cancellationFee > 0
        ? " The cancellation charge is kept as per our cancellation policy."
        : "");
  } else {
    rows.push(["Amount paid", inr(appointment.fee)]);
    if (appointment.payment?.paymentId)
      rows.push(["Payment ID", appointment.payment.paymentId]);
    intro = `Hello ${esc(name)}, your appointment is confirmed and your payment was received. Please arrive 10 minutes early. You can cancel up to ${env.CANCEL_CUTOFF_HOURS} hours before the visit; a cancellation charge of ${env.CANCELLATION_FEE_PERCENT}% of the fee applies.`;
  }
  try {
    await send({
      to,
      subject: cancelled
        ? `Appointment cancelled - ${doctor.name} (${ref})`
        : `Appointment confirmed - ${doctor.name} (${ref})`,
      devLog: `appointment ${event}`,
      html: layout({
        title: cancelled ? "Appointment cancelled" : "You're booked",
        intro,
        rows,
        ctaLabel: cancelled ? "Book another appointment" : "View appointment",
        appUrl: `${env.CLIENT_URL.split(",")[0].trim()}${cancelled ? "/doctors" : `/appointments/${appointment._id}`}`,
      }),
    });
  } catch (e) {
    console.error(`Appointment email (${event}) to ${to} failed: ${e.message}`);
  }
};

export { sendOtpEmail, sendAppointmentEmail };
export default { sendOtpEmail, sendAppointmentEmail };
